function loginFormSlide() {
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
        showError(username, "Username must be 3-16 characters long.", [0, -10]);
        return;
    }

    if (password.value.length < 8 || password.value.length > 16) {
        showError(password, "Password must be 8-16 characters long.", [0, 10]);
        return;
    }

    if (getCookie("username") != username.value) {
        setCookie("username", username.value, 365);
    }

    password.value = hash(password);
    $('form').attr('action', '/');
    $('form').submit();
    $('form').removeAttr('action');
}

function displayLoginResult(authenticated, username) {
    if (authenticated) {
        $('a[name="account-text"]').html('Welcome, ' + username);
    } else {
        $('form').css('display', 'block');
        showError($("[name='username']"), "Incorrect username or password", [0, -10]);
    }
}

function submitRegistrationForm() {
    var username = $('input[name="username"]');
    var passwords = $('input[type="password"]');
    var email = $('input[name="email"]');

    if (checkRegistrationCredentials(username, email, passwords)) {

        // hash the password before transmittal
        // this is still not very safe, however it is better than storing plaintext passwords
        passwords[0].value = hash(passwords[0]);
        passwords[1].value = passwords[0].value;

        $('form').submit();
    }
}

function checkRegistrationCredentials(username, email, passwords) {
    var uVal = username.val().trim();
    var eVal = email.val().trim();
    if (uVal.length < 3 || uVal.length > 16) {
        showError(username, "Username must be 3-16 characters long.");
        return false;
    }

    if (passwords[0].value.length < 8 || passwords[0].value.length > 16) {
        showError(passwords[0], "Passwords must be 8-16 characters long.");
        return false;
    }

    if (passwords[0].value != passwords[1].value) {
        showError(passwords[1], "Passwords must match!");
        return false;
    }

    if (eVal.length != 0) {

        // checks if there exists an @ in the email and if it is not the last
        // character
        if (eVal.indexOf("@") > 0 && eVal.indexOf("@") != eVal.length - 1) {
            var afterAt = eVal.substring(eVal.indexOf("@") + 1);

            // checks if there is only one @ in the email provided, and if there is
            // atleast one dot that is sandwiched between text,
            if (afterAt.indexOf("@") == -1 &&
                    (afterAt.indexOf(".") > 0 && afterAt.indexOf(".") != afterAt.length - 1)
                        && (eVal.substring(eVal.length - 1) != ".")) {
                return true
            }
        }

        showError(email, "Invalid E-mail format");
        return false;
    }

    return true;
}

function hash(input) {
    input.value = CryptoJS.MD5(input.value);
    var saltSize = parseInt(Math.ceil(Math.random() * 9));
    var salt = CryptoJS.lib.WordArray.random(saltSize);

    return saltSize + salt + input.value;
}
