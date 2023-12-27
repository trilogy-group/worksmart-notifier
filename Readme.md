# WorkSmart Notifier

This application is designed to monitor a specific process and create notifications when the process stops. This is particularly useful for time tracking applications where an unexpected stop can lead to lost hours of tracking and cause frustration.

## Features

- Monitors a specific process (configurable)
- Sends a notification when the monitored process stops
- Provides options to restart the process or stop checking

## Usage

The application uses environment variables to determine the process to monitor. These can be set in a `.env` file:

- `WORKSMART_PROCESS_PATH`: The full path to the process. If not set, the application will use default paths based on the operating system:
  - Windows: 'C:\\Program Files (x86)\\Crossover\\Crossover.exe'
  - Linux: '/usr/bin/crossover'
  - macOS: '/Applications/Crossover.app'

Application will begin monitoring the specified process and send a notification if the process stops.

Please note that while the application can restart the monitored process, it does not automatically turn on tracking.

## Development

The application is written in TypeScript. You can use the provided `tsconfig.json` for compilation settings. The main logic for process monitoring and notification is in `src/monitor.ts`.
