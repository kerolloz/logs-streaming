# CRUD Sample App

This repository is a template for a CRUD sample application. It provides a starting point for building similar applications.

## Overview

- Backend: Bun & Fastify
- Database: MongoDB
- Caching: Redis

The application allows users to perform basic CRUD operations on a collection of items. It utilizes Swagger for documenting the API endpoints.

## Development Setup

To set up the development environment for the CRUD Sample App, follow these steps:

1. Clone the repository: `git clone https://github.com/kerolloz/bun-fastify-template`
1. Navigate to the project directory: `cd bun-fastify-template`
1. Install the dependencies: `bun i`
1. Copy _.env.example_ to _.env_ and update the environment variables as needed. `cp .env.example .env`
1. Start the development server: `bun dev`

You can make use of Docker Compose to run Mongodb and Redis locally.

```sh
docker compose up -d # docker-compose.yml has the necessary config to run MongoDB and Redis.
```

Alternatively, you can run the following commands to run MongoDB and Redis using Docker:

```sh
docker run -d -p 27017:27017 mongo
docker run -d -p 6379:6379 redis:alpine
```

Depending on your specific environment and deployment setup, please note that additional configuration may be required.

## Build

The build process only checks the TypeScript code for errors. To build the application, run the following command:

```sh
bun run build
```
