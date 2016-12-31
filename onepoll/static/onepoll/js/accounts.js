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

    password.value = hash(password);
    $('form').attr('action', '/login/');
    $('form').submit();
    $('form').removeAttr('action');
}

function hash(input) {
    input.value = CryptoJS.MD5(input.value);
    var saltSize = parseInt(Math.ceil(Math.random() * 9));
    var salt = CryptoJS.lib.WordArray.random(saltSize);

    return saltSize + salt + input.value;
}

function displayLoginResult(authenticated) {
    if (!authenticated) {
        $('form').css('display', 'block');
        showError($('input[type="button"]'), "Incorrect username or password");
    }
}
