function enabled() {
    document.getElementById('password').removeAttribute('disabled');
    document.getElementById('userphone').removeAttribute('disabled');
    document.getElementById('useraddress').removeAttribute('disabled');
    document.getElementById('btnupdate').removeAttribute('disabled');

}

var email = $('#resInp').val()

$('#reset').click(function () {
    $.ajax({
        type: "POST",
        url: "/forgot",
        data: email,
        success: function (response) {
            $('#alert').show()
        }
    });
})


