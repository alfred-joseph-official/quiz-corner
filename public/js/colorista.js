var gameId = 4;
var quesId = 1;
// var url = "/getques/?id=" + gameId + "&ques=" + quesId;
var questDiv, optionsDiv = [];
var ans;
// var data = [];
var score = 0;
const cpool = ["Yellow", "Red", "Purple", "Blue", "Green", "Black", "Orange"];

var wordList = [];

function getRandom(n) {
    return Math.floor((Math.random() * n));
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
        // swap elements arr[i] and arr[j]
        // "destructuring assignment" same as
        // let t = arr[i]; arr[i] = arr[j]; arr[j] = t
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function mixMatch(arr) {
    let arr1 = shuffle(arr.concat());
    let arr2 = shuffle(arr.concat());

    let optionsArr = [];
    for (let i = 0; i < 4; i++) {
        let obj = {}
        obj['word'] = arr1[i];
        obj['color'] = arr2[i];
        obj['is_answer'] = false;
        optionsArr.push(obj)
    }
    let clr;
    let rand = getRandom(4);
    if (Math.ceil((Math.random() * 2)) == 1) {
        ques = "Word";
        clr = optionsArr[rand].word;
    } else {
        ques = "Color";
        clr = optionsArr[rand].color;
    }

    optionsArr[rand].is_answer = true;
    return {
        arr: optionsArr,
        clr: clr
    };
}

function generateQuestion() {
    let x = 0;
    while (x < 4) {
        let rIndex = getRandom(7);
        let opClr = cpool[rIndex];
        if (wordList.includes(opClr)) {
            continue;
        }
        wordList.push(opClr);
        x++;
    }

    let options = mixMatch(wordList);
    wordList = [];

    return {
        ques: ques,
        options: options.arr,
        color: options.clr
    }
}

question = generateQuestion();
// console.log(question);


function setData() {
    // questNo.text("Question " + quesId + ".");
    questDiv.text("Select the " + question.ques + " " + question.color + ".");
    for (let i = 0; i < 4; i++) {
        optionsDiv[i].text(question.options[i].word);
        optionsDiv[i].css({
            'color': question.options[i].color
                // 'textShadow': 'black 0px 0px 15px'
        });
    }
}

$('document').ready(function() {
    gameId = parseInt($('#game_id').val());
    resetSuccess = $('.alert');
    endCard = $('#resultcenter');
    gameDiv = $('#gamecenter');
    resetBtn = $('#reset_btn');
    // questNo = $('#questno');
    questDiv = $('#quesDiv');
    optionsDiv.push($('#option-a'));
    optionsDiv.push($('#option-b'));
    optionsDiv.push($('#option-c'));
    optionsDiv.push($('#option-d'));
    setData();
    var ans = [];
    ans.push($('#opd-a'));
    ans.push($('#opd-b'));
    ans.push($('#opd-c'));
    ans.push($('#opd-d'));
    ans.forEach(function(item) {
        item.click(function() {
            if (question.options[ans.indexOf(item)].is_answer === true) {
                // showAnim();
                score++;
                getNext();
            } else {
                showResult();
            }
        });
    });
    setTimeout(() => {
        $('#spinner').hide('slow');
    }, 1500);
});

function getNext() {
    if (quesId < 15) {
        quesId++;
        question = generateQuestion();
        setData();
    } else {
        showResult();
        // postPlayerData();
    }
}

function showResult() {
    postToServer();
    gameDiv.hide();
    endCard.fadeIn('slow', function() {
        $('#score').text(score == "" ? 0 : score);
    });
};

function postToServer() {
    $.ajax({
        type: "POST",
        url: "/result",
        data: { gameId: gameId, score: score == "" ? 0 : score },
        success: function(response) {
            // console.log(response);
            if (response.length > 0) loadRanks(response);
            console.log('success');
        },
        error: function(response) {
            console.log('error');
        }
    });
}

function loadRanks(ranks) {
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

function restart() {
    score = "";
    endCard.fadeOut();
    quesId = 0;
    getNext()
    $('#score').text(score);
    gameDiv.fadeIn();
};