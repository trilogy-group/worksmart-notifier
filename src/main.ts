import { app } from 'electron';
import logger from './logger';
import { processFullPath } from './env';
import { configureAutoLaunch } from './autoLaunch';
import { createTray } from './tray';
import { setupProcessChecks } from './processChecks';
import { appStartedNotification } from './notifications';


app.on('ready', async () => {
  try {
    logger.info('App is ready');

    // Load environment variables
    if (!processFullPath) {
      logger.error('processFullPath is not defined');
      app.quit();
      return;
    }

    // Configure auto-launch
    await configureAutoLaunch();

    // Create system tray
    const { tray, contextMenu } = await createTray(app);

    // Show notification
    appStartedNotification();

    // Start process checks
    setupProcessChecks(contextMenu, tray, 5_000);


    logger.info('App finished starting');
  } catch (err) {
    logger.error('Error onReady', err);
  }
});