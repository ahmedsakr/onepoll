 /**              ___________________________________________________________________________________________
  *              |  All methods for use in handling Accounts at OnePoll.                                     |
  *              |  (i.e. logging in, submitting a registration form)                                        |
  *              |___________________________________________________________________________________________|
  **/

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
    var rememberme = $('[name="remember-me"]').prop("checked");

    if (username.value.length < 3 || username.value.length > 16) {
        showError(username, "Username must be 3-16 characters long.", [0, -10]);
        return;
    }

    if (password.value.length < 8 || password.value.length > 16) {
        showError(password, "Password must be 8-16 characters long.", [0, 10]);
        return;
    }

    if (rememberme == true && getCookie("username") != username.value) {
        setCookie("username", username.value, 365);
    } else if (rememberme == false && getCookie("username")) {
        deleteCookie("username");
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

/**              ___________________________________________________________________________________________
 *              |  All methods that are not specific to a certain application but may and are used commonly.|
 *              |  (i.e. setting up django environment variables for POST/GET, show server response)        |
 *              |___________________________________________________________________________________________|
 **/

 /**
  * Block Selectors installs listeners on the block(s), once
  * clicked all input of that block are checked.
  */
 function registerBlockSelectors(parent, blocks, func) {
     var arglen = arguments.length;
     $(document).ready(function() {
         $(parent).children().filter(blocks).click(function() {
             $(this).children().filter('input').prop('checked', true);

             if (arglen == 3) {
                 func($(this), $(parent).children().filter(blocks));
             }
         });
     });
 }

 function showError(element, error, box_offset) {

     // error already exists
     if ($(element).data('tooltipsy') != null) {
         return;
     }

     if (typeof box_offset == "undefined") {
         box_offset = [10, 0];
     }

     $(element).css('border', 'solid 1.6px red');
     $(element).attr('title', error);
     $(element).tooltipsy({
         offset: box_offset,
         css: {
             'padding': '10px',
             'max-width': '300px',
             'color': 'white',
             'background-color': 'maroon',
             'border-radius': '5px'
         }
     });

     $(element).data('tooltipsy').show();
     setTimeout(
         function() {
             $(element).data('tooltipsy').destroy();
             $(element).removeData('tooltipsy');
             $(element).removeAttr('title');
             $(element).css('border', '');
         }
     , 2500);
 }

 function setupDjangoToken() {
     var csrftoken = getCookie('csrftoken');
     $.ajaxSetup({
         beforeSend: function(xhr, settings) {
             if (!requiresCsrfProtection(settings.type) && !this.crossDomain) {
                 xhr.setRequestHeader("X-CSRFToken", csrftoken);
             }
         }
     });
 }

 /**
  * GET, HEAD, OPTIONS, and TRACE all do not require a csrf protection, this
  * method tests whether the method requires csrf protection
  */
 function requiresCsrfProtection(method) {
     return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
 }

 /**              ___________________________________________________________________________________________
  *              |  All methods that are specific to computing and refining the public polls template.       |
  *              |  (i.e. request new server data with refined search criteria, update the table)            |
  *              |___________________________________________________________________________________________|
  **/

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
              },

              error: function(data, status) {
                  alert("An error occurred while connecting to the server. Please try again!");
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

  /**              ___________________________________________________________________________________________
   *              |  All methods that are specific to receiving poll results from the server.                 |
   *              |  (i.e. request new poll results data, load them into progress bars with animations)       |
   *              |___________________________________________________________________________________________|
   **/

   function loadResults(votes, total_votes, total_choices) {
       var get_percentage = function(votes) {
           return ((votes / total_votes) * 100).toFixed(1);
       }

       var elems = $("[class='progress-foreground']");
       var width = 0, id = 0, percentage = get_percentage(votes[id]);

       var interval = setInterval(function() {
           if (width < percentage) {
               width += 0.25;
               elems[id].style.width = width + '%';
           } else if (id < total_choices - 1){
               id++;
               width = 0;
               percentage = get_percentage(votes[id]);
           } else {
               clearInterval(interval);
               $ ('input').removeAttr('disabled');
           }
       }, 1);
   }

   function update(updateUrl) {
       // disable the user from requesting another update until this ongoing
       // request is finalized.
       $ ('input').attr('disabled', '');

       // installs the csrf into the header in preparation for the POST call
       setupDjangoToken();

       // POST a request to the server for the latest results on the poll
       $.ajax({
           type:"POST",
           url: updateUrl,
           data: {
               "request": 'update',
           },

           success: function(data, status) {
               var pluralize = function(amount) {
                   if (amount > 1) {
                       return 's';
                   } else {
                       return '';
                   }
               }

               // parse the received json data, and initalize needed attributes
               json = JSON.parse(data);
               choices = json.choices;
               total_votes = json.total_votes;
               var choicesVotes = [];

               // update total votes header and acquire all progress bars
               $('h3').text(total_votes + ' vote' + pluralize(total_votes));
               var elems = $("[class='progress-foreground']")
               elems = elems.css("width", "0%").children().filter('div');

               // update text-over progress bar and collect number of votes for every choice
               $.each(choices, function(key, choice) {
                   elems[choice.id].innerHTML = choice.text;
                   choicesVotes.splice(choice.id, 0, choice.votes);
               });

               loadResults(choicesVotes, total_votes, Object.keys(choices).length);
           },

           error: function(response) {
               alert("An error has occurred. Try again later. error_code=" + response.status);
               $ ('input').removeAttr('disabled');
           }
       });
   }


    function showStep(num) {
        var step = $('#step-' + num);

        if (step.css('display') == "none") {
            step.animate({
                opacity: 1.00,
                left: "+=250",
                height: ["toggle", "swing"]
            }, 400, "linear");
        }
    }

    function updateCharCounter(text, amount) {
        var counter = $(text).parent().children(".char-counter");
        var ratio = text.value.length / amount;

        while (ratio > 1.00) {
            text.value = text.value.substring(0, text.value.length - 1);
            ratio = text.value.length / amount;
        }

        if (ratio >= 0.90) {
            counter.html("<span style='color: red;'>" + text.value.length + " / " + amount + " characters</span>");
        } else {
            counter.html(text.value.length + " / " + amount + " characters");
        }
    }

   /**              ___________________________________________________________________________________________
    *              |  All methods that are specific to managing locally stored cookies.                        |
    *              |  (i.e. get/check if a cookie exists, add a new cookie                                     |
    *              |___________________________________________________________________________________________|
    **/

    /**
     * Acquires the value of a cookie.
     */
    function getCookie(name) {
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');

            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();

                if ((name + '=') === cookie.substring(0, name.length + 1)) {
                    return decodeURIComponent(cookie.substring(name.length + 1));
                }
            }
        }

        return null;
    }

    function setCookie(name, value, daysValid) {
        var date = new Date();
        date.setTime(date.getTime() + (daysValid * 24 * 60 * 60 * 1000));

        document.cookie = name + "=" + value + ";expires=" + date.toUTCString() + ";path=/";
    }

    function deleteCookie(name) {
        var date = new Date();
        date.setTime(date.getTime() - 1000);

        document.cookie = name + "=;expires=" + date.toUTCString();
    }
