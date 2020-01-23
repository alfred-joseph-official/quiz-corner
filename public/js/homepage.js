


$('document').ready(function() {

    $('#signInBtn').click(function () { 
        var data = {
            usn: $('#usn').val(),
            pwd: $('#pwd').val()
        }
        $.ajax({
            type: "POST",
            url: "/loginuser",
            data: data,
            success: function (response) {
                console.log(response)
                if(response=="loginSuccess"){
                    window.location.href = '/'
                }
                else {
                    $('#errorMsg').show()
                }
            }
        });
     })


    $('#reset').click(function() {
        $(".toast").toast("show")
    })
});

//Not found anywhere
// $('.btn-save').click(function() {
//     $(".toast").toast("show")
// });

function darkMode() {
    var element = document.body;
    element.classList.toggle("dark-mode");
} 




