// utils/status.js
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

function zerarHora(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export const obterStatus = (lote) => {
  const hoje = zerarHora(new Date());
  const validade = zerarHora(lote.dataValidade);

  // Expirado somente por data
  if (validade < hoje) return 'expirado';

  const total = Number(lote.quantidade) || 0;
  const disponiveis = Array.isArray(lote.codigos) ? lote.codigos.length : 0; // fallback seguro
  const usados = Math.max(0, total - disponiveis);

  if (usados === 0) return 'validos';
  if (usados > 0 && usados < total) return 'parcial';

  // ⚠️ Aqui você já marcava como 'expirado' quando esgotou.
  // Mantive igual para NÃO mudar seu comportamento.
  return 'expirado';
};
