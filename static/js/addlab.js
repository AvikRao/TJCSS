$(function () {  
    
    $("textarea").keyup(function (e) {
        while ($(this).outerHeight() < this.scrollHeight + parseFloat($(this).css("borderTopWidth")) + parseFloat($(this).css("borderBottomWidth"))) {
            $(this).height($(this).height() + 1);
        };
    });

    $("#deadlineBoolInput").on("click", function () {
        if ($(this).is(":checked")) {
            $("#deadlineDateInput").prop("disabled", false);
            $("#deadlineTimeInput").prop("disabled", false);
        } else {
            $("#deadlineDateInput").prop("disabled", true);
            $("#deadlineTimeInput").prop("disabled", true);
        }
    });

    $("#submissionBoolInput").on("click", function () {
        if ($(this).is(":checked")) {
            $("#submissionLimitInput").prop("disabled", false);
        } else {
            $("#submissionLimitInput").prop("disabled", true);
        }
    });

    $("#labLanguageInput").on("change", function () {
        if ($(this).val().toLowerCase() == "java" || $(this).val().toLowerCase() == "python") {
            $(".autograding-group").css("display", "block");
        } else {
            $(".autograding-group").css("display", "none");
        }
    });

    $("#autogradingBoolInput").on("click", function () {
        if ($(this).is(":checked")) {
            $("#graderFileUpload").prop("disabled", false);
        } else {
            $("#graderFileUpload").prop("disabled", true);
        }
    });
});
