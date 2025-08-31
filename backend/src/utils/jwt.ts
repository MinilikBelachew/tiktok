import jwt from "jsonwebtoken";

const secret = process.env.JWT_ACCESS_TOKEN_SECRET;
if (!secret) {
  throw new Error(
    "JWT_ACCESS_TOKEN_SECRET is not defined in environment variables"
  );
}

const generateToken = (res, id, role) => {
  const token = jwt.sign({ id, role }, secret, {
    expiresIn: "1h",
  });

  res.cookie("access_token", token, {
    httpOnly: true,
    maxAge: 3600000,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });
};

export default generateToken;
