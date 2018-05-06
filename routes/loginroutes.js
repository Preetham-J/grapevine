// Use MySQL
var mysql = require('mysql');

// Connect to MySQL database
var connection = mysql.createConnection({
    host: "********",
    user: "********",
    password: "*************",
    database: "*************",
    ssl: "*************"
});

// Check connection to database
connection.connect(function(err) {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }
    console.log("Connected!");
});


// Registration Function
exports.register = function(req,res){
    // Create user_info query with username, email, password from POST data
  	var user_info = {
    	"username":req.body.username,
    	"email":req.body.email,
    	"password":req.body.password
  	}
    // Send query to database
  	connection.query('INSERT INTO users SET ?', user_info, function (error, results, fields) {
        // If error, redirect
        if (error) {
            console.log("Error in query!", error);
            res.redirect('/');
        }
        // If valid, render Profile Creation page and pass user info
        else{
            console.log('The solution is: ', results);
            res.render('createprofile', {user_info: user_info.username})
        }
    });
}


// Login Function
exports.login = function(req,res){
    // Create username, password variables from POST data
  	var username= req.body.username;
  	var password = req.body.password;
    // Send query to database
  	connection.query('SELECT * FROM users WHERE username = ?',username, function (error, results, fields) {
        console.log(results)
        // If error, send error code
      	if (error) {
    	    res.send({
          		"code":400,
          		"Failed":"Error ocurred."
        	})
      	}
        // If valid:
        else{
            // If returned result is not empty
    	    if(results.length > 0){
                // If returned result's password matches password inputted, render Listen Page and pass user data
                if(results[0].password == password){
                    console.log('User id of login: ', results[0].id);
                    res.render('listen', {user_id_given: results[0].id})
                }
                // If returned result's password does not match, send error code
                else{
                    res.send({
             		"code":204,
              		"Failed":"Username does not match password"
                    });
                }
            }
            // If returned result is empty
            else{
                res.send({
           		"code":204,
           		"Failed":"Username does not exist"
                });
            }
      	}
  	});
}