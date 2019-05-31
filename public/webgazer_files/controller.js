var startPoint = 1; // start point id
var endPoint = 9; // end point id
var PointCalibrate = 1; // point id value 
var EyeCheckTime = 4; // eye check
var isCheck = false;

var endInspection= false;
var startInspection = false;
var step2Inspection = false;
var endCalibration = false;
var inspectionLinePos = [];
var inspectionFeedbackPos = [];
var inspectionPrecisionPos = {x: [], y : []};
var inspectionDistance = 10;

var plotting_canvas = null;
var ctx = null;
var textEl = null;
var circleEl = null;

var PredictionPosVal = 3; // getprediction pos count
var pointList = [];
var fourSurface = {1 : {}, 2:{},3:{},4:{}};
var surfaceSize = {};
var checkPointCount = 10;
var limitPos = {
  min_x : null, 
  max_x : null,
  min_y : null,
  max_y : null
};

$(document).ready(function(){
  setTimeout(() => {
    webgazerCheckData();
  }, 1000);
  ClearCanvas();
  $(".Calibration")[0].style="display:block;position:absolute;";
  $(".ShowVideoBtn").click(function(){
    if(webgazer.params.showVideo){
      webgazer.showVideo(false);
      webgazer.showFaceOverlay(false);
      webgazer.showFaceFeedbackBox(false);
      webgazer.showPredictionPoints(false);
    } else {
      webgazer.showVideo(true);
      webgazer.showFaceOverlay(true);
      webgazer.showFaceFeedbackBox(true);
      webgazer.showPredictionPoints(true);
    }
  });
  $(".DeleteDataBtn").click(function(){
    let res = RemoveRegDataStorage();
    alert("result : ",res);
  });
  $(".Calibration").click(async function(){
    plotting_canvas = $("#plotting_canvas")[0];
    textEl = $("#textDiv")[0];
    circleEl = $("#eyeCircle")[0];
    SetFourSurface(plotting_canvas);
    ctx = plotting_canvas.getContext('2d');
    if(window.mobilecheck && mobilecheck()){
      webgazer.showVideo(false);
      webgazer.showFaceOverlay(false);
      webgazer.showFaceFeedbackBox(false);
      webgazer.showPredictionPoints(false);
    }

    ClearCalibration();
    UpdateCalibration();
    UpdateEyeCircle();
    UpdateEyeCircleFourSurface();
  });

  function GetDistance(x1,y1,x2,y2){
    let a = x1 - x2;
    let b = y1 - y2;

    let dist = Math.sqrt( Math.pow(a,2) + Math.pow(b,2));
    return dist;
  }
  
  function webgazerCheckData() {
    if(webgazer !== undefined && webgazer.isReady() 
      && webgazer.getRegression()[0].getData().length === 0
      && localStorageGet("RegData") !== null){
        GetRegDataStorage();
    }
  }

  function SetRegDataStorage(){
    let data = webgazer.getRegression()[0].getData();
    window.localStorageSet("RegData",data);
  }

  function GetRegDataStorage(){
    let data = window.localStorageGet("RegData");
    if(data === null)
      return false;
    webgazer.pause();
    webgazer.getRegression()[0].setData(data);
    webgazer.resume();
    return true;
  }

  function RemoveRegDataStorage(){
    let result = window.localStorageRemove("RegData");
    return result;
  }

  function SetFourSurface(canvas){
    // let center = {x : canvas.width / 2, y : canvas.width / 2};
    surfaceSize = {width : canvas.width / 2, height : canvas.height / 2};
    fourSurface[1] = {x : canvas.width / 2 - 1, y : 0};
    fourSurface[2] = {x : 0, y : 0};
    fourSurface[3] = {x : 0, y : canvas.height / 2 + 1};
    fourSurface[4] = {x : canvas.width / 2 + 1, y : canvas.height / 2 + 1};
  }

  function SetFourSurfaceWithCenter(){
    let center_x = parseInt(circleEl.style.left);
    let center_y = parseInt(circleEl.style.top);
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
  
  async function CalibrationInspector(){
    let controlPosX = 100;
    let controlPosY = 200;
    if(window.mobilecheck && mobilecheck()){
      controlPosX = 100;
      controlPosY = 300;
    }
    let width = plotting_canvas.offsetWidth;
    let height = plotting_canvas.offsetHeight;
    let circleGhost = $("#eyeCircleGhost")[0];
    circleEl.style.left = controlPosX - circleGhost.offsetWidth / 2;
    circleEl.style.top = controlPosY - circleGhost.offsetHeight / 2;
    circleGhost.style.left = controlPosX - circleGhost.offsetWidth / 2;
    circleGhost.style.top = controlPosY - circleGhost.offsetHeight / 2;
    textEl.innerText="원의 움직임을 봐주세요.";
    await sleep(2000);
    inspectionLinePos = [
      {x : width / 2 - controlPosX, y : controlPosY},
      {x : width / 2 - controlPosX, y : height - controlPosY},
      {x : width - controlPosX, y : height - controlPosY}
    ];
    inspectionFeedbackPos = [
      {x : width / 4 - controlPosX, y : controlPosY},
      {x : width / 2 - controlPosX, y : controlPosY},
      {x : width / 2 - controlPosX, y : height / 2 - controlPosY},
      {x : width / 2 - controlPosX, y : height - controlPosY},
      {x : width - controlPosX, y : height - controlPosY}
    ]
    limitPos = {
      min_x : controlPosX,
      max_x : width - controlPosX,
      min_y : controlPosY,
      max_y : height - controlPosY
    }
    
    ctx.beginPath();
    ctx.moveTo(controlPosX,controlPosY);
    for(var p of inspectionLinePos){
      circleGhost.style.left = p.x - circleGhost.offsetWidth / 2;
      circleGhost.style.top = p.y - circleGhost.offsetHeight / 2;
      await sleep(2000);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 30;
      ctx.lineTo(p.x,p.y);
      ctx.stroke();
    }
    ctx.closePath();

    SetRegDataStorage();
    step2Inspection = true;
    textEl.innerText="원의 움직임을 10초안에 따라가주세요.";
    await sleep(1000);
    endCalibration = true;

    store_points_variable();
    textEl.innerText="10 second left.";
    let interval = setInterval(() => {
      textEl.innerText = parseInt(textEl.innerText) - 1 + " second left.";
      let p = get_points();
      inspectionPrecisionPos["x"].push(...p[0]);
      inspectionPrecisionPos["y"].push(...p[1]);
    }, 1000)
    setTimeout(() => {
      clearInterval(interval);
      let precisionVal = 0;
      $(".loading-square")[0].style.display = "block";
      for(var i=0;i<inspectionPrecisionPos["x"].length;i++){
        for(var point of inspectionFeedbackPos){
          let d = GetDistance(
            inspectionPrecisionPos["x"][i], inspectionPrecisionPos["y"][i],
            point.x, point.y)
          if(parseInt(d) < inspectionDistance){
            precisionVal += 1;
            break;
          }
        }
      }
      $(".loading-square")[0].style.display = "none";
      ClearCanvas();
      textEl.innerText = 
        (precisionVal / inspectionPrecisionPos["x"].length).toFixed(1) * 100 + "% finish";

      alert((precisionVal / inspectionPrecisionPos["x"].length).toFixed(1) * 100 + "% finish");
      
      limitPos = {
        min_x : 0 + circleEl.offsetWidth,
        max_x : plotting_canvas.offsetWidth,
        min_y : 0 + circleEl.offsetHeight,
        max_y : plotting_canvas.offsetHeight
      }
      endInspection = true;
      // if game : go Game Tab
    }, 10000);
  }
  
  async function UpdateCalibration(){
    requestAnimFrame(UpdateCalibration);

    if(isCheck){
      $(`.Pt${PointCalibrate}`)[0].style="display: block;";
      $(".time")[0].style="display: block";
    } else if(PointCalibrate !== endPoint){
      ShowCheckDot();
    } else if(!endInspection && !startInspection && PointCalibrate === endPoint){
      $(".Calibration")[0].innerText = "Calibration END!!";
      setInterval(() => {
        SetFourSurfaceWithCenter();
      }, 50);
      startInspection = true;
      CalibrationInspector();
    }
  
    if(isCheck && EyeCheckTime < 3 && EyeCheckTime > 1){
      var nowPoint = $($(`.Pt${PointCalibrate}`)[0]).offset();
      webgazer.recordScreenPosition(parseInt(nowPoint.left), parseInt(nowPoint.top),'click');
    }
  }

  function UpdateEyeCircle(){
    // inspection
    requestAnimFrame(UpdateEyeCircle);
    if(step2Inspection && !endInspection){
      let pos = webgazer.getCurrentPrediction();
      if(pos !== null){
        pointList.push(pos);
        if(pointList.length > PredictionPosVal){
          var x = 0;
          var y = 0;
          for(var p of pointList){
            x += p.x;
            y += p.y;
          }
          x /= PredictionPosVal;
          y /= PredictionPosVal;
          circleEl.style.left = parseInt(x) - parseInt(circleEl.offsetWidth);
          circleEl.style.top = parseInt(y) - parseInt(circleEl.offsetHeight);
          let top = parseInt(circleEl.style.top);
          let left = parseInt(circleEl.style.left);

          if(top < limitPos.min_y + circleEl.offsetHeight)
            circleEl.style.top = limitPos.min_y;
          else if(top > limitPos.max_y - + circleEl.offsetHeight)
            circleEl.style.top = limitPos.max_y;
          if(left < limitPos.min_x + circleEl.offsetWidth)
            circleEl.style.left = limitPos.min_x;
          else if(left > limitPos.max_x - circleEl.offsetWidth)
            circleEl.style.left = limitPos.max_x;
        }
      } else {
        pointList = [];
        textEl.innerText="Not connect";
      }
    }
  }
  
  function UpdateEyeCircleFourSurface(){
    // game
    requestAnimFrame(UpdateEyeCircleFourSurface);
    
    if(endCalibration && endInspection){
      let pos = webgazer.getCurrentPrediction();
      if(pos !== null){
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
        var o_list = new Array(4);
        o_list[0] = fourSurfaceStack[1];
        o_list[1] = fourSurfaceStack[2];
        o_list[2] = fourSurfaceStack[3];
        o_list[3] = fourSurfaceStack[4];
        o_list.sort(function(a,b){
          return b - a;
        })
        if(o_list[0] !== 0){
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
          ctx.closePath();
          circleEl.style.top = parseInt(circleEl.style.top) + circleMoveY;
          circleEl.style.left = parseInt(circleEl.style.left) + circleMoveX;
          let top = parseInt(circleEl.style.top);
          let left = parseInt(circleEl.style.left);

          if(top < limitPos.min_y + circleEl.offsetHeight)
            circleEl.style.top = limitPos.min_y;
          else if(top > limitPos.max_y - + circleEl.offsetHeight)
            circleEl.style.top = limitPos.max_y;
          if(left < limitPos.min_x + circleEl.offsetWidth)
            circleEl.style.left = limitPos.min_x;
          else if(left > limitPos.max_x - circleEl.offsetWidth)
            circleEl.style.left = limitPos.max_x;
        }
      } else {
        textEl.innerText="Not connect";
      }
    }
  }
  
  function ClearCalibration(){
    endCalibration = false;
    PointCalibrate = startPoint;
    EyeCheckTime = 4;
  }
  
  function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
  
});

