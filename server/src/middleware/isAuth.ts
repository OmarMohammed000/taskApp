import { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { userId: string };
}
export function isAuth(req: AuthRequest, res: Response, next: NextFunction): Response | void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided No header found" });
  }
  // get token from header 
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided No Token found" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string } as { userId: string };
    
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }

}
