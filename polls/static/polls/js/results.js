function loadResults(total_votes, total_choices) {
    $ ('#update').attr('disabled', '');

    var width = 0.1;
    var id = 1;
    var elem = $("#foreground" + id);
    var percentage = ((elem.attr('value') / total_votes) * 100).toFixed(1);

    var interval = setInterval(function() {
        if (width < percentage) {
            width += 0.25;
            elem.css('width',  width + '%');
        } else if (id < total_choices){
            id++;
            width = 0;
            elem = $("#foreground" + id);
            percentage = ((elem.attr('value') / total_votes) * 100).toFixed(1);
        } else {
            clearInterval(interval);
            $ ('#update').removeAttr('disabled');
        }
    }, 1);
}

function update(updateUrl) {
    // disable the user from requesting another update until this ongoing
    // request is finalized.
    $ ('#update').attr('disabled', '');

    // installs the csrf into the header in preparation for the POST call
    setupDjangoToken();

    // POST a request to the server for the latest results on the poll
    $.ajax({
        type:"POST",
        url: updateUrl,
        data: {
            "request": 'update',
        },

        success: function(data, status) {
            var info = data.split(';')
            var total_votes = parseInt(info[0].split('=')[1]);

            for (var i = 1; i < info.length; i++) {
                var choice = info[i];
                var votes = parseInt(choice.split('=')[1]);

                $ ('#foreground' + i).css('width', '0%');
                $ ('#foreground' + i).attr('value', votes);
                $ ('#foreground' + i + ' p').text(choice.split('=')[0]);
            }

            $ ('#results h3').text(total_votes + ' vote' + pluralize(total_votes));
            loadResults(total_votes, i);
        },

        error: function(response) {
            alert("An error has occurred. Try again later. error_code=" + response.status);
            $ ('#update').removeAttr('disabled');
        }
    });
}

function pluralize(amount) {
    if (amount > 1) {
        return 's';
    } else {
        return '';
    }
}
