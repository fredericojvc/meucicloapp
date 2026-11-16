/**
 * Meu Ciclo — Serviço Resiliente de Ingestão e Processamento do Feed de Concursos
 * Consome RSS estruturado do Google News e portais especializados de concursos,
 * normaliza, dedupila e categoriza via heurística com blindagem contra falhas.
 */

const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');

// User-Agent de navegador real para evitar bloqueios HTTP 429/403
const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// Timeout explícito por requisição (10 segundos)
const REQUEST_TIMEOUT_MS = 10000;

// Janela estrita de 72 horas para relevância do feed
const MAX_AGE_MS = 72 * 60 * 60 * 1000;

// Configuração de Cache em Memória Server-Side (TTL: 30 minutos)
const CACHE_TTL_MS = 30 * 60 * 1000;
let memoryCache = {
  data: null,
  timestamp: 0,
};

// Fontes de RSS de Concursos com redundância e tolerância a falhas
const SOURCES = [
  {
    name: 'Google News Concursos',
    url: 'https://news.google.com/rss/search?q=concurso+AND+(edital+OR+aberto+OR+autorizado)+when:3d&hl=pt-BR&gl=BR&ceid=BR:pt-419',
    defaultSource: 'Google News',
  },
  {
    name: 'Gran Cursos Online Blog',
    url: 'https://blog.grancursosonline.com.br/feed/',
    defaultSource: 'Gran Cursos',
  },
  {
    name: 'Estratégia Concursos Blog',
    url: 'https://www.estrategiaconcursos.com.br/blog/feed/',
    defaultSource: 'Estratégia Concursos',
  },
];

// Parser seguro fast-xml-parser
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseTagValue: true,
  trimValues: true,
});

/**
 * Escapa caracteres especiais para expressões regulares
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Limpa títulos removendo sufixos comuns de assinatura de veículos (ex: " - Folha Dirigida", " - Gran Cursos")
 */
function sanitizeTitle(rawTitle, sourceName) {
  if (!rawTitle) return '';
  let title = String(rawTitle).trim();

  // Remove marcações HTML ou entidades residuais
  title = title.replace(/<[^>]*>?/gm, '');
  title = title
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  // 1. Tenta remover sufixo baseado no nome da fonte identificada
  if (sourceName) {
    const cleanSource = String(sourceName).trim();
    if (cleanSource) {
      const sourceRegex = new RegExp('\\s*-\\s*' + escapeRegExp(cleanSource) + '$', 'i');
      title = title.replace(sourceRegex, '');
    }
  }

  // 2. Remove padrões conhecidos de veículos de concurso ao final do título
  title = title.replace(
    /\s*-\s*(Folha Dirigida|Estratégia Concursos|Gran Cursos|G1|Metrópoles|Direção Concursos|PCI Concursos|JC Concursos|Correio Braziliense|Agência Brasil|Valor Econômico|UOL|Terra|CNN Brasil|Exame|R7)[^)]*$/i,
    ''
  );

  // 3. Fallback genérico: remove qualquer padrão " - Veículo" final
  title = title.replace(/\s+-\s+[^-]+$/, '');

  return title.trim();
}

/**
 * Classificação heurística refinada para categorizar os concursos
 * Categorias prioritárias: "Inscrições Abertas" | "Autorizado" | "Edital Publicado"
 */
function inferCategory(title) {
  const text = String(title).toLowerCase();

  // 1. Inscrições Abertas (prioridade máxima se já abriu)
  const inscricoesPattern =
    /\b(inscriç[õo]es\s+(abertas|iniciadas|começam)|abre\s+inscriç[õo]es|abrem\s+inscriç[õo]es|inscrições\s+estão\s+abertas|últimos?\s+dias?\s+de\s+inscriç|estão\s+abertas\s+as\s+inscriç|inscreva-se|abre\s+\d+\s+vagas|abrem\s+\d+\s+vagas)\b/i;
  if (inscricoesPattern.test(text)) {
    return 'Inscrições Abertas';
  }

  // 2. Autorizado / Fase de Banca (fase pré-edital ou comissão formada)
  const autorizadoPattern =
    /\b(autoriza(do|da|ção|ções)?|comissão\s+formada|banca\s+(definida|confirmada|escolhida|iniciada|contratada)|(definida|confirmada|escolhida|contratada)\s+como\s+banca|\bé\s+a\s+banca\b|\bbanca\b|iminente|previsto|anuncia|solicitado)\b/i;
  if (autorizadoPattern.test(text)) {
    return 'Autorizado';
  }

  // 3. Edital Publicado
  const editalPattern =
    /\b(edital\s+(publicado|lançado|saiu|divulgado|retificado)|publica(do)?\s+edital|saiu\s+o?\s*edital|edital\s+está\s+na\s+praça|sai\s+edital|edital\s+saiu|confira\s+o\s+edital|\bedital\b)\b/i;
  if (editalPattern.test(text)) {
    return 'Edital Publicado';
  }

  // Default coerente com o escopo do feed
  return 'Edital Publicado';
}

/**
 * Consulta uma fonte individual com tratamento de erro e timeout explícito
 */
async function fetchSourceItems(source) {
  try {
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': BROWSER_USER_AGENT,
        Accept: 'application/rss+xml, application/xml, text/xml, text/html;q=0.9, */*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.warn(`[RSS Ingestor] Aviso: Fonte "${source.name}" respondeu status HTTP ${response.status}`);
      return [];
    }

    const xmlText = await response.text();
    if (!xmlText || (!xmlText.includes('<rss') && !xmlText.includes('<?xml') && !xmlText.includes('<feed'))) {
      console.warn(`[RSS Ingestor] Aviso: Fonte "${source.name}" não retornou payload XML/RSS válido.`);
      return [];
    }

    const parsedObj = parser.parse(xmlText);
    const rawItems = parsedObj?.rss?.channel?.item || parsedObj?.feed?.entry || [];
    return Array.isArray(rawItems) ? rawItems : [rawItems];
  } catch (err) {
    console.warn(`[RSS Ingestor] Falha ao consultar "${source.name}":`, err.message);
    return [];
  }
}

/**
 * Obtém snapshot salvo em disco como fallback caso a rede externa esteja completamente indisponível
 */
function getDiskSnapshotFallback() {
  try {
    const diskPath = path.join(__dirname, '..', 'public', 'api', 'concursos-news.json');
    if (fs.existsSync(diskPath)) {
      const content = fs.readFileSync(diskPath, 'utf8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.dados) && parsed.dados.length > 0) {
        console.log(`[RSS Ingestor] Snapshot em disco recuperado com sucesso (${parsed.dados.length} notícias)`);
        return parsed.dados;
      }
    }
  } catch (err) {
    console.warn('[RSS Ingestor] Não foi possível ler snapshot de fallback em disco:', err.message);
  }
  return null;
}

/**
 * Obtém e processa as notícias de concursos com blindagem completa
 * @param {boolean} forceRefresh - Se true, ignora o cache em memória
 * @returns {Promise<{items: Array, fromCache: boolean, cachedAt: string, stale?: boolean}>}
 */
async function getConcursosNews(forceRefresh = false) {
  const now = Date.now();

  // 1. Verifica cache em memória
  if (!forceRefresh && memoryCache.data && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return {
      items: memoryCache.data,
      fromCache: true,
      cachedAt: new Date(memoryCache.timestamp).toISOString(),
    };
  }

  const processedItems = [];
  const seenUrls = new Set();
  const seenTitles = new Set();

  // 2. Consulta todas as fontes com try/catch isolado por fonte
  for (const source of SOURCES) {
    const rawItems = await fetchSourceItems(source);

    for (const item of rawItems) {
      const pubDateStr = item.pubDate || item.published || item.updated;
      if (!pubDateStr) continue;

      const pubDate = new Date(pubDateStr);
      const pubTime = pubDate.getTime();
      if (isNaN(pubTime)) continue;

      const ageMs = now - pubTime;
      // Aceita tolerância de até 2h para pequenas divergências de fuso horário / clock skew
      if (ageMs < -2 * 60 * 60 * 1000 || ageMs > MAX_AGE_MS) {
        continue;
      }

      // Extrai a fonte (seja texto, objeto ou fallback)
      let sourceName = source.defaultSource;
      if (item.source) {
        if (typeof item.source === 'string') {
          sourceName = item.source;
        } else if (item.source['#text']) {
          sourceName = item.source['#text'];
        }
      }

      const rawTitle = item.title || '';
      const cleanTitle = sanitizeTitle(rawTitle, sourceName);
      if (!cleanTitle || cleanTitle.length < 5) continue;

      // Normaliza título para deduplicação semântica
      const normalizedTitle = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seenTitles.has(normalizedTitle)) continue;

      const link =
        item.link ||
        (item.guid && (typeof item.guid === 'string' ? item.guid : item.guid['#text'])) ||
        '';
      const cleanLink = link.split('?')[0].replace(/\/+$/, '');
      if (cleanLink && seenUrls.has(cleanLink)) continue;

      seenTitles.add(normalizedTitle);
      if (cleanLink) seenUrls.add(cleanLink);

      const id = (item.guid && (typeof item.guid === 'string' ? item.guid : item.guid['#text'])) || link;
      const categoriaInferida = inferCategory(cleanTitle);

      processedItems.push({
        id,
        titulo: cleanTitle,
        fonte: sourceName,
        link,
        dataPublicacao: pubDate.toISOString(),
        categoriaInferida,
      });
    }
  }

  // 3. Resiliência: se nenhuma notícia foi coletada da rede (ex: sem internet ou bloqueios múltiplos)
  if (processedItems.length === 0) {
    console.warn('[RSS Ingestor] Nenhuma notícia nova obtida da rede. Ativando fallbacks de cache...');

    // 3.1 Fallback em memória (mesmo expirado)
    if (memoryCache.data && memoryCache.data.length > 0) {
      return {
        items: memoryCache.data,
        fromCache: true,
        stale: true,
        cachedAt: new Date(memoryCache.timestamp).toISOString(),
      };
    }

    // 3.2 Fallback em disco
    const diskItems = getDiskSnapshotFallback();
    if (diskItems && diskItems.length > 0) {
      memoryCache = {
        data: diskItems,
        timestamp: now,
      };
      return {
        items: diskItems,
        fromCache: true,
        stale: true,
        cachedAt: new Date(now).toISOString(),
      };
    }

    // 3.3 Fallback seguro vazio (nunca lança exceção para não abortar pipelines de deploy)
    return {
      items: [],
      fromCache: false,
      stale: true,
      cachedAt: new Date(now).toISOString(),
    };
  }

  // 4. Ordena do mais recente para o mais antigo
  processedItems.sort((a, b) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime());

  // 5. Atualiza cache em memória
  memoryCache = {
    data: processedItems,
    timestamp: now,
  };

  return {
    items: processedItems,
    fromCache: false,
    cachedAt: new Date(now).toISOString(),
  };
}

module.exports = {
  getConcursosNews,
  sanitizeTitle,
  inferCategory,
  CACHE_TTL_MS,
  SOURCES,
  BROWSER_USER_AGENT,
};
