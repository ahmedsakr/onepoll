function updatePolls(updateUrl) {
    // disable the refine button to prevent multiple concurrent requests.
    $("#filters input[type='button']").attr('disabled', '');

    $('#polls').fadeOut("fast", function() {

        // a next method call is required to skip the headers row.
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
                'category': $('select').find(':selected').attr('value')
            },

            success: function(data, status) {
                if (data != "") {
                    json = JSON.parse(data);
                    var pdata = [];

                    for (var i = 0; i < json.length; i++) {
                        pdata.push(json[i].fields.pid);
                        pdata.push(json[i].fields.category);
                        pdata.push(json[i].fields.question_text);
                        pdata.push(json[i].fields.pub_date);
                        addRow(pdata);

                        pdata.length = 0; // empty the array
                    }
                }

                $('#polls').fadeIn('slow', function() {
                    $("#filters input[type='button']").removeAttr('disabled');
                });
            }
        });
    });
}


/**
 * Appends a row to the table.
 */
function addRow(data) {
    var txt = "<tr>\n";
    txt += "\t<td><a href='/p/" + data[0] + "/'>" + data[0] + "</a></td>\n";

    // index starts at 1 because data[0] has already been
    // manually added as shown above.
    for (var j = 1; j < data.length; j++) {
        txt += '\t<td>' + data[j] + '</td>\n'
    }

    txt += '</tr>'
    $('tbody').append(txt)
}
