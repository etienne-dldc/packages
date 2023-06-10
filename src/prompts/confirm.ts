import { ConfirmPrompt } from "@clack/core";
import pc from "picocolors";

export interface ConfirmOptions {
  message: string;
  active?: string;
  inactive?: string;
  initialValue?: boolean;
}

const S_RADIO_ACTIVE = "●";
const S_RADIO_INACTIVE = "○";

export const confirm = (opts: ConfirmOptions) => {
  const active = opts.active ?? "Yes";
  const inactive = opts.inactive ?? "No";
  return new ConfirmPrompt({
    active,
    inactive,
    initialValue: opts.initialValue ?? true,
    render() {
      const title = `${opts.message}\n`;
      const value = this.value ? active : inactive;

      switch (this.state) {
        case "submit":
          return `${title}  ${pc.dim(value)}`;
        case "cancel":
          return `${title}  ${pc.strikethrough(pc.dim(value))}\n`;
        default: {
          return `${title}  ${
            this.value
              ? `${pc.green(S_RADIO_ACTIVE)} ${active}`
              : `${pc.dim(S_RADIO_INACTIVE)} ${pc.dim(active)}`
          } ${pc.dim("/")} ${
            !this.value
              ? `${pc.green(S_RADIO_ACTIVE)} ${inactive}`
              : `${pc.dim(S_RADIO_INACTIVE)} ${pc.dim(inactive)}`
          }\n`;
        }
      }
    },
  }).prompt() as Promise<boolean | symbol>;
};
