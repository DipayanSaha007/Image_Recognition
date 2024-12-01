Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/classify_image",  // Update the URL to match the backend endpoint
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Some Message",
        autoProcessQueue: false
    });
    
    dz.on("addedfile", function() {
        if (dz.files[1] != null) {
            dz.removeFile(dz.files[0]);
        }
    });

    dz.on("complete", function(file) {
        let imageData = file.dataURL;  // This is base64-encoded image data
        
        var url = "/classify_image";

        // Send the image data as JSON using $.ajax
        $.ajax({
            url: url,  // Backend URL
            type: "POST",  // HTTP method
            contentType: "application/json",  // Set the correct content type
            data: JSON.stringify({ image_data: imageData }),  // Send data as JSON
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
