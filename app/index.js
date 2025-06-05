import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { usuario, carregando } = useAuth();

  if (carregando) return null;

  return <Redirect href={usuario ? '/(private)/home' : '/(public)/login'} />;
}