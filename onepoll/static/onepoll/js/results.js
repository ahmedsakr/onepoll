function loadResults(votes, total_votes, total_choices) {
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
    $ ('input').attr('disabled', '');

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

            // parse the received json data, and initalize needed attributes
            json = JSON.parse(data);
            choices = json.choices;
            total_votes = json.total_votes;
            var choicesVotes = [];

            // update total votes header and acquire all progress bars
            $('h3').text(total_votes + ' vote' + pluralize(total_votes));
            var elems = $("[class='progress-foreground']")
            elems = elems.css("width", "0%").children().filter('div');

            // update text-over progress bar and collect number of votes for every choice
            $.each(choices, function(key, choice) {
                elems[choice.id].innerHTML = choice.text;
                choicesVotes.splice(choice.id, 0, choice.votes);
            });

            loadResults(choicesVotes, total_votes, Object.keys(choices).length);
        },

        error: function(response) {
            alert("An error has occurred. Try again later. error_code=" + response.status);
            $ ('input').removeAttr('disabled');
        }
    });
}
