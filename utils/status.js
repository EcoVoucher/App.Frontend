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

// Parse seguro para 'YYYY-MM-DD' como data local (evita off-by-one por timezone)
function parseDataLocal(dateLike) {
  if (!dateLike) return null;
  if (typeof dateLike === 'string') {
    const iso = dateLike.split('T')[0]; // 'YYYY-MM-DD'
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    if (m) {
      const [, y, mo, d] = m;
      return new Date(Number(y), Number(mo) - 1, Number(d), 0, 0, 0, 0);
    }
  }
  const dt = new Date(dateLike);
  return Number.isNaN(dt.getTime()) ? null : new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0);
}

export const obterStatus = (lote) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const validade = parseDataLocal(lote?.dataValidade);

  // Se não houver data ou for inválida, considera válido para não "matar" o lote indevidamente
  if (!validade) {
    const total = Number(lote?.quantidade) || 0;
    const disponiveis = Array.isArray(lote?.codigos) ? lote.codigos.length : 0;
    const usados = Math.max(0, total - disponiveis);
    if (usados === 0) return 'validos';
    if (usados > 0 && usados < total) return 'parcial';
    return 'expirado'; // esgotado -> mantém seu comportamento como expirado
  }

  if (validade < hoje) return 'expirado';

  const total = Number(lote?.quantidade) || 0;
  const disponiveis = Array.isArray(lote?.codigos) ? lote.codigos.length : 0;
  const usados = Math.max(0, total - disponiveis);

  if (usados === 0) return 'validos';
  if (usados > 0 && usados < total) return 'parcial';
  return 'expirado'; // esgotado -> mantém como expirado
};
