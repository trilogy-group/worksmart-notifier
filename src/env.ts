import dotenv from 'dotenv';
import { basename } from 'path';
import os from 'os';

dotenv.config();

let processFullPath = process.env.WORKSMART_PROCESS_PATH;
if (!processFullPath) {
  switch (os.platform()) {
    case 'win32':
      processFullPath = 'C:\\Program Files (x86)\\Crossover\\Crossover.exe';
      break;
    default:
      throw new Error('Unsupported platform, please use WORKSMART_PROCESS_PATH to define path to the application.');
  }
}

const processName = basename(processFullPath);

export { processFullPath, processName };