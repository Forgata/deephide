import { PvRecorder } from "@picovoice/pvrecorder-node";
import chalk from "chalk";

export function initialise() {
  console.clear();
  const devices = PvRecorder.getAvailableDevices();
  console.log(
    chalk.bgRed(`RECORDING STARTED WITH DEFAULT DEVICE -- ${devices[0]}`),
  );
}
