var socket = io("http://localhost:5050");
Dropzone.autoDiscover = false;
$(function() {
    $("#dropzone").dropzone({
        autoProcessQueue: false,
        url: '#',
        dictDefaultMessage: "Click here or drag files to upload",
        init: function () {

            var myDropzone = this;

            $("#dropzone-submit-button").on("click", function (e) {
                e.preventDefault();
                $(".output").append("<br>");
                socket.emit('submit', {
                    filename: myDropzone.files[0].name,
                    data: myDropzone.files[0],
                });
                myDropzone.removeAllFiles();
            });
        }
    });
});
