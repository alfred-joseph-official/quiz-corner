var gameId = 1;
var quesId = 1;
// var url = "/getques/?id=" + gameId + "&ques=" + quesId;
var questNo, questDiv, optionsDiv = [];
var ans;
var flag = false;
var data = [];

$('document').ready(function () {
    fetchData();
    resetSuccess = $('.alert');
    endCard = $('#resultcenter');
    gameDiv = $('#gamecenter')
    questNo = $('#questno');
    questDiv = $('#quesDiv');
    optionsDiv.push($('#option-a'));
    optionsDiv.push($('#option-b'));
    optionsDiv.push($('#option-c'));
    optionsDiv.push($('#option-d'));
    // optionsDiv.forEach(function (item) {
    //     item.click(function () {
    //         data.questions[quesId - 1].options[optionsDiv.indexOf(item)].is_answer = true;
    //         getNext();
    //     });

    // });
    var ans = [];
    ans.push($('#opd-a'));
    ans.push($('#opd-b'));
    ans.push($('#opd-c'));
    ans.push($('#opd-d'));
    
    ans.forEach(function (item) {
        item.click(function () {
            data.questions[quesId - 1].options[ans.indexOf(item)].is_answer = true;
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
        gameDiv.hide()
        endCard.fadeIn('slow')
        // showBondMeter();
        
        postData();
        
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

function postData() {
    $.ajax({
        type: "POST",
        url: "/getques",
        data: { gameId: gameId, data: JSON.stringify(data) },
        success: function (response) {
            // console.log(response);
            console.log('success');
        },
        error: function (response) {
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
            success: function (response) {
                console.log(response);
                // console.log('success');
                data = response;
                setData();
            },
            error: function (response) {
                // console.log(response);
                console.log('error');
            }
        });
    }
}
function setFbLink()
{
    //facebook
   var x = document.querySelectorAll('.shared')   
  
   var link =document.getElementById('uniqueLink').value;    

  var finalhref="https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2F"+ link +"%2F&amp;src=sdkpreparse" 
  x[0].href = finalhref
    //twitter
    


}
function setTwLink()
{
    var link =document.getElementById('uniqueLink').value;    
    var y = document.getElementById('twitterlink')
    y.href = "https://twitter.com/intent/tweet?text="+link
}

function copyLink(val){
    $(val).select()
    document.execCommand("copy");
}

$('#reset').click(function () {
    $(".toast").toast("show")
});

function resetPass(){
    resetSuccess.fadeIn('slow')
}
