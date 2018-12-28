// VARIABLES --------------------------------------------

//      CONSTANTS

//      ARRAYS

//      STRINGS/CHAR
var userId = ''; // User UD when connecting to database
var p1name = '';
var p1choice = '';
var p1id = '';
var p2name = '';
var p2choice = '';
var p2id = '';


//      NUMBER/INTEGER
var viewers = 0; // How many connections
var players = 0; // How many players (only 0, 1 and 2 are possible!)

//      BOOLEAN
var playerMode = false; // Current connection is playing?
var choiceDone = false;

//      OBJECTS

// Creating a "player info" object using constructor notation
function playerInfo(playerName, playerChoice) {
    this.name = playerName; // Player's name
    this.choice = playerChoice; // Player's choice
}

var player = new playerInfo('', ''); // Contains CURRENT player info
var oponent = new playerInfo('', ''); // Contains OPONENT payer info

// ------------------------------------------------------------

$(document).ready(function () {

    var config = {
        apiKey: "AIzaSyAR1BzexHwtNHQ1VZOFjqsTVipSyWvfBnc",
        authDomain: "codingbootcamp-dc35e.firebaseapp.com",
        databaseURL: "https://codingbootcamp-dc35e.firebaseio.com",
        projectId: "codingbootcamp-dc35e",
        storageBucket: "",
        messagingSenderId: "765982769333"
    };

    firebase.initializeApp(config);

    // Create references to the database
    var database = firebase.database();
    var gameStats = database.ref("/rpm_multiuser/gameStats");
    var playerInfo = database.ref("/rpm_multiuser/playerInfo");
    var connectionsRef = database.ref("/rpm_multiuser/connections");
    var connectedRef = database.ref(".info/connected");

    // ----------------------------------------------

    // Look for viewers in 'player' mode
    function checkFor(mode) {

        let modeRef = firebase.database().ref('/rpm_multiuser');

        modeRef.child('connections').orderByChild('mode').equalTo(mode).on("value", function (snapshot) {

            // Number of players are as many connections in 'player' mode
            players = parseInt(snapshot.numChildren());

            // Clear the variables based on # of players
            switch (players) {
                case 0:
                    p1name = '';
                    p1choice = '';
                    p1id = '';
                    p2name = '';
                    p2choice = '';
                    p2id = '';
                    break;

                case 1:
                    p2name = '';
                    p2choice = '';
                    p2id = '';
                    break;
            }

            // Get the id, name anc choice of players and save localy
            var i = 1;
            snapshot.forEach(function (data) {
                switch (i) {
                    case 1:
                        if (data.val().name) {p1name = data.val().name;} else {p1name = ''};
                        if (data.val().choice) {p1choice = data.val().choice;} else {p1choice = ''};
                        if (data.key) {p1id = data.key;} else { p1id = ''};
                        break;

                    case 2:
                        if (data.val().name) {p2name = data.val().name;} else { p2name = ''};
                        if (data.val().choice) {p2choice = data.val().choice;} else {p2choice = ''};
                        if (data.key) {p2id = data.key;} else {p2id = ''};
                        break;
                }

                if (data.key !== userId) {
                    oponent.name = data.val().name;
                    oponent.choice = data.val().choice;
                }

                i++;
            });

            // Update the number of players in the database
            gameStats.update({
                "players": players
            });

            // Now update these values in the database
            playerInfo.update({
                "p1name": p1name,
                "p1choice": p1choice,
                "p1id": p1id,
                "p2name": p2name,
                "p2choice": p2choice,
                "p2id": p2id
            });

        });

    }


    // ----------------------------------------------

    function updateScreen() {

        if (playerMode) {
            $("#user").hide();
            $("#game").show();
            $("#viewerStat").hide();
        } else if (players < 2) {
            $("#user").show();
            $("#game").hide();
            $("#viewerStat").hide();
        } else {
            $("#user").hide();
            $("#game").hide();
            $("#viewerStat").show();
        }

        $("#connected-viewers").text(viewers);
        $("#connected-players").text(players);
    }

    $(".choice").on("click", function () {
        if (choiceDone) {
            return;
        }
        $(".choice").addClass("disabled");
        choiceDone = true;
        player.choice = this.id;

        console.log(player.choice);

        connectionsRef.child(userId).update({
            "choice": player.choice
        });

        $("#selection").html("<h1>" + player.choice + "</h1>");

    })

    connectedRef.on("value", function (snap) {

        // If they are connected..
        if (snap.val()) {

            // Add user to the connections list.
            var con = connectionsRef.push(true);
            userId = con.getKey();

            console.log('Connected as: ' + userId);

            connectionsRef.child(userId).set({
                "mode": "viewer"
            });

            // Remove user from the connection list when they disconnect.
            con.onDisconnect().remove();
        }

        checkFor('player');

    });

    function whoWin(p1, p2) {
        console.log("Calculating winers");
        console.log("Choice 1: " + p1);
        console.log("Choice 2: " + p2);


        if ((p1 === "rock") || (p1 === "paper") || (p1 === "scissors")) {

            if ((p1 === "rock" && p2 === "scissors") ||
              (p1 === "scissors" && p2 === "paper") ||
              (p1 === "paper" && p2 === "rock")) {
            //   wins++;
            console.log("WINNER: P1");

            } else if (p1 === p2) {
            //   ties++;
            console.log("its a tie");

            } else {
            //   losses++;
            console.log("WINNER: P2");

            }

        }

    }

    playerInfo.on("value", function (snap) {

        if(snap.val().p1choice && snap.val().p2choice){
            whoWin(snap.val().p1choice, snap.val().p2choice);
        }
        
    });




    connectionsRef.on('value', function (snap) {

        viewers = parseInt(snap.numChildren());

        // Update the number of viewers in the database
        gameStats.update({
            "viewers": viewers
        });

        checkFor('player');
        updateScreen();
    })

    gameStats.on('value', function (snap) {

        // Update the number of players in the browser
        players = snap.val().players;

        updateScreen();
    })

    $("#play").on("click", function (event) {
        event.preventDefault();

        // Escaping if no name was given
        if (!$("#player-name").val().trim()) {
            alert('Please enter a valid name and clik PLAY');
            return;
        }

        player.name = $("#player-name").val().trim();
        $("#player-name").val("");

        console.log('Lets play ' + player.name);

        playerMode = true;

        connectionsRef.child(userId).update({
            "mode": "player",
            "name": player.name
        });

    });

    $("#quit").on("click", function () {
        // Increase the number of players
        players--;

        playerMode = false;

        // Update the number of players in the database
        gameStats.update({
            "players": players
        });

        connectionsRef.child(userId).set({
            "mode": "viewer"
        });

    })





});