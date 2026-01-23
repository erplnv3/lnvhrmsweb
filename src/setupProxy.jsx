const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://66.116.199.85:8080',
      changeOrigin: true,
      secure: false,
    })
  );
};