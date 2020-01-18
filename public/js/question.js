var gameId = 1;
var quesId = 1;
// var url = "/getques/?id=" + gameId + "&ques=" + quesId;
var questNo, questDiv, optionsDiv = [];
var ans;
var flag = false;
var data = [];
var score = 0;

$('document').ready(function() {
    endCard = $('#resultcenter');
    gameDiv = $('#gamecenter')
    questNo = $('#questno');
    questDiv = $('#quesDiv');
    optionsDiv.push($('#option-a'));
    optionsDiv.push($('#option-b'));
    optionsDiv.push($('#option-c'));
    optionsDiv.push($('#option-d'));
    optionsDiv.forEach(function(item) {
        item.click(function() {
            if (data.player === true) {
                if (data.questions[quesId - 1].options[optionsDiv.indexOf(item)].is_answer === true) {
                    // showAnim();
                    score++;
                }
            } else data.questions[quesId - 1].options[optionsDiv.indexOf(item)].is_answer = true;
            getNext();
        });
    });
});

function getNext() {
    if (quesId < 15) {
        quesId++;
        // url = "/getques/?id=" + gameId + "&ques=" + quesId;
        setData()
    } else {
        var bp = Math.round((score / 15) * .5 * 100) / 100;

        $("<style>")
            .prop("type", "text/css")
            .html("\
            .bond-meter-loaded .semi-c {\
                transform: rotate(" + bp + "turn);\
            }")
            .appendTo("head");

        gameDiv.hide()
        endCard.fadeIn('slow', function() {
            $('.bond-container').addClass('bond-meter-loaded');
            $('#percent').text(score + '/15').fadeIn('slow');
        });
        // showBondMeter();

        if (data.player) postPlayerData();
        else postCreaterData();
    }

}


function setData() {
    questNo.text("Question " + data.questions[quesId - 1].number + ".");
    questDiv.text(data.questions[quesId - 1].question);
    for (let i = 0; i < 4; i++) {
        optionsDiv[i].text(data.questions[quesId - 1].options[i].option);
    }
}

// function fetchQuestion() {
//     $.ajax({
//         type: "GET",
//         url: url,
//         success: function(response) {
//             // console.log(response);
//             // console.log('success');
//             setData(response);
//         },
//         error: function(response) {
//             // console.log(response);
//             console.log('error');

//         }
//     });
// }

function postCreaterData() {
    $.ajax({
        type: "POST",
        url: "/getques",
        data: { gameId: gameId, data: JSON.stringify(data) },
        success: function(response) {
            // console.log(response);
            $("#uniqueLink").val(response);
            console.log('success');
        },
        error: function(response) {
            // console.log(response);
            console.log('error');
        }
    });
}

function postPlayerData() {
    $.ajax({
        type: "POST",
        url: "/result",
        data: { gameId: gameId, token: data.token, score: score },
        success: function(response) {
            // console.log(response);
            // $("#uniqueLink").val(response);
            console.log('success');
        },
        error: function(response) {
            // console.log(response);
            console.log('error');
        }
    });
}

function fetchData() {
    if (data.length > 0) setData();
    else {
        $.ajax({
            type: "POST",
            url: "/getques",
            data: { gameId: gameId },
            success: function(response) {
                console.log(response);
                // console.log('success');
                data = response;
                setData();
            },
            error: function(response) {
                // console.log(response);
                console.log('error');
            }
        });
    }
}

fetchData();