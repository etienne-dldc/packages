import { TextPrompt } from '@clack/core';
import pc from 'picocolors';
import { symbol } from './symbol';

export interface TextOptions {
  message: string;
  placeholder?: string;
  defaultValue?: string;
  initialValue?: string;
  validate?: (value: string) => string | void;
}

export const text = (opts: TextOptions) => {
  return new TextPrompt({
    validate: opts.validate,
    placeholder: opts.placeholder,
    defaultValue: opts.defaultValue,
    initialValue: opts.initialValue,
    render() {
      const title = `${symbol(this.state)}  ${opts.message}\n`;
      const placeholder = opts.placeholder
        ? pc.inverse(opts.placeholder[0]) + pc.dim(opts.placeholder.slice(1))
        : pc.inverse(pc.hidden('_'));
      const value = !this.value ? placeholder : this.valueWithCursor;

      switch (this.state) {
        case 'error':
          return `${title.trim()}\n  ${value}\n  ${pc.yellow(this.error)}\n`;
        case 'submit':
          return `${title}  ${pc.dim(this.value || opts.placeholder)}`;
        case 'cancel':
          return `${title}  ${pc.strikethrough(pc.dim(this.value ?? ''))}${this.value?.trim() ? '\n' : ''}`;
        default:
          return `${title}  ${value}\n`;
      }
    },
  }).prompt() as Promise<string | symbol>;
};
