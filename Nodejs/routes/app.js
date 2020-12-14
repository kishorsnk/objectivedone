var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');

var upload = multer({
    dest: 'images/uploads/'
});
// var admin = require('../models/admin_model');
var app = require('../models/app_model');
var common = require('../models/common');
var db = require('../config/database');


router.get('/getInitialData', function(req, res) {
    res.send({ "statuscode": "200", "status": "success", "data": { images: { logo: 'icons/logo.png', favicon: 'icons/favicon.ico' } } })
});

router.post('/getLinkData', upload.any(), function(req, res) {
    var uData = {}
    common.checkToken(req, res, (uData, token) => {
        if (req.body.Type == undefined || req.body.Type == '') {
            return res.send({
                "statuscode": "203",
                "status": "error",
                "msg": 'Type required '
            });
        }
        if (req.body.Item == undefined || req.body.Item == '') {
            return res.send({
                "statuscode": "203",
                "status": "error",
                "msg": 'data required '
            });
        }
        if (req.body.Which == undefined || req.body.Which == '') {
            return res.send({
                "statuscode": "203",
                "status": "error",
                "msg": 'select object required '
            });
        }
        app.getLinkData(req.body, uData, (d) => {
            return res.send(d);
        });
    });
});
router.post('/isExist', upload.any(), function(req, res) {
    app.isExist(req.body, (data) => {
        res.send(data);
    })
})


router.post('/getAllUsers', upload.any(), function(req, res) {
    //console.log(req.body);
    common.checkToken(req, res, (uData, token) => {
        app.getAllUsers(req.body, uData, function(data) {
            data['token'] = token;
            return res.send(data);
        })
    })
})

router.post('/getAllCompanies', upload.any(), function(req, res) {
    common.checkToken(req, res, (uData, token) => {
        app.getAllCompanies(req.body, uData, function(data) {
            data['token'] = token;
            return res.send(data);
        })
    })
})

router.post('/getAllMembers', upload.any(), function(req, res) {
    common.checkToken(req, res, (uData, token) => {
        app.getAllMembers(req.body, uData, function(data) {
            data['token'] = token;
            return res.send(data);
        })
    })
})

router.post('/getAllMentors', upload.any(), function(req, res) {
    common.checkToken(req, res, (uData, token) => {
        app.getAllMentors(req.body, uData, function(data) {
            data['token'] = token;
            return res.send(data);
        })
    })
})


router.post('/getAllocatedMentors', upload.any(), function(req, res) {
    common.checkToken(req, res, (uData, token) => {
        app.getAllocatedMentors(req.body, uData, function(data) {
            data['token'] = token;
            return res.send(data);
        })
    })
})

router.post('/updateAllocateMentors', upload.any(), function(req, res) {
    common.checkToken(req, res, (uData, token) => {
        app.updateAllocateMentors(req.body, uData, function(data) {
            data['token'] = token;
            return res.send(data);
        })
    })
})


router.post('/updateCompanyStatus', upload.any(), function(req, res) {
    common.checkToken(req, res, (uData, token) => {
        app.updateCompanyStatus(req.body, uData, function(data) {
            data['token'] = token;
            return res.send(data);
        })
    })
})

router.post('/updateMemberStatus', upload.any(), function(req, res) {
    common.checkToken(req, res, (uData, token) => {
        app.updateMemberStatus(req.body, uData, function(data) {
            data['token'] = token;
            return res.send(data);
        })
    })
})

router.post('/UpdateUserPassword', upload.any(), function(req, res) {
    //console.log(req.body);
    common.checkToken(req, res, (uData, token) => {
        //console.log('token',token);
        app.UpdateUserPassword(req.body, uData, function(data) {
            data['token'] = token;
            return res.send(data);
        })
    })
})

router.post('/DeleteSelectedUser', upload.any(), function(req, res) {
    //console.log(req.body);
    common.checkToken(req, res, (uData, token) => {
        //console.log('token',token);
        app.DeleteSelectedUser(req.body, uData, function(data) {
            data['token'] = token;
            return res.send(data);
        })
    })
})

router.post('/CreateCompAlt', upload.any(), function(req, res) {
    //console.log(req.body);
    common.checkToken(req, res, (uData, token) => {
        //console.log('token',token);
        app.CreateCompAlt(req.body, uData, function(data) {
            data['token'] = token;
            return res.send(data);
        })
    })
})

router.post('/registerMentor', upload.any(), function(req, res) {
    //console.log(req.body);
    common.checkToken(req, res, (uData, token) => {
        //console.log('token',token);
        app.registerMentor(req.body, uData, function(data) {
            data['token'] = token;
            return res.send(data);
        })
    })
})

router.post('/allocateMentors', upload.any(), function(req, res) {
    //console.log(req.body);
    common.checkToken(req, res, (uData, token) => {
        //console.log('token',token);
        app.allocateMentors(req.body, uData, function(data) {
            data['token'] = token;
            return res.send(data);
        })
    })
})


router.post('/getTeamsAndMembers', upload.any(), function(req, res) {
    //console.log(req.body);
    common.checkToken(req, res, (uData, token) => {
        app.getTeamsAndMembers(req.body, uData, function(data) {
            data['token'] = token;
            return res.send(data);
        })
    })
})

router.post('/getCompanyObjective', upload.any(), function(req, res) {
    //console.log('getCompanyObjective',req.body);
    common.checkToken(req, res, (uData, token) => {
        //console.log('getCompanyObjective uData', uData);
        app.getCompanyObjective(req.body, uData, function(data) {
            data['token'] = token;
            return res.send(data);
        })
    })
})

router.post('/getMemberObjective', upload.any(), function(req, res) {
    //console.log('getMemberObjective',req.body);
    common.checkToken(req, res, (uData, token) => {
        //console.log('getMemberObjective uData', uData);
        app.getMemberObjective(req.body, uData, function(data) {
            data['token'] = token;
            return res.send(data);
        })
    })
})

router.post('/getTeamObjective', upload.any(), function(req, res) {
    //console.log('getMemberObjective',req.body);
    common.checkToken(req, res, (uData, token) => {
        //console.log('getMemberObjective uData', uData);
        app.getTeamObjective(req.body, uData, function(data) {
            data['token'] = token;
            return res.send(data);
        })
    })
})


module.exports = router;