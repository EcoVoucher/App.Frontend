import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  

  useEffect(() => {
    const carregarUsuario = async () => {
      const tokenSalvo = await AsyncStorage.getItem('token');
      const usuarioSalvo = await AsyncStorage.getItem('usuario');
      let user = JSON.parse(usuarioSalvo);
      if (tokenSalvo && usuarioSalvo) {
        setUsuario(JSON.parse(usuarioSalvo));
      }

      setCarregando(false);
    };

    carregarUsuario();
  }, []);

  const login = async ({ token, usuario, tipo }) => {
   const usuarioComTipo = {
    ...usuario,
    tipo: tipo, // 🔐 garante tipo (pf, pj, admin)
    isAdmin: usuario?.isAdmin ?? 'false', // garante isAdmin como string
  };

  await AsyncStorage.setItem('token', token);
  await AsyncStorage.setItem('usuario', JSON.stringify(usuarioComTipo));
  setUsuario(usuarioComTipo);
  console.log('🟢 TOKEN RECEBIDO NO LOGIN:', token);

};

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        login,
        logout,
        carregando,
        setUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
