import { Request, Response } from 'express';
import { verify, JwtPayload } from 'jsonwebtoken';

export interface UserPayload extends JwtPayload {
  req: Request;
  res: Response;
  user: "USER" | "ADMIN";
}

export interface GraphQLContext {
  req: Request;
  res: Response;
  user?: UserPayload;
}

export const authenticateUser = (context: GraphQLContext): UserPayload => {
  const token = context.req.headers.authorization?.split(" ")[1];
  if (!token) {
    throw new Error("Authentication required");
  }

  const decoded = verify(token, process.env.JWT_SECRET!) as UserPayload;
  if (!decoded.id) {
    throw new Error("Invalid token");
  }

  return decoded
}
