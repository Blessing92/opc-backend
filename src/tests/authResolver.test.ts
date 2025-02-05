import { authResolver } from "../resolvers/authResolver"
import prisma from "../config/prisma"
import bcrypt from "bcrypt"
import { GraphQLError } from "graphql/error"

jest.mock("bcrypt")
jest.mock("../config/prisma", () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}))

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mocked_jwt_token"),
}))

describe("authResolver", () => {
  const mockUser = {
    id: 1,
    username: "testuser",
    password: "hashedpassword",
    role: "USER",
  }

  const mockToken = "mocked_jwt_token"

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("register", () => {
    it("should create a new user and return a token and user", async () => {
      const input = { username: "testuser", password: "password123" }

      prisma.user.findUnique = jest.fn().mockResolvedValue(null)
      bcrypt.hash = jest.fn().mockResolvedValue("hashedpassword")
      prisma.user.create = jest.fn().mockResolvedValue(mockUser)

      const result = await authResolver.Mutation.register(null, { input })

      expect(result.token).toBe(mockToken)
      expect(result.user).toEqual(mockUser)
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            username: input.username,
            password: "hashedpassword",
          }),
        }),
      )
    })

    it("should throw an error if user already exists", async () => {
      const input = { username: "testuser", password: "password123" }
      prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser)

      await expect(
        authResolver.Mutation.register(null, { input }),
      ).rejects.toThrow(new GraphQLError("User already exists"))
    })
  })

  describe("login", () => {
    it("should return a token and user for valid credentials", async () => {
      const input = { username: "testuser", password: "password123" }
      prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser)
      bcrypt.compare = jest.fn().mockResolvedValue(true)

      const result = await authResolver.Mutation.login(null, { input })

      expect(result.token).toBe(mockToken)
      expect(result.user).toEqual(mockUser)
    })

    it("should throw an error for invalid credentials", async () => {
      const input = { username: "testuser", password: "wrongpassword" }
      prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser)
      bcrypt.compare = jest.fn().mockResolvedValue(false)

      await expect(
        authResolver.Mutation.login(null, { input }),
      ).rejects.toThrow(new GraphQLError("Invalid credentials"))
    })

    it("should throw an error if user is not found", async () => {
      const input = { username: "nonexistentuser", password: "password123" }
      prisma.user.findUnique = jest.fn().mockResolvedValue(null)

      await expect(
        authResolver.Mutation.login(null, { input }),
      ).rejects.toThrow(new GraphQLError("Invalid credentials"))
    })
  })
})
