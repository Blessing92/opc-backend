export const typeDefs = `#graphql
  type Collection {
    id: ID!
    name: String!
    courses: [Course!]!
  }

  extend type Query {
    collections: [Collection!]!
    collection(id: ID!): Collection
  }
`;
