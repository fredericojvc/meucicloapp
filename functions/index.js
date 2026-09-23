const { onRequest } = require('firebase-functions/v2/https');
const { getConcursosNews } = require('./concursosService');

/**
 * Cloud Function HTTPS para o endpoint /api/concursos-news
 * Fornece caching server-side com CDN Cache-Control headers
 */
exports.concursosNews = onRequest(
  {
    region: 'southamerica-east1', // São Paulo para latência mínima no Brasil
    cors: true,
    maxInstances: 10,
    memory: '256MiB',
    timeoutSeconds: 30,
  },
  async (req, res) => {
    // Configura headers de CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Método não permitido. Utilize GET.' });
      return;
    }

    try {
      const forceRefresh = req.query.refresh === 'true';
      const result = await getConcursosNews(forceRefresh);

      // Cache-Control: 30 minutos em CDN / stale-while-revalidate por 1 hora
      res.set(
        'Cache-Control',
        'public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600'
      );
      res.set('Content-Type', 'application/json; charset=utf-8');

      res.status(200).json({
        sucesso: true,
        total: result.items.length,
        fromCache: result.fromCache,
        cachedAt: result.cachedAt,
        dados: result.items,
      });
    } catch (error) {
      console.error('Erro ao responder /api/concursos-news:', error);
      res.status(500).json({
        sucesso: false,
        erro: 'Falha temporária ao carregar feed de notícias.',
        dados: [],
      });
    }
  }
);
