import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function AdminLayout({ children }) {
  const { usuario, carregando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!carregando) {
        console.log()
        console.log (usuario)
        console.log (usuario.isAdmin)
        console.log (usuario.isAdmin!="true")
      // Bloqueia se não for admin autenticado
     if (!usuario || usuario.isAdmin != 'true') {

    
        router.replace('/(public)/login');
      }
    }
  }, [usuario, carregando]);

  if (carregando || !usuario) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return <>{children}</>;
}
