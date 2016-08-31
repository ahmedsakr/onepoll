function updatePolls(updateUrl) {
    $ ('table').css('display', 'none');
    var keywords = $('[name="keywords"]')
    var search = $('[name="search"]').filter(':checked');
    var amount = $('[name="amount"]').filter(':checked');
    var sort = $('[name="sort"]').filter(':checked');

    setupDjangoToken();

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
            $('tbody').children().next().remove();
            var polls = data.split('\n');
            polls.splice(-1, 1);
            for (var i = 0; i < polls.length; i++) {
                var info = String(polls[i]).split(';');
                var txt = "<tr>";

                for (var j = 0; j < info.length; j++) {
                    txt += '<td>' + info[j] + '</td>'
                }

                txt += '</tr>'
                $('table').append(txt)
            }

            $ ('table').css('display', 'table');
        }
    });
}
