const { sendMail } = require("./mailer");
const buildConfirmationEmail = require("./buildConfirmationEmail");

/**
 * Send the confirmation email with embedded QR code.
 * Returns { ok: boolean, error?: string }
 */
const sendConfirmationEmail = async (registration, conference) => {
  try {
    const built = buildConfirmationEmail(registration, conference);

    // Extract the base64 part of the data URL
    const base64 = registration.qrCode.replace(/^data:image\/png;base64,/, "");
    console.log("📤 Sending email to:", built.to);

    const info = await sendMail({
      from: process.env.EMAIL_FROM,
      to: built.to,
      subject: built.subject,
      text: built.text,
      html: built.html,
      attachments: [
        {
          filename: `QR-${registration.registrationId}.png`,
          content: base64,
          encoding: "base64",
          cid: "qrcode@conference", // matches <img src="cid:qrcode@conference">
        },
      ],
    });
    console.log("📬 SMTP accepted:", info.accepted);
    console.log("🚫 SMTP rejected:", info.rejected);
    console.log("📄 Response:", info.response);
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
    return { ok: false, error: err.message };
  }
};

module.exports = sendConfirmationEmail;
