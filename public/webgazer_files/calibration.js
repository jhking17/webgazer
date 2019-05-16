var PointCalibrate = 2;
var EyeCheckTime = 4;
var isCheck = false;

function ClearCanvas(){
  $(".Calibration").hide();
  var canvas = document.getElementById("plotting_canvas");
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

function swalPopupWithMessage(msg,func){
  swal({
    title:"JUHO TEST",
    text: msg,
    buttons:{
      cancel: false,
      confirm: true
    }
  }).then(isConfirm =>{func(isConfirm)});
}

function offset(el) {
  var rect = el.getBoundingClientRect(),
  scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
  scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}

function ShowCheckDot(){
  isCheck = true;
  $(".time")[0].innerText = EyeCheckTime;
  let interval = setInterval(() => {
    EyeCheckTime -= 1;
    $(".time")[0].innerText = EyeCheckTime;
  }, 1000);
  setTimeout(() => {
    clearInterval(interval);
    EyeCheckTime = 5;
    $(".time")[0].innerText = EyeCheckTime;
    $(`.Pt${PointCalibrate}`)[0].style="display: none;";
    PointCalibrate += 1;
    isCheck = false;
  }, EyeCheckTime * 1000);
}
$(document).ready(function(){
  ClearCanvas();
  $(".Calibration")[0].style="display:block;";
  $(".Calibration").click(function(){
    ClearCalibration();
    function UpdateCalibration(){
      // requestAnimationFrame(UpdateCalibration);
      if(isCheck){
        $(`.Pt${PointCalibrate}`)[0].style="display: block;";
        $(".time")[0].style="display: block";
      } else if(PointCalibrate !== 14){
        ShowCheckDot();
      } else {
        $(".Calibration")[0].innerText = "Calibration END!!";
        store_points_variable();
      }

      if(isCheck && EyeCheckTime < 3 && EyeCheckTime > 1){
        var nowPoint = $($(`.Pt${PointCalibrate}`)[0]).offset();
        console.log('now check ! : ',nowPoint);
        webgazer.recordScreenPosition(parseInt(nowPoint.left), parseInt(nowPoint.top),'click');
      }
    }
    setInterval(UpdateCalibration, 500);
  });
});

function ClearCalibration(){
  window.localStorage.clear();

  PointCalibrate = 2;
  EyeCheckTime = 4;
}

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
