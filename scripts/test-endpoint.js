const http = require('http');
const assert = require('assert');
const server = require('../server');

const TEST_PORT = 3099;

server.listen(TEST_PORT, async () => {
  console.log(`Test server running on port ${TEST_PORT}`);
  try {
    const res = await fetch(`http://localhost:${TEST_PORT}/api/concursos-news`);
    assert.strictEqual(res.status, 200, 'Status should be 200');
    
    const cacheControl = res.headers.get('cache-control');
    console.log('Cache-Control Header:', cacheControl);
    assert.ok(cacheControl && cacheControl.includes('s-maxage=1800'), 'Should contain s-maxage=1800');

    const json = await res.json();
    assert.strictEqual(json.sucesso, true, 'sucesso should be true');
    assert.ok(Array.isArray(json.dados), 'dados should be an array');
    console.log(`Endpoint returned ${json.dados.length} items`);
    console.log('Sample item:', json.dados[0]);

    console.log('✓ Endpoint HTTP /api/concursos-news test passed successfully!');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Endpoint test failed:', err);
    server.close();
    process.exit(1);
  }
});
