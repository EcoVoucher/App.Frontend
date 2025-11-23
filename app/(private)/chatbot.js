// app/chatbot.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';

// ========================================
// SERVIÇO DE API DO CHATBOT
// ========================================
class ChatBotService {
  // URL da sua API - ALTERE AQUI quando tiver o microserviço pronto
  static API_URLCHAT = null; // null = desabilitado (modo offline)
  // Quando tiver o microserviço: static API_URLCHAT = 'https://sua-api.com/api/chatbot';
  
  // Flag para habilitar/desabilitar chamada à API
  static API_HABILITADA = false; // true quando o microserviço estiver pronto

  /**
   * Envia mensagem para a API e retorna resposta
   * @param {string} mensagem - Mensagem do usuário
   * @param {string} tipoUsuario - 'pf' ou 'pj'
   * @param {string} usuarioId - ID do usuário
   * @returns {Promise<string>} - Resposta do bot
   */
  static async enviarMensagem(mensagem, tipoUsuario = 'pf', usuarioId = null) {
    // ⚠️ MODO OFFLINE: Enquanto o microserviço não estiver pronto
    if (!this.API_HABILITADA || !this.API_URLCHAT) {
      console.log('📴 Chatbot rodando em modo offline (respostas locais)');
      return this.obterRespostaLocal(mensagem, tipoUsuario);
    }

    // 🌐 MODO ONLINE: Quando o microserviço estiver disponível
    try {
      // Busca o token do AsyncStorage
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.warn('⚠️ Token não encontrado, usando modo offline');
        return this.obterRespostaLocal(mensagem, tipoUsuario);
      }

      console.log('🌐 Enviando mensagem para API do chatbot...');
      
      const response = await fetch(this.API_URLCHAT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Token de autenticação
        },
        body: JSON.stringify({
          mensagem: mensagem,
          tipoUsuario: tipoUsuario,
          usuarioId: usuarioId,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      
      // Espera que a API retorne: { resposta: "texto da resposta" }
      return data.resposta || 'Desculpe, não consegui processar sua mensagem.';
      
    } catch (error) {
      console.error('❌ Erro ao comunicar com API do chatbot:', error);
      console.log('📴 Voltando para modo offline...');
      
      // Se a API falhar, usa respostas locais como fallback
      return this.obterRespostaLocal(mensagem, tipoUsuario);
    }
  }

  /**
   * Respostas locais de fallback (quando API não está disponível)
   */
  static obterRespostaLocal(mensagem, tipoUsuario) {
    const textoLower = mensagem.toLowerCase();

    // Respostas para PF
    if (tipoUsuario === 'pf') {
      if (textoLower.includes('pontos')) {
        return 'Seus pontos são acumulados cada vez que você atualiza sua pegada ecológica! Acesse "Histórico de Pontos" para ver mais detalhes. 💚';
      }
      if (textoLower.includes('voucher')) {
        return 'Você pode trocar seus pontos por vouchers no "Catálogo de Vouchers". Veja as ofertas disponíveis! 🎁';
      }
      if (textoLower.includes('pegada') || textoLower.includes('ecológica')) {
        return 'A pegada ecológica mede seu impacto ambiental. Atualize regularmente em "Atualizar Pegada" para ganhar pontos! 🌿';
      }
      if (textoLower.includes('coleta')) {
        return 'Encontre pontos de coleta próximos em "Pontos de Coleta". Descarte corretamente e ganhe recompensas! ♻️';
      }
      if (textoLower.includes('como funciona')) {
        return 'O EcoVoucher funciona assim: você atualiza sua pegada ecológica, ganha pontos e troca por vouchers de parceiros! É simples e sustentável. 🌱';
      }
    }

    // Respostas para PJ
    if (tipoUsuario === 'pj') {
      if (textoLower.includes('gerar') || textoLower.includes('criar')) {
        return 'Para gerar vouchers, acesse "Gerar Voucher" no menu. Você pode definir valor, quantidade e tipo de recompensa! 🎫';
      }
      if (textoLower.includes('validar')) {
        return 'Para validar vouchers dos clientes, vá em "Validar Voucher" e escaneie o QR Code. Simples e rápido! ✅';
      }
      if (textoLower.includes('relatório') || textoLower.includes('estatística')) {
        return 'Confira as estatísticas dos seus vouchers no painel principal. Você verá quantos foram gerados e utilizados! 📊';
      }
      if (textoLower.includes('parceria') || textoLower.includes('como funciona')) {
        return 'Como parceiro EcoVoucher, você oferece vouchers que pessoas físicas trocam por pontos ecológicos. Todos ganham! 🤝';
      }
    }

    // Resposta padrão
    return 'Entendi! Posso ajudar com informações sobre o EcoVoucher. Como posso auxiliar você? 😊';
  }
}

// ========================================
// COMPONENTE PRINCIPAL DO CHATBOT
// ========================================
export default function ChatBot() {
  const { usuario } = useAuth();
  const [mensagens, setMensagens] = useState([
    {
      id: 1,
      texto: `Olá${usuario?.nome ? ', ' + usuario.nome.split(' ')[0] : ''}! Sou o assistente EcoVoucher 🌱 Como posso ajudar você hoje?`,
      remetente: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputTexto, setInputTexto] = useState('');
  const [carregando, setCarregando] = useState(false);
  const scrollViewRef = useRef(null);

  // Auto-scroll para última mensagem
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [mensagens]);

  /**
   * Envia mensagem do usuário e recebe resposta do bot
   */
  const enviarMensagem = async () => {
    if (!inputTexto.trim() || carregando) return;

    const textoMensagem = inputTexto.trim();
    setInputTexto('');

    // Adiciona mensagem do usuário
    const novaMensagem = {
      id: Date.now(),
      texto: textoMensagem,
      remetente: 'usuario',
      timestamp: new Date(),
    };

    setMensagens((prev) => [...prev, novaMensagem]);
    setCarregando(true);

    try {
      // Chama API para obter resposta
      const respostaTexto = await ChatBotService.enviarMensagem(
        textoMensagem,
        usuario?.tipo || 'pf',
        usuario?.cpf || usuario?.cnpj
      );

      // Adiciona resposta do bot
      const respostaBot = {
        id: Date.now() + 1,
        texto: respostaTexto,
        remetente: 'bot',
        timestamp: new Date(),
      };

      setMensagens((prev) => [...prev, respostaBot]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Mensagem de erro para o usuário
      const mensagemErro = {
        id: Date.now() + 1,
        texto: 'Ops! Tive um problema ao processar sua mensagem. Tente novamente. 🔄',
        remetente: 'bot',
        timestamp: new Date(),
      };
      
      setMensagens((prev) => [...prev, mensagemErro]);
    } finally {
      setCarregando(false);
    }
  };

  /**
   * Formata timestamp para exibição
   */
  const formatarHora = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarBot}>
          <MaterialCommunityIcons name="robot" size={24} color={colors.verde} />
        </View>
        <View style={styles.headerTexto}>
          <Text style={styles.headerTitulo}>Assistente EcoVoucher</Text>
          <Text style={styles.headerSubtitulo}>
            {carregando ? 'Digitando...' : 'Online'}
          </Text>
        </View>
      </View>

      {/* Área de mensagens */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {mensagens.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.mensagemContainer,
              msg.remetente === 'usuario' && styles.mensagemUsuarioContainer,
            ]}
          >
            {msg.remetente === 'bot' && (
              <View style={styles.avatarBotPequeno}>
                <MaterialCommunityIcons name="robot" size={16} color={colors.verde} />
              </View>
            )}

            <View
              style={[
                styles.bolhaMensagem,
                msg.remetente === 'usuario' ? styles.bolhaUsuario : styles.bolhaBot,
              ]}
            >
              <Text
                style={[
                  styles.mensagemTexto,
                  msg.remetente === 'usuario' && styles.mensagemTextoUsuario,
                ]}
              >
                {msg.texto}
              </Text>
              <Text
                style={[
                  styles.mensagemHora,
                  msg.remetente === 'usuario' && styles.mensagemHoraUsuario,
                ]}
              >
                {formatarHora(msg.timestamp)}
              </Text>
            </View>

            {msg.remetente === 'usuario' && (
              <View style={styles.avatarUsuario}>
                <FontAwesome name="user" size={16} color={colors.branco} />
              </View>
            )}
          </View>
        ))}

        {/* Indicador de digitação */}
        {carregando && (
          <View style={styles.mensagemContainer}>
            <View style={styles.avatarBotPequeno}>
              <MaterialCommunityIcons name="robot" size={16} color={colors.verde} />
            </View>
            <View style={styles.bolhaBot}>
              <ActivityIndicator size="small" color={colors.verde} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input área */}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={inputTexto}
          onChangeText={setInputTexto}
          placeholder="Digite sua mensagem..."
          placeholderTextColor={colors.cinza}
          multiline
          maxLength={500}
          editable={!carregando}
          onSubmitEditing={enviarMensagem}
        />
        <TouchableOpacity
          style={[
            styles.botaoEnviar,
            (!inputTexto.trim() || carregando) && styles.botaoEnviarDesabilitado,
          ]}
          onPress={enviarMensagem}
          disabled={!inputTexto.trim() || carregando}
        >
          {carregando ? (
            <ActivityIndicator size="small" color={colors.branco} />
          ) : (
            <FontAwesome name="send" size={18} color={colors.branco} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ========================================
// ESTILOS
// ========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.branco,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.branco,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borda,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  avatarBot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.verdeClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerTexto: {
    flex: 1,
  },
  headerTitulo: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
  },
  headerSubtitulo: {
    fontSize: fonts.size.xs,
    color: colors.cinza,
    marginTop: 2,
  },
  chatArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  mensagemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  mensagemUsuarioContainer: {
    justifyContent: 'flex-end',
  },
  avatarBotPequeno: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.verdeClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  avatarUsuario: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.verde,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  bolhaMensagem: {
    maxWidth: '70%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bolhaBot: {
    backgroundColor: colors.verdeClaro,
    borderBottomLeftRadius: 4,
  },
  bolhaUsuario: {
    backgroundColor: colors.verde,
    borderBottomRightRadius: 4,
  },
  mensagemTexto: {
    fontSize: fonts.size.md,
    color: colors.verde,
    lineHeight: 20,
  },
  mensagemTextoUsuario: {
    color: colors.branco,
  },
  mensagemHora: {
    fontSize: fonts.size.xs,
    color: colors.cinza,
    marginTop: spacing.xs,
  },
  mensagemHoraUsuario: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.branco,
    borderTopWidth: 1,
    borderTopColor: colors.borda,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fonts.size.md,
    color: colors.verde,
    maxHeight: 100,
    marginRight: spacing.sm,
  },
  botaoEnviar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.verde,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: colors.verde,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  botaoEnviarDesabilitado: {
    opacity: 0.5,
  },
});