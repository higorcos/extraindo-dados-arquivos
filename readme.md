# Arquivos para Geração da Imagem da API

A partir deste repositório é gerado as buids e imagem que vai para produção.
Conectado no Dockerhub como repositório privado

## Como gerar a imagem?

- Segue o passo a passo.

  > O Dockerfile já esta configurado para o node.

  > O arquivo dockerignore necessita de uma atenção.

### Construindo a imagem

> Caso não esteja logado

```sh
   docker login
```

> Navegue até a raiz do seu projeto onde o Dockerfile está localizado e execute o seguinte comando para construir a imagem Docker:

```sh
  docker build -t workcenterma/folha-de-pagamento:latest .
```

> Depois de construir a imagem e fazer login, empurre a imagem para o Docker Hub com o comando:

```sh
  docker push workcenterma/folha-de-pagamento:latest
```

## Como Utilizar a imagem

- Para rodar o container com variáveis de ambiente, você pode usar o comando docker run e passar as variáveis de ambiente da seguinte forma:

  > utilize as variaveis de ambiente corretamente

```sh
docker run -d -p 3000:3000 --name mynodeapp -e NODE_ENV=production -e PORT=3000 workcenterma/folha-de-pagamento
```

- Outra opção para gerenciar variáveis de ambiente e simplificar o processo de execução é usar o Docker Compose. Crie um arquivo docker-compose.yml com o seguinte conteúdo:

```yml
version: "3"
services:
  node-api:
    image: workcenterma/folha-de-pagamento
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
```

- Então, você pode construir e rodar sua aplicação usando o Docker Compose com os comandos:

```sh
docker-compose build
```

```sh
docker-compose up -d
```
