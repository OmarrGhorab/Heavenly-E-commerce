import nodemailer from 'nodemailer';

// Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

// Constants
const COMPANY_NAME = 'Heavenly';
const BRAND_COLOR = '#007bff';
const CURRENT_YEAR = new Date().getFullYear();

// Email Styles
const emailStyles = {
  body: 'font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;',
  container: 'background-color: #ffffff; border-radius: 8px; padding: 20px; max-width: 600px; margin: auto; box-shadow: 0 2px 4px rgba(0,0,0,0.1);',
  header: 'font-size: 24px; margin-bottom: 20px; color: #333333;',
  content: 'font-size: 16px; line-height: 1.5; color: #555555;',
  button: `display: inline-block; padding: 10px 20px; margin-top: 20px; background-color: ${BRAND_COLOR}; color: #ffffff; text-decoration: none; border-radius: 4px;`,
  footer: 'font-size: 12px; color: #777777; margin-top: 20px; text-align: center;'
};

// Template Generator
const EmailTemplates = {
  base: (title, content, button = null) => `
    <html>
      <head>
        <style>
          body { ${emailStyles.body} }
          .email-container { ${emailStyles.container} }
          .header { ${emailStyles.header} }
          .logo { display: block; margin: 0 auto; width: 100px; } /* Adjust size as needed */
          .content { ${emailStyles.content} }
          .button { ${emailStyles.button} }
          .footer { ${emailStyles.footer} }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="content">
            ${content}
            ${button ? `<a class="button" href="${button.link}">${button.text}</a>` : ''}
          </div>
          <div class="footer">
            © ${CURRENT_YEAR} ${COMPANY_NAME}. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `,

verification: (verificationLink) => ({
  subject: 'Email Verification',
  content: `
    <p>Hi there,</p>
    <p>Please verify your email by clicking the link below:</p>
    <p><a href="${verificationLink}">Verify Email</a></p>
    <p>This link will expire in 15 minutes.</p>
    <p>If you didn’t request this verification, please ignore this email.</p>
    <p>Thanks!</p>
  `,
  textContent: `
    Hi there,

    Please verify your email by clicking the link below:
    ${verificationLink}

    This link will expire in 15 minutes.

    If you didn’t request this verification, please ignore this email.

    Thanks!
  `
}),

passwordReset: (resetLink) => ({
  subject: 'Password Reset Request',
  content: `
    <p>Hi,</p>
    <p>You requested a password reset. Please click the link below to reset your password:</p>
    <p><a href="${resetLink}">Reset Password</a></p>
    <p>This link will expire in 15 minutes.</p>
    <p>If you didn’t request this password reset, please ignore this email.</p>
    <p>Thanks!</p>
  `,
  textContent: `
    Hi,

    You requested a password reset. Please click the link below to reset your password:
    ${resetLink}

    This link will expire in 15 minutes.

    If you didn’t request this password reset, please ignore this email.

    Thanks!
  `,
  button: { text: 'Reset Password', link: resetLink }
}),
  
  orderConfirmation: (orderNumber, receiptURL) => ({
    subject: 'Order Confirmation',
    content: `
    <p>Thank you for your order!</p>
    <p>Your order number is <strong>${orderNumber}</strong>.</p>
    <p>We are processing your order and will notify you when it ships.</p>
    <p>Keep the Receipt for your order: <a href="${receiptURL}">View Receipt</a></p>
    `
  }),

  statusUpdate: (orderId, newStatus) => ({
    subject: 'Order Status Update',
    content: `
      <p>Your order (ID: <strong>${orderId}</strong>) status has been updated to:</p>
      <h3 style="color: ${BRAND_COLOR}; margin: 15px 0;">${newStatus}</h3>
      <p>Please check your account for more details.</p>
    `
  }),

  refundUpdate: (orderId, refundAmount) => ({
    subject: 'Refund Processed',
    content: `
      <p>We have processed a refund for your order (ID: <strong>${orderId}</strong>).</p>
      <p style="font-size: 18px; margin: 15px 0;">
        Refund amount: <strong>$${refundAmount.toFixed(2)}</strong>
      </p>
      <p>The refund should reflect in your account within 3-5 business days.</p>
    `
  }),

  cancellationConfirmation: (orderId) => ({
    subject: 'Order Cancellation Confirmation',
    content: `
      <p>Your order (ID: <strong>${orderId}</strong>) has been successfully cancelled money will be return in couple of days after 5% cancellation fee.</p>
      <p>If you have any questions, please contact our support team.</p>
    `
  })
};

// Email Sender Helper
const sendEmail = async (to, templateType, templateData) => {
  try {
    const template = EmailTemplates[templateType](...templateData);
    const html = EmailTemplates.base(
      template.subject,
      template.content,
      template.button
    );

    await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject: template.subject,
      html
    });

    console.log(`Email sent to ${to} (${templateType})`);
  } catch (error) {
    console.error(`Error sending ${templateType} email to ${to}:`, error);
    throw new Error(`Failed to send ${templateType} email`);
  }
};

// Public API
export const emailService = {
  sendVerificationEmail: (email, verificationLink) =>
    sendEmail(email, 'verification', [verificationLink]),

  sendPasswordResetEmail: (email, resetLink) =>
    sendEmail(email, 'passwordReset', [resetLink]),

  sendOrderConfirmationEmail: (email, orderNumber, receiptURL) =>
    sendEmail(email, 'orderConfirmation', [orderNumber, receiptURL]),

  sendStatusUpdateEmail: (email, orderId, newStatus) =>
    sendEmail(email, 'statusUpdate', [orderId, newStatus]),

  sendRefundUpdateEmail: (email, orderId, refundAmount) =>
    sendEmail(email, 'refundUpdate', [orderId, refundAmount]),

  sendCancellationConfirmationEmail: (email, orderId) =>
    sendEmail(email, 'cancellationConfirmation', [orderId])
};
