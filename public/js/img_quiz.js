var gameId = 2;
var quesId = 1;
var questDiv, optionsDiv = [];
var ans;
var flag = false;
var data = [];
var score = 0;

$('document').ready(function() {
    gameId = parseInt($('#game_id').val());
    endCard = $('#resultcenter');
    gameDiv = $('#gamecenter')
        // questNo = $('#questno');
    questDiv = $('#quesDiv');
    optionsDiv.push($('#option-a'));
    optionsDiv.push($('#option-b'));
    optionsDiv.push($('#option-c'));
    optionsDiv.push($('#option-d'));

    fetchData();
    var ans = [];
    ans.push($('#opd-a'));
    ans.push($('#opd-b'));
    ans.push($('#opd-c'));
    ans.push($('#opd-d'));

    ans.forEach(function(item) {
        item.click(function() {
            if (data.questions[quesId - 1].options[ans.indexOf(item)].is_answer === true)
            // showAnim();
                score++;
            getNext();
        });
    });
});

function remBondAnim() {
    $('.bond-container').removeClass('bond-meter-loaded');
}

function getNext() {
    if (quesId < 15) {
        quesId++;
        setData()
    } else {
        showResult()
    }
}

function setData() {
    questDiv.attr('src', data.questions[quesId - 1].question);
    for (let i = 0; i < 4; i++) {
        optionsDiv[i].text(data.questions[quesId - 1].options[i].option);
    }
}

function showResult() {
    postToServer();

    let bp = Math.round((score / 15) * .5 * 100) / 100;

    $("<style>")
        .prop("type", "text/css")
        .html("\
        .bond-meter-loaded .semi-c {\
            transform: rotate(" + bp + "turn);\
        }")
        .appendTo("head");

    gameDiv.hide();
    endCard.fadeIn('slow', function() {
        $('.bond-container').addClass('bond-meter-loaded');
        $('#percent').text((score == "" ? 0 : score) + '/15').fadeIn('slow');
    });
};

function postToServer() {
    $.ajax({
        type: "POST",
        url: "/result",
        data: { gameId: gameId, score: score == "" ? 0 : score },
        success: function(response) {
            if (response.length > 0) loadRanks(response);
        },
        error: function(response) {}
    });
}

function loadRanks(ranks) {
    $('#lb_table').show();
    let tbody = $('#lb_body');
    tbody.empty();
    $('#empty_lb').remove();
    let i = 1;
    ranks.forEach(function(item) {
        tbody.append(
            $('<tr></tr>').append($('<td></td>').text(i++))
            .append($('<td></td>').text(item.usn))
            .append($('<td></td>').text(item.score))
        );
    });
}

function fetchData() {
    if (data.length > 0) {
        setData()
    } else {
        $.ajax({
            type: "POST",
            url: "/getques",
            data: { gameId: gameId },
            success: function(response) {
                setTimeout(() => {
                    $('#spinner').hide('slow');
                }, 1500);
                data = response;
                setData();
            },
            error: function(response) {}
        });
    }
}

function darkMode() {
    var element = document.body;
    element.classList.toggle("dark-mode");
}

// function restart() {
//     score = "";
//     endCard.fadeOut();
//     quesId = 0;
//     getNext()
//     $('#score').text(score);
//     gameDiv.fadeIn();
// };