const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // true for 465, false for 587 (STARTTLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const isDryRun = () => process.env.DRY_RUN === "true";

const sendMail = async (options) => {
  if (isDryRun()) {
    console.log("\n📧 DRY RUN — email would be sent:");
    console.log("  To:", options.to);
    console.log("  Subject:", options.subject);
    console.log("  (HTML body omitted)\n");
    return { dryRun: true, messageId: "dry-run" };
  }
  return transporter.sendMail(options);
};

module.exports = { transporter, sendMail, isDryRun };
