// Send a ajax request to verify login information and redirect page if successful
function login() {
  let xhttp = new XMLHttpRequest();

  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  if (!password || !username) {
    document.getElementById("error").innerHTML = "Empty fields.";
    return;
  }

  xhttp.onload = function () {
    if (this.status == 200) {
      window.location.href = "/users/" + xhttp.responseText;
    } else {
      document.getElementById("error").innerHTML = xhttp.responseText;
    }
  };

  xhttp.open("POST", "/login", true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify({ username: username, password: password }));
}

// Send a ajax request to verify registration information, display corresponding errors and redirect page if successful
function register() {
  let xhttp = new XMLHttpRequest();

  let username = document.getElementById("username").value;
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  let passwordConfirm = document.getElementById("password_confirm").value;

  if (!username || !email || !password || !passwordConfirm) {
    document.getElementById("error").innerHTML = "Empty fields.";
    return;
  }

  if (password !== passwordConfirm) {
    document.getElementById("error").innerHTML = "Passwords do not match.";
    return;
  }

  xhttp.onload = function () {
    if (this.status == 200) {
      window.location.href = "/users/" + xhttp.responseText;
    } else {
      document.getElementById("error").innerHTML = xhttp.responseText;
    }
  };

  xhttp.open("POST", "/register", true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  xhttp.send(JSON.stringify({ username: username, password: password }));
}
