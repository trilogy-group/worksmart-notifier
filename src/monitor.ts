import notifier from 'node-notifier';
import { exec } from 'child_process';

// Replace 'YOUR_PROCESS_NAME' with the name of the process you want to monitor
const processName = 'YOUR_PROCESS_NAME';

function checkProcess() {
  exec(`tasklist`, (err, stdout, stderr) => {
    if (err) {
      // handle error
      return;
    }

    if (!stdout.includes(processName)) {
      notifier.notify({
        title: 'Process Monitor',
        message: `${processName} has stopped running.`,
      });

      // Stop checking once the process has stopped
      clearInterval(interval);
    }
  });
}

// Check every 30 seconds
const interval = setInterval(checkProcess, 30000);
