const Registration = require("../models/Registration");
const crypto = require("crypto");

// Alphabet without ambiguous characters (no 0/O, 1/I/L)
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const randomChunk = (length = 6) => {
  let out = "";
  while (out.length < length) {
    // crypto.randomInt is cryptographically secure
    out += ALPHABET[crypto.randomInt(0, ALPHABET.length)];
  }
  return out;
};

const generateRegistrationId = async () => {
  const year = new Date().getFullYear();
  const prefix = `EBIC-${year}-`;

  // Try up to 10 times to get a non-colliding ID
  for (let attempt = 0; attempt < 10; attempt++) {
    const id = `${prefix}${randomChunk(6)}`;
    const exists = await Registration.exists({ registrationId: id });
    if (!exists) return id;
  }

  // Extremely unlikely fallback: use 8 chars instead of 6
  return `${prefix}${randomChunk(8)}`;
};

module.exports = generateRegistrationId;
