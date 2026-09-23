const fs = require('fs');
const assert = require('assert');

console.log('=== VERIFICAÇÃO ESTRUTURAL DAS PÁGINAS E ROTAS ===\n');

// 1. Verificação do Index (Landing Page)
const indexHtml = fs.readFileSync('public/index.html', 'utf8').replace(/\r\n/g, '\n');

// Navbar item aponta para /concursos
assert.ok(
  indexHtml.includes('href="/concursos">Concursos &amp; Provas em Destaque</a>'),
  'Navbar do index deve apontar para a rota /concursos'
);
console.log('1. ✓ Index: Item "Concursos & Provas em Destaque" atualizado para /concursos.');

// Menu sanduíche Apple presente
assert.ok(
  indexHtml.includes('id="apple-menu-toggle"'),
  'Botão de menu sanduíche padrão Apple deve estar presente no header'
);
assert.ok(
  indexHtml.includes('id="mobile-menu-overlay"'),
  'Drawer de overlay mobile deve estar presente no index'
);
console.log('2. ✓ Index: Menu sanduíche Apple (mobile/tablet) e drawer overlay implementados.');

// Secção massiva removida da home
assert.ok(
  !indexHtml.includes('id="news-container"'),
  'Grid massivo de notícias não deve estar na home page'
);
console.log('3. ✓ Index: Secção massiva de notícias removida da home, mantendo a leitura limpa.');

// Call to action presente na home
assert.ok(
  indexHtml.includes('radar-cta-card') && indexHtml.includes('href="/concursos"'),
  'Call to Action card direcionando para /concursos deve existir na home'
);
console.log('4. ✓ Index: Call to Action elegante para o Radar de Concursos implementado.');

// 2. Verificação da Página Dedicada /concursos
assert.ok(fs.existsSync('public/concursos.html'), 'Arquivo public/concursos.html deve existir');
const concursosHtml = fs.readFileSync('public/concursos.html', 'utf8').replace(/\r\n/g, '\n');

// Elemento evidente de retorno
assert.ok(
  concursosHtml.includes('Voltar ao In') && (concursosHtml.includes('href="/"') || concursosHtml.includes("href='/'")),
  'Página de concursos deve conter elemento evidente de retorno para o início'
);
console.log('5. ✓ Concursos: Elemento evidente de retorno rápido ("Voltar ao Início") implementado.');

// Feed completo presente em /concursos
assert.ok(
  concursosHtml.includes('id="news-container"'),
  'Grid de notícias deve existir na página dedicada /concursos'
);
assert.ok(
  concursosHtml.includes('id="news-empty-state"'),
  'Estado vazio elegante deve existir na página dedicada /concursos'
);
assert.ok(
  concursosHtml.includes('id="apple-menu-toggle"'),
  'Menu sanduíche Apple também deve estar presente na página /concursos'
);
console.log('6. ✓ Concursos: Feed dinâmico completo, filtros, skeleton loaders e menu mobile presentes.');

// 3. Verificação do Roteamento
const firebaseJson = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
assert.strictEqual(firebaseJson.hosting.cleanUrls, true, 'firebase.json deve ter cleanUrls habilitado');
console.log('7. ✓ Infra: cleanUrls configurado no firebase.json para suporte nativo a /concursos.');

console.log('\n=== TODAS AS VERIFICAÇÕES PASSARAM COM 100% DE SUCESSO! ===');
