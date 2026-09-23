/**
 * Meu Ciclo — Servidor Local de Desenvolvimento e Produção
 * Servidor HTTP nativo Node.js com suporte a arquivos estáticos e endpoint de API.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { getConcursosNews } = require('./lib/concursosService');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Habilita CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Endpoint Intermediário de Concursos: /api/concursos-news
  if (pathname === '/api/concursos-news') {
    if (req.method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ erro: 'Método não permitido.' }));
      return;
    }

    try {
      const forceRefresh = parsedUrl.searchParams.get('refresh') === 'true';
      const result = await getConcursosNews(forceRefresh);

      // Cache-Control: 30 minutos em CDN / 1 hora stale-while-revalidate
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=3600',
        'X-Cache-Status': result.fromCache ? 'HIT' : 'MISS',
      });

      res.end(
        JSON.stringify({
          sucesso: true,
          total: result.items.length,
          fromCache: result.fromCache,
          cachedAt: result.cachedAt,
          dados: result.items,
        })
      );
    } catch (error) {
      console.error('Erro na rota /api/concursos-news:', error);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(
        JSON.stringify({
          sucesso: false,
          erro: 'Falha temporária ao carregar notícias de concursos.',
          dados: [],
        })
      );
    }
    return;
  }

  // 2. Arquivos Estáticos da pasta /public
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  filePath = path.normalize(filePath);

  // Previne Directory Traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Acesso Negado');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Se não encontrar, tenta servir 404.html
      const notFoundPath = path.join(PUBLIC_DIR, '404.html');
      fs.readFile(notFoundPath, (err404, data404) => {
        if (!err404) {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(data404);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[Meu Ciclo] Servidor operacional em http://localhost:${PORT}`);
    console.log(`[Meu Ciclo] Endpoint API disponível em http://localhost:${PORT}/api/concursos-news`);
  });
}

module.exports = server;
