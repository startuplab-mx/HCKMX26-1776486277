const SAFE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" as const;

export function generatePairingOtp(length = 6): string {
  const n = Math.max(1, Math.floor(length));
  let out = "";
  for (let i = 0; i < n; i += 1) {
    out += SAFE_ALPHABET[Math.floor(Math.random() * SAFE_ALPHABET.length)];
  }
  return out;
}

export function normalizePairingOtp(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.trim().toUpperCase();
}

export function isValidPairingOtpFormat(otp: string, length = 6): boolean {
  if (typeof otp !== "string") return false;
  if (otp.length !== length) return false;
  for (let i = 0; i < otp.length; i += 1) {
    if (!SAFE_ALPHABET.includes(otp[i] as (typeof SAFE_ALPHABET)[number])) return false;
  }
  return true;
}

