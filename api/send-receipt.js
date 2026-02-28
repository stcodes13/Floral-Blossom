import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    // Allow CORS for local dev
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { orderId, customerEmail, customerName, items, total, address } = req.body;

    // Validate required fields
    if (!orderId || !customerEmail || !customerName || !items || !total || !address) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const itemsHTML = items.map(item => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.title}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">&#8377;${item.price}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">&#8377;${item.price * item.quantity}</td>
        </tr>
    `).join('');

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #2d5147; color: white; padding: 20px; text-align: center; }
                .content { padding: 30px; background: #f8f6f3; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; }
                th { background: #2d5147; color: white; padding: 12px; text-align: left; }
                .total-row { font-weight: bold; font-size: 1.2em; background: #e8e4df; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">&#127800; Floral Blossom</h1>
                    <p style="margin: 5px 0 0 0;">Order Confirmation</p>
                </div>
                <div class="content">
                    <h2>Thank you for your order!</h2>
                    <p>Dear ${customerName},</p>
                    <p>Your order has been received and is being processed. Here are your order details:</p>
                    <h3>Order #${orderId}</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th style="text-align: center;">Quantity</th>
                                <th style="text-align: right;">Price</th>
                                <th style="text-align: right;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHTML}
                            <tr class="total-row">
                                <td colspan="3" style="padding: 12px; text-align: right;">Total:</td>
                                <td style="padding: 12px; text-align: right;">&#8377;${total}</td>
                            </tr>
                        </tbody>
                    </table>
                    <h3>Delivery Address:</h3>
                    <p style="background: white; padding: 15px; border-left: 4px solid #2d5147;">
                        ${address}
                    </p>
                    <h3>Payment Method:</h3>
                    <p>Cash on Delivery</p>
                    <p style="margin-top: 30px;">Your flowers will be delivered within 2-3 business days.</p>
                    <p>For any queries, contact us at:<br>
                        &#128231; floralblossom@gmail.com<br>
                        &#128222; 9973729290<br>
                        &#128205; Lokmanya Nagar, Parbhani, Maharashtra 431401
                    </p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 Floral Blossom. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        const { data, error } = await resend.emails.send({
            // OPTION A (no custom domain): Can only send to YOUR OWN verified email on free plan
            // from: 'Floral Blossom <onboarding@resend.dev>',

            // OPTION B (recommended): Use your verified domain on Resend
            // Replace with: 'Floral Blossom <noreply@yourdomain.com>'
            from: 'Floral Blossom <onboarding@resend.dev>',

            to: customerEmail,
            subject: `Order Confirmation #${orderId} - Floral Blossom`,
            html: html
        });

        if (error) {
            console.error('Resend API error:', error);
            return res.status(500).json({ error: error.message });
        }

        console.log('Email sent successfully, ID:', data?.id);
        return res.status(200).json({ success: true, emailId: data?.id });

    } catch (error) {
        console.error('Email error:', error);
        return res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
}
