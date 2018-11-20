// prerequisites: JQuery
var networkHandler = {
    gamenumber: 0,
    other_player_state: null,
    state : "connecting",
    starttime: 0,
    endtime: 0,
    notifications: [],
};

function fetchStats(_username, _score) {
    if(_username==undefined){
        $.getJSON(
            url="../gameinfo",
            success=function(data, status, xhr){
                if(data.state == "starting"){
                    networkHandler.game_state = data.state;
                    networkHandler.notifications = data.notifications;
                }
                else {
                    networkHandler.gamenumber = data.gamenumber;
                    networkHandler.other_player_state = data.other_player_state;
                    networkHandler.state = data.state;
                    networkHandler.starttime = data.starttime;
                    networkHandler.endtime = data.endtime;
                    networkHandler.notifications = data.notifications;
                    networkHandler.numbawan = data.numbawan;
                    networkHandler.hash = data.hash;
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
                    networkHandler.game_state = data.state;
                    networkHandler.notifications = data.notifications;
                }
                else {
                    networkHandler.gamenumber = data.gamenumber;
                    networkHandler.other_player_state = data.other_player_state;
                    networkHandler.state = data.state;
                    networkHandler.starttime = data.starttime;
                    networkHandler.endtime = data.endtime;
                    networkHandler.notifications = data.notifications;
                    networkHandler.numbawan = data.numbawan;
                    networkHandler.hash = data.hash;
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


var fetch_flag = 1;
var submitting_username = undefined;
var submitting_score = undefined;
var awarded = false;
function updateData(tableId, notification_tableId) {
    if(fetch_flag===2){
        fetchStats(submitting_username, submitting_score);
        fetch_flag = 1;
    }
    else{
        fetch_flag = fetch_flag + 1;
    }
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
        rows += row + '</tr>';
        count += 1;
    });
    $('#' + tableId).html(rows);

    fields = ["data"];
    data = networkHandler.notifications;
    //console.log("updateScoreBoard called", data);
    rows = '';
    count = 1;
    $.each(data, function(index, item) {
        var row = '<tr>';
        row += '<td>'+count+'</td>';
        $.each(fields, function(index, field) {
            row += '<td>' + item[field+''] + '</td>';
        });
        rows += row + '</tr>';
        count += 1;
    });
    $('#' + notification_tableId).html(rows);

    document.getElementById("gamenumber").innerText = "현재 게임회차: "+networkHandler.gamenumber;
    document.getElementById("numbawan").innerText = "현재 1위: "+networkHandler.numbawan;
    if(networkHandler.state == "starting"){
         document.getElementById("state").innerText = "게임상태: 게임 시작중";
         awarded = false;
    }
    else if(networkHandler.state == "progress"){
        document.getElementById("state").innerText = "게임상태: 게임 진행중";
        awarded = false;
    }
    else if(networkHandler.state == "finished"){
        document.getElementById("state").innerText = "게임상태: 게임 완료 - 다음게임 시작 대기중";
        if(networkHandler.numbawan===username && awarded === false){
            alert("축하드립니다. 현재 회차의 우승자가 되었습니다. 상품을 수령하기 위해 부스로 오셔서 회차 암호: "+ networkHandler.hash + " 를 부원에게 말씀해주세요.");
            awarded = true
        }
    }
    else if (networkHandler.state == "error"){
        document.getElementById("state").innerText = "게임상태: 오류 - 게임정보를 불러오지 못했습니다.";
    }
    else if (networkHandler.state == "connecting"){
        document.getElementById("state").innerText = "게임상태: 연결중...";
    }
    d = new Date();
    epoch = Math.round(d.getTime() /1000);
    timedelta = networkHandler.endtime-epoch;
    seconds = timedelta % 60;
    minutes = (timedelta-seconds) / 60;
    document.getElementById("timeleft").innerText = "남은시간: "+Math.max(minutes, 0)+"분 "+Math.max(seconds, 0)+"초";
}


$(window).on("load",function () {
    console.log("           _____ _______ \n" +
        "     /\\   / ____|__   __|\n" +
        "    /  \\ | |       | |   \n" +
        "   / /\\ \\| |       | |   \n" +
        "  / ____ \\ |____   | |   \n" +
        " /_/    \\_\\_____|  |_|");
    console.log("Boin High School ACT Programming Group - Kim Shin Young - November 2018 - getstats.js");
    //console.log("getstats.js");
});