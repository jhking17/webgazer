window.onload = function() {
    function Update(){
        requestAnimationFrame(Update);
        if(!webgazer.isReady())
            return ;
        console.log(webgazer.getCurrentPrediction());
    }
    Update();
    webgazer.setRegression('ridge')
        .setTracker('clmtrackr')
        .setGazeListener(function(data, clock) {
        })
        .begin()
        .showPredictionPoints(true);


    var setup = function() {
        var canvas = document.getElementById("plotting_canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = 'fixed';
    };

    function checkIfReady() {
        if (webgazer.isReady()) {
            setup();
        } else {
            setTimeout(checkIfReady, 100);
        }
    }
    setTimeout(checkIfReady,100);
};

window.onbeforeunload = function() {
    window.localStorage.clear();
}

function Restart(){
    document.getElementById("Accuracy").innerHTML = "<a>Not yet Calibrated</a>";
    ClearCalibration();
    PopUpInstruction();
}
