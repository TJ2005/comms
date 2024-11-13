console.log("Hello");


function showsendopts() {
  var sendopts = document.getElementById("sendopts");
  var sendImage = document.getElementById("send");
  var closeImage = document.getElementById("close");

  if (sendopts.style.display === "none" || sendopts.style.display === "") {
      sendopts.style.display = "flex";
      sendopts.style.animation = 'pullUp 0.5s forwards';
      sendImage.style.display = "none";
      closeImage.style.display = "flex";
      closeImage.style.animation = 'closeanimation 0.6s ease-in-out forwards';
  } else {
      sendopts.style.animation = 'pullDown 0.5s forwards';
      setTimeout(function() {
          sendopts.style.display = "none";
          sendImage.style.display = "flex";
          sendImage.style.animation = 'sendanimation 0.5s ease-in-out forwards';
          closeImage.style.display = "none";
      }, 500);
  }
}
