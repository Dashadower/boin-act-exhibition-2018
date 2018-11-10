// prerequisites: JQuery
var networkHandler = {
    gamenumber: 0,
    other_player_state: null,
    state : "starting",
    starttime: 0,
    endtime: 0
};

function updateStats(_username, _score) {
    if(_username==undefined){
        $.getJSON(
            url="../gameinfo",
            success=function(data, status, xhr){
                if(data.state == "starting"){
                    networkHandler.game_state = data.state
                }
                else {
                    networkHandler.gamenumber = data.gamenumber;
                    networkHandler.other_player_state = data.other_player_state;
                    networkHandler.state = data.state;
                    networkHandler.starttime = data.starttime;
                    networkHandler.endtime = data.endtime;
                    //document.getElementById("game_number").innerText = data.game_number;
                    //console.log("update()", data);
                }
            }
        ).always(
            function () {
                setTimeout(updateStats, 2000);
            }
        )
    }
    else{
        $.getJSON(
            url="../gameinfo",
            {username: _username, score: _score},
            success=function(data, status, xhr){
                if(data.state == "starting"){
                    networkHandler.game_state = data.state
                }
                else {
                    networkHandler.gamenumber = data.gamenumber;
                    networkHandler.other_player_state = data.other_player_state;
                    networkHandler.state = data.state;
                    networkHandler.starttime = data.starttime;
                    networkHandler.endtime = data.endtime;
                    //document.getElementById("game_number").innerText = data.game_number;
                    //console.log("update()", data);
                }
            }
        ).always(
            function () {
                setTimeout(updateStats, 2000);
            }
        )
    }
}


function updateScoreBoard(tableId) {
    //$('#' + tableId).empty(); //not really necessary
    var fields = ["username", "score"];
    data = networkHandler.other_player_state;
    console.log("updateScoreBoard called", data);
    var rows = '';
    rows += "<tr><th>순위</th><th>아이디</th><th>점수</th></tr>";
    var count = 1;
    $.each(data, function(index, item) {
        var row = '<tr>';
        row += '<td>'+count+'</td>';
        $.each(fields, function(index, field) {
            row += '<td>' + item[field+''] + '</td>';
        });
        rows += row + '<tr>';
        count += 1;
    });
    $('#' + tableId).html(rows);

    document.getElementById("gamenumber").innerText = "현재 게임회차: "+data.gamenumber
    if(data.state == "starting"){
         document.getElementById("state").innerText = "게임상태: 게임 시작중"
    }
    else if(data.state == "progress"){
        document.getElementById("state").innerText = "게임상태: 게임 진행중"
    }
    else if(data.state == "finished"){
        document.getElementById("state").innerText = "게임상태: 게임 완료 - 다음게임 시작 대기중"
    }
    d = Date()
    minutes = d.

}


$(document).ready(function () {
    console.log("           _____ _______ \n" +
        "     /\\   / ____|__   __|\n" +
        "    /  \\ | |       | |   \n" +
        "   / /\\ \\| |       | |   \n" +
        "  / ____ \\ |____   | |   \n" +
        " /_/    \\_\\_____|  |_|")
    console.log("Boin High School ACT Programming Group - Kim Shin Young - November 2018");
    console.log("보인고등학고 ACT 프로그래밍 동아리 - 김신영 - 2018년 11월");
    console.log("Update check!");
    //console.log("setInterval handle:",setInterval(networkHandler.update, 2000));
    updateStats();
    updateScoreBoard("scoreboard");
    setInterval(function(){updateScoreBoard("scoreboard");}, 1000);

});