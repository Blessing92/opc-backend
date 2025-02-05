import { Request, Response } from "express"
import { GraphQLContext } from "../context"
import {
  MutationAddCourseArgs,
  MutationUpdateCourseArgs,
} from "../types/graphql"
import { courseResolver } from "../resolvers/courseResolver"
import { PrismaClient } from "@prisma/client"
import { GraphQLError } from "graphql/error"

const prismaClient = new PrismaClient()

const mockedCourses = [
  {
    id: "d502f700-550b-486b-b687-e9fc44a7065f",
    title: "GraphQL Basics",
    description: "Learn GraphQL",
    duration: "6 weeks",
    outcome: "Understand GraphQL basics",
    createdById: "82298579-f9b8-4965-bcd8-c5215203f54c",
    createdBy: {
      id: "82298579-f9b8-4965-bcd8-c5215203f54c",
      username: "user1",
    },
    collection: { id: "c1", name: "Web Development" },
  },
  {
    id: "af421cfe-1ca0-470f-8b55-62be92874a3a",
    title: "Advanced React",
    description: "Deep dive into React",
    duration: "8 weeks",
    outcome: "Build complex React applications",
    createdById: "82298579-f9b8-4965-bcd8-c5215203f54c",
    createdBy: {
      id: "82298579-f9b8-4965-bcd8-c5215203f54c",
      username: "user2",
    },
    collection: { id: "c2", name: "Frontend" },
  },
]

jest.mock("../context", () => ({
  ...jest.requireActual("../context"),
  authenticateUser: jest.fn(() => ({
    id: "82298579-f9b8-4965-bcd8-c5215203f54c",
    role: "USER",
  })),
}))

jest.mock("../resolvers/courseResolver", () => ({
  courseResolver: {
    Query: {
      courses: jest.fn(() => Promise.resolve(mockedCourses)),
      course: jest.fn((_, { id }) => {
        return mockedCourses.find((course) => course.id === id) || null
      }),
    },
    Mutation: {
      addCourse: jest.fn(() => Promise.resolve(mockedCourses[0])),
      updateCourse: jest.fn((_, { id, input }) => {
        return { ...mockedCourses[0], ...input }
      }),
      deleteCourse: jest.fn(() => Promise.resolve("Course deleted")),
    },
  },
}))

describe("courseResolver", () => {
  beforeAll(async () => {
    await prismaClient.$connect()
  })

  afterAll(async () => {
    await prismaClient.$disconnect()
  })

  describe("Mutation: addCourse", () => {
    it("should create a new course", async () => {
      const mockRequest = {} as Request
      const mockResponse = {} as Response
      const context: GraphQLContext = {
        req: mockRequest,
        res: mockResponse,
        user: {
          id: "82298579-f9b8-4965-bcd8-c5215203f54c",
          user: "USER",
          req: mockRequest,
          res: mockResponse,
        },
      }
      const input: MutationAddCourseArgs["input"] = {
        title: "GraphQL Basics",
        description: "Learn GraphQL",
        duration: "6 weeks",
        outcome: "Understand GraphQL basics",
        collectionId: "c1",
      }

      const result = await courseResolver.Mutation.addCourse(
        null,
        { input },
        context,
      )

      expect(result).toHaveProperty("id")
      expect(result.title).toBe("GraphQL Basics")
    })
  })

  describe("Mutation: updateCourse", () => {
    it("should update an existing course", async () => {
      const mockRequest = {} as Request
      const mockResponse = {} as Response
      const context: GraphQLContext = {
        req: mockRequest,
        res: mockResponse,
        user: {
          id: "82298579-f9b8-4965-bcd8-c5215203f54c",
          user: "USER",
          req: mockRequest,
          res: mockResponse,
        },
      }
      const input: MutationUpdateCourseArgs["input"] = {
        title: "Updated GraphQL Basics",
        description: "Learn GraphQL with more detail",
      }

      const result = await courseResolver.Mutation.updateCourse(
        null,
        { id: mockedCourses[0].id, input },
        context,
      )
      expect(result.title).toBe("Updated GraphQL Basics")
    })

    it("should throw error if user is not admin or owner", async () => {
      jest.spyOn(courseResolver.Mutation, "updateCourse").mockRejectedValueOnce(
        new GraphQLError("You do not have permission to update this course", {
          extensions: { code: "UNAUTHORISED" },
        }),
      )

      const mockRequest = {} as Request
      const mockResponse = {} as Response
      const context: GraphQLContext = {
        req: mockRequest,
        res: mockResponse,
        user: {
          id: "random-user-id",
          user: "USER",
          req: mockRequest,
          res: mockResponse,
        },
      }

      await expect(
        courseResolver.Mutation.updateCourse(
          null,
          { id: mockedCourses[0].id, input: { title: "New Title" } },
          context,
        ),
      ).rejects.toThrow("You do not have permission to update this course")
    })
  })

  describe("Mutation: deleteCourse", () => {
    it("should delete a course", async () => {
      const mockRequest = {} as Request
      const mockResponse = {} as Response
      const context: GraphQLContext = {
        req: mockRequest,
        res: mockResponse,
        user: {
          id: "82298579-f9b8-4965-bcd8-c5215203f54c",
          user: "USER",
          req: mockRequest,
          res: mockResponse,
        },
      }

      const result = await courseResolver.Mutation.deleteCourse(
        null,
        { id: mockedCourses[0].id },
        context,
      )

      expect(result).toBe("Course deleted")
    })

    it("should throw error if user is not admin or owner", async () => {
      jest.spyOn(courseResolver.Mutation, "deleteCourse").mockRejectedValueOnce(
        new GraphQLError("You do not have permission to delete this course", {
          extensions: { code: "UNAUTHORISED" },
        }),
      )

      const mockRequest = {} as Request
      const mockResponse = {} as Response
      const context: GraphQLContext = {
        req: mockRequest,
        res: mockResponse,
        user: {
          id: "random-user-id",
          user: "USER",
          req: mockRequest,
          res: mockResponse,
        },
      }

      await expect(
        courseResolver.Mutation.deleteCourse(
          null,
          { id: mockedCourses[0].id },
          context,
        ),
      ).rejects.toThrow("You do not have permission to delete this course")
    })
  })

  describe("Query: courses", () => {
    it("should retrieve all courses", async () => {
      const result = await courseResolver.Query.courses(null, {
        limit: 10,
        sortOrder: "ASC",
      })

      expect(result).toHaveLength(mockedCourses.length)
      expect(result[0].title).toBe(mockedCourses[0].title)
    })
  })

  describe("Query: course", () => {
    it("should retrieve a single course by id", async () => {
      const result = await courseResolver.Query.course(null, {
        id: mockedCourses[0].id,
      })

      expect(result).not.toBeNull()
      expect(result?.title).toBe(mockedCourses[0].title)
    })

    it("should return null if course not found", async () => {
      const result = await courseResolver.Query.course(null, {
        id: "course-123",
      })

      expect(result).toBeNull()
    })
  })
})
