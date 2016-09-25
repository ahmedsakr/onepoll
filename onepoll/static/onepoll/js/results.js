function loadResults(votes, total_votes, total_choices) {
    $ ('input').attr('disabled', '');
    var get_percentage = function(votes) {
        return ((votes / total_votes) * 100).toFixed(1);
    }

    var elems = $("[class='progress-foreground']");
    var width = 0, id = 0, percentage = get_percentage(votes[id]);

    var interval = setInterval(function() {
        if (width < percentage) {
            width += 0.25;
            elems[id].style.width = width + '%';
        } else if (id < total_choices - 1){
            id++;
            width = 0;
            percentage = get_percentage(votes[id]);
        } else {
            clearInterval(interval);
            $ ('input').removeAttr('disabled');
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
            var pluralize = function(amount) {
                if (amount > 1) {
                    return 's';
                } else {
                    return '';
                }
            }

            var info = data.split(';')
            var total_votes = parseInt(info.shift().split('=')[1]);
            var votes_arr = [];

            $('h3').text(total_votes + ' vote' + pluralize(total_votes));
            var elems = $("[class='progress-foreground']")
            elems = elems.css("width", "0%").children().filter('div');

            for (var i = 0; i < info.length; i++) {
                var choice = info[i];
                
                elems[i].innerHTML = choice.split('=')[0];
                var votes = parseInt(choice.split('=')[1]);
                votes_arr.push(votes);
            }

            loadResults(votes_arr, total_votes, i);
        },

        error: function(response) {
            alert("An error has occurred. Try again later. error_code=" + response.status);
            $ ('input').removeAttr('disabled');
        }
    });
}
