var express = require('express');
var app = express();
var path = require('path');

app.get('/', function (req, res) {
    res.json("ok")
    //res.sendFile(path.join(__dirname, 'simulador.html'));
});

app.listen(process.env.PORT || 5000, function () {
    console.log('foiiiii');
});