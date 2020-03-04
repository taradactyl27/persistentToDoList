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

app.get('/', function (req, res) {
  console.log(req.cookies.userCookie)
  if(req.cookies.userCookie === undefined){
    links = [{"link":"Register"},{"link":"Login"}]
    res.render("refs",{args:links});
  }
  else{
    token = req.cookies.userCookie.token;
    user = req.cookies.userCookie.username;
    links = [{"link":"Logout"}];
    var auth = {headers: {"Authorization":token}};
    var todoList;
    axios.get('https://hunter-todo-api.herokuapp.com/todo-item', auth)
    .then(function (auth) {
      todoList = auth.data;
      for(var i = 0; i< todoList.length; i++){
        console.log(todoList[i].deleted)
        if (todoList[i].deleted == true){
          delete todoList[i]
        }
      }
      console.log(todoList)
      res.render("logged", {args:links, tasks:todoList, userLog:user});
    })
    .catch(function (error){
      console.log(error);
      res.render("logged", {args:links, tasks:todoList, userLog:user});
    });
 
  }
})
app.post('/remove',function(req, res){
  token = req.cookies.userCookie.token;
  var auth = {headers: {"Authorization":token}};
  var id = req.body.id;
  axios.delete('https://hunter-todo-api.herokuapp.com/todo-item/' + id, auth)
  .then(function(task) {
    console.log(task);
    res.redirect('/');
  })
  .catch(function(error){
    console.log(error);
  });
})
app.post('/complete',function(req, res){
  token = req.cookies.userCookie.token;
  var auth = {headers: {"Authorization":token}};
  var id = req.body.id;
  axios.put('https://hunter-todo-api.herokuapp.com/todo-item/' + id, {"completed":true} ,auth)
  .then(function(task) {
    console.log(task);
    res.redirect('/');
  })
  .catch(function(error){
    console.log(error);
  });
})
app.get('/promptItem', function(req, res){
  res.render("prompt");
})
app.post('/addItem', function(req,res){
  token = req.cookies.userCookie.token;
  var auth = {headers: {"Authorization":token}};
  task = req.body;
  axios.post('https://hunter-todo-api.herokuapp.com/todo-item', task, auth)
  .then(function(task) {
    res.redirect('/');
  })
  .catch(function(error){
    console.log(error);
  });
})
app.get('/logout', function (req,res){
    res.clearCookie('userCookie');
    res.redirect('/');
})
app.get('/register', function (req,res) {
  res.render("register");
})
app.post('/registerA', function(req,res) {
  user = req.body;
  axios.post('https://hunter-todo-api.herokuapp.com/user', user)
 .then(function (user) {
   res.redirect('/');
 })
 .catch(function (error) {
   console.log(error);
   res.render("register",{error:"User already exists!"});
 });
});
app.get('/login', function(req,res) {
  res.render("login");
})
app.post('/authorize', function (req, res) {
    user = req.body;
    var username = user.username;
    axios.post('https://hunter-todo-api.herokuapp.com/auth', user)
    .then(function (user) {
      res.cookie('userCookie',{"token":user.data.token, "username":username});
      res.redirect("/");
    })
    .catch(function (error) {
      console.log(error);
      res.render("login",{error:"User does not exist!"});
    });
 })
var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})
