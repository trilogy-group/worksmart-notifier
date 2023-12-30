import { nativeImage } from 'electron';
import { join, resolve } from 'path';
import logger from './logger';

function getPath(filePath: string) {
  return resolve(join(__dirname, filePath));
}

const notificationIconPath = getPath('../images/Checker_256.png');
export const notificationIcon = nativeImage.createFromPath(notificationIconPath);
export const disabledNotificationIcon = nativeImage.createFromPath(getPath('../images/Checker_256_disabled.png'));
logger.info('iconPath', notificationIconPath);