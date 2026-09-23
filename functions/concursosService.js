/**
 * Meu Ciclo — Serviço de Ingestão e Processamento do Feed de Concursos (Cloud Functions)
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

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseTagValue: true,
  trimValues: true,
});

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sanitizeTitle(rawTitle, sourceName) {
  if (!rawTitle) return '';
  let title = String(rawTitle).trim();
  title = title.replace(/<[^>]*>?/gm, '');

  if (sourceName) {
    const cleanSource = String(sourceName).trim();
    if (cleanSource) {
      const sourceRegex = new RegExp(`\\s*-\\s*${escapeRegExp(cleanSource)}$`, 'i');
      title = title.replace(sourceRegex, '');
    }
  }

  title = title.replace(/\s+-\s+[^-]+$/, '');
  return title.trim();
}

function inferCategory(title) {
  const text = String(title).toLowerCase();

  const inscricoesPattern =
    /\b(inscriç[õo]es\s+(abertas|iniciadas|começam)|abre\s+inscriç[õo]es|abrem\s+inscriç[õo]es|inscrições\s+estão\s+abertas|últimos?\s+dias?\s+de\s+inscriç|estão\s+abertas\s+as\s+inscriç|inscreva-se|abre\s+\d+\s+vagas|abrem\s+\d+\s+vagas)\b/i;
  if (inscricoesPattern.test(text)) {
    return 'Inscrições Abertas';
  }

  const autorizadoPattern =
    /\b(autoriza(do|da|ção|ções)?|comissão\s+formada|banca\s+(definida|confirmada|escolhida|iniciada|contratada)|(definida|confirmada|escolhida|contratada)\s+como\s+banca|\bé\s+a\s+banca\b|\bbanca\b|iminente|previsto|anuncia|solicitado)\b/i;
  if (autorizadoPattern.test(text)) {
    return 'Autorizado';
  }

  const editalPattern =
    /\b(edital\s+(publicado|lançado|saiu|divulgado|retificado)|publica(do)?\s+edital|saiu\s+o?\s*edital|edital\s+está\s+na\s+praça|sai\s+edital|edital\s+saiu|confira\s+o\s+edital|\bedital\b)\b/i;
  if (editalPattern.test(text)) {
    return 'Edital Publicado';
  }

  return 'Edital Publicado';
}

async function getConcursosNews(forceRefresh = false) {
  const now = Date.now();

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

    const rawItems = parsedObj?.rss?.channel?.item;
    const itemsArray = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

    const maxAgeMs = 72 * 60 * 60 * 1000;
    const processedItems = [];

    for (const item of itemsArray) {
      const pubDateStr = item.pubDate;
      if (!pubDateStr) continue;

      const pubDate = new Date(pubDateStr);
      const pubTime = pubDate.getTime();
      if (isNaN(pubTime)) continue;

      const ageMs = now - pubTime;
      if (ageMs < 0 || ageMs > maxAgeMs) {
        continue;
      }

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

    processedItems.sort((a, b) => new Date(b.dataPublicacao) - new Date(a.dataPublicacao));

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
