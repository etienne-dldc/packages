import { SelectPrompt } from '@clack/core';
import pc from 'picocolors';
import { symbol } from './symbol';

const RADIO_ACTIVE = '●';
const RADIO_INACTIVE = '○';

export type Primitive = Readonly<string | boolean | number>;

export type Option<Value> = Value extends Primitive
  ? { value: Value; label?: string; hint?: string }
  : { value: Value; label: string; hint?: string };

export interface SelectOptions<Options extends Option<Value>[], Value> {
  message: string;
  options: Options;
  initialValue?: Value;
}

export const select = <Options extends Option<Value>[], Value>(opts: SelectOptions<Options, Value>) => {
  const opt = (option: Option<Value>, state: 'inactive' | 'active' | 'selected' | 'cancelled') => {
    const label = option.label ?? String(option.value);
    if (state === 'active') {
      return `${pc.green(RADIO_ACTIVE)} ${label} ${option.hint ? pc.dim(`(${option.hint})`) : ''}`;
    } else if (state === 'selected') {
      return `${pc.dim(label)}`;
    } else if (state === 'cancelled') {
      return `${pc.strikethrough(pc.dim(label))}`;
    }
    return `${pc.dim(RADIO_INACTIVE)} ${pc.dim(label)}`;
  };

  return new SelectPrompt({
    options: opts.options,
    initialValue: opts.initialValue,
    render() {
      const title = `${symbol(this.state)}  ${opts.message}\n`;

      switch (this.state) {
        case 'submit':
          return `${title}  ${opt(this.options[this.cursor], 'selected')}`;
        case 'cancel':
          return `${title}  ${opt(this.options[this.cursor], 'cancelled')}\n`;
        default: {
          return `${title}  ${this.options
            .map((option, i) => opt(option, i === this.cursor ? 'active' : 'inactive'))
            .join(`\n  `)}\n\n`;
        }
      }
    },
  }).prompt() as Promise<Value | symbol>;
};
