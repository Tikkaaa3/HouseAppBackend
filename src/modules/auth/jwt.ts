import jwt from "jsonwebtoken";

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

if (!JWT_SECRET) throw new Error("JWT_SECRET is missing");
if (!JWT_EXPIRES_IN) throw new Error("JWT_EXPIRES_IN is missing");

type JwtPayloadBase = { sub: string; email: string; houseId: string | null };

export function signJwt(payload: JwtPayloadBase): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyJwt<T = JwtPayloadBase>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}
