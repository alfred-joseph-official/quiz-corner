var express = require('express')
var routes = express.Router()
var mongoDB = require("mongodb")
var crypto = require("crypto");
var nodemailer = require("nodemailer");
const jsonfile = require("jsonfile");
var fileupload = require('express-fileupload')
var cloudinary = require('cloudinary').v2;
routes.use(fileupload({useTempFiles:true}))
cloudinary.config({ 
    cloud_name: 'codingamrit', 
    api_key: '597849612625256', 
    api_secret: '4rxarmWlvptpb3Y5z0U2mPpZjVg' 
  });
const file = "games.json";
//var url = "mongodb://localhost:27017"
// var url = "mongodb://localhost:27017"
var url = 'mongodb+srv://admin:admin@quiz-corner-nt3rg.mongodb.net/test?retryWrites=true&w=majority';
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
        usn: req.body.usn,
        email: req.body.email,
        pwd: pwdObj.pwd,
        slt: pwdObj.slt,
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
            if (sha512(req.body.pwd.trim(), result.slt).pwd === result.pwd) {
                req.session.user = result.usn
                res.render("homepage", {
                    loggedin: true , imglink:result.dp
                });
            } else {
                res.render('homepage');
            }
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

routes.get('/', function(req, res) {
        //Todo Render only homepage
        // if (req.session.user) {
        //     res.render('profile')
        // } else {
        res.render('homepage')
            // }

    })
    // routes.use(function(req, res, next) {
    //     if (req.session.user) next();
    //     else res.send("Please Login");
    // });

routes.get('/home', function(req, res) {
    res.render("homepage");
});

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
//1st user
routes.post("/getques", function(req, res) {
    var url = "http://localhost:4500/";
    var gameId = parseInt(req.body.gameId);
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
    } else if (!req.session.gameData) {
        DB.collection("games").findOne({ _id: gameId }, function(err, result) {
            if (result) {
                // console.log("pinged DB 2");
                req.session.gameData = processData(result, true);
                res.json(req.session.gameData);
            } else {
                throw err;
            }
        });
    } else {
        res.json(processData(req.session.gameData, false));
    }
});

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
    if (req.query.game_id) {
        if (req.query.t) {
            DB.collection('Knowme').findOne({ token: req.query.t }, function(err, result) {
                if (err) res.status(400).end();
                // console.log(result);
                result['player'] = true;
                req.session.gameData = result;
                res.render("gamepage", {
                    secondUser: true,
                    gamestart: true,
                    sessionuser: req.session.user,
                });
            });
        } else {
            res.redirect('/game');
        }
    }
});

routes.get('/game', function(req, res) {
    res.render('gamepage', {
        page: true
    })
})

routes.get('/gamestart', function(req, res) {
    res.render('gamepage', {
        gamestart: true,
        sessionuser: req.session.user,

    })
})

routes.get('/result', function(req, res) {
    res.render('gamepage', {
        result: true
    })
})

// routes.post('/result', function(req, res) {
//     var usn = req.session.user;
//     var newVal = { $set: { scores: [{ usn: usn, score: req.body.score }] } };
//     DB.collection('Knowme').findOneAndUpdate({ token: req.body.token }, )
//     res.render('gamepage', {
//         result: true
//     });
// })

routes.get("/profile", function(req, res) {
    var imgsrc = ''
    if (req.session.user) {
        DB.collection('Users').findOne({ usn: req.session.user }, function(err, result) {
            if (err) {
                res.redirect('/')
                console.log("hi")
            } else {
                //console.log(result)
               // console.log(req.session.user)
                res.render("profile", { name: result.name, password: '*****', phone: '12345678', address: 'city', email: result.email,age:result.age, birthday: '00/00/00', gender: result.gender, sessionuser: req.session.user,imglink:result.dp})
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
    var pass = req.body.pass;
    var user = req.session.user   
   
   if(req.files)
   {
       var dp = req.files.profilepic
       var pid = req.session.user
       
       cloudinary.uploader.destroy(pid,function(err,result){
          if(!err)
          {
            cloudinary.uploader.upload(dp.tempFilePath,{public_id:pid},function(err,result)
            {
             if(!err)
             {
                 //console.log(result)
                 DB.collection('Users').findOneAndUpdate({ "usn": req.session.user }, { $set: { "dp": result.url } }, function(err, result) {
                     if (err) {
                         //res.redirect('/')
                         console.log(err)
                     } else {
                         
                         res.redirect('/profile')
                     }
                 })
             }
             else{
                 console.log(err)
             }
               
            })
          }
       })
       
   }
   if(req.body.name)
   {
       //console.log(req.body.name)
       DB.collection('Users').findOneAndUpdate({ "usn": req.session.user }, { $set: { "name": req.body.name } }, function(err, result) {
        if (err) {
            //res.redirect('/')
            console.log(err)
        } else {
           
            res.redirect('/profile')
        }
    })
   }
   if(req.body.age)
   {
       //console.log(req.body.name)
       DB.collection('Users').findOneAndUpdate({ "usn": req.session.user }, { $set: { "age": req.body.age } }, function(err, result) {
        if (err) {
            //res.redirect('/')
            console.log(err)
        } else {
          
            res.redirect('/profile')
        }
    })
   }
   if(req.body.gender)
   {
       //console.log(req.body.name)
       DB.collection('Users').findOneAndUpdate({ "usn": req.session.user }, { $set: { "gender": req.body.gender } }, function(err, result) {
        if (err) {
            //res.redirect('/')
            console.log(err)
        } else {
           
            res.redirect('/profile')
        }
    })
   }
   if(req.body.pwd)
   {
    var pwdObj = saltHashPassword(req.body.pwd.trim());
       //console.log(req.body.name)
       DB.collection('Users').findOneAndUpdate({ "usn": req.session.user }, { $set: { "pwd":pwdObj.pwd,"slt":pwdObj.slt } }, function(err, result) {
        if (err) {
            //res.redirect('/')
            console.log(err)
        } else {
           
            res.redirect('/profile')
        }
    })
   }
   if(req.body.email)
   {
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