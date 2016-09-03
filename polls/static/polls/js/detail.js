/**
 * Iterates over all the choice rectangles, and registers all
 * available listeners.
 */
function registerListeners(count) {
    $(document).ready(function() {
        for (x = 1; x <= count; x++) {
            registerHoverListener('#option-' + x);
            registerSelectionListener('#option-' + x);
        }
    });
}

/**
 * Hover listener focuses on the main element the user's mouse is currently
 * hovered on, giving the recetangle a full opacity of 1.0, while all other
 * rectangles are dimmed to an opacity of 0.7.
 */
function registerHoverListener(elem) {
    $(elem).hover(function() {
            $(this).css({opacity: 1});
    }, function() {
            $(this).css({opacity: 0.7});
    });
}

/**
 * Selection Listener essentially allows the user to click anywhere on the
 * choice rectangle to toggle the corresponding radio button, rather than having
 * to navigate to the far-left radio button and selecting it.
 */
function registerSelectionListener(elem) {
    $(elem).click(function() {
        selectedChoice = $(this).attr('id').slice(-1);
        $( '#radio' + selectedChoice).prop('checked', true);
    });
}
