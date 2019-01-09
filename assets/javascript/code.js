// TO DO:
// Update instructions
// Corfirm all code and comments are ok 

// VARIABLES --------------------------------------------

//      CONSTANTS

//      ARRAYS

//      STRINGS/CHAR
var userId = ''; // User UD when connecting to database
var mode = '';

//      NUMBER/INTEGER
var wins = 0;
var loses = 0;
var test = 0;
//      BOOLEAN
var choiceMade = false;

//      OBJECTS

// Creating a "player info" object using constructor notation
function playerInfo(playerName, playerChoice) {
    this.name = playerName; // Player's name
    this.choice = playerChoice; // Player's choice
}

var player1 = new playerInfo('', ''); // Contains CURRENT player info
var player2 = new playerInfo('', ''); // Contains CURRENT player info
var player = new playerInfo('', ''); // Contains CURRENT player info

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
    var connectionsRef = database.ref("/rpm_multiuser/");
    var connectedRef = database.ref(".info/connected");

    // ----------------------------------------------

    // When a connection is made this runs
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
                "mode": "connected"
            });

            // Remove user from the connection list when they disconnect.
            con.onDisconnect().remove();
        }

    });

    // When someone connects or disconnects this is triggered
    // also when any of the connections change its values
    connectionsRef.on('value', function (snap) {

        // Clear the local records for 'PLAYER 1' and 'PLAYER 2'
        player1 = {
            name: '',
            choice: ''
        };

        player2 = {
            name: '',
            choice: ''
        };

        // These calls will harvest the: KEY, MODE, NAME and CHOICE
        // of the connections with MODE 'PLAYER 1' and 'PLAYER 2' and
        // save them locally on its respective objects.
        checkFor('player1');
        checkFor('player2');

        // Re-draw screen
        updateScreen();
    });

    // ----------------------------------------------

    $("#welcomeSection").show();
    $("#userSection").show();
    $("#gameSection").hide();
    $("#viewerSection").hide();

    // ----------------------------------------------

    // Send the choices of the players
    function whoWin(p1, p2) {

        test++;
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
                return "player1";

            } else if (p1 === p2) {
                // It's a tie;
                // console.log("its a tie");
                return "tie";

            } else {
                //Player 2 WINS;
                // console.log("WINNER: P2");
                return "player2";

            }
        }

    }

    // Look for viewers in 'player' mode
    function checkFor(mode) {

        // console.log("looking for " + mode);

        let modeRef = firebase.database().ref('/rpm_multiuser');

        //modeRef.child('connections').orderByChild('mode').equalTo(mode).on("value", function (snapshot) {
        modeRef.orderByChild('mode').equalTo(mode).on("value", function (snapshot) {

            // Get the id, name and choice of players, then save localy
            snapshot.forEach(function (data) {

                // console.log("*******************");
                // console.log("KEY: " + data.key);
                // console.log("NAME: " + data.val().name);
                // console.log("MODE: " + data.val().mode);
                // console.log("CHOICE: " + data.val().choice);
                // console.log("*******************");

                eval(mode).name = data.val().name;
                eval(mode).choice = data.val().choice;
            });
        });
    }

    // Re-draw screen based on game variables
    function updateScreen() {

        if (mode === 'player1') { //Player is player 1
            // console.log("Player is player 1")

            $("#welcomeSection").hide();
            $("#userSection").hide();
            $("#gameSection").show();
            $("#viewerSection").hide();

            //Hide/show the elements on player bars
            $("#p1p").show();
            $("#p1v").hide();
            $("#p2p").hide();
            $("#p2v").show();

        } else if (mode === 'player2') { //Player is player 2
            // console.log("Player is player 2")

            $("#welcomeSection").hide();
            $("#userSection").hide();
            $("#gameSection").show();
            $("#viewerSection").hide();

            //Hide/show the elements on player bars
            $("#p1p").hide();
            $("#p1v").show();
            $("#p2p").show();
            $("#p2v").hide();

        } else if (mode === 'viewer') { //Player is just watching
            // console.log("Just watching")

            $("#welcomeSection").hide();
            $("#userSection").hide();
            $("#gameSection").hide();
            $("#viewerSection").show();
        }

        if (player1.name) { // If a PLAYER1 exists

            // Hide the button to play as PLAYER 1
            $(".buttonP1").hide();

            // Display the username in the wing
            $(".player1Name").text("Player: " + player1.name);

        } else {
            $(".buttonP1").show();
            $(".player1Name").text("Waiting for player");
        }

        if (player2.name) { // If a PLAYER2 exists

            // Hide the button to play as PLAYER 2
            $(".buttonP2").hide();

            // Display the username in the wing
            $(".player2Name").text("Player: " + player2.name);

        } else {
            $(".buttonP2").show();
            $(".player2Name").text("Waiting for player");
        }

        if (player1.choice) { // If player 1 make choice
            // Show choice to viewers only
            $("#player1choice").html('<img src="./assets/images/icon_' + player1.choice + '.png" id="' + player1.choice + '" alt="' + player1.choice + '"></img>');
        } else {
            //If no choice then clear
            $("#player1choice").html('');
            $(".oponentChoice1").html('');
        }

        if (player2.choice) { // If player 2 make choice
            // Show to viewers only
            $("#player2choice").html('<img src="./assets/images/icon_' + player2.choice + '.png" id="' + player2.choice + '" alt="' + player2.choice + '"></img>');
        } else {
            //If no choice then clear
            $("#player2choice").html('');
            $(".oponentChoice2").html('');
        }

        if (player1.choice && player2.choice) {
            // If both players have chosen then test who wins?

            // Winner return who wins (player1, player2 or tie)
            var winner = whoWin(player1.choice, player2.choice);

            //show their oponent's choice
            $(".oponentChoice1").html('<img src="./assets/images/icon_' + player1.choice + '.png" id="' + player1.choice + '" alt="' + player1.choice + '"></img>');
            $(".oponentChoice2").html('<img src="./assets/images/icon_' + player2.choice + '.png" id="' + player2.choice + '" alt="' + player2.choice + '"></img>');

            // Depending who wins
            switch (winner) {
                case 'player1': // If PLAYER1 wins

                    // Message for PLAYERS
                    if (mode == winner) {
                        $(".resultMessageP").text("You won!");
                        wins++;
                    } else {
                        $(".resultMessageP").text("You lost!");
                        loses++;
                    }

                    // Message for VIEWERS
                    $(".resultMessageV").text(eval(winner).name + " wins!");
                    console.log(eval(winner).name + " wins!");
                    break;

                case 'player2': // If PLAYER2 wins

                    // Message for PLAYERS
                    if (mode == winner) {
                        $(".resultMessageP").text("You won!");
                        wins++;
                    } else {
                        $(".resultMessageP").text("You lost!");
                        loses++;
                    }

                    $(".resultMessageV").text(eval(winner).name + " wins!");
                    console.log(eval(winner).name + " wins!");
                    break;

                case 'tie': // If it's a tie
                    // Message for PLAYERS
                    $(".resultMessageP").text("Same choice... its a tie");

                    // Message for PLAYERS
                    $(".resultMessageV").text("Same choice... its a tie");
                    console.log("Same choice... its a tie");
                    break;
            }

            // Wait some time to show the winner and clear all games
            setTimeout(function () {
                prepareForNewGame();
                console.log("NEW GAME");

            }, 5000); // Wait this many miliseconds after the second card is picked
        }

        // Update stats
        $(".playerStats").text("WINS: " + wins + " - LOSES: " + loses);

    }

    // Return everything for a new game
    function prepareForNewGame() {

        // Clear the local records done by player
        if (mode !== 'viewer') {
            var object = eval(mode);
            object = {
                name: '',
                choice: ''
            };

            player = {
                name: '',
                choice: ''
            }

            // Remove the choice value in FireBase
            connectionsRef.child(userId).update({
                "choice": player.choice
            });

            // Reset result message
            $(".resultMessageP").text("Make a choice");

            // Make icons 100% visible
            $(".choice").css("opacity", "1");

            //Only one chance to pick!
            choiceMade = false;
        } else {
            // Reset result message
            $(".resultMessageV").text("");

        }

        // Re-draw screen
        updateScreen();
    }

    // ********************************
    // **        BUTTON logic        **
    // ********************************

    // Select to play as PLAYER 1
    $(".buttonP1").on("click", function (e) {
        e.preventDefault();

        // Reset game stats
        wins = 0;
        loses = 0;

        // Escaping if no name was given
        if (!$("#player-name").val().trim()) {
            alert('Please enter a valid name and clik PLAY');
            return;
        }

        // Set the local mode to PLAYER 1
        mode = 'player1';

        // Update the previous values to FireBase
        connectionsRef.child(userId).update({
            "mode": mode,
            "name": $("#player-name").val().trim()
        });

        // Save the PLAYER1 or PLAYER2 object into PLAYER ust to make it easier
        player = eval(mode);

        // Re-draw screen
        updateScreen();
    })

    // Select to play as PLAYER 2
    $(".buttonP2").on("click", function (e) {
        e.preventDefault();

        // Reset game stats
        wins = 0;
        loses = 0;

        // Escaping if no name was given
        if (!$("#player-name").val().trim()) {
            alert('Please enter a valid name and clik PLAY');
            return;
        }

        // Set the local mode to PLAYER 2
        mode = 'player2';

        // Update the previous values to FireBase
        connectionsRef.child(userId).update({
            "mode": mode,
            "name": $("#player-name").val().trim()
        });

        // Save the PLAYER1 or PLAYER2 object into PLAYER ust to make it easier
        player = eval(mode);

        // Re-draw screen
        updateScreen();
    })

    // Player QUITs playing
    $(".buttonQuit").on("click", function (e) {
        e.preventDefault();

        // Clear the local records done by player
        var object = eval(mode);
        object = {
            name: '',
            choice: ''
        };

        player = {
            name: '',
            choice: ''
        };

        // Reset result message
        $(".resultMessageP").text("Make a choice");

        // Make icons 100% visible
        $(".choice").css("opacity", "1");

        //Only one chance to pick!
        choiceMade = false;

        // Set the local mode to VIEWER
        mode = 'viewer';

        // Update the previous values to FireBase
        connectionsRef.child(userId).update({
            "mode": mode,
            "choice": ""
        });

        // Re-draw screen
        updateScreen();

    })

    // Select to become a VIEWER
    $(".buttonView").on("click", function (e) {
        e.preventDefault();

        // Escaping if no name was given
        if (!$("#player-name").val().trim()) {
            alert('Please enter a valid name to watch');
            return;
        }

        // Set the local mode to VIEWER
        mode = 'viewer';

        // Update the previous values to FireBase
        connectionsRef.child(userId).update({
            "mode": mode,
            "name": $("#player-name").val().trim()
        });

        // Re-draw screen
        updateScreen();
    })

    // The player makes a choice
    $(".choice").on("click", function (e) {
        e.preventDefault();

        // If a choice has been made, exit and do nothing
        if (choiceMade) {
            return;
        }

        // The choice comes from the 'id' of the image pressed
        // NOTE: the 'id' have a '1' or '2'! Need to remove using '.slice(0,-1)' method.
        player.choice = this.id;

        // Fade option buttons
        $(".choice").fadeTo(0, 0.5, function () {
            document.getElementById(player.choice).style.opacity = "1";
        });

        //Only one chance to pick!
        choiceMade = true;

        // Update the previous values to FireBase
        connectionsRef.child(userId).update({
            "mode": mode,
            "choice": player.choice.slice(0, -1)
        });


    })

    // Re-draw screen
    updateScreen();

});