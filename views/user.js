// Send a ajax request to toggle privacy status
function togglePrivacyStatus() {
  let xhttp = new XMLHttpRequest();

  xhttp.onload = function () {
    if (this.status == 200) {
      if (xhttp.responseText == "true") {
        document.getElementById("privacy_button").innerHTML = "Set user to public";
      } else {
        document.getElementById("privacy_button").innerHTML = "Set user to private";
      }
    } else {
      alert("An error occured.");
    }
  };

  xhttp.open("POST", "../togglePrivacy", true);
  xhttp.send();
}
