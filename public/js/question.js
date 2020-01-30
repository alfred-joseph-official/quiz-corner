var gameId = 1;
var quesId = 1;
// var url = "/getques/?id=" + gameId + "&ques=" + quesId;
var questNo, questDiv, optionsDiv = [];
var ans;
var flag = false;
var data = [];
var score = 0;
var fbShare1 = "https://www.facebook.com/sharer/sharer.php?u=",
    fbShare2 = "%2F&amp;src=sdkpreparse",
    twitterShare = "https://twitter.com/intent/tweet?text=";

$('document').ready(function() {
    gameId = parseInt($('#game_id').val());
    endCard = $('#resultcenter');
    gameDiv = $('#gamecenter')
    questNo = $('#questno');
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
            if (data.player === true) {
                if (data.questions[quesId - 1].options[ans.indexOf(item)].is_answer === true) {
                    // showAnim();
                    score++;
                }
            } else data.questions[quesId - 1].options[ans.indexOf(item)].is_answer = true;
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
        showResult()
    }
}

function showResult() {
    if (data.player) {
        postPlayerData();
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
            // $('#percent').text(score + '/15').fadeIn('slow');
            if (score <= 3) {
                $('#resultinfo').text(' Poor!').css('color', ' red')
            }
            if (score > 3) {
                $('.semi-c').addClass('averageScore')
                    // $('#resultinfo').text(' Average!').css('color',' (245, 123, 9)')
                $('#resultinfo').text(' Average!').css('color', ' orange')
            }

            if (score > 7) {
                $('.semi-c').addClass('goodScore')
                $('#resultinfo').text(' Good!').css('color', 'yellow;')
            }

            if (score > 11) {
                $('.semi-c').addClass('greatScore')
                $('#resultinfo').text(' Great!').css('color', 'green')
            }
        });
    } else {
        postCreaterData();
        gameDiv.hide();
        endCard.fadeIn('slow');
    }
    // postToServer();

};


function remBondAnim() {
    $('.bond-container').removeClass('bond-meter-loaded');
}


function setData() {
    questNo.text("Question " + data.questions[quesId - 1].number + ".");
    questDiv.text(data.questions[quesId - 1].question);
    for (let i = 0; i < 4; i++) {
        optionsDiv[i].text(data.questions[quesId - 1].options[i].option);
    }

}

function postCreaterData() {
    $.ajax({
        type: "POST",
        url: "/bond_post",
        data: { gameId: gameId, data: JSON.stringify(data) },
        success: function(response) {
            $("#uniqueLink").val(response);

            // $('#fbs').attr('href', fbShare1 + response + fbShare2);
            // $('#tws').attr('href', encodeURIComponent(twitterShare + response));
        },
        error: function(response) {}
    });
}

function postPlayerData() {
    $.ajax({
        type: "POST",
        url: "/result",
        data: { gameId: gameId, token: data.token, score: score, player: data.player },
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
    if (data.length > 0) setData();
    else {
        let url = "/bond_get"
        $.ajax({
            type: "POST",
            url: url,
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

function setFbLink() {
    //facebook
    var x = document.querySelectorAll('.shared')

    var link = document.getElementById('uniqueLink').value;
    var finallink = encodeURIComponent(link);

    var finalhref = "https://www.facebook.com/sharer/sharer.php?u=" + finallink + "&amp;src=sdkpreparse";
    x[0].href = finalhref
}

function setTwLink() {
    var link = encodeURIComponent(document.getElementById('uniqueLink').value);
    var y = document.getElementById('twitterlink')
    y.href = "https://twitter.com/intent/tweet?text=" + link;
}

function copyLink(val) {
    $(val).select()
    document.execCommand("copy");
}

function darkMode() {
    var element = document.body;
    element.classList.toggle("dark-mode");
}