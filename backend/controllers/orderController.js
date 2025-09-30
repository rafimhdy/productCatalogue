import db from "../db.js";
import { createPaymentToken, handlePaymentNotification, refundPayment } from "../services/paymentService.js";
import { sendAdminCancellationEmail, sendAdminRefundEmail, sendStatusUpdateEmail } from "../services/emailService.js";

// POST /api/orders/checkout
export const checkout = (req, res) => {
    const userId = req.user.id; // dari middleware verifyToken

    // 1. Ambil cart user
    db.query(
        `SELECT ci.id AS cart_item_id, ci.quantity, p.id AS product_id, p.name, p.price 
         FROM cart_items ci
         JOIN carts c ON ci.cart_id = c.id
         JOIN products p ON ci.product_id = p.id
         WHERE c.user_id = ?`,
        [userId],
        (err, results) => {
            if (err) return res.status(500).json({ message: "Error ambil cart" });
            if (results.length === 0) return res.status(400).json({ message: "Cart kosong" });

            // 2. Hitung total harga
            const totalPrice = results.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // 3. Check stock availability
            const productIds = results.map(r => r.product_id);
            const placeholders = productIds.map(() => '?').join(',');
            db.query(`SELECT id, stock FROM products WHERE id IN (${placeholders})`, productIds, (stockErr, stockRows) => {
                if (stockErr) {
                    console.error('Error checking stock:', stockErr);
                    return res.status(500).json({ message: 'Error checking stock' });
                }

                const stockMap = {};
                stockRows.forEach(r => stockMap[r.id] = r.stock);

                for (const item of results) {
                    const available = stockMap[item.product_id] || 0;
                    if (available < item.quantity) {
                        return res.status(400).json({ message: `Stok tidak cukup untuk produk ${item.name}` });
                    }
                }

                // 4. Proceed with transaction: insert order, insert items, decrement stock, delete cart
                db.beginTransaction((txErr) => {
                    if (txErr) {
                        console.error('Transaction start error:', txErr);
                        return res.status(500).json({ message: 'Transaction error' });
                    }

                    db.query("INSERT INTO orders (user_id, total_price) VALUES (?, ?)", [userId, totalPrice], (err2, orderResult) => {
                        if (err2) {
                            console.error('Error simpan order:', err2);
                            return db.rollback(() => res.status(500).json({ message: 'Error simpan order' }));
                        }

                        const orderId = orderResult.insertId;

                        // Insert order items and decrement stock sequentially
                        const itemPromises = results.map(item => new Promise((resolve, reject) => {
                            db.query(
                                "INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)",
                                [orderId, item.product_id, item.name, item.quantity, item.price],
                                (itErr) => {
                                    if (itErr) return reject(itErr);

                                    // decrement stock
                                    db.query(
                                        "UPDATE products SET stock = stock - ? WHERE id = ?",
                                        [item.quantity, item.product_id],
                                        (updErr) => {
                                            if (updErr) return reject(updErr);
                                            resolve();
                                        }
                                    );
                                }
                            );
                        }));

                        Promise.all(itemPromises)
                            .then(() => {
                                // delete cart items for user
                                db.query(
                                    `DELETE ci FROM cart_items ci
                                     JOIN carts c ON ci.cart_id = c.id
                                     WHERE c.user_id = ?`,
                                    [userId],
                                    (delErr) => {
                                        if (delErr) {
                                            console.error('Error hapus cart:', delErr);
                                            return db.rollback(() => res.status(500).json({ message: 'Error hapus cart' }));
                                        }

                                        db.commit((commitErr) => {
                                            if (commitErr) {
                                                console.error('Commit error:', commitErr);
                                                return db.rollback(() => res.status(500).json({ message: 'Commit failed' }));
                                            }

                                            // 6. Buat pesan WhatsApp
                                            const waMessage = generateWhatsAppMessage(results, totalPrice);
                                            const waLink = `https://wa.me/6281234567890?text=${encodeURIComponent(waMessage)}`;

                                            res.json({
                                                message: "Checkout berhasil",
                                                orderId,
                                                totalPrice,
                                                waLink
                                            });
                                        });
                                    }
                                );
                            })
                            .catch(pErr => {
                                console.error('Error saving order items or updating stock:', pErr);
                                db.rollback(() => res.status(500).json({ message: 'Error processing order items' }));
                            });
                    });
                });
            });
        }
    );
};

// GET /api/orders
export const getOrders = (req, res) => {
    const userId = req.user.id;
    db.query(
        "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
        [userId],
        (err, results) => {
            if (err) return res.status(500).json({ message: "Error ambil order" });
            res.json(results);
        }
    );
};

// Admin endpoints for order management
export const getAllOrders = (req, res) => {
    const query = `
        SELECT 
            o.id, 
            o.user_id, 
            o.total_price, 
            o.status,
            o.created_at,
            c.name as customer_name,
            c.email as customer_email
        FROM orders o
        LEFT JOIN customers c ON o.user_id = c.id
        ORDER BY o.created_at DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error getting orders:", err);
            return res.status(500).json({ message: "Error fetching orders" });
        }
        res.json(results);
    });
};

// NEW: Get order items/details for a specific order
export const getOrderItems = (req, res) => {
    const { orderId } = req.params;
    
    const query = `
        SELECT 
            oi.id,
            oi.product_id,
            oi.product_name,
            oi.quantity,
            oi.price,
            (oi.quantity * oi.price) as subtotal,
            p.image_url,
            p.description,
            p.stock,
            p.category_id,
            c.name AS category_name
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE oi.order_id = ?
        ORDER BY oi.id
    `;

    db.query(query, [orderId], (err, results) => {
        if (err) {
            console.error("Error getting order items:", err);
            return res.status(500).json({ message: "Error fetching order items" });
        }
        res.json(results);
    });
};

// GET /api/orders/details/:orderId - Get complete order details with items
export const getOrderDetails = (req, res) => {
    const userId = req.user.id;
    const { orderId } = req.params;

    // First get order data
    db.query(
        `SELECT * FROM orders WHERE id = ? AND user_id = ?`,
        [orderId, userId],
        (err, orderResults) => {
            if (err) {
                console.error("Error fetching order:", err);
                return res.status(500).json({ message: "Error fetching order details" });
            }

            if (orderResults.length === 0) {
                return res.status(404).json({ message: "Order not found" });
            }

            const order = orderResults[0];

            // Then get order items
            db.query(
                `SELECT * FROM order_items WHERE order_id = ?`,
                [orderId],
                (err, itemResults) => {
                    if (err) {
                        console.error("Error fetching order items:", err);
                        return res.status(500).json({ message: "Error fetching order items" });
                    }

                    // Return combined data
                    res.json({
                        ...order,
                        items: itemResults
                    });
                }
            );
        }
    );
};

export const updateOrderStatus = async (req, res) => {
    console.log(`[UPDATE ORDER STATUS] userId=${req.user?.id} role=${req.user?.role} orderId=${req.params.id} newStatus=${req.body.status} time=${new Date().toISOString()}`);
    console.log('[DEBUG JWT]', req.user);
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    const conn = db.promise();
    try {
        // Load order
        const [orderRows] = await conn.query('SELECT * FROM orders WHERE id = ?', [id]);
        if (!orderRows || orderRows.length === 0) return res.status(404).json({ message: 'Order not found' });
        const order = orderRows[0];
        console.log('[DEBUG ORDER STATUS BEFORE]', order.status);

        // Restore stock jika status diubah ke cancelled dan status sebelumnya bukan cancelled
        if (status === 'cancelled' && order.status !== 'cancelled') {
            await conn.beginTransaction();
            try {
                const [items] = await conn.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [id]);
                console.log('[DEBUG ORDER ITEMS]', items);
                if (items && items.length > 0) {
                    for (const it of items) {
                        const [r] = await conn.query('UPDATE products SET stock = stock + ? WHERE id = ?', [it.quantity, it.product_id]);
                        if (!r || r.affectedRows === 0) {
                            console.error(`[RESTORE FAIL] product_id=${it.product_id} not updated (status cancel)`);
                        } else {
                            console.log(`[RESTORE OK] product_id=${it.product_id} +${it.quantity} (status cancel)`);
                        }
                    }
                }

                await conn.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
                await conn.commit();

                // Log final stocks
                if (items && items.length > 0) {
                    const ids = items.map(i => i.product_id);
                    if (ids.length > 0) {
                        const ph = ids.map(() => '?').join(',');
                        const [rows] = await conn.query(`SELECT id, name, stock FROM products WHERE id IN (${ph})`, ids);
                        console.log(`[STOCK AFTER CANCEL]`, rows);
                    }
                }

                return res.json({ message: 'Order status updated and stock restored successfully' });
            } catch (err) {
                await conn.rollback();
                console.error('Error restoring stock during status cancel:', err);
                return res.status(500).json({ message: 'Failed to restore stock and update status', error: err.message || err });
            }
        }

        // Default path: just update status
        await conn.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        return res.json({ message: 'Order status updated successfully' });

    } catch (err) {
        console.error('updateOrderStatus error:', err);
        try { await conn.rollback(); } catch (rbErr) { console.error('Rollback error:', rbErr); }
        return res.status(500).json({ message: 'Failed to update order status', error: err.message || err });
    }
};

export const deleteOrder = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM orders WHERE id = ?", [id], (err, result) => {
        if (err) {
            console.error("Error deleting order:", err);
            return res.status(500).json({ message: "Error deleting order" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ message: "Order deleted successfully" });
    });
};

// Helper: generate pesan WhatsApp
const generateWhatsAppMessage = (items, total) => {
    let message = "Halo, saya mau pesan:%0A";
    items.forEach((item) => {
        message += `- ${item.name} (${item.quantity}x) - Rp${item.price * item.quantity}%0A`;
    });
    message += `Total: Rp${total}`;
    return message;
};

// NEW: Create payment for order
export const createPayment = (req, res) => {
    const userId = req.user.id;
    const { orderId } = req.body;

    // Get order details (hapus c.phone karena kolom belum ada)
    db.query(
        `SELECT o.*, c.name, c.email 
         FROM orders o 
         JOIN customers c ON o.user_id = c.id 
         WHERE o.id = ? AND o.user_id = ?`,
        [orderId, userId],
        async (err, orderResult) => {
            if (err) {
                console.error("Error fetching order for payment:", err);
                return res.status(500).json({ message: "Error fetching order" });
            }

            if (orderResult.length === 0) {
                return res.status(404).json({ message: "Order not found" });
            }

            const order = orderResult[0];

            // Get order items for payment details
            db.query(
                "SELECT * FROM order_items WHERE order_id = ?",
                [orderId],
                async (err2, itemsResult) => {
                    if (err2) {
                        console.error("Error fetching order items for payment:", err2);
                        return res.status(500).json({ message: "Error fetching order items" });
                    }

                    const customerDetails = {
                        first_name: order.name,
                        email: order.email,
                        // fallback karena kolom phone belum ada
                        phone: '08123456789'
                    };

                    const itemDetails = itemsResult.map(item => ({
                        id: item.product_id,
                        price: item.price,
                        quantity: item.quantity,
                        name: item.product_name
                    }));

                    try {
                        const paymentResult = await createPaymentToken(
                            orderId,
                            order.total_price,
                            customerDetails,
                            itemDetails
                        );

                        if (paymentResult.success) {
                            // Save midtrans_order_id to orders table if possible
                            if (paymentResult.midtrans_order_id) {
                                db.query('UPDATE orders SET midtrans_order_id = ? WHERE id = ?', [paymentResult.midtrans_order_id, orderId], (updErr) => {
                                    if (updErr) console.warn('Failed to save midtrans_order_id on order:', updErr.message || updErr);
                                });
                            }

                            return res.json({
                                success: true,
                                token: paymentResult.token,
                                redirectUrl: paymentResult.redirectUrl
                            });
                        }
                        return res.status(500).json({
                            success: false,
                            message: paymentResult.error || "Failed to create payment"
                        });
                    } catch (error) {
                        console.error("Payment creation error:", error);
                        return res.status(500).json({
                            success: false,
                            message: "Error creating payment",
                            error: error.message
                        });
                    }
                }
            );
        }
    );
};

// NEW: Handle payment notification webhook from Midtrans
export const handlePaymentWebhook = async (req, res) => {
    try {
        const notification = await handlePaymentNotification(req.body);

        if (notification.success) {
            const orderId = notification.orderId;
            const newStatus = notification.status;
            const txStatus = notification.transactionStatus;
            const txId = notification.transactionId || notification.transaction_id || notification.coreApiResponse?.transaction_id || null;

            // Update order status and store payment transaction id/status when available
            db.query(
                "UPDATE orders SET status = ?, payment_status = ?, midtrans_transaction_id = ? WHERE id = ?",
                [newStatus, txStatus || notification.transactionStatus, txId, orderId],
                (err) => {
                    if (err) {
                        console.error("Error updating order payment status:", err);
                    }
                }
            );

            console.log('[MIDTRANS][NOTIF] persisted order update for', orderId, { newStatus, txStatus, txId });
        }

        res.status(200).json({ status: 'OK' });
    } catch (error) {
        console.error('Payment webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// NEW: Cancel order
export const cancelOrder = async (req, res) => {
    console.log(`[CANCEL ORDER REQUEST] userId=${req.user?.id} role=${req.user?.role} orderId=${req.params.id} time=${new Date().toISOString()}`);
    const userId = req.user?.id;
    const orderId = req.params.id;
    const conn = db.promise();
    try {
        // Load the order
        const [orderRows] = await conn.query(
            'SELECT id, user_id, status, created_at, total_price, payment_status, midtrans_order_id, midtrans_transaction_id FROM orders WHERE id = ?',
            [orderId]
        );
        if (!orderRows || orderRows.length === 0) return res.status(404).json({ message: 'Order not found' });
        const order = orderRows[0];
        const isAdmin = req.user && req.user.role === 'admin';
        if (!isAdmin) {
            // Only owner can cancel, within 10 minutes and when pending
            if (order.user_id !== userId) return res.status(403).json({ message: 'You are not allowed to cancel this order' });
            if (order.status !== 'pending') return res.status(400).json({ message: 'Order cannot be cancelled at this stage' });
            const createdAt = new Date(order.created_at);
            const now = new Date();
            const diffMinutes = (now - createdAt) / (1000 * 60);
            if (diffMinutes > 10) return res.status(400).json({ message: 'Cancellation window has expired' });
        } else {
            // Admin may cancel any order unless already cancelled
            if (order.status === 'cancelled') return res.status(400).json({ message: 'Order already cancelled' });
        }
        // Fetch order items
        const [items] = await conn.query('SELECT product_id, quantity, product_name, price FROM order_items WHERE order_id = ?', [orderId]);
        // Begin transaction
        await conn.beginTransaction();
        let restoreLog = [];
        if (items && items.length > 0) {
            for (const it of items) {
                const [r] = await conn.query('UPDATE products SET stock = stock + ? WHERE id = ?', [it.quantity, it.product_id]);
                restoreLog.push({ product_id: it.product_id, quantity: it.quantity, affectedRows: r.affectedRows });
                if (!r || r.affectedRows === 0) {
                    console.error(`[RESTORE FAIL] product_id=${it.product_id} not updated`);
                } else {
                    console.log(`[RESTORE OK] product_id=${it.product_id} +${it.quantity}`);
                }
            }
        }
        // Update order status to cancelled
        await conn.query('UPDATE orders SET status = ? WHERE id = ?', ['cancelled', orderId]);
        // Commit transaction
        await conn.commit();
        // Log final stocks for all products in the cancelled order
        if (items && items.length > 0) {
            const ids = items.map(i => i.product_id);
            if (ids.length > 0) {
                const ph = ids.map(() => '?').join(',');
                const [rows] = await conn.query(`SELECT id, name, stock FROM products WHERE id IN (${ph})`, ids);
                console.log(`[STOCK AFTER CANCEL]`, rows);
            }
        }
        // After commit: attempt refund if payment captured/settled
        const paymentStatus = order.payment_status || '';
        const txId = order.midtrans_transaction_id || order.midtrans_order_id;
        if (paymentStatus && ['capture','settlement','settlement_pending','settled','paid'].includes(paymentStatus) && txId) {
            try {
                const refundRes = await refundPayment(txId, order.total_price, 'Customer cancellation');
                if (refundRes.success) {
                    // Persist refund info (non-transactional)
                    await conn.query('UPDATE orders SET refund_status = ?, refund_response = ? WHERE id = ?', ['refunded', JSON.stringify(refundRes.data || refundRes), orderId]);
                    // Notify admins and customer about refund asynchronously
                    const [admins] = await conn.query('SELECT email, name FROM admin');
                    if (admins && admins.length > 0) {
                        const adminEmails = admins.map(a => a.email).filter(Boolean);
                        const [cRes] = await conn.query('SELECT name, email FROM customers WHERE id = ?', [order.user_id]);
                        const customerName = (cRes && cRes[0] && cRes[0].name) ? cRes[0].name : 'Customer';
                        try { await sendAdminRefundEmail(adminEmails, customerName, orderId, items, order.total_price); } catch (e) { console.error('sendAdminRefundEmail error:', e); }
                        const customerEmail = (cRes && cRes[0] && cRes[0].email) ? cRes[0].email : null;
                        if (customerEmail) {
                            try { await sendStatusUpdateEmail(customerEmail, orderId, 'refunded'); } catch (e) { console.error('sendStatusUpdateEmail error:', e); }
                        }
                    }
                } else {
                    console.error('Refund failed during cancel:', refundRes.error || refundRes);
                }
            } catch (refundErr) {
                console.error('Error attempting refund during cancel:', refundErr);
            }
        }

        // Notify admins about cancellation
        try {
            const [admins] = await conn.query('SELECT email, name FROM admin');
            if (admins && admins.length > 0) {
                const adminEmails = admins.map(a => a.email).filter(Boolean);
                const [cRes] = await conn.query('SELECT name, email FROM customers WHERE id = ?', [order.user_id]);
                const customerName = (cRes && cRes[0] && cRes[0].name) ? cRes[0].name : 'Customer';
                try { await sendAdminCancellationEmail(adminEmails, customerName, orderId, items, order.total_price); } catch (e) { console.error('sendAdminCancellationEmail error:', e); }
            }
        } catch (notifyErr) {
            console.error('Error fetching admin emails for notification:', notifyErr);
        }

        return res.json({ message: 'Order cancelled successfully' });

    } catch (err) {
        console.error('cancelOrder general error:', err);
        try { await conn.rollback(); } catch (rbErr) { console.error('Rollback error:', rbErr); }
        return res.status(500).json({ message: 'Failed to cancel order', error: err.message || err });
    }
};

// NEW: Admin-triggered refund
export const refundOrder = async (req, res) => {
    const user = req.user;
    const orderId = req.params.id;

    // only admin
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });

    try {
        db.query('SELECT * FROM orders WHERE id = ?', [orderId], async (err, results) => {
            if (err) return res.status(500).json({ message: 'DB error' });
            if (!results.length) return res.status(404).json({ message: 'Order not found' });
            const order = results[0];
            const txId = order.midtrans_transaction_id || order.midtrans_order_id;
            if (!txId) return res.status(400).json({ message: 'No payment transaction associated with this order' });

            // attempt refund via paymentService
            const refundRes = await refundPayment(txId, order.total_price, 'Admin refund');
            if (!refundRes.success) {
                return res.status(500).json({ message: 'Refund failed', error: refundRes.error || refundRes });
            }

            // update order status and record refund info
            db.query('UPDATE orders SET status = ?, refund_status = ?, refund_response = ? WHERE id = ?', ['refunded', 'refunded', JSON.stringify(refundRes.data || refundRes), orderId], (uErr) => {
                if (uErr) return res.status(500).json({ message: 'Failed to update order after refund' });

                // notify admins + customer
                db.query('SELECT email FROM admin', async (admErr, admins) => {
                    const adminEmails = (!admErr && admins) ? admins.map(a => a.email).filter(Boolean) : [];
                    let customerEmail = null;
                    db.query('SELECT email, name FROM customers WHERE id = ?', [order.user_id], async (cErr, cRes) => {
                        if (!cErr && cRes && cRes[0]) customerEmail = cRes[0].email;
                        try {
                            if (adminEmails.length) await sendAdminRefundEmail(adminEmails, cRes && cRes[0] ? cRes[0].name : 'Customer', orderId, [], order.total_price);
                        } catch (mailErr) { console.error('Failed admin refund mail:', mailErr); }
                        try { if (customerEmail) await sendStatusUpdateEmail(customerEmail, orderId, 'refunded'); } catch(e){console.error('Failed customer refund mail',e)}
                        return res.json({ message: 'Refund processed and order updated' });
                    });
                });
            });
        });
    } catch (err) {
        console.error('Refund order error:', err);
        return res.status(500).json({ message: 'Refund error', error: err.message });
    }
};