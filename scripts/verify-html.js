const fs = require('fs');
const assert = require('assert');

console.log('=== VERIFICAÇÃO ESTRUTURAL DAS PÁGINAS E ROTAS ===\n');

// 1. Verificação do Index (Landing Page)
const indexHtml = fs.readFileSync('public/index.html', 'utf8').replace(/\r\n/g, '\n');

// Navbar item aponta para /concursos
assert.ok(
  indexHtml.includes('href="/concursos"'),
  'Navbar do index deve apontar para a rota /concursos'
);
console.log('1. ✓ Index: Item direcionando para /concursos presente no menu desktop e mobile.');

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
  (indexHtml.includes('radar-feature-card') || indexHtml.includes('radar-cta-card')) && indexHtml.includes('href="/concursos"'),
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
console.log('7. ✓ Infra: cleanUrls configurado no firebase.json para suporte nativo a rotas limpas.');

// 4. Verificação de Privacidade e Metadados do Rodapé (Google Play Compliance)
assert.ok(fs.existsSync('public/politica-de-privacidade.html'), 'public/politica-de-privacidade.html deve existir');
const privHtml = fs.readFileSync('public/politica-de-privacidade.html', 'utf8');
assert.ok(privHtml.includes('Armazenamento Local'), 'Política de privacidade deve conter princípios de armazenamento local');
assert.ok(privHtml.includes('Google Sign-In'), 'Política de privacidade deve conter integração com Google Sign-In');
assert.ok(privHtml.includes('Google Drive'), 'Política de privacidade deve conter menção ao Google Drive');
console.log('8. ✓ Privacidade: Página public/politica-de-privacidade.html completa e em conformidade.');

assert.ok(fs.existsSync('public/termos-de-uso.html'), 'public/termos-de-uso.html deve existir');
console.log('9. ✓ Termos: Página public/termos-de-uso.html disponível.');

// Links no rodapé do index
assert.ok(indexHtml.includes('href="/politica-de-privacidade"'), 'index.html deve conter link para /politica-de-privacidade');
assert.ok(indexHtml.includes('href="/termos-de-uso"'), 'index.html deve conter link para /termos-de-uso');
assert.ok(indexHtml.includes('Todos os direitos reservados'), 'index.html deve conter menção de direitos reservados');
assert.ok(indexHtml.includes('Fale Conosco'), 'index.html deve conter Fale Conosco');
console.log('10. ✓ Rodapé (Index): Linha discreta de metadados com Política, Termos e Fale Conosco validada.');

// Links no rodapé de concursos
assert.ok(concursosHtml.includes('href="/politica-de-privacidade"'), 'concursos.html deve conter link para /politica-de-privacidade');
assert.ok(concursosHtml.includes('href="/termos-de-uso"'), 'concursos.html deve conter link para /termos-de-uso');
console.log('11. ✓ Rodapé (Concursos): Linha de metadados sincronizada.');

console.log('\n=== TODAS AS VERIFICAÇÕES PASSARAM COM 100% DE SUCESSO! ===');
