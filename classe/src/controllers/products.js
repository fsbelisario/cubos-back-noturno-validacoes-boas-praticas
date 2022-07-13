const knex = require('../connection');
const validations = require('../validations/validations');

const list = async (req, res) => {
  const { user } = req;

  let { category, startPrice, endPrice } = req.query;

  category = category.toLowerCase();

  let filterControl = '0';

  if (category) {
    filterControl = '1';
  };

  if (startPrice && Number(startPrice) && Number.isInteger(Number(startPrice))) {
    startPrice = Number(startPrice);
    filterControl = filterControl + '1';
  } else {
    filterControl = filterControl + '0';
  };

  if (endPrice && Number(endPrice) && Number.isInteger(Number(endPrice))) {
    endPrice = Number(endPrice);
    filterControl = filterControl + '1';
  } else {
    filterControl = filterControl + '0';
  };

  try {
    let products;

    let query;

    switch (filterControl) {
      case '000': // Sem filtro
        products = await knex('produtos')
          .where('usuario_id', user.id);
        break;
      case '001': // Filtro por preço máximo
        products = await knex('produtos')
          .where('usuario_id', user.id)
          .andWhere('preco', '<=', endPrice);
        break;
      case '010': // Filtro por preço mínimo
        products = await knex('produtos')
          .where('usuario_id', user.id)
          .andWhere('preco', '>=', startPrice);
        break;
      case '011': // Filtro por preço mínimo e máximo
        products = await knex('produtos')
          .where('usuario_id', user.id)
          .andWhere('preco', '>=', startPrice)
          .andWhere('preco', '<=', endPrice);
        break;
      case '100': // Filtro por categoria
        products = await knex('produtos')
          .where('usuario_id', user.id)
          .andWhere('categoria', 'ilike', `%${category}%`);
        break;
      case '101': // Filtro por categoria e preço máximo
        products = await knex('produtos')
          .where('usuario_id', user.id)
          .andWhere('categoria', 'ilike', `%${category}%`)
          .andWhere('preco', '<=', endPrice);
        break;
      case '110': // Filtro por categoria e preço mínimo
        products = await knex('produtos')
          .where('usuario_id', user.id)
          .andWhere('categoria', 'ilike', `%${category}%`)
          .andWhere('preco', '>=', startPrice);
        break;
      case '111': // Filtro por categoria, preço mínimo e preço máximo
        products = await knex('produtos')
          .where('usuario_id', user.id)
          .andWhere('categoria', 'ilike', `%${category}%`)
          .andWhere('preco', '>=', startPrice)
          .andWhere('preco', '<=', endPrice);
        break;
      default:
        break;
    };

    if (!products) {
      return res.status(400).json(`Não existem produtos cadastrados para esse usuário ${filterControl !== '000' && ' com o(s) filtro(s) informado(s)'}!`);
    };

    return res.status(200).json(products);
  } catch (error) {
    return res.status(400).json(error.message);
  };
};

const get = async (req, res) => {
  const { user } = req;

  const id = req.params.productId;

  try {
    const product = await knex('produtos')
      .where('usuario_id', user.id)
      .andWhere({ id })
      .first();

    if (!product) {
      return res.status(400).json('Não existe produto cadastrado para esse usuário com o id informado!');
    };

    return res.status(200).json(product);
  } catch (error) {
    return res.status(400).json(error.message);
  };
};

const enroll = async (req, res) => {
  const { user } = req;

  let { nome, estoque, preco, categoria, descricao, imagem } = req.body;

  nome = nome.toLowerCase();

  categoria = categoria.toLowerCase();

  try {
    await validations.schemaAddProduct.validate(req.body);

    const productValidation = await knex('produtos')
      .where('usuario_id', user.id)
      .andWhere({ nome })
      .first();

    if (!!productValidation) {
      return res.status(400).json('Produto já cadastrado!');
    };

    const enrolledProduct = await knex('produtos').
      insert({ nome, estoque, preco, categoria, descricao, imagem, usuario_id: user.id }).
      returning('*');

    if (!enrolledProduct) {
      return res.status(400).json('Não foi possível cadastrar o produto.');
    };

    return res.status(200).json('Produto cadastrado com sucesso.');
  } catch (error) {
    return res.status(400).json(error.message);
  };
};

const edit = async (req, res) => {
  const { user } = req;

  const id = req.params.productId;

  let { nome, estoque, preco, categoria, descricao, imagem } = req.body;

  nome = nome.toLowerCase();

  categoria = categoria.toLowerCase();

  try {
    await validations.schemaEditProduct.validate(req.body);

    const productValidation = await knex('produtos')
      .where('usuario_id', user.id)
      .andWhere({ id })
      .first();

    if (!productValidation) {
      return res.status(400).json('Produto informado não consta no cadastro do usuário!');
    };

    const productDataFields = {};

    if (nome) {
      productDataFields.nome = nome;
    };

    if (estoque) {
      productDataFields.estoque = estoque;
    };

    if (preco) {
      productDataFields.preco = preco;
    };

    if (categoria) {
      productDataFields.categoria = categoria;
    };

    if (descricao) {
      productDataFields.descricao = descricao;
    };

    if (imagem) {
      productDataFields.imagem = imagem;
    };

    const updatedProduct = await knex('produtos')
      .update(productDataFields)
      .where('usuario_id', user.id)
      .andWhere({ id })
      .returning('*');

    if (!updatedProduct) {
      return res.status(400).json('Não foi possível atualizar o produto.');
    };

    return res.status(200).json('Produto atualizado com sucesso.');
  } catch (error) {
    return res.status(400).json(error.message);
  };
};

const remove = async (req, res) => {
  const { user } = req;

  const id = req.params.productId;

  try {
    const productValidation = await knex('produtos')
      .where('usuario_id', user.id)
      .andWhere({ id })
      .first();

    if (!productValidation) {
      return res.status(400).json('Produto informado não consta no cadastro do usuário!');
    };

    const removedProduct = await knex('produtos')
      .del()
      .where({ id })
      .returning('*');

    if (!removedProduct) {
      return res.status(400).json('Não foi possível remover o produto.');
    };

    return res.status(200).json('Produto removido com sucesso.');
  } catch (error) {
    return res.status(400).json(error.message);
  };
};

module.exports = {
  list,
  get,
  enroll,
  edit,
  remove
};