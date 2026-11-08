const test = require('node:test');
const assert = require('node:assert');
const app = require('../server');

let server, base;
test.before(async () => {
  await new Promise((r) => { server = app.listen(0, '127.0.0.1', r); });
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => { server.closeAllConnections?.(); server.close(); });

// Una ruta estática (/), un archivo estático (/app.js) y una ruta inexistente
// que responde index.html por el comodín: ZAP vio las tres en el informe inicial.
for (const ruta of ['/', '/app.js', '/styles.css', '/ruta-inexistente']) {
  test(`${ruta}: cabeceras de seguridad (F-06, F-09)`, async () => {
    const r = await fetch(`${base}${ruta}`);
    assert.equal(r.status, 200);
    assert.equal(r.headers.get('x-powered-by'), null);
    assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(r.headers.get('x-frame-options'), 'DENY');
    const csp = r.headers.get('content-security-policy');
    assert.match(csp, /default-src 'self'/);
    assert.match(csp, /frame-ancestors 'none'/);
    assert.match(csp, /script-src 'self'(;|$)/);
    assert.equal(r.headers.get('permissions-policy')?.includes('camera=()'), true);
    assert.equal(r.headers.get('cross-origin-embedder-policy'), 'require-corp');
    assert.equal(r.headers.get('cross-origin-opener-policy'), 'same-origin');
    assert.equal(r.headers.get('cross-origin-resource-policy'), 'same-origin');
  });
}

test('la CSP no usa unsafe-inline ni unsafe-eval', async () => {
  const csp = (await fetch(`${base}/`)).headers.get('content-security-policy');
  assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval/);
});

test('el HTML no contiene scripts ni estilos en línea que la CSP bloquearía', async () => {
  const html = await (await fetch(`${base}/`)).text();
  assert.doesNotMatch(html, /<script(?![^>]*\ssrc=)[^>]*>/i);
  assert.doesNotMatch(html, /\sstyle=|<style/i);
  assert.doesNotMatch(html, /\son\w+=/i);
});
