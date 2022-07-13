const knex = require('../connection');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../jwt_secret');

const verifyAuthentication = async (req, res, next) => {
  const token = req.header('authorization').replace('Bearer', '').trim();

  if (!token) {
    return res.status(404).json('Token não informado.');
  };

  try {
    jwt.verify(token, jwtSecret, { complete: true });

    const id = jwt.decode(token, { complete: true }).payload.id;

    const userValidation = await knex('usuarios')
      .where({ id })
      .first();

    if (!userValidation) {
      return res.status(400).json('Usuário não encontrado.');
    };

    const { senha: password, ...user } = userValidation;

    req.user = user;

    next();
  } catch (error) {
    let message;

    switch (error.message) {
      case 'jwt expired':
        message = 'Token expirado. Refazer o login!';
        break;
      case 'invalid signature':
        message = 'Token com assinatura inválida.';
        break;
      case 'jwt not active':
        message = 'Token inativo.';
        break;
      case 'invalid audience':
        message = 'Token com destinatário inválido.';
        break;
      case 'invalid issuer':
        message = 'Token com emissor inválido.';
        break;
      case 'invalid jwt id':
        message = 'Token com id inválido.';
        break;
      case 'invalid jwt subject':
        message = 'Token com assunto inválido.';
        break;
      case 'jwt signature is required':
        message = 'Token sem assinatura.';
        break;
      case 'jwt malformed':
        message = 'Erro de formação do token.';
        break;
      default:
        message = error.message;
        break;
    };

    return res.status(400).json(message);
  };
};

module.exports = verifyAuthentication;