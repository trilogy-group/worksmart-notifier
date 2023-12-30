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

Display its tracking status and allow to disable checks:
![image](https://github.com/trilogy-group/worksmart-notifier/assets/37180625/4238812e-767f-4d80-ba40-f01faf8acd66)
![image](https://github.com/trilogy-group/worksmart-notifier/assets/37180625/489677b4-31ab-4b54-bdc6-e7294edd7989)



## Development

The application is written in TypeScript. You can use the provided `tsconfig.json` for compilation settings. The main logic for process monitoring and notification is in `src/monitor.ts`.
