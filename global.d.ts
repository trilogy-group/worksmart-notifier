declare namespace NodeJS {
  interface Process {
    pkg?: {
      defaultEntrypoint: string;
    };
  }
}