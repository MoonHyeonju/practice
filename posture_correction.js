const URL = "https://teachablemachine.withgoogle.com/models/wJqtqOTGu/";
let model, webcam, ctx, labelContainer, maxPredictions;
let minutes = 0;
let seconds = 0;
let tenMillis = 0;
var audio = document.getElementById("audioElement");
const appendTens = document.getElementById("tenMillis");
const appendSeconds = document.getElementById("seconds");
const appendMinutes = document.getElementById("minutes");

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const size = 500;
    const flip = true; 
    webcam = new tmPose.Webcam(size, size, flip);
    await webcam.setup(); 
    await webcam.play();
    window.requestAnimationFrame(loop);

    const canvas = document.getElementById("canvas");
    canvas.width = size; canvas.height = size;
    ctx = canvas.getContext("2d");
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}

function stop() {
   webcam.stop();
}
async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

function operateTimer(){
    tenMillis++;
    appendTens.textContent = tenMillis > 9 ? tenMillis : '0' + tenMillis;
    if(tenMillis > 99){
        seconds++;
        appendSeconds.textContent = seconds > 9 ? seconds : '0' + seconds;
        tenMillis = 0;
        appendTens.textContent = "00";
    }
    if(seconds > 59){
        minutes++;
        appendMinutes.textContent = minutes > 9 ? minutes : '0' + minutes;
        seconds = 0
        appendSeconds.textContent = "00";
    }
}

function resetTimer() {
    appendTens.textContent = "00";
    appendSeconds.textContent = "00";
    appendMinutes.textContent = "00";
}

async function predict() {
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);  
    const prediction = await model.predict(posenetOutput);
    var audio = new Audio('alert.mp3');

    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[0].probability.toFixed(2) > 0.9) {
            setInterval(operateTimer, 1000);
        } else {
            clearInterval(operateTimer);
        }

        if(prediction[1].probability.toFixed(2) > 0.8){
            audio.play();

        }
        // const classPrediction =
        //      prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        // labelContainer.childNodes[i].innerHTML = classPrediction;
    }


    drawPose(pose);
}



function drawPose(pose) {
    if (webcam.canvas) {
        ctx.drawImage(webcam.canvas, 0, 0);
    // draw the keypoints and skeleton
        if (pose) {
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }
    }
}