function updatePolls(updateUrl) {
    // hide the table and delete the rows
    $('#polls').fadeOut("fast", function() {
        $('tbody').children().next().remove();

        // acquire all the filter elements
        var keywords = $('[name="keywords"]')
        var search = $('[name="search"]').filter(':checked');
        var amount = $('[name="amount"]').filter(':checked');
        var sort = $('[name="sort"]').filter(':checked');

        // pre-post setup for django
        setupDjangoToken();

        // POST request to retrieve information with the updated filters
        $.ajax({
            type: "POST",
            url: updateUrl,
            data: {
                'request': 'update',
                'keywords': keywords.val(),
                'search': search.val(),
                'amount': amount.val(),
                'sort': sort.val()
            },

            success: function(data, status) {
                var polls = data.split('\n');

                // there is an extra empty element in the polls array due to
                // every line having a '\n' at the very end.
                polls.pop();

                for (var i = 0; i < polls.length; i++) {
                    var info = String(polls[i]).split(';');
                    var txt = "<tr>\n";
                    txt += "<td><a href='/" + info[0] + "/'>" + info[0] + "</a></td>\n";

                    // index stars at 1 because info[0] has already been
                    // manually added as shown above.
                    for (var j = 1; j < info.length; j++) {
                        txt += '\t<td>' + info[j] + '</td>\n'
                    }

                    txt += '</tr>'
                    $('tbody').append(txt)
                }

                $('#polls').fadeIn('slow');
            }
        });
    });
}
