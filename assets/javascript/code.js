// VARIABLES --------------------------------------------

//      CONSTANTS
const playButton = $("#play-bid");

//      ARRAYS


//      STRINGS/CHAR
var pName = ''; // Current player's name
var pChoice = ''; // Current player's choice
var otherName = ''; // Oponent's name
var otherChoice = ''; // Oponent's choice

//      NUMBER/INTEGER
var viewers = 0; // How many connections
var players = 0; // How many players (only 0, 1 and 2 are possible!)

//      BOOLEAN
var player = false; // Current conenction is playing?

//      OBJECTS
var player = {
    pName,
    pChoice
};
var oponent = {
    otherName,
    otherChoice
};

// ------------------------------------------------------------


$(document).ready(function () {

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyB1HxxxgWtZVB6TQ4nR4jsDL8cLdLs1e5k",
        authDomain: "bootcamp-b291e.firebaseapp.com",
        databaseURL: "https://bootcamp-b291e.firebaseio.com",
        projectId: "bootcamp-b291e",
        storageBucket: "bootcamp-b291e.appspot.com",
        messagingSenderId: "170857954110"
    };

    firebase.initializeApp(config);

    // Create a variable to reference the database.
    var database = firebase.database();

    var gameStats = database.ref("/rpm_multiuser/gameStats");
    var players = database.ref("/rpm_multiuser/player");
    var player1 = database.ref("/rpm_multiuser/player/p1");
    var player2 = database.ref("/rpm_multiuser/player/p2");

    // All connections will be stored in this directory.
    var connectionsRef = database.ref("/rpm_multiuser/connections");

    // '.info/connected' is a special location provided by Firebase that is updated
    // every time the client's connection state changes.
    // '.info/connected' is a boolean value, true if the client is connected and false if they are not.
    var connectedRef = database.ref(".info/connected");

    // When the client's connection state changes...
    // connectedRef.on("value", function (snap) {

    connectedRef.on("value", function (snap) {

        // If they are connected..
        if (snap.val()) {

            // Add user to the connections list.
            var con = connectionsRef.push(true);

            // Remove user from the connection list when they disconnect.
            con.onDisconnect().remove();
        }
    });

    connectionsRef.on('value', function (snap) {

        viewers = parseInt(snap.numChildren());

        // Someone has connected!
        console.log("Viewers: " + viewers);

        // Update the number of viewers in the database
        gameStats.update({
            "viewers": viewers
        });

        $("#connected-viewers").text(viewers);
    })

    players.on('value', function (snap) {

        if (snap.exists()) {
            players = snap.numChildren();
            console.log('Ther is at least one player');
            playButton.hide();

        } else {
            players = 0;
            console.log('There are NO players');
            // console.log(gameStats.doc());
            playButton.show();

        }
        // Player 1 has been updated!

        $("#connected-players").text(players);

    })

    player1.on('value', function (snap) {

        if (snap.exists()) {
            console.log('P1 Name: ' + snap.val().name);
            console.log('P1 Choice: ' + snap.val().choice);
        }
        // Player 1 has been updated!

    })

    player2.on('value', function (snap) {

        if (snap.exists()) {
            console.log('P2 Name: ' + snap.val().name);
            console.log('P2 Choice: ' + snap.val().choice);
        }
        // Player 2 has been updated!

    })

    playButton.on("click", function (event) {
        event.preventDefault();

        pName = $("@player-name").val().trim();

        console.log('lets play!');

        player = true;
        switch (players) {
            case 0:
                console.log('You are player 1');

                // set the player 1 info
                player1.update({
                    "name": pName
                });

                break;

            case 1:
                console.log('You are player 2');

                // set the player 1 info
                player2.update({
                    "name": pName
                });

                break;

            default:
                break;
        }

        // Increase the number of players
        players++;

        // Update the number of players in the database
        gameStats.update({
            "players": players
        });



    });

});