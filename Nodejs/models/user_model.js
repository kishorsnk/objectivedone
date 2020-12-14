var db = require('../config/database');
var config = require('../config/general');
var md5 = require('md5');
var jwt = require('jsonwebtoken');
var common = require('../models/common');
// const SendOtp = require('sendotp');
var dateFormat = require('dateformat');
var companyId = '';
module.exports.signUp = function(data, callback) {
    console.log(data);
    var tbl = 'users';
    //tbl = data.Role == '1' ? 'users' : 'members';
    q = 'SELECT * FROM '+ tbl +' WHERE Phone="' + data.Phone + '" OR Email="' + data.Email + '"';
    db.query(q, data, function(err, result, fields) {
        if (err) {
            return callback({
                "returnMSG": "DBE",
                "statuscode": "203",
                "status": "error",
                "msg": 'Something went wrong try again',
                "err": err
            });
        } else if (result.length < 1) {
            if(data.Role == 1){
                q = "INSERT INTO `company` (`Name`, `Address`, `TIN`, `Phone`, `Email`, `NumberOfUsers`, `FieldOfExpertise`, `CreatedDate`) VALUES ('"+data.Name+"','"+data.Address+"', '"+data.TIN+"', '"+data.Phone+"', '"+data.Email+"', '"+data.NumberOfUsers+"', '"+data.FieldOfExpertise+"', '"+ dateFormat(new Date(), 'yyyy-mm-dd 00:00:00') +"')";
                
                db.query(q, data, function(err, result, fields) {
                    if (err) {
                        return callback({
                            "returnMSG": "DBE",
                            "statuscode": "203",
                            "status": "error",
                            "msg": 'Something went wrong try again',
                            "err": err
                        });
                    } else {
                        q = 'SELECT * FROM company WHERE Phone="' + data.Phone + '" OR Email="' + data.Email + '"';
                        db.query(q, data, function(err, result, fields) {
                            //common.generateToken(result[0], function(err, token) {
                            companyId = result[0].id;
                                if (data.Role == 1) {
                                    q = "INSERT INTO `users` (`CompanyId`, `UserTypeId`, `UserName`, `Email`, `Password`, `JobPosition`, `Phone`, `IsActive`, `CreatedDate`) VALUES ('"+result[0].id+"',1,'"+data.Name+"','"+data.Email+"', '"+data.Password+"', '"+data.JobPosition+"', '"+data.Phone+"', 1, '"+ dateFormat(new Date(), "yyyy-mm-dd 00:00:00") +"')";
                                    db.query(q, data, function(err, result, fields) {
                                        if (err) {
                                            return callback({
                                                "returnMSG": "DBE",
                                                "statuscode": "203",
                                                "status": "error",
                                                "msg": 'Something went wrong try again',
                                                "err": err
                                            });
                                        } else {
                                            //common.generateToken(result[0], function(err, token) {
                                                
                                                if (data.Role == 1) {  
                                                    q = "INSERT INTO `team` (`CompanyId`, `UserId`, `TeamName`, `IsActive`, `CreatedDate`) VALUES ('"+companyId+"','"+result.insertId+"','Default Team',1,'"+ dateFormat(new Date(), "yyyy-mm-dd 00:00:00") +"')";                                                    
                                                    db.query(q, data, function(err, result, fields) {
                                                    //db.query(q, data, function(err, result, fields) {
                                                        common.sendMail('registered', data, (d) => {
                                                            
                                                            return callback({
                                                                "returnMSG": "URS",
                                                                "statuscode": "200",
                                                                "status": "success",
                                                                "msg": 'Registered Successfully'
                                                                //"token": token
                                                            });
                                                        });
                                                    });
                                                } 
                                            //});
                                        }
                                    });
                                }
                            //});
                        });
                    }
                });

            }else{
                // For Member Register
                q = "INSERT INTO `users` (`CompanyId`, `UserTypeId`, `UserName`, `Email`, `Password`, `JobPosition`, `Phone`, `IsActive`, `CreatedDate`) VALUES ('"+data.CompanyId+"','"+data.Role+"','"+data.Name+"','"+data.Email+"', '"+data.Password+"', '"+data.JobPosition+"', '"+data.Phone+"', 0, '"+ dateFormat(new Date(), "yyyy-mm-dd 00:00:00") +"')";
                db.query(q, data, function(err, result, fields) {
                    if (err) {
                        return callback({
                            "returnMSG": "DBE",
                            "statuscode": "203",
                            "status": "error",
                            "msg": 'Something went wrong try again',
                            "err": err
                        });
                    } else {
                        //common.generateToken(result[0], function(err, token) {                            
                            
                        q = "INSERT INTO `members` (`UserId`, `TeamId`, `IsActive`, `CreatedDate`) VALUES ('"+result.insertId+"','"+data.TeamId+"',1,'"+ dateFormat(new Date(), "yyyy-mm-dd 00:00:00") +"')";                                                    
                        db.query(q, data, function(err, result, fields) {
                        //db.query(q, data, function(err, result, fields) {
                            common.sendMail('registered', data, (d) => {                                        
                                return callback({
                                    "returnMSG": "URS",
                                    "statuscode": "200",
                                    "status": "success",
                                    "msg": 'Registered Successfully'
                                    //"token": token
                                });
                            });
                        });
                             
                        //});
                    }
                });
            }
            
            
        }else{
            /*return callback(false, {
                "returnMSG": "UAR",
                "statuscode": "203",
                "status": "failed",
                "msg": 'User already registered'
            });*/
            return callback({
                "returnMSG": "UAR",
                "statuscode": "203",
                "status": "failed",
                "msg": 'User already registered'
            });
        }
    });

}
module.exports.forgotPassword = (data, callback) => {
    q = "SELECT * FROM users WHERE Email='" + data.Email + "'";
    db.query(q, function(err, result, fields) {
        if (err) {
            return callback({
                "returnMSG": "DBE",
                "statuscode": "203",
                "status": "error",
                "msg": 'Error occured',
                "err": err
            });
        } else {
            if (result.length > 0) {
                common.generateToken({ Email: data.Email }, function(err, token) {
                    if (err) {
                        return callback({
                            "returnMSG": "DBE",
                            "statuscode": "203",
                            "status": "error",
                            "msg": 'Error occured',
                            "err": err
                        });
                    } else {
                        var mailOptions = {
                            from: 'noreply@objectivedone.com',
                            to: data.Email,
                            subject: 'Password reset',
                            html: '<h3>Click belove link to reset your password</h3>' +
                                '<a href="' + data.Url + '/#/resetPassword/' + token + '">' + data.Url + '/#/resetPassword/' + token + '</a>'
                        };
                        config.mail_transporter.sendMail(mailOptions, function(err, info) {
                            if (err) {
                                return callback({
                                    "returnMSG": "MNS",
                                    "statuscode": "203",
                                    "status": "error",
                                    "msg": 'Email sending failed',
                                    "error":err
                                });
                            } else {
                                return callback({
                                    "statuscode": "200",
                                    "status": "success",
                                    "msg": 'Email sent to ' + data.Email
                                });
                            }
                        });
                    }
                });
            } else {
                return callback({
                    "returnMSG": "UNF",
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'Email does not exist'
                });
            }
        }
    });
}
module.exports.resetPassword = (data, callback) => {
    jwt.verify(data.Token, config.secretKey, (err, decoded) => {
        if (err) {
            return res.json({
                "statuscode": "203",
                "status": 'failed',
                "msg": 'Token is not valid',
                "error": err
            });
        } else {
            q = "UPDATE users SET Password='" + data.Password + "' WHERE Email='" + decoded.data.Email + "'";
            db.query(q, function(err, result, fields) {
                if (err) {
                    return callback({
                        "statuscode": "203",
                        "status": "error",
                        "msg": 'error in database',
                        'err': err
                    });
                } else {
                    if (result.affectedRows) {
                        return callback({
                            "statuscode": "200",
                            "status": "success",
                            "msg": 'Password reset successfully'
                        });
                    } else {
                        return callback({
                            "statuscode": "203",
                            "status": "error",
                            "msg": 'Password reset failed'
                        });
                    }
                }
            });
           
        }
    });
}
module.exports.login = function(data, callback) {
    console.log('data login', data);
    var foundData = [];
    q = "SELECT * FROM users WHERE Email='" + data.Email + "' OR Phone='" + data.Phone + "' AND IsActive= 1";
    db.query(q, function(err, result, fields) {
        if (err) return callback({
            "statuscode": "203",
            "status": "error",
            "msg": 'error in database',
            'err': err
        });
        else {
            if (result.length == 1) {
                if(result[0].IsActive == '1'){
                    if (result[0].Password == data.Password) {
                        common.generateToken(result[0], function(err, token) {
                            if (err) {
                                return callback({
                                    "returnMSG": "DBE",
                                    "statuscode": "203",
                                    "status": "error",
                                    "msg": 'Error occured',
                                    "err": err
                                });
                            } else {
                                foundData =[{"id":result[0].id,"CompanyId":result[0].CompanyId,"Role":result[0].UserTypeId,"UserName":result[0].UserName,"Email":result[0].Email,"JobPosition":result[0].JobPosition,"Phone":result[0].Phone,"IsActive":result[0].IsActive,"CreatedDate":result[0].CreatedDate}];
                                return callback({
                                    "returnMSG": "ULS",
                                    "statuscode": "200",
                                    "status": "success",
                                    "msg": 'Logged in successfully',
                                    "token": token,
                                    "role" : result[0].UserTypeId,
                                    "data" : foundData
                                });
                            }
                        })
                    } else {
                        return callback({
                            "returnMSG": "ICP",
                            "statuscode": "203",
                            "status": "failed",
                            "msg": 'Incorrect Password'
                        });
                    }
                }else{
                    return callback({
                        "returnMSG": "ICP",
                        "statuscode": "203",
                        "status": "failed",
                        "msg": 'User is inactive'
                    });
                }                

            } else {
                return callback({
                    "returnMSG": "UNF",
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'User not found'
                });
            }
        }
    });
}
module.exports.inviteMembers = (data, callback) => {
    common.sendMail('invite_member', data, (d) => {
        return callback({
            "returnMSG": 'ISS',
            "statuscode": "200",
            "status": "success",
            "msg": 'Invitations are sent successfully'
        });
    })
}