var express = require("express");
var https = require('https')
var http = require('http')
var hbs = require("hbs");
var bodyParser = require("body-parser");
var fs = require('fs');
var MongoClient = require("mongodb").MongoClient;
const shortid = require('shortid');
const jsonfile = require("jsonfile");

const file = "games.json";
var defQues = [];

// This line is from the Node.js HTTPS documentation.
var options = {
    key: fs.readFileSync('test/fixtures/keys/client-key.pem'),
    cert: fs.readFileSync('test/fixtures/keys/client-cert.cert')
};

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("view engine", "hbs");

app.use(express.static("public"));

/////////////////////////////////////////////////////MONGO/////////////////////////////////////////////

// var gameSchema = {
//     _id : "",
//     name: "",
//     description: "",
//     rules: "",
//     images: [],
//     questions: defQues,
//     topten: []
// }    SCHEMA! ENABLE WHEN OTHERS ARE DONE

// var gameSchema = [{
//     _id: 1,
//     name: "Game Name",
//     description: "Proident eu reprehenderit aliquip non et eu eiusmod ipsum ea elit dolore non. Reprehenderit aliquip consectetur ipsum laboris in nulla ex eiusmod qui ea. Ad irure velit mollit velit fugiat eiusmod consectetur culpa pariatur adipisicing dolor nostrud ipsum eu. Proident aliqua deserunt consectetur laboris esse est sunt excepteur nostrud. Excepteur tempor velit velit tempor consectetur proident dolor elit voluptate id.",
//     rules: "Aute eiusmod exercitation do dolore fugiat officia. Eiusmod minim ad consequat nisi nulla reprehenderit nulla.<br/>Fugiat sint irure irure elit deserunt ea culpa labore ut voluptate anim aliquip. Qui sunt qui proident ea ea cupidatat culpa non minim enim sit do esse.<br/>Dolor id commodo mollit reprehenderit cupidatat fugiat. Enim elit fugiat culpa voluptate ea ullamco quis ad dolor.<br/>Dolore quis qui sit elit. Irure commodo tempor Lorem quis labore dolor officia magna elit magna deserunt commodo. Nisi Lorem nostrud laborum nostrud nulla nisi dolor. Irure duis esse dolor consequat cupidatat incididunt cupidatat ut irure laborum consectetur enim.<br/>Ex dolor consequat elit culpa deserunt. Magna magna commodo eu elit deserunt id magna duis mollit aliqua esse magna esse. Esse sit aliqua ipsum nulla amet ex irure. Nulla sunt labore reprehenderit anim quis aute eiusmod deserunt exercitation elit. Commodo reprehenderit occaecat elit eiusmod incididunt dolor tempor incididunt excepteur nulla in. Consequat exercitation voluptate cillum cupidatat anim adipisicing laboris aute. Esse occaecat consectetur id elit incididunt dolore aute reprehenderit.",
//     images: ["", ""],
//     topten: [-1]
// }]

var userSchema = {
    _id: "",
    ign: "",
    name: "",
    email: "",
    pwd: "",
    dp: "",
    age: "",
    fbId: "",
    scores: []
}

const mongoUrl = "mongodb://localhost:27017/";
const dbName = "quiz-corner";
var g_count = 1;
const userDb = "users";
const gameDb = "games";
const serverDb = "server";
var serverSchema = {
    first: true,
    timer: 0
}

var DB, usersCol, gamesCol, serverCol;

function importDb() {
    jsonfile.readFile(file, function(err, obj) {
        if (err) throw err;
        else {
            // defQues = obj;
            // console.log(obj);

            // gameSchema["questions"] = obj;
            // console.log(gameSchema.questions);

            gamesCol.insertMany(obj, { ordered: true }, function(err, gameRes) {
                if (err) throw err;
                // g_count = ++defGames.slice(-1)[0]._id;
                // console.log(gameRes);

                g_count = 2;
            });
        }
    });
}
MongoClient.connect(mongoUrl, function(err, client) {
    if (err) throw err;
    DB = client.db(dbName);
    usersCol = DB.collection("users");
    gamesCol = DB.collection("games");
    serverCol = DB.collection("server");
    serverCol.findOne({}, function(err, result) {
        if (err) throw err;
        else if (!result) {
            serverCol.insertOne(serverSchema, function(err, data) {
                //inserted
            });

            importDb();

        } else {
            gamesCol.find({}).toArray(function(err, result) {
                if (err) throw err;
                else if (result.length > 0) {
                    g_count = ++result.slice(-1)[0]._id;
                }
            });
        }
    });
});

app.get("/", function(req, res) {
    res.redirect("/shortid");
});

app.get("/shortid", function(req, res) {
    if (req.query.flag) {
        console.log(true);

        res.json(shortid.generate());
    } else {
        console.log(false);

        res.render("index");
    }
});

app.get("/getques", function(req, res) {
    var gameId = parseInt(req.query.id, 10);
    var quesId = parseInt(req.query.ques) - 1;
    gamesCol.findOne({ _id: gameId }, function(req, result) {
        if (result) {
            var obj = result.questions[quesId];
            arr = [0, 1, 2, 3, 4];
            for (i = arr.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                arr[i] = arr.splice(j, 1, arr[i])[0];
            }

            var finalQues = {
                "_id": obj._id,
                "number": obj.number,
                "question": obj.question,
                "options": [obj.options[arr[0]], obj.options[arr[1]], obj.options[arr[2]]],
                "answer": obj.answer
            }

            res.json(finalQues);
        } else {
            throw err;
        }
    });
})

// app.use(express.static("public"));

http.createServer(app).listen(5001);
https.createServer(options, app).listen(5000);