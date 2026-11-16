/**
 * Meu Ciclo — Script de Sincronização e Atualização do Radar de Concursos
 * Executado periodicamente via GitHub Actions e manualmente via workflow_dispatch.
 * Atualiza o snapshot JSON, a indicação estática em /concursos e o sitemap.xml.
 */

const fs = require('fs');
const path = require('path');
const { getConcursosNews } = require('../lib/concursosService');

async function sync() {
  console.log('[sync-news] Iniciando sincronização do feed de notícias de concursos...');

  try {
    // 1. Obtém as notícias usando o serviço blindado
    const result = await getConcursosNews(true);

    const targetDir = path.join(__dirname, '..', 'public', 'api');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const payload = {
      sucesso: true,
      total: result.items.length,
      fromCache: Boolean(result.fromCache),
      cachedAt: result.cachedAt || new Date().toISOString(),
      dados: result.items,
    };

    const jsonPath = path.join(targetDir, 'concursos-news.json');
    fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf8');
    console.log(`[sync-news] ✓ Snapshot salvo em: ${jsonPath} (${result.items.length} notícias)`);

    // 2. Formata data e hora no fuso horário oficial de Brasília (America/Sao_Paulo)
    const syncDate = new Date(payload.cachedAt);
    const dateStr = syncDate.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timeStr = syncDate.toLocaleTimeString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
    });
    const syncLabel = `Sincronizado em ${dateStr} às ${timeStr}`;

    // 3. Atualiza a data de sincronização no arquivo estático public/concursos.html
    const concursosHtmlPath = path.join(__dirname, '..', 'public', 'concursos.html');
    if (fs.existsSync(concursosHtmlPath)) {
      let concursosHtml = fs.readFileSync(concursosHtmlPath, 'utf8');
      const liveIndicatorRegex = /<div class="live-indicator">[\s\S]*?<\/div>/;

      if (liveIndicatorRegex.test(concursosHtml)) {
        const updatedIndicator = `<div class="live-indicator">\n          <span class="live-dot"></span>\n          <span id="sync-timestamp">${syncLabel}</span>\n        </div>`;
        concursosHtml = concursosHtml.replace(liveIndicatorRegex, updatedIndicator);
        fs.writeFileSync(concursosHtmlPath, concursosHtml, 'utf8');
        console.log(`[sync-news] ✓ Data de sincronização atualizada em public/concursos.html: "${syncLabel}"`);
      } else {
        console.warn('[sync-news] Aviso: Não foi possível localizar .live-indicator em public/concursos.html');
      }
    }

    // 4. Atualiza o campo <lastmod> correspondente à rota /concursos no sitemap.xml
    const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
      const yyyy = syncDate.toLocaleDateString('en-CA', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
      });
      const mm = syncDate.toLocaleDateString('en-CA', {
        timeZone: 'America/Sao_Paulo',
        month: '2-digit',
      });
      const dd = syncDate.toLocaleDateString('en-CA', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
      });
      const todayIso = `${yyyy}-${mm}-${dd}`;

      let sitemap = fs.readFileSync(sitemapPath, 'utf8');
      const concursosSitemapRegex = /(<loc>https:\/\/meuciclo\.app\.br\/concursos<\/loc>[\s\S]*?<lastmod>)[^<]+(<\/lastmod>)/;

      if (concursosSitemapRegex.test(sitemap)) {
        sitemap = sitemap.replace(concursosSitemapRegex, `$1${todayIso}$2`);
        fs.writeFileSync(sitemapPath, sitemap, 'utf8');
        console.log(`[sync-news] ✓ Campo <lastmod> de /concursos atualizado no sitemap.xml para: ${todayIso}`);
      } else {
        console.warn('[sync-news] Aviso: Rota /concursos não encontrada no sitemap.xml');
      }
    }

    console.log('[sync-news] Sincronização concluída com sucesso!');
  } catch (error) {
    // Blindagem total: erros nunca interrompem pipelines de build ou deploy
    console.error('[sync-news] Falha não impeditiva ao sincronizar notícias:', error.message);
  }
}

sync();
