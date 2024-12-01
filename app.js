Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/classify_image",  // Update the URL to match the backend endpoint
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Some Message",
        autoProcessQueue: false,
        acceptedFiles: 'image/*', // Restrict the file types to images
        init: function() {
            // Intercept file processing and convert the image to base64
            this.on("addedfile", function(file) {
                // Read the file as base64 when it's added
                let reader = new FileReader();
                reader.onload = function(event) {
                    // The base64 string will be in event.target.result
                    let imageData = event.target.result;  // Base64-encoded image data
                    
                    // Send base64 image data to the backend via AJAX
                    $.ajax({
                        url: "/classify_image",  // Backend URL
                        type: "POST",  // HTTP method
                        contentType: "application/json",  // Ensure correct content type
                        data: JSON.stringify({ image_data: imageData }),  // Send as JSON
                        success: function(data, status) {
                            console.log(data);
                            if (!data || data.length == 0) {
                                $("#resultHolder").hide();
                                $("#divClassTable").hide();                
                                $("#error").show();
                                return;
                            }

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
                                $("#error").hide();
                                $("#resultHolder").show();
                                $("#divClassTable").show();
                                $("#resultHolder").html($(`[data-player="${match.class}"`).html());

                                let classDictionary = match.class_dictionary;
                                for (let personName in classDictionary) {
                                    let index = classDictionary[personName];
                                    let probabilityScore = match.class_probability[index];
                                    let elementName = "#score_" + personName;
                                    $(elementName).html(probabilityScore);
                                }
                            }
                        },
                        error: function(xhr, status, error) {
                            console.error("Error:", error);  // Log error if any
                        }
                    });
                };
                reader.readAsDataURL(file);  // Read file as base64 string
            });
        }
    });

    $("#submitBtn").on('click', function(e) {
        dz.processQueue();		
    });
}

$(document).ready(function() {
    console.log("ready!");
    $("#error").hide();
    $("#resultHolder").hide();
    $("#divClassTable").hide();

    init();
});
