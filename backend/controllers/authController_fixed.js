import jwt from "jsonwebtoken";
import db from "../db.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;

// Helper function to track customer login history
const trackCustomerLogin = (customerId, req, success = true) => {
    // Update last_login in customers table
    db.query("UPDATE customers SET last_login = NOW() WHERE id = ?", [customerId]);

    // Insert into login history
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    db.query(
        "INSERT INTO customer_login_history (customer_id, ip_address, user_agent, login_success) VALUES (?, ?, ?, ?)",
        [customerId, ip, userAgent, success]
    );
};

export const login = (req, res) => {
    const { email, password } = req.body;

    // cek admin dulu
    db.query("SELECT * FROM admins WHERE email = ?", [email], (err, adminResult) => {
        if (err) return res.status(500).json({ message: "Error server" });

        if (adminResult.length > 0) {
            const user = adminResult[0];

            // Use bcrypt for admin passwords
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error("Bcrypt error:", err);
                    return res.status(500).json({ message: "Authentication error" });
                }

                if (!isMatch) {
                    // Fallback: check plain text password for existing admins
                    if (user.password !== password) {
                        return res.status(401).json({ message: "Email atau password salah" });
                    }
                }

                const token = jwt.sign({ id: user.id, role: "admin" }, SECRET_KEY, { expiresIn: "1d" });
                return res.json({ message: "Login berhasil", role: "admin", user, token });
            });
        } else {
            // cek customer
            db.query("SELECT * FROM customers WHERE email = ?", [email], (err2, custResult) => {
                if (err2) return res.status(500).json({ message: "Error server" });

                if (custResult.length > 0) {
                    const user = custResult[0];

                    // Use bcrypt for customer passwords too
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) {
                            console.error("Bcrypt error:", err);
                            return res.status(500).json({ message: "Authentication error" });
                        }

                        if (!isMatch) {
                            // Fallback: check plain text password for existing customers
                            if (user.password !== password) {
                                // Track failed login attempt
                                trackCustomerLogin(user.id, req, false);
                                return res.status(401).json({ message: "Email atau password salah" });
                            }
                        }

                        // Track successful login
                        trackCustomerLogin(user.id, req);

                        const token = jwt.sign({ id: user.id, role: "customer" }, SECRET_KEY, { expiresIn: "1d" });
                        console.log("Login response user:", { id: user.id, name: user.name, email: user.email });
                        return res.json({ message: "Login berhasil", role: "customer", user: { id: user.id, name: user.name, email: user.email }, token });
                    });
                } else {
                    return res.status(401).json({ message: "Email atau password salah" });
                }
            });
        }
    });
};

export const googleLogin = async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'ID token is required' });

    try {
        // Verify ID token with Google's tokeninfo endpoint using global fetch
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
        if (!verifyRes.ok) {
            const text = await verifyRes.text();
            return res.status(400).json({ message: 'Invalid ID token', details: text });
        }
        const payload = await verifyRes.json();

        // Validate audience (client ID)
        const DEFAULT_CLIENT_ID = '676687989871-fl87bs6jn6n2hha4c5arrdig6de61h7p.apps.googleusercontent.com';
        const envAllowed = process.env.GOOGLE_ALLOWED_CLIENT_IDS || process.env.GOOGLE_CLIENT_ID || DEFAULT_CLIENT_ID;
        // envAllowed can be a single client id or comma-separated list
        const allowedClientIds = envAllowed.split(',').map(s => s.trim()).filter(Boolean);

        const audValue = payload.aud;
        const azpValue = payload.azp;

        let audMatches = false;
        if (!audValue && !azpValue) {
            audMatches = false;
        } else {
            const checkId = (id) => allowedClientIds.includes(id);
            if (Array.isArray(audValue)) {
                audMatches = audValue.some(checkId);
            } else if (typeof audValue === 'string') {
                audMatches = checkId(audValue);
            }
            // fallback to azp as some tokens use azp for the actual client
            if (!audMatches && azpValue) {
                audMatches = checkId(azpValue);
            }
        }
        if (!audMatches) {
            console.error('Google ID token audience mismatch', { payload, expected: allowedClientIds });
            // return helpful response to the client for debugging
            return res.status(400).json({ message: 'ID token audience mismatch', aud: audValue, azp: azpValue, expected: allowedClientIds });
        }

        if (!payload.email) {
            return res.status(400).json({ message: 'No email in ID token' });
        }

        const email = payload.email;
        const name = payload.name || payload.email.split('@')[0];
        const picture = payload.picture || null;

        // Check if customer exists
        db.query('SELECT * FROM customers WHERE email = ?', [email], async (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });

            if (results.length > 0) {
                const user = results[0];
                // Track successful Google login
                trackCustomerLogin(user.id, req);
                const token = jwt.sign({ id: user.id, role: 'customer' }, SECRET_KEY, { expiresIn: '1d' });
                return res.json({ message: 'Login berhasil', role: 'customer', user, token });
            } else {
                // Create new customer with random password (hashed)
                try {
                    const randomPassword = Math.random().toString(36).slice(-12);
                    const hashed = await bcrypt.hash(randomPassword, 10);

                    // Dynamically determine which columns exist in customers table
                    const dbName = process.env.DB_NAME || 'project';
                    db.query(
                        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'customers'`,
                        [dbName],
                        (colErr, colRes) => {
                            if (colErr) {
                                console.error('Failed to read customers table columns:', colErr);
                                return res.status(500).json({ message: 'Failed to create user (schema check error)', error: colErr.message || colErr });
                            }
                            const existingCols = new Set(colRes.map(r => r.COLUMN_NAME));

                            // Prepare insert data only for existing columns
                            const insertCols = [];
                            const insertVals = [];
                            const placeholders = [];

                            if (existingCols.has('name')) { insertCols.push('name'); insertVals.push(name); placeholders.push('?'); }
                            if (existingCols.has('email')) { insertCols.push('email'); insertVals.push(email); placeholders.push('?'); }
                            if (existingCols.has('password')) { insertCols.push('password'); insertVals.push(hashed); placeholders.push('?'); }
                            if (existingCols.has('image_url') && picture) { insertCols.push('image_url'); insertVals.push(picture); placeholders.push('?'); }

                            if (insertCols.length === 0) {
                                console.error('No valid customer columns found for insert');
                                return res.status(500).json({ message: 'Failed create customer: no writable columns' });
                            }

                            const insertQueryDynamic = `INSERT INTO customers (${insertCols.join(',')}) VALUES (${placeholders.join(',')})`;

                            db.query(insertQueryDynamic, insertVals, (insertErr, insertRes) => {
                                if (insertErr) {
                                    if (insertErr.code === 'ER_DUP_ENTRY') {
                                        db.query('SELECT * FROM customers WHERE email = ?', [email], (dupErr, dupRes) => {
                                            if (dupErr) return res.status(500).json({ message: 'Failed fetch existing user after duplicate', error: dupErr });
                                            if (dupRes.length > 0) {
                                                const user = dupRes[0];
                                                // Track successful Google login
                                                trackCustomerLogin(user.id, req);
                                                const token = jwt.sign({ id: user.id, role: 'customer' }, SECRET_KEY, { expiresIn: '1d' });
                                                return res.status(200).json({ message: 'User already exists, logged in', role: 'customer', user, token });
                                            }
                                            return res.status(500).json({ message: 'Failed create customer: duplicate entry and could not fetch user' });
                                        });
                                        return;
                                    }

                                    return res.status(500).json({ message: 'Failed create customer', error: insertErr.message || insertErr });
                                }

                                const userId = insertRes.insertId;
                                db.query('SELECT * FROM customers WHERE id = ?', [userId], (e2, newUserRes) => {
                                    if (e2) return res.status(500).json({ message: 'Failed fetch new user', error: e2 });
                                    const user = newUserRes[0];
                                    // Track successful Google login for new user
                                    trackCustomerLogin(user.id, req);
                                    const token = jwt.sign({ id: user.id, role: 'customer' }, SECRET_KEY, { expiresIn: '1d' });
                                    return res.status(201).json({ message: 'User created via Google', role: 'customer', user, token });
                                });
                            });
                        }
                    );
                } catch (hashErr) {
                    return res.status(500).json({ message: 'Error creating user', error: hashErr.message });
                }
            }
        });
    } catch (err) {
        console.error('Google login error:', err);
        return res.status(500).json({ message: 'Google login error', error: err.message });
    }
};