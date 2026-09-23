const fs = require('fs');
const path = require('path');
const { getConcursosNews } = require('../lib/concursosService');

async function sync() {
  console.log('Sincronizando snapshot de notícias de concursos...');
  try {
    const result = await getConcursosNews(true);
    const targetDir = path.join(__dirname, '..', 'public', 'api');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const payload = {
      sucesso: true,
      total: result.items.length,
      fromCache: false,
      cachedAt: result.cachedAt,
      dados: result.items,
    };

    const jsonPath = path.join(targetDir, 'concursos-news.json');
    fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf8');
    console.log(`Snapshot salvo em: ${jsonPath} (${result.items.length} notícias)`);
  } catch (error) {
    console.error('Erro ao sincronizar notícias:', error);
    process.exit(1);
  }
}

sync();
