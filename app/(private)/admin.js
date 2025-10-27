import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { AdminService } from '../../services/serviceAdmin'; // mantém seu caminho
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
  const [carregando, setCarregando] = useState(false);
  const [aprovando, setAprovando] = useState({}); // { [cnpj]: boolean }

  const tipos = ['Todos', 'Pessoa Física', 'PJ Aprovada', 'PJ Pendente'];
  const [tipoSelecionado, setTipoSelecionado] = useState('Todos');

  const { usuario, logout } = useAuth();
  const router = useRouter();

  // Garante que só admin veja esta tela e carrega a lista
  useEffect(() => {
    if (!usuario?.isAdmin) {
      router.replace('/(public)/login');
      return;
    }
    carregarUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  if (!usuario?.isAdmin) return null;

  const carregarUsuarios = async () => {
    try {
      setCarregando(true);
      const resp = await AdminService.listarUsuarios(); // { ok, data | error }
      if (!resp.ok) {
        Alert.alert('Erro', obterMensagemErro(resp.error, 'Erro ao carregar usuários.'));
        setUsuarios([]);
        setVisiveis([]);
        return;
      }
      const lista = Array.isArray(resp.data) ? resp.data : [];
      setUsuarios(lista);
      setVisiveis(new Array(lista.length).fill(false));
    } catch (error) {
      Alert.alert('Erro', obterMensagemErro(error, 'Erro ao carregar usuários.'));
      setUsuarios([]);
      setVisiveis([]);
    } finally {
      setCarregando(false);
    }
  };

  const aprovarPJ = async (cnpj) => {
    try {
      setAprovando((prev) => ({ ...prev, [cnpj]: true }));
      const resp = await AdminService.aprovarPJ(cnpj); // { ok, data | error }
      if (!resp.ok) {
        Alert.alert('Erro', obterMensagemErro(resp.error, 'Erro ao aprovar cadastro.'));
        return;
      }
      Alert.alert('Sucesso', 'Cadastro aprovado com sucesso!');
      await carregarUsuarios(); // recarrega a lista
    } catch (error) {
      Alert.alert('Erro', obterMensagemErro(error, 'Erro ao aprovar cadastro.'));
    } finally {
      setAprovando((prev) => ({ ...prev, [cnpj]: false }));
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
      {/* 🔐 Logout fixo no topo direito */}
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
              .map((u, index) => {
                const historico = Array.isArray(u.historicoPegada) ? u.historicoPegada : [];
                const ultima = historico.length > 0 ? historico[historico.length - 1] : null;

                return (
                  <View key={u.cpf || u.cnpj || index} style={styles.card}>
                    <Text style={[styles.tipo, { color: u.tipo === 'pf' ? colors.azul : colors.laranja }]}>
                      {u.tipo?.toUpperCase()}
                    </Text>
                    <Text style={styles.nome}>{u.nome || u.nomeEmpresa}</Text>

                    {u.tipo === 'pj' && !u.aprovado && (
                      <TouchableOpacity
                        onPress={() => aprovarPJ(u.cnpj)}
                        style={[styles.botao, { marginTop: 8, opacity: aprovando[u.cnpj] ? 0.7 : 1 }]}
                        disabled={!!aprovando[u.cnpj]}
                      >
                        <Text style={styles.botaoTexto}>
                          {aprovando[u.cnpj] ? 'Aprovando...' : 'Aprovar Cadastro'}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {u.tipo === 'pj' && u.aprovado && (
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
                        <Text style={styles.info}>CPF/CNPJ: {u.cpf || u.cnpj}</Text>
                        <Text style={styles.info}>Email: {u.email}</Text>
                        <Text style={styles.info}>Senha: ••••••</Text>

                        {ultima ? (
                          <>
                            <Text style={styles.info}>Pegada recente: {ultima.pontuacao} pontos</Text>
                            <Text style={styles.info}>Data: {formatarDataBR(ultima.data)}</Text>
                            <Text style={styles.info}>
                              Comparativo: {obterComparativoPegada(ultima.pontuacao)}
                            </Text>
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
