import prisma from "../config/prisma";
import { Collection } from ".prisma/client";
import { QueryCollectionArgs } from "../types/graphql";
import { MutationAddCollectionArgs } from "../types/graphql";
import {authenticateUser, GraphQLContext} from "../context";

export const collectionResolver = {
  Mutation: {
    addCollection: async (_: unknown, {input}: MutationAddCollectionArgs, context: GraphQLContext): Promise<Collection> => {
      authenticateUser(context);

      const collection = await prisma.collection.create({ data: { name: input.name, courses: {create: []}}, include: {courses: true} });
      return collection;
    }
  },
  Query: {
    collections: async (): Promise<Collection[]> => {
      const collections = await prisma.collection.findMany({ include: {courses: true} });
      return collections;
    },

    collection: async (_: unknown, { id }: QueryCollectionArgs): Promise<Collection | null> => {
      const collection =  await prisma.collection.findUnique({ where: { id }, include: {courses: true} });
      return collection
    },
  },
};
