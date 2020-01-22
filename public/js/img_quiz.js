var gameId = 2;
var quesId = 1;
// var url = "/getques/?id=" + gameId + "&ques=" + quesId;
var questDiv, optionsDiv = [];
var ans;
var flag = false;
var data = [];
var score = 0;
var fbShare1 = "https://www.facebook.com/sharer/sharer.php?u=",
    fbShare2 = "%2F&amp;src=sdkpreparse",
    twitterShare = "https://twitter.com/intent/tweet?text=";

$('document').ready(function() {
    gameId = parseInt($('#game_id').val());
    resetSuccess = $('.alert');
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


function getNext() {
    if (quesId < 15) {
        quesId++;
        // url = "/getques/?id=" + gameId + "&ques=" + quesId;
        setData()
    } else {
        //IMPORTANT DONT DELETE! BOND METER CODE!
        var bp = Math.round((score / 15) * .5 * 100) / 100;

        $("<style>")
            .prop("type", "text/css")
            .html("\
            .bond-meter-loaded .semi-c {\
                transform: rotate(" + bp + "turn);\
            }")
            .appendTo("head");

        gameDiv.hide();
        endCard.fadeIn('slow', function() {
            // //IMPORTANT DONT DELETE! BOND METER CODE!
            $('.bond-container').addClass('bond-meter-loaded');
            $('#percent').text(score + '/15').fadeIn('slow');
        });
        // $('.bond-meter-show').each(function(item) {
        //         item.click(function() {

        //         })
        //     })
        // showBondMeter();

        postPlayerData();
    }

}

function remBondAnim() {
    $('.bond-container').removeClass('bond-meter-loaded');
}


function setData() {
    // questNo.text("Question " + data.questions[quesId - 1].number + ".");

    questDiv.attr('src', data.questions[quesId - 1].question);
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

function postPlayerData() {
    $.ajax({
        type: "POST",
        url: "/img_quiz",
        data: { gameId: gameId, score: score },
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
                setTimeout(() => {
                    $('#spinner').hide('slow');
                }, 3000);
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

$('#reset').click(function() {
    $(".toast").toast("show")
});

function resetPass() {
    resetSuccess.fadeIn('slow')
}

function darkMode() {
    var element = document.body;
    element.classList.toggle("dark-mode");
}