import CryptoJS from "crypto-js";

export function decryptAESClient(
  encryptedBase64: string,
  tokenS: string,
): string {
  const keyWA =
    tokenS.length === 16
      ? CryptoJS.enc.Utf8.parse(tokenS)
      : CryptoJS.MD5(CryptoJS.enc.Utf8.parse(tokenS));
  const iv = keyWA;
  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: CryptoJS.enc.Base64.parse(encryptedBase64) } as any,
    keyWA,
    { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 },
  );
  const plaintext = CryptoJS.enc.Utf8.stringify(decrypted);
  if (!plaintext) throw new Error("Decryption failed or empty plaintext");
  return plaintext;
}

export function decryptUnknownClient(
  encryptedBase64: string,
  tokenS: string,
): unknown {
  try {
    const text = decryptAESClient(encryptedBase64, tokenS);
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (e) {
    console.error("[Decrypt] Failed:", e);
    return null;
  }
}

export function decryptLandingData(encryptedBase64: string): any {
  const realToken = process.env.NEXT_PUBLIC_AES_TOKEN || "";
  if (!realToken) console.error("Missing NEXT_PUBLIC_AES_TOKEN");
  return decryptUnknownClient(encryptedBase64, realToken);
}

// For plain text results like subscribe URL (no JSON parsing)
export function decryptPlainText(encryptedBase64: string): string | null {
  try {
    const realToken = process.env.NEXT_PUBLIC_AES_TOKEN || "";
    if (!realToken) {
      console.error("Missing NEXT_PUBLIC_AES_TOKEN");
      return null;
    }
    return decryptAESClient(encryptedBase64, realToken);
  } catch (e) {
    console.error("[decryptPlainText] Failed:", e);
    return null;
  }
}

export function decryptTriple(
  encryptedText: string,
  secretKey: string,
): string | null {
  try {
    const key = CryptoJS.enc.Utf8.parse(secretKey);
    const encryptedWA = CryptoJS.enc.Base64.parse(encryptedText);

    const decrypted = CryptoJS.TripleDES.decrypt(
      { ciphertext: encryptedWA } as any,
      key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      },
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("[decryptTriple] Failed:", error);
    return null;
  }
}

export function decryptVideoPath(encryptedBasePath: string): string | null {
  try {
    if (!encryptedBasePath) return "";

    const realToken = process.env.NEXT_PUBLIC_AES_TOKEN || "";
    if (!realToken) {
      console.error("[decryptVideoPath] Missing NEXT_PUBLIC_AES_TOKEN");
      return null;
    }
    const aesDecrypted = decryptAESClient(encryptedBasePath, realToken);

    if (!aesDecrypted) {
      console.error("[decryptVideoPath] AES decryption returned empty");
      return null;
    }

    const tripleKey = process.env.NEXT_PUBLIC_TRIPLE_DES_KEY || "";
    if (!tripleKey) {
      console.error("[decryptVideoPath] Missing NEXT_PUBLIC_TRIPLE_DES_KEY");
      return null;
    }

    return decryptTriple(aesDecrypted, tripleKey);
  } catch (e) {
    console.error("[decryptVideoPath] Error:", e);
    return null;
  }
}
