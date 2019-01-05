// VARIABLES --------------------------------------------

//      CONSTANTS

//      ARRAYS

//      STRINGS/CHAR
var playerChoice = "";

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

    // Re-draw screen based on game variables
    function updateScreen() {

        $(".playerStats").text("GAMES: " + games + " - WINS: " + wins + " - LOSES: " + loses);

        $("#playerName").text("PLAYER 1: " + player.name);

    }


    // ********************************
    // **      BUTTON logic
    // ********************************

    // The player makes a choice
    $(".choice").on("click", function () {

        player.choice = this.id;

        // Fade option buttons
        $(".choice").fadeTo(0, 0.5, function () {
            document.getElementById(player.choice).style.opacity = "1";
        });

    })



    // Toggles instructions visibility
    $("#showInstructions").on("click", function () {
        $("#instructions").fadeToggle();
    })


    updateScreen();

});