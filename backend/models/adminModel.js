import db from "../db.js";

const Admin = {
    getByEmail: (email, callback) => {
        db.query("SELECT * FROM admin WHERE email = ?", [email], callback);
    },
    getById: (id, callback) => {
        db.query("SELECT * FROM admin WHERE id = ?", [id], callback);
    },
    create: (data, callback) => {
        const { name, email, password } = data;
        db.query(
            "INSERT INTO admin (name, email, password) VALUES (?, ?, ?)",
            [name, email, password],
            callback
        );
    },
    update: (id, data, callback) => {
        const { name, email, password } = data;
        db.query(
            "UPDATE admin SET name = ?, email = ?, password = ? WHERE id = ?",
            [name, email, password, id],
            callback
        );
    }
};

export default Admin;
