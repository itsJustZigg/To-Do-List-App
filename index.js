var express = require('express')
var app = express()
var parser = require('body-parser')
var MongoClient = require('mongodb').MongoClient

app.use(function(request, response, next){
	response.header("Access-Control-Allow-Origin", "*") //allow access to resources from any origin
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

app.use(parser.urlencoded({ extended: true}))
app.use(express.static(__dirname + '/image'))

app.get("/", function(req, res){ //first page that the user should be sent to 

	//var imgUrl = '<img src="loginLogo.jpg" alt="logo" height="300" width="500"/>'
	var htmlForm = '<h1>Login</h1>' + '<img src="loginLogo.png" alt="logo" height="75" width="150"/><br>' + 
	 '<form action="/" method="POST">' +
	 'Username:' + 
	 '<input type="text" name="userName"></input><br><br>' + 
	 'Password:' + 
	 '<input type="password" name="passWord"></input><br><br>' +
	 '<button type="submit">Submit</button>' +
	 '<a href="/createUser">Create New User<a>'+
	 '</form>' 
	 
	 //res.sendFile('__dirname', 'loginLogo.png')
	res.send(htmlForm)
})

app.post("/", function(req, res){ //post for the login page. Username and password submitted will be compared to db username and password
								//if login is succesful, user will be sent to default page where the db will populate the html doc with tasks list
	var userName = req.body.userName
	var passWord = req.body.passWord	
	
	MongoClient.connect('mongodb://localhost:27017/test', function (err, db) {
		
		if(err) throw err
		var dbCollection = db.collection('users')
		
		dbCollection.findOne({username:userName}, function(err, document) { 
		
			if(document && document.password === passWord) //checks if document exists because
			//findOne returns null if the document isn't found.
			{
				res.redirect('http://localhost:3000/default') 
			}
			else {
				goBackLink = '<a href="/">Go Back to Login Page</a>'
				res.send('Login Unsuccessful<br>' + goBackLink)  
			}
			db.close()
		})
	}) 
	
})

app.get("/createUser", function(req, res){ //sends the user to the create user page to register if link is clicked
	 var htmlForm = '<h1>Create a New User</h1>' + 
	 '<form action="/createUser" method="POST">' +
	 'Username:<br>' +
	 '<input type="text" name="userName"></input><br><br>' +
	 'Password:<br>' +
	 '<input type="password" name="passWord"></input><br><br>' +
	 'Email:<br>' +
	 '<input type="email" name="email" placeholder="Please Enter Your Email"></input><br><br>' +
	 'First Name:<br>' +
	 '<input type="text" name="fName" placeholder="Please Enter First Name"></input><br><br>' + 
	 'Last Name:<br>' +
	 '<input type ="text" name="lName" placeholder="Please Enter Last Name"></input><br><br>' + 
	 '<button type="submit">Submit</button>'
	 
	 res.send(htmlForm)
	
})

app.post("/createUser", function(req, res){ //create user page
	
	var userName = req.body.userName
	var passWord = req.body.passWord
	var email = req.body.email
	var fName = req.body.fName
	var lName = req.body.lName
	
	MongoClient.connect('mongodb://localhost:27017/test', function (err, db) {
		
		if(err) throw err
		var dbCollection = db.collection('users')
		dbCollection.insert({'username':userName, 'password':passWord, 'email':email, 'fname':fName, 'lname':lName}, function (err, result){
			if(err){
				return console.log(err)
			}
			else{
				res.redirect('http://localhost:3000/')
			}
		})
	})
})



app.get("/default", function(req, res){ 
	
	var html = '<h1>To-Do List</h1>' +
	 '<a href="/createTask">Add a New Task</a><br>' + '<a href="/createUser">Create New User</a><br><br>' +
	 '<ol>'
	 
	MongoClient.connect('mongodb://localhost:27017/test', function (err, db) { //opens mongodb and pulls all the tasks
	// from the db to populate the task list in the html file
		
		if(err) throw err
		var dbCollection = db.collection('tasks')
		dbCollection.find().toArray(function(err, tasks) {   
		
		if (err) {
			console.log(err)
		}
		
		for(var i = 0; i < tasks.length; i++){
			html += '<li>'+ tasks[i].task + '</li>' 
		} //end of for loop
		
		html += '</ol><br>'
		db.close()
		res.send(html)
		
		})
		
	}) //end of connect
	
}) 

app.get("/createTask", function(req, res){ //page where the user can add a new task to the list
	
	var html = '<a href="/default">Go Back to the To-Do List<a>' + 
	 '<h1>Add tasks to the To-Do List</h1>' +
	 '<form action="/createTask" method="POST">' + 
	 'Enter Task:' + 
	 '<textarea name="newTask" placeholder="Enter what you want to get done"></textarea>' +
	 '<br><br>' + 
	 '<button type="submit">Submit</button>' + 
	 '</form>'
	 
	res.send(html)
})

app.post("/createTask", function(req, res){ //stores the task in the database
	var taskEntered = req.body.newTask
	
	MongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
		
		if(err) throw err
		var dbCollection = db.collection('tasks')
		dbCollection.insert({'task':taskEntered}, function(err, result) { 
			
			if(err){
				return console.log(err)
			}
			db.close()
		})
	})
	
})

app.listen(3000, function(){
	console.log("Server listening at port 3000")
})