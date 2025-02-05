import { authTypeDefs } from "./authSchema"
import { courseTypeDefs } from "./courseSchema"
import { collectionTypeDefs } from "./collectionSchema"
import { mergeTypeDefs } from "@graphql-tools/merge"
import { baseTypeDefs } from "./baseSchema"

export const typeDefs = mergeTypeDefs([
  baseTypeDefs,
  authTypeDefs,
  courseTypeDefs,
  collectionTypeDefs,
])
