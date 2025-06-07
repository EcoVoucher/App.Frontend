export const obterComparativoPegada = (soma) => {
  let comparativo = '';
  if (soma <= 160) {
    comparativo = '✅ Sustentável: até 1.6 gha, dentro da capacidade do planeta.';
  } else if (soma <= 270) {
    comparativo = '🟢 Abaixo da média mundial (~2.7 gha).';
  } else if (soma <= 300) {
    comparativo = '🟠 Similar ao Brasil (~3.0 gha).';
  } else if (soma <= 460) {
    comparativo = '🟡 Alta, como a França (~4.6 gha).';
  } else if (soma <= 600) {
    comparativo = '🔵 Muito alta, como a Suécia (~6.0 gha).';
  } else {
    comparativo = '🔴 Extremamente alta, como os EUA (~8.0 gha).';
  }
  return comparativo;
};

export const obterIconePegada = (ponto) => {
  if (ponto <= 160) return '✅';
  if (ponto <= 270) return '🟢';
  if (ponto <= 300) return '🟠';
  if (ponto <= 460) return '🟡';
  if (ponto <= 600) return '🔵';
  return '🔴';
};

export const formatarDataBR = (dataISO) => {
  const data = new Date(dataISO);
  return isNaN(data.getTime()) ? 'Data inválida' : data.toLocaleDateString('pt-BR');
};
