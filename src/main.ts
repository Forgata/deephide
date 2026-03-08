import { preparePayload } from "./core/embedding/generator.js";
import { recorder } from "./core/profiler/recorder.js";
import { initialise } from "./utils/initialise.js";

/**
 * Initializes the application, prepares a bit-stream payload from a file, and records the resulting stream.
 *
 * This function calls the initialization routine, prepares the payload (logging "Preparing Bit Stream..."), passes the resulting `finalBitStream` to the recorder, and catches any errors, logging them to the console.
 */
async function start() {
  try {
    initialise();
    console.log("Preparing Bit Stream...");
    const { finalBitStream } = await preparePayload("file.txt", "1234");

    await recorder(finalBitStream);
  } catch (error: unknown) {
    console.error(error);
  }
}

process.on("SIGINT", () => process.exit());

await start();
