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
                func($(this), $(parent).children().filter(blocks));
            }
        });
    });
}

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

function setupDjangoToken() {
    var csrftoken = getCookie('csrftoken');
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!requiresCsrfProtection(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
}

/**
 * Acquires the value of a cookie.
 */
function getCookie(name) {
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');

        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();

            if ((name + '=') === cookie.substring(0, name.length + 1)) {
                return decodeURIComponent(cookie.substring(name.length + 1));
            }
        }
    }

    return null;
}

/**
 * GET, HEAD, OPTIONS, and TRACE all do not require a csrf protection, this
 * method tests whether the method requires csrf protection
 */
function requiresCsrfProtection(method) {
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
