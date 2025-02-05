export const collectionTypeDefs = `#graphql
  type Collection {
    id: ID!
    name: String!
    courses: [Course!]!
  }

  extend type Query {
    collections: [Collection!]!
    collection(id: ID!): Collection
  }
  
  input CollectionInput {
    name: String!
  }
  
  extend type Mutation {
    addCollection(input: CollectionInput!): Collection
  }
`;
