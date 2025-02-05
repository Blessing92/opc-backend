import { mergeResolvers } from "@graphql-tools/merge"
import { authResolver } from "./authResolver"
import { courseResolver } from "./courseResolver"
import { collectionResolver } from "./collectionResolver"

export const resolvers = mergeResolvers([
  authResolver,
  courseResolver,
  collectionResolver,
])
