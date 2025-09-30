import db from "../db.js";

const Customer = {
    getByEmail: (email, callback) => {
        db.query("SELECT * FROM customers WHERE email = ?", [email], callback);
    },
    create: (data, callback) => {
        const { name, email, password } = data;
        db.query(
            "INSERT INTO customers (name, email, password) VALUES (?, ?, ?)",
            [name, email, password],
            callback
        );
    }
};

export default Customer;
