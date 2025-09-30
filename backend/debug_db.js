import db from "./db.js";

console.log("=== DEBUGGING DATABASE STRUCTURE ===");

// Check products table structure
db.query("DESCRIBE products", (err, results) => {
    if (err) {
        console.error("Error describing products table:", err);
        return;
    }
    console.log("\n🔍 PRODUCTS table structure:");
    console.table(results);

    // Check if there are any products with images
    db.query("SELECT id, name, image, image_url FROM products LIMIT 5", (err2, products) => {
        if (err2) {
            console.error("Error selecting products:", err2);
            return;
        }
        console.log("\n📦 Sample products data:");
        console.table(products);

        // Check order_items table structure
        db.query("DESCRIBE order_items", (err3, orderItemsStructure) => {
            if (err3) {
                console.error("Error describing order_items table:", err3);
                return;
            }
            console.log("\n🔍 ORDER_ITEMS table structure:");
            console.table(orderItemsStructure);

            // Test the actual query being used
            db.query(`
                SELECT 
                    oi.id,
                    oi.product_id,
                    oi.product_name,
                    oi.quantity,
                    oi.price,
                    (oi.quantity * oi.price) as subtotal,
                    p.image,
                    p.image_url,
                    p.description
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id IN (SELECT id FROM orders LIMIT 1)
                LIMIT 3
            `, (err4, testResults) => {
                if (err4) {
                    console.error("Error testing join query:", err4);
                    return;
                }
                console.log("\n🧪 Test query results:");
                console.table(testResults);

                // Check recent orders
                db.query("SELECT id, user_id, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5", (err5, orders) => {
                    if (err5) {
                        console.error("Error getting orders:", err5);
                        return;
                    }
                    console.log("\n📋 Recent orders:");
                    console.table(orders);

                    console.log("\n=== DEBUG COMPLETE ===");
                    process.exit(0);
                });
            });
        });
    });
});
