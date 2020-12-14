var _conf = require('../config/general');
// var db = require('../config/database');
var jwt = require('jsonwebtoken');
var db = require('../config/database').db3;
var fs = require('fs');

module.exports.generateToken = (data, callback) => {
    data = data == undefined ? '' : data;
    jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * _conf.token_expiresIn.expiresIn),
        data: data
    }, _conf.secretKey, function(err, token) {
        // console.log(token);
        if (err) return callback(err, token);
        else return callback(err, token);
    });
}
module.exports.checkToken = (req, res, next) => {
    var token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    if (token) {
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }
        jwt.verify(token, _conf.secretKey, (err, decoded) => {
            if (err) {
                return res.json({
                    "statuscode": "203",
                    "status": 'failed',
                    "msg": 'Token is not valid',
                    "error": err
                });
            } else {
                jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + (60 * _conf.token_expiresIn.expiresIn),
                    data: decoded.data
                }, _conf.secretKey, function(err, token) {
                    req.decoded = decoded;
                    next(decoded.data, token);
                    // if (err) return callback(err, token);
                    // else return callback(err, token);
                });

            }
        });
    } else {
        return res.json({
            "statuscode": "203",
            "status": 'failed',
            "msg": 'Auth token is not supplied'
        });
    }
};
module.exports.deleteFile = (file, callback) => {
    if (fs.existsSync(file)) {
        fs.unlink(file, function(err) {
            if (err) return callback('ERROR');
            else return callback('DONE');
        })
    } else return callback('FNF');
}
module.exports.renameFile = (data, callback) => {
    var file = data.files[0].originalname.split('.');
    file = data.files[0].filename + '.' + file[file.length - 1];
    file = data.destination + file;
    fs.rename(data.files[0].path, 'images/' + file, function(err) {
        if (err) return callback("RNE");
        else return callback(file);
    })
}
module.exports.updateFile = (data, callback) => {
    q = 'SELECT ' + data.field + ' FROM ' + data.table + ' WHERE ' + data.condition;
    db.query(q, function(err, result, fields) {
        if (err) return callback({ status: 'DBE', file: '' });
        else {
            if (result.length < 1) {
                return callback({ status: 'DNF', file: '' });
            } else {
                var file = data.files[0].originalname.split('.');
                file = data.files[0].filename + '.' + file[file.length - 1];
                file = data.destination + file;
                fs.rename(data.files[0].path, 'images/' + file, function(err) {
                    if (err) return callback({ status: "RNE", file: '' });

                    if (result[0][data.field] != '') {
                        if (fs.existsSync("./images/" + result[0][data.field])) {
                            fs.unlink("./images/" + result[0][data.field], function(err) {
                                if (err) return callback({ status: 'FRE', file: '' });
                                q = 'UPDATE ' + data.table + ' SET ' + data.field + ' = "' + file + '" WHERE ' + data.condition;
                                db.query(q, function(err, result, fields) {
                                    if (err) return callback({ status: 'UDE', file: '' });
                                    else return callback({ status: 'DONE', file: file });
                                })
                            })
                        } else {
                            q = 'UPDATE ' + data.table + ' SET ' + data.field + ' = "' + file + '" WHERE ' + data.condition;
                            db.query(q, function(err, result, fields) {
                                if (err) return callback({ status: 'UDE', file: '' });
                                else return callback({ status: 'DONE', file: file });
                            })
                            // return callback('FNF');
                        }
                    } else {
                        q = 'UPDATE ' + data.table + ' SET ' + data.field + ' = "' + file + '" WHERE ' + data.condition;
                        db.query(q, function(err, result, fields) {
                            if (err) return callback({ status: 'UDE', file: '' });
                            else return callback({ status: 'DONE', file: file });
                        })
                        // return callback('FNE');
                    }
                })
            }
        }
    });
}
module.exports.isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
}

module.exports.sendMail = (w, data, callback) => {
    switch (w) {
        case 'invite_member':
            var customMsg = "<div style='padding:5px;'><h3>Hi ... " + data.Name + " has sent you the Invitation to join Objective Done </h3> <p>"+data.message+"</p>" +
                "<br><a href=" + data.link + "><button>Click Here</button></a></div>";
            var mailOptions = {
                from: 'noreply@objectivedone.com',
                to: data.emails,
                subject: 'Invitation to join Objective done',
                html: customMsg
            };

            _conf.mail_transporter.sendMail(mailOptions, function(err, info) {
                //console.log(err, info);
                if (err) return callback({ "statuscode": "203", "status": "failed", "msg": "Invitation sending failed", "error": err });
                else {
                    return callback({ "statuscode": "200", "status": "success", "msg": "Invitation sent successfully" });
                }
            })

            break;
        case 'registered':
            var customMsg = "<div style='padding:5px;'><h3>Hi ... " + data.Name + ", You are registered with Objective Done successfully </h3>";
                // "<br><a href=" + data.Url + "><button>Click Here</button></a></div>";
            var mailOptions = {
                from: 'noreply@objectivedone.com',
                to: data.Email,
                subject: 'Registration successfull',
                html: customMsg
            };
            _conf.mail_transporter.sendMail(mailOptions, function(err, info) {
                //console.log(err, info);
                if (err) return callback(0);
                else {
                    return callback(1);
                }
            })
            break;
    }
}

var getSequenceData = (ids, callback) => {
    var q = 'SELECT * FROM sequence_data WHERE Id IN (' + ids + ')';
    db.query(q, function(err, result, fields) {
        if (err) return callback([]);
        else return callback(result);
    })
}
module.exports.getSequenceData;
module.exports.getSequences = (ids, callback) => {

    if (ids.length < 1) {
        return callback(false);
    }

    var q = 'SELECT * FROM sequences WHERE Id IN (' + ids.join(',') + ')';
    db.query(q, function(err, result, fields) {

        if (err) return callback(false);
        else {

            var data = result;
            var i = 0;

            function getnextD() {
                getSequenceData(result[i].SequenceDataId, (d) => {
                    data[i]['sequenceData'] = d;
                    i++;
                    if (i < result.length)
                        getnextD();
                    else {
                        return callback(data);
                    }
                })
            }
            if (i < result.length)
                getnextD();
            else {
                return callback(data);
            }
            // console.log(result)
        }
    })
}
module.exports.validateEmail = (email) => {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
module.exports.sendPushNotification = (userToken, data) => {
    var message = {
        to: userToken,
        collapse_key: 'your_collapse_key',

        notification: data,

        data: { //you can send only notification or only data(or include both)
            my_key: 'my value',
            my_another_key: 'my another value'
        }
    };

    _conf.fcm.send(message, function(err, response) {
        if (err) {
            console.log("Something has gone wrong!", err);
        } else {
            console.log("Successfully sent with response: ", response);
        }
        // {
        //     title: 'Hii Virendra',
        //     body: { msg: 'How are you', data: {} }
        // }
    });
}