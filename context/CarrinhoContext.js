import { createContext, useContext, useState } from 'react';

const CarrinhoContext = createContext();

export function CarrinhoProvider({ children }) {
  const [selecionados, setSelecionados] = useState([]);

  // ✅ Adiciona ou remove item do carrinho
  const alternarSelecao = (lote) => {
    const id = lote.codigos[0];
    const existe = selecionados.find((v) => v.loteId === id);

    if (existe) {
      setSelecionados(selecionados.filter((v) => v.loteId !== id));
    } else {
      const item = {
        loteId: id,
        codigo: id,
        tipo: lote.tipo,
        produtos: lote.produtos,
        empresa: lote.empresa,
        endereco: lote.endereco,
        validade: lote.validade,
        pontos: lote.pontos,
        quantidade: 1,
        codigos: lote.codigos,
      };
      setSelecionados([...selecionados, item]);
    }
  };

  // ✅ Limpa todo o carrinho
  const limparCarrinho = () => {
    setSelecionados([]);
  };

  // ✅ Calcula o total de pontos dos itens selecionados
  const totalPontos = selecionados.reduce(
    (acc, item) => acc + item.pontos * item.quantidade,
    0
  );

  return (
    <CarrinhoContext.Provider
      value={{
        selecionados,
        alternarSelecao,
        limparCarrinho,
        totalPontos,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

export const useCarrinho = () => useContext(CarrinhoContext);
