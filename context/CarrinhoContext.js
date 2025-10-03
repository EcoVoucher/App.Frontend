// context/CarrinhoContext.js
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const CarrinhoContext = createContext(null);
const STORAGE_KEY = 'carrinho_pf_v1';

// Fallback simples para web (localStorage)
const storage =
  Platform.OS === 'web'
    ? {
        async getItem(k) {
          try { return localStorage.getItem(k); } catch { return null; }
        },
        async setItem(k, v) {
          try { localStorage.setItem(k, v); } catch {}
        },
        async removeItem(k) {
          try { localStorage.removeItem(k); } catch {}
        },
      }
    : AsyncStorage;

export function CarrinhoProvider({ children }) {
  const { usuario } = useAuth();
  const [selecionados, setSelecionados] = useState([]);

  // chave por usuário (CPF/CNPJ) para não misturar carrinhos de sessões diferentes
  const storageKey = useMemo(() => {
    const doc = usuario?.cpf || usuario?.cnpj;
    return doc ? `${STORAGE_KEY}:${String(doc).replace(/\D/g, '')}` : STORAGE_KEY;
  }, [usuario]);

  // Restaura o carrinho ao montar / trocar de usuário
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const raw = await storage.getItem(storageKey);
        if (!raw || cancel) return;
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) setSelecionados(arr);
      } catch {
        // silencioso
      }
    })();
    return () => { cancel = true; };
  }, [storageKey]);

  // Persiste no storage sempre que mudar
  useEffect(() => {
    (async () => {
      try {
        await storage.setItem(storageKey, JSON.stringify(selecionados));
      } catch {
        // silencioso
      }
    })();
  }, [selecionados, storageKey]);

  // Limpa automaticamente quando deslogar
  useEffect(() => {
    if (!usuario) {
      setSelecionados([]);
      storage.removeItem(storageKey).catch(() => {});
    }
  }, [usuario, storageKey]);

  // Alterna seleção por idLote (máx 1 por lote)
  const alternarSelecao = useCallback((lote) => {
    if (!lote) return;
    const id = lote.idLote ?? lote.id;
    if (!id) return;

    setSelecionados((prev) => {
      const existe = prev.some((v) => v.idLote === id);
      if (existe) {
        return prev.filter((v) => v.idLote !== id);
      }
      // guarda apenas o necessário
      const item = {
        idLote: id,
        tipo: lote.tipo,
        produtos: Array.isArray(lote.produtos) ? lote.produtos : [],
        empresa: lote.empresa,
        endereco: lote.endereco,
        validade: lote.validade || lote.dataValidade || null,
        pontos: Number(lote.pontos) || 0,
        quantidade: 1, // regra atual: 1 por lote
      };
      return [...prev, item];
    });
  }, []);

  const limparCarrinho = useCallback(() => {
    setSelecionados([]);
    storage.removeItem(storageKey).catch(() => {});
  }, [storageKey]);

  const totalPontos = useMemo(
    () =>
      selecionados.reduce(
        (acc, item) =>
          acc + (Number(item.pontos) || 0) * (Number(item.quantidade) || 1),
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
