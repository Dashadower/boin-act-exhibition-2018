// prerequisites: JQuery
var networkHandler = {
    gamenumber: 0,
    other_player_state: null,
    state : "starting",
    starttime: 0,
    endtime: 0
};

function fetchStats(_username, _score) {
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
        )/*.always(
            function () {
                setTimeout(fetchStats, 2000);
            }
        )*/
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
        )/*.always(
            function () {
                setTimeout(fetchStats, 2000);
            }
        )*/
    }
}


function updateData(tableId) {
    //$('#' + tableId).empty(); //not really necessary
    var fields = ["username", "score"];
    data = networkHandler.other_player_state;
    //console.log("updateScoreBoard called", data);
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

    document.getElementById("gamenumber").innerText = "현재 게임회차: "+networkHandler.gamenumber;
    if(networkHandler.state == "starting"){
         document.getElementById("state").innerText = "게임상태: 게임 시작중";
    }
    else if(networkHandler.state == "progress"){
        document.getElementById("state").innerText = "게임상태: 게임 진행중";
    }
    else if(networkHandler.state == "finished"){
        document.getElementById("state").innerText = "게임상태: 게임 완료 - 다음게임 시작 대기중";
    }
    d = new Date();
    epoch = Math.round(d.getTime() /1000);
    timedelta = networkHandler.endtime-epoch;
    seconds = timedelta % 60;
    minutes = (timedelta-seconds) / 60;
    document.getElementById("timeleft").innerText = "남은시간: "+Math.max(minutes, 0)+":"+Math.max(seconds, 0);
}


$(window).on("load",function () {
    console.log("           _____ _______ \n" +
        "     /\\   / ____|__   __|\n" +
        "    /  \\ | |       | |   \n" +
        "   / /\\ \\| |       | |   \n" +
        "  / ____ \\ |____   | |   \n" +
        " /_/    \\_\\_____|  |_|");
    console.log("Boin High School ACT Programming Group - Kim Shin Young - November 2018");
    console.log("보인고등학고 ACT 프로그래밍 동아리 - 김신영 - 2018년 11월");
});