//import * as Terminal from 'xterm';
//import {fullscreen} from 'xterm/lib/addons/fullscreen/fullscreen';

function main() {
  Terminal.applyAddon(fullscreen);
  Terminal.applyAddon(fit);
  var term = new Terminal({
    theme: {
      foreground: '#00ff00',
      cursor: '#00ff00'
    }
  });
  term.open(document.getElementById('terminal'));

  //term.toggleFullscreen();
  term.toggleFullScreen(true);
  //term.fit();

  function runFakeTerminal() {
    var pastCommands = [];
    var currentCommand = "";
    var commandIndex = 0;
    var user = "guest";
    var domain = "srivastava.pw";
    var pwd = "~";
    if (term._initialized) {
      return;
    }
    function setCommand(command) {
      for(i=0;i<currentCommand.length;i++) {
        term.write('\b \b');
      }
      currentCommand = command;
      term.write(currentCommand);
    }

    term._initialized = true;

    term.prompt = () => {
      prompt = user+'@'+domain+':'+pwd
      term.write(prompt+'$ ');
    };


    term.writeln("    __        __   _                            _ ");
    term.writeln("    \\ \\      \/ \/__| | ___ ___  _ __ ___   ___  | |");
    term.writeln("     \\ \\ \/\\ \/ \/ _ \\ |\/ __\/ _ \\| \x27_ ` _ \\ \/ _ \\ | |");
    term.writeln("      \\ V  V \/  __\/ | (_| (_) | | | | | |  __\/ |_|");
    term.writeln("       \\_\/\\_\/ \\___|_|\\___\\___\/|_| |_| |_|\\___| (_)");
    term.writeln("       ");
    term.writeln("    You have reached to Saket Srivastava\x27s personal website!");
    term.writeln("       ");
    term.writeln("    Type `help\x27 to see list of supported commands.");
    term.writeln("");
    term.prompt();

    term.on('key', function(key, ev) {
      const printable = !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey;
      //console.log(ev);

      if (ev.keyCode === 13) {
        term.writeln('');
        if (currentCommand.length > 0) {
          commandIndex = pastCommands.length;
          pastCommands.push(currentCommand);
          commandIndex++;
          executeCommand(currentCommand);
        }
        term.prompt();
        currentCommand = "";
      } else if (ev.keyCode === 8) {
        // Do not delete the prompt
        if (term._core.buffer.x > (user.length + domain.length + pwd.length + 4)) {
          term.write('\b \b');
          currentCommand = currentCommand.slice(0,-1);
        }
      } else if (ev.keyCode === 38) {
        if (commandIndex > 0) {
          setCommand(pastCommands[--commandIndex]);
        }
      } else if (ev.keyCode === 40) {
        if (commandIndex + 1 < pastCommands.length) {
          setCommand(pastCommands[++commandIndex]);
        }
      } else if (printable) {
        term.write(key);
        currentCommand += key;
      }
    });

    term.on('paste', function(data) {
      term.write(data);
      currentCommand += data;
    });

    function executeCommand(command){
      console.log(command);
      switch (command) {
        case "help":
          term.writeln("clear");
          term.writeln("whoami");
          term.writeln("history");
          break;
        case "clear":
          term.clear();
          break;
        case "whoami":
          term.writeln(user);
          break;
        case "history":
          for (i=0; i<pastCommands.length; i++) {
             term.writeln(pastCommands[i]);
          }
          break;
        default:
          term.writeln(command+': command not found');
      }
    }
  }
  runFakeTerminal();
}
