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

    // Initialize FirebaseDatabase
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
                        if (data.val().name) {
                            p1name = data.val().name;
                        } else {
                            p1name = ''
                        };
                        if (data.val().choice) {
                            p1choice = data.val().choice;
                        } else {
                            p1choice = ''
                        };
                        if (data.key) {
                            p1id = data.key;
                        } else {
                            p1id = ''
                        };
                        break;

                    case 2:
                        if (data.val().name) {
                            p2name = data.val().name;
                        } else {
                            p2name = ''
                        };
                        if (data.val().choice) {
                            p2choice = data.val().choice;
                        } else {
                            p2choice = ''
                        };
                        if (data.key) {
                            p2id = data.key;
                        } else {
                            p2id = ''
                        };
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
            // This shows for players only
            $("#userSection").hide();
            $("#gameSection").show();
            $("#viewerSection").hide();

            // Print choice on browser
            $("#selection").html("<br><h1>" + player.choice + "</h1><br>");

            if (player.choice && oponent.choice) {

                console.log("Who wins: " + whoWin(player.choice, oponent.choice));

                switch (whoWin(player.choice, oponent.choice)) {
                    case "p1name":
                        console.log("you win!");
                        $("#selection").append("You win")
                        break;

                    case "p2name":
                        console.log("you lose!");
                        $("#selection").append("You lose")
                        break;

                    default:
                        console.log("TIE");
                        $("#selection").append("Tie!")
                        break;
                }

                setTimeout(() => {
                    $('#selection').append('<button type="button" id="playAgain" class="btn btn-primary">PLAY AGAIN</button>')
                    choiceDone = false;
                    player.choice = '';
                }, 3000);
            };

        } else if (players < 2) {
            // This shows for viewers when there is at least on spot to play
            $("#userSection").show();
            $("#gameSection").hide();
            $("#viewerSection").hide();


        } else {
            // This shows for viewers only
            $("#userSection").hide();
            $("#gameSection").hide();
            $("#viewerSection").show();

            $("#viewerSection").html("<h3>" + p1name + " VS " + p2name + "</h3>");

            if (p1choice) {
                $("#viewerSection").append(p1name + " chice: " + p1choice + "<br>")
            };
            if (p2choice) {
                $("#viewerSection").append(p2name + " chice: " + p2choice + "<br>")
            };

            if (p1choice && p2choice) {
                $("#viewerSection").append(eval(whoWin(p1choice, p2choice)) + " WINS")
            };
        }

        $("#connected-viewers").text(viewers);
        $("#connected-players").text(players);

    }

    // The player makes a choice
    $(".choice").on("click", function () {

        // No backsies! Only can choice once 
        if (choiceDone) {
            return;
        }

        // Hide option buttons
        $(".choice").hide();

        // Choise made... can't change it
        choiceDone = true;

        // Save the player's choice
        player.choice = this.id;

        // Log player's choice
        //console.log(player.choice);

        // Update the player choice to the connection tree
        connectionsRef.child(userId).update({
            "choice": player.choice
        });

        // Re-draw screen
        updateScreen();
    })

    //When a connection is made this is run
    connectedRef.on("value", function (snap) {

        // If they are connected..
        if (snap.val()) {

            // Add user to the connections list.
            var con = connectionsRef.push(true);

            // Get the KeyID of the connection
            userId = con.getKey();

            // Log the KeyID of the connection
            console.log('Connected as: ' + userId);

            // Add the mode value to the conenction
            connectionsRef.child(userId).set({
                "mode": "viewer"
            });

            // Remove user from the connection list when they disconnect.
            con.onDisconnect().remove();
        }

    });

    // Send the choices of the players
    function whoWin(p1, p2) {

        // console.log("Calculating winers");
        // console.log("Choice 1: " + p1);
        // console.log("Choice 2: " + p2);

        // Probing the choices
        if ((p1 === "rock") || (p1 === "paper") || (p1 === "scissors")) {

            if ((p1 === "rock" && p2 === "scissors") ||
                (p1 === "scissors" && p2 === "paper") ||
                (p1 === "paper" && p2 === "rock")) {
                //Player 1 WINS;
                // console.log("WINNER: P1");
                return "p1name";

            } else if (p1 === p2) {
                // It's a tie;
                // console.log("its a tie");
                return "tie";

            } else {
                //Player 2 WINS;
                // console.log("WINNER: P2");
                return "p2name";

            }
        }
    }

    // When the two players make their choice their choices are probed
    playerInfo.on("value", function (snap) {

        // Only if both choices are TRUE (not empty)
        if (snap.val().p1choice && snap.val().p2choice) {
            whoWin(snap.val().p1choice, snap.val().p2choice);
        }
    });

    // When someone connects or disconnects this is triggered
    connectionsRef.on('value', function (snap) {

        // Viewers ara as many connections we have
        viewers = parseInt(snap.numChildren());

        // Update the number of viewers in the database
        gameStats.update({
            "viewers": viewers
        });

        // Look for VIEWERS with 'player' mode
        checkFor('player');

        // Re-draw screen
        updateScreen();
    })

    // Updating the number of players from the database
    gameStats.on('value', function (snap) {

        // Update the number of players in the browser
        players = snap.val().players;

        // Re-draw screen
        updateScreen();
    })

    $("#buttonView").on("click", function (e) {
        e.preventDefault();

        console.log("VIEW")
    })


    // The viewer clicks to PLAY... turning it into PLAYER
    $("#buttonPlay").on("click", function (e) {
        e.preventDefault();

        // Escaping if no name was given
        if (!$("#player-name").val().trim()) {
            alert('Please enter a valid name and clik PLAY');
            return;
        }

        // Set the player name locally
        player.name = $("#player-name").val().trim();

        // Clear the input box
        $("#player-name").val("");

        //Log the player name
        //console.log('Lets play ' + player.name);

        // Get into play mode
        playerMode = true;

        // Clears the choice flag
        choiceDone = false;

        // Changes the VIEWER into PLAYER + adding set name
        connectionsRef.child(userId).update({
            "mode": "player",
            "name": player.name
        });

    });

    // The PLAYER wants to play a subsecuent game
    $("#selection").on("click", "#playAgain", function (e) {
        e.preventDefault();

        console.log("REPLAY!!")

        // Clears the choice flag
        choiceDone = false;

        // Show option buttons
        $(".choice").show();

        // Re-draw screen
        updateScreen();
    })

    // PLayer decides to stop playing
    $("#quit").on("click", function () {

        // Increase the number of players
        players--;

        // Out of game mode
        playerMode = false;

        // Show option buttons
        $(".choice").show();

        // Update the number of players in the database
        gameStats.update({
            "players": players
        });

        // Changes the PLAYER back to VIEWER
        connectionsRef.child(userId).set({
            "mode": "viewer"
        });

    })





});