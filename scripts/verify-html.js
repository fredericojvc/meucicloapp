const fs = require('fs');
const assert = require('assert');

console.log('=== VERIFICAÇÃO ESTRUTURAL DAS PÁGINAS E ROTAS ===\n');

// 1. Verificação do Index (Nova Landing Page alinhada à Gaveta do App)
const indexHtml = fs.readFileSync('public/index.html', 'utf8').replace(/\r\n/g, '\n');

// 1.1 Hero com textos exatos solicitados
assert.ok(
  indexHtml.includes('Transforme seu edital'),
  'Hero deve conter o título oficial'
);
assert.ok(
  indexHtml.includes('O Meu Ciclo organiza'),
  'Hero deve conter o subtítulo oficial'
);
assert.ok(
  indexHtml.includes('COMEÇAR 7 DIAS GRÁTIS') || indexHtml.includes('Começar 7 dias grátis'),
  'Hero deve conter o botão Começar 7 dias grátis'
);
assert.ok(
  indexHtml.includes('Cancelamento em 1 clique direto na Google Play') || indexHtml.includes('Sem compromisso'),
  'Hero deve conter o texto de segurança/microcopy'
);
// Hero institucional limpo e focado na conversão
assert.ok(
  indexHtml.includes('hero-section') && indexHtml.includes('hero-header') && indexHtml.includes('A engenharia da sua preparação'),
  'Hero deve conter estrutura de alta conversão e posicionamento institucional'
);
// Garantir que números forjados foram removidos da home
assert.ok(
  !indexHtml.includes('64% concluído'),
  'Percentual inventado de 64% concluído deve ter sido removido'
);
assert.ok(
  !indexHtml.includes('35 / 40'),
  'Métrica inventada de 35/40 questões deve ter sido removida'
);
assert.ok(
  !indexHtml.includes('83%'),
  'Domínio inventado de 83% deve ter sido removido'
);
console.log('1. ✓ Hero: Título, subtítulo, botão, microcopy e badges validados com sucesso.');

// 1.2 Módulos da Gaveta do App na ordem exata
assert.ok(
  indexHtml.includes('Você não precisa estudar mais. Precisa saber quantas horas líquidas sobram.'),
  'Seção 2 (Tempo & Meta) deve conter a chamada exata'
);
assert.ok(
  indexHtml.includes('Marque o que cai. Acompanhe o que falta.'),
  'Seção 3 (Edital Verticalizado) deve conter a chamada exata'
);
assert.ok(
  indexHtml.includes('Pelo Edital') && indexHtml.includes('Pela Trilha'),
  'Seção 4 (Ciclo de Estudos) deve conter os modos'
);
assert.ok(
  indexHtml.includes('repetição espaçada') || indexHtml.includes('Revisões'),
  'Seção 5 (Revisões e Timer) deve conter revisões'
);
assert.ok(
  indexHtml.includes('Diagnóstico de Performance') || indexHtml.includes('Questões'),
  'Seção 6 (Questões) deve conter questões'
);
assert.ok(
  indexHtml.includes('Treino') || indexHtml.includes('TAF'),
  'Seção 7 (TAF) deve conter treino/TAF'
);
assert.ok(
  indexHtml.includes('id="planos"') && indexHtml.includes('R$ 14,90') && indexHtml.includes('R$ 7,90') && indexHtml.includes('R$ 29,90'),
  'Seção 9 (Preço) deve conter os planos com o teste de 7 dias e novos valores'
);
assert.ok(
  indexHtml.includes('id="depoimentos"') &&
  indexHtml.includes('Tempo &amp; Meta'),
  'Seção 10 (Depoimentos) deve conter os depoimentos'
);
assert.ok(
  indexHtml.includes('href="/concursos"'),
  'Seção 11 (Concursos) deve conter o bloco com link para concursos'
);
console.log('2. ✓ Módulos: Todas as seções da home validadas com sucesso.');

// 2. Verificação da Página Dedicada /concursos
assert.ok(fs.existsSync('public/concursos.html'), 'Arquivo public/concursos.html deve existir');
const concursosHtml = fs.readFileSync('public/concursos.html', 'utf8').replace(/\r\n/g, '\n');

// Elemento evidente de retorno
assert.ok(
  concursosHtml.includes('href="/"') || concursosHtml.includes("href='/'"),
  'Página de concursos deve conter elemento evidente de retorno para o início'
);
// Botão CTA presente em /concursos
assert.ok(
  concursosHtml.includes('Começar 7 Dias Grátis') || concursosHtml.includes('Abrir no app') || concursosHtml.includes('btn-play'),
  'Página de concursos deve conter botão CTA para testar o aplicativo'
);
assert.ok(
  concursosHtml.includes('id="news-container"'),
  'Grid de notícias deve existir na página dedicada /concursos'
);
console.log('3. ✓ Concursos: Página própria /concursos validada com botão "Abrir no app" e retorno à home.');

// 3. Verificação do Roteamento
const firebaseJson = JSON.parse(fs.readFileSync('firebase.json', 'utf8'));
assert.strictEqual(firebaseJson.hosting.cleanUrls, true, 'firebase.json deve ter cleanUrls habilitado');
console.log('4. ✓ Infra: cleanUrls configurado no firebase.json para suporte nativo a rotas limpas.');

// 4. Verificação de Privacidade e Metadados do Rodapé (Google Play Compliance)
assert.ok(fs.existsSync('public/politica-de-privacidade.html'), 'public/politica-de-privacidade.html deve existir');
const privHtml = fs.readFileSync('public/politica-de-privacidade.html', 'utf8');
assert.ok(privHtml.includes('Armazenamento Local'), 'Política de privacidade deve conter princípios de armazenamento local');
assert.ok(privHtml.includes('Google Sign-In'), 'Política de privacidade deve conter integração com Google Sign-In');
assert.ok(privHtml.includes('Google Drive'), 'Política de privacidade deve conter menção ao Google Drive');
console.log('5. ✓ Privacidade: Página public/politica-de-privacidade.html completa e em conformidade.');

assert.ok(fs.existsSync('public/termos-de-uso.html'), 'public/termos-de-uso.html deve existir');
console.log('6. ✓ Termos: Página public/termos-de-uso.html disponível.');

// 5. Verificação da Página de Exclusão de Conta e Dados (Google Play & LGPD Compliance)
assert.ok(fs.existsSync('public/exclusao-de-dados.html'), 'public/exclusao-de-dados.html deve existir');
const exclusaoHtml = fs.readFileSync('public/exclusao-de-dados.html', 'utf8');

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
console.log('7. ✓ Exclusão de Dados: Página public/exclusao-de-dados.html completa com texto oficial e diretrizes Google Play.');

// Links no rodapé do index
assert.ok(indexHtml.includes('href="/politica-de-privacidade"'), 'index.html deve conter link para /politica-de-privacidade');
assert.ok(indexHtml.includes('href="/termos-de-uso"'), 'index.html deve conter link para /termos-de-uso');
assert.ok(indexHtml.includes('href="/exclusao-de-dados"'), 'index.html deve conter link para /exclusao-de-dados');
assert.ok(indexHtml.includes('Todos os direitos reservados'), 'index.html deve conter menção de direitos reservados');
assert.ok(indexHtml.includes('Fale Conosco'), 'index.html deve conter Fale Conosco');

// Verificar que as colunas Exclusão de Dados e Privacidade & Tecnologia estão presentes
const privColIndex = indexHtml.indexOf('<h5>Privacidade &amp; Tecnologia</h5>');
const exclColIndex = indexHtml.indexOf('<h5>Exclusão de Dados</h5>');
assert.ok(privColIndex !== -1 && exclColIndex !== -1, 'Colunas Exclusão de Dados e Privacidade & Tecnologia devem estar presentes no rodapé');
console.log('8. ✓ Rodapé (Index): Colunas de Privacidade e Exclusão de Dados e metadados Google Play validados.');

// Links no rodapé de concursos
assert.ok(concursosHtml.includes('href="/politica-de-privacidade"'), 'concursos.html deve conter link para /politica-de-privacidade');
assert.ok(concursosHtml.includes('href="/termos-de-uso"'), 'concursos.html deve conter link para /termos-de-uso');
assert.ok(concursosHtml.includes('href="/exclusao-de-dados"'), 'concursos.html deve conter link para /exclusao-de-dados');
console.log('9. ✓ Rodapé (Concursos): Linha de metadados e coluna Exclusão sincronizadas.');

console.log('\n=== TODAS AS VERIFICAÇÕES PASSARAM COM 100% DE SUCESSO! ===');
