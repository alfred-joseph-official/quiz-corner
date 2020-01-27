var gameData = []
getGamesList()


function getGamesList() {
    if (gameData.length > 0) setGameInfo();
    else {
        $.ajax({
            type: "POST",
            url: "/getgames",
            success: function(response) {

                // setTimeout(() => {
                //     $('#spinner').hide('slow');
                // }, 3000);
                gameData = response;
                // console.log(gameData)
                setGameInfo();


            },
            error: function(response) {
                // console.log(response);
                console.log('error');
            }
        });
    }
}

function setGameInfo() {
    $('document').ready(function() {
        var gameId = parseInt($('#game_id').val())
        $('#GameName').text(gameData[gameId - 1].name)
        $('#GameInfo').text(gameData[gameId - 1].info)
        $('#Rules').text(gameData[gameId - 1].rules)
    })
}