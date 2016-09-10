/**
 * Selection Listener essentially allows the user to click anywhere on the
 * choice rectangle to toggle the corresponding radio button, rather than having
 * to navigate to the far-left radio button and selecting it.
 */
function registerSelectionListeners(count) {
    $(document).ready(function() {
        for (var x = 1; x <= count; x++) {
            $('#option-' + x).click(function() {
                $(this).children().filter('input').prop('checked', true);
                $('form').children().filter("[id^='option-']").css('opacity', '0.7');
                $(this).css('opacity', '1');
            });
        }
    });
}
