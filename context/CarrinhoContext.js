import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CarrinhoContext = createContext(null);
const STORAGE_KEY = 'carrinho_pf_v1';

export function CarrinhoProvider({ children }) {
  const [selecionados, setSelecionados] = useState([]);

  // 🔄 Restaura o carrinho do storage ao montar
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) setSelecionados(arr);
      } catch {
        // silencioso
      }
    })();
  }, []);

  // 💾 Persiste no storage sempre que mudar
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(selecionados));
      } catch {
        // silencioso
      }
    })();
  }, [selecionados]);

  // ✅ Alterna seleção por idLote (máx 1 por lote)
  const alternarSelecao = useCallback((lote) => {
    if (!lote) return;
    const id = lote.idLote ?? lote.id;
    if (!id) return;

    setSelecionados((prev) => {
      const existe = prev.some((v) => v.idLote === id);
      if (existe) {
        return prev.filter((v) => v.idLote !== id);
      }
      // guarda apenas o necessário (evita armazenar listas grandes como "codigos")
      const item = {
        idLote: id,
        tipo: lote.tipo,
        produtos: Array.isArray(lote.produtos) ? lote.produtos : [],
        empresa: lote.empresa,
        endereco: lote.endereco,
        validade: lote.validade || lote.dataValidade || null,
        pontos: Number(lote.pontos) || 0,
        quantidade: 1,
      };
      return [...prev, item];
    });
  }, []);

  const limparCarrinho = useCallback(() => {
    setSelecionados([]);
    // opcional: limpar storage imediatamente
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const totalPontos = useMemo(
    () =>
      selecionados.reduce(
        (acc, item) => acc + (Number(item.pontos) || 0) * (Number(item.quantidade) || 1),
        0
      ),
    [selecionados]
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

export function useCarrinho() {
  const ctx = useContext(CarrinhoContext);
  if (!ctx) throw new Error('useCarrinho deve ser usado dentro de <CarrinhoProvider>');
  return ctx;
}
