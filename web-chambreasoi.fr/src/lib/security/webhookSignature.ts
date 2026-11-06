const SIGNATURE_HEADER_REGEX = /^t=(\d+)[, ]+v1=([^, ]+)$/;

/** Sanity sends millisecond Unix timestamps in `sanity-webhook-signature` (@sanity/webhook v4). */
const SANITY_MIN_TIMESTAMP_MS = 1609459200000;

export function parseSignatureHeader(signatureHeader: string | null): {
  timestamp: number;
  signature: string;
} | null {
  const [, timestampValue, signature] = signatureHeader?.trim().match(SIGNATURE_HEADER_REGEX) ?? [];
  const timestamp = Number(timestampValue);

  if (!signature || !Number.isFinite(timestamp)) {
    return null;
  }

  return { timestamp, signature };
}

export function isTimestampFresh(
  timestampMs: number,
  ttlSeconds: number,
  nowMs: number = Date.now()
): boolean {
  if (timestampMs < SANITY_MIN_TIMESTAMP_MS) {
    return false;
  }

  return Math.abs(nowMs - timestampMs) <= ttlSeconds * 1000;
}

export function timingSafeStringEqual(left: string, right: string): boolean {
  const encoder = new TextEncoder();
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);

  if (leftBytes.length !== rightBytes.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    diff |= leftBytes[index] ^ rightBytes[index];
  }

  return diff === 0;
}
