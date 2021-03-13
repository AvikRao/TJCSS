var socket = io("http://52.146.18.230:5050");
Dropzone.autoDiscover = false;
$(function() {

    // if (left > right) {
    //     document.getElementById('rightdiv').style.height = left;
    // }
    // else {
    //     document.getElementById('leftdiv').style.height = right;
    // }

    const __userid = $("#__userid").attr("class");
    $("#dropzone").dropzone({
        autoProcessQueue: false,
        url: '#',
        dictDefaultMessage: "Click here or drag files to upload",
        init: function () {

            var myDropzone = this;

            this.on("addedfile", function(file) {
                $("#dropzone-submit-button").attr("disabled", false); 
                $("#dropzone-clear-button").attr("disabled", false); 
            });

            $("#dropzone-submit-button").on("click", function (e) {
                console.log(__userid);
                e.preventDefault();
                //$(".output-body").append("yep<br>"); //TEST
                $($(".output-body")[0]).scrollTop(function () { return this.scrollHeight; });
                socket.emit('submit', {
                    filename: myDropzone.files[0].name,
                    data: myDropzone.files[0],
                    labid: window.location.href.match(/lab\/(?<id>\d+)/).groups?.id,
                    userid: __userid,
                });
                myDropzone.removeAllFiles();
            });

            $("#dropzone-clear-button").on("click", function(e) {
                e.preventDefault();
                myDropzone.removeAllFiles();
                $(this).attr("disabled", true);
                $("#dropzone-submit-button").attr("disabled", true);
            });
        }
    });

    socket.on("output", (output) => {
        let parsed = output.split(/\n/);
        for (let line of parsed) {
            $('<div class="stdout-output"/>').text(line).appendTo(".output-body");
        }
    });

    socket.on("system", (output) => {
        let parsed = output.split(/\n/);
        for (let line of parsed) {
            $('<div class="system-output"/>').text(line).appendTo(".output-body");
        }
    });

    socket.on("error", (output) => {
        let parsed = output.split(/\n/);
        for (let line of parsed) {
            $('<div class="error-output"/>').text(line).appendTo(".output-body");
        }
    });

    socket.on("success", (output) => {
        let parsed = output.split(/\n/);
        for (let line of parsed) {
            $('<div class="success-output"/>').text(line).appendTo(".output-body");
        }
        $(".output").append("<br>");
    });

    socket.on("timeout", (output) => {
        let parsed = output.split(/\n/);
        for (let line of parsed) {
            $('<div class="timeout-output"/>').text(line).appendTo(".output-body");
        }
        $(".output").append("<br>");
    });

    const rightColHeight = $($(".lab-right-container")[0]).outerHeight();
    const dropzoneHeight = $($(".file-upload")[0]).outerHeight();
    const dropzoneButtonHeight = $($(".dropzone-buttons")[0]).outerHeight();
    const maxSubmissionHeight = rightColHeight-dropzoneHeight-dropzoneButtonHeight;
    $($(".submission-output")[0]).css("max-height", maxSubmissionHeight);
    const submissionHeight = $($(".submission-output")[0]).outerHeight();
    const outputHeaderHeight = $($(".output-header")[0]).outerHeight();
    const maxOutputBodyHeight = submissionHeight - outputHeaderHeight;
    $($(".output-body")[0]).css("height", maxOutputBodyHeight-5);

    
});
