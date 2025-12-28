# Dockerfile para Node.js API
# Use a imagem oficial do Node.js
FROM node:22

# Crie diretório de trabalho
WORKDIR /app

# Copie os arquivos do projeto
COPY . .

# Instale as dependências
RUN npm install --production

# Exponha a porta (ajuste conforme necessário)
EXPOSE 3001

# Defina variável de ambiente para produção
ENV API_ENV=producao

# Comando para iniciar a API
CMD ["npm", "start"]
