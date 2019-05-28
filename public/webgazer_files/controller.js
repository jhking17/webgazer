var startPoint = 1; // start point id
var endPoint = 9; // end point id
var PointCalibrate = 1; // point id value 
var EyeCheckTime = 4; // eye check
var isCheck = false;
var endCalibration = false;
var pointList = [];
var fourSurface = {1 : {}, 2:{},3:{},4:{}};
var surfaceSize = {};
var checkPointCount = 10;

function SetFourSurface(canvas){
  // let center = {x : canvas.width / 2, y : canvas.width / 2};
  $("#eyeCircle")[0].style.top = canvas.height / 2 - $("#eyeCircle")[0].offsetHeight / 2;
  $("#eyeCircle")[0].style.left = canvas.width / 2 - $("#eyeCircle")[0].offsetWidth / 2;
  surfaceSize = {width : canvas.width / 2, height : canvas.height / 2}
  fourSurface[1] = {x : canvas.width / 2 - 1, y : 0};
  fourSurface[2] = {x : 0, y : 0};
  fourSurface[3] = {x : 0, y : canvas.height / 2 + 1};
  fourSurface[4] = {x : canvas.width / 2 + 1, y : canvas.height / 2 + 1};
}

function SetFourSurfaceWithCenter(){
  let center_x = parseInt($("#eyeCircle")[0].style.left);
  let center_y = parseInt($("#eyeCircle")[0].style.top);
  console.log(center_x, center_y)
  fourSurface[1] = {x : center_x + 1, y : 0};
  fourSurface[2] = {x : 0, y : 0};
  fourSurface[3] = {x : 0, y : center_y + 1};
  fourSurface[4] = {x : center_x + 1, y : center_y + 1};
}

function contains(x, y, number) {
  surface_x = fourSurface[number].x;
  surface_y = fourSurface[number].y;
  return surface_x <= x && x <= surface_x + surfaceSize.width &&
         surface_y <= y && y <= surface_y + surfaceSize.height;
}

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
  $(".Calibration")[0].style="display:block;position:absolute;";
  $(".Calibration").click(function(){
    // if(webgazer.params.showVideo === true){
    //   webgazer.showVideo(false);
    //   webgazer.showFaceOverlay(false);
    //   webgazer.showFaceFeedbackBox(false);
    //   webgazer.showPredictionPoints(false);
    // } else {
    //   webgazer.showVideo(true);
    //   webgazer.showFaceOverlay(true);
    //   webgazer.showFaceFeedbackBox(true);
    //   webgazer.showPredictionPoints(true);
    // }
    ClearCalibration();
    function UpdateCalibration(){
      requestAnimationFrame(UpdateCalibration);
      if(isCheck){
        $(`.Pt${PointCalibrate}`)[0].style="display: block;";
        $(".time")[0].style="display: block";
      } else if(PointCalibrate !== endPoint){
        ShowCheckDot();
      } else {
        $(".Calibration")[0].innerText = "Calibration END!!";
        endCalibration = true;
        store_points_variable();
        setInterval(() => {
          SetFourSurfaceWithCenter();
        }, 50);
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
          let prev = Date.now();
          let pos_stack = get_points();
          let fourSurfaceStack = {1 : 0, 2 : 0, 3 : 0, 4 : 0}
          for(var i= 50 - (50 - checkPointCount); i < 50; i++){
            if(pos_stack[0][i] !== undefined){
              for(var j=1;j<=4;j++){
                res = contains(pos_stack[0][i],pos_stack[1][i],j);
                if(res){
                  fourSurfaceStack[j] += 1;
                  break;
                }
              }
            }
          }
          prev = Date.now();
          console.log("1 : ",Date.now() - prev);
          var o_list = new Array(4);
          o_list[0] = fourSurfaceStack[1];
          o_list[1] = fourSurfaceStack[2];
          o_list[2] = fourSurfaceStack[3];
          o_list[3] = fourSurfaceStack[4];
          o_list.sort(function(a,b){
            return b - a;
          })
          prev = Date.now();
          console.log("2 : ",Date.now() - prev);
          if(o_list[0] !== 0){
            let EyeCircle = $("#eyeCircle")[0];
            let ctx = $("#plotting_canvas")[0].getContext('2d');
            var surfaceNumber = null;
            var circleMoveX = 5;
            var circleMoveY = 5;
            if(fourSurfaceStack[1] === o_list[0]){
              surfaceNumber = 1;
              circleMoveY = -5;
            } else if(fourSurfaceStack[2] === o_list[0]){
              surfaceNumber = 2;
              circleMoveX = -5;
              circleMoveY = -5;
            } else if(fourSurfaceStack[3] === o_list[0]){
              surfaceNumber = 3;
              circleMoveX = -5;
            } else if(fourSurfaceStack[4] === o_list[0]){
              surfaceNumber = 4;
            } else {
              return ;
            }
            ctx.clearRect(0,0,surfaceSize.width * 2, surfaceSize.height * 2);
            ctx.beginPath();
            ctx.lineWidth = "6";
            ctx.strokeStyle = "red";
            ctx.rect(fourSurface[surfaceNumber].x , fourSurface[surfaceNumber].y, surfaceSize.width, surfaceSize.height);
            ctx.stroke();
            prev = Date.now();
            console.log("3 : ",Date.now() - prev);
            EyeCircle.style.top = parseInt(EyeCircle.style.top) + circleMoveY;
            let top = parseInt(EyeCircle.style.top);
            let left = parseInt(EyeCircle.style.left);
            if(top < 0)
              EyeCircle.style.top = 0;
            else if(top > surfaceSize.height * 2)
              EyeCircle.style.top = surfaceSize.height * 2;
            if(left < 0)
              EyeCircle.style.left = 0;
            else if(left > surfaceSize.width * 2)
              EyeCircle.style.left = surfaceSize.width * 2;
              
            EyeCircle.style.left = parseInt(EyeCircle.style.left) + circleMoveX;
          }
          prev = Date.now();
          console.log("4 : ",Date.now() - prev);
          $("#now_pos")[0].innerText="x : "+pos_stack[0][49]+" y : "+pos_stack[1][49];
          // pointList.push(pos);
          // if(pointList.length === 3){
          //   let avg_x = 0;
          //   let avg_y = 0;
          //   for(var i=0;i<3;i++){
          //     avg_x += pointList[i].x;
          //     avg_y += pointList[i].y;
          //   }
          //   avg_x = parseFloat(avg_x / 3).toFixed(3);
          //   avg_y = parseFloat(avg_y / 3).toFixed(3);
          //   let EyeCircle = $("#eyeCircle")[0];
          //   EyeCircle.style.top = avg_y;
          //   EyeCircle.style.left = avg_x;
          //   pointList = [];
          // }
        } else {
          $("#now_pos")[0].innerText="Not connect";
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
  PointCalibrate = startPoint;
  EyeCheckTime = 4;
}

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
