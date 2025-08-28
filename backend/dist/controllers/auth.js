import { prisma } from "../utils/prisma.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/jwt.js";
import crypto from "crypto";
import sendResetEmail from "../utils/mailer.js";
import { UserRole } from "@prisma/client";
import jwt from "jsonwebtoken";
const RegisterUser = async (req, res) => {
    const { email, phone, password, role, bio, username, firstName, lastName } = req.body;
    try {
        const exist = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (exist) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email: email,
                username: username,
                firstName: firstName,
                lastName: lastName,
                bio: bio,
                phone: phone,
                password: hashedPassword,
                role: UserRole.USER,
            },
        });
        const token = generateToken(res, user.id, user.role);
        await prisma.userActivity.create({
            data: {
                userId: user.id,
                action: "REGISTER",
                details: {
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    userAgent: req.headers["user-agent"] || "Unknown",
                },
                ipAddress: req.ip,
                deviceType: (req.headers["user-agent"] || "").includes("Mobile")
                    ? "mobile"
                    : "desktop",
                location: Array.isArray(req.headers["x-forwarded-for"])
                    ? req.headers["x-forwarded-for"][0]
                    : req.headers["x-forwarded-for"] || req.ip,
                timestamp: new Date(),
                createdAt: new Date(),
            },
        });
        res
            .status(201)
            .json({ message: "User registered successfully", user, token });
    }
    catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const loginUser = async (req, res) => {
    const { email, phone, password } = req.body;
    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ email: email }, { phone: phone }],
            },
        });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        if (user.isSuspended) {
            return res.status(403).json({
                message: "Your account has been suspended. You cannot login at this time contact the administartor.",
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        await prisma.userActivity.create({
            data: {
                userId: user.id,
                action: "LOGIN",
                details: {
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    userAgent: req.headers["user-agent"] || "Unknown",
                },
                ipAddress: req.ip,
                deviceType: (req.headers["user-agent"] || "").includes("Mobile")
                    ? "mobile"
                    : "desktop",
                location: Array.isArray(req.headers["x-forwarded-for"])
                    ? req.headers["x-forwarded-for"][0]
                    : req.headers["x-forwarded-for"] || req.ip,
                timestamp: new Date(),
                createdAt: new Date(),
            },
        });
        const token = generateToken(res, user.id, user.role);
        res.status(200).json({ message: "Login successful", user, token });
    }
    catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const logoutUser = (req, res) => {
    // Clear the cookie with all necessary attributes to ensure it's removed
    res.clearCookie("access_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        expires: new Date(0)
    });
    res.status(200).json({ message: "Logout successful" });
};
const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await prisma.user.findFirst({
            where: {
                resetToken: hashedToken,
                resetTokenExpiry: {
                    gt: new Date(),
                },
            },
        });
        if (!user) {
            res.status(400).json({ message: "Invalid or expired reset token" });
            return;
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });
        res.status(200).json({ message: "Password reset successful" });
    }
    catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { email: email },
        });
        if (!user) {
            res.status(404).json({ message: "email not found" });
            return;
        }
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken: hashedToken,
                resetTokenExpiry: new Date(Date.now() + 3600000),
            },
        });
        await sendResetEmail(email, resetToken);
        return res.status(200).json({ message: "Reset email sent successfully" });
    }
    catch (error) {
        console.error("Error requesting password reset:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const checkAuthStatus = async (req, res) => {
    try {
        const token = req.cookies.access_token;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                phone: true,
                username: true,
                role: true,
                firstName: true,
                lastName: true
            }
        });
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        res.status(200).json({
            message: "User is authenticated",
            user,
            isAuthenticated: true
        });
    }
    catch (error) {
        console.error("Error checking auth status:", error);
        res.status(401).json({ message: "Invalid token", isAuthenticated: false });
    }
};
export { RegisterUser, loginUser, logoutUser, resetPassword, requestPasswordReset, checkAuthStatus, };
