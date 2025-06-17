import { colors } from '../theme/colors';

export const textoStatus = {
  todos: 'Todos',
  validos: '✅ Válido',
  parcial: '⚠️ Parcial',
  expirado: '❌ Expirado',
};

export const corStatus = {
  validos: colors.verde,
  parcial: '#f0c674',
  expirado: colors.cinza,
  indefinido: colors.cinza,
};
export const obterStatus = (lote) => {
  const hoje = new Date();
  const validade = new Date(lote.dataValidade);

  if (validade < hoje) {
    return 'expirado';
  }

  const total = lote.quantidade;
  const usados = total - (lote.codigos?.length || 0);

  if (usados === 0) {
    return 'validos';
  } else if (usados > 0 && usados < total) {
    return 'parcial';
  } else {
    return 'expirado';
  }
};
