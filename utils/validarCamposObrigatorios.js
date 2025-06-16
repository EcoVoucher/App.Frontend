export const validarCamposObrigatorios = (dados, campos, tipoPessoa) => {
  const erros = {};

  const regexSenha = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  campos.forEach((campo) => {
    const valor = dados[campo];

    // Campos obrigatórios (exceto complemento)
    if (campo !== 'complemento' && (!valor || (typeof valor === 'string' && !valor.trim()))) {
      erros[campo] = 'Campo obrigatório';
      return;
    }

    switch (campo) {
      case 'nome':
        if (valor.trim().length < 3) erros.nome = 'Nome muito curto';
        break;

      case 'nomeEmpresa':
        if (valor.trim().length < 3) erros.nomeEmpresa = 'Nome da empresa muito curto';
        break;

      case 'email':
        if (!regexEmail.test(valor)) {
          erros.email = 'Email inválido - formato esperado: xxxx@dominio.com';
        }
        break;

      case 'senha':
        if (valor.length < 6) {
          erros.senha = 'A senha deve ter no mínimo 6 caracteres';
        } else if (!regexSenha.test(valor)) {
          erros.senha = 'A senha deve conter letras, números e um caractere especial';
        }
        break;

      case 'confirmarSenha':
        if (valor !== dados.senha) {
          erros.confirmarSenha = 'As senhas não coincidem';
        }
        break;

      case 'cpf':
        const numeros = valor.trim().replace(/\D/g, '');
        if (![11, 14].includes(numeros.length)) {
          erros.cpf = 'CPF ou CNPJ incompleto';
        } else if (tipoPessoa === 'pf' && !validarCPF(numeros)) {
          erros.cpf = 'CPF inválido';
        } else if (tipoPessoa === 'pj' && !validarCNPJ(numeros)) {
          erros.cpf = 'CNPJ inválido';
        }
        break;

      case 'cnpj':
        const cnpjLimpo = valor.trim().replace(/\D/g, '');
        if (cnpjLimpo.length !== 14 || !validarCNPJ(cnpjLimpo)) {
          erros.cnpj = 'CNPJ inválido';
        }
        break;

      case 'dataNascimento':
        const [dia, mes, ano] = valor.split('/');
        const nascimento = new Date(`${ano}-${mes}-${dia}`);
        const hoje = new Date();
        if (
          !dia || !mes || !ano ||
          nascimento.toString() === 'Invalid Date' ||
          nascimento > hoje
        ) {
          erros.dataNascimento = 'Data de nascimento inválida';
        }
        break;

      case 'cep':
        const cepLimpo = valor.replace(/\D/g, '');
        if (cepLimpo.length !== 8) erros.cep = 'CEP inválido';
        break;

      case 'telefone':
        const telLimpo = valor.replace(/\D/g, '');
        if (telLimpo.length < 10) erros.telefone = 'Telefone incompleto';
        break;

      // Validações específicas de voucher
      case 'tipo':
        if (!valor || valor.trim() === '') erros.tipo = 'Selecione o tipo do voucher';
        break;

      case 'produtos':
        if (!Array.isArray(valor) || valor.length === 0) {
          erros.produtos = 'Selecione ao menos um produto';
        }
        break;

      case 'quantidade':
        const qtd = parseInt(valor);
        if (isNaN(qtd) || qtd < 1 || qtd > 20) {
          erros.quantidade = 'Quantidade deve ser entre 1 e 20';
        }
        break;

      case 'dataValidade':
        const [diaV, mesV, anoV] = valor.split('/');
        const validade = new Date(`${anoV}-${mesV}-${diaV}T00:00:00`);
        const hojeValidade = new Date();
        const dataMinima = new Date();
        const dataMaxima = new Date();
        dataMinima.setDate(hojeValidade.getDate() + 10);
        dataMaxima.setDate(hojeValidade.getDate() + 365);

        if (isNaN(validade.getTime())) {
          erros.dataValidade = 'Data inválida';
        } else if (validade < dataMinima) {
          erros.dataValidade = 'Validade deve ser no mínimo 10 dias à frente';
        } else if (validade > dataMaxima) {
          erros.dataValidade = 'Validade não pode ultrapassar 1 ano';
        }
        break;
    }
  });

  return erros;
};

// Validador de CPF
function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf.charAt(10));
}

// Validador de CNPJ
function validarCNPJ(cnpj) {
  cnpj = cnpj.replace(/[^\d]+/g, '');
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let soma = 0;
  for (let i = 0; i < 12; i++) soma += parseInt(cnpj.charAt(i)) * pesos1[i];
  let resto = soma % 11;
  let dig1 = resto < 2 ? 0 : 11 - resto;

  if (dig1 !== parseInt(cnpj.charAt(12))) return false;

  soma = 0;
  for (let i = 0; i < 13; i++) soma += parseInt(cnpj.charAt(i)) * pesos2[i];
  resto = soma % 11;
  let dig2 = resto < 2 ? 0 : 11 - resto;

  return dig2 === parseInt(cnpj.charAt(13));
}
