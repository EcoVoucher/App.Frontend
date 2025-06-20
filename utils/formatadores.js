export const obterComparativoPegada = (soma) => {
  if (soma <= 160) {
    return '✅ Sustentável: até 1.6 gha, dentro da capacidade do planeta.';
  } else if (soma <= 270) {
    return '🟢 Abaixo da média mundial (~2.7 gha).';
  } else if (soma <= 300) {
    return '🔵 Moderada, similar ao Brasil (~3.0 gha).';
  } else if (soma <= 460) {
    return '🟡 Alta, como a França (~4.6 gha).';
  } else if (soma <= 600) {
    return '🟠 Muito alta, como a Suécia (~6.0 gha).';
  } else {
    return '🔴 Extremamente alta, como os EUA (~8.0 gha).';
  }
};

export const obterIconePegada = (ponto) => {
  if (ponto <= 160) return '✅';
  if (ponto <= 270) return '🟢';
  if (ponto <= 300) return '🔵';
  if (ponto <= 460) return '🟡';
  if (ponto <= 600) return '🟠';
  return '🔴';
};

export const obterFaixasPegada = () => [
  { label: '✅ Sustentável (até 1.6 gha)', limite: 160, cor: '#81C784' },   // Verde claro
  { label: '🟢 Abaixo da média (~2.7 gha)', limite: 270, cor: '#388E3C' },  // Verde forte
  { label: '🔵 Moderada (~3.0 gha)', limite: 300, cor: '#2196F3' },         // Azul
  { label: '🟡 Alta (~4.6 gha)', limite: 460, cor: '#FFEB3B' },             // Amarelo
  { label: '🟠 Muito alta (~6.0 gha)', limite: 600, cor: '#FF9800' },       // Laranja
  { label: '🔴 Extremamente alta (~8.0 gha)', limite: Infinity, cor: '#F44336' }, // Vermelho
];

export const formatarDataBR = (dataISO) => {
  const data = new Date(dataISO);
  return isNaN(data.getTime()) ? 'Data inválida' : data.toLocaleDateString('pt-BR');
};

export const apenasNumeros = (str) => (str || '').replace(/\D/g, '');
