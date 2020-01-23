var data = []
fetchData()


function fetchData() {
    if (data.length > 0) setData();
    else {
        $.ajax({
            type: "POST",
            url: "/getgames",
            success: function(response) {
                
                // setTimeout(() => {
                //     $('#spinner').hide('slow');
                // }, 3000);
                data = response;
                // console.log(data)
                setData();
                
                
            },
            error: function(response) {
                // console.log(response);
                console.log('error');
            }
        });
    }
}

function setData() { 
    $('document').ready(function () {
         var gameId = parseInt($('#game_id').val())
         $('#GameName').text(data[gameId - 1].name)
         $('#GameInfo').text(data[gameId - 1].info)
         $('#Rules').text(data[gameId - 1].rules)
     })
 }