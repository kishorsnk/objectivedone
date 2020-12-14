    var express = require('express');
    var router = express.Router();
    var multer = require('multer');
    var upload = multer({
        dest: 'images/uploads/'
    });
    var config = require('../config/general');

    var md5 = require('md5');
    var fs = require('fs');
    var team = require('../models/teams_model');
    var member = require('../models/members_model');
    var app = require('../models/app_model');
    // var app = require('../models/app_model');
    var common = require('../models/common');
    var db = require('../config/database');

    router.post('/createTeam', upload.any(), function(req, res) {
        //console.log(req.body);
        common.checkToken(req, res, (uData, token) => {
            console.log('token',token);
            team.createTeam(req.body, uData, function(data) {
                data['token'] = token;
                return res.send(data);
            })
        })
    })

    router.post('/getTeams', upload.any(), function(req, res) {
        //console.log(req.body);
        common.checkToken(req, res, (uData, token) => {
            //console.log('token',token);
            team.getTeams(req.body, uData, function(data) {
                data['token'] = token;
                return res.send(data);
            })
        })
    })

    router.post('/inviteMembers', upload.any(), function(req, res) {
        common.checkToken(req, res, (uData, token) => {
            if (req.body.emails == undefined || req.body.emails == '') {
                return res.send({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'Email id\'s are required to invite'
                });
            } else {
                let ems = req.body.emails.split(',');
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
            req.body['uData'] = uData;
            team.inviteMembers(req.body, function(data) {
                return res.send(data);
            })
        })
    });

    router.post('/addObjective', upload.any(), function(req, res) {
        //console.log(req.body);
        common.checkToken(req, res, (uData, token) => {
            //console.log('token',token);
            team.addObjective(req.body, uData, function(data) {
                data['token'] = token;
                return res.send(data);
            })
        })
    });

    router.post('/updateObjective', upload.any(), function(req, res) {
        //console.log(req.body);
        common.checkToken(req, res, (uData, token) => {
            //console.log('token',token);
            team.updateObjective(req.body, uData, function(data) {
                data['token'] = token;
                return res.send(data);
            })
        })
    });

    router.post('/deleteObjective', upload.any(), function(req, res) {
        //console.log(req.body);
        common.checkToken(req, res, (uData, token) => {
            //console.log('token',token);
            team.deleteObjective(req.body, uData, function(data) {
                data['token'] = token;
                return res.send(data);
            })
        })
    });

    router.post('/getUserByObjective', upload.any(), function(req, res) {
        //console.log(req.body);
        common.checkToken(req, res, (uData, token) => {
            //console.log('token',token);
            team.getUserByObjective(req.body, uData, function(data) {
                data['token'] = token;
                return res.send(data);
            })
        })
    });

    router.post('/UnlinkFromObjective', upload.any(), function(req, res) {
        //console.log(req.body);
        common.checkToken(req, res, (uData, token) => {
            //console.log('token',token);
            team.UnlinkFromObjective(req.body, uData, function(data) {
                data['token'] = token;
                return res.send(data);
            })
        })
    });

    router.post('/UnlinkFromKeyResult', upload.any(), function(req, res) {
        //console.log(req.body);
        common.checkToken(req, res, (uData, token) => {
            //console.log('token',token);
            team.UnlinkFromKeyResult(req.body, uData, function(data) {
                data['token'] = token;
                return res.send(data);
            })
        })
    });

    router.post('/assignOkrAsObjective', upload.any(), function(req, res) {
        //console.log(req.body);
        common.checkToken(req, res, (uData, token) => {
            //console.log('token',token);
            team.assignOkrAsObjective(req.body, uData, function(data) {
                data['token'] = token;
                return res.send(data);
            })
        })
    });

    router.post('/assignObjectiveAsOkr', upload.any(), function(req, res) {
        //console.log(req.body);
        common.checkToken(req, res, (uData, token) => {
            //console.log('token',token);
            team.assignObjectiveAsOkr(req.body, uData, function(data) {
                data['token'] = token;
                return res.send(data);
            })
        })
    });

    router.post('/addOKR', upload.any(), function(req, res) {
        //console.log(req.body);
        common.checkToken(req, res, (uData, token) => {
            //console.log('token',token);
            team.addOKR(req.body, uData, function(data) {
                data['token'] = token;
                return res.send(data);
            })
        })
    });

    router.post('/updateOKR', upload.any(), function(req, res) {
        //console.log(req.body);
        common.checkToken(req, res, (uData, token) => {
            //console.log('token',token);
            team.updateOKR(req.body, uData, function(data) {
                data['token'] = token;
                return res.send(data);
            })
        })
    });

    router.post('/deleteOKR', upload.any(), function(req, res) {
        //console.log(req.body);
        common.checkToken(req, res, (uData, token) => {
            //console.log('token',token);
            team.deleteOKR(req.body, uData, function(data) {
                data['token'] = token;
                return res.send(data);
            })
        })
    });

    router.post('/updateOKRProgress', upload.any(), function(req, res) {
        //console.log(req.body);
        common.checkToken(req, res, (uData, token) => {
            //console.log('token',token);
            team.updateOKRProgress(req.body, uData, function(data) {
                data['token'] = token;
                return res.send(data);
            })
        })
    });

    router.post('/updateTargetValue', upload.any(), function(req, res) {
        //console.log(req.body);
        common.checkToken(req, res, (uData, token) => {
            //console.log('token',token);
            team.updateTargetValue(req.body, uData, function(data) {
                data['token'] = token;
                return res.send(data);
            })
        })
    });

    router.post('/updateWeightage', upload.any(), function(req, res) {
        //console.log(req.body);
        common.checkToken(req, res, (uData, token) => {
            //console.log('token',token);
            team.updateWeightage(req.body, uData, function(data) {
                data['token'] = token;
                return res.send(data);
            })
        })
    });

    router.post('/addComment', upload.any(), function(req, res) {
        //console.log(req.body);
        common.checkToken(req, res, (uData, token) => {
            //console.log('token',token);
            team.addComment(req.body, uData, function(data) {
                data['token'] = token;
                return res.send(data);
            })
        })
    });

    router.post('/updateComment', upload.any(), function(req, res) {
        //console.log(req.body);
        common.checkToken(req, res, (uData, token) => {
            //console.log('token',token);
            team.updateComment(req.body, uData, function(data) {
                data['token'] = token;
                return res.send(data);
            })
        })
    });

    router.post('/deleteComment', upload.any(), function(req, res) {
        //console.log(req.body);
        common.checkToken(req, res, (uData, token) => {
            //console.log('token',token);
            team.deleteComment(req.body, uData, function(data) {
                data['token'] = token;
                return res.send(data);
            })
        })
    });
   

    module.exports = router;