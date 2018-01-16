var cmdList;
var user;

function init() {
	var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "commands/list.json", false);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send();
    cmdList = JSON.parse(xhttp.responseText);
    window.onclick = focus; 
}

function onEnter() {
    var inputs = document.getElementsByClassName("prompt_text");
    checkInput(inputs[inputs.length - 1].value);
    createPrompt();
    return false;
}

function createPrompt() {
    var main = document.getElementById("container");
    var promptContainer = document.createElement("div");
    promptContainer.setAttribute("class", "prompt_container");
    var promptSpan = document.createElement("span");
    promptSpan.setAttribute("class", "bold_text prompt");
    if(!user) user = "guest";
    promptSpan.innerHTML = user + "@srivastava.pw:~$&nbsp;";
    var promptTextSpan = document.createElement("span");
    promptTextSpan.setAttribute("class", "prompt_text_div");
    var form = document.createElement("form");
    form.setAttribute("onSubmit", "return onEnter()");
    var input = document.createElement("input");
    input.setAttribute("class", "prompt_text");
    form.appendChild(input);
    promptTextSpan.appendChild(form);
    promptContainer.appendChild(promptSpan);
    promptContainer.appendChild(promptTextSpan);
    main.appendChild(promptContainer);
    input.focus();
    var inputs = document.getElementsByClassName("prompt_text");
    if(inputs.length > 1) {
        inputs[inputs.length - 2].disabled = true;
    }
}

function checkInput(input) {
	input = input.trim();
	if(input == "help"){
		help = Object.keys(cmdList).join("<br>");
		printOutput(help);
	}
	else if(input == "cv download"){
		var x=new XMLHttpRequest();
		x.open("GET", cmdList[input].address, true);
		x.responseType = 'blob';
		x.onload=function(e){download(x.response, "Saket_Resume.pdf", "application/pdf" ); }
		x.send();
	}
	else if(input.split(" ")[0] == "login") {
		user = input.split(/\s+/)[1];
	}
    else if(cmdList[input]){
		var xhttp = new XMLHttpRequest();
		xhttp.open("GET", cmdList[input].address, false);
		xhttp.setRequestHeader("Content-type", "text/html");
		xhttp.send();
		printOutput(xhttp.responseText);
	}
	else {
		printOutput(input + ": command not found");
	}
}

function printOutput(text) {
    var main = document.getElementById("container");
    var out = document.createElement("div");
    out.setAttribute("class", "text");
    out.innerHTML = text;
    main.appendChild(out);
}

function focus() {
	var inputs = document.getElementsByClassName("prompt_text");
	if(inputs.length > 0) {
		inputs[inputs.length - 1].focus();
	}
}
