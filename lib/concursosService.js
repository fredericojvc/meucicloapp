/**
 * Meu Ciclo — Serviço de Ingestão e Processamento do Feed de Concursos
 * Consome o RSS estruturado do Google News, normaliza e categoriza via heurística.
 */

const { XMLParser } = require('fast-xml-parser');

const GOOGLE_NEWS_RSS_URL =
  'https://news.google.com/rss/search?q=concurso+AND+(edital+OR+aberto+OR+autorizado)+when:3d&hl=pt-BR&gl=BR&ceid=BR:pt-419';

// Configuração de Cache em Memória Server-Side (TTL: 30 minutos)
const CACHE_TTL_MS = 30 * 60 * 1000;
let memoryCache = {
  data: null,
  timestamp: 0,
};

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
 * Limpa títulos removendo sufixo comum de assinatura do veículo (ex: " - Folha Dirigida")
 */
function sanitizeTitle(rawTitle, sourceName) {
  if (!rawTitle) return '';
  let title = String(rawTitle).trim();

  // Remove marcações HTML ou CDATA residuais
  title = title.replace(/<[^>]*>?/gm, '');

  // 1. Tenta remover sufixo baseado no nome da fonte do RSS
  if (sourceName) {
    const cleanSource = String(sourceName).trim();
    if (cleanSource) {
      const sourceRegex = new RegExp(`\\s*-\\s*${escapeRegExp(cleanSource)}$`, 'i');
      title = title.replace(sourceRegex, '');
    }
  }

  // 2. Fallback: remove padrão " - NomeDoVeículo" no final caso ainda persista
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
 * Obtém e processa as notícias de concursos
 * @param {boolean} forceRefresh - Se true, ignora o cache em memória
 * @returns {Promise<{items: Array, fromCache: boolean, cachedAt: string}>}
 */
async function getConcursosNews(forceRefresh = false) {
  const now = Date.now();

  // Verifica cache em memória
  if (!forceRefresh && memoryCache.data && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return {
      items: memoryCache.data,
      fromCache: true,
      cachedAt: new Date(memoryCache.timestamp).toISOString(),
    };
  }

  try {
    const response = await fetch(GOOGLE_NEWS_RSS_URL, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; MeuCicloNewsIngestor/1.0; +https://meuciclo.app.br)',
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
    });

    if (!response.ok) {
      throw new Error(`Google News RSS HTTP status: ${response.status} ${response.statusText}`);
    }

    const xmlText = await response.text();
    const parsedObj = parser.parse(xmlText);

    // Navega pela estrutura padrão RSS 2.0 <rss><channel><item>...</item></channel></rss>
    const rawItems = parsedObj?.rss?.channel?.item;
    const itemsArray = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

    const maxAgeMs = 72 * 60 * 60 * 1000; // Janela estrita de 72 horas
    const processedItems = [];

    for (const item of itemsArray) {
      const pubDateStr = item.pubDate;
      if (!pubDateStr) continue;

      const pubDate = new Date(pubDateStr);
      const pubTime = pubDate.getTime();
      if (isNaN(pubTime)) continue;

      const ageMs = now - pubTime;
      // Validação estrita: publicação nos últimos 3 dias (72 horas)
      if (ageMs < 0 || ageMs > maxAgeMs) {
        continue;
      }

      // Extrai a fonte (seja objeto com @_url ou texto puro)
      let sourceName = 'Google News';
      if (item.source) {
        if (typeof item.source === 'string') {
          sourceName = item.source;
        } else if (item.source['#text']) {
          sourceName = item.source['#text'];
        }
      }

      const rawTitle = item.title || '';
      const cleanTitle = sanitizeTitle(rawTitle, sourceName);
      if (!cleanTitle) continue;

      const link = item.link || '';
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

    // Ordena do mais recente para o mais antigo
    processedItems.sort((a, b) => new Date(b.dataPublicacao) - new Date(a.dataPublicacao));

    // Atualiza cache em memória
    memoryCache = {
      data: processedItems,
      timestamp: now,
    };

    return {
      items: processedItems,
      fromCache: false,
      cachedAt: new Date(now).toISOString(),
    };
  } catch (error) {
    console.error('Erro na ingestão do feed de concursos:', error);

    // Resiliência: se houver falha de rede externa mas cache prévio existir (mesmo expirado), serve o cache
    if (memoryCache.data) {
      return {
        items: memoryCache.data,
        fromCache: true,
        stale: true,
        cachedAt: new Date(memoryCache.timestamp).toISOString(),
      };
    }

    throw error;
  }
}

module.exports = {
  getConcursosNews,
  sanitizeTitle,
  inferCategory,
  CACHE_TTL_MS,
};
