import midtransClient from 'midtrans-client';
import dotenv from 'dotenv';

dotenv.config();

// --- Validation & Setup --------------------------------------------------
const { MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY, FRONTEND_URL } = process.env;

if (!MIDTRANS_SERVER_KEY || !MIDTRANS_CLIENT_KEY) {
    console.error("[MIDTRANS][FATAL] Server/Client key belum diset di .env. Tambahkan MIDTRANS_SERVER_KEY & MIDTRANS_CLIENT_KEY lalu restart server.");
}

const isProduction = false; // TODO: set true saat deploy production

const snap = new midtransClient.Snap({
    isProduction,
    serverKey: MIDTRANS_SERVER_KEY || '',
    clientKey: MIDTRANS_CLIENT_KEY || ''
});

// (Core API disiapkan jika nanti perlu charge / status detail lanjutan)
const core = new midtransClient.CoreApi({
    isProduction,
    serverKey: MIDTRANS_SERVER_KEY || '',
    clientKey: MIDTRANS_CLIENT_KEY || ''
});

/**
 * Normalisasi angka ke integer sesuai requirement Midtrans (gross_amount & item price harus integer)
 */
function toInt(value) {
    if (value === null || value === undefined) return 0;
    const n = Number(value);
    return Number.isNaN(n) ? 0 : Math.round(n);
}

/**
 * Bangun parameter transaksi untuk Snap.
 */
function buildTransactionParameter(orderId, grossAmount, customerDetails, itemDetails) {
    const safeGross = toInt(grossAmount);

    const safeItems = (itemDetails || []).map((it, idx) => ({
        id: String(it.id || idx + 1),
        price: toInt(it.price),
        quantity: toInt(it.quantity) || 1,
        name: String(it.name || `Item-${idx + 1}`).substring(0, 50)
    }));

    return {
        transaction_details: {
            order_id: `ORDER-${orderId}-${Date.now()}`.substring(0, 48), // <=50 chars
            gross_amount: safeGross
        },
        customer_details: {
            first_name: customerDetails?.first_name || customerDetails?.name || 'Customer',
            email: customerDetails?.email || 'noemail@example.com',
            phone: customerDetails?.phone || '08123456789'
        },
        item_details: safeItems.length ? safeItems : [{
            id: 'ITEM-1', price: safeGross, quantity: 1, name: 'Order Payment'
        }],
        credit_card: { secure: true },
        enabled_payments: [
            'credit_card','bca_va','bni_va','bri_va','permata_va','other_va','gopay','shopeepay','qris'
        ],
        callbacks: {
            finish: `${FRONTEND_URL || 'http://localhost:3000'}/payment/success/${orderId}`,
            error: `${FRONTEND_URL || 'http://localhost:3000'}/payment/error/${orderId}`,
            pending: `${FRONTEND_URL || 'http://localhost:3000'}/payment/pending/${orderId}`
        }
    };
}

// --- Create Snap Token ---------------------------------------------------
export const createPaymentToken = async (orderId, grossAmount, customerDetails, itemDetails) => {
    if (!MIDTRANS_SERVER_KEY || !MIDTRANS_CLIENT_KEY) {
        return { success: false, error: 'Midtrans keys missing in server configuration' };
    }

    try {
        const parameter = buildTransactionParameter(orderId, grossAmount, customerDetails, itemDetails);

        console.log('[MIDTRANS] Creating transaction:', {
            order_id: parameter.transaction_details.order_id,
            gross_amount: parameter.transaction_details.gross_amount,
            item_count: parameter.item_details.length,
            enabled_payments: parameter.enabled_payments
        });

        const transaction = await snap.createTransaction(parameter);

        // Basic sanity check
        if (!transaction?.token) {
            console.error('[MIDTRANS][WARN] Response tidak mengandung token:', transaction);
            return { success: false, error: 'Midtrans tidak mengembalikan token' };
        }

        return {
            success: true,
            token: transaction.token,
            redirectUrl: transaction.redirect_url,
            midtrans_order_id: parameter.transaction_details.order_id
        };
    } catch (error) {
        // Tangkap detail error Midtrans jika ada
        const apiMessage = error?.ApiResponse?.status_message || error?.message || 'Unknown error';
        console.error('[MIDTRANS][ERROR] Gagal membuat token:', apiMessage, '\nRaw:', error?.ApiResponse || error);
        return {
            success: false,
            error: apiMessage
        };
    }
};

// --- Webhook / Notification Handler --------------------------------------
export const handlePaymentNotification = async (notificationJson) => {
    try {
        if (!MIDTRANS_SERVER_KEY) {
            throw new Error('Server key missing for notification handling');
        }
        const statusResponse = await snap.transaction.notification(notificationJson);
        const { order_id, transaction_status, fraud_status } = statusResponse;

        console.log('[MIDTRANS][NOTIF]', {
            order_id, transaction_status, fraud_status
        });

        let orderStatus = 'pending';
        if (transaction_status === 'capture') {
            orderStatus = (fraud_status === 'challenge') ? 'pending' : 'processing';
        } else if (transaction_status === 'settlement') {
            orderStatus = 'processing';
        } else if (['cancel','deny','expire'].includes(transaction_status)) {
            orderStatus = 'cancelled';
        } else if (transaction_status === 'pending') {
            orderStatus = 'pending';
        }

        return {
            success: true,
            orderId: order_id.replace('ORDER-','').split('-')[0],
            status: orderStatus,
            transactionStatus: transaction_status,
            fraudStatus: fraud_status
        };
    } catch (error) {
        const msg = error?.ApiResponse?.status_message || error.message;
        console.error('[MIDTRANS][NOTIF][ERROR]', msg, error?.ApiResponse || '');
        return { success: false, error: msg };
    }
};

// --- Manual Status Check --------------------------------------------------
export const checkPaymentStatus = async (snapOrderId) => {
    try {
        if (!MIDTRANS_SERVER_KEY) {
            throw new Error('Server key missing for status check');
        }
        const statusResponse = await snap.transaction.status(snapOrderId);
        return {
            success: true,
            status: statusResponse.transaction_status,
            data: statusResponse
        };
    } catch (error) {
        const msg = error?.ApiResponse?.status_message || error.message;
        console.error('[MIDTRANS][STATUS][ERROR]', msg);
        return { success: false, error: msg };
    }
};

// --- Refund --------------------------------------------------------------
export const refundPayment = async (midtransOrderId, refundAmount, reason = 'refund') => {
    if (!MIDTRANS_SERVER_KEY) {
        return { success: false, error: 'Midtrans server key missing' };
    }

    try {
        const params = {
            transaction_id: String(midtransOrderId),
            refund_amount: toInt(refundAmount),
            reason
        };

        // Try common refund methods depending on client version
        let result = null;
        if (typeof core.refund === 'function') {
            result = await core.refund(params);
        } else if (core.transactions && typeof core.transactions.refund === 'function') {
            result = await core.transactions.refund(params);
        } else if (typeof core.transaction === 'object' && typeof core.transaction.refund === 'function') {
            result = await core.transaction.refund(params);
        } else {
            throw new Error('Refund API not available in Midtrans client version');
        }

        return { success: true, data: result };
    } catch (error) {
        const msg = error?.ApiResponse?.status_message || error?.message || 'Unknown error during refund';
        console.error('[MIDTRANS][REFUND][ERROR]', msg, error?.ApiResponse || error);
        return { success: false, error: msg, raw: error };
    }
};

export default { createPaymentToken, handlePaymentNotification, checkPaymentStatus, refundPayment };
