import AutoLaunch from 'auto-launch';
import Store from 'electron-store';

export const store = new Store();
export const autoLauncher = new AutoLaunch({ name: 'WorkSmartNotifier' });

export async function configureAutoLaunch() {
  const autoStart = store.get('autoStart');
  const autoLauncherEnabled = await autoLauncher.isEnabled();

  if (autoStart === undefined || autoStart && !autoLauncherEnabled) {
    await autoLauncher.enable();
    store.set('autoStart', true);
  }
}
