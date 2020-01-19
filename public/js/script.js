function enabled() {
    document.getElementById('password').removeAttribute('disabled');
    document.getElementById('userphone').removeAttribute('disabled');
    document.getElementById('useraddress').removeAttribute('disabled');
    document.getElementById('btnupdate').removeAttribute('disabled');

}
$('document').ready(function() {
   
    $('#reset').click(function() {

        var email = $('#resInp').val();
        $.ajax({
            type: "POST",
            url: "/forgot",
            data: { 'field': email },
            success: function(response) {
                // console.log(response);
                console.log('success');

            },
            error: function(response) {
                // console.log(response);
                console.log('error');

            }
        });
    })
});

function setProfilePic()
{
        $('#profilepicid').click();
        $('#profilepicid').on('change',function()
        {
            $('#updatebtn').click();
        })   
     
}
