const QRCode = require("qrcode");

/**
 * Generate a QR code for a registration.
 * @param {string} registrationId  e.g. "EBIC-2026-7K9F2M"
 * @param {string} baseUrl         e.g. "http://localhost:5000"
 * @returns {Promise<{ qrCode: string, qrPayload: string }>}
 */
const generateQRCode = async (registrationId, baseUrl) => {
  const verifyUrl = `${baseUrl}/api/verify/${registrationId}`;
  const payload = JSON.stringify({
    id: registrationId,
    v: verifyUrl,
  });

  const qrCode = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: "H", // highest → survives smudges, damage
    margin: 1,
    width: 400,
    color: {
      dark: "#0B1E3D",
      light: "#FFFFFF",
    },
  });

  return { qrCode, qrPayload: payload };
};

module.exports = generateQRCode;
