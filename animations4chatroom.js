console.log("Hello");


function showsendopts() {
  var sendopts = document.getElementById("sendopts");
  if (sendopts.style.display === "none"){
    sendopts.style.display = "flex";
    sendopts.style.animation= 'pullUp 0.5s forwards';
  }else{
  var sendopts = document.getElementById("sendopts");
  sendopts.style.animation= 'pullDown 0.5s forwards';
  sendopts.style.display = "none";
  }
}
