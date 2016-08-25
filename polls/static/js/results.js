function loadResults(total_votes, total_choices) {
    var width = 1;
    var i = 1;
    var elem = document.getElementById("foreground" + i);
    var value = elem.getAttribute('value');
    var percentage = ((value / total_votes) * 100).toFixed(1);

    var interval = setInterval(function() {
        if (width < percentage) {
            width++;
            elem.style['width'] = width + '%';
        } else if (i < total_choices){
            elem.style['text-indent'] = '0em';
            i++;
            width = 1;
            elem = document.getElementById("foreground" + i);
            value = elem.getAttribute('value');
            percentage = ((value / total_votes) * 100).toFixed(1);
        } else {
            elem.style['text-indent'] = '0em';
            clearInterval(interval);
            $ ('#update').removeAttr('disabled');
        }
    }, 10);
}

function update(updateUrl) {
    var elemBtn = document.getElementById("update");

    // disable the user from requesting another update until this ongoing
    // request is finalized.
    elemBtn.setAttribute('disabled', '');

    // acquire the csrf token, and set the request header to it
    // NOTE: failing to do this will result in a 403 forbidden repsonse from
    // the Django server
    var csrftoken = getCookie('csrftoken');
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!requiresCsrfProtection(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

    // POST a request to the server for the latest results on the poll
    $.ajax({
        type:"POST",
        url: updateUrl,
        data: {
            "request": 'update',
        },

        success: function(data, status) {
            var choices = data.split(';')
            var total_votes = 0;
            for (var i = 0; i < choices.length; i++) {
                var choice = choices[i];
                var votes = parseInt(choice.split('=')[1]);
                var elem = document.getElementById('foreground' + (i+1));

                elem.style.width = '0%';
                elem.setAttribute('value', votes);
                $( '#foreground' + (i + 1) + ' p').text(choice.split('=')[0]);

                total_votes += votes;
            }

            $( '#results h3' ).text(total_votes + ' vote' + pluralize(total_votes));
            loadResults(total_votes, i);
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

function pluralize(amount) {
    if (amount > 1) {
        return 's';
    } else {
        return '';
    }
}
