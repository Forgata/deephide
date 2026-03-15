import { randomBytes } from "node:crypto";
import { framePayload } from "./payload/framing.js";
import { loadFileToUint8 } from "./payload/Uint8FileReader.js";
import { deriveKey } from "./crypto/keyDerivation.js";
import { encryptPayload } from "./crypto/aes.js";
import { packetize } from "./payload/packer.js";
import { applyFEC } from "./fec/readSolomon.js";
import { interleave } from "./fec/interleave.js";
import { serialiseBits } from "./bitstream/serialiser.js";
import { injectPreamble } from "./bitstream/preamble.js";

/**
 * Prepares a payload for transmission by encrypting the contents of a file
 * with a password-derived key, FEC, interleaving the result, and
 * injecting a high-entropy sync preamble.
 * @param {string} filename The name of the file to be transmitted.
 * @param {string} password The password to be used for key derivation.
 * @returns {Promise<{finalBitStream: Uint8Array, salt: Uint8Array}>}
 */
export async function preparePayload(filename: string, password: string) {
  const rawBytes = await loadFileToUint8(filename);
  const framed = framePayload(rawBytes, filename);

  const salt = randomBytes(16);
  const key = await deriveKey(password, salt);

  const encrypted = encryptPayload(framed, key);

  const packets = packetize(encrypted, 256);

  const FEC_SHARDS = await applyFEC(packets, 6, 3);

  const interleaved = interleave(FEC_SHARDS, 6, 3);

  const payloadBits = serialiseBits(interleaved);

  const finalBitStream = injectPreamble(payloadBits);

  return { finalBitStream, salt };
}
