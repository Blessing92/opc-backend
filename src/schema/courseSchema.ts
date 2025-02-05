export const courseTypeDefs = `#graphql
  type Course {
    id: ID!
    title: String!
    description: String!
    duration: String!
    outcome: String!
    collection: Collection
    createdBy: User!
  }

  extend type Query {
    courses(limit: Int, sortOrder: SortOrder): [Course!]!
    course(id: ID!): Course
  }

  extend type Mutation {
    addCourse(input: CourseInput!): Course
    updateCourse(id: ID!, input: CourseInput!): Course
    deleteCourse(id: ID!): String
  }

  input CourseInput {
    title: String!
    description: String!
    duration: String!
    outcome: String!
    collectionId: ID
  }

  enum SortOrder {
    ASC
    DESC
  }
`
