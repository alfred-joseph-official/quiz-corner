$('document').ready(function() {
    // $('#signInBtn').click(function() {
    //     var data = {
    //         usn: $('#loginusn').val().trim(),
    //         pwd: $('#loginpwd').val().trim()
    //     }
    //     console.log(data);
    var redirIp = $('#redir');
    if (redirIp.val()) {
        $('#modalBtn')[0].click();
    }
    const signInBtn = $('#signInBtn');
    const signUpBtn = $('#signUpBtn');
    const resetBtn = $('#reset');
    signInBtn.click(function() {
        var pingServer = true;
        const errEle = $('#errorMsg');

        var data = {
            usn: $('#lusn').val(),
            pwd: $('#lpwd').val()
        }

        if (!(data.usn.length > 2)) {
            setAlert('Username should be 3 characters long!', $('#lerrusn'), 'text-danger');
            pingServer = false;
        }

        if (!(data.pwd.length > 5)) {
            setAlert('Password should be atleast 6 charcters long!', $('#lerrpwd'), 'text-danger');
            pingServer = false;
        }

        if (pingServer) {
            btnLoadingAnim(signInBtn, true, 'Sign In');
            signInBtn.prop('disabled', true);
            $.ajax({
                type: "POST",
                url: "/login",
                data: data,
                success: function(response) {
                    // console.log(response)
                    setAlert(response, $('#errorMsg'), 'text-success');
                    btnLoadingAnim(signInBtn, false, 'Sign In');
                },
                error: function(response) {
                    // console.log(response);
                    setAlert(response.responseText, $('#errorMsg'), 'text-danger');
                    btnLoadingAnim(signInBtn, false, 'Sign In');
                    signInBtn.prop('disabled', false);
                }
            });
        }
    });
    signUpBtn.click(function() {
        let pingServer = true;
        var data = {
            usn: $('#susn').val(),
            pwd: $('#spwd').val(),
            email: $('#semail').val(),
            cpwd: $('#cpwd').val()
        }
        if (!(/^[a-zA-Z0-9]{3,}/.test(data.usn))) {
            setAlert('Username should be atleast 3 characters long and only contain alphabets and numbers!', $('#serrusn'), 'text-danger');
            pingServer = false;
        }

        if (!(data.pwd.length > 5)) {
            setAlert('Password should be atleast 6 charcters long!', $('#serrpwd'), 'text-danger');
            pingServer = false;
        }
        if (data.pwd !== data.cpwd) {
            setAlert('Passwords dont match!', $('#serrcpwd'), 'text-danger');
            pingServer = false;
        }

        if (!(/^[a-zA-Z0-9_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(data.email))) {
            setAlert('Please Enter a Valid Email!', $('#serremail'), 'text-danger');
            pingServer = false
        }

        if (pingServer) {
            btnLoadingAnim(signUpBtn, true, 'Sign Up');
            signUpBtn.prop('disabled', true);
            $.ajax({
                type: "POST",
                url: "/signupuser",
                data: data,
                success: function(response) {
                    // console.log(response)
                    setAlert(response, $('#suemsg'), 'text-success');
                    btnLoadingAnim(signUpBtn, false, 'Sign Up');
                },
                error: function(response) {
                    // console.log(response);
                    setAlert(response.responseText, $('#suemsg'), 'text-danger');
                    btnLoadingAnim(signUpBtn, false, 'Sign Up');
                    signUpBtn.prop('disabled', false);
                }
            });
        }
    });

    resetBtn.click(function() {
        var pingServer = true;
        var data = {
            field: $('#resInp').val()
        }

        if (!(/^[a-zA-Z0-9_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(data.field))) {
            setAlert('Please Enter a Valid Email!', $('#resetAlert'), 'text-danger');
            pingServer = false;
        }

        if (pingServer) {
            btnLoadingAnim(resetBtn, true, '');
            resetBtn.prop('disabled', true);
            $.ajax({
                type: "POST",
                url: "/forgot",
                data: data,
                success: function(response) {
                    // console.log(response)
                    setAlert(response, $('#resetAlert'), 'text-success');
                    btnLoadingAnim(resetBtn, false, 'Reset');
                },
                error: function(response) {
                    // console.log(response);
                    setAlert(response.responseText, $('#resetAlert'), 'text-danger');
                    btnLoadingAnim(resetBtn, false, 'Reset');
                    resetBtn.prop('disabled', false);
                }
            });
        }
    });
});

function btnLoadingAnim(btn, state, text) {
    btn.empty();
    if (state) {
        btn.html('<span class="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>' + text);
    } else {
        btn.html(text);
    }
}

$.urlParam = function(name) {
    // var urlParams = new URLSearchParams(window.location.search);
    // if (urlParams.has(name)) {
    //     return urlParams.get(name);
    // } else return false;
    var str = window.location.search;
    return str.split(name + '=').pop();
}

// $.urlParam = function(name) {
//     var results = new RegExp('[\?&]' + name + '=([^&#]*)')
//         .exec(window.location.search);

//     return (results !== null) ? results[1] || 0 : false;
// }

function setAlert(str, doc, clss) {
    doc.text(str).removeClass().addClass(clss).show();
    setTimeout(() => {
        doc.hide('slow');
        if (clss == 'text-success') {
            var redir = $.urlParam('redirect');
            // console.log(decodeURI(window.location.search));

            console.log(redir);

            window.location.href = redir != false ? redir : '/';
        };
    }, 2000);
}