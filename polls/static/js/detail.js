var selectedChoice = 0;

function jQueryEffects(count) {
    $(document).ready(
        function() {
            for (x = 1; x <= count; x++) {

                // registering the hover effect of the choice boxes
                registerHoverEffects(x);

                // registering the choice box on-click radio button toggle

                $('#rect-' + x).click(
                    function() {

                        // unselects the currently selected (if any) choice
                        // and re-registers the hover effects.
                        if (selectedChoice != 0) {
                            registerHoverEffects(selectedChoice);
                        }

                        // deregisters the hover effects for the selected choice,
                        // saves the selected choice index, and selects the
                        // radio button
                        $(this).hover(function(){ });
                        selectedChoice = $(this).attr('name').slice(-1);

                        $( '#choice' + selectedChoice).prop('checked', true);
                });
            }
        });
}

function registerHoverEffects(choice) {
    $('#rect-' + choice).hover(
        function() {
            $(this).css({opacity: 1});
        },
        function() {
            $(this).css({opacity: 0.7});
    });
}
