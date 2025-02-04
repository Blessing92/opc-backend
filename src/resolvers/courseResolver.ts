import prisma from "../config/prisma";
import { Course } from ".prisma/client";
import {authenticateUser, GraphQLContext} from "../context";
import {
  QueryCoursesArgs,
  QueryCourseArgs,
  MutationAddCourseArgs,
  MutationUpdateCourseArgs,
  MutationDeleteCourseArgs,
} from "../types/graphql";

export const resolvers = {
  Query: {
    courses: async (_: unknown, { limit, sortOrder }: QueryCoursesArgs): Promise<Course[]> => {
      return prisma.course.findMany({
        take: limit,
        orderBy: { title: sortOrder === "ASC" ? "asc" : "desc" },
      });
    },
    course: (_: unknown, { id }: QueryCourseArgs): Promise<Course | null> => prisma.course.findUnique({ where: { id } }),
  },
  Mutation: {
    addCourse: async (_: unknown,  { input }: MutationAddCourseArgs, context: GraphQLContext): Promise<Course> => {
      const user = authenticateUser(context);
      return prisma.course.create({ data: { ...input, createdById: user.id } });
    },
    updateCourse: async (_: unknown, { id, input }: MutationUpdateCourseArgs, context: GraphQLContext): Promise<Course> => {
      authenticateUser(context);
      return prisma.course.update({ where: { id }, data: input });
    },
    deleteCourse: async (_: unknown, { id }: MutationDeleteCourseArgs, context: GraphQLContext): Promise<string> => {
      authenticateUser(context);
      await prisma.course.findUnique({ where: { id } });
      return "Course deleted";
    },
  }
}
