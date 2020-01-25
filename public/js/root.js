$('document').ready(function() {
    // $('#signInBtn').click(function() {
    //     var data = {
    //         usn: $('#loginusn').val().trim(),
    //         pwd: $('#loginpwd').val().trim()
    //     }
    //     console.log(data);
    $('#signInBtn').click(function() {
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
            $.ajax({
                type: "POST",
                url: "/loginuser",
                data: data,
                success: function(response) {
                    console.log(response)
                    setAlert(response, $('#errorMsg'), 'text-success');
                },
                error: function(response) {
                    console.log(response);
                    setAlert(response.responseText, $('#errorMsg'), 'text-danger');
                }
            });
        }
    });
    $('#signUpBtn').click(function() {
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
            $.ajax({
                type: "POST",
                url: "/signupuser",
                data: data,
                success: function(response) {
                    console.log(response)
                    setAlert(response, $('#suemsg'), 'text-success');
                },
                error: function(response) {
                    console.log(response);
                    setAlert(response.responseText, $('#suemsg'), 'text-danger');
                }
            });
        }
    });

    $('#reset').click(function() {
        var pingServer = true;
        var data = {
            field: $('#resInp').val()
        }

        if (!(/^[a-zA-Z0-9_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(data.email))) {
            setAlert('Please Enter a Valid Email!', $('#serremail'), 'text-danger');
            pingServer = false;
        }
        if (pingServer) {
            $.ajax({
                type: "POST",
                url: "/forgot",
                data: data,
                success: function(response) {
                    console.log(response)
                    setAlert(response, $('#resetAlert'), 'text-success');
                },
                error: function(response) {
                    console.log(response);
                    setAlert(response.responseText, $('#resetAlert'), 'text-danger');
                }
            });
        }
    });
});

function setAlert(str, doc, clss) {
    doc.text(str).removeClass().addClass(clss).show();
    setTimeout(() => {
        doc.hide('slow');
        if (clss == 'text-success') window.location.href = '/';
    }, 2000);
}