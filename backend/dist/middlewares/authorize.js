import jwt from "jsonwebtoken";
const authenticate = (req, res, next) => {
    try {
        let token;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }
        if (!token && req.cookies) {
            token = req.cookies.access_token;
        }
        if (!token) {
            return res.status(401).json({ message: "Authentication token missing" });
        }
        const secret = process.env.JWT_ACCESS_TOKEN_SECRET || "no-secret";
        const decoded = jwt.verify(token, secret);
        req.user = { id: decoded.id, role: decoded.role };
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "ADMIN") {
        res.status(403).json({ message: "Access denied: Admins only" });
        return;
    }
    console.log("user role:", req.user?.role);
    next();
};
export { authenticate, adminOnly };
