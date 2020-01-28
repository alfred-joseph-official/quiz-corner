$('document').ready(function() {
    var cnfmBtn = $('#ConfirmBtn')
    cnfmBtn.click(function() {
        let pingServer = true;
        var fdata = {
            usn: $('#fpusn').val(),
            pwd: $('#fppwd').val(),
            cpwd: $('#fpcpwd').val()
        }

        if (!(fdata.pwd.length > 5)) {
            setAlert('Password should be atleast 6 charcters long!', $('#cperr'), 'text-danger');
            pingServer = false;
        }
        if (fdata.pwd !== fdata.cpwd) {
            setAlert('Passwords dont match!', $('#cperrc'), 'text-danger');
            pingServer = false;
        }

        if (pingServer) {
            btnLoadingAnim(cnfmBtn, true, 'Sign Up');
            cnfmBtn.prop('disabled', true);
            $.ajax({
                type: "POST",
                url: "/pwd",
                data: fdata,
                success: function(response) {
                    // console.log(response)
                    setAlert(response, $('#pChangeAlert'), 'text-success');
                    btnLoadingAnim(cnfmBtn, false, 'Confirm');
                },
                error: function(response) {
                    // console.log(response);
                    setAlert(response.responseText, $('#pChangeAlert'), 'text-danger');
                    btnLoadingAnim(cnfmBtn, false, 'Confirm');
                    cnfmBtn.prop('disabled', false);
                }
            });
        }
    });
});

function resetPass() {
    resetSuccess.fadeIn('slow');
}