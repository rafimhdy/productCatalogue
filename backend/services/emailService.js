import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendVerificationEmail = async (to, token) => {
    const verificationUrl = `http://localhost:5000/api/customers/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: "Email Verification",
        html: `
            <h1>Welcome!</h1>
            <p>Thanks for registering. Please verify your email by clicking the link below:</p>
            <a href="${verificationUrl}">Verify Email</a>
            <p>This link will expire in 1 hour.</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Verification email sent to:", to);
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw new Error("Failed to send verification email");
    }
};

export const sendOrderConfirmationEmail = async (to, customerName, orderId, items, totalPrice) => {
    const waMessage = generateWhatsAppMessage(items, totalPrice);
    const waLink = `https://wa.me/6281234567890?text=${encodeURIComponent(waMessage)}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: `Order Confirmation #${orderId}`,
        html: `
            <h1>Hi ${customerName},</h1>
            <p>Thank you for your order! Your order ID is <strong>#${orderId}</strong>.</p>
            
            <h3>Order Summary:</h3>
            <ul>
                ${items.map(item => `<li>${item.name} (x${item.quantity}) - Rp ${item.price.toLocaleString()}</li>`).join('')}
            </ul>
            <p><strong>Total: Rp ${totalPrice.toLocaleString()}</strong></p>

            <p>To complete your payment, please click the link below to contact us via WhatsApp:</p>
            <a href="${waLink}" style="background-color: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Pay with WhatsApp
            </a>

            <p>Thank you for shopping with us!</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Order confirmation email sent to:", to);
    } catch (error) {
        console.error("Error sending order confirmation email:", error);
        throw new Error("Failed to send order confirmation email");
    }
};

export const sendStatusUpdateEmail = async (to, orderId, newStatus) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: `Your Order #${orderId} has been ${newStatus}`,
        html: `
            <h1>Order Status Update</h1>
            <p>Hi there,</p>
            <p>The status of your order <strong>#${orderId}</strong> has been updated to: <strong>${newStatus.toUpperCase()}</strong>.</p>
            <p>Thank you for your patience.</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Status update email sent to ${to} for order ${orderId}`);
    } catch (error) {
        console.error("Error sending status update email:", error);
        throw new Error("Failed to send status update email");
    }
};

export const sendAdminCancellationEmail = async (toList, customerName, orderId, items, totalPrice) => {
    if (!Array.isArray(toList)) toList = [toList];
    const to = toList.join(',');

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: `Order Cancelled by Customer #${orderId}`,
        html: `
            <h1>Order Cancelled</h1>
            <p>Customer <strong>${customerName}</strong> has cancelled order <strong>#${orderId}</strong>.</p>
            <h3>Order Summary:</h3>
            <ul>
                ${items.map(item => `<li>${item.product_name || item.name} (x${item.quantity}) - Rp ${item.price?.toLocaleString ? item.price.toLocaleString() : item.price}</li>`).join('')}
            </ul>
            <p><strong>Total: Rp ${totalPrice?.toLocaleString ? totalPrice.toLocaleString() : totalPrice}</strong></p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Admin cancellation email sent to:', to);
    } catch (error) {
        console.error('Error sending admin cancellation email:', error);
        throw new Error('Failed to send admin notification');
    }
};

export const sendAdminRefundEmail = async (toList, customerName, orderId, items, totalPrice) => {
    if (!Array.isArray(toList)) toList = [toList];
    const to = toList.join(',');

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: `Order Refunded #${orderId}`,
        html: `
            <h1>Order Refunded</h1>
            <p>Customer <strong>${customerName}</strong> has been refunded for order <strong>#${orderId}</strong>.</p>
            <h3>Order Summary:</h3>
            <ul>
                ${items.map(item => `<li>${item.product_name || item.name} (x${item.quantity}) - Rp ${item.price?.toLocaleString ? item.price.toLocaleString() : item.price}</li>`).join('')}
            </ul>
            <p><strong>Total Refunded: Rp ${totalPrice?.toLocaleString ? totalPrice.toLocaleString() : totalPrice}</strong></p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Admin refund email sent to:', to);
    } catch (error) {
        console.error('Error sending admin refund email:', error);
        throw new Error('Failed to send admin refund notification');
    }
};

const generateWhatsAppMessage = (items, totalPrice) => {
    const itemsList = items.map(item => `- ${item.name} (x${item.quantity})`).join('\n');
    return `
Hello, I would like to confirm my order.
Here are the details:
${itemsList}

Total: Rp ${totalPrice.toLocaleString()}

Please provide payment instructions. Thank you!
    `.trim();
};
