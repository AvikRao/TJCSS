$(document).ready(function() {
});

function verifyAdd() {
    let classid = $("#class-id-input").val();
    $.post( "/joinclassverify", {classid: classid}, function( response ) {
        let error = response.error;
        if (error) {
            if (!($("#error-small").length)) {
                $("#class-id-input").after('<small id="error-small" class="form-text">Invalid class code.</small>');
            }
        }
    });
}