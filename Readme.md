# WorkSmart Notifier

This application is designed to monitor a specific process and create notifications when the process stops. This is particularly useful for time tracking applications where an unexpected stop can lead to lost tracking hours and cause frustration.

## Features

- Monitors a specific process (configurable)
- Sends a notification when the monitored process stops
- Provides options to restart the process or stop checking

## Usage

The application uses environment variables to determine the process to monitor. These can be set in a `.env` file:

- `WORKSMART_PROCESS_PATH`: The full path to the process. If not set, the application will use default paths based on the operating system:
  - Windows: 'C:\\Program Files (x86)\\Crossover\\Crossover.exe'

The application will begin monitoring the specified process and send a notification if the process stops once it has started.

Show notifications:

![image](https://github.com/trilogy-group/worksmart-notifier/assets/37180625/c71db26b-e5b9-430b-9653-7e6b59c081e2)

Note: Close notification does not mute further notifications but will restart the crossover application. Only the cross button in the top right will mute notifications.

Display its tracking status and allow to disable checks or autostart on user login:

![image](https://github.com/trilogy-group/worksmart-notifier/assets/37180625/106fa3aa-fda4-4a5d-a7b3-16287867ffca)
![image](https://github.com/trilogy-group/worksmart-notifier/assets/37180625/1105c679-4c50-4b4e-8182-c9c528d9aa60)




## Development

The application is written in TypeScript. You can use the provided `tsconfig.json` for compilation settings. The main logic for process monitoring and notification is in `src/monitor.ts`.


## Love using WorkSmart Notifier?

Consider supporting further development by buying me a coffee here: 

<a href="https://www.buymeacoffee.com/kkorniienko" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

