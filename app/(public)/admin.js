import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import api from '../../services/apiMock';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';
import { obterComparativoPegada, formatarDataBR } from '../../utils/formatadores';

export default function AdminDevScreen() {
  const [usuarios, setUsuarios] = useState([]);
  const [visiveis, setVisiveis] = useState([]);

 const carregarUsuarios = async () => {
  try {
    const lista = await api.obterUsuarios();
    setUsuarios(lista);
    setVisiveis(new Array(lista.length).fill(false));
  } catch (err) {
    Alert.alert('Erro ao carregar usuários');
  }
};

const aprovarPJ = async (cnpj) => {
  try {
    await api.aprovarCadastroPJ(cnpj);
    Alert.alert('Sucesso', 'Cadastro aprovado com sucesso!');
    carregarUsuarios(); // recarrega lista atualizada
  } catch (err) {
    Alert.alert('Erro ao aprovar cadastro', err.message);
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

  useEffect(() => {
    carregarUsuarios();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ width: '100%', maxWidth: 600 }}>
        <Text style={styles.titulo}>Usuários Mock Cadastrados</Text>

        {usuarios.length === 0 ? (
          <Text style={styles.vazio}>Nenhum usuário cadastrado.</Text>
        ) : (
         usuarios.map((usuario, index) => {
  const historico = Array.isArray(usuario.historicoPegada) ? usuario.historicoPegada : [];
  const ultima = historico.length > 0 ? historico[historico.length - 1] : null;

  return (
    <View key={index} style={styles.card}>
      <Text style={[styles.tipo, { color: usuario.tipo === 'pf' ? colors.azul : colors.laranja }]}>
        {usuario.tipo.toUpperCase()}
      </Text>
      <Text style={styles.nome}>{usuario.nome || usuario.nomeEmpresa}</Text>

      {/* ✅ AQUI DENTRO do card: */}
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

        <TouchableOpacity style={[styles.botao, { backgroundColor: colors.erro }]} onPress={resetarUsuarios}>
          <Text style={styles.botaoTexto}>Resetar Usuários</Text>
        </TouchableOpacity>
      </View>
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
