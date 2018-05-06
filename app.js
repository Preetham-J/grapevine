/*==============================================
            Main Application Code

        Created by: Preetham Jayaram
================================================*/


/*==============================================
                    Modules 
================================================*/
// Requests - HTTP calls
var request = require('request'); 
// Express - Web application framework for Node.js
var express = require('express');
// MySQL - Interaction with MySQL database
var mysql = require('mysql');
// Body Parsing - parse request bodies
var bodyParser = require('body-parser');
// Spotify Web API Node - wrapper to make Spotify Web API calls
var SpotifyWebApi = require('spotify-web-api-node');
// Login - separate login/register functionality
var login = require('./routes/loginroutes');


/*==============================================
                Express Init
================================================*/
// Create Express application
var app = express();

// Use EJS templating for HTML and Body Parser module
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Use /public folder for static files (CSS)
app.use(express.static(__dirname + '/public'));

// Allow use of HTTP headers to access foreign domain resources (used in Login module)
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


/*==============================================
        Router (Login and Registration)
================================================*/
// Create new router
var router = express.Router();

// Route POST from these links to Login module
router.post('/register',login.register);
router.post('/login',login.login)
// Use router, pass in /account as base address
app.use('/account', router);


/*==============================================
                MySQL Setup
================================================*/
// Connect to MySQL database
var connection = mysql.createConnection({
    host: "********",
    user: "********",
    password: "*************",
    database: "*************",
    ssl: "*************"
});
//Test connection to database, report if connected
connection.connect(function(err) {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }
    console.log("Connected!");
});


/*==============================================
            Spotify Web API Setup
================================================*/
// Pass credentials for Spotify API into SpotifyWebApi wrapper
var spotifyApi = new SpotifyWebApi({
    clientId: '***************',
    clientSecret: '****************',
    redirectUri: '*********************'
});


/*==============================================
                Application Routes
================================================*/
// Home page (GET)
app.get('/', function(req, res) {
    res.render('home');
});


/*===============================================================================*/
// Registration page (GET)
app.get('/register', function(req, res) {
    res.render('register');
});


/*===============================================================================*/
// Listening choice: based on user preference (POST)
app.post('/listen_old', function(req, res){
    // Set data and user_id_given from request data 
    var data = {user_id_given: req.body.user_id};
    var user_id_given = req.body.user_id;

    // Finds user preferences given username
    function getLiked (data, callback){
        // Query to find top 2 most recent artists' information entered into user preference
        var q = 'SELECT artist_name, genre FROM liked_artists WHERE user_id = ? ORDER BY created_at DESC LIMIT 2'
        // Send query to database
        connection.query(q, data.user_id_given, function (error, results) {
            // If error, callback error received
            if (error) {
                callback(error, null)
            }
            // If query returns successful, callback results
            else{
                callback(null, results);
            }
        });
    }

    // Set variables for user preferences for artists, genres
    // Note: currently, search is based off user_preferences_genres
    var user_preferences_artists;
    var user_preferences_genres;

    // Call getLiked to find user preferences
    getLiked(data, function(error, content) {
        // If error, redirect
        if (error) {
            console.log("Error in query!", error);
            res.redirect('/');
        }
        // If successful, collect user preferences in variables defined earlier and return
        else{
            console.log('Preferences found!', content);
            user_preferences_artists = {
                artist1: content[0].artist_name,
                artist1: content[1].artist_name}
            user_preferences_genres = {
                genre0: content[0].genre,
                genre1: content[1].genre}
            return user_preferences_genres, user_preferences_artists;
        }
    })

    // Get access token from Spotify Web API
    spotifyApi.clientCredentialsGrant()
    .then(function(data) { // After the Spotify Client Authentication completes successfully, pass data here

        // Set the access token on the object (from wrapper) for use in future calls
        spotifyApi.setAccessToken(data.body['access_token']);

        // Search Spotify for artist entered in POST
        return spotifyApi.searchPlaylists(user_preferences_genres.genre0);
    }).then(function(data) { // After the Spotify Web API search completes successfully, pass data here
        
        // Collect first returned playlist in variable playlist_found
        var playlist_found = data.body.playlists.items[0];
        console.log(playlist_found.external_urls.spotify)
        console.log(playlist_found.name)
        
        //Create playlist_data variable containing artist information to send to template
        var playlist_data = {
            playlist_url: playlist_found.external_urls.spotify,
            playlist_name: playlist_found.name,
            playlist_owner: playlist_found.owner.display_name,
            playlist_image_url: playlist_found.images[0].url
        };

        // Render suggestion template, pass playlist_data and user_id_given
        res.render('suggestion', {playlist_info: playlist_data, user_id_given: user_id_given});

    }, function(error) { // If Spotify Web API search returns error
        console.log('Playlist not found!', error);
    });
});


/*===============================================================================*/
// Listening choice: based on emerging Spotify genres (POST)
app.post('/listen_new', function(req, res){
    // Set data, user_id_given from request data 
    var data = {user_id_given: req.body.user_id};
    var user_id_given = req.body.user_id;
    // Set genre_id to random number between 0 and 174
    var genre_id = Math.floor(Math.random() * 174);

    // Finds emerging Spotify genre from database
    function getGenre (data, callback){
        // Query to find genre from genres table
        var q = 'SELECT genre FROM genres WHERE id = ?'
        // Send query to database
        connection.query(q, genre_id, function (error, results) {
            // If query returns error, callback error
            if (error) {
                callback(error, null)
            }
            // If query is successful, callback results
            else{
            callback(null, results);
            }
        });
    }

    // Create variable genre_name to store query results
    var genre_name;
    // Call getGenre to get Spotify genre from database
    getGenre(data, function(error, content) {
        console.log('user_id passed: ', data.user_id_given);
        // If function returns error, redirect
        if (error) {
            console.log("Error in query!", error);
            res.redirect('/');
        }
        // If function is successful, store and return genre from function
        else{
            console.log('Genre found!', content);
            genre_name = content[0].genre
            return genre_name;
        }
    })

    // Get access token from Spotify Web API
    spotifyApi.clientCredentialsGrant()
    .then(function(data) { // After the Spotify Client Authentication completes successfully, pass data here

        // Set the access token on the object (from wrapper) for use in future calls
        spotifyApi.setAccessToken(data.body['access_token']);

        // Search Spotify for artist entered in POST
        return spotifyApi.searchPlaylists(genre_name);
    }).then(function(data) { // After the Spotify Web API search completes successfully, pass data here
        // Collect first returned playlist in variable playlist_found
        var playlist_found = data.body.playlists.items[0];
        console.log(playlist_found.external_urls.spotify)
        console.log(playlist_found.name)
        
        // Create playlist_data variable containing artist information to send to template
        var playlist_data = {
            playlist_url: playlist_found.external_urls.spotify,
            playlist_name: playlist_found.name,
            playlist_owner: playlist_found.owner.display_name,
            playlist_image_url: playlist_found.images[0].url
        };

        // Render suggestion template and pass playlist_data and user_id_given
        res.render('suggestion', {playlist_info: playlist_data, user_id_given: user_id_given});

    }, function(error) { // If Spotify Web API search returns error
        console.log('Playlist not found!', error);
    });
});


/*===============================================================================*/
// Add artists to user preferences in profile creation (POST)
app.post('/addArtist', function(req, res){
    // Collect artists and username data passed in POST
    var artists = [req.body.artist1, req.body.artist2, req.body.artist3]
    var data = {username: req.body.username};

    // Finds user_id given username
    function getID (data, callback){
        // Query to find user id given username from users table
        connection.query('SELECT id FROM users WHERE username = ?', data.username, function (error, results) {
            // If query returns error, callback with error
            if (error) {
                callback(error, null)
            }
            // If query is successful, callback first result (user id)
            else{
                callback(null, results[0].id);
            }
        });
    }

    // Variable to store user id
    var user_id_given;
    // Call getId function
    getID(data, function(error, content) {
        // If function returns error, redirect
        if (error) {
            console.log("Error in query!", error);
            res.redirect('/');
        }
        // If function is successful, store user id in user_id_given and pass to listen template for rendering
        else{
            console.log('User ID found!', content);
            user_id_given = content;
            res.render('listen', {user_id_given: user_id_given});;
        }
    })

    /*======= FIRST ARTIST =======*/

    // Get access token from Spotify Web API
    spotifyApi.clientCredentialsGrant()
    .then(function(data) { // After the Spotify Client Authentication completes successfully, pass data here

        // Set the access token on the object (from wrapper) for use in future calls
        spotifyApi.setAccessToken(data.body['access_token']);

        // Search Spotify for artist entered in POST
        return spotifyApi.searchArtists(artists[0]);
    }).then(function(data) {
        // Search returned artists and find first result that matches artist, store in artist_found
        var artist_found = data.body.artists.items.find(
            function(element) {
                return element.name == artists[0];
            }
        );
        console.log(artist_found.external_urls.spotify)
        console.log(artist_found.name)
        
        // Create query set with artist information from Spotify Web API search
        var artist_query = {
            artist_url: artist_found.external_urls.spotify,
            artist_name: artist_found.name,
            genre: artist_found.genres[0],
            user_id: user_id_given
        };
        // Query to insert query set into liked_artists table
        var q = 'INSERT INTO liked_artists SET ?'

        // Send query to database
        connection.query(q, artist_query, function(error, results) {
            // If query fails, return error
            if (error) {
                console.error('Error in query: ' + error.stack);
                return;
            }
            console.log("Added artist!");
        });
    }, function(error) { // If artist not found, return error
        console.log('Artist not found!', error);
    });   

    /*======= Second ARTIST =======*/

    // Get access token from Spotify Web API
    spotifyApi.clientCredentialsGrant()
    .then(function(data) { // After the Spotify Client Authentication completes successfully, pass data here

        // Set the access token on the object (from wrapper) for use in future calls
        spotifyApi.setAccessToken(data.body['access_token']);

        // Search Spotify for artist entered in POST
        return spotifyApi.searchArtists(artists[1]);
    }).then(function(data) {
        // Search returned artists and find first result that matches artist, store in artist_found
        var artist_found = data.body.artists.items.find(
            function(element) {
                return element.name == artists[1];
            }
        );
        console.log(artist_found.external_urls.spotify)
        console.log(artist_found.name)
        
        // Create query set with artist information from Spotify Web API search
        var artist_query = {
            artist_url: artist_found.external_urls.spotify,
            artist_name: artist_found.name,
            genre: artist_found.genres[0],
            user_id: user_id_given
        };
        // Query to insert query set into liked_artists table
        var q = 'INSERT INTO liked_artists SET ?'

        // Send query to database
        connection.query(q, artist_query, function(error, results) {
            // If query fails, return error
            if (error) {
                console.error('Error in query: ' + error.stack);
                return;
            }
            console.log("Added artist!");
        });
    }, function(error) { // If artist not found, return error
        console.log('Artist not found!', error);
    }); 

    /*======= THIRD ARTIST =======*/

    // Get access token from Spotify Web API
    spotifyApi.clientCredentialsGrant()
    .then(function(data) { // After the Spotify Client Authentication completes successfully, pass data here

        // Set the access token on the object (from wrapper) for use in future calls
        spotifyApi.setAccessToken(data.body['access_token']);

        // Search Spotify for artist entered in POST
        return spotifyApi.searchArtists(artists[2]);
    }).then(function(data) {
        // Search returned artists and find first result that matches artist, store in artist_found
        var artist_found = data.body.artists.items.find(
            function(element) {
                return element.name == artists[2];
            }
        );
        console.log(artist_found.external_urls.spotify)
        console.log(artist_found.name)
        
        // Create query set with artist information from Spotify Web API search
        var artist_query = {
            artist_url: artist_found.external_urls.spotify,
            artist_name: artist_found.name,
            genre: artist_found.genres[0],
            user_id: user_id_given
        };
        // Query to insert query set into liked_artists table
        var q = 'INSERT INTO liked_artists SET ?'

        // Send query to database
        connection.query(q, artist_query, function(error, results) {
            // If query fails, return error
            if (error) {
                console.error('Error in query: ' + error.stack);
                return;
            }
            console.log("Added artist!");
        });
    }, function(error) { // If artist not found, return error
        console.log('Artist not found!', error);
    }); 
});


/*===============================================================================*/
// User enters artist for preference update from suggestion (POST)
app.post('/addPreference', function(req, res){
    // Collect artist and user_id from POST
    var artist = req.body.artist
    var user_id_given = req.body.user_id;

    // Get access token from Spotify Web API
    spotifyApi.clientCredentialsGrant()
    .then(function(data) {

        // Set the access token on the object (from wrapper) for use in future calls
        spotifyApi.setAccessToken(data.body['access_token']);

        // Search Spotify for artist entered in POST
        return spotifyApi.searchArtists(artist);
    }).then(function(data) { // After the Spotify Client Authentication completes successfully, pass data here
        // Search returned artists and find first result that matches artist, store in artist_found
        var artist_found = data.body.artists.items.find(
            function(element) {
                return element.name == artist;
            }
        );
        console.log(artist_found.external_urls.spotify)
        console.log(artist_found.name)
        
        // Create query set with artist information from Spotify Web API search
        var artist_query = {
            artist_url: artist_found.external_urls.spotify,
            artist_name: artist_found.name,
            genre: artist_found.genres[0],
            user_id: user_id_given
        };
        // Query to insert query set into liked_artists table
        var q = 'INSERT INTO liked_artists SET ?'

        //Send query to database
        connection.query(q, artist_query, function(error, results) {
            // If query fails, return error
            if (error) {
                console.error('Error in query: ' + error.stack);
                return;
            }
            // If query successful, render listen template and pass user_id_given
            console.log("Added artist!");
            res.render('listen', {user_id_given: user_id_given})
        });
    }, function(error) { //If artist not found, return error
        console.log('Artist not found!', error);
    });
});


/*===============================================================================*/
// Report server as running and address
app.listen(process.env.PORT || 8080, function(){
    console.log('Server running on 8080!');
});

