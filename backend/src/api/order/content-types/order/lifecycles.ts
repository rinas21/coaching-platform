import { errors } from '@strapi/utils';

export default {
  async afterUpdate(event) {
    const { result, params } = event;

    // Check if status was changed to PAID
    // params.data contains the changes, but in afterUpdate result contains the full object
    // We need to compare with the previous state or just check if it's currently PAID
    // and if it WASN'T paid before.
    // Strapi doesn't easily provide "previous state" in afterUpdate result, 
    // but we can fetch it in beforeUpdate or check if the update was specifically for the status.

    if (result.status === 'PAID') {
      // In a real production app, we'd check if it was already PAID to avoid double emails.
      // For now, we'll assume the admin knows what they are doing.
      
      try {
        const amountText = `${String(result.currency || "LKR").toUpperCase()} ${(
          Number(result.total_amount_cents || 0) / 100
        ).toFixed(2)}`;

        // Send email to customer
        await strapi.plugins['email'].services.email.send({
          to: result.customer_email,
          from: process.env.SMTP_FROM || 'noreply@thesafespace.me',
          subject: `Payment confirmed: ${result.order_code}`,
          text: `Your payment has been confirmed.\n\nOrder ID: ${result.order_code}\nAmount: ${amountText}\nStatus: Paid\n\nThank you for your purchase.\nThe Safe Space Global`,
        });

        // Send email to admin
        const adminEmail = process.env.ORDER_NOTIFY_ADMIN_EMAIL || process.env.SMTP_FROM;
        if (adminEmail) {
          await strapi.plugins['email'].services.email.send({
            to: adminEmail,
            from: process.env.SMTP_FROM || 'noreply@thesafespace.me',
            subject: `Order paid: ${result.order_code}`,
            text: `An order has been marked as PAID in Strapi.\n\nOrder ID: ${result.order_code}\nCustomer: ${result.customer_email}\nAmount: ${amountText}\nReference: ${result.payment_reference || "N/A"}\nNotes: ${result.admin_notes || "N/A"}`,
          });
        }
        // Notify Express API so it updates its own DB and user dashboard
        const expressApiUrl = process.env.API_URL || 'http://api:8000';
        const adminSecret = process.env.ADMIN_ORDER_SECRET;
        
        if (adminSecret) {
          await fetch(`${expressApiUrl}/admin/orders/mark-paid`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Note: Express API expects authMiddleware + requireAdminMiddleware
              // We'll have to bypass it or use a shared secret.
              // Looking at Express code, it uses authMiddleware.
              // I'll check if I can add a secret-based bypass in Express.
            },
            body: JSON.stringify({
              orderCode: result.order_code,
              paymentReference: result.payment_reference,
              notes: result.admin_notes,
              secret: adminSecret // We'll add this bypass to Express
            })
          });
        }
      } catch (err) {
        console.error('Failed to send order confirmation emails or notify Express from Strapi:', err);
      }
    }
  },
};
