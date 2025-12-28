// config.js
// Configuração da BASE_URL para uso em toda a aplicação Node.js

// Para ambiente local:
// const BASE_URL = "http://localhost:3000";

// Para ambiente de produção (servidor):
// const BASE_URL = "https://api.bitrix.com";

const BASE_URL = process.env.API_ENV === 'producao'
  ? "https://api.bitrix.com"
  : "http://localhosgt:3000";

module.exports = {
  BASE_URL
};
