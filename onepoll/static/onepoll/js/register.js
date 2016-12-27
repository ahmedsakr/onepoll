function submitForm() {
    var username = $('input[name="username"]');
    var passwords = $('input[type="password"]');
    var email = $('input[name="email"]');

    if (checkCredentials(username, email, passwords)) {

        // hash the password before transmittal
        // this is still not very safe, however it is better than storing plaintext passwords
        passwords[0].value = CryptoJS.MD5(passwords[0].value).toString();
        passwords[1].value = passwords[0].value;

        $('form').submit();
    }
}

function checkCredentials(username, email, passwords) {
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
