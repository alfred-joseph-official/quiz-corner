function generateNew() {
    alert("1");
    var uuidip = $("#uuid-ip");
    var qUrl = "/shortid/?flag=1"
    $.ajax({
        type: "GET",
        url: qUrl,
        success: function(response) {
            uuidip.text(response);
            alert('2');
        },
        error: function(request, status, error) {
            console.log(request.responseText);
        }
    });
}

$(this).ready(function() {
    alert('3');
    $("#gen-btn").click(function() {
        alert("clicked");
        generateNew();
    });
});