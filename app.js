// Initialize the application
function init() {
    let fileInput = document.getElementById("fileInput");
    let submitBtn = document.getElementById("submitBtn");
    let errorDiv = document.getElementById("error");
    let resultHolder = document.getElementById("resultHolder");
    let classTableDiv = document.getElementById("divClassTable");
    
    errorDiv.style.display = "none";
    resultHolder.style.display = "none";
    classTableDiv.style.display = "none";

    submitBtn.addEventListener('click', function() {
        let file = fileInput.files[0];
        if (!file) {
            alert("Please select an image file.");
            return;
        }

        let reader = new FileReader();

        reader.onload = function(event) {
            let imageData = event.target.result;
            let base64Data = imageData.split(',')[1]; // Ensure backend gets raw base64

            console.log("Image Data:", imageData); // Log full base64 string
            console.log("Sending to server:", JSON.stringify({ image_data: base64Data }));

            fetch("https://image-recognition-liard.vercel.app/classify_image", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ image_data: base64Data })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    console.error("Server Error:", data.error);
                    errorDiv.textContent = data.error;
                    errorDiv.style.display = "block";
                    resultHolder.style.display = "none";
                    classTableDiv.style.display = "none";
                    return;
                }

                // Process results (handle data from server)
                let match = null;
                let bestScore = -1;
                for (let i = 0; i < data.length; ++i) {
                    let maxScoreForThisClass = Math.max(...data[i].class_probability);
                    if (maxScoreForThisClass > bestScore) {
                        match = data[i];
                        bestScore = maxScoreForThisClass;
                    }
                }

                if (match) {
                    errorDiv.style.display = "none";
                    resultHolder.style.display = "block";
                    classTableDiv.style.display = "block";
                    resultHolder.innerHTML = document.querySelector(`[data-player="${match.class}"]`).innerHTML;

                    let classDictionary = match.class_dictionary;
                    for (let player in classDictionary) {
                        let index = classDictionary[player];
                        let probabilityScore = match.class_probability[index];
                        let elementName = "#score_" + player;
                        document.querySelector(elementName).textContent = probabilityScore.toFixed(2);
                    }
                }
            })
            .catch(error => {
                console.error("Error:", error);
                errorDiv.textContent = "An error occurred while processing the request.";
                errorDiv.style.display = "block";
                resultHolder.style.display = "none";
                classTableDiv.style.display = "none";
            });
        };

        reader.readAsDataURL(file);
    });
}

// When the document is ready, initialize the application
document.addEventListener('DOMContentLoaded', function() {
    init();
});
