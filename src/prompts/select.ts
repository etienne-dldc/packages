import { SelectPrompt, State } from '@clack/core';
import pc from 'picocolors';

const RADIO_ACTIVE = '●';
const RADIO_INACTIVE = '○';

const STEP_ACTIVE = '◆';
const STEP_CANCEL = '■';
const STEP_ERROR = '▲';
const STEP_SUBMIT = '◇';

export type Primitive = Readonly<string | boolean | number>;

export type Option<Value> = Value extends Primitive
  ? { value: Value; label?: string; hint?: string }
  : { value: Value; label: string; hint?: string };

export interface SelectOptions<Options extends Option<Value>[], Value> {
  message: string;
  options: Options;
  initialValue?: Value;
}

const symbol = (state: State) => {
  switch (state) {
    case 'initial':
    case 'active':
      return pc.cyan(STEP_ACTIVE);
    case 'cancel':
      return pc.red(STEP_CANCEL);
    case 'error':
      return pc.yellow(STEP_ERROR);
    case 'submit':
      return pc.green(STEP_SUBMIT);
  }
};

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
