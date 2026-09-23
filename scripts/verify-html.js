const fs = require('fs');
const assert = require('assert');

// Normaliza quebras de linha para evitar divergências CRLF / LF no Windows
const html = fs.readFileSync('public/index.html', 'utf8').replace(/\r\n/g, '\n');

console.log('=== VERIFICAÇÃO ESTRUTURAL DO INDEX.HTML ===\n');

// 1. Verifica ordem no menu de navegação
const navMatch = html.includes('href="#concursos-destaque">Concursos &amp; Provas em Destaque</a></li>\n        <li><a href="#taf-alerta">Diferencial TAF</a>');
assert.ok(navMatch, 'O item "Concursos & Provas em Destaque" deve estar exatamente antes de "Diferencial TAF"');
console.log('1. ✓ Navbar: "Concursos & Provas em Destaque" posicionado imediatamente antes de "Diferencial TAF".');

// 2. Verifica a existência da seção #concursos-destaque
assert.ok(html.includes('id="concursos-destaque"'), 'Seção #concursos-destaque deve existir');
console.log('2. ✓ Seção: Âncora #concursos-destaque declarada.');

// 3. Verifica skeleton loaders
assert.ok(html.includes('skeleton-card'), 'Skeleton loaders devem estar presentes');
console.log('3. ✓ Resiliência: Skeleton loaders implementados para carregamento inicial.');

// 4. Verifica empty state
assert.ok(html.includes('id="news-empty-state"'), 'Estado vazio #news-empty-state deve existir');
console.log('4. ✓ Resiliência: Estado vazio elegante configurado para ausência de notícias.');

// 5. Verifica script de carregamento e fallback
assert.ok(html.includes('/api/concursos-news'), 'Endpoint da API deve ser chamado pelo script');
assert.ok(html.includes('/api/concursos-news.json'), 'Fallback seguro para o snapshot deve existir');
console.log('5. ✓ Client-Side: Fetch para endpoint interno com fallback seguro e zero CORS.');

// 6. Verifica conformidade com as regras proibitivas
assert.ok(!html.includes('https://news.google.com/rss'), 'Client-side não deve chamar diretamente o Google News');
console.log('6. ✓ Mitigação de Risco: Proibição estrita de fetch client-side para o Google News respeitada.');

console.log('\n=== TODAS AS VERIFICAÇÕES DO HTML PASSARAM COM SUCESSO! ===');
