$('document').ready(function() {
    // $('#signInBtn').click(function() {
    //     var data = {
    //         usn: $('#loginusn').val().trim(),
    //         pwd: $('#loginpwd').val().trim()
    //     }
    //     console.log(data);
    $('#signInBtn').click(function() {
        var data = {
            usn: $('#lusn').val(),
            pwd: $('#lpwd').val()
        }
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
    })
    $('#signUpBtn').click(function() {
        var data = {
            usn: $('#susn').val(),
            pwd: $('#spwd').val(),
            email: $('#semail').val()
        }
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
    });

    $('#reset').click(function() {
        var data = {
            field: $('#resInp').val()
        }
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
    });
});

function setAlert(str, doc, clss) {
    doc.text(str).removeClass().addClass(clss).show();
    setTimeout(() => {
        doc.hide('slow');
        if (clss == 'text-success') window.location.href = '/';
    }, 2000);
}