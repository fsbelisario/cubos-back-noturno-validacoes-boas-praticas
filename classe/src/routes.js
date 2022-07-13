const express = require('express');
const verifyAuthentication = require('./filters/verifyAuthentication');
const users = require('./controllers/users');
const products = require('./controllers/products');

const routes = express();

// Usuários
routes.post('/usuarios', users.enroll);
routes.post('/login', users.login);

routes.use(verifyAuthentication);

// Usuários
routes.get('/perfil', users.get);
routes.put('/perfil', users.edit);

// Produtos
routes.get('/produtos', products.list);
routes.get('/produtos/:productId', products.get);
routes.post('/produtos', products.enroll);
routes.put('/produtos/:productId', products.edit);
routes.delete('/produtos/:productId', products.remove);

module.exports = routes;