// config.js
// Configuração da BASE_URL para uso em toda a aplicação Node.js

// Para ambiente local:
// const BASE_URL = "http://localhost:3001";

// Para ambiente de produção (servidor):
// const BASE_URL = "https://api.back.com";

const BASE_URL = process.env.API_ENV === 'producao'
  ? "https://api.back.com"
  : "http://localhost:3001";

module.exports = {
  BASE_URL
};
