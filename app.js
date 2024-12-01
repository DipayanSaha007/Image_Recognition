Dropzone.autoDiscover = false;  // Prevent Dropzone from automatically attaching to elements

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/classify_image",  // Endpoint to process the image
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Drop an image here or click to upload",
        autoProcessQueue: false,  // Don't automatically process the file
        acceptedFiles: 'image/*', // Accept only image files
        init: function() {
            this.on("addedfile", function(file) {
                let reader = new FileReader();

                // Convert the image to base64 string
                reader.onload = function(event) {
                    let imageData = event.target.result;

                    // Send base64 image data to the server via AJAX
                    $.ajax({
                        url: "/classify_image",  // Your backend endpoint
                        type: "POST",  // Send POST request
                        contentType: "application/json",  // Set content type to JSON
                        data: JSON.stringify({ image_data: imageData }),  // Send image data as JSON
                        success: function(response) {
                            console.log(response);
                            if (!response || response.length === 0) {
                                $("#error").show();
                                $("#resultHolder").hide();
                                $("#divClassTable").hide();
                                return;
                            }

                            // Handle the classification result (populate UI with results)
                            let match = null;
                            let bestScore = -1;
                            for (let i = 0; i < response.length; ++i) {
                                let maxScoreForThisClass = Math.max(...response[i].class_probability);
                                if (maxScoreForThisClass > bestScore) {
                                    match = response[i];
                                    bestScore = maxScoreForThisClass;
                                }
                            }

                            if (match) {
                                $("#error").hide();
                                $("#resultHolder").show();
                                $("#divClassTable").show();
                                $("#resultHolder").html($(`[data-player="${match.class}"]`).html());

                                let classDictionary = match.class_dictionary;
                                for (let player in classDictionary) {
                                    let index = classDictionary[player];
                                    let probabilityScore = match.class_probability[index];
                                    let elementName = "#score_" + player;
                                    $(elementName).html(probabilityScore);
                                }
                            }
                        },
                        error: function(xhr, status, error) {
                            console.error("Error:", error);  // Log error if any
                            $("#error").show();
                            $("#resultHolder").hide();
                            $("#divClassTable").hide();
                        }
                    });
                };
                reader.readAsDataURL(file);  // Read file as base64 string
            });
        }
    });

    // Trigger the Dropzone queue to process the file when the button is clicked
    $("#submitBtn").on('click', function() {
        dz.processQueue();  // Trigger the file upload process
    });
}

$(document).ready(function() {
    init();
    $("#error").hide();
    $("#resultHolder").hide();
    $("#divClassTable").hide();
});
