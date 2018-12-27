// VARIABLES --------------------------------------------

//      CONSTANTS

//      ARRAYS

//      STRINGS/CHAR
var userId = ''; // User UD when connecting to database

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

    // Create a variable to reference the database.
    var database = firebase.database();

    var gameStats = database.ref("/rpm_multiuser/gameStats");

    // All connections will be stored in this directory.
    var connectionsRef = database.ref("/rpm_multiuser/connections");

    var connectedRef = database.ref(".info/connected");

    function updateScreen() {

        if (playerMode) {
            $("#user").hide();
            $("#game").show();
            $("#viewerStat").hide();
        } else if(players < 2) {
            $("#user").show();
            $("#game").hide();
            $("#viewerStat").hide();
        }else{
            $("#user").hide();
            $("#game").hide();
            $("#viewerStat").show();
        }

        $("#connected-viewers").text(viewers);
        $("#connected-players").text(players);
    }

    $(".choice").on("click", function () {
        if(choiceDone){
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
    });

    connectionsRef.on('value', function (snap) {

        viewers = parseInt(snap.numChildren());

        // Someone has connected!
        //console.log("Viewers: " + viewers);

        // Update the number of viewers in the database
        gameStats.update({
            "viewers": viewers
        });

        updateScreen();
    })

    gameStats.on('value', function (snap) {

        // Update the number of players in the browser
        players = snap.val().players;

        updateScreen();
    })

    $("#play-bid").on("click", function (event) {
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

        // Increase the number of players
        players++;

        // Update the number of players in the database
        gameStats.update({
            "players": players
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