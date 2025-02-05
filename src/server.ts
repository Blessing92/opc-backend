import express from "express"
import * as http from "http"
import cors from "cors"
import bodyParser from "body-parser"
import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"
import { typeDefs } from "./schema"
import { resolvers } from "./resolvers"

import { GraphQLContext } from "./context"

const app = express()
const httpServer = http.createServer(app)

const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
})

const startServer = async () => {
  await server.start()

  app.use(
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req, res }): Promise<GraphQLContext> => ({ req, res }),
    }),
  )

  const PORT = process.env.PORT || 4000
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve),
  )
  console.log(`Server running at http://localhost:${PORT}}`)
}

startServer().catch((error) => {
  console.error("Error starting server", error)
})
