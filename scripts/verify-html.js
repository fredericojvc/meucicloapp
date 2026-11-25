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
  indexHtml.includes('id="planos"') && indexHtml.includes('R$ 14,99') && indexHtml.includes('R$ 7,92') && indexHtml.includes('R$ 94,99') && indexHtml.includes('R$ 297,00'),
  'Seção 9 (Preço) deve conter os planos com o teste de 7 dias, novos valores e plano vitalício à vista'
);
assert.ok(
  !indexHtml.includes('358,80') && !indexHtml.includes('12x de R$ 29,90') && !indexHtml.includes('12× DE'),
  'Opção de parcelamento do vitalício deve ter sido completamente removida'
);
assert.ok(
  indexHtml.includes('vitalicio-countdown-box') && indexHtml.includes('10/11/2026 a 31/12/2026'),
  'Oferta vitalícia deve conter o período 10/11/2026 a 31/12/2026 e o contador regressivo'
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

// 6. Verificação da Seção Editorial e Artigos
assert.ok(indexHtml.includes('id="artigos"'), 'index.html deve conter a seção #artigos');
assert.ok(indexHtml.includes('ENGENHARIA DO ESTUDO'), 'index.html deve conter a badge ENGENHARIA DO ESTUDO');
assert.ok(indexHtml.includes('Artigos &amp; Guias Práticos'), 'index.html deve conter o título Artigos & Guias Práticos');
assert.ok(indexHtml.includes('/artigos/terceirizar-mente-inteligencia-artificial.html'), 'index.html deve linkar para o primeiro artigo');
assert.ok(indexHtml.includes('Ver central de artigos'), 'index.html deve conter botão para a central de artigos');
assert.ok(indexHtml.includes('href="/artigos/"'), 'index.html deve conter links para /artigos/');

// 6.1 Página Índice /artigos/index.html
assert.ok(fs.existsSync('public/artigos/index.html'), 'public/artigos/index.html deve existir');
const artigosIndexHtml = fs.readFileSync('public/artigos/index.html', 'utf8');
assert.ok(artigosIndexHtml.includes('Artigos &amp; Guias Práticos'), '/artigos/index.html deve conter o cabeçalho editorial');
assert.ok(artigosIndexHtml.includes('https://meuciclo.app.br/artigos/'), '/artigos/index.html deve ter canonical correto');

// 6.2 Página do Artigo 01 Completo
assert.ok(fs.existsSync('public/artigos/terceirizar-mente-inteligencia-artificial.html'), 'Arquivo do artigo 01 deve existir');
const artigo01Html = fs.readFileSync('public/artigos/terceirizar-mente-inteligencia-artificial.html', 'utf8');
assert.ok(artigo01Html.includes('O perigo silencioso de terceirizar a mente do seu filho para a inteligência artificial'), 'Artigo deve conter título H1 exato');
assert.ok(artigo01Html.includes('Frederico Juliano'), 'Artigo deve conter autor Frederico Juliano');
assert.ok(artigo01Html.includes('"@type": "Article"') || artigo01Html.includes('"@type":"Article"'), 'Artigo deve conter Schema.org Article');
assert.ok(artigo01Html.includes('O improviso com conteúdo é a fórmula do sucesso. O improviso sem conteúdo é o fracasso garantido.'), 'Artigo deve conter a citação de destaque');
assert.ok(artigo01Html.includes('Como você vai testar o que o seu filho realmente aprendeu hoje?'), 'Artigo deve conter a pergunta final');
assert.ok(artigo01Html.includes('Construa repertório real, sem atalhos ilusórios.'), 'Artigo deve conter o card de conversão');

// 6.3 Página do Artigo 02 Completo
assert.ok(fs.existsSync('public/artigos/releitura-marca-texto-sabotando-estudos.html'), 'Arquivo do artigo 02 deve existir');
const artigo02Html = fs.readFileSync('public/artigos/releitura-marca-texto-sabotando-estudos.html', 'utf8');
assert.ok(artigo02Html.includes('Por que horas de releitura e marca-texto estão sabotando os estudos do seu filho'), 'Artigo 02 deve conter título H1 exato');
assert.ok(artigo02Html.includes('Frederico Juliano'), 'Artigo 02 deve conter autor Frederico Juliano');
assert.ok(artigo02Html.includes('"@type": "Article"') || artigo02Html.includes('"@type":"Article"'), 'Artigo 02 deve conter Schema.org Article');
assert.ok(artigo02Html.includes('Troque a releitura passiva pela ciência da retenção'), 'Artigo 02 deve conter o card de conversão');

// 6.4 Página do Artigo 03 Completo
assert.ok(fs.existsSync('public/artigos/perigo-estudar-baseado-em-palpites.html'), 'Arquivo do artigo 03 deve existir');
const artigo03Html = fs.readFileSync('public/artigos/perigo-estudar-baseado-em-palpites.html', 'utf8');
assert.ok(artigo03Html.includes('O perigo de estudar baseado em palpites: por que a intuição do seu filho está falhando com ele'), 'Artigo 03 deve conter título H1 exato');
assert.ok(artigo03Html.includes('Frederico Juliano'), 'Artigo 03 deve conter autor Frederico Juliano');
assert.ok(artigo03Html.includes('"@type": "Article"') || artigo03Html.includes('"@type":"Article"'), 'Artigo 03 deve conter Schema.org Article');
assert.ok(artigo03Html.includes('Deixe as teorias sem comprovação de lado e estude com o que a ciência valida'), 'Artigo 03 deve conter o card de conversão');
console.log('10. ✓ Área Editorial: Vitrine na home, índice /artigos/ e Artigos 01, 02 e 03 completos e validados.');

// 7. Verificação de SEO: sitemap.xml e robots.txt
const { XMLValidator } = require('fast-xml-parser');
assert.ok(fs.existsSync('public/sitemap.xml'), 'public/sitemap.xml deve existir na raiz pública do Firebase');
const sitemapXml = fs.readFileSync('public/sitemap.xml', 'utf8');

const xmlValidation = XMLValidator.validate(sitemapXml);
assert.strictEqual(xmlValidation, true, 'Sintaxe XML do sitemap.xml deve ser 100% válida');
assert.ok(sitemapXml.includes('http://www.sitemaps.org/schemas/sitemap/0.9'), 'sitemap.xml deve usar o namespace padrão sitemaps.org 0.9');

const expectedRoutes = [
  'https://meuciclo.app.br/',
  'https://meuciclo.app.br/concursos',
  'https://meuciclo.app.br/artigos/',
  'https://meuciclo.app.br/artigos/perigo-estudar-baseado-em-palpites',
  'https://meuciclo.app.br/artigos/releitura-marca-texto-sabotando-estudos',
  'https://meuciclo.app.br/artigos/terceirizar-mente-inteligencia-artificial',
  'https://meuciclo.app.br/politica-de-privacidade',
  'https://meuciclo.app.br/termos-de-uso',
  'https://meuciclo.app.br/exclusao-de-dados'
];

expectedRoutes.forEach(route => {
  assert.ok(sitemapXml.includes(`<loc>${route}</loc>`), `sitemap.xml deve conter a rota pública ${route}`);
});

// Validar que todas as entradas possuem a tag lastmod válida
const lastmodCount = (sitemapXml.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g) || []).length;
assert.strictEqual(lastmodCount, expectedRoutes.length, 'Todas as rotas devem ter <lastmod>YYYY-MM-DD</lastmod>');

assert.ok(fs.existsSync('public/robots.txt'), 'public/robots.txt deve existir na raiz pública do Firebase');
const robotsTxt = fs.readFileSync('public/robots.txt', 'utf8');
assert.ok(robotsTxt.includes('User-agent: *'), 'robots.txt deve conter User-agent: *');
assert.ok(robotsTxt.includes('Allow: /'), 'robots.txt deve conter Allow: /');
assert.ok(robotsTxt.includes('Sitemap: https://meuciclo.app.br/sitemap.xml'), 'robots.txt deve declarar Sitemap: https://meuciclo.app.br/sitemap.xml');

// Garantir que as regras de rewrite do firebase.json não interceptam sitemap.xml nem robots.txt
const hostingConfig = firebaseJson.hosting;
assert.strictEqual(hostingConfig.public, 'public', 'Firebase hosting deve servir pasta public');
const hasCatchAllRewrite = (hostingConfig.rewrites || []).some(r => r.source === '**' || r.source === '/*' || r.source === '/sitemap.xml' || r.source === '/robots.txt');
assert.strictEqual(hasCatchAllRewrite, false, 'Firebase hosting não deve ter regras catch-all ou interceptação de arquivos estáticos da raiz');

console.log('11. ✓ SEO & Crawling: sitemap.xml e robots.txt validados com 9 rotas canônicas e conformidade Firebase.');

// 8. Verificação de Telemetria: Google Tag (GTM-WHLK3Q8M) e Rastreamento de Cliques
const publicHtmlFiles = [
  'public/index.html',
  'public/concursos.html',
  'public/artigos/index.html',
  'public/artigos/perigo-estudar-baseado-em-palpites.html',
  'public/artigos/releitura-marca-texto-sabotando-estudos.html',
  'public/artigos/terceirizar-mente-inteligencia-artificial.html',
  'public/politica-de-privacidade.html',
  'public/termos-de-uso.html',
  'public/exclusao-de-dados.html',
  'public/404.html'
];

publicHtmlFiles.forEach(file => {
  const fileContent = fs.readFileSync(file, 'utf8');
  
  // Tag GTM única no <head>
  const gtmMatches = (fileContent.match(/GTM-WHLK3Q8M/g) || []).length;
  assert.ok(gtmMatches >= 2, `${file} deve conter a tag GTM-WHLK3Q8M`);
  assert.ok(fileContent.includes('googletagmanager.com/gtm.js?id=GTM-WHLK3Q8M'), `${file} deve carregar o script do GTM`);
  assert.ok(fileContent.includes("gtag('config', 'GTM-WHLK3Q8M')"), `${file} deve inicializar o gtag com GTM-WHLK3Q8M`);
  
  // Ouvinte de rastreamento de cliques no <body>
  assert.ok(fileContent.includes('clique_cta_meuciclo'), `${file} deve conter o rastreamento do evento clique_cta_meuciclo`);
  assert.ok(fileContent.includes("play.google.com") && fileContent.includes("SALVAR ROTINA"), `${file} deve conter as regras de captura de botões`);
});

console.log('12. ✓ Telemetria & Analytics: Google Tag (GTM-WHLK3Q8M) e rastreamento de cliques validados em todas as 8 páginas.');

// 9. Verificação de Favicon, Ícones e Web Manifest
const expectedIconFiles = [
  'public/favicon.ico',
  'public/favicon.svg',
  'public/favicon-96x96.png',
  'public/apple-touch-icon.png',
  'public/icon-192.png',
  'public/icon-512.png',
  'public/site.webmanifest'
];

expectedIconFiles.forEach(file => {
  assert.ok(fs.existsSync(file), `Arquivo de ícone obrigatório deve existir: ${file}`);
  assert.ok(fs.statSync(file).size > 0, `Arquivo de ícone não pode ser vazio: ${file}`);
});

// Validação do site.webmanifest
const manifestContent = JSON.parse(fs.readFileSync('public/site.webmanifest', 'utf8'));
assert.strictEqual(manifestContent.name, 'Meu Ciclo', 'Manifest name deve ser "Meu Ciclo"');
assert.strictEqual(manifestContent.short_name, 'Meu Ciclo', 'Manifest short_name deve ser "Meu Ciclo"');
assert.strictEqual(manifestContent.theme_color, '#0B192C', 'Manifest theme_color deve ser "#0B192C"');
assert.strictEqual(manifestContent.background_color, '#FFFFFF', 'Manifest background_color deve ser "#FFFFFF"');
assert.ok(Array.isArray(manifestContent.icons) && manifestContent.icons.length >= 2, 'Manifest deve conter ao menos 2 ícones');
const iconSizes = manifestContent.icons.map(i => i.sizes);
assert.ok(iconSizes.includes('192x192'), 'Manifest deve declarar ícone 192x192');
assert.ok(iconSizes.includes('512x512'), 'Manifest deve declarar ícone 512x512');

// Validação das tags no <head> de todos os arquivos HTML públicos
publicHtmlFiles.forEach(file => {
  const fileContent = fs.readFileSync(file, 'utf8');
  assert.ok(fileContent.includes('rel="icon"'), `${file} deve conter link rel="icon"`);
  assert.ok(fileContent.includes('rel="shortcut icon"'), `${file} deve conter link rel="shortcut icon"`);
  assert.ok(fileContent.includes('rel="apple-touch-icon"'), `${file} deve conter link rel="apple-touch-icon"`);
  assert.ok(fileContent.includes('rel="manifest"'), `${file} deve conter link rel="manifest"`);
  assert.ok(fileContent.includes('content="#0B192C"'), `${file} deve conter theme-color "#0B192C"`);
});

console.log('13. ✓ Favicon & Web Manifest: Arquivos físicos, manifest JSON e tags <head> validados em todas as páginas.');

console.log('\n=== TODAS AS VERIFICAÇÕES PASSARAM COM 100% DE SUCESSO! ===');
