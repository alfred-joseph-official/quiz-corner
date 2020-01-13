var express = require('express')
var routes = express.Router()
var mongoDB = require("mongodb")
var url = "mongodb://localhost:27017"
var dbNAME = "quiz-corner-attainu"
var DB = ''
mongoDB.MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, function(err, server) {
    if (err) {
        console.log(err)
    } else {
        DB = server.db(dbNAME)
    }
})
routes.get('/', function(req, res) {
    //Todo Render only homepage
    // if (req.session.user) {
    //     res.render('profile')
    // } else {
    res.render('homepage')
        // }

})

routes.get('/home', function(req, res) {
    res.render("homepage");
});

routes.post("/signupuser", function(req, res) {
    var data = {
        name: "",
        username: req.body.usn,
        email: req.body.email,
        pwd: req.body.pwd,
        dp: "",
        age: "",
        top_score: [],
        fb_auth: ""
    }
    DB.collection('Users').insertOne(data, function(err, result) {
        if (err) console.log("error2")
        else {
            res.redirect('/?registered=true')
        }
    })
})


routes.post('/loginuser', function(req, res) {

    DB.collection('Users').findOne({ username: req.body.usn }, function(err, result) {
        if (err) {
            res.redirect('/')
        } else {
            if (req.body.usn == result.username && req.body.pwd == result.password) {
                req.session.user = result.username
                check = false

            }
            res.redirect('/profile')
        }
    })
})


routes.get('/game', function(req, res) {
    res.render('gamepage', {
        page: true
    })
})

routes.get('/gamestart', function(req, res) {
    res.render('gamepage', {
        gamestart: true
    })
})

routes.get("/profile", function(req, res) {
    if (req.session.user) {
        DB.collection('Users').findOne({ username: req.session.user }, function(err, result) {
            if (err) {
                res.redirect('/')
                console.log("hi")
            } else {
                res.render("profile", { username: 'Amrit', password: 'password', phone: '12345678', address: 'city', email: 'amrit@gmail.com', birthday: '00/00/00', gender: 'Male', sessionuser: req.session.user })
            }
        })
    } else {

        res.redirect('/')
    }

    //this all will be dynamically called from database for test purpose i have manually input the data

})


routes.post("/updateprofile", function(req, res) {
    var pass = req.body.pass;
    var userphone = req.body.phone;
    var useraddress = req.body.address;
    var user = req.session.user
    var filterstatement = { 'name': req.body.user }
    var updatestatement = { $set: { password: req.body.pass } }
    DB.collection('Users').findOneAndUpdate({ "name": req.session.user }, { $set: { "password": pass } }, function(err, result) {
        if (err) {
            //res.redirect('/')
            console.log(err)
        } else {
            console.log(result)
            res.redirect('/profile')
        }
    })
})

routes.get('/logout', function(req, res) {
    req.session.destroy();
    //Changes 14.01.2020 02:05 - AJ
    // res.render('homepage')
    res.redirect('/');
})
module.exports = routes