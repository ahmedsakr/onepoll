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
        }
    }, 10);
}
