export const formatarCadastro = (dados) => ({
  ...dados,
  cpf: dados.cpf ? dados.cpf.replace(/\D/g, '') : '',
  cnpj: dados.cnpj ? dados.cnpj.replace(/\D/g, '') : '',
  telefone: dados.telefone ? dados.telefone.replace(/\D/g, '') : '',
  cep: dados.cep ? dados.cep.replace(/\D/g, '') : ''
});
export const apenasNumeros = (valor) => (valor || '').replace(/\D/g, '');
