
export async function handle(promise) {
  try {
    const { data } = await promise;
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: {
        status: err?.response?.status ?? 0,
        code: err?.code ?? null,
        message:
          err?.response?.data?.message ||
          err?.response?.data?.mensagem ||
          err?.response?.data?.erro ||
          err?.message ||
          'Erro inesperado',
      },
    };
  }
}
