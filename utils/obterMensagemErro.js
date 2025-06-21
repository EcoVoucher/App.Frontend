
export function obterMensagemErro(error, mensagemPadrao = 'Erro inesperado.') {
  return (
    error?.response?.data?.message ||  
    error?.response?.data?.mensagem ||  
    error?.response?.data?.erro ||       
    error?.message ||                    
    mensagemPadrao                      
  );
}
