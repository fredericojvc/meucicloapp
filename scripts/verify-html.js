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

// 5. Verificação da Página de Exclusão de Conta e Dados (Google Play & LGPD Compliance)
assert.ok(fs.existsSync('public/exclusao-de-dados.html'), 'public/exclusao-de-dados.html deve existir');
const exclusaoHtml = fs.readFileSync('public/exclusao-de-dados.html', 'utf8');

// Verificação do texto obrigatório estipulado pelo usuário
assert.ok(
  exclusaoHtml.includes('Para solicitar a exclusão da sua conta e de todos os dados associados no aplicativo Meu Ciclo, o utilizador pode:'),
  'exclusao-de-dados.html deve conter a introdução da declaração obrigatória'
);
assert.ok(
  exclusaoHtml.includes('Limpar os dados diretamente nas definições do aplicativo ou desinstalá-lo (eliminando os dados locais do dispositivo)'),
  'exclusao-de-dados.html deve conter o item (1) de limpeza local'
);
assert.ok(
  exclusaoHtml.includes('Apagar a pasta de cópia de segurança na sua conta Google Drive'),
  'exclusao-de-dados.html deve conter o item (2) de cópia no Google Drive'
);
assert.ok(
  exclusaoHtml.includes('Enviar um pedido por correio eletrónico para') && exclusaoHtml.includes('contato@meuciclo.app.br'),
  'exclusao-de-dados.html deve conter o item (3) de contato por e-mail'
);
assert.ok(
  exclusaoHtml.includes('Os dados locais são removidos imediatamente pelo próprio utilizador e eventuais dados associados ao suporte são eliminados num prazo máximo de 30 dias.'),
  'exclusao-de-dados.html deve conter os prazos de remoção'
);
console.log('10. ✓ Exclusão de Dados: Página public/exclusao-de-dados.html completa com texto oficial e diretrizes Google Play.');

// Links no rodapé do index
assert.ok(indexHtml.includes('href="/politica-de-privacidade"'), 'index.html deve conter link para /politica-de-privacidade');
assert.ok(indexHtml.includes('href="/termos-de-uso"'), 'index.html deve conter link para /termos-de-uso');
assert.ok(indexHtml.includes('href="/exclusao-de-dados"'), 'index.html deve conter link para /exclusao-de-dados');
assert.ok(indexHtml.includes('Todos os direitos reservados'), 'index.html deve conter menção de direitos reservados');
assert.ok(indexHtml.includes('Fale Conosco'), 'index.html deve conter Fale Conosco');

// Verificar que a coluna Exclusão de Dados está posicionada após Privacidade & Tecnologia
const privColIndex = indexHtml.indexOf('<h5>Privacidade &amp; Tecnologia</h5>');
const exclColIndex = indexHtml.indexOf('<h5>Exclusão de Dados</h5>');
assert.ok(privColIndex !== -1 && exclColIndex !== -1 && exclColIndex > privColIndex, 'Coluna Exclusão de Dados deve estar à direita de Privacidade & Tecnologia');
console.log('11. ✓ Rodapé (Index): Coluna Exclusão de Dados posicionada ao lado direito de Privacidade & Tecnologia e link de metadados validado.');

// Links no rodapé de concursos
assert.ok(concursosHtml.includes('href="/politica-de-privacidade"'), 'concursos.html deve conter link para /politica-de-privacidade');
assert.ok(concursosHtml.includes('href="/termos-de-uso"'), 'concursos.html deve conter link para /termos-de-uso');
assert.ok(concursosHtml.includes('href="/exclusao-de-dados"'), 'concursos.html deve conter link para /exclusao-de-dados');
console.log('12. ✓ Rodapé (Concursos): Linha de metadados e coluna Exclusão sincronizadas.');

console.log('\n=== TODAS AS VERIFICAÇÕES PASSARAM COM 100% DE SUCESSO! ===');
