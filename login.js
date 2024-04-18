const mysql = require('mysql2');
const express = require('express');
const session = require('express-session');
const path = require('path');

const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'Utkarsh@2003',
	database : 'users'
});
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

// const app = express();
const adminRouter=express.Router();
const matchRouter=express.Router();
const playerRouter=express.Router();
const teamsRouter=express.Router();
app.use('/api/admin',adminRouter)
app.use('/api/matches',matchRouter)
app.use('/api/players',playerRouter)
app.use('/api/teams',teamsRouter)
adminRouter.route('/signup').post(registerUser);
adminRouter.route('/login').post(loginUser);
matchRouter.route('/').get(getMatch).post(createMatch)
matchRouter.route('/:id').post(displayMatchDetails);
playerRouter.route('/').get(getPlayers).post(addPlayers)
playerRouter.route('/:id').get(getPlayerById)
teamsRouter.route('/').get(getTeams).post(addTeams)
teamsRouter.route('/:team_id/squad').post(addTeamMember)
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, 'static')));

// http://localhost:3000/
// app.get('/', function(request, response) {
// 	// Render login template
// 	response.sendFile(path.join(__dirname + '/login.html'));
// });
 function loginUser(req, res) {
	// Capture the input fields
	let username = req.body.username;
	let password = req.body.password;
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM userdetail WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				// req.session.loggedin = true;
				// req.session.username = username;
				// Redirect to home page
				res.json({
                    status: "Login successful",
                    status_code: 200
                })
			} else {
				res.json({
                    status: "Incorrect username/password provided. Please retry",
                    status_code: 401
                });
			}			
			res.end();
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
}

function registerUser(req,res){
    inputData ={
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    }
    var sql='SELECT * FROM userdetail WHERE email =?';
connection.query(sql, [inputData.email] ,function (err, data, fields) {
 if(err) throw err
 if(data.length>1){
     var msg = inputData.email+ "was already exist";
 }else{
     
    // save users data into database
    var sql = 'INSERT INTO userdetail SET ?';
   connection.query(sql, inputData, function (err, data) {
      if(err) throw err
           });
  var msg ="Admin Account successfully created";
 }
 res.json({
    status: msg,
    status_code: 200,
 })
})
     
};
function createMatch(req,res){
    data={
        team_1:req.body.team_1,
        team_2:req.body.team_2,
        date:req.body.date,
        venue:req.body.venue
    }
    var sql='INSERT INTO matches SET ?';
    connection.query(sql, data, function (err, data) {
        if(err) throw err
             });
        res.json({
            message:"match created successfully"
        })

}
function getMatch(req,res){
    
    connection.query("select * from matches",function(err,result){
        if(err)throw err;
        else {
           
            res.json({
                matches:result
            })
        }
    })
    
    
}
function addPlayers(req,res){
    data={
        player_id:req.body.player_id,
        name:req.body.name,
        matches_played:req.body.matches_played,
        runs:req.body.runs,
        average:req.body.average,
        strikerate:req.body.strikerate
    }
    var sql='INSERT INTO players SET ?';
    connection.query(sql, data, function (err, data) {
        if(err) throw err
             });
        res.json({
            message:"player added successfully"
        })
}
function getPlayers(req,res){
    connection.query("select * from players",function(err,result){
        if(err)throw err;
        else {
           
            res.json({
                players:result
            })
        }
    })
}
function getPlayerById(req,res){
    var id=req.params.id;
    connection.query("select * from players where player_id =?",[id],function(err,result){
        if(err)throw err;
        else {
           
            res.json({
                player:result
            })
        }
    })
}
 function addTeams(req,res){
    data={
        id:req.body.id,
        name:req.body.name,
        player_id:req.body.player_id
    }
    var sql='INSERT INTO squad SET ?';
    connection.query(sql, data, function (err, data) {
        if(err) throw err
             });
        res.json({
            message:"team added successfully"
        })
 }
 function getTeams(req,res){
    connection.query("select * from squad",function(err,result){
        if(err)throw err;
        else {
           
            res.json({
                teams:result
            })
        }
    })
 }
function addTeamMember(req,res){
    var team_id=req.params.team_id;
    console.log(team_id)
    var player_name=req.body.name;
    var player_role=req.body.role;

    console.log(player_name)

    var data={
        id:team_id,
        name:"",
        player_id: 0
    }
    
    connection.query("select distinct name from squad where id=?",[team_id],function(err,result){
        if(err)throw err
        console.log(result[0].name)
        data.name=result[0].name;
    })
    connection.query("select player_id from players where name=?",[player_name],function(err,result){
        if(err)throw err
        console.log(result[0].player_id)
         data.player_id= result[0].player_id;
         console.log(data);

         var sql='INSERT INTO squad SET ?';
      connection.query(sql, data, function (err, data) {
        if(err) throw err
             });
        res.json({
            message: "Player added to squad successfully",
             player_id: data.player_id
        })
    })
}

 function displayMatchDetails(req,res){
    let match_id=req.params.id;
    
 }
app.listen(3000);