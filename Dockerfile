# Dockerfile para Node.js API em produção (Ubuntu/Docker)
FROM node:22

# Ajuste timezone para America/Sao_Paulo (ou UTC se preferir)
ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Diretório de trabalho
WORKDIR /app

# Copie apenas package.json e package-lock.json para instalar dependências primeiro (cache)
COPY package*.json ./
RUN npm install --production

# Copie o restante do código
COPY . .

# Exponha a porta da API
EXPOSE 3001

# Permita sobrescrever variáveis de ambiente no docker run
ENV API_ENV=producao
ENV PORT=3001

# Comando para iniciar a API
CMD ["npm", "start"]
