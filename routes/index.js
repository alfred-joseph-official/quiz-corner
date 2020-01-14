var express = require('express')
var routes = express.Router()
var mongoDB = require("mongodb")
var crypto = require("crypto");
var nodemailer = require("nodemailer");
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

var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: "quiz.corner.attainu@gmail.com",
        pass: 'jnef9820'
    }
});

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
        usn: req.body.usn,
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

    DB.collection('Users').findOne({ usn: req.body.usn }, function(err, result) {
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

routes.get("/forgot", function(req, res) {
    res.render("forgot");
});

routes.post("/forgot", function(req, res) {
    DB.collection('Users').findOne({ $or: [{ email: req.body.field }, { usn: req.body.field }] }, function(err, userObj) {
        if (err || !userObj) {
            res.redirect('/');
        } else {
            crypto.randomBytes(16, function(err, buffer) {
                var token = buffer.toString('hex');
                var expire = Date.now() + 1000 * 60 * 15;
                var mailOptions = {
                    from: '"Quiz Corner " <no-reply@quiz-corner.com',
                    to: userObj.email,
                    subject: "Reset Password",
                    text: 'Hello ' + userObj.usn + '! You have requested to reset your password. Click on the below link to reset your password.' + "\nhttp://localhost:3000/reset/token/" + token
                }

                transporter.sendMail(mailOptions, function(mailErr, info) {
                    if (mailErr) console.log(mailErr);
                    else res.send('Message sent: ' + info.response);
                })
                var newStr = {};
                newStr["expire_time"] = expire;
                newStr["token"] = token;
                var newValues = { $set: newStr };
                DB.collection('ResetLinks').findOneAndUpdate({ $or: [{ email: req.body.field }, { usn: req.body.field }] }, newValues, { returnOriginal: false }, function(err, resetObj) {
                    if (err || !resetObj.value) {
                        resetLink = {
                            usn: userObj.usn,
                            email: userObj.email,
                            expire_time: expire,
                            token: token
                        }
                        DB.collection('ResetLinks').insertOne(resetLink, function(err, result) {
                            if (err) throw err;
                            res.send("success!");
                        });
                    } else {
                        res.send("success!");
                    }
                });

            });
        }
    });
});

routes.get("/reset/token/:t", function(req, res) {
    var tkn = req.params.t
    DB.collection('ResetLinks').findOne({ token: tkn }, function(err, resetObj) {
        if (err || !resetObj) {
            res.send("Link Not Found!"); // give 404
        } else if (resetObj.expire_time < Date.now()) {
            //delete resetObj from db
            res.send("Link Expired!");
        } else {
            res.render('new_pass', { usn: resetObj.usn });
        }
    });
});

routes.post("/pwd", function(req, res) {
    DB.collection('ResetLinks').remove({ usn: req.body.usn }, function(err, deletedRes) {
        if (err || deletedRes.result.n < 1) { res.send("Link Expired!"); } else {
            DB.collection('Users').findOneAndUpdate({ usn: req.body.usn }, { $set: { pwd: req.body.pwd } }, { returnOriginal: false }, function(err, result) {
                res.redirect("/");
            });
        }
    });
});

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