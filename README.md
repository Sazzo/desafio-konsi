# Desafio Técnico Konsi

Projeto para o desafio técnico backend da Konsi. A stack utilizada foi Node, TypeScript, Nest.js.

## Setup do ambiente de desenvolvimento

Para rodar a aplicação, é necessário ter o Docker e Docker Compose instalados.

1. Preencher as variaveis de ambiente

O arquivo `.env.example` deve ser copiado e renomeado para `.env` na raiz do projeto. De forma que o contéudo esteja dessa forma, apenas preenchendo os campos vazios:

```env
PORT=3001

KONSI_INSS_API_URL=
KONSI_INSS_API_AUTH_USERNAME=
KONSI_INSS_API_AUTH_PASSWORD=

REDIS_HOST=redis
REDIS_PORT=6379

ELASTICSEARCH_HOST=elasticsearch
ELASTICSEARCH_PORT=9200
ELASTICSEARCH_AUTH_USERNAME=elastic
ELASTICSEARCH_AUTH_PASSWORD=default-elasticsearch-password

RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_AUTH_USERNAME=default-rabbitmq-user
RABBITMQ_AUTH_PASSWORD=default-rabbitmq-password

## Web client/interface

VITE_BENEFITS_API_URL=http://localhost:3001
```

2. Iniciar a aplicação

Após preencher as variáveis de ambiente, inicie o container da aplicação e de suas dependências com

```
$ docker compose up -d
```

Após todos os containers iniciarem, a interface web da aplicação deve estar disponível em `http://localhost:3000` e a API em `https://localhost:3001`.

## Documentação da API

Você pode acessar a interface Swagger em `http://localhost:3001/docs`. O documento da especificação OpenAPI também está disponível em `http://localhost:3001/docs-json`

## Estrutura e Testes

O projeto segue a seguinte estrutura:

- `src/` - Código fonte principal do projeto
  - `src/modules` - Módulos da aplicação, que representam recursos/funcionalidades. Cada módulo pode possuir seu controller, seus DTOs, testes e etc.
  - `src/shared` - Código reutilizavel da aplicação, como constantes e integrações (RabbitMQ, Elasticsearch, Redis, etc).

A aplicação possui **100%** de cobertura de testes unitários, e cada módulo possui testes de integração feitos para testar as funcionalidades end-to-end através de Testcontainers.

## Continuous Integration (CI)

Todo commit feito no repositório chama uma Github Action que roda os testes unitários e de integração, e após o sucesso deles, realiza o build da imagem do Docker e publica no registro de pacotes do Github. Essa imagem é, então, usada no Docker Compose do ambiente de desenvolvimento.

O código dessa pipeline está presente em `.github/workflows`.
