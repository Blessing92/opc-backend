export const authTypeDefs = `#graphql
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
  
  input AuthInput {
    username: String!
    password: String!
  }
  
  type Query {
    me: User
  }

  extend type Mutation {
    register(input: AuthInput!): AuthPayload
    login(input: AuthInput!): AuthPayload
  }
`
