var gameId = 1;
var quesId = 1;
// var url = "/getques/?id=" + gameId + "&ques=" + quesId;
var questNo, questDiv, optionsDiv = [];
var ans;
var flag = false;

$('document').ready(function() {
    questNo = $('#questno');
    questDiv = $('#quesDiv');
    optionsDiv.push($('#option-a'));
    optionsDiv.push($('#option-b'));
    optionsDiv.push($('#option-c'));
    optionsDiv.push($('#option-d'));
    optionsDiv.forEach(function(item) {
        item.click(function() {
            if (ans === optionsDiv.indexOf(item)) {
                flag = true;
            }
            getNext();
        });
    });
});

$('#submitAns').click(function() {

});

function getNext() {
    if (quesId < 15) {
        quesId++;
        // url = "/getques/?id=" + gameId + "&ques=" + quesId;
        fetchQuestion();
    } else {
        showBondMeter();
    }

}

function setData(data) {
    questNo.text("Question " + data.number);
    questDiv.text(data.question);
    ans = data.answer;
    // var answer = Math.floor(Math.random() * (3));
    // optionsDiv[answer].text(data.answer);
    // var j = 0;
    for (let i = 0; i < 4; i++) {
        // if (i == answer) {
        //     continue;
        // }
        // optionsDiv[i].text(data.options[j++]);
        optionsDiv[i].text(data.options[i]);
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

function fetchQuestion() {
    $.ajax({
        type: "POST",
        url: "/getques",
        data: { gameId: gameId, quesId: quesId, answer: flag },
        success: function(response) {
            // console.log(response);
            // console.log('success');
            setData(response);
        },
        error: function(response) {
            // console.log(response);
            console.log('error');
        }
    });
}

fetchQuestion();