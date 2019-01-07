// VARIABLES --------------------------------------------

//      CONSTANTS

//      ARRAYS

//      STRINGS/CHAR
var userId = ''; // User UD when connecting to database
var mode = '';

//      NUMBER/INTEGER
var games = 1;
var wins = 2;
var loses = 3;

//      BOOLEAN
var oponent = false;

//      OBJECTS

// Creating a "player info" object using constructor notation
function playerInfo(playerName, playerChoice) {
    this.name = playerName; // Player's name
    this.choice = playerChoice; // Player's choice
}

var player1 = new playerInfo('', ''); // Contains CURRENT player info
var player2 = new playerInfo('', ''); // Contains CURRENT player info
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

        // This function will harvest the: KEY, MODE, NAME and CHOICE
        // of the connections with MODE 'PLAYER 1' and 'PLAYER 2' and
        // save them locally on its respective objects.

        // Look for VIEWERS with 'player' mode
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

    // Look for viewers in 'player' mode
    function checkFor(mode) {

        console.log("looking for " + mode);

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


        if (mode === 'player1') {

            console.log("Player is player 1")

            $("#welcomeSection").hide();
            $("#userSection").hide();
            $("#gameSection").show();
            $("#viewerSection").hide();

            //Hide/show the elements on player bars
            $("#p1p").show();
            $("#p1v").hide();
            $("#p2p").hide();
            $("#p2v").show();

        } else if (mode === 'player2') {

            console.log("Player is player 2")

            $("#welcomeSection").hide();
            $("#userSection").hide();
            $("#gameSection").show();
            $("#viewerSection").hide();

            //Hide/show the elements on player bars
            $("#p1p").hide();
            $("#p1v").show();
            $("#p2p").show();
            $("#p2v").hide();

        } else if (mode === 'viewer') {

            console.log("Just viewing")

            $("#welcomeSection").hide();
            $("#userSection").hide();
            $("#gameSection").hide();
            $("#viewerSection").show();

        }



        $(".playerStats").text("GAMES: " + games + " - WINS: " + wins + " - LOSES: " + loses);

        if (player1.name) {
            $(".player1Name").text("Player 1: " + player1.name);
        } else {
            $(".player1Name").text("Waiting for player");
        }

        if (player2.name) {
            $(".player2Name").text("Player 2: " + player2.name);
        } else {
            $(".player2Name").text("Waiting for player");
        }


    }


    // ********************************
    // **        BUTTON logic        **
    // ********************************

    // Select to play as PLAYER 1
    $("#buttonP1").on("click", function (e) {
        e.preventDefault();

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

        // Re-draw screen
        updateScreen();
    })

    // Select to play as PLAYER 2
    $("#buttonP2").on("click", function (e) {
        e.preventDefault();

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

        // Re-draw screen
        updateScreen();
    })

    // Select to become a VIEWER
    $("#buttonView").on("click", function (e) {
        e.preventDefault();

        // Escaping if no name was given
        if (!$("#player-name").val().trim()) {
            alert('Please enter a valid name to watch');
            return;
        }

        // Set the local mode to PLAYER 2
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
    $(".choice").on("click", function () {

        player.choice = this.id;

        // Fade option buttons
        $(".choice").fadeTo(0, 0.5, function () {
            document.getElementById(player.choice).style.opacity = "1";
        });

    })

    updateScreen();

});