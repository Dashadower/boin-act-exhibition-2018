# -*- coding: utf-8 -*-
# Copyright 2018 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Documentation
# https://googleapis.github.io/google-cloud-python/latest/datastore/index.html
# https://cloud.google.com/datastore/docs/concepts/entities

# [START gae_python37_app]
from google.cloud import datastore
from flask import Flask, render_template, request, redirect, render_template_string
import json, time, requests, random, hmac, logging
from hashlib import sha256

# If `entrypoint` is not defined in app.yaml, App Engine will look for an app
# called `app` in `main.py`.
app = Flask(__name__)

datastore_client = datastore.Client()

GAME_DURATION = 600
SUDDEN_GAME_DURATION = 300
MIN_PLAYERS = 5

SMS_APIKEY = "NCSBFEG948372ZA2"
SMS_SECRET = "FYQERNY6A3VRHZWJGQUYMG4ZU6OBXHGD"
salt = "fucksalt"


sms_addr = "https://api.coolsms.co.kr/sms/1.5/send"

@app.route('/')
def index():
    return render_template("index.html")

@app.route("/game", methods=["post", "get"])
def game():
    if not request.values.get("username") or not request.values.get("phone_number"):
        return redirect("../")
    if not request.values.get("phone_number").isdigit():
        return render_template_string('''
                <html>
                <body>
                <script type="text/javascript">
                alert("잘못된 전화번호 형식입니다(숫자만 입력하세요)");
                window.location = "../";
                </script>
                </body>
                </html>
                ''')
    username = request.values.get("username")
    phone_number = request.values.get("phone_number")
    query = datastore_client.query(kind="User")
    query.add_filter("username", "=", username.encode())
    query.keys_only()
    results = list(query.fetch())
    if results:
        return render_template_string('''
        <html>
        <body>
        <script type="text/javascript">
        alert("이미 해당 아이디가 현재 회차에 존재합니다");
        window.location = "../";
        </script>
        </body>
        </html>
        ''')
    else:
        task = datastore.Entity(datastore_client.key("User"))
        task.update({
            "username": username,
            "score": 0,
            "phone_number": phone_number
        })
        datastore_client.put(task)
        return render_template("game.html", username=username)

@app.route("/gameinfo", methods=["get"])
def gameinfo():
    game_query = datastore_client.query(kind="Game", order=["-starttime"])
    games_result = list(game_query.fetch(limit=2))

    gamedata = {}

    if not games_result: # Need to make a game
        dt = {
            "game_number": "error", # number of game, increments
            "other_player_state": [],
            "state": "error",
            "players": 0,
            "starttime":  0 ,
            "endtime": 0,
            "final_players": 0
        }
        notifications = []
        query = datastore_client.query(kind="Notification")
        notification_results = list(query.fetch())
        for alert in notification_results:
            notifications.append({"data": alert["data"]})
        dt["notifications"] = notifications
        return json.dumps(dt)

    elif games_result and games_result[0]["state"] == "starting":
        player_count = games_result[0]["players"] + 1
        games_result[0]["players"] = player_count
        if player_count >= MIN_PLAYERS:
            games_result[0]["state"] = "progress"
        datastore_client.put(games_result[0])
        gamedata = games_result[0]

    elif games_result and games_result[0]["state"] == "progress":
        if request.values.get("score"):
            if not request.values.get("timestamp"):
                return render_template_string(
                    "Rejecting request: Request attempted without parameters, seems to be sent out of client")
            if int(request.values.get("timestamp")) >= time.time() + 5 or int(request.values.get("timestamp")) <= time.time() - 5:
                return render_template_string(
                    "Rejecting request: Request attempted without parameters, seems to be sent out of client")
            find_user = datastore_client.query(kind="User")
            find_user.add_filter("username", "=", request.values.get("username").encode())
            find_user_results = list(find_user.fetch())
            if find_user_results:
                if int(request.values.get("score")) > find_user_results[0]["score"]:
                    find_user_results[0]["score"] = int(request.values.get("score"))
                    datastore_client.put(find_user_results[0])
            else:
                task = datastore.Entity(datastore_client.key("User"))
                task.update({
                    "username": request.values.get("username"),
                    "score": int(request.values.get("score"))
                })
                datastore_client.put(task)
        gamedata = games_result[0]

    elif games_result and games_result[0]["state"] == "finished":
        gamedata = games_result[0]
        gamedata["hash"] = games_result[0]["hash"]

    notifications = []
    query = datastore_client.query(kind="Notification")
    notification_results = list(query.fetch())
    for alert in notification_results:
        notifications.append({"data": alert["data"]})
    gamedata["notifications"] = notifications

    query = datastore_client.query(kind="User", order=["-score"])
    user_results = list(query.fetch())
    user_scores = []
    if user_results:
        for user in user_results:
            user_scores.append({"username": user["username"], "score": user["score"]})
        gamedata["numbawan"] = user_results[0]["username"]
    gamedata["other_player_state"] = user_scores

    return json.dumps(gamedata)


@app.route("/creategame", methods=["get"])
def create_game():
    if not request.values.get("count"):
        repeat_times = 8
    else:
        repeat_times = 1
    for x in range(repeat_times):
        game_query = datastore_client.query(kind="Game", order=["-starttime"])
        games_result = list(game_query.fetch(limit=1))
        if not games_result or games_result[0]["state"] not in ["progress", "starting"]:
            task = datastore.Entity(datastore_client.key("Game"))
            if games_result:
                 dt = games_result[0]["gamenumber"]
            else:
                dt = 0
            gamemode = rand_gamemode()
            gamedata = {
                "starttime": int(time.time()),
                "endtime": int(time.time() + GAME_DURATION) if gamemode != "sudden" else int(time.time() + SUDDEN_GAME_DURATION),
                "players": 0,
                "state": "starting",
                "gamenumber": dt + 1,
                "mode": gamemode,
                "wave": random.choice(["true", "false", "false"]),
                "hash": sha256(str(time.time()).encode()).hexdigest()[:5]
            }
            task.update(gamedata)
            datastore_client.put(task)
            user_query = datastore_client.query(kind="User")
            user_query.keys_only()
            user_result = list([entity.key for entity in user_query.fetch()])
            datastore_client.delete_multi(user_result)
        elif games_result[0]["state"] == "progress":
            if games_result[0]["endtime"] <= time.time():
                games_result[0]["state"] = "finished"

                query = datastore_client.query(kind="User", order=["-score"])
                winner = list(query.fetch())

                if winner:
                    games_result[0]["final_players"] = len(winner)
                    try:
                        number = winner[0]["phone_number"]
                    except KeyError:
                        number = "NO_NUMBER"
                    games_result[0]["winnerdata"] = "%s - %s" % (winner[0]["username"], number)
                    ctime = str(int(time.time()))

                    windata = datastore.Entity(datastore_client.key("Winner"))
                    windata.update({"username":winner[0]["username"], "phone":number, "gamenumber":games_result[0]["gamenumber"], "hash":games_result[0]["hash"]})
                    datastore_client.put(windata)

                    text = "[ACT]%d회차 우승자입니다. 2-12반으로 오셔서 상품을 수령받으세요 (%s)"%(games_result[0]["gamenumber"], games_result[0]["hash"])
                    payload = {
                        "api_key":SMS_APIKEY,
                        "signature":  hmac.new(SMS_SECRET.encode(), (ctime+salt).encode()).hexdigest(),
                        "salt": salt,
                        "timestamp": ctime,
                        "from": "01044886398",
                        #"to" : number,
                        "to" : "01000000000", # test
                        "mode" : "test", # test
                        "text" : text
                    }
                    try:
                        requests.post(sms_addr, data=payload)
                    except:
                        logging.error("Failed to send SMS request.")
                else:
                    games_result[0]["final_players"] = 0
                datastore_client.put(games_result[0])
        time.sleep(5)
    return "", 200

def rand_gamemode():
    choices = []
    for x in range(5):
        choices.append("vanilla")

    for x in range(3):
        choices.append("sudden")

    for x in range(2):
        choices.append("bomb")

    return random.choice(choices)

if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)

# [END gae_python37_app]