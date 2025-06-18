import { createContext, useContext, useState } from 'react';

const CarrinhoContext = createContext();

export function CarrinhoProvider({ children }) {
  const [selecionados, setSelecionados] = useState([]);

  const alternarSelecao = (lote) => {
    const id = lote.idLote;
    const existe = selecionados.find((v) => v.idLote === id);

    if (existe) {
      // 🔄 Remove se já está selecionado
      setSelecionados(selecionados.filter((v) => v.idLote !== id));
    } else {
      // ✅ Adiciona ao carrinho
      const item = {
        idLote: id,
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

  const limparCarrinho = () => {
    setSelecionados([]);
  };

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

