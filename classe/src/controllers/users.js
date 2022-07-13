const knex = require('../connection');
const securePassword = require('secure-password');
const jwt = require('jsonwebtoken');
const jwtSecret = require('../jwt_secret');
const validations = require('../validations/validations');

const pwd = securePassword();

const enroll = async (req, res) => {
  let { nome, email, senha, nome_loja } = req.body;

  email = email.toLowerCase();

  try {
    await validations.schemaEnrollUser.validate(req.body);

    const userValidation = await knex('usuarios')
      .where({ email })
      .first();

    if (!!userValidation) {
      return res.status(400).json('E-mail já cadastrado!');
    };

    const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');

    const enrolledUser = await knex('usuarios')
      .insert({ nome, email, senha: hash, nome_loja })
      .returning('*');

    if (!enrolledUser) {
      return res.status(400).json('Não foi possível cadastrar o usuário.');
    };

    return res.status(200).json('Usuário cadastrado com sucesso.');
  } catch (error) {
    return res.status(400).json(error.message);
  };
};

const login = async (req, res) => {
  let { email, senha } = req.body;

  email = email.toLowerCase();

  try {
    await validations.schemaLogin.validate(req.body);

    const userValidation = await knex('usuarios').where({ email }).first();

    if (!userValidation) {
      return res.status(400).json('E-mail ou senha inválidos!');
    };

    const { senha: password, ...user } = userValidation;

    const pwdResult = await pwd.verify(Buffer.from(senha), Buffer.from(password, 'hex'));

    switch (pwdResult) {
      case securePassword.INVALID_UNRECOGNIZED_HASH:
      case securePassword.INVALID:
        return res.status(400).json('E-mail ou senha inválidos!');
      case securePassword.VALID:
        break;
      case securePassword.VALID_NEEDS_REHASH:
        try {
          const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');

          await knex('usuarios')
            .update({ senha: hash })
            .where({ email })
            .returning('*');
        } catch {
        };
        break;
    };

    const token = jwt.sign({
      id: user.id,
      name: user.nome,
      email: user.email,
      nome_loja: user.nome_loja,
    }, jwtSecret);

    return res.status(200).json({ message: `Login realizado com sucesso pelo usuário <${user.nome}>.`, user, token });
  } catch (error) {
    return res.status(400).json(error.message);
  };
};

const get = async (req, res) => {
  return res.status(200).json(req.user);
};

const edit = async (req, res) => {
  const { user } = req;

  let { nome, email, senha, nome_loja } = req.body;

  email = email.toLowerCase();

  if (!nome && !email && !senha && !nome_loja) {
    return res.status(404).json('É obrigatório informar ao menos um campo para atualização.');
  };

  try {
    await validations.schemaEditProfile.validate(req.body);

    const userDataFields = {};

    if (nome) {
      userDataFields.nome = nome;
    };

    if (email) {
      if (email !== req.user.email) {
        const userValidation = await knex('usuarios')
          .where({ email })
          .first();

        if (!!userValidation) {
          return res.status(400).json('E-mail informado já cadastrado para outro usuário!');
        };
      };

      userDataFields.email = email;
    };

    if (senha) {
      userDataFields.senha = (await pwd.hash(Buffer.from(senha))).toString('hex');
    };

    if (nome_loja) {
      userDataFields.nome_loja = nome_loja;
    };

    const id = req.user.id;

    const updatedUser = await knex('usuarios')
      .update(userDataFields)
      .where({ id })
      .returning('*');

    if (!updatedUser) {
      return res.status(400).json('Não foi possível atualizar o perfil do usuário.');
    };

    return res.status(200).json('Perfil do usuário atualizado com sucesso.');
  } catch (error) {
    return res.status(400).json(error.message);
  };
};

module.exports = {
  enroll,
  login,
  get,
  edit
};