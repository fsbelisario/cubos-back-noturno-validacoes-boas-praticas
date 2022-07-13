const yup = require('./config');

const schemaEnrollUser = yup.object().shape({
  nome: yup.string().max(50).required('O campo <nome> é obrigatório.'),
  email: yup.string().email().required('O campo <e-mail> é obrigatório.'),
  senha: yup.string().min(5).max(14).required('O campo <senha> é obrigatório.'),
  nome_loja: yup.string().max(50).required('O campo <nome da loja> é obrigatório.')
});

const schemaLogin = yup.object().shape({
  email: yup.string().email().required('O campo <e-mail> é obrigatório.'),
  senha: yup.string().required('O campo <senha> é obrigatório.')
});

const schemaEditProfile = yup.object().shape({
  nome: yup.string().max(50),
  email: yup.string().email(),
  senha: yup.string().min(5).max(14),
  nome_loja: yup.string().max(50)
});

const schemaAddProduct = yup.object().shape({
  nome: yup.string().max(50).required('O campo <nome do produto> é obrigatório.'),
  estoque: yup.number().positive().required('O campo <estoque> é obrigatório.'),
  preco: yup.number().positive().integer().required('O campo <preço> é obrigatório e deve ser informado em centavos.'),
  categoria: yup.string().max(50),
  descricao: yup.string().required('O campo <descrição> é obrigatório.'),
  imagem: yup.string()
});

const schemaEditProduct = yup.object().shape({
  nome: yup.string().max(50).required('O campo <nome do produto> é obrigatório.'),
  estoque: yup.number().positive().required('O campo <estoque> é obrigatório.'),
  preco: yup.number().positive().integer().required('O campo <preço> é obrigatório e deve ser informado em centavos.'),
  categoria: yup.string().max(50),
  descricao: yup.string().required('O campo <descrição> é obrigatório.'),
  imagem: yup.string()
});

module.exports = {
  schemaEnrollUser,
  schemaLogin,
  schemaEditProfile,
  schemaAddProduct,
  schemaEditProduct
};