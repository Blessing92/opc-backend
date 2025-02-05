import { Request, Response } from "express"
import { GraphQLContext } from "../context"
import { MutationAddCollectionArgs } from "../types/graphql"
import { PrismaClient } from "@prisma/client"
import { collectionResolver } from "../resolvers/collectionResolver"

const prismaClient = new PrismaClient()

const mockedCollections = [
  {
    id: "d502f700-550b-486b-b687-e9fc44a7065f",
    name: "Web development",
    courses: [
      {
        id: "1fe20542-deb8-43e0-a30c-b75866df58bf",
        title: "Advanced GraphQL APIs",
        description: "Master GraphQL, Apollo server",
        duration: "8 weeks",
        outcome: "Build and optimize GraphQL APIs",
        collectionId: "d502f700-550b-486b-b687-e9fc44a7065f",
        createdById: "82298579-f9b8-4965-bcd8-c5215203f54c",
      },
      {
        id: "7a86cda4-18a9-46b7-8eb0-dd120d6cf2a8",
        title: "Advanced",
        description: "Master GraphQL, Apollo server",
        duration: "8 weeks",
        outcome: "Build and optimize GraphQL APIs",
        collectionId: "d502f700-550b-486b-b687-e9fc44a7065f",
        createdById: "82298579-f9b8-4965-bcd8-c5215203f54c",
      },
    ],
  },
  {
    id: "af421cfe-1ca0-470f-8b55-62be92874a3a",
    name: "Test Collection",
    courses: [],
  },
]

jest.mock("../context", () => ({
  ...jest.requireActual("../context"),
  authenticateUser: jest.fn(),
}))

jest.mock("../resolvers/collectionResolver", () => ({
  collectionResolver: {
    Mutation: {
      addCollection: jest.fn((_, { input }) => {
        return { id: "new-collection-id", name: input.name }
      }),
    },
    Query: {
      collections: jest.fn(() => Promise.resolve(mockedCollections)),
      collection: jest.fn((_, { id }) => {
        return (
          mockedCollections.find((collection) => collection.id === id) || null
        )
      }),
    },
  },
}))

describe("collectionResolver", () => {
  beforeAll(async () => {
    await prismaClient.$connect()
  })

  afterAll(async () => {
    await prismaClient.$disconnect()
  })

  describe("Mutation: addCollection", () => {
    it("should create a new collection", async () => {
      const mockRequest = {} as Request
      const mockResponse = {} as Response

      const context: GraphQLContext = {
        req: mockRequest,
        res: mockResponse,
        user: {
          id: 1,
          user: "USER",
          req: mockRequest,
          res: mockResponse,
        },
      }
      const input: MutationAddCollectionArgs["input"] = {
        name: "Test Collection",
      }

      const result = await collectionResolver.Mutation.addCollection(
        null,
        { input },
        context,
      )

      expect(result).toHaveProperty("id")
      expect(result.name).toBe("Test Collection")
    })
  })

  describe("Query: collections", () => {
    it("should retrieve all collections", async () => {
      const result = await collectionResolver.Query.collections()

      expect(result).toHaveLength(mockedCollections.length)
      expect(result[0].name).toBe(mockedCollections[0].name)
    })
  })

  describe("Query: collection", () => {
    it("should retrieve a single collection by id", async () => {
      const testCollection = mockedCollections[1]

      const result = await collectionResolver.Query.collection(null, {
        id: testCollection.id,
      })

      expect(result).not.toBeNull()
      expect(result?.name).toBe(testCollection.name)
    })

    it("should return null if collection not found", async () => {
      const result = await collectionResolver.Query.collection(null, {
        id: "collection-123",
      })

      expect(result).toBeNull()
    })
  })
})
