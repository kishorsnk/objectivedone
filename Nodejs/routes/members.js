var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({
    dest: 'images/uploads/'
});
var md5 = require('md5');
var fs = require('fs');
var member = require('../models/members_model');
var team = require('../models/teams_model');
// var app = require('../models/app_model');
var common = require('../models/common');
var db = require('../config/database');

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
    member.login(data, function(err, success) {
        if (!success) return res.send(err);
        else return res.send(success);
    })
});

module.exports = router;