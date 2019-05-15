window.onload = async function() {
    function Update(){
        requestAnimationFrame(Update);
        if(!webgazer.isReady())
            return ;
        let pos = webgazer.getCurrentPrediction();
        if(pos !== null)
            $("#now_pos")[0].innerText="x : "+pos.x+" y : "+pos.y;
        else 
            $("#now_pos")[0].innerText="Not connect";

        // console.log(webgazer.getRegression()); //data insert
        // console.log(webgazer.getCurrentPrediction());
    }
    Update();
    webgazer.setRegression('ridge')
        .setTracker('clmtrackr')
        .setGazeListener(function(data, clock) {
        })
        .begin()
        .showPredictionPoints(true);
    store_points_variable();

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
