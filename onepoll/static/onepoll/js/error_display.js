function showError(element, error, box_offset) {

    // error already exists
    if ($(element).data('tooltipsy') != null) {
        return;
    }

    if (typeof box_offset == "undefined") {
        box_offset = [10, 0];
    }
    
    $(element).css('border', 'solid 1.6px red');
    $(element).attr('title', error);
    $(element).tooltipsy({
        offset: box_offset,
        css: {
            'padding': '10px',
            'max-width': '300px',
            'color': 'white',
            'background-color': 'maroon',
            'border-radius': '5px'
        }
    });

    $(element).data('tooltipsy').show();
    setTimeout(
        function() {
            $(element).data('tooltipsy').destroy();
            $(element).removeData('tooltipsy');
            $(element).removeAttr('title');
            $(element).css('border', '');
        }
    , 2500);
}
