function accountSlide() {
    if ($('form').css('display') == 'none') {
        $('form').slideDown();
    } else {
        $('form').slideUp();
    }
}
