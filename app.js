const express = require('express')
var hbs = require('express-handlebars')
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
require('dotenv').config();

var session = require("express-session");

var app = express()
app.engine('hbs', hbs({ defaultLayout: 'game_main', extname: '.hbs' }));
app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({
    extended: false
}))

app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 600,
        path: "/",
        httpOnly: true,
    }
}))

app.use(express.static('public'))
app.use('/', require('./routes/index'))

app.listen(process.env.PORT, console.log('Listening on ' + process.env.PORT));