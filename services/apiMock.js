import AsyncStorage from '@react-native-async-storage/async-storage';

// Produtos válidos por tipo de voucher
const produtosPorTipo = {
 Alimentacao: ['Marmitex', 'Arroz 5kg', 'Feijão 1kg', 'Leite integral', 'Cesta básica'],
  Higiene: ['Pasta dental Colgate', 'Sabonete Dove', 'Papel higiênico', 'Shampoo', 'Sabão em barra'],
  Transporte: ['Metrô', 'Ônibus'],  
};

// Função que valida se todos os produtos pertencem ao tipo informado
const validarProdutosPorTipo = (tipo, produtos) => {
  const produtosValidos = produtosPorTipo[tipo] || [];
  return produtos.every(p => produtosValidos.includes(p));
};


const simularAtraso = (ms = 1000) => new Promise(res => setTimeout(res, ms));

const CHAVE_USUARIOS = '@usuarios_mock';
const CHAVE_VOUCHERS = '@vouchersGerados';
const CHAVE_CONTADOR = 'contador_vouchers_gerados';

const apenasNumeros = (str) => (str || '').replace(/\D/g, '');
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexSenha = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;

const limparUsuarios = async () => await AsyncStorage.removeItem(CHAVE_USUARIOS);
const limparVouchers = async () => await AsyncStorage.removeItem(CHAVE_VOUCHERS);

const obterUsuarios = async () => {
  const json = await AsyncStorage.getItem(CHAVE_USUARIOS);
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === 'object' && parsed !== null) return Object.values(parsed);
    return [];
  } catch {
    return [];
  }
};

const salvarUsuarios = async (usuarios) => {
  await AsyncStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
};

const encontrarUsuario = (identificador) => {
  const id = apenasNumeros(identificador);
  return (usuarios) => usuarios.find((u) => apenasNumeros(u.cpf || u.cnpj) === id);
};

function validarCPF(cpf) {
  cpf = apenasNumeros(cpf);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto >= 10) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto >= 10) resto = 0;
  return resto === parseInt(cpf[10]);
}

function validarCNPJ(cnpj) {
  cnpj = apenasNumeros(cnpj);
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let soma = 0;
  for (let i = 0; i < 12; i++) soma += parseInt(cnpj[i]) * pesos1[i];
  let resto = soma % 11;
  let dig1 = resto < 2 ? 0 : 11 - resto;
  if (dig1 !== parseInt(cnpj[12])) return false;
  soma = 0;
  for (let i = 0; i < 13; i++) soma += parseInt(cnpj[i]) * pesos2[i];
  resto = soma % 11;
  let dig2 = resto < 2 ? 0 : 11 - resto;
  return dig2 === parseInt(cnpj[13]);
}
const cadastroPF = async (dados) => {
  await simularAtraso();
  const usuarios = await obterUsuarios();
  const cpfLimpo = apenasNumeros(dados.cpf);

  if (!cpfLimpo) throw new Error('CPF não informado.');
  if (usuarios.some(u => apenasNumeros(u.cpf) === cpfLimpo)) throw new Error('Usuário já cadastrado com esse CPF.');
  if (!regexEmail.test(dados.email)) throw new Error('Email inválido.');
  if (!regexSenha.test(dados.senha)) throw new Error('Senha fraca.');
  if (dados.senha !== dados.confirmarSenha) throw new Error('Senhas não coincidem.');

  usuarios.push({ tipo: 'pf', ...dados, primeiroAcesso: true });
  await salvarUsuarios(usuarios);
  return { status: 'ok', message: 'Cadastro PF realizado.' };
};

const cadastroPJ = async (dados) => {
  await simularAtraso();
  const usuarios = await obterUsuarios();
  const cnpjLimpo = apenasNumeros(dados.cnpj);

  if (!cnpjLimpo) throw new Error('CNPJ não informado.');
  if (usuarios.some(u => apenasNumeros(u.cnpj) === cnpjLimpo)) throw new Error('Usuário já cadastrado com esse CNPJ.');
  if (!regexEmail.test(dados.email)) throw new Error('Email inválido.');
  if (!regexSenha.test(dados.senha)) throw new Error('Senha fraca.');
  if (dados.senha !== dados.confirmarSenha) throw new Error('Senhas não coincidem.');

  usuarios.push({ tipo: 'pj', ...dados, primeiroAcesso: true, aprovado: false });
  await salvarUsuarios(usuarios);
  return { status: 'ok', message: 'Cadastro PJ realizado. Aguarde a aprovação do administrador.' };
};

const aprovarCadastroPJ = async (cnpj) => {
  const usuarios = await obterUsuarios();
  const cnpjLimpo = apenasNumeros(cnpj);

  const index = usuarios.findIndex(u => apenasNumeros(u.cnpj) === cnpjLimpo && u.tipo === 'pj');
  if (index === -1) throw new Error('Usuário PJ não encontrado.');

  usuarios[index].aprovado = true;
  await salvarUsuarios(usuarios);
  return { status: 'ok', message: 'Cadastro aprovado com sucesso.' };
};

const listarPJsPendentes = async () => {
  const usuarios = await obterUsuarios();
  return usuarios.filter(u => u.tipo === 'pj' && !u.aprovado);
};


const login = async (identificador, senha, tipo) => {
  await simularAtraso();
  const usuarios = await obterUsuarios();
  const id = apenasNumeros(identificador);
  const usuarioIndex = usuarios.findIndex(u => apenasNumeros(u.cpf || u.cnpj) === id);

  if (usuarioIndex === -1) throw new Error('Usuário não encontrado.');
  const usuario = usuarios[usuarioIndex];

  if (usuario.tipo !== tipo) throw new Error('Tipo de usuário incorreto.');
  if (usuario.tipo === 'pj' && !usuario.aprovado) {
    throw new Error('Cadastro ainda não aprovado. Aguarde a validação do administrador.');
  }
  if (usuario.senha !== senha) throw new Error('Senha incorreta.');

  const primeiroAcesso = !!(usuario.primeiroAcesso ?? true);
  usuarios[usuarioIndex].primeiroAcesso = false;
  await salvarUsuarios(usuarios);

  const token = 'mock-token-' + Math.random().toString(36).substring(2, 10);
  await AsyncStorage.setItem('token', token);

  return { token, usuario: { ...usuario, primeiroAcesso } };
};
const logout = async () => await AsyncStorage.removeItem('token');

const getToken = async () => await AsyncStorage.getItem('token');

const recuperarSenha = async ({ cpf, cnpj }) => {
  await simularAtraso();
  const usuarios = await obterUsuarios();
  const id = apenasNumeros(cpf || cnpj);

  const index = usuarios.findIndex(u => apenasNumeros(u.cpf || u.cnpj) === id);
  if (index === -1) throw new Error('Usuário não encontrado.');

  // 🔄 MOCK: gera token interno e simula envio por e-mail
  const token = 'token-' + Math.random().toString(36).substring(2, 12);
  usuarios[index].tokenRecuperacao = token;

  await salvarUsuarios(usuarios);

  return {
    status: 'ok',
    email: usuarios[index].email,
    mensagem: `Link de redefinição enviado para ${usuarios[index].email}`,
    token, // ⚠️ apenas para uso local (não será usado na API real)
  };
};

const redefinirSenhaComToken = async ({ token, novaSenha }) => {
  await simularAtraso();
  const usuarios = await obterUsuarios();

  const index = usuarios.findIndex(u => u.tokenRecuperacao === token);
  if (index === -1) throw new Error('Token inválido ou expirado.');
  if (!regexSenha.test(novaSenha)) throw new Error('Senha inválida.');

  usuarios[index].senha = novaSenha;
  delete usuarios[index].tokenRecuperacao;

  await salvarUsuarios(usuarios);
  return { status: 'ok', message: 'Senha redefinida com sucesso.' };
};


///tela pegada - questionario
const salvarPegada = async (cpfOuCnpj, pontuacao) => {
  await simularAtraso();
  const usuarios = await obterUsuarios();
  const id = apenasNumeros(cpfOuCnpj);
  const index = usuarios.findIndex((u) => apenasNumeros(u.cpf || u.cnpj) === id);

  if (index === -1) throw new Error('Usuário não encontrado.');
  if (usuarios[index].tipo !== 'pf') throw new Error('Apenas usuários PF podem salvar pegada.');

  const data = new Date().toISOString();
  if (!usuarios[index].historicoPegada) {
    usuarios[index].historicoPegada = [];
  }

  usuarios[index].historicoPegada.push({ data, pontuacao });
  await salvarUsuarios(usuarios);

  return { status: 'ok', message: 'Pontuação salva com sucesso.' };
};

///historico pegada
const obterHistoricoPegada = async (cpfOuCnpj) => {
  const usuarios = await obterUsuarios();
  const id = apenasNumeros(cpfOuCnpj);
  const usuario = usuarios.find((u) => apenasNumeros(u.cpf || u.cnpj) === id);
  if (!usuario) throw new Error('Usuário não encontrado.');
  if (usuario.tipo !== 'pf') throw new Error('Apenas usuários PF possuem histórico de pegada.');

  return usuario.historicoPegada || [];
};

//api simulação deposito
const obterUsuarioPorCPF = async (cpf) => {
  const usuarios = await obterUsuarios();
  const id = apenasNumeros(cpf);
  return usuarios.find((u) => apenasNumeros(u.cpf) === id);
    // 🔁 API real:
  // return await api.get(`/usuarios/cpf/${id}`);
};

///simulação deposito
const registrarDeposito = async (cpf, materiais, totalPontos,codigo) => {
  await simularAtraso();

  const usuarios = await obterUsuarios();
  const id = apenasNumeros(cpf);
  const index = usuarios.findIndex((u) => apenasNumeros(u.cpf || u.cnpj) === id);

  if (index === -1) throw new Error('Usuário não encontrado.');

  const data = new Date().toISOString();

  // Adiciona o registro de depósito
  if (!usuarios[index].depositos) {
    usuarios[index].depositos = [];
  }
  usuarios[index].depositos.push({ data, materiais, totalPontos, codigo});

  // Atualiza os pontos totais
  usuarios[index].pontos = (usuarios[index].pontos || 0) + totalPontos;

  // Adiciona a movimentação do tipo 'entrada'
  if (!usuarios[index].movimentacoes) {
    usuarios[index].movimentacoes = [];
  }
  usuarios[index].movimentacoes.push({
    tipo: 'entrada',
    descricao: 'Depósito de materiais',
    pontos: totalPontos,
    data: new Date().toLocaleString('pt-BR'),
    timestamp: new Date().toISOString(),
    codigo
  });

  await salvarUsuarios(usuarios);
  // 📤 🔁 (FUTURO) Enviar comprovante automático por e-mail
  // await api.post('/deposito', { cpf, materiais, totalPontos, codigo });
  // await api.sendEmailComprovante(cpf, codigo); ← integração real

  return { status: 'ok', message: 'Depósito registrado com sucesso.' };
};

//movimentação de pontos-cnpj e cpf

const registrarMovimentacao = async (cpf, tipo, pontos, descricao, codigo = null) => 
 {
  const usuarios = await obterUsuarios();
  const id = cpf.replace(/\D/g, '');
  const index = usuarios.findIndex((u) => u.cpf && u.cpf.replace(/\D/g, '') === id);

  if (index === -1) throw new Error('Usuário não encontrado.');

  if (!usuarios[index].movimentacoes) {
    usuarios[index].movimentacoes = [];
  }

  const agora = new Date();

  const novaMovimentacao = {
    tipo, 
    descricao,
    pontos,
    data: agora.toLocaleString('pt-BR'),
    timestamp: agora.toISOString(),
    ...(codigo && { codigo })
  };

  usuarios[index].movimentacoes.push(novaMovimentacao);

  if (tipo === 'entrada') {
    usuarios[index].pontos = (usuarios[index].pontos || 0) + pontos;
  } else if (tipo === 'saida') {
    usuarios[index].pontos = (usuarios[index].pontos || 0) - pontos;
  }

  await salvarUsuarios(usuarios);
};

// Gerador de códigos únicos para vouchers
const gerarCodigosVoucher = async (quantidade) => {
  const valorAtual = await AsyncStorage.getItem(CHAVE_CONTADOR);
  let contador = valorAtual ? parseInt(valorAtual) : 0;

  const ano = new Date().getFullYear();
  const codigos = [];

  for (let i = 0; i < quantidade; i++) {
    contador++;
    codigos.push(`VOUC-${ano}-${String(contador).padStart(3, '0')}`);
  }

  await AsyncStorage.setItem(CHAVE_CONTADOR, contador.toString());
  return codigos;
};


// Geração de vouchers por PJ
// 🔄 API REAL:
// Esta função será substituída por uma requisição POST real:
// await api.post('/vouchers', { cnpj, ...dados });
//
// O backend deve:
// - Gerar e armazenar os códigos únicos.
// - Associar os códigos à empresa (CNPJ).
// - Retornar os dados do lote com os códigos gerados.
//
// Esperado na resposta:
// {
//   idLote: "ECO-VCH-001",
//   tipo: "Alimentacao",
//   produtos: [...],
//   quantidade: 10,
//   dataValidade: "2025-07-01T00:00:00Z",
//   codigos: [...],
//   empresa: "Nome da empresa",
//   endereco: "Rua tal...",
//   cnpj: "12345678000100"
// }
const gerarVouchersPJ = async (cnpj, dados) => {
  await simularAtraso();

  const usuarios = await obterUsuarios();
  const id = apenasNumeros(cnpj);
  const usuario = usuarios.find(u => apenasNumeros(u.cnpj) === id);

  if (!usuario) throw new Error('Usuário PJ não encontrado.');

  // 🔥 Validação dos produtos pelo tipo
  if (!validarProdutosPorTipo(dados.tipo, dados.produtos)) {
    throw new Error('Os produtos não correspondem ao tipo de voucher selecionado.');
  }

  const codigos = await gerarCodigosVoucher(dados.quantidade);

  const e = usuario;
  const enderecoCompleto = `${e.bairro}-${e.numero}, ${e.cidade}, ${e.cep}`;

  const lote = {
    idLote: codigos[0],
    tipo: dados.tipo,
    produtos: dados.produtos,
    quantidade: dados.quantidade,
    dataValidade: dados.dataValidade,
    codigos,
    empresa: usuario.nomeEmpresa || 'Empresa não encontrada',
    endereco: enderecoCompleto,
    cnpj: id
  };

  const chave = '@vouchersGerados';
  const json = await AsyncStorage.getItem(chave);
  const todos = json ? JSON.parse(json) : [];

  todos.push(lote);
  await AsyncStorage.setItem(chave, JSON.stringify(todos));

  return lote;
};



const obterVouchersPorCNPJ = async (cnpj) => {
  const chave = '@vouchersGerados';
  const json = await AsyncStorage.getItem(chave);
  const todos = json ? JSON.parse(json) : [];

  const id = apenasNumeros(cnpj);
  return todos.filter((v) => apenasNumeros(v.cnpj) === id);
};

const obterVouchersDisponiveisPF = async () => {
  const json = await AsyncStorage.getItem('@vouchersGerados');
  const todos = json ? JSON.parse(json) : [];
  const hoje = new Date();

  return todos
    .filter((lote) => 
        new Date(lote.dataValidade) >= hoje &&
        lote.quantidade > 0 &&
        lote.codigos?.length > 0
      ).map((lote) => ({
      tipo: lote.tipo,
      produtos: lote.produtos,
      pontos: lote.tipo === 'Alimentacao' ? 150 : lote.tipo === 'Higiene' ? 100 : 50,
      empresa: lote.empresa,
      endereco: lote.endereco,
      validade: lote.dataValidade,
      quantidade: lote.quantidade,
      codigos: lote.codigos.slice(0, lote.quantidade) 
    }));
};

const comprarVouchersPF = async (cpf, listaVouchers) => {
  const usuarios = await obterUsuarios();
  const id = apenasNumeros(cpf);
  const index = usuarios.findIndex((u) => apenasNumeros(u.cpf) === id);
  if (index === -1) throw new Error('Usuário não encontrado.');

  const usuario = usuarios[index];
  const totalPontos = listaVouchers.reduce((acc, v) => acc + v.pontos, 0);
  if ((usuario.pontos || 0) < totalPontos) throw new Error('Pontos insuficientes.');

  const agora = new Date();
  const dataFormatada = agora.toLocaleString('pt-BR');
  const timestamp = agora.toISOString();

  const json = await AsyncStorage.getItem('@vouchersGerados');
  const todos = json ? JSON.parse(json) : [];

  let vouchersConsumidos = [];

  for (const desejado of listaVouchers) {
  const lote = todos.find(
    (l) =>
      l.tipo === desejado.tipo &&
      l.empresa === desejado.empresa &&
      l.endereco === desejado.endereco &&
      l.produtos?.join(',') === desejado.produtos?.join(',') &&
      l.dataValidade === desejado.validade &&
      l.quantidade > 0
  );

  if (!lote || !lote.codigos?.length) {
    throw new Error(`Sem códigos disponíveis para: ${desejado.tipo}`);
  }

  const cnpjEmpresa = lote.cnpj || '';

  // Pega um código único do lote
  const codigoUsado = lote.codigos.shift();

  // Adiciona movimentação com esse código
  usuario.movimentacoes = usuario.movimentacoes || [];
 usuario.movimentacoes.push({
  tipo: 'saida',
  descricao: `Troca por voucher de ${desejado.tipo}`,
  tipoVoucher: desejado.tipo,
  pontos: desejado.pontos,
  data: dataFormatada,
  timestamp: timestamp,
  codigo: codigoUsado,
  produtos: desejado.produtos,
  empresa: desejado.empresa,
  endereco: desejado.endereco,
  validade: desejado.validade,
  status: 'valido',
  cnpj: cnpjEmpresa,
  quantidade: 1, 
});

  usuario.pontos = (usuario.pontos || 0) - desejado.pontos;
  vouchersConsumidos.push(codigoUsado);
}

  await salvarUsuarios(usuarios);
  await AsyncStorage.setItem('@vouchersGerados', JSON.stringify(todos));

  return { status: 'ok', message: 'Compra realizada com sucesso.', codigos: vouchersConsumidos };
};

async function marcarVoucherComoUtilizado(codigoAlvo) {
  const usuarios = await obterUsuarios();
  let atualizado = false;

  for (const usuario of usuarios) {
    const movimentacoes = usuario.movimentacoes || [];

    const mov = movimentacoes.find((m) => m.codigo === codigoAlvo);

    if (mov) {
      if (mov.status === 'utilizado') {
        throw new Error('Voucher já foi utilizado.');
      }

      mov.status = 'utilizado';
      atualizado = true;
      break;
    }
  }

  if (!atualizado) {
    throw new Error('Voucher não encontrado.');
  }

  await salvarUsuarios(usuarios);
}
const contarVouchersCompradosPorCNPJ = async (cnpj) => {
  const cnpjLimpo = apenasNumeros(cnpj);
  const usuarios = await obterUsuarios();

  let total = 0;

  for (const user of usuarios) {
    if (user.tipo === 'pf' && Array.isArray(user.movimentacoes)) {
      for (const mov of user.movimentacoes) {
        if (
          mov.tipo === 'saida' &&
          ['valido', 'utilizado'].includes(mov.status) &&
         mov.cnpj && apenasNumeros(mov.cnpj) === cnpjLimpo

        ) {
          total += mov.quantidade || 1;
        }
      }
    }
  }

  return total;
};
const obterVouchersPorCpfTipoECNPJ = async (cpf, tipo, cnpj) => {
  const usuarios = await obterUsuarios();
  const usuario = usuarios.find((u) => apenasNumeros(u.cpf) === apenasNumeros(cpf));
  if (!usuario) throw new Error('Usuário não encontrado.');

  const cnpjLimpo = apenasNumeros(cnpj);

  const movimentacoes = (usuario.movimentacoes || []).filter(
    (mov) =>
      mov.tipo === 'saida' &&
      mov.tipoVoucher === tipo &&
      apenasNumeros(mov.cnpj) === cnpjLimpo
  );

  return movimentacoes;
};
const obterVoucherPorCodigoECNPJ = async (codigo, cnpj) => {
  const usuarios = await obterUsuarios();
  const cnpjLimpo = apenasNumeros(cnpj);

  for (const usuario of usuarios) {
    const mov = (usuario.movimentacoes || []).find(
      (m) =>
        m.tipo === 'saida' &&
        m.codigo === codigo &&
        apenasNumeros(m.cnpj) === cnpjLimpo
    );
    if (mov) return mov;
  }

  throw new Error('Voucher não encontrado para este CNPJ.');
};


export default {
  login,
  cadastroPF,
  cadastroPJ,
  aprovarCadastroPJ,
  listarPJsPendentes,
  recuperarSenha,
  redefinirSenhaComToken,
  logout,
  getToken,
  salvarPegada,
  obterHistoricoPegada,
  obterUsuarioPorCPF,
  registrarDeposito,
  registrarMovimentacao,
  gerarVouchersPJ,
  obterVouchersPorCNPJ,
  obterVouchersDisponiveisPF,
  comprarVouchersPF,
  obterUsuarios,
  salvarUsuarios,
  marcarVoucherComoUtilizado,
  limparUsuarios,
  limparVouchers,
  contarVouchersCompradosPorCNPJ,
  obterVouchersPorCpfTipoECNPJ,
  obterVoucherPorCodigoECNPJ,

};
