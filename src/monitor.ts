import notifier from 'node-notifier';
import { exec } from 'child_process';
import { join } from 'path';

const processFullPath = 'C:\\Program Files (x86)\\Crossover\\Crossover.exe';
const processName = processFullPath.split('\\').pop()!;
const defaultTimeout = 5000;
const iconPath = join(__dirname, '../images/toast.png');

function checkProcess() {
  exec(`tasklist`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Could not check process status: ${err}`);
      return;
    }

    if (!stdout.includes(processName)) {
      console.log(`${processName} is not running`);
      notifier.notify({
        title: 'WorkSmart Alert',
        message: `WorkSmart has stopped running!`,
        icon: iconPath,
        sound: true,
        wait: true,
        actions: ['Restart', 'Stop checking']
      }, function (err, response, metadata) {
        if (response === 'Restart') {
          exec(`"${processFullPath}"`, (err, stdout, stderr) => {
            if (err) {
              console.error(`Could not restart ${processName}: ${err}`);
            }
          });
        } else if (response === 'Stop checking') {
          console.log('Stopped checking process status');
          return;
        }
        interval = setTimeout(checkProcess, defaultTimeout);
      });
    } else {
      console.log(`${processName} is running`);
      interval = setTimeout(checkProcess, defaultTimeout);
    }
  });
}

notifier.notify({
  title: 'WorkSmart Checker',
  message: `WorkSmart Checker is started`,
  icon: iconPath,
});
let interval = setTimeout(checkProcess, defaultTimeout);
