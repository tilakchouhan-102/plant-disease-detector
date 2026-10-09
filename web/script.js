
let scanButton =
    document.getElementById("scanButton");

let camera =
    document.getElementById("camera");

let status =
    document.getElementById("status");

let captureButton =
    document.getElementById("captureButton");

let canvas =
    document.getElementById("canvas");

let capturedImage =
    document.getElementById("capturedImage");

let predictButton =
    document.getElementById("predictButton");

let resultText =
    document.getElementById("resultText");

let resetButton =
    document.getElementById("resetButton");

let cameraSection =
    document.getElementById("cameraSection");


let cameraStream = null;

let cameraActive = false;

let capturedBlob = null;


// INITIAL SCREEN

cameraSection.style.display = "none";

captureButton.style.display = "none";

predictButton.style.display = "none";

capturedImage.style.display = "none";

resetButton.style.display = "none";


// OPEN CAMERA

scanButton.addEventListener("click", function() {

    if (cameraActive) {

        status.textContent =
            "Camera is already running.";

        return;
    }


    cameraSection.style.display =
        "block";


    status.textContent =
        "Opening camera...";


    navigator.mediaDevices.getUserMedia({

        video: true

    })

    .then(function(stream) {

        cameraStream = stream;

        cameraActive = true;

        camera.srcObject = stream;


        status.textContent =
            "Camera is ready.";


        captureButton.style.display =
            "inline-block";


        scanButton.disabled = true;

    })


    .catch(function(error) {

        cameraActive = false;

        scanButton.disabled = false;


        console.error(error);


        if (error.name === "NotAllowedError") {

            status.textContent =
                "Camera permission was denied.";

        }


        else if (error.name === "NotFoundError") {

            status.textContent =
                "No camera was found on this device.";

        }


        else if (error.name === "NotReadableError") {

            status.textContent =
                "Camera is being used by another application.";

        }


        else if (error.name === "SecurityError") {

            status.textContent =
                "Camera access is blocked by the browser.";

        }


        else {

            status.textContent =
                "Unable to open the camera.";

        }

    });

});


// CAPTURE LEAF

captureButton.addEventListener("click", function() {

    if (!cameraActive) {

        status.textContent =
            "Camera is not active.";

        return;
    }


    if (
        camera.videoWidth === 0 ||
        camera.videoHeight === 0
    ) {

        status.textContent =
            "Camera is not ready yet.";

        return;
    }


    let width =
        camera.videoWidth;

    let height =
        camera.videoHeight;


    canvas.width =
        width;

    canvas.height =
        height;


    let context =
        canvas.getContext("2d");


    context.drawImage(

        camera,

        0,

        0,

        width,

        height

    );


    let imageData =
        canvas.toDataURL("image/jpeg");


    capturedImage.src =
        imageData;


    capturedImage.style.display =
        "block";


    canvas.toBlob(function(blob) {

        capturedBlob = blob;


        if (capturedBlob) {

            predictButton.style.display =
                "inline-block";

        }

    }, "image/jpeg");


    status.textContent =
        "Leaf image captured.";

});


// SEND IMAGE TO FLASK

predictButton.addEventListener("click", function() {

    if (!capturedBlob) {

        status.textContent =
            "Please capture a leaf image.";

        resultText.textContent =
            "No image available.";

        return;
    }


    predictButton.disabled =
        true;


    status.textContent =
        "Sending image to Python...";


    resultText.textContent =
        "Checking...";


    let formData =
        new FormData();


    formData.append(

        "image",

        capturedBlob,

        "leaf.jpg"

    );


    fetch("/predict", {

        method: "POST",

        body: formData

    })


    .then(function(response) {

        return response.json();

    })


    .then(function(data) {

        if (data.disease) {

            resultText.textContent =
                data.disease;


            status.textContent =
                "Prediction completed.";


            console.log(
                "Prediction:",
                data.disease
            );


            console.log(
                "Confidence:",
                data.confidence
            );


            resetButton.style.display =
                "inline-block";


            predictButton.disabled =
                false;

        }


        else {

            resultText.textContent =
                "No prediction received.";


            status.textContent =
                "Something went wrong.";


            predictButton.disabled =
                false;

        }

    })


    .catch(function(error) {

        console.error(error);


        resultText.textContent =
            "Prediction failed.";


        status.textContent =
            "Could not connect to Flask.";


        predictButton.disabled =
            false;

    });

});


// SCAN ANOTHER LEAF

resetButton.addEventListener("click", function() {


    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(function(track) {

                track.stop();

            });


        cameraStream =
            null;

    }


    cameraActive =
        false;


    camera.srcObject =
        null;


    capturedBlob =
        null;


    capturedImage.src =
        "";


    capturedImage.style.display =
        "none";


    predictButton.style.display =
        "none";


    resetButton.style.display =
        "none";


    captureButton.style.display =
        "none";


    resultText.textContent =
        "No prediction yet";


    status.textContent =
        "Ready for a new scan.";


    scanButton.disabled =
        false;


    cameraSection.style.display =
        "none";

});