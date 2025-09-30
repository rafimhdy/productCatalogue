import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "Tidak ada token, akses ditolak" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token tidak valid" });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded; // id + role
        next();
    } catch (err) {
        return res.status(403).json({ message: "Token kadaluarsa atau tidak valid" });
    }
};
