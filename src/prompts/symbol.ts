import { State } from '@clack/core';
import pc from 'picocolors';

const STEP_ACTIVE = '◆';
const STEP_CANCEL = '■';
const STEP_ERROR = '▲';
const STEP_SUBMIT = '◇';

export function symbol(state: State) {
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
}
