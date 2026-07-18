import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey_bangla_learning_platform";

export function signToken(user: { id: number; email: string; role: string; name: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
      role: string;
      name: string;
    };
  } catch (error) {
    return null;
  }
}

export function getUserFromRequest(req: NextRequest) {
  let token = req.cookies.get("token")?.value;
  
  if (!token) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }
  
  if (!token) return null;
  return verifyToken(token);
}

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}
