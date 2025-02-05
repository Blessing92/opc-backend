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
  if (!context) {
    throw new Error("Authentication required");
  }
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      throw new Error("No token provided");
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as UserPayload;
    if (!decoded.id) {
      throw new Error("Invalid token");
    }

    return decoded
  }

  throw new Error("Authentication required");
}
