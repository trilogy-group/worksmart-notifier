# WorkSmart Notifier

This application is designed to monitor a specific process and create notifications when the process stops. This is particularly useful for time tracking applications where an unexpected stop can lead to lost hours of tracking and cause frustration.

## Features

- Monitors a specific process (configurable based on the operating system)
- Sends a notification when the monitored process stops
- Provides options to restart the process or stop checking

## Usage

The application uses environment variables to determine the process to monitor. These can be set in a `.env` file:

- `PROCESS_PATH_WINDOWS`: The full path to the process on Windows
- `PROCESS_PATH_LINUX`: The full path to the process on Linux
- `PROCESS_PATH_MAC`: The full path to the process on macOS

Once the environment variables are set, the application can be started. It will begin monitoring the specified process and send a notification if the process stops.

Please note that while the application can restart the monitored process, it does not automatically turn on tracking.

## Development

The application is written in TypeScript. You can use the provided `tsconfig.json` for compilation settings. The main logic for process monitoring and notification is in `src/monitor.ts`.
