var express = require('express');
var exphbs = require('express-handlebars')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var fs = require('fs');
const axios = require('axios');
var app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(cookieParser());
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");
const API_URL = 'https://hunter-todo-api.herokuapp.com/';

//default route 
app.get('/', function (req, res) {
  if(req.cookies.userCookie === undefined){ //check if cookies exist
    links = [{"link":"Register"},{"link":"Login"}] //register and login links to be rendered
    res.render("refs",{args:links});
  }
  else{
    token = req.cookies.userCookie.token;
    user = req.cookies.userCookie.username;
    links = [{"link":"Logout"}]; //cookie exists so pass logout link
    var auth = {headers: {"Authorization":token}}; //authorization header
    var todoList;
    axios.get(API_URL + 'todo-item', auth)
    .then(function (auth) {
      todoList = auth.data;
      for(var i = 0; i< todoList.length; i++){
        if (todoList[i].deleted == true){
          delete todoList[i] //remove all instances of deleted todo items
        }
      }
      res.render("logged", {args:links, tasks:todoList, userLog:user}); //render logged in page
    })
    .catch(function (error){
      if(error.response.status == 404){
        res.render("logged", {args:links, tasks:todoList, userLog:user}); //404 error means no data in user yet
      }
      else{
        res.clearCookie('userCookie'); //else auth failed so cookie probably expired so make sure its empty and redirect back to home
        res.redirect("/");
      }
    });
 
  }
})
//remove item route
app.post('/remove',function(req, res){
  token = req.cookies.userCookie.token;
  var auth = {headers: {"Authorization":token}};
  var id = req.body.id;
  axios.delete(API_URL + 'todo-item/' + id, auth)
  .then(function(task) {
    res.redirect('/');
  })
  .catch(function(error){
    console.log(error);
  });
})
//task completed route
app.post('/complete',function(req, res){
  token = req.cookies.userCookie.token;
  var auth = {headers: {"Authorization":token}};
  var id = req.body.id;
  axios.put(API_URL + 'todo-item/' + id, {"completed":true} ,auth)
  .then(function(task) {
    res.redirect('/');
  })
  .catch(function(error){
    console.log(error);
  });
})
//item prompt route
app.get('/promptItem', function(req, res){
  res.render("prompt");
})
//add item route
app.post('/addItem', function(req,res){
  token = req.cookies.userCookie.token;
  var auth = {headers: {"Authorization":token}};
  task = req.body;
  axios.post(API_URL + 'todo-item', task, auth)
  .then(function(task) {
    res.redirect('/');
  })
  .catch(function(error){
    console.log(error);
  });
})
//simple logout - just clear cookie and redirect
app.get('/logout', function (req,res){
    res.clearCookie('userCookie');
    res.redirect('/');
})
//render register page
app.get('/register', function (req,res) {
  res.render("register");
})
//register route
app.post('/registerA', function(req,res) {
  user = req.body;
  axios.post(API_URL + 'user', user)
 .then(function (user) {
   res.redirect('/'); //user registered so return to home page
 })
 .catch(function (error) {
   console.log(error);
   res.render("register",{error:"User already exists!"}); //flash message if user exists
 });
});
//render login page
app.get('/login', function(req,res) {
  res.render("login");
})
//authorization route
app.post('/authorize', function (req, res) {
    user = req.body;
    var username = user.username;
    axios.post(API_URL + 'auth', user)
    .then(function (user) {
      res.cookie('userCookie',{"token":user.data.token, "username":username});
      res.redirect("/");
    })
    .catch(function (error) {
      console.log(error);
      res.render("login",{error:"User does not exist!"}); //flash message that user doesnt exist if request returns an error
    });
 })

var server = app.listen(process.env.PORT || 8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})
