var db = require('../config/database');
var config = require('../config/general');
var md5 = require('md5');
var jwt = require('jsonwebtoken');
var common = require('../models/common');
var app = require('../models/app_model');
var dateFormat = require('dateformat');

module.exports.createTeam = function(data, uData, callback) {
    //console.log('data',data);
    q = 'SELECT Id FROM team WHERE CompanyId="' + data.CompanyId + '" AND UserId="' + data.UserId + '" AND TeamName="' + data.TeamName + '"';
    db.query(q, data, function(err, teams, fields) {
        if (err)
            return callback({ "statuscode": "203", "status": "error", "msg": "Error occurered while creating team", "error": err });
        else {
            if (teams.length < 1) {
                q = "INSERT INTO team set ? ";
                db.query(q, data, function(err, result, fields) {
                    if (err) return callback({ "statuscode": "203", "status": "error", "msg": "Error occurered while creating team", "error": err });
                    else {
                        /*app.getTeamsTree('u', data.UserId, (d) => {
                            console.log('d',d);
                            if (d.statuscode == 200 && d.status == 'success') {
                                return callback({ "statuscode": "200", "status": "success", "teams": d.data.teams, "msg": "Team added successfully" });
                            } else {
                                return callback({ "statuscode": "200", "status": "success", "teams": [], "msg": "Team added successfully" });
                            }
                        })*/
                        return callback({ "statuscode": "200", "status": "success", "msg": "Team added successfully" });
                    }
                });
            } else {
                return callback({ "returnMSG": 'TNE', "statuscode": "203", "status": "failed", "msg": "Team Name already exists try different one.." });
            }
        }
    });
}


module.exports.getTeams = function(data, uData, callback) {
    q = "SELECT * FROM team WHERE CompanyId = '"+data.CompanyId+"' AND  IsActive='1'";
    db.query(q, function(e, teams, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {
                return callback({
                    "statuscode": "200",
                    "status": "success",
                    "msg": 'Success',
                    "data": teams
                })
            }
    })         
}

module.exports.inviteMembers = (data, callback) => {
    common.sendMail('invite_member', data, (d) => {
        //console.log(d);
        return callback({
            "returnMSG": 'ISS',
            "statuscode": "200",
            "status": "success",
            "msg": 'Invitations are sent successfully'
        });
    })
}


module.exports.addObjective = function(data, uData, callback) {
    //console.log(data);
    q = "INSERT INTO `objectives` (`ObjectiveName`, `CompanyId`, `TeamId`, `MemberId`, `ObjectiveType`, `DueQuarter`, `DueYear`, `Status`, `CreatedBy`, `CreatedDate`) VALUES ('"+data.ObjectiveName+"','"+data.CompanyId+"','"+data.TeamId+"','"+data.MemberId+"','"+data.ObjectiveType+"','"+data.DueQuarter+"','"+data.DueYear+"','"+data.Status+"','"+data.CreatedBy+"','"+ dateFormat(new Date(), 'yyyy-mm-dd') +"')";
    //console.log(q);
    db.query(q, function(e, teams, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {
                return callback({
                    "statuscode": "200",
                    "status": "success",
                    "msg": 'Objective created successfully',
                    "data": teams
                })
            }
    })
}

module.exports.updateObjective = function(data, uData, callback) {
    //console.log(data);

    if(data.DueQuarter == undefined && data.DueYear == undefined){
        q = "UPDATE `objectives` SET ObjectiveName='"+ data.ObjectiveName +"' WHERE id='" + data.objid + "' ";
    }else{            
        q = "UPDATE `objectives` SET DueYear='"+ data.DueYear +"', DueQuarter='"+ data.DueQuarter +"' WHERE id='" + data.objid + "' ";
    }

    db.query(q, function(e, teams, fields) {
        if (e) {
            return callback({
                "statuscode": "203",
                "status": "error",
                "msg": 'something went wrong',
                "error": e
            })
        } else {
            return callback({
                "statuscode": "200",
                "status": "success",
                "msg": 'Objective updated successfully',
                "data": teams
            })
        }
    })
    
}

module.exports.deleteObjective = function(data, uData, callback) {
    //console.log(data);
    q = "UPDATE `objectives` SET IsActive = 0 WHERE id='" + data.objid + "' ";
    //console.log(q);
    db.query(q, function(e, teams, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {
                return callback({
                    "statuscode": "200",
                    "status": "success",
                    "msg": 'Objective deleted successfully',
                    "data": teams
                })
            }
    })
}


module.exports.updateTargetValue = function(data, uData, callback) {
    console.log(data);
    q = "UPDATE `keyresults` SET TargetValue = '"+data.TargetValue+"' WHERE id='" + data.okrId + "' AND IsActive = '1'";
    //console.log(q);
    db.query(q, function(e, teams, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {
                qs = "SELECT * FROM `keyresults` WHERE ObjectiveId = '"+data.objId+"' AND IsActive = '1'";
                db.query(qs, function(e, output, fields) {
                    if (e) {
                        return callback({
                            "statuscode": "203",
                            "status": "error",
                            "msg": 'something went wrong',
                            "error": e
                        })
                    } else {

                        var totalOKR = 0;
                        var avgOkr = 0;
                        for(i=0;i<output.length;i++){                            
                            if(output[i].TargetValue < 100){
                                totalOKR += parseFloat((output[i].ProgressValue/output[i].TargetValue)*100);
                            }else{
                                totalOKR += parseFloat(output[i].ProgressValue);
                            }
                        }
                        var objTotal = Math.round(totalOKR/output.length);
                        
                    }
                })
            }
    })
}

module.exports.updateWeightage = function(data, uData, callback) {
    console.log(data);
    q = "UPDATE `keyresults` SET Weightage = '"+data.Weightage+"' WHERE id='" + data.okrId + "' ";
    //console.log(q);
    db.query(q, function(e, teams, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {
                qs = "SELECT * FROM `keyresults` WHERE ObjectiveId = '"+data.objId+"' AND IsActive = '1'";
                db.query(qs, function(e, output, fields) {
                    if (e) {
                        return callback({
                            "statuscode": "203",
                            "status": "error",
                            "msg": 'something went wrong',
                            "error": e
                        })
                    } else {

                        if(output.length > 1){
                            var leftWeightage = 100 - parseFloat(data.Weightage);
                            var leftOkr = output.length- 1;
                            var weighatgePerOkr = parseFloat(leftWeightage/leftOkr);
                            for(i=0;i<output.length;i++){

                                if(data.okrId != output[i].id){
                                    qw = "UPDATE `keyresults` SET Weightage = '"+weighatgePerOkr+"' WHERE id='" + output[i].id + "' ";
                                    db.query(qw, function(e, outputs, fields) {
                                        if (e) {
                                            return callback({
                                                "statuscode": "203",
                                                "status": "error",
                                                "msg": 'something went wrong',
                                                "error": e
                                            })
                                        }else{
                                            
                                        }
                                    })
                                }

                            }

                            qp = "SELECT * FROM `keyresults` WHERE ObjectiveId = '"+data.objId+"' AND IsActive = '1'";
                            db.query(qp, function(e, keys, fields) {
                                if (e) {
                                    return callback({
                                        "statuscode": "203",
                                        "status": "error",
                                        "msg": 'something went wrong',
                                        "error": e
                                    })
                                }else{
                                    var OKRFinalValue = 0;
                                    for(i=0;i<keys.length;i++){
                                        OKRFinalValue += parseFloat((keys[i].ProgressValue/keys[i].TargetValue)*keys[i].Weightage);
                                    }

                                    qv = "UPDATE `objectives` SET ProgressValue = '"+Math.round(OKRFinalValue)+"' WHERE id='" + data.objId + "' AND IsActive = '1'";
                                    db.query(qv, function(e, objs, fields) {
                                        if (e) {
                                            return callback({
                                                "statuscode": "203",
                                                "status": "error",
                                                "msg": 'something went wrong',
                                                "error": e
                                            })
                                        }else{
                                            return callback({
                                                "statuscode": "200",
                                                "status": "success",
                                                "msg": 'Weightage Updated',
                                                "data": objs
                                            })
                                        }
                                    })
                                }
                            })

                        }else{
                            qp = "SELECT * FROM `keyresults` WHERE ObjectiveId = '"+data.objId+"' AND IsActive = '1'";
                            db.query(qp, function(e, keys, fields) {
                                if (e) {
                                    return callback({
                                        "statuscode": "203",
                                        "status": "error",
                                        "msg": 'something went wrong',
                                        "error": e
                                    })
                                }else{
                                    var OKRFinalValue = 0;
                                    for(i=0;i<keys.length;i++){
                                        OKRFinalValue += parseFloat((keys[i].ProgressValue/keys[i].TargetValue)*keys[i].Weightage);
                                    }

                                    qv = "UPDATE `objectives` SET ProgressValue = '"+Math.round(OKRFinalValue)+"' WHERE id='" + data.objId + "' AND IsActive = '1'";
                                    db.query(qv, function(e, objs, fields) {
                                        if (e) {
                                            return callback({
                                                "statuscode": "203",
                                                "status": "error",
                                                "msg": 'something went wrong',
                                                "error": e
                                            })
                                        }else{
                                            return callback({
                                                "statuscode": "200",
                                                "status": "success",
                                                "msg": 'Weightage Updated',
                                                "data": objs
                                            })
                                        }
                                    })
                                }
                            })
                        }

                        /*var totalOKR = 0;
                        var avgOkr = 0;
                        for(i=0;i<output.length;i++){                            
                            if(output[i].TargetValue < 100){
                                totalOKR += parseFloat((output[i].ProgressValue/output[i].TargetValue)*100);
                            }else{
                                totalOKR += parseFloat(output[i].ProgressValue);
                            }
                        }
                        var objTotal = Math.round(totalOKR/output.length);
                        qz = "UPDATE `objectives` SET ProgressValue = '" + objTotal + "' WHERE id='" + data.objId + "' ";
                        db.query(qz, function(e, res, fields) {
                            if (e) {
                                return callback({
                                    "statuscode": "203",
                                    "status": "error",
                                    "msg": 'something went wrong',
                                    "error": e
                                })
                            } else {
                                       
                                    return callback({
                                        "statuscode": "200",
                                        "status": "success",
                                        "msg": 'TargetValue Updated',
                                        "data": res
                                    })
                                   
                            }
                        })*/
                    }
                })
            }
    })
}

module.exports.getUserByObjective = function(data, uData, callback) {
    //console.log(data);
    q = "SELECT * FROM `objectives` WHERE id = '"+data.objId+"'";
    //console.log(q);
    db.query(q, function(e, teams, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {
                return callback({
                    "statuscode": "200",
                    "status": "success",
                    "msg": 'Success',
                    "data": teams
                })
            }
    })
}

module.exports.UnlinkFromObjective = function(data, uData, callback) {
    var q,qs;
    /*if(data.userType == 'member'){
        q = "UPDATE `keyresults` SET ProgressValue = '0', AssignedToObj = '0', AssignedToUserType = '', AssignedToUser = '0' WHERE id='" + data.okrId + "' ";

        qs = "UPDATE `objectives` SET AssignedByOkr = '0', AssignedByOkrUserType = '0', AssignByOkrUserId = '0' WHERE AssignedByOkr='" + data.okrId + "' ";
    }else if(data.userType == 'team'){
        q = "UPDATE `keyresults` SET ProgressValue = '0', AssignedToObj = '0', AssignedToUserType = '', AssignedToUser = '0' WHERE id='" + data.okrId + "' ";

        qs = "UPDATE `objectives` SET AssignedByOkr = '0', AssignedByOkrUserType = '0', AssignByOkrUserId = '0' WHERE AssignedByOkr='" + data.okrId + "' ";
    }else if(data.userType == 'company'){
        q = "UPDATE `keyresults` SET ProgressValue = '0', AssignedToObj = '0', AssignedToUserType = '', AssignedToUser = '0' WHERE id='" + data.okrId + "' ";

        qs = "UPDATE `objectives` SET AssignedByOkr = '0', AssignedByOkrUserType = '0', AssignByOkrUserId = '0' WHERE AssignedByOkr='" + data.okrId + "' ";
    }*/
    q = "UPDATE `keyresults` SET ProgressValue = '0', AssignedToObj = '0', AssignedToUserType = '', AssignedToUser = '0' WHERE id='" + data.okrId + "' ";

    qs = "UPDATE `objectives` SET AssignedByOkr = '0', AssignedByOkrUserType = '0', AssignByOkrUserId = '0' WHERE AssignedByOkr='" + data.okrId + "' ";
    console.log(q,qs);
    db.query(q, function(e, res, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {
                db.query(qs, function(e, res, fields) {
                    if (e) {
                        return callback({
                            "statuscode": "203",
                            "status": "error",
                            "msg": 'something went wrong',
                            "error": e
                        })
                    } else {

                    }

                })
                return callback({
                    "statuscode": "200",
                    "status": "success",
                    "msg": 'Unlinked from objective',
                    "data": res
                })
            }
    })
}

module.exports.UnlinkFromKeyResult = function(data, uData, callback) {
    var q,qs;
    /*if(data.userType == 'member'){
        q = "UPDATE `keyresults` SET ProgressValue = '0', AssignedByObj = '0', AssignedByUser = '0', AssignedByUserType = '', IsActive ='0' WHERE id='" + data.objId + "' ";

        qs = "UPDATE `objectives` SET AssignedToOkr = '0', AssignedToOkrUserType = '0', AssignToOkrUserId = '0' WHERE AssignedToOkr='" + data.objId + "' ";
    }else if(data.userType == 'team'){
        q = "UPDATE `keyresults` SET ProgressValue = '0', AssignedByObj = '0', AssignedByUser = '0', AssignedByUserType = '', IsActive ='0' WHERE id='" + data.objId + "' ";

        qs = "UPDATE `objectives` SET AssignedToOkr = '0', AssignedToOkrUserType = '0', AssignToOkrUserId = '0' WHERE AssignedToOkr='" + data.objId + "' ";
    }else if(data.userType == 'company'){
        q = "UPDATE `keyresults` SET ProgressValue = '0', AssignedByObj = '0', AssignedByUser = '0', AssignedByUserType = '', IsActive ='0' WHERE id='" + data.objId + "' ";

        qs = "UPDATE `objectives` SET AssignedToOkr = '0', AssignedToOkrUserType = '0', AssignToOkrUserId = '0' WHERE AssignedToOkr='" + data.objId + "' ";
    }*/
    q = "UPDATE `keyresults` SET ProgressValue = '0', AssignedByObj = '0', AssignedByUser = '0', AssignedByUserType = '', IsActive ='0' WHERE id='" + data.objId + "' ";

    qs = "UPDATE `objectives` SET AssignedToOkr = '0', AssignedToOkrUserType = '0', AssignToOkrUserId = '0' WHERE AssignedToOkr='" + data.objId + "' ";
    console.log(q,qs);
    db.query(q, function(e, res, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {
                db.query(qs, function(e, res, fields) {
                    if (e) {
                        return callback({
                            "statuscode": "203",
                            "status": "error",
                            "msg": 'something went wrong',
                            "error": e
                        })
                    } else {

                    }

                })
                return callback({
                    "statuscode": "200",
                    "status": "success",
                    "msg": 'Unlinked from key result',
                    "data": res
                })
            }
    })
}

module.exports.assignOkrAsObjective = function(data, uData, callback) {
    //console.log(data);
    q = "INSERT INTO `objectives` (`ObjectiveName`, `CompanyId`, `TeamId`, `MemberId`,`AssignedByOkr`,`AssignedByOkrUserType`,`AssignByOkrUserId`, `ObjectiveType`, `DueQuarter`, `DueYear`, `Status`, `CreatedBy`, `CreatedDate`) VALUES ('"+data.ObjectiveName+"','"+data.CompanyId+"','"+data.TeamId+"','"+data.MemberId+"','"+data.AssignedByOkr+"','"+data.AssignedByUserType+"','"+data.AssignedByUser+"','"+data.ObjectiveType+"','"+data.DueQuarter+"','"+data.DueYear+"','"+data.Status+"','"+data.CreatedBy+"','"+ dateFormat(new Date(), 'yyyy-mm-dd') +"')";
    //console.log(q);
    db.query(q, function(e, obj, fields) {
        if (e) {
            return callback({
                "statuscode": "203",
                "status": "error",
                "msg": 'something went wrong',
                "error": e
            })
        } else {
            console.log('obs',obj);
            q = "SELECT * FROM `objectives` WHERE id = '"+obj.insertId+"'";
            //console.log(q);
            db.query(q, function(e, res, fields) {
                if (e) {
                    return callback({
                        "statuscode": "203",
                        "status": "error",
                        "msg": 'something went wrong',
                        "error": e
                    })
                } else {
                    console.log(res);

                   
                    console.log(q);
                    db.query(q, function(e, result, fields) {
                        if (e) {
                            return callback({
                                "statuscode": "203",
                                "status": "error",
                                "msg": 'something went wrong',
                                "error": e
                            })
                        } else {
                            return callback({
                                "statuscode": "200",
                                "status": "success",
                                "msg": 'OKR assigned successfully',
                                "data": result
                            })
                        }
                    })
                }
            })
        }
    })
}


module.exports.assignObjectiveAsOkr = function(data, uData, callback) {
    console.log(data);
    q = "INSERT INTO `keyresults` (`KeyResultName`, `ObjectiveId`, `Status`, `ProgressValue`,`AssignedByObj`,`AssignedByUser`,`AssignedByUserType`,`CreatedBy`, `CreatedDate`) VALUES ('"+data.KeyResultName+"','"+data.ObjectiveId+"','"+data.Status+"','"+data.ProgressValue+"','"+data.AssignedByObj+"','"+data.userIds+"','"+data.ObjectiveTypeBy+"','"+data.CreatedBy+"','"+ dateFormat(new Date(), 'yyyy-mm-dd') +"')";
    console.log('qa',q);
    db.query(q, function(e, obj, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {
                console.log('obs',obj);
                q = "SELECT * FROM `keyresults` WHERE id = '"+obj.insertId+"'";
                //console.log(q);
                db.query(q, function(e, res, fields) {
                        if (e) {
                            return callback({
                                "statuscode": "203",
                                "status": "error",
                                "msg": 'something went wrong',
                                "error": e
                            })
                        } else {
                            console.log(res);
                            var userTypes = '';
                            var userIds = '';
                            var qs = '';
                            
                            console.log('ress',qs);
                            db.query(qs, function(e, resu, fields) {
                                if (e) {
                                    return callback({
                                        "statuscode": "203",
                                        "status": "error",
                                        "msg": 'something went wrong',
                                        "error": e
                                    })
                                } else {
                                    console.log('resu',resu);
                                    if(data.ObjectiveType == '1'){
                                        userIds = resu[0].CompanyId;
                                    }else if(data.ObjectiveType == '2'){
                                        userIds = resu[0].TeamId;
                                    }else if(data.ObjectiveType == '3'){
                                        userIds = resu[0].MemberId;
                                    }

                                    q = "UPDATE `objectives` SET AssignedToOkr = '"+obj.insertId+"', AssignedToOkrUserType = '"+userTypes+"', AssignToOkrUserId = '"+userIds+"' WHERE id='" + data.AssignedByObj + "' ";
                              
                                    console.log(q);
                                    db.query(q, function(e, result, fields) {
                                        if (e) {
                                            return callback({
                                                "statuscode": "203",
                                                "status": "error",
                                                "msg": 'something went wrong',
                                                "error": e
                                            })
                                        } else {
                                            return callback({
                                                "statuscode": "200",
                                                "status": "success",
                                                "msg": 'Objective assigned successfully',
                                                "data": result
                                            })
                                        }
                                    })
                                    
                                }
                            })

                            
                        }
                })


              
                
            }
    })
}

module.exports.addOKR = function(data, uData, callback) {
    //console.log(data);
    q = "INSERT INTO `keyresults` (`KeyResultName`, `ObjectiveId`, `Status`, `ProgressValue`, `CreatedBy`, `CreatedDate`) VALUES ('"+data.KeyResultName+"','"+data.ObjectiveId+"','"+data.Status+"','"+data.ProgressValue+"','"+data.CreatedBy+"','"+ dateFormat(new Date(), 'yyyy-mm-dd') +"')";
    //console.log(q);
    db.query(q, function(e, teams, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {

                qs = "SELECT * FROM `keyresults` WHERE ObjectiveId = '"+data.ObjectiveId+"' AND IsActive = '1'";
                db.query(qs, function(e, output, fields) {
                    if (e) {
                        return callback({
                            "statuscode": "203",
                            "status": "error",
                            "msg": 'something went wrong',
                            "error": e
                        })
                    } else {
                        //console.log(output);
                        if(output.length > 1){
                            var totalWeightage = 0;
                            
                            return callback({
                                "statuscode": "200",
                                "status": "success",
                                "msg": 'Key result created successfully'
                            })
                        }else{
                            return callback({
                                "statuscode": "200",
                                "status": "success",
                                "msg": 'Key result created successfully'
                            })
                        }
                        /*if(output.length > 1){
                            var leftWeightage = 100 - parseFloat(data.Weightage);
                            var leftOkr = output.length - 1;
                            var weighatgePerOkr = parseFloat(leftWeightage/leftOkr);
                            for(i=0;i<output.length;i++){
                                if(data.okrId != output[i].id){
                                    qw = "UPDATE `keyresults` SET Weightage = '"+weighatgePerOkr+"' WHERE id='" + output[i].id + "' AND IsActive = '1'";
                                    db.query(qw, function(e, outputs, fields) {
                                        if (e) {
                                            return callback({
                                                "statuscode": "203",
                                                "status": "error",
                                                "msg": 'something went wrong',
                                                "error": e
                                            })
                                        }else{

                                            
                                        }
                                    })
                                }
                            }
                            return callback({
                                "statuscode": "200",
                                "status": "success",
                                "msg": 'Key result created successfully'
                            }) 
                        }else{
                            qp = "SELECT * FROM `keyresults` WHERE ObjectiveId = '"+data.ObjectiveId+"' AND IsActive = '1'";
                            db.query(qp, function(e, keys, fields) {
                                if (e) {
                                    return callback({
                                        "statuscode": "203",
                                        "status": "error",
                                        "msg": 'something went wrong',
                                        "error": e
                                    })
                                }else{
                                    var OKRFinalValue = 0;
                                    for(i=0;i<keys.length;i++){
                                        OKRFinalValue += parseFloat((keys[i].ProgressValue/keys[i].TargetValue)*keys[i].Weightage);
                                    }

                                    qv = "UPDATE `objectives` SET ProgressValue = '"+Math.round(OKRFinalValue)+"' WHERE id='" + data.objId + "' ";
                                    db.query(qv, function(e, objs, fields) {
                                        if (e) {
                                            return callback({
                                                "statuscode": "203",
                                                "status": "error",
                                                "msg": 'something went wrong',
                                                "error": e
                                            })
                                        }else{
                                            return callback({
                                                "statuscode": "200",
                                                "status": "success",
                                                "msg": 'Weightage Updated',
                                                "data": objs
                                            })
                                        }
                                    })
                                }
                            })
                        }*/
                    }
                })

                
            }
    })
}


module.exports.updateOKR = function(data, uData, callback) {
    //console.log(data);
    q = "UPDATE `keyresults` SET KeyResultName = '" + data.KeyResultName + "' WHERE id='" + data.okrid + "' ";
    //console.log(q);
    db.query(q, function(e, teams, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {
                return callback({
                    "statuscode": "200",
                    "status": "success",
                    "msg": 'Key result updated successfully',
                    "data": teams
                })
            }
    })
}

module.exports.updateOKRProgress = function(data, uData, callback) {
    //console.log(data);
    q = "UPDATE `keyresults` SET ProgressValue = '" + data.newValue + "' WHERE id='" + data.okrId + "' AND IsActive = '1'";
    //console.log(q);
    db.query(q, function(e, teams, fields) {
        if (e) {
            return callback({
                "statuscode": "203",
                "status": "error",
                "msg": 'something went wrong',
                "error": e
            })
        } else {
            qs = "SELECT * FROM `keyresults` WHERE ObjectiveId = '"+data.objId+"' AND IsActive = '1'";
            db.query(qs, function(e, output, fields) {
                if (e) {
                    return callback({
                        "statuscode": "203",
                        "status": "error",
                        "msg": 'something went wrong',
                        "error": e
                    })
                } else {
                    /*var totalOKR = 0;
                    for(i=0;i<output.length;i++){
                        if(output[i].TargetValue < 100){
                            totalOKR += parseFloat((output[i].ProgressValue/output[i].TargetValue)*100);
                        }else{
                            totalOKR += parseFloat(output[i].ProgressValue);
                        }
                    }

                    var objTotal = Math.round(totalOKR/output.length);*/
                    var OKRFinalValue = 0;
                    for(i=0;i<output.length;i++){
                        OKRFinalValue += parseFloat((output[i].ProgressValue/output[i].TargetValue)*output[i].Weightage);
                        console.log(OKRFinalValue);
                    }
                    

                }
            })

            
        }
    })
}

module.exports.deleteOKR = function(data, uData, callback) {
    //console.log(data);
    q = "UPDATE `keyresults` SET IsActive = 0 WHERE id='" + data.okrid + "' ";
    //console.log(q);
    db.query(q, function(e, teams, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {
                return callback({
                    "statuscode": "200",
                    "status": "success",
                    "msg": 'Key result deleted successfully',
                    "data": teams
                })
            }
    })
}

module.exports.addComment = function(data, uData, callback) {
    //console.log(data,uData);
    q = "INSERT INTO `comments` (`PlanId`, `ObjectiveId`, `OkrId`, `Message`, `PostedBy`, `Mentioned`, `CreatedAt`) VALUES ('"+data.PlanId+"','"+data.ObjectiveId+"','"+data.OkrId+"','"+data.Message+"','"+uData.id+"','','"+ dateFormat(new Date(), 'yyyy-mm-dd') +"')";
    //console.log(q);
    db.query(q, function(e, teams, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {
                return callback({
                    "statuscode": "200",
                    "status": "success",
                    "msg": 'Comment added successfully',
                    "data": teams
                })
            }
    })
}

module.exports.updateComment = function(data, uData, callback) {
    //console.log(data,uData);
    if(data.ObjectiveId != 0){
        q = "UPDATE `comments` SET Message = '" + data.Message + "' WHERE id='" + data.ObjectiveId + "' ";
    }else if(data.OkrId != 0){
        q = "UPDATE `comments` SET Message = '" + data.Message + "' WHERE id='" + data.OkrId + "' ";
    }else if(data.PlanId != 0){
        q = "UPDATE `comments` SET Message = '" + data.Message + "' WHERE id='" + data.PlanId + "' ";
    }

    db.query(q, function(e, teams, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {
                return callback({
                    "statuscode": "200",
                    "status": "success",
                    "msg": 'Comment updated successfully',
                    "data": teams
                })
            }
    })
}


module.exports.deleteComment = function(data, uData, callback) {
    //console.log(data,uData);
    if(data.ObjectiveId != 0){
        q = "UPDATE `comments` SET Status = 0 WHERE id='" + data.ObjectiveId + "' ";
    }else if(data.OkrId != 0){
        q = "UPDATE `comments` SET Status = 0 WHERE id='" + data.OkrId + "' ";
    }else if(data.PlanId != 0){
        q = "UPDATE `comments` SET Status = 0 WHERE id='" + data.PlanId + "' ";
    }

    db.query(q, function(e, teams, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {
                return callback({
                    "statuscode": "200",
                    "status": "success",
                    "msg": 'Comment deleted successfully',
                    "data": teams
                })
            }
    })
}