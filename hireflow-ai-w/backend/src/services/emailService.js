const nodemailer = require('nodemailer');
const config = require('../config/env');

/**
 * Send email using Nodemailer
 * @param {object} options - Email options ({ email, subject, message, html })
 */
const sendEmail = async (options) => {
  // If SMTP user is configured, send real email, otherwise fallback to mock log for development
  if (config.smtp.user && config.smtp.user !== 'your_smtp_username') {
    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });

    const mailOptions = {
      from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Sent]: Message ID: ${info.messageId}`);
    return info;
  } else {
    console.log('====================================================');
    console.log(`[DEV MODE - EMAIL NOT SENT TO REAL SMTP]`);
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.message}`);
    console.log('====================================================');
    return { mock: true, recipient: options.email };
  }
};

module.exports = {
  sendEmail,
};
