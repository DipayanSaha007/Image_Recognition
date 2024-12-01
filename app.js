// Initialize the application
function init() {
    // Handle the file selection from the input
    let fileInput = document.getElementById("fileInput");
    let submitBtn = document.getElementById("submitBtn");
    let errorDiv = document.getElementById("error");
    let resultHolder = document.getElementById("resultHolder");
    let classTableDiv = document.getElementById("divClassTable");
    
    errorDiv.style.display = "none";
    resultHolder.style.display = "none";
    classTableDiv.style.display = "none";

    submitBtn.addEventListener('click', function() {
        // Get the file from the input
        let file = fileInput.files[0];
        if (!file) {
            return;
        }

        let reader = new FileReader();
        
        // When the file is read successfully
        reader.onload = function(event) {
            let imageData = event.target.result;

            // Send base64 image data to the server via AJAX
            fetch("/classify_image", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ image_data: imageData })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (!data || data.length === 0) {
                    errorDiv.style.display = "block";
                    resultHolder.style.display = "none";
                    classTableDiv.style.display = "none";
                    return;
                }

                // Handle the classification result (populate UI with results)
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
                        document.querySelector(elementName).textContent = probabilityScore;
                    }
                }
            })
            .catch(error => {
                console.error("Error:", error);
                errorDiv.style.display = "block";
                resultHolder.style.display = "none";
                classTableDiv.style.display = "none";
            });
        };

        reader.readAsDataURL(file);  // Read the file as base64 string
    });
}

// When the document is ready, initialize the application
document.addEventListener('DOMContentLoaded', function() {
    init();
});
