# Use uma imagem base do Node.js
FROM node:18-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /home/node/app

# Copiar o package.json e package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instale as dependências do aplicativo
RUN npm install

# Copie os arquivos do aplicativo para o contêiner
COPY . .

# Dando acesso ao usuario node
COPY --chown=node:node . .

# Exponha a porta do aplicativo
EXPOSE 8010

# Comando para iniciar o aplicativo
CMD ["npm", "start"]
