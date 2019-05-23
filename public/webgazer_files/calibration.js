var PointCalibrate = 1;
var EyeCheckTime = 4;
var isCheck = false;
var endCalibration = false;
var pointList = [];

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
      requestAnimationFrame(UpdateCalibration);
      if(isCheck){
        $(`.Pt${PointCalibrate}`)[0].style="display: block;";
        $(".time")[0].style="display: block";
      } else if(PointCalibrate !== 17){
        ShowCheckDot();
      } else {
        $(".Calibration")[0].innerText = "Calibration END!!";
        endCalibration = true;
        // store_points_variable();
      }

      if(isCheck && EyeCheckTime < 3 && EyeCheckTime > 1){
        var nowPoint = $($(`.Pt${PointCalibrate}`)[0]).offset();
        webgazer.recordScreenPosition(parseInt(nowPoint.left), parseInt(nowPoint.top),'click');
      }
    }
    UpdateCalibration();
    
    function UpdateEyeCircle(){
      requestAnimationFrame(UpdateEyeCircle);
      if(endCalibration){
        let pos = webgazer.getCurrentPrediction();
        if(pos !== null){
          pointList.push(pos);
          if(pointList.length === 3){
            let avg_x = 0;
            let avg_y = 0;
            for(var i=0;i<3;i++){
              avg_x += pointList[i].x;
              avg_y += pointList[i].y;
            }
            avg_x = parseFloat(avg_x / 3).toFixed(3);
            avg_y = parseFloat(avg_y / 3).toFixed(3);
            let EyeCircle = $("#eyeCircle")[0];
            EyeCircle.style.top = avg_y;
            EyeCircle.style.left = avg_x;
            pointList = [];
          }
        }
      }

      // move circle with eye position
    }
    UpdateEyeCircle();
  });
});

function ClearCalibration(){
  window.localStorage.clear();
  endCalibration = false;
  PointCalibrate = 1;
  EyeCheckTime = 4;
}

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
