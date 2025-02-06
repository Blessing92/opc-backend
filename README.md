# Backend API

This backend is built with **Node.js**, **Apollo GraphQL**, and **Prisma**. It provides a GraphQL API for querying and managing data efficiently with PostgreSQL.

## Setup Instructions

### 1. Clone the Repository

```sh
git clone https://github.com/Blessing92/opc-backend.git
cd osc-backend
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Set Up Environment Variables

You need to create a `.env` file in the root directory and define the following environment variables:

```sh
DATABASE_URL=<your_postgresql_database_url>
JWT_SECRET=<your_jwt_secret_key>
```

### 4. Set Up PostgreSQL Locally with Docker

You can run a PostgreSQL database locally using Docker with the following command:

```sh
docker run --name postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=database_name -p 5432:5432 -d postgres
```

### 5. Running the Project

You can start the project in development mode with:

```sh
npm run dev
```

Alternatively, to run the project using Docker, build and run the container:

```sh
docker build -t backend-api .
docker run -p 4000:4000 --env-file .env backend-api
```

## API Endpoint

Once the server is running, the GraphQL API is accessible at:

```
http://localhost:4000/graphql
```

## Demo

A live demo of the working GraphQL API can be found at:

[Demo Link](https://www.loom.com/share/69106d5905f34d73a152e0cb167c281f?sid=9a32845a-22ee-4f71-a563-467dee261ea5)

## Performance Optimization

Currently, the backend optimizes performance using:

### 1. **allowBatchedHttpRequests**

Apollo Server provides the `allowBatchedHttpRequests` option, which allows clients to send multiple GraphQL queries in a single HTTP request. This reduces network overhead and improves efficiency when multiple queries need to be executed together.

### 2. **cache: "bounded"**

The `cache: "bounded"` setting in Apollo enables a memory-efficient caching strategy that automatically manages cache entries based on usage patterns, reducing memory consumption and optimizing query performance.

### Future Optimizations

To further improve performance, we could integrate **Redis** or **Memcached**:

- **Redis**: A high-performance in-memory data store that can be used to cache frequently queried GraphQL responses, reducing database load and improving response times.
- **Memcached**: Another in-memory caching system that speeds up data retrieval by temporarily storing query results in memory, reducing repeated database calls.

These caching mechanisms would enhance the efficiency and scalability of the API.

---

For any issues or contributions, feel free to open a pull request or raise an issue!

