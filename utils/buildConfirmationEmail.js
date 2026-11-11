const buildConfirmationEmail = (registration, conference) => {
  const {
    fullName,
    registrationId,
    registrationCategory,
    areaOfInterest,
    email,
    qrCode,
  } = registration;

  const eventName =
    conference?.eventName || "Ethio Bridge Investment Conference 2026";
  const theme = conference?.theme || "Invest • Trade • Partner • Grow";
  const date = conference?.date || "December 5–6, 2026";
  const venue =
    conference?.venue || "Unity Park – Science Museum, Addis Ababa, Ethiopia";
  const organizer = conference?.organizer || "Ethio Bridge Global Services PLC";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Registration Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:#0B1E3D;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:0.5px;">${eventName}</h1>
              <p style="margin:8px 0 0;color:#c9a34a;font-size:14px;letter-spacing:1px;">${theme}</p>
            </td>
          </tr>

          <!-- Confirmation -->
          <tr>
            <td style="padding:36px 40px 12px;">
              <h2 style="margin:0 0 12px;font-size:22px;color:#0B1E3D;">Registration Confirmed ✅</h2>
              <p style="margin:0 0 8px;font-size:15px;line-height:1.6;">Dear <strong>${fullName}</strong>,</p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
                Thank you for registering for <strong>${eventName}</strong>. Your participation has been recorded.
                Please present the QR code below at the entrance for check-in.
              </p>
            </td>
          </tr>

          <!-- QR Code -->
          <tr>
            <td style="padding:8px 40px 24px;text-align:center;">
              <div style="display:inline-block;padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;">
                <img src="cid:qrcode@conference" alt="Your QR Code" width="220" height="220" style="display:block;border-radius:8px;" />
                <p style="margin:12px 0 0;font-family:Consolas,Monaco,monospace;font-size:14px;color:#0B1E3D;font-weight:bold;letter-spacing:1px;">
                  ${registrationId}
                </p>
              </div>
              <p style="margin:14px 0 0;font-size:13px;color:#6b7280;">
                Your registration ID: <strong style="color:#0B1E3D;">${registrationId}</strong>
              </p>
            </td>
          </tr>

          <!-- Event details -->
          <tr>
            <td style="padding:0 40px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:10px;padding:4px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 8px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Event Details</p>
                    <p style="margin:0 0 6px;font-size:14px;"><strong>📅 Date:</strong> ${date}</p>
                    <p style="margin:0 0 6px;font-size:14px;"><strong>📍 Venue:</strong> ${venue}</p>
                    <p style="margin:0;font-size:14px;"><strong>🏢 Organizer:</strong> ${organizer}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Your info -->
          <tr>
            <td style="padding:0 40px 24px;">
              <p style="margin:0 0 8px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Your Registration</p>
              <p style="margin:0 0 4px;font-size:14px;"><strong>Category:</strong> ${registrationCategory}</p>
              <p style="margin:0;font-size:14px;"><strong>Areas of Interest:</strong> ${areaOfInterest.join(", ")}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 32px;border-top:1px solid #eef0f3;">
              <p style="margin:0 0 6px;font-size:12px;color:#6b7280;line-height:1.6;">
                Need to update your details or didn't request this email? Contact us at
                <a href="mailto:${process.env.EMAIL_USER}" style="color:#0B1E3D;">${process.env.EMAIL_USER}</a>.
              </p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} ${organizer}. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `Registration Confirmed

Dear ${fullName},

Thank you for registering for ${eventName}.
Your registration ID: ${registrationId}

Date: ${date}
Venue: ${venue}
Category: ${registrationCategory}
Areas of Interest: ${areaOfInterest.join(", ")}

Please present your QR code at the entrance for check-in.

${organizer}`;

  return {
    subject: `✅ Registration Confirmed — ${eventName} (${registrationId})`,
    html,
    text,
    to: email,
  };
};

module.exports = buildConfirmationEmail;
