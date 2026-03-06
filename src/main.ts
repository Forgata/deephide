import { preparePayload } from "./core/embedding/generator.js";
import { recorder } from "./core/profiler/recorder.js";
import { initialise } from "./utils/initialise.js";

async function start() {
  try {
    initialise();
    console.log("Preparing Bit Stream...");
    const { finalBitStream } = await preparePayload("file.txt", "1234");

    await recorder();
  } catch (error: unknown) {
    console.error(error);
  }
}

process.on("SIGINT", () => process.exit());

await start();
