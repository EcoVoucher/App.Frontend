import { createContext, useContext, useState } from 'react';

const ModalCarrinhoContext = createContext();

export function ModalCarrinhoProvider({ children }) {
  const [mostrarResumo, setMostrarResumo] = useState(false);

  const abrirResumo = () => setMostrarResumo(true);
  const fecharResumo = () => setMostrarResumo(false);

  return (
    <ModalCarrinhoContext.Provider
      value={{
        mostrarResumo,
        abrirResumo,
        fecharResumo,
      }}
    >
      {children}
    </ModalCarrinhoContext.Provider>
  );
}

export const useModalCarrinho = () => useContext(ModalCarrinhoContext);
