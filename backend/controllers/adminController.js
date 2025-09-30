import bcrypt from "bcrypt";
import db from "../db.js";

// Get all admins
export const getAllAdmins = (req, res) => {
    const query = "SELECT id, name, email FROM admin";
    db.query(query, (err, result) => {
        if (err) {
            console.error("Error fetching admins:", err);
            return res.status(500).json({ message: "Error fetching admins" });
        }
        res.json(result);
    });
};

// Get admin by ID
export const getAdminById = (req, res) => {
    const id = req.params.id;
    const query = "SELECT id, name, email FROM admin WHERE id = ?";
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error fetching admin:", err);
            return res.status(500).json({ message: "Error fetching admin" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.json(result[0]);
    });
};

// Login admin
export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email dan password wajib diisi" });
        }

        const query = "SELECT * FROM admin WHERE email = ?";
        db.query(query, [email], async (err, result) => {
            if (err) {
                console.error("Error during login:", err);
                return res.status(500).json({ message: "Server error" });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: "Admin tidak ditemukan" });
            }

            const admin = result[0];
            const isMatch = await bcrypt.compare(password, admin.password);

            if (!isMatch) {
                return res.status(401).json({ message: "Password salah" });
            }

            res.json({
                message: "Login berhasil",
                user: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email
                },
                role: "admin"
            });
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Create new admin
export const createAdmin = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Check if email already exists
        const checkQuery = "SELECT * FROM admin WHERE email = ?";
        db.query(checkQuery, [email], async (err, result) => {
            if (err) {
                console.error("Error checking email:", err);
                return res.status(500).json({ message: "Error creating admin" });
            }

            if (result.length > 0) {
                return res.status(400).json({ message: "Email already exists" });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new admin
            const insertQuery = "INSERT INTO admin (name, email, password) VALUES (?, ?, ?)";
            db.query(insertQuery, [name, email, hashedPassword], (err, result) => {
                if (err) {
                    console.error("Error creating admin:", err);
                    return res.status(500).json({ message: "Error creating admin" });
                }
                res.status(201).json({ message: "Admin created successfully", id: result.insertId });
            });
        });
    } catch (err) {
        console.error("Error creating admin:", err);
        res.status(500).json({ message: "Error creating admin" });
    }
};

// Update admin
export const updateAdmin = async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    try {
        // Check if admin exists
        const checkQuery = "SELECT * FROM admin WHERE id = ?";
        db.query(checkQuery, [id], async (err, result) => {
            if (err) {
                console.error("Error checking admin:", err);
                return res.status(500).json({ message: "Error updating admin" });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: "Admin not found" });
            }

            // If updating email, check if new email already exists
            if (email !== result[0].email) {
                const emailCheckQuery = "SELECT * FROM admin WHERE email = ? AND id != ?";
                const emailExists = await new Promise((resolve, reject) => {
                    db.query(emailCheckQuery, [email, id], (err, result) => {
                        if (err) reject(err);
                        resolve(result.length > 0);
                    });
                });

                if (emailExists) {
                    return res.status(400).json({ message: "Email already exists" });
                }
            }

            // Prepare update query
            let updateQuery = "UPDATE admin SET name = ?, email = ?";
            let params = [name, email];

            // If password is provided, hash it and include in update
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updateQuery += ", password = ?";
                params.push(hashedPassword);
            }

            updateQuery += " WHERE id = ?";
            params.push(id);

            // Execute update
            db.query(updateQuery, params, (err, result) => {
                if (err) {
                    console.error("Error updating admin:", err);
                    return res.status(500).json({ message: "Error updating admin" });
                }
                res.json({ message: "Admin updated successfully" });
            });
        });
    } catch (err) {
        console.error("Error updating admin:", err);
        res.status(500).json({ message: "Error updating admin" });
    }
};

// Delete admin
export const deleteAdmin = (req, res) => {
    const { id } = req.params;

    // Prevent deleting the last admin
    const checkQuery = "SELECT COUNT(*) as count FROM admin";
    db.query(checkQuery, (err, result) => {
        if (err) {
            console.error("Error checking admin count:", err);
            return res.status(500).json({ message: "Error deleting admin" });
        }

        if (result[0].count <= 1) {
            return res.status(400).json({ message: "Cannot delete the last admin" });
        }

        // Proceed with deletion
        const deleteQuery = "DELETE FROM admin WHERE id = ?";
        db.query(deleteQuery, [id], (err, result) => {
            if (err) {
                console.error("Error deleting admin:", err);
                return res.status(500).json({ message: "Error deleting admin" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Admin not found" });
            }

            res.json({ message: "Admin deleted successfully" });
        });
    });
};

// Get admin profile
export const getAdminProfile = (req, res) => {
    const { id } = req.user;
    
    const query = "SELECT id, name, email FROM admin WHERE id = ?";
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error("Error fetching admin profile:", err);
            return res.status(500).json({ message: "Error fetching admin profile" });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.json(result[0]);
    });
};