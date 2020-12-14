var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({
    dest: 'images/uploads/'
});
var md5 = require('md5');
var fs = require('fs');
var user = require('../models/user_model');
// var app = require('../models/app_model');
var common = require('../models/common');
var db = require('../config/database');
// var db = require('../config/database').db3;
// var config = require('../config/general');
// var Insta = require('instamojo-nodejs');
// Insta.setKeys(config.keys.instamojo.API_KEY, config.keys.instamojo.AUTH_KEY);

// // router.get('/payment_success/', function(req, res) {
// //     console.log(req.query.payment_id);
// //     console.log(req.query.payment_status);
// //     console.log(req.query.payment_request_id);
// // })
router.get('/test', function(req, res) {
    common.sendMail('invite_member', { uData: { Name: 'fhvbhvb' }, Email: 'shivup06@gmail.com', Url: 'sdfghj' }, (d) => {
        //console.log(d);
        res.send(d);
    });
})

router.post('/register', upload.any(), function(req, res) {
    var data = {};
    if (req.body.Name == undefined || req.body.Name == '') {
        return res.send({
            "statuscode": "203",
            "status": "error",
            "msg": 'Name required'
        });
    }
    if (req.body.Address == undefined || req.body.Address == '') {
        return res.send({
            "statuscode": "203",
            "status": "error",
            "msg": 'Address required'
        });
    }
    if (req.body.TIN == undefined || req.body.TIN == '') {
        return res.send({
            "statuscode": "203",
            "status": "error",
            "msg": 'TIN required'
        });
    }
    if (req.body.Email != undefined && (req.body.Email == '' || !common.validateEmail(req.body.Email))) {
        return res.send({
            "statuscode": "203",
            "status": "error",
            "msg": 'Invalid Email'
        });
    }

    if (req.body.Password == undefined || req.body.Password == '') {
        return res.send({
            "statuscode": "203",
            "status": "error",
            "msg": 'Password required'
        });
    }
    if (req.body.JobPosition == undefined || req.body.JobPosition == '') {
        return res.send({
            "statuscode": "203",
            "status": "error",
            "msg": 'Job Position Required'
        });
    }
    if (req.body.Phone == undefined || req.body.Phone == '') {
        return res.send({
            "statuscode": "203",
            "status": "error",
            "msg": 'Invalid Phone Number'
        });
    }
    if (req.body.FieldOfExpertise == undefined || req.body.FieldOfExpertise == '') {
        return res.send({
            "statuscode": "203",
            "status": "error",
            "msg": 'Field Of Expertise Required'
        });
    }
    if (req.body.Role == undefined || req.body.Role == '') {
        return res.send({
            "statuscode": "203",
            "status": "error",
            "msg": 'Invalid Role'
        });
    }
    if (req.body.Role == 1 && (req.body.NumberOfUsers == undefined || req.body.NumberOfUsers == '')) {
        return res.send({
            "statuscode": "203",
            "status": "error",
            "msg": 'Provide Us how many Users you will you add'
        });
    }


    data['Name'] = req.body.Name != undefined && req.body.Name != '' ? req.body.Name : '';
    data['Address'] = req.body.Address != undefined && req.body.Address != '' ? req.body.Address : '';
    data['TIN'] = req.body.TIN != undefined && req.body.TIN != '' ? req.body.TIN : '';
    data['Email'] = req.body.Email != undefined && req.body.Email != '' ? req.body.Email : '';
    data['Password'] = md5(req.body.Password);
    if (req.body.Role == '1') {
        data['JobPosition'] = req.body.JobPosition;
        data['FieldOfExpertise'] = req.body.FieldOfExpertise;
        data['NumberOfUsers'] = req.body.NumberOfUsers;
    }
    data['Phone'] = req.body.Phone;
    data['Role'] = req.body.Role;
    if (req.body.Role != 1) {
        data['TeamId'] = req.body.TeamId;
    }
    // data['Subscription'] = req.body.Subscription ? req.body.Subscription : false;

    user.signUp(data, function(d) {
        return res.send(d);
    });
});


router.post('/registerMember', upload.any(), function(req, res) {
    var data = {};

    data['Name'] = req.body[0].Name;
    data['Address'] = req.body[0].Address;
    data['Email'] = req.body[0].Email;
    data['Password'] = md5(req.body[0].Password);
    data['JobPosition'] = req.body[0].JobPosition;   
    data['Phone'] = req.body[0].Phone;
    data['Role'] = req.body[0].Role;
    data['CompanyId'] = req.body[0].CompanyId;
    data['TeamId'] = req.body[0].TeamId;

    user.signUp(data, function(d) {
        return res.send(d);
    });
});

router.post('/login', upload.any(), function(req, res) {
    //console.log('data Res', req, res);
    var data = {};
    if (req.body.Email == undefined || req.body.Email == '' || !common.validateEmail(req.body.Email)) {
        data['Email'] = false;
    } else {
        data['Email'] = req.body.Email;
    }
    if (req.body.Phone == undefined || req.body.Phone == '') {
        data['Phone'] = false;
    } else {
        data['Phone'] = req.body.Phone;
    }
    if (req.body.Password != undefined && req.body.Password != '') {
        data['Password'] = md5(req.body.Password);
    } else {
        return res.send({
            "statuscode": "203",
            "status": "error",
            "msg": 'Invalid password'
        });
    }
    if (!data['Email'] && !data['Phone']) {
        return res.send({
            "statuscode": "203",
            "status": "error",
            "msg": 'Invalid email or phone'
        });
    }
    user.login(data, function(d) {
        return res.send(d);
    })
});
router.get('/getDashboardData', function(req, res) {

});
// router.post('/inviteMembers', function(req, res) {
//     common.sendMail('inviteMember', {}, (sent) => {

//     })
// });
router.post('/forgotPassword', upload.any(), function(req, res) {
    if (req.body.Email == undefined || req.body.Email == '') {
        return res.send({
            "statuscode": "203",
            "status": "error",
            "msg": 'Email Required'
        });
    } else {
        if (!common.validateEmail(req.body.Email)) {
            return res.send({
                "statuscode": "203",
                "status": "error",
                "msg": 'Invalid Email'
            });
        }
    }
    user.forgotPassword(req.body,(d)=>{
        return res.send(d);
    });
});
router.post('/resetPassword', upload.any(), function(req, res) {
    if(req.body.Password == undefined || req.body.Password == '') {
        return res.send({
            "statuscode": "203",
            "status": "error",
            "msg": 'Password Required'
        });
    }else{
        req.body.Password=md5(req.body.Password);
    }
    if(req.body.Token == undefined || req.body.Token == '') {
        return res.send({
            "statuscode": "203",
            "status": "error",
            "msg": 'Token Required'
        });
    }
    user.resetPassword(req.body,(d)=>{
        res.send(d);
    })
});
router.get('/verifyToken', function(req, res) {
    common.checkToken(req, res, (uData, token) => {
        return res.send({
            "statuscode": "200",
            "status": "success",
            "data": uData,
            "token": token
        });
    })
});

router.post('/inviteMembers', upload.any(), function(req, res) {
    common.checkToken(req, res, (uData, token) => {
        if (req.body.Email == undefined || req.body.Email == '') {
            return res.send({
                "statuscode": "203",
                "status": "error",
                "msg": 'Email id\'s are required to invite'
            });
        } else {
            let ems = req.body.Email.split(',');
            ems.forEach((email) => {
                if (!common.validateEmail(email)) {
                    return res.send({
                        "statuscode": "203",
                        "status": "error",
                        "msg": 'some mail id\'s are invalid please check and correct'
                    });
                }
            })
        }

        if (req.body.Url == undefined || req.body.Url == '') {
            return res.send({
                "statuscode": "203",
                "status": "error",
                "msg": 'URL is required to invite'
            });
        }
        req.body['uData'] = uData;
        user.inviteMembers(req.body, function(data) {
            return res.send(data);
        })
    })
});


module.exports = router;