import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

export function main() {
  const container = document.getElementById('terminal');
  if (!container) return;

  const term = new Terminal({
    theme: { foreground: '#00ff00', cursor: '#00ff00' }
  });

  const fit = new FitAddon();
  term.open(container);
  term.loadAddon(fit);
  // initial fit
  try { fit.fit(); } catch (e) { /* ignore */ }

  // Simple prompt and input handling (keeps existing behavior)
  let pastCommands = [];
  let currentCommand = '';
  let commandIndex = 0;
  const user = 'guest';
  const domain = 'srivastava.pw';
  const pwd = '~';

  term.writeln("    __        __   _                            _ ");
  term.writeln("    \\ \\      \/ \/__| | ___ ___  _ __ ___   ___  | |");
  term.writeln("     \\ \\ \/\\ \/ \/ _ \\ |\/ __\/ _ \\| '\_ ` _ \\ \/ _ \\ | |");
  term.writeln("      \\ V  V \/  __\/ | (_| (_) | | | | | |  __\/ |_");
  term.writeln("       \\_/\\_/ \\___|_|\\___\\___\/|_| |_| |_|\\___| (_)");
  term.writeln('       ');
  term.writeln("    You have reached to Saket Srivastava's personal website!");
  term.writeln('       ');
  term.writeln("    Type `help' to see list of supported commands.");
  term.writeln('');

  function prompt() {
    const p = user + '@' + domain + ':' + pwd;
    term.write(p + '$ ');
  }

  function setCommand(command) {
      for(i=0;i<currentCommand.length;i++) {
        term.write('\b \b');
      }
      currentCommand = command;
      term.write(currentCommand);
  }

  prompt();

  let inputEnabled = true;
  term.onKey(async (e) => {
    const ev = e.domEvent;
    const key = e.key;
    const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

    if (!inputEnabled) return;

    if (ev.key === 'Enter') {
      term.writeln('');
      if (currentCommand.length > 0) {
        inputEnabled = false;
        commandIndex = pastCommands.length;
        pastCommands.push(currentCommand);
        commandIndex++;
        try {
          await executeCommand(currentCommand);
        } catch (err) {
          console.error(err);
        }
        currentCommand = '';
        inputEnabled = true;
      }
      prompt();
    } else if (ev.key === 'Backspace') {
      // do not delete the prompt
      if (currentCommand.length > 0) {
        term.write('\b \b');
        currentCommand = currentCommand.slice(0, -1);
      }
    } else if (ev.key === 'ArrowUp') {
      if (commandIndex > 0) {
        setCommand(pastCommands[--commandIndex] || '');
      }
    } else if (ev.key === 'ArrowDown') {
      if (commandIndex + 1 <= pastCommands.length) {
        setCommand(pastCommands[++commandIndex] || '');
      }
    } else if (printable) {
      term.write(key);
      currentCommand += key;
    }
  });

  // Handle paste via DOM paste event to avoid duplicating input
  document.addEventListener('paste', (ev) => {
    const clip = ev.clipboardData || window.clipboardData;
    const text = clip && clip.getData ? clip.getData('text') : '';
    if (text) {
      term.write(text);
      currentCommand += text;
    }
  });

  // Re-fit on window resize to keep terminal sized correctly
  window.addEventListener('resize', () => {
    try { fit.fit(); } catch (e) { }
  });

  async function executeCommand(command) {
    if (command === 'help') {
      term.writeln('clear                       Clear command line');
      term.writeln("cv                          Print Saket's CV in markdown format");
      term.writeln('cv download                 Download CV in PDF');
      term.writeln('history                     Print command history');
      term.writeln('whoami                      List current user');
      term.writeln('tmaj                        Print a joke (alias tellmeajoke)');
    } else if (command === 'clear') {
      term.clear();
    } else if (command === 'whoami') {
      term.writeln(user);
    } else if (command === 'history') {
      for (let i = 0; i < pastCommands.length; i++) term.writeln(pastCommands[i]);
    } else if (command === 'cv') {
      try {
        const res = await fetch('cv.md');
        const txt = await res.text();
        txt.split('\n').forEach(l => term.writeln(l));
      } catch (e) {
        term.writeln('Unable to load cv');
      }
    } else if (command === 'cv download') {
      term.writeln('Downloading...');
      try {
        const r = await fetch('cv.pdf');
        const blob = await r.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Saket CV.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (e) {
        term.writeln('Download failed');
      }
    } else if (command === 'tellmeajoke' || command === 'tmaj') {
      try {
        const r = await fetch('https://v2.jokeapi.dev/joke/Programming?format=txt');
        const txt = await r.text();
        term.writeln('');
        term.writeln(txt);
        term.writeln('');
      } catch (e) {
        term.writeln('Could not fetch joke');
      }
    } else {
      term.writeln(command + ': command not found');
    }
  }

  // Add fullscreen toggle command
  async function toggleFullScreen() {
    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        // wait a tick then fit
        setTimeout(() => { try { fit.fit(); } catch (e) {} }, 100);
      } else {
        await document.exitFullscreen();
        setTimeout(() => { try { fit.fit(); } catch (e) {} }, 100);
      }
    } catch (e) {
      // ignore fullscreen errors
    }
  }

  // expose fullscreen command handling inside executeCommand
  const origExecute = executeCommand;
  executeCommand = async function(command) {
    if (command === 'fullscreen' || command === 'toggle-fullscreen') {
      await toggleFullScreen();
    } else {
      await origExecute(command);
    }
  }
}

// Expose for IIFE bundle consumers
if (typeof window !== 'undefined') {
  window.TerminalBundle = window.TerminalBundle || {};
  window.TerminalBundle.main = main;
}
