import jwt from "jsonwebtoken";

const secret = process.env.JWT_ACCESS_TOKEN_SECRET;
if (!secret) {
  throw new Error(
    "JWT_ACCESS_TOKEN_SECRET is not defined in environment variables"
  );
}

const generateToken = (res, id, role) => {
  const token = jwt.sign({ id, role }, secret, {
    expiresIn: "24h", // Extended to 24 hours for better development experience
  });

  res.cookie("access_token", token, {
    httpOnly: true,
    maxAge: 24 * 3600000, // 24 hours in milliseconds
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Use 'lax' in development
  });
};

export default generateToken;
