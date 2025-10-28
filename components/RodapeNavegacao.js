import { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
  Pressable,
  Linking,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { FontAwesome, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function RodapeNavegacao() {
  const router = useRouter();
  const pathname = usePathname();
  const { usuario, logout } = useAuth();
  const menuItems = usuario?.tipo === 'pj' ? [
  { texto: 'Conheça o Eco Voucher', icone: 'recycle', rota:'/ecoempresa' },
  { texto: 'Seu Perfil', icone: 'account', rota:'/perfil' },

] : [
  { texto: 'Conheça o Eco Voucher', icone: 'recycle', rota:'/ecoempresa' },
  { texto: 'Fale pelo WhatsApp', icone: 'whatsapp', link: 'https://wa.me/5515996893760?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20o%20projeto%20EcoVoucher.' },
  { texto: 'Histórico Pegada', icone: 'history', rota: '/historicopegada' },
  { texto: 'Seu Perfil', icone: 'account', rota:'/perfil' },
  
];

  const { width } = Dimensions.get('window');
  const [menuAberto, setMenuAberto] = useState(false);

  const nomeAtivo = pathname.includes('/home')
    ? 'home'
    : pathname.includes('/login')
    ? 'login'
    : 'menu';

  const corIcone = (nome) => (nome === nomeAtivo ? cores.verde : cores.cinza);
  const menuWidth = width > 600 ? width * 0.25 : width * 0.8;

  const irPara = (rota) => {
    setMenuAberto(false);
    router.push(rota);
  };

  const rodapeBotoes = [
    {
      nome: 'home',
      icone: 'home',
      texto: 'Home',
      acao: () => router.push('/home'),
    },
    {
      nome: 'buscar',
      icone: 'search',
      texto: 'Buscar',
      acao: () => router.push('/'),
    },
    {
      nome: 'login',
      icone: usuario ? 'sign-out' : 'user',
      texto: usuario ? 'Logout' : 'Login',
      acao: async () => {
  if (usuario) {
    try {
      // 🔗 Chama o backend para invalidar o token (se o backend usar isso)
      await AuthService.logout();
    } catch (error) {
      console.log('Erro ao fazer logout na API:', error);
      // 🔥 Mesmo que a API falhe, ainda faz o logout local
    }

    // 🧹 Faz o logout local normalmente
    await logout();

    // 🚪 Redireciona para login
    router.replace('/login');
  } else {
    router.push('/login');
  }
},
    },
  ];

  return (
    <>
      {/* Menu lateral responsivo */}
      <Modal visible={menuAberto} transparent animationType="fade">
        <View style={styles.overlayEscuro}>
          <View style={[styles.menuLateral, { width: menuWidth }]}>
            <View style={styles.headerMenu}>
              <Text style={styles.menuTitulo}>MENU</Text>
              <TouchableOpacity onPress={() => setMenuAberto(false)}>
                <Entypo name="cross" size={24} color={cores.cinza} />
              </TouchableOpacity>
            </View>

            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() =>
                  item.link ? Linking.openURL(item.link) : irPara(item.rota)
                }
              >
                <MaterialCommunityIcons name={item.icone} size={20} color={cores.verde} />
                <Text style={styles.menuTexto}>{item.texto}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Rodapé fixo */}
     <View style={styles.container}>
        {rodapeBotoes.map((btn, i) => (
          <Pressable
            key={i}
            style={({ pressed }) => [styles.botao, pressed && styles.botaoPress]}
            onPress={btn.acao}
          >
            <FontAwesome name={btn.icone} size={20} color={corIcone(btn.nome)} />
            <Text style={[styles.texto, { color: corIcone(btn.nome) }]}>{btn.texto}</Text>
          </Pressable>
        ))}

        <Pressable
          style={({ pressed }) => [styles.botao, pressed && styles.botaoPress]}
          onPress={() => setMenuAberto(true)}
        >
          <Entypo name="dots-three-horizontal" size={20} color={corIcone('menu')} />
          <Text style={[styles.texto, { color: corIcone('menu') }]}>Menu</Text>
        </Pressable>
      </View>
    </>
  );
}

const cores = {
  verde: colors.verde,
  cinza: colors.cinza,
  branco: colors.branco,
};

const styles = StyleSheet.create({
 container: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'flex-start',
  backgroundColor: cores.branco,
  minHeight: 90, 
  paddingTop: 12,
  borderTopWidth: 1,
  borderColor: '#ccc',
  zIndex: 10,
  elevation: 10,
  width:'100%'
},
 botao: {
  alignItems: 'center',
  flex: 1,
  paddingVertical: 4,
  justifyContent: 'flex-start',
},

  botaoPress: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
  },
  texto: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  overlayEscuro: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  menuLateral: {
    backgroundColor: cores.branco,
    height: '100%',
    padding: 16,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  headerMenu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  menuTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: cores.verde,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  menuTexto: {
    marginLeft: 10,
    fontSize: 16,
    color: cores.verde,
    fontWeight: '500',
  },
});
