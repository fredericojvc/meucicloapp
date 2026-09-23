const assert = require('assert');
const { getConcursosNews, sanitizeTitle, inferCategory } = require('../lib/concursosService');

async function testSuite() {
  console.log('=== INICIANDO TESTES DO SERVIÇO DE CONCURSOS ===\n');

  // Teste 1: Higienização de Título
  console.log('1. Testando sanitização de títulos...');
  assert.strictEqual(
    sanitizeTitle('Concurso Polícia Federal: edital iminente - Folha Dirigida', 'Folha Dirigida'),
    'Concurso Polícia Federal: edital iminente'
  );
  assert.strictEqual(
    sanitizeTitle('Concurso Guarda Municipal abre 100 vagas - G1', 'G1'),
    'Concurso Guarda Municipal abre 100 vagas'
  );
  assert.strictEqual(
    sanitizeTitle('Concurso Correios 2026 - Estratégia Concursos', 'Estratégia Concursos'),
    'Concurso Correios 2026'
  );
  console.log('   ✓ Sanitização de títulos aprovada!');

  // Teste 2: Rotulagem Heurística
  console.log('2. Testando rotulagem heurística...');
  assert.strictEqual(inferCategory('Concurso PMERJ: inscrições abertas para 500 vagas'), 'Inscrições Abertas');
  assert.strictEqual(inferCategory('Concurso Polícia Civil abre inscrições nesta segunda'), 'Inscrições Abertas');
  assert.strictEqual(inferCategory('Concurso PRF: FGV é a banca confirmada para o certame'), 'Autorizado');
  assert.strictEqual(inferCategory('Concurso Receita Federal autorizado com 800 vagas'), 'Autorizado');
  assert.strictEqual(inferCategory('Concurso Senado Federal: comissão formada'), 'Autorizado');
  assert.strictEqual(inferCategory('Concurso Caixa: edital publicado hoje com salários de até R$ 15 mil'), 'Edital Publicado');
  assert.strictEqual(inferCategory('Saiu o edital para o Concurso TJSP'), 'Edital Publicado');
  console.log('   ✓ Rotulagem heurística aprovada!');

  // Teste 3: Ingestão de Feed e Cache
  console.log('3. Testando ingestão do RSS e Cache Server-Side...');
  const t0 = Date.now();
  const res1 = await getConcursosNews();
  const d1 = Date.now() - t0;
  console.log(`   Chamada 1 (Network): ${res1.items.length} itens recebidos em ${d1}ms (fromCache: ${res1.fromCache})`);

  assert.ok(Array.isArray(res1.items), 'Deve retornar array de itens');
  assert.ok(res1.items.length > 0, 'Deve conter notícias');
  assert.strictEqual(res1.fromCache, false, 'Primeira chamada não deve ser cacheada');

  // Validação da estrutura dos itens
  const sample = res1.items[0];
  console.log('   Exemplo do payload processado:');
  console.log('  ', JSON.stringify(sample, null, 2));

  assert.ok(sample.id, 'Item deve conter id');
  assert.ok(sample.titulo, 'Item deve conter titulo');
  assert.ok(sample.fonte, 'Item deve conter fonte');
  assert.ok(sample.link, 'Item deve conter link');
  assert.ok(sample.dataPublicacao, 'Item deve conter dataPublicacao');
  assert.ok(
    ['Edital Publicado', 'Inscrições Abertas', 'Autorizado'].includes(sample.categoriaInferida),
    'Item deve ter categoria válida'
  );

  // Validação estrita de 72 horas
  const now = Date.now();
  const maxAge = 72 * 60 * 60 * 1000;
  for (const item of res1.items) {
    const age = now - new Date(item.dataPublicacao).getTime();
    assert.ok(age >= 0 && age <= maxAge, `Notícia fora da janela de 72h: ${item.titulo} (${item.dataPublicacao})`);
    assert.ok(!item.titulo.endsWith(` - ${item.fonte}`), `Título não foi sanitizado: ${item.titulo}`);
  }
  console.log('   ✓ Validação temporal de 72h e sanitização em lote aprovadas!');

  // Teste 4: Cache em Memória
  console.log('4. Testando reutilização de Cache em Memória...');
  const t1 = Date.now();
  const res2 = await getConcursosNews();
  const d2 = Date.now() - t1;
  console.log(`   Chamada 2 (Cache): ${res2.items.length} itens recebidos em ${d2}ms (fromCache: ${res2.fromCache})`);
  assert.strictEqual(res2.fromCache, true, 'Segunda chamada imediata deve vir do cache');
  assert.ok(d2 < 10, 'Acesso ao cache em memória deve ser instantâneo (< 10ms)');
  console.log('   ✓ Cache server-side validado com sucesso!');

  console.log('\n=== TODOS OS TESTES PASSARAM COM SUCESSO! ===');
}

testSuite().catch((err) => {
  console.error('FALHA NOS TESTES:', err);
  process.exit(1);
});
