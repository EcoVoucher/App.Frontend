import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { CarrinhoProvider } from '../context/CarrinhoContext';
import { ModalCarrinhoProvider } from '../context/ModalCarrinhoContext';

export default function Layout() {
  return (
    <AuthProvider>
      <CarrinhoProvider>
        <ModalCarrinhoProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </ModalCarrinhoProvider>
      </CarrinhoProvider>
    </AuthProvider>
  );
}
