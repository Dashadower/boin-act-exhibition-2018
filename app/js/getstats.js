// prerequisites: JQuery
var networkHandler = {
    gamenumber: 0,
    other_player_state: null,
    state : "connecting",
    starttime: 0,
    endtime: 0,
    notifications: [],
    mode: null,
    wave : null
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
                    networkHandler.mode = data.mode;
                    networkHandler.wave = data.wave;
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
            {username: _username, score: _score, timestamp: Math.round(new Date().getTime() / 1000)},
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
                    networkHandler.mode = data.mode;
                    networkHandler.wave = data.wave;
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

function set_cookie(){
    if(networkHandler.state === "progress" || networkHandler.state === "starting") {
        var strtime = new Date(networkHandler.endtime).toUTCString();
        document.cookie="username="+username+"; expires="+strtime+";"
    }
}

var fetch_flag = 1;
var submitting_username = undefined;
var submitting_score = undefined;

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

        if (document.location.href.includes("game")) {
                if (item["username"] === username) {
                    var row = '<tr style="background: yellow;">'
                }
                else {
                    var row = '<tr>'
                }
            }
            else {
                var row = '<tr>'
        }
        row += '<td>' + count + '</td>';
        $.each(fields, function (index, field) {
            row += '<td>' + item[field + ''] + '</td>';

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

    }
    else if(networkHandler.state == "progress"){
        document.getElementById("state").innerText = "게임상태: 게임 진행중";

    }
    else if(networkHandler.state == "finished"){
        document.getElementById("state").innerText = "게임상태: 게임 완료 - 다음게임 시작 대기중";
    }
    else if (networkHandler.state == "error"){
        document.getElementById("state").innerText = "게임상태: 오류 - 게임정보를 불러오지 못했습니다.";
    }
    else if (networkHandler.state == "connecting"){
        document.getElementById("state").innerText = "게임상태: 연결중...";
    }
    
    if(networkHandler.mode === "vanilla"){
        document.getElementById("mode").innerText = "게임모드: 일반";
        document.getElementById("instructions").innerText = "클래식 피아노 타일 - 기간 내에 가장 높은 점수를 득점하세요."
    }
    else if(networkHandler.mode === "sudden"){
        document.getElementById("mode").innerText = "게임모드: 서든데스";
        document.getElementById("instructions").innerText = "서든데스 피아노 타일 - 기간 내에 가장 높은 점수를 득점하세요. 단, 게임은 한번만 플레이 가능힙니다."
    }
    else if(networkHandler.mode === "bomb"){
        document.getElementById("mode").innerText = "게임모드: 폭탄 피하기";
        document.getElementById("instructions").innerText = "폭탄 피아노 타일 - 기간 내에 가장 높은 점수를 득점하세요. 단, 빨간색 타일을 누를 경우 게임이 종료됩니다."
    }
    if(networkHandler.wave === "true"){
        document.getElementById("mode").innerText = document.getElementById("mode").innerText + " (웨이브)"
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