export const typeDefs = `#graphql
  type User {
    id: ID!
    username: String!
    role: Role!
  }

  enum Role {
    USER
    ADMIN
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  extend type Mutation {
    register(username: String!, password: String!): AuthPayload
    login(username: String!, password: String!): AuthPayload
  }
`;
