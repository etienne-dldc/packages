export interface ILogger {
  log: (message: string) => void;
  commit: () => void;
  withPrefix: (prefix: string) => ILogger;
}

interface ILoggerOptions {
  deffered?: boolean;
}

export const Logger = (() => {
  return {
    create: createLogger,
  };

  function createLogger({ deffered = false }: ILoggerOptions = {}): ILogger {
    let buffer: string[] = [];

    return {
      log,
      commit,
      withPrefix,
    };

    function log(message: string) {
      if (deffered) {
        buffer.push(message);
        return;
      }
      console.log(message);
    }

    function commit() {
      for (const message of buffer) {
        console.log(message);
      }
      buffer = [];
    }

    function withPrefix(prefix: string) {
      return {
        log: (message: string) => log(prefix + message),
        commit,
        withPrefix: (subPrefix: string) => withPrefix(prefix + subPrefix),
      };
    }
  }
})();
