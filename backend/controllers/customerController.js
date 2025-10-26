import Customer from "../models/customerModel.js";
import db from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { sendVerificationEmail } from "../services/emailService.js";
import crypto from "crypto";

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET;

export const loginCustomer = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email & password required" });

  console.log("DEBUG - Customer login attempt:", { email });

  Customer.getByEmail(email, (err, result) => {
    if (err) {
      console.error("DEBUG - Database error:", err);
      return res.status(500).json({ message: "Server error" });
    }
    if (!result.length) {
      console.log("DEBUG - Customer not found for email:", email);
      return res.status(404).json({ message: "Customer not found" });
    }

    const customer = result[0];

    // Use bcrypt to compare passwords securely
    bcrypt.compare(password, customer.password, (err, isMatch) => {
      if (err) {
        console.error("DEBUG - Bcrypt error:", err);
        return res.status(500).json({ message: "Authentication error" });
      }

      if (!isMatch) {
        // Fallback: check plain text password for existing users
        if (customer.password === password) {
          console.log("DEBUG - Plain text password match (should be migrated)");
        } else {
          console.log("DEBUG - Wrong password for customer:", email);
          return res.status(401).json({ message: "Wrong password" });
        }
      }

      // Generate JWT token for customer authentication
      const token = jwt.sign(
        { id: customer.id, role: "customer" },
        SECRET_KEY,
        { expiresIn: "24h" }
      );

      console.log("DEBUG - Customer login successful:", {
        customerId: customer.id,
        email: customer.email,
        tokenGenerated: !!token,
      });

      res.json({
        message: "Login successful",
        role: "customer",
        user: { id: customer.id, name: customer.name, email: customer.email },
        token: token,
      });
    });
  });
};

export const registerCustomer = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  db.query(
    "SELECT email FROM customers WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error("Error checking existing customer:", err);
        return res.status(500).json({ message: "Terjadi kesalahan server" });
      }

      if (results.length > 0) {
        return res.status(409).json({ message: "Email sudah terdaftar" });
      }

      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          console.error("Error hashing password:", err);
          return res.status(500).json({ message: "Error processing password" });
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenExpires = new Date(Date.now() + 3600000); // 1 hour

        const newUser = {
          name,
          email,
          password: hashedPassword,
          verification_token: verificationToken,
          verification_token_expires: verificationTokenExpires,
        };

        if (!newUser.name || newUser.name.trim() === "") {
          return res.status(400).json({ message: "Nama wajib diisi." });
        }

        db.query("INSERT INTO customers SET ?", newUser, (err, result) => {
          if (err) {
            console.error("Error MySQL:", err);
            return res
              .status(500)
              .json({ message: "Terjadi kesalahan server" });
          }

          sendVerificationEmail(email, verificationToken)
            .then(() => {
              res.status(201).json({
                message:
                  "Registrasi berhasil. Silakan cek email Anda untuk verifikasi.",
                userId: result.insertId,
              });
            })
            .catch((error) => {
              console.error("Failed to send verification email:", error);
              res
                .status(500)
                .json({ message: "Gagal mengirim email verifikasi" });
            });
        });
      });
    }
  );
};

export const verifyEmail = (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res
      .status(400)
      .redirect(
        `${process.env.FRONTEND_URL}/login?message=Verification token is missing.`
      );
  }

  const query =
    "SELECT * FROM customers WHERE verification_token = ? AND verification_token_expires > NOW()";

  db.query(query, [token], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .redirect(
          `${process.env.FRONTEND_URL}/login?message=Server error during verification.`
        );
    }

    if (results.length === 0) {
      return res
        .status(400)
        .redirect(
          `${process.env.FRONTEND_URL}/login?message=Invalid or expired verification token.`
        );
    }

    const customer = results[0];

    const updateQuery =
      "UPDATE customers SET is_verified = 1, verification_token = NULL, verification_token_expires = NULL WHERE id = ?";

    db.query(updateQuery, [customer.id], (updateErr) => {
      if (updateErr) {
        console.error("Error updating customer:", updateErr);
        return res
          .status(500)
          .redirect(
            `${process.env.FRONTEND_URL}/login?message=Failed to verify account.`
          );
      }

      res.redirect(
        `${process.env.FRONTEND_URL}/login?message=Email verified successfully. You can now log in.`
      );
    });
  });
};

// Admin endpoints
export const getAllCustomers = (req, res) => {
  const q = req.query.q ? req.query.q.trim() : "";
  let query = `SELECT id, name, email, phone, created_at FROM customers`;
  let params = [];
  if (q) {
    query += ` WHERE name LIKE ? OR email LIKE ?`;
    params = [`%${q}%`, `%${q}%`];
  }
  query += ` ORDER BY created_at DESC`;
  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error getting customers:", err);
      return res.status(500).json({ message: "Error fetching customers" });
    }
    res.json(results);
  });
};

export const createCustomer = (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password required" });
  }
  db.query(
    "INSERT INTO customers (name, email, phone, password, created_at) VALUES (?, ?, ?, ?, NOW())",
    [name, email, phone || null, password],
    (err, result) => {
      if (err) {
        console.error("Error creating customer:", err);
        return res.status(500).json({ message: "Error creating customer" });
      }
      res.json({
        message: "Customer created successfully",
        id: result.insertId,
      });
    }
  );
};

export const updateCustomer = (req, res) => {
  const { id } = req.params;
  const { name, email, phone, password } = req.body;
  if (!name && !email && !phone && !password) {
    return res.status(400).json({ message: "No fields to update" });
  }
  let fields = [];
  let params = [];
  if (name) {
    fields.push("name = ?");
    params.push(name);
  }
  if (email) {
    fields.push("email = ?");
    params.push(email);
  }
  if (phone !== undefined) {
    fields.push("phone = ?");
    params.push(phone);
  }
  if (password) {
    fields.push("password = ?");
    params.push(password);
  }
  params.push(id);
  const query = `UPDATE customers SET ${fields.join(", ")} WHERE id = ?`;
  db.query(query, params, (err, result) => {
    if (err) {
      console.error("Error updating customer:", err);
      return res.status(500).json({ message: "Error updating customer" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json({ message: "Customer updated successfully" });
  });
};

export const deleteCustomer = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM customers WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error deleting customer:", err);
      return res.status(500).json({ message: "Error deleting customer" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ message: "Customer deleted successfully" });
  });
};

// Ambil riwayat login customer
export const getCustomerLoginHistory = (req, res) => {
  const { id } = req.params;
  db.query(
    "SELECT * FROM customer_login_history WHERE customer_id = ? ORDER BY login_time DESC",
    [id],
    (err, results) => {
      if (err) {
        console.error("Error fetching login history:", err);
        return res
          .status(500)
          .json({ message: "Error fetching login history" });
      }
      res.json(results);
    }
  );
};

// Test endpoint for debugging
export const testAdminConnection = (req, res) => {
  // Simple query to test database connection
  db.query("SELECT COUNT(*) as count FROM customers", (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        message: "Database connection failed",
        error: err.message,
      });
    }

    res.json({
      message: "Admin connection working",
      customerCount: result[0].count,
      user: req.user,
    });
  });
};

// Get customer profile for dashboard
export const getCustomerProfile = (req, res) => {
  try {
    const customerId = req.user.id;

    db.query(
      "SELECT id, name, email, phone, newsletter_preference, product_categories_preference FROM customers WHERE id = ?",
      [customerId],
      (err, results) => {
        if (err) {
          console.error("Error fetching customer profile:", err);
          return res.status(500).json({ message: "Failed to fetch profile" });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: "Customer not found" });
        }

        const customer = results[0];
        // Parse preferences if they exist
        if (customer.product_categories_preference) {
          try {
            customer.product_categories_preference = JSON.parse(
              customer.product_categories_preference
            );
          } catch (e) {
            customer.product_categories_preference = [];
          }
        }

        res.json(customer);
      }
    );
  } catch (error) {
    console.error("Error in getCustomerProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update customer profile
export const updateCustomerProfile = (req, res) => {
  try {
    const customerId = req.user.id;
    const {
      name,
      phone,
      newsletter_preference,
      product_categories_preference,
    } = req.body;

    const updates = {};
    const values = [];

    if (name !== undefined) {
      updates.name = "name = ?";
      values.push(name);
    }
    if (phone !== undefined) {
      updates.phone = "phone = ?";
      values.push(phone);
    }
    if (newsletter_preference !== undefined) {
      updates.newsletter_preference = "newsletter_preference = ?";
      values.push(newsletter_preference);
    }
    if (product_categories_preference !== undefined) {
      updates.product_categories_preference =
        "product_categories_preference = ?";
      values.push(JSON.stringify(product_categories_preference));
    }

    if (values.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    values.push(customerId);

    const updateQuery = `UPDATE customers SET ${Object.values(updates).join(
      ", "
    )} WHERE id = ?`;

    db.query(updateQuery, values, (err, result) => {
      if (err) {
        console.error("Error updating customer profile:", err);
        return res.status(500).json({ message: "Failed to update profile" });
      }

      res.json({ message: "Profile updated successfully" });
    });
  } catch (error) {
    console.error("Error in updateCustomerProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Change customer password
export const changeCustomerPassword = (req, res) => {
  try {
    const customerId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current password and new password are required" });
    }

    // First, get the current password hash
    db.query(
      "SELECT password FROM customers WHERE id = ?",
      [customerId],
      (err, results) => {
        if (err) {
          console.error("Error fetching customer password:", err);
          return res
            .status(500)
            .json({ message: "Failed to verify current password" });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: "Customer not found" });
        }

        const customer = results[0];

        // Verify current password
        bcrypt.compare(currentPassword, customer.password, (err, isMatch) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return res.status(500).json({ message: "Authentication error" });
          }

          if (!isMatch) {
            // Fallback for plain text passwords
            if (customer.password !== currentPassword) {
              return res
                .status(401)
                .json({ message: "Current password is incorrect" });
            }
          }

          // Hash new password
          bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
            if (err) {
              console.error("Error hashing new password:", err);
              return res
                .status(500)
                .json({ message: "Failed to update password" });
            }

            // Update password
            db.query(
              "UPDATE customers SET password = ? WHERE id = ?",
              [hashedPassword, customerId],
              (err, result) => {
                if (err) {
                  console.error("Error updating password:", err);
                  return res
                    .status(500)
                    .json({ message: "Failed to update password" });
                }

                res.json({ message: "Password updated successfully" });
              }
            );
          });
        });
      }
    );
  } catch (error) {
    console.error("Error in changeCustomerPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
