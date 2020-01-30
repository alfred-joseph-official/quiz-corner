var express = require('express')
var routes = express.Router()
var mongoDB = require("mongodb")
var crypto = require("crypto");
var nodemailer = require("nodemailer");
const jsonfile = require("jsonfile");
var fileupload = require('express-fileupload')
var cloudinary = require('cloudinary').v2;
routes.use(fileupload({ useTempFiles: true }))
cloudinary.config({
    cloud_name: 'codingamrit',
    api_key: '597849612625256',
    api_secret: '4rxarmWlvptpb3Y5z0U2mPpZjVg'
});
const file = "games.json";
//var mongoUrl = "mongodb://localhost:27017"
// var mongoUrl = "mongodb://localhost:27017"
var mongoUrl = process.env.MONGO_ATLAS;
var dbNAME = process.env.DB_NAME;
var DB = ''
var serverSchema = {
    first: true,
    timer: 0
}
var gameData = {};
var curGameId = 0;

mongoDB.MongoClient.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, function(err, server) {
    if (err) {
        // console.log(err)
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
        user: process.env.I_MAIL,
        pass: process.env.P_MAIL
    }
});

const dDP = "https://res.cloudinary.com/dpkcwayz1/image/upload/v1579527999/UserAssets/default/dp/default.png";

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

                g_count = 5;
            });
        }
    });
}

var genRandomString = function(length) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
};
var sha512 = function(password, salt) {
    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    var value = hash.digest('hex');
    return {
        slt: salt,
        pwd: value
    };
};

function saltHashPassword(userpassword) {
    var slt = genRandomString(16);
    var passwordData = sha512(userpassword, slt);
    return {
        slt: passwordData.slt,
        pwd: passwordData.pwd
    }
}

routes.post("/signupuser", function(req, res) {
    var pwdObj = saltHashPassword(req.body.pwd.trim());
    var data = {
        name: "",
        usn: req.body.usn.trim(),
        email: req.body.email.trim(),
        pwd: pwdObj.pwd,
        slt: pwdObj.slt,
        dp: dDP,
        age: "",
        verified: false,
        top_score: []
    }

    DB.collection('Users').findOne({ $or: [{ email: data.email }, { usn: data.usn }] }, function(err, userObj) {
        // console.log(userObj);
        if (userObj) {
            if (userObj.usn == data.usn) {
                res.status(409).send("Username Taken!");
            } else if (userObj.email == data.email) {
                res.status(409).send("Email Already Registered!");
            }
        } else {
            DB.collection('Users').insertOne(data, function(err, result) {
                req.session.user = data.usn
                var obj = {
                    'user': data.usn,
                    'loggedin': true,
                    'imglink': data.dp,
                    'ev': true
                };
                res.cookie('user', obj, { signed: true, maxAge: 1000 * 60 * 600 }).status(200).send('Success!');
            });
        }
    });
});


routes.post('/login', function(req, res) {
    DB.collection('Users').findOne({ $or: [{ email: req.body.usn }, { usn: req.body.usn }] }, function(err, result) {
        if (err) {

            res.redirect('/')
        } else if (result) {
            if (sha512(req.body.pwd.trim(), result.slt).pwd === result.pwd) {
                req.session.user = result.usn
                var obj = {
                    'user': result.usn,
                    'loggedin': true,
                    'imglink': result.dp,
                    'ev': result.verified
                };
                res.cookie('user', obj, { signed: true, maxAge: 1000 * 60 * 600 }).status(200).send('Success!');
            } else {
                //TODO validations
                res.status(401).send('Incorrect Email Id or Password!');
            }
        } else {
            //TODO Validations

            res.status(401).send('User Not Found!');
        }

    })

});

routes.get("/forgot", function(req, res) {
    res.render("forgot");
});

routes.post("/forgot", function(req, res) {

    DB.collection('Users').findOne({ $or: [{ email: req.body.field }, { usn: req.body.field }] }, function(err, userObj) {
        if (err || !userObj) {
            // res.redirect('/');
            res.status(404).send("User Not Found!");
        } else {
            crypto.randomBytes(16, function(err, buffer) {
                var token = buffer.toString('hex');
                var expire = Date.now() + 1000 * 60 * 15;
                var mailOptions = {
                    from: '"Quiz Corner " <no-reply@quiz-corner.com',
                    to: userObj.email,
                    subject: "Reset Password",
                    text: 'Hello ' + userObj.usn + '! You have requested to reset your password. Click on the below link to reset your password.\n' + process.env.DOMAIN + "reset/token/" + token
                }

                transporter.sendMail(mailOptions, function(mailErr, info) {
                    if (mailErr) res.status(500).send("Server Error!");
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
                                        res.status(500).send('Server Error!');
                                    } else {
                                        res.status(200).send("Reset Link Sent Successfully!");
                                        // res.send('Message sent: ' + info.response);
                                    }
                                });
                            } else {
                                //todo check for err
                                res.status(200).send("Reset Link Sent Successfully!");
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
            res.render('new_pass', { layout: 'no_ad', pp: false, usn: resetObj.usn });
        }
    });
});

routes.get("/verify/email/:t", function(req, res) {
    let tkn = req.params.t
    DB.collection('ResetLinks').findOne({ token: tkn }, function(err, resetObj) {
        if (err || !resetObj) {
            res.send("Link Not Found!"); // give 404
        } else if (resetObj.expire_time < Date.now()) {
            //delete resetObj from db
            res.send("Link Expired!");
        } else {
            res.render('new_pass', { layout: 'no_ad', pp: false, usn: resetObj.usn });
        }
    });
});

routes.get('/linkexpired', function(req, res) {
    res.render('expiredpage', {
        layout: 'no_ad',
        user: req.signedCookies['user']
    })
})

routes.post("/pwd", function(req, res) {

    var pass = saltHashPassword(req.body.pwd.trim());
    DB.collection('ResetLinks').remove({ usn: req.body.usn.trim() }, function(err, deletedRes) {
        if (err || deletedRes.result.n < 1) { res.redirect('/linkexpired'); } else {
            DB.collection('Users').update({ usn: req.body.usn.trim() }, { $set: { pwd: pass.pwd, slt: pass.slt } }, { upsert: true }, function(err, result) {
                res.status(200).send("Password Changed!");
            });
            // DB.collection('Users').findOneAndUpdate({ usn: req.body.usn.trim() }, { $set: { pwd: pass.pwd, slt: pass.slt } }, { returnOriginal: false }, function(err, result) {
            //     res.redirect("/");
            // });
        }
    });
});

routes.post('/gotogame', function(req, res) {
    if (req.body.game == 'Bond It') {
        res.redirect('game/?game_id=1')
    } else if (req.body.game == "Flag Up") {
        res.redirect('game/?game_id=2')
    } else if (req.body.game == "Iconic") {
        res.redirect('game/?game_id=3')
    } else if (req.body.game == "Colorista") {
        res.redirect('game/?game_id=4')
    } else {
        var referer = req.header('Referer')
        res.redirect(referer)
    }
})

routes.get('/', function(req, res) {
    // console.log(req.signedCookies);

    //Todo Render only homepage
    // if (req.session.user) {
    //     res.render('profile')
    // } else {
    if (req.session.user) {
        if (req.query.redirect) {
            res.render('homepage', {
                layout: "home_layout",
                user: req.signedCookies['user'],
                redir: true
            });
        } else res.render('homepage', {
            layout: "home_layout",
            user: req.signedCookies['user']
        });
    } else {
        if (req.query.redirect) {
            res.render('homepage', {
                layout: "home_layout",
                loginfailed: req.query.login,
                redir: true
            });
        } else res.render('homepage', {
            layout: "home_layout",
            loginfailed: req.query.login
        });

    }

})

routes.get('/logout', function(req, res) {
    req.session.destroy();
    res.cookie('user', "", { signed: true, maxAge: Date.now() });
    //Changes 14.01.2020 02:05 - AJ
    // res.render('homepage')
    res.redirect('/');
})

routes.post('/getgames', function(req, res) {
    DB.collection("games").find({}).toArray(function(err, result) {
        if (err) throw err;
        var array1 = []
        var obj = {}
        result.forEach(item => {
            obj['_id'] = item._id,
                obj['name'] = item.name,
                obj['info'] = item.description,
                obj['rules'] = item.rules,
                obj['images'] = item.images
            array1.push(obj)
            obj = {}
        });
        array1.sort(function(a, b) {
            return a._id - b._id;
        })
        res.json(array1)
    });
})

function checkRedirect(str) {
    //ceck if redirect is broken
    return str;
}
routes.use(function(req, res, next) {
    var redir;
    if (req.session.user && req.signedCookies)
        if (req.session.user === req.signedCookies['user'].user) next();
        else {
            // redir = '/'
            redir = '/?login=false&redirect="' + req.protocol + '://' + req.get('Host') + req.originalUrl + '"';
            redir = encodeURI(redir);
            res.cookie('user', "", { signed: true, maxAge: Date.now() });
            res.redirect(redir);
        }
    else {
        redir = '/?login=false&redirect=' + req.protocol + '://' + req.get('Host') + req.originalUrl;
        redir = encodeURI(redir);
        res.cookie('user', "", { signed: true, maxAge: Date.now() });
        res.redirect(redir);
    }
});

// routes.get('/home', function(req, res) {
//     res.render("homepage", {
//         user: req.signedCookies['user']
//     });
// });

function processData(result, flag) {
    for (let x = 0; x < result.questions.length; x++) {
        var obj = result.questions[x];
        var arr = obj.options;
        for (let i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            arr[i] = arr.splice(j, 1, arr[i])[0];
            if (flag) arr[i] = { option: arr[i], is_answer: false }
        }
        if (flag) obj.options.shift();
        result.questions[x].options = arr;
    }
    return result;
}

function randQuestionPool(result) {
    let i = result.questions.length
    let tempArr = [];
    let quesArr = [];
    let x = 0;
    while (x < 15) {
        var j = Math.floor(Math.random() * i);
        if (tempArr.includes(j)) {
            continue;
        }
        tempArr.push(j);
        quesArr.push(result.questions[j]);
        x++;
    }
    result.questions = quesArr;
    return result;
}

function fetchImgQuiz(gameId, req, res) {
    DB.collection("games").findOne({ _id: gameId }, function(err, result) {
        if (result) {
            // console.log("pinged DB 2");
            req.session.gameData = randQuestionPool(result);
            res.json(req.session.gameData);
        } else {
            throw err;
        }
    });
}

//1st user
routes.post("/getques", function(req, res) {
    var url = process.env.DOMAIN;
    var gameId = parseInt(req.body.gameId);
    if (gameId == 2 || gameId == 3) {
        fetchImgQuiz(gameId, req, res);
    } else
    // console.log(req.body.data);
    if (req.body.data) {
        var data = JSON.parse(req.body.data)
        var gameObj = data;
        crypto.randomBytes(16, function(err, buffer) {
            var token = buffer.toString('hex');
            gameObj["usn"] = req.session.user;
            gameObj["token"] = token;
            var newVal = { $set: { 'questions': gameObj.questions, 'token': token } }
            DB.collection("Knowme").update({ "usn": req.session.user }, newVal, { upsert: true }, function(err, result) {
                // console.log("pinged DB 1");
                if (err) {
                    res.status(400).end();
                } else {
                    res.status(200);
                    res.send(url + "uniq/" + "?game_id=1&t=" + token);
                }
            });
        });
        req.session.gameData = null;
    }
});

routes.post('/bond_get', function(req, res) {
    if (!req.session.gameData) {
        DB.collection("games").findOne({ _id: parseInt(req.body.gameId) }, function(err, result) {
            if (result) {
                // console.log("pinged DB 2");
                req.session.gameData = processData(result, true);
                res.json(req.session.gameData);
            } else {
                res.status(500).end();
            }
        });
    } else {
        res.json(processData(req.session.gameData, false));
    }
});

routes.post('/bond_post', function(req, res) {
    url = process.env.DOMAIN;
    var data = JSON.parse(req.body.data)
    var gameObj = data;
    crypto.randomBytes(16, function(err, buffer) {
        var token = buffer.toString('hex');
        gameObj["usn"] = req.session.user;
        gameObj["token"] = token;
        gameObj['list'] = [];
        var newVal = { $set: { 'questions': gameObj.questions, 'token': token, 'list': gameObj.list } }
        DB.collection("Knowme").update({ "usn": req.session.user }, newVal, { upsert: true }, function(err, result) {
            // console.log("pinged DB 1");
            if (err) {
                res.status(400).end();
            } else {
                res.status(200);
                res.send(url + "uniq/" + "?game_id=1&t=" + token);
            }
            req.session.gameData = null;
        });
    });
})

// routes.post("/getques", function(req, res) {
//     var gameId = parseInt(req.body.gameId, 10);
//     var quesId = parseInt(req.body.quesId) - 1;
//     var answer = req.body.answer;
//     if (Object.keys(gameData).length === 0 || curGameId !== gameId) {
//         curGameId = gameId;
//         DB.collection("games").findOne({ _id: gameId }, function(err, result) {
//             if (result) {
//                 console.log("pinged DB");

//                 // console.log(gameId);
//                 // console.log(quesId);
//                 // console.log(result.questions[quesId]);

//                 gameData = result;
//                 var obj = result.questions[quesId];
//                 arr = [0, 1, 2, 3, 4];
//                 for (i = arr.length - 1; i > 0; i--) {
//                     var j = Math.floor(Math.random() * (i + 1));
//                     arr[i] = arr.splice(j, 1, arr[i])[0];
//                 }
//                 var optArr = [obj.options[arr[0]], obj.options[arr[1]], obj.options[arr[2]]];
//                 j = Math.floor(Math.random() * 3);

//                 optArr.splice(j, 0, obj.answer);

//                 var finalQues = {
//                     "number": obj.number,
//                     "question": obj.question,
//                     "options": optArr,
//                     "answer": j,
//                     "score": 0
//                 }

//                 res.json(finalQues);
//             } else {
//                 throw err;
//             }
//         });
//     } else {
//         var obj = gameData.questions[quesId];
//         arr = [0, 1, 2, 3, 4];
//         for (i = arr.length - 1; i > 0; i--) {
//             var j = Math.floor(Math.random() * (i + 1));
//             arr[i] = arr.splice(j, 1, arr[i])[0];
//         }
//         var optArr = [obj.options[arr[0]], obj.options[arr[1]], obj.options[arr[2]]];
//         j = Math.floor(Math.random() * 3);

//         optArr.splice(j, 0, obj.answer);

//         var finalQues = {
//             "number": obj.number,
//             "question": obj.question,
//             "options": optArr,
//             "answer": j
//         }
//         res.json(finalQues);
//     }
// });

routes.get("/uniq", function(req, res) {
    let cPFlag = true;
    if (req.query.game_id) {
        if (req.query.t) {
            DB.collection('Knowme').findOne({ token: req.query.t }, function(err, result) {
                if (err || result == null) res.render("404", {
                    layout: 'no_ad',
                    user: req.signedCookies['user']
                });
                // else if(result == null)
                // console.log(req.session.user);
                // console.log((result.usn));
                else if (req.session.user != result.usn) {
                    result.list.forEach(function(item) {
                        if (item.usn == req.session.user) {
                            cPFlag = false;
                        }
                    });
                    if (cPFlag) {
                        delete result.list;
                        result['player'] = true;
                        req.session.gameData = result;
                        res.render("bond_it", {
                            user: req.signedCookies['user'],
                            secondUser: true,
                            gamestart: true,
                            op: result.usn,
                            gameId: parseInt(req.query.game_id)
                        });
                    } else {
                        //TODO RENDER CANT PLAY! YOU've ALREADY PLAYED THIS GAME! // LeaderBoardPage
                        res.render('leaderboard', {
                            user: req.signedCookies['user'],
                            top: result.list,
                            lb: true,
                            op: false
                        });
                    }
                } else {
                    res.render('leaderboard', {
                        user: req.signedCookies['user'],
                        top: result.list,
                        lb: (result.list.length > 0) ? true : false,
                        op: true
                    });
                }
            });
        } else {
            res.redirect('/game');
        }
    }
});
//Original
// routes.get('/game', function(req, res) {
//     res.render('gamepage', {
//         user: req.signedCookies['user'],
//         page: true
//     })
// })
// routes.get('/game', function(req, res) {
//     res.render('game_main', {
//         title: 'game_main',
//         layout: 'gameintro',
//         user: req.signedCookies['user'],
//     })
// });
routes.get('/game', function(req, res) {
    let gameId, img;
    switch (parseInt(req.query.game_id)) {
        case 1:
            gameId = 1;
            img = "/img/Bondit.jpeg"
            break;
        case 2:
            gameId = 2;
            img = "/img/Flagup.jpeg"
            break;
        case 3:
            gameId = 3;
            img = "/img/Iconic.jpeg"
            break;
        case 4:
            gameId = 4;
            img = "/img/Colorista.jpeg"
            break;
        default:
            gameId = 1;
            img = "/img/Bondit.jpeg"
            break;
    }

    // req.session.gameData = null;
    delete req.session.gameData;
    res.render('gameintro', {
        user: req.signedCookies['user'],
        gameId: gameId,
        img: img
    })
});

//Original
// routes.get('/gamestart', function(req, res) {
//     res.render('gamepage', {
//         user: req.signedCookies['user'],
//         gamestart: true,
//         sessionuser: req.session.user,

//     })
// })
routes.get('/gamestart', function(req, res) {
    switch (parseInt(req.query.game_id)) {
        case 1:
            res.render('bond_it', {
                user: req.signedCookies['user'],
                // bndQ: true
                gameId: req.query.game_id

            });
            break;
        case 2:
            res.render('img_quiz', {
                user: req.signedCookies['user'],
                ques: "Which Country Flag Is This ?",
                // imgQ: true,
                gameId: req.query.game_id
            });
            break;
        case 3:
            res.render('img_quiz', {
                user: req.signedCookies['user'],
                ques: "Can You Identify The Logo?",
                // imgQ: true,
                gameId: req.query.game_id
            });
            break;
        case 4:
            res.render('colorista', {
                user: req.signedCookies['user'],
                // clr: true,
                gameId: req.query.game_id
            });
            break;
        default:
            res.render('bond_it', {
                user: req.signedCookies['user'],
                // bndQ: true
                gameId: req.query.game_id
            });
            break;
    }
});

routes.get('/result', function(req, res) {
    res.render('gamepage', {
        user: req.signedCookies['user'],
        result: true
    })
})

routes.post('/result', function(req, res) {
    var body = req.body;
    switch (parseInt(body.gameId)) {
        case 1:
            bondUpdate(req, res, body.player);
            break;
        case 2:
        case 3:
        case 4:
            updateScore(req, res, 1);
            break;
        default:
            break;
    }
});

routes.get('/leaderboard', function(req, res) {
    res.render('leaderboard', {
        layout: 'nod_ad',
        top: result,
        user: req.signedCookies['user']
    });
})

function bondUpdate(req, res, upFlag) {
    let token = req.body.token;
    DB.collection('Knowme').findOne({ 'token': token }, function(err, result) {
        if (err) res.status(500).end();
        else {
            let tr = [];
            var upObj = {};
            if (upFlag) {
                tr.push({
                    usn: req.session.user,
                    score: parseInt(req.body.score)
                });
            }

            if (result != null || result.list.length > 0) {
                tr.push(...result.list);
                tr.sort(function(a, b) {
                    return b.score - a.score;
                });
            }
            upObj = { $set: { 'list': tr } };
            res.json(tr);
            if (upFlag) DB.collection('Knowme').updateOne({ 'token': token }, upObj, { upsert: true }, function(err, result) { upFlag = false });
        }
    });
}

function updateScore(req, res, lowestScore) {
    let upFlag = false;
    DB.collection('Tops').findOne({ _id: req.body.gameId }, function(err, result) {
        if (err) res.status(500).end();
        else {
            let tr = [];
            let temp = {};
            var upObj = {};
            let newScoreFlag = false;
            if (parseInt(req.body.score) >= lowestScore) {
                temp = {
                    usn: req.session.user,
                    score: parseInt(req.body.score)
                }
                newScoreFlag = true
            }

            if (result != null) {
                if (temp != null) {
                    result.list.forEach(function(item) {
                        if (temp.usn == item.usn) {
                            if (temp.score > item.score) {
                                tr.push(temp);
                                upFlag = true;
                            } else tr.push(item);
                            newScoreFlag = false;
                        } else {
                            tr.push(item);
                        }
                    });
                    if (newScoreFlag) {
                        tr.push(temp);
                        upFlag = true;
                    }
                } else {
                    tr.push(...result.list);
                }
                tr.sort(function(a, b) {
                    return b.score - a.score;
                });
                if (tr.length > 10) tr.pop();
            } else {
                tr.push(temp);
            }
            upObj = { $set: { 'list': tr } };
            res.json(tr);

            if (upFlag) DB.collection('Tops').updateOne({ '_id': req.body.gameId }, upObj, { upsert: true }, function(err, result) { upFlag = false });
        }
    });
}

routes.get("/profile", function(req, res) {
    var imgsrc = ''
    if (req.session.user) {
        DB.collection('Users').findOne({ usn: req.session.user }, function(err, result) {
            if (err) {
                res.redirect('/')
            } else {
                var obj = {
                    'user': result.usn,
                    'loggedin': true,
                    'imglink': result.dp,
                    'ev': result.verified
                };
                res.cookie('user', obj, { signed: true, maxAge: 1000 * 60 * 600 });
                //console.log(result)
                // console.log(req.session.user)
                res.render('profile', {
                    layout: "no_ad",
                    pp: true,
                    user: obj,
                    name: result.name,
                    password: '*****',
                    email: result.email,
                    age: result.age,
                    gender: result.gender,
                    sessionuser: req.session.user,
                    imglink: result.dp,
                    ev: result.verified
                })
            }
        })
    } else {

        res.redirect('/')
    }

    //this all will be dynamically called from database for test purpose i have manually input the data

})


routes.get('/uuid', function(req, res) {
    crypto.randomBytes(16, function(err, buffer) {
            var token = buffer.toString('hex');
            res.send(token);
        }
        // DB.collection('HWDYNM').insertOne(gameObj, function(err, result){

        // });
    );
});
routes.post("/updateprofile", function(req, res) {

    if (req.files) {
        var dp = req.files.profilepic
        var pid = req.session.user


        cloudinary.uploader.upload(dp.tempFilePath, { public_id: pid, overwrite: true }, function(err, result) {
            if (!err) {

                //console.log(result)
                DB.collection('Users').findOneAndUpdate({ "usn": req.session.user }, { $set: { "dp": result.url } }, function(err, result) {
                    if (!err) {
                        res.redirect('/profile')

                    }
                })
            }


        })


    }
    if (req.body.name) {
        let text = req.body.name;
        text = text.toLowerCase()
            .split(' ')
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ');
        //console.log(req.body.name)
        DB.collection('Users').findOneAndUpdate({ "usn": req.session.user }, { $set: { "name": text } }, function(err, result) {
            if (!err) {
                res.redirect('/profile')
            }
        })
    }
    if (req.body.age) {
        //console.log(req.body.name)
        DB.collection('Users').findOneAndUpdate({ "usn": req.session.user }, { $set: { "age": req.body.age } }, function(err, result) {
            if (!err) {
                res.redirect('/profile')
            }
        })
    }
    if (req.body.gender) {
        //console.log(req.body.name)
        DB.collection('Users').findOneAndUpdate({ "usn": req.session.user }, { $set: { "gender": req.body.gender } }, function(err, result) {
            if (!err) {
                res.redirect('/profile')
            }
        })
    }
    if (req.body.pwd) {
        var pwdObj = saltHashPassword(req.body.pwd.trim());
        //console.log(req.body.name)
        DB.collection('Users').findOneAndUpdate({ "usn": req.session.user }, { $set: { "pwd": pwdObj.pwd, "slt": pwdObj.slt } }, function(err, result) {
            if (err) {
                //res.redirect('/')
                console.log(err)
            } else {

                res.redirect('/profile')
            }
        })
    }
    if (req.body.email) {
        //console.log(req.body.name)
        DB.collection('Users').findOneAndUpdate({ "usn": req.session.user }, { $set: { "email": req.body.email } }, function(err, result) {
            if (err) {
                //res.redirect('/')
                console.log(err)
            } else {

                res.redirect('/profile')
            }
        })
    }
})
routes.get('/bond', function(req, res) {
    res.render('bond.hbs')
})

routes.get('*', function(req, res) {
    res.render("404", {
        layout: 'no_ad',
        user: req.signedCookies['user']
    });
});
routes.get('/autocomplete', function(req, res) {
    //var result=['Quiz','Snake','Ludo']
    // DB.collection('Games').find({title:{$regex:new RegExp(req.query["term"]),$options:'i'}},function(err,data)
    DB.collection('games').find({ "name": { $regex: new RegExp(req.query["term"]), $options: 'i' } }).toArray(function(err, data) {
            if (!err) {
                // console.log(data)
                var result = []


                for (var i = 0; i < data.length; i++) {
                    result.push(data[i].name)
                }


                res.json(result)

            } else {
                console.log(err)
            }
        })
        // res.json(result)
})

module.exports = routes