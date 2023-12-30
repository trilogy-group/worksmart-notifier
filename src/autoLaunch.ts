import AutoLaunch from 'auto-launch';
import Store from 'electron-store';

const store = new Store();
const autoLauncher = new AutoLaunch({ name: 'WorkSmartNotifier' });

export async function configureAutoLaunch() {
  const autoStart = store.get('autoStart');
  const autoLauncherEnabled = await autoLauncher.isEnabled();

  if (autoStart === undefined || autoStart && !autoLauncherEnabled) {
    await autoLauncher.enable();
    store.set('autoStart', true);
  }
}


export async function autoLaunchTrigger() {
  const autoStart = store.get('autoStart');
  if (autoStart) {
    await autoLauncher.disable();
    store.set('autoStart', false);
  } else {
    await autoLauncher.enable();
    store.set('autoStart', true);
  }
}

export async function hasAutoLaunch() {
  return await autoLauncher.isEnabled();
}