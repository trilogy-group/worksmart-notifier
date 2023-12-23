import notifier from 'node-notifier';
import { exec } from 'child_process';

// Replace 'YOUR_PROCESS_NAME' with the name of the process you want to monitor
const processName = 'Crossover.exe';

function checkProcess() {
  exec(`tasklist`, (err, stdout, stderr) => {
    if (err) {
      // handle error
      return;
    }

    if (!stdout.includes(processName)) {
      notifier.notify({
        title: 'WorkSmart Alert',
        message: `WorkSmart has stopped running!`,
        sound: true,

      });

      // Stop checking once the process has stopped
      // clearInterval(interval);
    }
  });
}

// Check every 30 seconds
// const interval = setInterval(checkProcess, 30000);
const interval = setInterval(checkProcess, 1000);
