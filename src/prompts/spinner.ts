import { block } from "@clack/core";
import color from "picocolors";
import { cursor, erase } from "sisteransi";

const frames = ["◒", "◐", "◓", "◑"];

const S_STEP_SUBMIT = "◇";

export const spinner = () => {
  let unblock: () => void;
  let loop: NodeJS.Timer;
  const delay = 80;
  return {
    start(message = "") {
      message = message.replace(/\.?\.?\.$/, "");
      unblock = block();
      process.stdout.write(`\n${color.magenta("○")}  ${message}\n`);
      let i = 0;
      let dot = 0;
      loop = setInterval(() => {
        let frame = frames[i];
        process.stdout.write(cursor.move(-999, -1));
        process.stdout.write(
          `${color.magenta(frame)}  ${message}${
            Math.floor(dot) >= 1 ? ".".repeat(Math.floor(dot)).slice(0, 3) : ""
          }   \n`
        );
        i = i === frames.length - 1 ? 0 : i + 1;
        dot = dot === frames.length ? 0 : dot + 0.125;
      }, delay);
    },
    stop(message = "") {
      process.stdout.write(cursor.move(-999, -2));
      process.stdout.write(erase.down(2));
      clearInterval(loop);
      process.stdout.write(`\n${color.green(S_STEP_SUBMIT)}  ${message}\n`);
      unblock();
    },
  };
};
