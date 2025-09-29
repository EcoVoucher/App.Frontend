import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { AdminService } from '../../services/serviceAdmin';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';
import { obterComparativoPegada, formatarDataBR } from '../../utils/formatadores';
import { useAuth } from '../../context/AuthContext'; 
import { obterMensagemErro } from '../../utils/obterMensagemErro';
import { useRouter } from 'expo-router';
import HeaderComFiltros from '../../components/HeaderComFiltros';

import { Ionicons } from '@expo/vector-icons';



export default function AdminDevScreen() {
 

  const [usuarios, setUsuarios] = useState([]);
  const [visiveis, setVisiveis] = useState([]);
 const { usuario, logout } = useAuth();

const [carregando, setCarregando] = useState(false);

  const tipos = ['Todos', 'Pessoa Física', 'PJ Aprovada', 'PJ Pendente'];
  const [tipoSelecionado, setTipoSelecionado] = useState('Todos');
  const router = useRouter();

useEffect(() => {
    if (!usuario?.isAdmin) {
      router.replace('/(public)/login');
    }
  }, [usuario]);

  if (!usuario?.isAdmin) return null;



const carregarUsuarios = async () => {
  try {
    setCarregando(true);
    const lista = await AdminService.listarUsuarios();
    setUsuarios(lista);
    setVisiveis(new Array(lista.length).fill(false));
  } catch (error) {
    console.error(error);
    Alert.alert('Erro', obterMensagemErro(error, 'Erro ao carregar usuários.'));
  } finally {
    setCarregando(false);
  }
};

  const aprovarPJ = async (cnpj) => {
    try {
      await AdminService.aprovarPJ(cnpj);

      Alert.alert('Sucesso', 'Cadastro aprovado com sucesso!');
      carregarUsuarios(); // ✅ Recarrega a lista após aprovação
    } catch (error) {
      
      const mensagem = obterMensagemErro(error, 'Erro ao aprovar cadastro.');
      Alert.alert('Erro', mensagem);
    }
  };

  const toggleVisibilidade = (index) => {
    const novos = [...visiveis];
    novos[index] = !novos[index];
    setVisiveis(novos);
  };
if (carregando) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Carregando usuários...</Text>
    </View>
  );
}

  return (
  <View style={{ flex: 1 }}>
  {/* 🔐 Botão logout fixo no topo direito */}
  <TouchableOpacity onPress={logout} style={styles.logoutBotao}>
    <Ionicons name="log-out-outline" size={28} color={colors.verde} />
  </TouchableOpacity>
    <ScrollView contentContainerStyle={styles.container}>   

      <View style={{ width: '100%', maxWidth: 600 }}>

        <HeaderComFiltros
          titulo="Administração de Usuários"
          subtitulo="Aprovação e visualização dos cadastros"
          tipos={tipos}
          tipoSelecionado={tipoSelecionado}
          onSelecionarTipo={setTipoSelecionado}
        />
        {usuarios.length === 0 ? (
          <Text style={styles.vazio}>Nenhum usuário cadastrado.</Text>
        ) : (
         usuarios
            .filter((u) => {
              if (tipoSelecionado === 'Pessoa Física') return u.tipo === 'pf';
              if (tipoSelecionado === 'PJ Aprovada') return u.tipo === 'pj' && u.aprovado;
              if (tipoSelecionado === 'PJ Pendente') return u.tipo === 'pj' && !u.aprovado;
              return true; // 'Todos'
            })
            .map((usuario, index) => {

            const historico = Array.isArray(usuario.historicoPegada) ? usuario.historicoPegada : [];
            const ultima = historico.length > 0 ? historico[historico.length - 1] : null;

            return (
              <View key={index} style={styles.card}>
                <Text style={[styles.tipo, { color: usuario.tipo === 'pf' ? colors.azul : colors.laranja }]}>
                  {usuario.tipo.toUpperCase()}
                </Text>
                <Text style={styles.nome}>{usuario.nome || usuario.nomeEmpresa}</Text>

                {usuario.tipo === 'pj' && !usuario.aprovado && (
                  <TouchableOpacity onPress={() => aprovarPJ(usuario.cnpj)} style={[styles.botao, { marginTop: 8 }]}>
                    <Text style={styles.botaoTexto}>Aprovar Cadastro</Text>
                  </TouchableOpacity>
                )}

                {usuario.tipo === 'pj' && usuario.aprovado && (
                  <Text style={[styles.info, { color: colors.sucesso, fontWeight: 'bold' }]}>
                    ✅ PJ aprovado
                  </Text>
                )}

                <TouchableOpacity onPress={() => toggleVisibilidade(index)}>
                  <Text style={styles.toggleBotao}>
                    {visiveis[index] ? 'Ocultar detalhes ▲' : 'Ver detalhes ▼'}
                  </Text>
                </TouchableOpacity>

                {visiveis[index] && (
                  <View style={styles.detalhesBox}>
                    <Text style={styles.info}>CPF/CNPJ: {usuario.cpf || usuario.cnpj}</Text>
                    <Text style={styles.info}>Email: {usuario.email}</Text>
                    <Text style={styles.info}>Senha: ••••••</Text>

                    {ultima ? (
                      <>
                        <Text style={styles.info}>Pegada recente: {ultima.pontuacao} pontos</Text>
                        <Text style={styles.info}>Data: {formatarDataBR(ultima.data)}</Text>
                        <Text style={styles.info}>Comparativo: {obterComparativoPegada(ultima.pontuacao)}</Text>
                      </>
                    ) : (
                      <Text style={styles.info}>Nenhuma pegada registrada ainda.</Text>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}

        <TouchableOpacity style={styles.botao} onPress={carregarUsuarios}>
          <Text style={styles.botaoTexto}>Atualizar Lista</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.fundo,
    alignItems: 'center',
  },
  titulo: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    marginBottom: spacing.md,
  },
  vazio: {
    color: colors.cinza,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.branco,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    width: '100%',
    elevation: 2,
  },
  tipo: {
    fontSize: fonts.size.sm,
    marginBottom: 4,
  },
  nome: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.medium,
  },
  toggleBotao: {
    color: colors.verde,
    marginTop: 6,
    fontWeight: 'bold',
  },
  detalhesBox: {
    marginTop: spacing.sm,
  },
  info: {
    fontSize: fonts.size.sm,
    color: colors.preto,
  },
  botao: {
    marginTop: spacing.md,
    backgroundColor: colors.verde,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  botaoTexto: {
    color: colors.branco,
    fontSize: fonts.size.sm,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logoutBotao: {
  position: 'absolute',
  top: spacing.md,
  right: spacing.md,
  zIndex: 10,
  backgroundColor: 'transparent',
  padding: spacing.sm,
},

});
