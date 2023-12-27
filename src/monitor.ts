import notifier, { NotificationMetadata } from 'node-notifier';
import { exec } from 'child_process';
import { join, basename } from 'path';
import { promisify } from 'util';
import findProcess from 'find-process';
import os from 'os';
import dotenv from 'dotenv';


dotenv.config();

let processFullPath = 'C:\\Program Files (x86)\\Crossover\\Crossover.exe';

// switch(os.platform()) {
//   case 'win32':
//     processFullPath = process.env.PROCESS_PATH_WINDOWS!;
//     break;
//   case 'linux':
//     processFullPath = process.env.PROCESS_PATH_LINUX!;
//     break;
//   case 'darwin':
//     processFullPath = process.env.PROCESS_PATH_MAC!;
//     break;
//   default:
//     console.error('Unsupported platform');
// }

const defaultTimeout = 5000;
const processName = basename(processFullPath);
const iconPath = join(__dirname, '../images/toast.png');
const execAsync = promisify(exec);

async function notifyUser(message: string, actions: string[]) {
  return new Promise<{err: Error | null, response: string, metadata?: NotificationMetadata}>((resolve, reject) => {
    notifier.notify({
      title: 'WorkSmart Alert',
      message,
      icon: iconPath,
      sound: true,
      wait: true,
      actions
    }, (err, response, metadata) => {
      if (err) {
        reject({ err, response, metadata });
      } else {
        resolve({ err, response, metadata });
      }
    });
  });
}

async function restartProcess() {
  try {
    const { stdout } = await execAsync(`"${processFullPath}"`);
    console.log(`Restarted process stdout:`, stdout);
  } catch (err) {
    console.error(`Could not restart ${processName}: ${err}`);
  }
}

async function checkProcess() {
  try {
    const list = await findProcess('name', processName);
    if (list.length === 0) {
      console.log(`${processName} is not running`);
      const { err, response, metadata } = await notifyUser(`WorkSmart has stopped running!`, ['Restart', 'Stop checking']);
      console.debug('Notification response:', response)
      if (err) {
        console.error('WorkSmart Alert failure', {err, response, metadata});
      }
      if (response === 'restart') {
        console.log(`Restarting ${processName}`)
        await restartProcess();
      } else if (response === 'stop checking') {
        console.log('Stopping WorkSmart Checker');
        process.exit(0);
        return;
      }
    } else {
      console.log(`${processName} is running`);
    }
  } catch (err) {
    console.error(`Could not check process status: ${err}`);
  }
  interval = setTimeout(checkProcess, defaultTimeout);
}

console.log(`Starting WorkSmart Checker`);
notifyUser(`WorkSmart Checker is started`, []);
let interval = setTimeout(checkProcess, defaultTimeout);
