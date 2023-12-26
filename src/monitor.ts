import notifier, { NotificationMetadata } from 'node-notifier';
import { exec } from 'child_process';
import { join } from 'path';
import { promisify } from 'util';

const processFullPath = 'C:\\Program Files (x86)\\Crossover\\Crossover.exe';
const processName = processFullPath.split('\\').pop()!;
const defaultTimeout = 5000;
const iconPath = join(__dirname, '../images/toast.png');
const execAsync = promisify(exec);

async function checkProcess() {
  try {
    const { stdout } = await execAsync(`tasklist`);
    if (!stdout.includes(processName)) {
      console.log(`${processName} is not running`);
      const { err, response, metadata } = await new Promise<{err: Error | null, response: string, metadata?: NotificationMetadata}>((resolve, reject) => {
        notifier.notify({
          title: 'WorkSmart Alert',
          message: `WorkSmart has stopped running!`,
          icon: iconPath,
          sound: true,
          wait: true,
          actions: ['Restart', 'Stop checking']
        }, (err, response, metadata) => {
          if (err) {
            reject({ err, response, metadata });
          } else {
            resolve({ err, response, metadata });
          }
        });
      });
      console.debug('Notification response:', response)
      if (err) {
        console.error('WorkSmart Alert failure', {err, response, metadata});
      }
      if (response === 'restart') {
        console.log(`Restarting ${processName}`)
        try {
          const { stdout } = await execAsync(`"${processFullPath}"`);
          console.log(`Restarted process stdout:`, stdout);
        } catch (err) {
          console.error(`Could not restart ${processName}: ${err}`);
        }
      } else if (response === 'stop checking') {
        console.log('Stopping WorkSmart Checker');
        process.exit(0);
        return;
      }
      interval = setTimeout(checkProcess, defaultTimeout);
    } else {
      console.log(`${processName} is running`);
      interval = setTimeout(checkProcess, defaultTimeout);
    }
  } catch (err) {
    console.error(`Could not check process status: ${err}`);
  }
}

console.log(`Starting WorkSmart Checker`);
notifier.notify({
  title: 'WorkSmart Checker',
  message: `WorkSmart Checker is started`,
  icon: iconPath,
});
let interval = setTimeout(checkProcess, defaultTimeout);
