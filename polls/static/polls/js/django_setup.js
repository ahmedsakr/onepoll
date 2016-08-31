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
