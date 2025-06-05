import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';

export default function AdminDevScreen() {
  const [usuarios, setUsuarios] = useState([]);
  const [visiveis, setVisiveis] = useState([]);

  const carregarUsuarios = async () => {
    try {
      const json = await AsyncStorage.getItem('@usuarios_mock');
      const lista = json ? JSON.parse(json) : [];
      setUsuarios(lista);
      setVisiveis(new Array(lista.length).fill(false));
    } catch (err) {
      Alert.alert('Erro ao carregar usuários');
    }
  };

  const toggleVisibilidade = (index) => {
    const novos = [...visiveis];
    novos[index] = !novos[index];
    setVisiveis(novos);
  };

  const resetarUsuarios = async () => {
    await AsyncStorage.multiRemove(['@usuarios_mock', '@vouchersGerados', 'contador_vouchers_gerados']);
    setUsuarios([]);
    Alert.alert('Base de usuários mock foi resetada!');
    };

  const obterComparativo = (ponto) => {
    if (ponto <= 150) return 'Menor que 4 gha (EUA)';
    if (ponto <= 400) return 'Entre 4 e 6 gha (França)';
    if (ponto <= 600) return 'Entre 6 e 8 gha (Suécia)';
    if (ponto <= 800) return 'Entre 8 e 10 gha (Brasil)';
    return 'Maior que 10 gha (média mundial)';
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Usuários Mock Cadastrados</Text>

      {usuarios.length === 0 ? (
        <Text style={styles.vazio}>Nenhum usuário cadastrado.</Text>
      ) : (
        usuarios.map((usuario, index) => {
          const historico = Array.isArray(usuario.historicoPegada) ? usuario.historicoPegada : [];
          const ultima = historico.length > 0 ? historico[historico.length - 1] : null;

          return (
            <View key={index} style={styles.card}>
              <Text style={styles.tipo}>{usuario.tipo.toUpperCase()}</Text>
              <Text style={styles.nome}>{usuario.nome || usuario.nomeEmpresa}</Text>
              <TouchableOpacity onPress={() => toggleVisibilidade(index)}>
                <Text style={styles.toggleBotao}>
                  {visiveis[index] ? 'Ocultar detalhes ▲' : 'Ver detalhes ▼'}
                </Text>
              </TouchableOpacity>

              {visiveis[index] && (
                <View style={styles.detalhesBox}>
                  <Text style={styles.info}>CPF/CNPJ: {usuario.cpf || usuario.cnpj}</Text>
                  <Text style={styles.info}>Email: {usuario.email}</Text>
                  <Text style={styles.info}>Senha: {usuario.senha}</Text>

                  {ultima ? (
                    <>
                      <Text style={styles.info}>Pegada recente: {ultima.pontuacao} pontos</Text>
                      <Text style={styles.info}>Data: {new Date(ultima.data).toLocaleDateString('pt-BR')}</Text>
                      <Text style={styles.info}>Comparativo: {obterComparativo(ultima.pontuacao)}</Text>
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

      <TouchableOpacity style={[styles.botao, { backgroundColor: colors.erro }]} onPress={resetarUsuarios}>
        <Text style={styles.botaoTexto}>Resetar Usuários</Text>
      </TouchableOpacity>
    </ScrollView>
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
    color: colors.cinza,
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
});
