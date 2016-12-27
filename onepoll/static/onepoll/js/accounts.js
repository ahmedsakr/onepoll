function accountSlide() {
    if ($('form').css('display') == 'none') {
        $('form').slideDown();
    } else {
        $('form').slideUp();
    }
}

function attemptLogin() {
    var username = $('[name="username"]')[0];
    var password = $('[name="password"]')[0];

    if (username.value.length < 3 || username.value.length > 16) {
        showError(username, "Username must be 3-16 characters long.", [0, -20]);
        return;
    }

    if (password.value.length < 8 || password.value.length > 16) {
        showError(password, "Password must be 8-16 characters long.", [0, -20]);
        return;
    }

    password.value = CryptoJS.MD5(password.value).toString();
    $('form').submit();
}

function secure_hash(input) {
    var nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
                        'u', 'v', 'w', 'x', 'y', 'z'];

}

function getIdentifierIndex(length) {
    if (length < 0) {
        return;
    }

    var running_sum = 0;
    while (length > 0) {
        length %= 2;
        running_sum++;
    }

    return running_sum;
}
