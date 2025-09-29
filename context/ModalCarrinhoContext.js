import React, { createContext, useContext, useState, useCallback } from 'react';

const ModalCarrinhoContext = createContext(null);

export function ModalCarrinhoProvider({ children }) {
  const [mostrarResumo, setMostrarResumo] = useState(false);

  const abrirResumo = useCallback(() => setMostrarResumo(true), []);
  const fecharResumo = useCallback(() => setMostrarResumo(false), []);

  return (
    <ModalCarrinhoContext.Provider value={{ mostrarResumo, abrirResumo, fecharResumo }}>
      {children}
    </ModalCarrinhoContext.Provider>
  );
}

export function useModalCarrinho() {
  const ctx = useContext(ModalCarrinhoContext);
  if (!ctx) throw new Error('useModalCarrinho deve ser usado dentro de <ModalCarrinhoProvider>');
  return ctx;
}
