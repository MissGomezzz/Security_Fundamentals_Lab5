const test = require('node:test');
const assert = require('node:assert');
process.env.API_KEY = 'clave-de-prueba-no-real';
const app = require('../src/index');

let server, base;
test.before(async () => {
  await new Promise((r) => { server = app.listen(0, '127.0.0.1', r); });
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => { server.closeAllConnections?.(); server.close(); });

test('no expone X-Powered-By', async () => {
  const r = await fetch(`${base}/ruta-inexistente`);
  assert.equal(r.headers.get('x-powered-by'), null);
});
test('PATCH sin API key devuelve 401', async () => {
  const r = await fetch(`${base}/api/alerts/alert-004/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'closed' })
  });
  assert.equal(r.status, 401);
});
test('PATCH con API key incorrecta devuelve 401', async () => {
  const r = await fetch(`${base}/api/alerts/alert-004/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-api-key': 'incorrecta' },
    body: JSON.stringify({ status: 'closed' })
  });
  assert.equal(r.status, 401);
});
test('GET /api/audit sin API key devuelve 401', async () => {
  const r = await fetch(`${base}/api/audit`);
  assert.equal(r.status, 401);
});

test('las rutas de API tienen rate limiting', async () => {
  const responses = await Promise.all(
    Array.from({ length: 61 }, () => fetch(`${base}/api/audit`))
  );
  assert.equal(responses.at(-1).status, 429);
});
