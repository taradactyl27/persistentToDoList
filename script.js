var express = require('express');
var fs = require('fs');
const axios = require('axios');
var app = express();

fs.readFile('data.json', (err, data) => {
    if (err) throw err;
    let todoList = JSON.parse(data);
    console.log(todoList);
});

axios.get('https://hunter-todo-api.herokuapp.com/user')
  .then(function (response) {
    // handle success
    console.log(response);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .finally(function () {
    // always executed
  });

axios.get('https://hunter-todo-api.herokuapp.com/user?username=TEST_A')
.then(function (response) {
// handle success
console.log(response);
})
.catch(function (error) {
// handle error
console.log(error);
})
.finally(function () {
// always executed
});
/*
  axios.post('https://hunter-todo-api.herokuapp.com/user', {
    username: 'TEST_A',
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  }); */
app.get('/', function (req, res) {
   res.sendFile(__dirname + "/" + "index.html");
})

app.get('/register', function (req, res) {
    // Prepare output in JSON format
    response = {
       user:req.query.user,
    };
    console.log(response);
    res.end(JSON.stringify(response));
 })

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})