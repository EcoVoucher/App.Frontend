// app/index.js
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const auth = useAuth();

  // ainda carregando contexto/AuthProvider? não renderiza nada
  if (!auth || auth.carregando) return null;

  const { usuario } = auth;

  // escolhe a tela certa pra usuário logado
  return <Redirect href={usuario ? '/home' : '/login'} />;
}
