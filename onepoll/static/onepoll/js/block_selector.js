/**
 * Block Selectors installs listeners on the block(s), once
 * clicked all input of that block are checked.
 */
function registerBlockSelectors(parent, blocks, func) {
    var arglen = arguments.length;
    $(document).ready(function() {
        $(parent).children().filter(blocks).click(function() {
            $(this).children().filter('input').prop('checked', true);

            if (arglen == 3) {
                func(parent, blocks, $(this));
            }
        });
    });
}
