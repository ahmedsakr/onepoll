function accountSlide() {
    if ($('#accounts').prop('display') == 'none') {
        $('#accounts').removeProp('display');
        $('#accounts').slideDown();
    } else {
        $('#accounts').prop('display', 'none');
        $('#accounts').slideUp();
    }
}
