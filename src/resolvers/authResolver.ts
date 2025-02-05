import { User } from "@prisma/client";
import { sign } from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import {MutationAuthArgs} from "../types/graphql";
import {GraphQLError} from "graphql/error";
import { GraphQLContext } from "../context";

const generateToken = (user: User): string => {
  const token = sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: "2h" });
  return token
}

export const authResolver = {
  Mutation: {
    register: async (
      _: unknown,
      {input}: MutationAuthArgs): Promise<{ token: string; user: User }> => {
      const {username, password} = input;

      const existingUser = await prisma.user.findUnique({where: {username}});
      if (existingUser) {
        throw new GraphQLError("User already exists", {
          extensions: {code: "USER_ALREADY_EXISTS"},
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          role: "USER",
        }
      });

      return {token: generateToken(user), user};
    },

    login: async (
      _: unknown,
      {input}: MutationAuthArgs): Promise<{ token: string; user: User }> => {
      const {username, password} = input;

      const user = await prisma.user.findUnique({where: {username}});
      if (!user) {
        throw new GraphQLError("Invalid credentials", {
          extensions: {code: "UNAUTHORISED"},
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new GraphQLError("Invalid credentials", {
          extensions: {code: "UNAUTHORISED"},
        });
      }

      return {token: generateToken(user), user};
    },
  },

  Query: {
    me: async (_: unknown, __: unknown, context: GraphQLContext): Promise<User | null> => {
      if (!context.user) {
        throw new GraphQLError("Authentication required", {
          extensions: {code: "UNAUTHORISED"},
        });
      }

      return prisma.user.findUnique({where: {id: context.user.id}})
    }
  }
}
