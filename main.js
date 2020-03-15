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

  term.toggleFullScreen(true);
  term.fit();

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
      if (command == "help") {
        term.writeln("clear                       Clear command line");
        term.writeln("cv                          Print Saket's CV in markdown format");
        term.writeln("cv download                 Download CV in PDF");
        term.writeln("history                     Print command history");
        term.writeln("whoami                      List current user");
      } else if (command == "clear") {
        term.clear();
      } else if (command == "whoami") {
        term.writeln(user);
      } else if (command == "history") {
        for (i=0; i<pastCommands.length; i++) {
          term.writeln(pastCommands[i]);
        }
      } else if (command == "cv") {
        term.writeln("");
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            var lines = this.responseText.split('\n');
            for (var i = 0; i < lines.length; i++) {
              term.writeln(lines[i]);
            }
          }
        };
        xhttp.open("GET", "cv.md", false);
        xhttp.send();
      } else if (command == "cv download") {
        term.writeln("Downloading...")
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "cv.pdf");
        xhr.responseType = "blob";
        xhr.onload = function () {
          saveData(this.response, 'Saket CV.pdf'); // saveAs is now your function
        };
        xhr.send();
      } else {
        term.writeln(command+': command not found');
      }
    }
  }
  runFakeTerminal();
}

function saveData(blob, fileName) // does the same as FileSaver.js
{
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";

    var url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
}
