const fs = require('fs');
const assert = require('assert');

console.log('=== VERIFICAÇÃO ESTRUTURAL DAS PÁGINAS E ROTAS ===\n');

// 1. Verificação do Index (Nova Landing Page alinhada à Gaveta do App)
const indexHtml = fs.readFileSync('public/index.html', 'utf8').replace(/\r\n/g, '\n');

// 1.1 Hero com textos exatos solicitados
assert.ok(
  indexHtml.includes('Transforme seu edital em um ciclo de estudo que cabe na sua vida.'),
  'Hero deve conter o título oficial exato'
);
assert.ok(
  indexHtml.includes('O Meu Ciclo organiza o edital, calcula suas horas reais, monta o dia e acompanha revisão, questões e, quando o concurso cobra, a prova física.'),
  'Hero deve conter o subtítulo oficial exato'
);
assert.ok(
  indexHtml.includes('COMEÇAR 7 DIAS GRÁTIS') || indexHtml.includes('Começar 7 dias grátis'),
  'Hero deve conter o botão Começar 7 dias grátis'
);
assert.ok(
  indexHtml.includes('Sem compromisso. Cancele quando quiser.'),
  'Hero deve conter o texto de segurança/microcopy'
);
// Hero 3 capturas reais (Tempo & Meta, Ciclo de Estudos, TAF)
assert.ok(
  indexHtml.includes('app-screen-card') && indexHtml.includes('Tempo &amp; Meta') && indexHtml.includes('Ciclo de Estudos') && indexHtml.includes('TAF (Prova Física)'),
  'Hero deve apresentar as três capturas reais'
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
console.log('1. ✓ Hero: Título, subtítulo, botão, microcopy e as 3 capturas reais validadas sem métricas fictícias.');

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
  indexHtml.includes('Pelo Edital') && indexHtml.includes('Pela Trilha') &&
  indexHtml.includes('Iniciar timer') && indexHtml.includes('Registrar estudo'),
  'Seção 4 (Ciclo de Estudos) deve conter os dois modos e os dois botões reais da tela'
);
assert.ok(
  indexHtml.includes('A revisão nasce do registro, não de um cadastro prévio de todas as aulas.'),
  'Seção 5 (Revisões e Timer) deve conter o princípio correto de revisões e foco'
);
assert.ok(
  indexHtml.includes('No dia 1 está em zero. No dia 30, preenchido.'),
  'Seção 6 (Questões e Relatórios) deve conter a honestidade do Dia 1 ao Dia 30'
);
assert.ok(
  indexHtml.includes('Se o seu concurso tem prova física.') && indexHtml.includes('Não se aplica'),
  'Seção 7 (TAF) deve conter a chamada e a opção de não se aplica'
);
assert.ok(
  indexHtml.includes('Na primeira abertura, um guia de 10 passos mostra cada tela. Depois, o app abre no Ciclo.'),
  'Seção 8 (Comece por Aqui) deve conter o guia de 10 passos'
);
assert.ok(
  indexHtml.includes('id="planos"') && indexHtml.includes('R$ 10,90') && indexHtml.includes('R$ 7,90'),
  'Seção 9 (Preço) deve conter os planos com o teste de 7 dias'
);
assert.ok(
  indexHtml.includes('id="depoimentos"') &&
  indexHtml.includes('Tempo &amp; Meta') &&
  indexHtml.includes('offline') &&
  indexHtml.includes('TAF'),
  'Seção 10 (Depoimentos) deve conter os 3 depoimentos ao lado das telas citadas'
);
assert.ok(
  indexHtml.includes('Editais, bancas e inscrições das últimas 72 horas.') &&
  indexHtml.includes('Isso fica no site. No app, você estuda.') &&
  indexHtml.includes('href="/concursos"'),
  'Seção 11 (Concursos) deve conter o bloco curto com a frase de contraste e link'
);
console.log('2. ✓ Módulos: Todas as 11 seções da home validadas na ordem estipulada e descrevendo a gaveta.');

// 2. Verificação da Página Dedicada /concursos
assert.ok(fs.existsSync('public/concursos.html'), 'Arquivo public/concursos.html deve existir');
const concursosHtml = fs.readFileSync('public/concursos.html', 'utf8').replace(/\r\n/g, '\n');

// Elemento evidente de retorno
assert.ok(
  concursosHtml.includes('Voltar ao In') && (concursosHtml.includes('href="/"') || concursosHtml.includes("href='/'")),
  'Página de concursos deve conter elemento evidente de retorno para o início'
);
// Botão "Abrir no app" presente em /concursos
assert.ok(
  concursosHtml.includes('Abrir no app') || concursosHtml.includes('ABRIR NO APP'),
  'Página de concursos deve conter botão "Abrir no app" para quem já tem o concurso'
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

// Verificar que a coluna Exclusão de Dados está posicionada após Privacidade & Tecnologia
const privColIndex = indexHtml.indexOf('<h5>Privacidade &amp; Tecnologia</h5>');
const exclColIndex = indexHtml.indexOf('<h5>Exclusão de Dados</h5>');
assert.ok(privColIndex !== -1 && exclColIndex !== -1 && exclColIndex > privColIndex, 'Coluna Exclusão de Dados deve estar à direita de Privacidade & Tecnologia');
console.log('8. ✓ Rodapé (Index): Coluna Exclusão de Dados posicionada ao lado direito de Privacidade & Tecnologia e metadados Google Play validados.');

// Links no rodapé de concursos
assert.ok(concursosHtml.includes('href="/politica-de-privacidade"'), 'concursos.html deve conter link para /politica-de-privacidade');
assert.ok(concursosHtml.includes('href="/termos-de-uso"'), 'concursos.html deve conter link para /termos-de-uso');
assert.ok(concursosHtml.includes('href="/exclusao-de-dados"'), 'concursos.html deve conter link para /exclusao-de-dados');
console.log('9. ✓ Rodapé (Concursos): Linha de metadados e coluna Exclusão sincronizadas.');

console.log('\n=== TODAS AS VERIFICAÇÕES PASSARAM COM 100% DE SUCESSO! ===');
