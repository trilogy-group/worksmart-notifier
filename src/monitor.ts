import notifier from 'node-notifier';
import { exec } from 'child_process';

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
        wait: true,
        actions: ['restart', 'stop listening']
      }, function (err, response, metadata) {
        if (response === 'restart') {
          exec(`start ${processName}`, (err, stdout, stderr) => {
            if (err) {
              console.error(`Could not restart ${processName}: ${err}`);
            }
          });
      } else if (response === 'stop listening') {
        // Stop checking
        clearInterval(interval);
      }
      });
    }
  });
}

const interval = setInterval(checkProcess, 5000);
