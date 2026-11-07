// src/prompts.js - Zero-dependency terminal interactive prompts
import readline from 'node:readline';

export const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  // Colors
  red: '\x1b[38;5;203m',
  green: '\x1b[38;5;48m',
  yellow: '\x1b[38;5;214m',
  blue: '\x1b[38;5;75m',
  magenta: '\x1b[38;5;176m',
  cyan: '\x1b[38;5;81m',
  white: '\x1b[38;5;255m',
  gray: '\x1b[38;5;244m',
  darkGray: '\x1b[38;5;238m',
  bgDark: '\x1b[48;5;235m',
  emerald: '\x1b[38;5;48m',
  coral: '\x1b[38;5;204m',
  indigo: '\x1b[38;5;141m',
  amber: '\x1b[38;5;214m'
};

const SYMBOLS = {
  pointer: '›',
  checkboxOn: '◉',
  checkboxOff: '◯',
  check: '✔',
  cross: '✖',
  info: 'ℹ',
  bullet: '▪'
};

export async function select({ message, choices, defaultIndex = 0 }) {
  if (!process.stdin.isTTY) {
    return choices[defaultIndex].value;
  }

  return new Promise((resolve) => {
    let index = defaultIndex;
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    readline.emitKeypressEvents(process.stdin, rl);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    process.stdout.write('\x1b[?25l'); // hide cursor

    function render(initial = false) {
      if (!initial) {
        process.stdout.write(`\x1b[${choices.length + 1}A\r`);
      }
      process.stdout.write(`${c.bold}${c.cyan}?${c.reset} ${c.bold}${message}${c.reset}\n`);
      choices.forEach((choice, i) => {
        const isSelected = i === index;
        const prefix = isSelected ? `${c.cyan}${SYMBOLS.pointer}${c.reset} ` : '  ';
        const label = isSelected ? `${c.bold}${c.white}${choice.label}${c.reset}` : `${c.gray}${choice.label}${c.reset}`;
        const desc = choice.description ? ` ${c.dim}(${choice.description})${c.reset}` : '';
        process.stdout.write(`\x1b[2K${prefix}${label}${desc}\n`);
      });
    }

    render(true);

    function onKeypress(str, key) {
      if (!key) return;
      if (key.name === 'up' || (key.name === 'k' && !key.ctrl)) {
        index = (index - 1 + choices.length) % choices.length;
        render();
      } else if (key.name === 'down' || (key.name === 'j' && !key.ctrl)) {
        index = (index + 1) % choices.length;
        render();
      } else if (key.name === 'return' || key.name === 'enter') {
        cleanup();
        process.stdout.write(`\x1b[2K\r${c.green}${SYMBOLS.check}${c.reset} ${c.bold}${message}${c.reset} → ${c.cyan}${choices[index].label}${c.reset}\n`);
        resolve(choices[index].value);
      } else if (key.name === 'c' && key.ctrl) {
        cleanup();
        process.exit(0);
      }
    }

    function cleanup() {
      process.stdin.removeListener('keypress', onKeypress);
      if (process.stdin.isTTY) process.stdin.setRawMode(false);
      process.stdout.write('\x1b[?25h'); // show cursor
      rl.close();
    }

    process.stdin.on('keypress', onKeypress);
  });
}

export async function multiselect({ message, choices, defaultSelected = [] }) {
  if (!process.stdin.isTTY) {
    return defaultSelected.length ? defaultSelected : choices.map((c) => c.value);
  }

  return new Promise((resolve) => {
    let cursor = 0;
    const selected = new Set(defaultSelected);
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    readline.emitKeypressEvents(process.stdin, rl);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    process.stdout.write('\x1b[?25l');

    function render(initial = false) {
      if (!initial) {
        process.stdout.write(`\x1b[${choices.length + 2}A\r`);
      }
      process.stdout.write(`${c.bold}${c.cyan}?${c.reset} ${c.bold}${message}${c.reset} ${c.dim}(Space to toggle, Enter to confirm)${c.reset}\n`);
      choices.forEach((choice, i) => {
        const isFocused = i === cursor;
        const isChecked = selected.has(choice.value);
        const focusPointer = isFocused ? `${c.cyan}${SYMBOLS.pointer}${c.reset}` : ' ';
        const checkIcon = isChecked ? `${c.emerald}${SYMBOLS.checkboxOn}${c.reset}` : `${c.darkGray}${SYMBOLS.checkboxOff}${c.reset}`;
        const label = isFocused ? `${c.bold}${c.white}${choice.label}${c.reset}` : `${c.gray}${choice.label}${c.reset}`;
        const desc = choice.description ? ` ${c.dim}— ${choice.description}${c.reset}` : '';
        process.stdout.write(`\x1b[2K ${focusPointer} ${checkIcon} ${label}${desc}\n`);
      });
      process.stdout.write(`\x1b[2K ${c.dim}[a] Select all  [n] Select none${c.reset}\n`);
    }

    render(true);

    function onKeypress(str, key) {
      if (!key) return;
      if (key.name === 'up' || (key.name === 'k' && !key.ctrl)) {
        cursor = (cursor - 1 + choices.length) % choices.length;
        render();
      } else if (key.name === 'down' || (key.name === 'j' && !key.ctrl)) {
        cursor = (cursor + 1) % choices.length;
        render();
      } else if (key.name === 'space') {
        const val = choices[cursor].value;
        if (selected.has(val)) selected.delete(val);
        else selected.add(val);
        render();
      } else if (key.name === 'a') {
        choices.forEach((ch) => selected.add(ch.value));
        render();
      } else if (key.name === 'n') {
        selected.clear();
        render();
      } else if (key.name === 'return' || key.name === 'enter') {
        cleanup();
        const selectedList = choices.filter((ch) => selected.has(ch.value));
        const labels = selectedList.map((ch) => ch.label).join(', ');
        process.stdout.write(`\x1b[2K\r${c.green}${SYMBOLS.check}${c.reset} ${c.bold}${message}${c.reset} → ${c.cyan}${labels || 'none'}${c.reset}\n`);
        resolve(Array.from(selected));
      } else if (key.name === 'c' && key.ctrl) {
        cleanup();
        process.exit(0);
      }
    }

    function cleanup() {
      process.stdin.removeListener('keypress', onKeypress);
      if (process.stdin.isTTY) process.stdin.setRawMode(false);
      process.stdout.write('\x1b[?25h');
      rl.close();
    }

    process.stdin.on('keypress', onKeypress);
  });
}

export async function confirm({ message, defaultYes = true }) {
  if (!process.stdin.isTTY) return defaultYes;
  const choice = await select({
    message,
    choices: [
      { label: defaultYes ? 'Yes (Recommended)' : 'Yes', value: true },
      { label: defaultYes ? 'No' : 'No (Recommended)', value: false }
    ],
    defaultIndex: defaultYes ? 0 : 1
  });
  return choice;
}

export function banner() {
  console.log(`
${c.indigo}${c.bold}   ____ _     _ _ _                     _   ${c.reset}
${c.indigo}${c.bold}  / ___| |__ (_) | |   __ _  __ _  ___| |_ ${c.reset}
${c.indigo}${c.bold} | |   | '_ \\| | | |  / _\` |/ _\` |/ _ \\ __|${c.reset}
${c.cyan}${c.bold} | |___| | | | | | |_| (_| | (_| |  __/ |_ ${c.reset}
${c.cyan}${c.bold}  \\____|_| |_|_|_|_(_)\\__,_|\\__, |\\___|\\__|${c.reset}
${c.cyan}${c.bold}                            |___/          ${c.reset}
  ${c.bold}ChillAgent Anti-Slop 2.0 Engine${c.reset} ${c.dim}• Anti-Slop + Ponytail Senior Dev Core${c.reset}
  ${c.dim}Zero-Dependency • Linear/Geist Standard • Multi-Agent Ready${c.reset}
`);
}
