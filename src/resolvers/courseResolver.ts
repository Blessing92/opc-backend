import prisma from "../config/prisma"
import { Course } from ".prisma/client"
import { authenticateUser, GraphQLContext } from "../context"
import {
  QueryCoursesArgs,
  QueryCourseArgs,
  MutationAddCourseArgs,
  MutationUpdateCourseArgs,
  MutationDeleteCourseArgs,
} from "../types/graphql"
import { GraphQLError } from "graphql/error"

const isAdmin = (userRole: string): boolean => userRole === "ADMIN"

const checkOwnershipOrAdmin = (
  userRole: string,
  currentUserId: string,
  resourceUserId: string,
): boolean => {
  if (isAdmin(userRole)) return true
  if (currentUserId === resourceUserId) return true
  throw new GraphQLError("You do not have permission to perform this action", {
    extensions: { code: "UNAUTHORISED" },
  })
}

export const courseResolver = {
  Query: {
    courses: async (
      _: unknown,
      { limit, sortOrder }: QueryCoursesArgs,
    ): Promise<Course[]> => {
      const courses = await prisma.course.findMany({
        take: limit,
        orderBy: { title: sortOrder === "ASC" ? "asc" : "desc" },
        include: { createdBy: true, collection: true },
      })

      if (!courses) {
        throw new GraphQLError("Failed to fetch courses", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        })
      }

      return courses
    },

    course: async (
      _: unknown,
      { id }: QueryCourseArgs,
    ): Promise<Course | null> => {
      const course = await prisma.course.findUnique({
        where: { id },
        include: { createdBy: true, collection: true },
      })

      if (!course) {
        return null
      }

      return course
    },
  },

  Mutation: {
    addCourse: async (
      _: unknown,
      { input }: MutationAddCourseArgs,
      context: GraphQLContext,
    ): Promise<Course> => {
      const user = authenticateUser(context)

      const course = await prisma.course.create({
        data: { ...input, createdById: user.id },
        include: { createdBy: true, collection: true },
      })

      return course
    },

    updateCourse: async (
      _: unknown,
      { id, input }: MutationUpdateCourseArgs,
      context: GraphQLContext,
    ): Promise<Course> => {
      const user = authenticateUser(context)

      const course = await prisma.course.findUnique({ where: { id } })
      if (!course) {
        throw new GraphQLError("Course not found", {
          extensions: { code: "NOT_FOUND" },
        })
      }

      checkOwnershipOrAdmin(user.role, user.id, course.createdById)

      const updatedCourse = await prisma.course.update({
        where: { id },
        data: input,
        include: { createdBy: true, collection: true },
      })

      return updatedCourse
    },

    deleteCourse: async (
      _: unknown,
      { id }: MutationDeleteCourseArgs,
      context: GraphQLContext,
    ): Promise<string> => {
      const user = authenticateUser(context)

      const course = await prisma.course.findUnique({ where: { id } })
      if (!course) {
        throw new GraphQLError("Course not found", {
          extensions: { code: "NOT_FOUND" },
        })
      }

      checkOwnershipOrAdmin(user.role, user.id, course.createdById)

      await prisma.course.delete({ where: { id } })
      return "Course deleted"
    },
  },
}
