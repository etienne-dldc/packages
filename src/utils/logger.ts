export interface ILogger {
  log: (message: string) => void;
  commit: () => void;
  child: (prefix: string, header?: string[]) => ILogger;
  format: (message: string) => string;
  readonly prefix: string;
}

interface ILoggerOptions {
  deffered?: boolean;
  header?: string[];
}

export const Logger = (() => {
  return {
    create: createLogger,
  };

  function createLogger({ deffered = false, header }: ILoggerOptions = {}): ILogger {
    let buffer: string[] = [];

    return child('', header);

    function commit() {
      for (const message of buffer) {
        console.log(message);
      }
      buffer = [];
    }

    function child(prefix: string, header: string[] = []): ILogger {
      let headerPrinted = false;
      return {
        prefix,
        log,
        commit,
        format,
        child: (subPrefix, headers) => child(prefix + subPrefix, headers),
      };

      function log(message: string) {
        if (!headerPrinted) {
          headerPrinted = true;
          for (const line of header) {
            logInternal(line);
          }
        }
        logInternal(prefix + message);
      }

      function logInternal(message: string) {
        if (deffered) {
          buffer.push(message);
          return;
        }
        console.log(message);
      }

      function format(message: string) {
        return message
          .split('\n')
          .map((line) => prefix + line)
          .join('\n');
      }
    }
  }
})();
