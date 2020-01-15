var express = require('express')
var routes = express.Router()
var mongoDB = require("mongodb")
var crypto = require("crypto");
var nodemailer = require("nodemailer");
const jsonfile = require("jsonfile");

const file = "games.json";
var url = "mongodb://localhost:27017"
//var url = 'mongodb+srv://admin:admin@quiz-corner-nt3rg.mongodb.net/test?retryWrites=true&w=majority';
var dbNAME = "quiz-corner-attainu"
var DB = ''
var serverSchema = {
    first: true,
    timer: 0
}
var gameData = {};
var curGameId = 0;

mongoDB.MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, function(err, server) {
    if (err) {
        console.log(err)
    } else {
        DB = server.db(dbNAME)
        DB.collection("server").findOne({}, function(err, result) {
            if (err) throw err;
            else if (!result) {
                DB.collection("server").insertOne(serverSchema, function(err, data) {});

                importDb();

            } else {
                DB.collection("games").find({}).toArray(function(err, result) {
                    if (err) throw err;
                    else if (result.length > 0) {
                        g_count = ++result.slice(-1)[0]._id;
                    }
                });
            }
        });
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

function importDb() {
    jsonfile.readFile(file, function(err, obj) {
        if (err) throw err;
        else {
            // defQues = obj;
            // console.log(obj);

            // gameSchema["questions"] = obj;
            // console.log(gameSchema.questions);

            DB.collection("games").insertMany(obj, { ordered: true }, function(err, gameRes) {
                if (err) throw err;
                // g_count = ++defGames.slice(-1)[0]._id;
                // console.log(gameRes);

                g_count = 2;
            });
        }
    });
}

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
            if (req.body.usn == result.usn && req.body.pwd == result.pwd) {
                req.session.user = result.usn
                check = false
                res.redirect('/profile')
            }
        }
    })
})

routes.get("/forgot", function(req, res) {
    res.render("forgot");
});

routes.post("/forgot", function(req, res) {

    DB.collection('Users').findOne({ $or: [{ email: req.body.field }, { usn: req.body.field }] }, function(err, userObj) {
        if (err || !userObj) {
            // res.redirect('/');
            res.status(400).end();
        } else {
            crypto.randomBytes(16, function(err, buffer) {
                var token = buffer.toString('hex');
                var expire = Date.now() + 1000 * 60 * 15;
                var mailOptions = {
                    from: '"Quiz Corner " <no-reply@quiz-corner.com',
                    to: userObj.email,
                    subject: "Reset Password",
                    text: 'Hello ' + userObj.usn + '! You have requested to reset your password. Click on the below link to reset your password.' + "\nhttp://localhost:4500/reset/token/" + token
                }

                transporter.sendMail(mailOptions, function(mailErr, info) {
                    if (mailErr) res.status(400).end();
                    else {
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
                                    if (err) {
                                        res.status(400).end();
                                    } else {
                                        res.status(200).end();
                                        // res.send('Message sent: ' + info.response);
                                    }
                                });
                            } else {
                                //todo check for err
                                res.status(200).end();
                                // res.send('Message sent: ' + info.response);
                            }
                        });
                    }
                })
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

routes.post("/getques", function(req, res) {
    var gameId = parseInt(req.body.gameId, 10);
    var quesId = parseInt(req.body.quesId) - 1;
    var answer = req.body.answer;
    if (Object.keys(gameData).length === 0 || curGameId !== gameId) {
        curGameId = gameId;
        DB.collection("games").findOne({ _id: gameId }, function(err, result) {
            if (result) {
                console.log("pinged DB");

                // console.log(gameId);
                // console.log(quesId);
                // console.log(result.questions[quesId]);

                gameData = result;
                var obj = result.questions[quesId];
                arr = [0, 1, 2, 3, 4];
                for (i = arr.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    arr[i] = arr.splice(j, 1, arr[i])[0];
                }
                var optArr = [obj.options[arr[0]], obj.options[arr[1]], obj.options[arr[2]]];
                j = Math.floor(Math.random() * 3);

                optArr.splice(j, 0, obj.answer);

                var finalQues = {
                    "number": obj.number,
                    "question": obj.question,
                    "options": optArr,
                    "answer": j,
                    "score": 0
                }

                res.json(finalQues);
            } else {
                throw err;
            }
        });
    } else {
        var obj = gameData.questions[quesId];
        arr = [0, 1, 2, 3, 4];
        for (i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            arr[i] = arr.splice(j, 1, arr[i])[0];
        }
        var optArr = [obj.options[arr[0]], obj.options[arr[1]], obj.options[arr[2]]];
        j = Math.floor(Math.random() * 3);

        optArr.splice(j, 0, obj.answer);

        var finalQues = {
            "number": obj.number,
            "question": obj.question,
            "options": optArr,
            "answer": j
        }
        res.json(finalQues);
    }
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
routes.get('/bond', function(req, res) {
    res.render('bond.hbs')
})
module.exports = routes