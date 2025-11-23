// services/pontoColetaService.js

/**
 * Calcula a distância entre duas coordenadas usando a fórmula de Haversine
 * @param {number} lat1 - Latitude do ponto 1
 * @param {number} lon1 - Longitude do ponto 1
 * @param {number} lat2 - Latitude do ponto 2
 * @param {number} lon2 - Longitude do ponto 2
 * @returns {number} Distância em quilômetros
 */
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Busca coordenadas de um CEP usando ViaCEP
 * @param {string} cep - CEP sem formatação (somente números)
 * @returns {Promise<Object>} Objeto com lat, lon, endereco
 */
async function buscarCoordenadas(cep) {
  const cepLimpo = cep.replace(/\D/g, '');
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const dados = await response.json();

    if (dados.erro) {
      throw new Error('CEP não encontrado');
    }

    // ViaCEP não retorna coordenadas, então usamos Google Geocoding API
    // Ou podemos usar coordenadas aproximadas por cidade (solução mais simples)
    
    // OPÇÃO 1: Usar Google Geocoding (requer API Key)
    // const enderecoCompleto = `${dados.logradouro}, ${dados.bairro}, ${dados.localidade}, ${dados.uf}`;
    // const geoResponse = await fetch(
    //   `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(enderecoCompleto)}&key=SUA_API_KEY`
    // );
    // const geoData = await geoResponse.json();
    // const location = geoData.results[0].geometry.location;

    // OPÇÃO 2: Coordenadas aproximadas por cidade (gratuito)
    const coordenadasCidades = {
      'Votorantim': { lat: -23.5475, lon: -47.4378 },
      'Sorocaba': { lat: -23.5015, lon: -47.4526 },
      'São Paulo': { lat: -23.5505, lon: -46.6333 },
      // Adicione mais cidades conforme necessário
    };

    const coords = coordenadasCidades[dados.localidade] || { lat: -23.5475, lon: -47.4378 };

    return {
      lat: coords.lat,
      lon: coords.lon,
      endereco: `${dados.logradouro}, ${dados.bairro}, ${dados.localidade} - ${dados.uf}, ${dados.cep}`,
      cidade: dados.localidade,
      uf: dados.uf
    };
  } catch (error) {
    throw new Error('Erro ao buscar CEP: ' + error.message);
  }
}

/**
 * Pontos de coleta cadastrados (banco de dados mockado)
 * Em produção, isso viria da sua API
 */
const pontosColetaCadastrados = [
  {
    id: 1,
    nome: 'Ponto Verde Central',
    endereco: 'Rua das Flores, 123 - Centro, Votorantim - SP, 18115-030',
    lat: -23.5475,
    lon: -47.4378,
    observacao: 'Aceita plástico, papel e metal',
  },
  {
    id: 2,
    nome: 'Eco Ponto Norte',
    endereco: 'Av. Brasil, 789 - Norte, Votorantim - SP, 18115-050',
    lat: -23.5375,
    lon: -47.4278,
    observacao: 'Somente vidro',
  },
  {
    id: 3,
    nome: 'Recicla Fácil',
    endereco: 'Rua do Meio, 456 - Sul, Votorantim - SP, 18115-070',
    lat: -23.5575,
    lon: -47.4478,
    observacao: 'Aceita todos os tipos de recicláveis',
  },
  {
    id: 4,
    nome: 'Ponto Eco Sorocaba',
    endereco: 'Av. Independência, 1000 - Centro, Sorocaba - SP, 18010-000',
    lat: -23.5015,
    lon: -47.4526,
    observacao: 'Ponto 24 horas',
  },
];

/**
 * Busca pontos de coleta próximos ao CEP informado
 * @param {string} cep - CEP a ser buscado
 * @param {number} raioKm - Raio de busca em km (padrão: 10km)
 * @returns {Promise<Array>} Array de pontos de coleta ordenados por distância
 */
export async function buscarPontosPorCep(cep, raioKm = 10) {
  try {
    // 1. Buscar coordenadas do CEP informado
    const origem = await buscarCoordenadas(cep);

    // 2. Calcular distância para cada ponto de coleta
    const pontosComDistancia = pontosColetaCadastrados.map(ponto => ({
      ...ponto,
      distancia: parseFloat(
        calcularDistancia(origem.lat, origem.lon, ponto.lat, ponto.lon).toFixed(1)
      ),
    }));

    // 3. Filtrar apenas pontos dentro do raio especificado
    const pontosFiltrados = pontosComDistancia.filter(
      ponto => ponto.distancia <= raioKm
    );

    // 4. Ordenar por distância (mais próximo primeiro)
    pontosFiltrados.sort((a, b) => a.distancia - b.distancia);

    return pontosFiltrados;
  } catch (error) {
    throw new Error('Erro ao buscar pontos de coleta: ' + error.message);
  }
}

/**
 * Quando integrar com sua API real, use esta função:
 */
export async function buscarPontosPorCepAPI(cep) {
  try {
    const response = await fetch(`https://sua-api.com/pontos-coleta?cep=${cep}`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar pontos de coleta');
    }
    
    const dados = await response.json();
    return dados;
  } catch (error) {
    throw new Error('Erro na API: ' + error.message);
  }
}

export const PontoColetaService = {
  buscarPontosPorCep,
  buscarPontosPorCepAPI,
};