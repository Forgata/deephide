import { recorder } from "./core/profiler/recorder.js";
import { initialise } from "./utils/initialise.js";

try {
  initialise();

  await recorder();
} catch (error: unknown) {
  console.error(error);
}

process.on("SIGINT", () => process.exit());
