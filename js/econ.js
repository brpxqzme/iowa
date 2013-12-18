// print line to our "console"
function notify(line) {
    textdiv.innerHTML += line + "<br>";
    textdiv.scrollTop = textdiv.scrollHeight;
}
