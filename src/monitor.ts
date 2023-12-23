import notifier from 'node-notifier';
import { exec } from 'child_process';

const processName = 'Crossover.exe';
const processFullPath = 'C:\\Program Files (x86)\\Crossover\\Crossover.exe';

function checkProcess() {
  exec(`tasklist`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Could not check process status: ${err}`);
      return;
    }

    if (!stdout.includes(processName)) {
      notifier.notify({
        title: 'WorkSmart Alert',
        message: `WorkSmart has stopped running!`,
        sound: true,
        wait: true,
        actions: ['restart', 'stop listening']
      }, function (err, response, metadata) {
        if (response === 'restart') {
          exec(`start "${processFullPath}"`, (err, stdout, stderr) => {
            if (err) {
              console.error(`Could not restart ${processName}: ${err}`);
            }
          });
      } else if (response === 'stop listening') {
        // Stop checking
        clearInterval(interval);
        console.log('Stopped checking process status');
      }
      });
    }
  });
}

const interval = setInterval(checkProcess, 5000);
