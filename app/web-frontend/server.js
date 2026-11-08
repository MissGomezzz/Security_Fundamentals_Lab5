const path = require('node:path');
const http = require('node:http');
const express = require('express');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const morgan = require('morgan');

const app = express();
app.disable('x-powered-by');
const port = Number(process.env.PORT_WEB || 3000);
const publicDirectory = path.join(__dirname, 'public');

function proxyApiRequest(req, res, next) {
  if (!req.url.startsWith('/api/')) return next();
  const proxyRequest = http.request({
    hostname: '127.0.0.1',
    port: Number(process.env.PORT_API || 3001),
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${process.env.PORT_API || 3001}` }
  }, (proxyResponse) => {
    res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
    proxyResponse.pipe(res);
  });
  proxyRequest.on('error', next);
  req.pipe(proxyRequest);
}

app.use(morgan('combined'));
// Cabeceras de seguridad (F-06 y F-09). El frontend solo carga /app.js y /styles.css
// propios y llama a /api del mismo origen, por eso la CSP no permite nada externo.
// HSTS queda desactivado: el despliegue aún es HTTP (se habilitará con TLS, Lab 4).
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: { policy: 'require-corp' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'no-referrer' },
  strictTransportSecurity: false
}));
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  next();
});
app.use(rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'rate_limit_exceeded' }
}));
app.use(proxyApiRequest);
app.use(express.static(publicDirectory));
// Express 5 (path-to-regexp v8) no admite el comodín '*' sin nombre.
app.get('/{*splat}', (req, res) => res.sendFile(path.join(publicDirectory, 'index.html')));

if (require.main === module) {
  app.listen(port, () => console.log(`web-frontend listening on port ${port}`));
}

module.exports = app;
