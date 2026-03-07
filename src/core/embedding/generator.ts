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
