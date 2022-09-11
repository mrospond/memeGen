$(document).ready(function() {
    $(".milk-bar").hover(
        function () {
            $("#list-options").stop().slideDown().removeClass("hide-options");
        },
        function () {
            $("#list-options").stop().slideUp().addClass("hide-options");
        }
    );
});