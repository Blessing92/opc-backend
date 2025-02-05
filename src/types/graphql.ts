export interface CourseInput {
  title: string;
  description: string;
  duration: string;
  outcome: string;
}

export interface UpdateCourseInput extends Partial<CourseInput> {}

export interface QueryCoursesArgs {
  limit?: number;
  sortOrder?: "ASC" | "DESC";
}

export interface QueryCourseArgs {
  id: string;
}

export interface MutationAddCourseArgs {
  input: CourseInput;
}

export interface MutationUpdateCourseArgs {
  id: string;
  input: UpdateCourseInput;
}

export interface MutationDeleteCourseArgs {
  id: string;
}

export interface MutationAuthArgs {
  input: {
    username: string;
    password: string;
  };
}

export interface QueryCollectionArgs {
  id: string;
}

export interface MutationAddCollectionArgs {
  input: {
    name: string
  };
}
