var db = require('../config/database');
var config = require('../config/general');
var md5 = require('md5');
var jwt = require('jsonwebtoken');
var common = require('../models/common');

module.exports.login = function(data, callback) {

    q = "SELECT * FROM team_members WHERE Email='" + data.Email + "' OR Phone='" + data.Phone + "'";
    db.query(q, function(err, result, fields) {
        if (err) return callback({
            "statuscode": "203",
            "status": "error",
            "msg": 'error in database',
            'err': err
        }, false);
        else {
            if (result.length == 1) {
                if (result[0].Password == data.Password) {
                    common.generateToken(result[0], function(err, token) {
                        if (err) {
                            return callback({
                                "returnMSG": "DBE",
                                "statuscode": "203",
                                "status": "error",
                                "msg": 'Error occured',
                                "err": err
                            }, false);
                        } else {
                            return callback(false, {
                                "returnMSG": "ULS",
                                "statuscode": "200",
                                "status": "success",
                                "msg": 'Logged in successfully',
                                "token": token
                            });
                        }
                    })
                } else {
                    return callback(false, {
                        "returnMSG": "ICP",
                        "statuscode": "200",
                        "status": "failure",
                        "msg": 'Incorrect Password'
                    });
                }

            } else {
                return callback({
                    "returnMSG": "UNF",
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'User not found'
                }, false);
            }
        }
    })
}