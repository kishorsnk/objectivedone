var db = require('../config/database');
var config = require('../config/general');
var md5 = require('md5');
var jwt = require('jsonwebtoken');
var common = require('../models/common');
var bcrypt = require('bcryptjs');
var crypto = require('crypto');
var dateFormat = require('dateformat');



module.exports.getLinkData = (data, uData, callback) => {
   console.log(data, uData);

    if(data.Type == 'KeyResult'){
       var q ="SELECT us.id,us.UserName,us.CompanyId,mm.TeamId,tm.TeamName FROM members mm INNER JOIN `users` us ON us.id = mm.UserId INNER JOIN `team` tm ON tm.id = mm.TeamId WHERE us.IsActive = 1 AND us.CompanyId = '" + uData.CompanyId + "'";

        db.query(q, function(e, users, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {
                var qq ="SELECT * FROM `team` WHERE IsActive = 1 AND CompanyId = '" + uData.CompanyId + "'";
                db.query(qq, function(e, teams, fields) {
                    if (e) {
                        return callback({
                            "statuscode": "203",
                            "status": "error",
                            "msg": 'something went wrong',
                            "error": e
                        })
                    } else {
                        var list = {};
                        list['persons'] = users;
                        list['team'] = teams;

                        var qqq ="SELECT * FROM `company` WHERE IsActive = 1 AND id = '" + uData.CompanyId + "'";
                        db.query(qqq, function(e, company, fields) {
                            if (e) {
                                return callback({
                                    "statuscode": "203",
                                    "status": "error",
                                    "msg": 'something went wrong',
                                    "error": e
                                })
                            } else {
                                list['company'] = company;
                                return callback({
                                    "statuscode": "200",
                                    "status": "success",
                                    "msg": 'Personal list',
                                    "data" : list
                                })

                            }
                        });
                        
                    }
                })
                
            }
        })
    }

    if(data.Type == 'Objective'){

        var list = {};
        list['personal_objs'] = [];
        list['company_objs'] = [];
        list['team_objs'] = [];

        var q = "SELECT ob.id,ob.ObjectiveName,ob.ProgressValue,ob.CompanyId,ob.TeamId,ob.MemberId,ob.ObjectiveType,us.UserName,tm.TeamName FROM `objectives` ob INNER JOIN `users` us ON us.id = ob.MemberId INNER JOIN `team` tm ON tm.id = ob.TeamId WHERE ob.CompanyId = '"+ uData.CompanyId + "' AND ob.ObjectiveType = '3'";
        db.query(q, function(e, objList, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {
                list['personal_objs'].push(objList);
                var q = "SELECT ob.id,ob.ObjectiveName,ob.ProgressValue,ob.CompanyId,ob.TeamId,ob.MemberId,ob.ObjectiveType,cm.Name AS CompanyName FROM `objectives` ob INNER JOIN `company` cm ON cm.id = ob.CompanyId WHERE ob.CompanyId = '"+ uData.CompanyId + "' AND ob.ObjectiveType = '1'";
                db.query(q, function(e, objList, fields) {
                    if (e) {
                        return callback({
                            "statuscode": "203",
                            "status": "error",
                            "msg": 'something went wrong',
                            "error": e
                        })
                    } else {
                        list['company_objs'].push(objList);
                        var q = "SELECT ob.id,ob.ObjectiveName,ob.ProgressValue,ob.CompanyId,ob.TeamId,ob.MemberId,ob.ObjectiveType,tm.TeamName FROM `objectives` ob INNER JOIN `team` tm ON tm.id = ob.TeamId WHERE ob.CompanyId = '"+ uData.CompanyId + "' AND ob.ObjectiveType = '2'";
                        db.query(q, function(e, objList, fields) {
                            if (e) {
                                return callback({
                                    "statuscode": "203",
                                    "status": "error",
                                    "msg": 'something went wrong',
                                    "error": e
                                })
                            } else {
                                list['team_objs'].push(objList);
                                return callback({
                                    "statuscode": "200",
                                    "status": "success",
                                    "msg": 'Personal list',
                                    "data" : list
                                })
                            }
                        })

                    }
                })

            }
        })

    }

    

}

var getAdmin = (admin_Id, next) => {

    q = 'SELECT * FROM users WHERE Id="' + admin_Id + '"';
    db.query(q, function(err, admin, fields) {
        if (err) {
            next(err, '');
        } else {
            next(err, admin);
        }
    })
}

var getMembers = (member_ids, next) => {

    q = "SELECT m.UserId as id,m.TeamId,u.UserName FROM members m INNER JOIN users u ON u.id = m.UserId WHERE TeamId IN (" + member_ids + ")";
    db.query(q, function(err, membersList, fields) {
        //console.log('mm', membersList, err)
        if (err) {
            next(err, '');
        } else {
            next(err, membersList);
        }
    })
}

function getOBJS(data, next) {
    q = 'SELECT * FROM objectives WHERE UserId="' + data.userid + '" AND TeamId="' + data.teamid + '" AND MemberId="' + data.memberid + '" WHERE IsActive = 1';
    db.query(q, function(err, objectivesList, fields) {
        if (err) {
            next(err, '');
        } else {
            next(err, objectivesList);
        }
    })
}

function getOKRS(obj_id, next) {

    q = 'SELECT * FROM keyresults WHERE ObjectiveId IN (' + obj_id + ') AND IsActive =1';
    db.query(q, function(err, okrList, fields) {
        if (err) {
            next(err, '');
        } else {
            next(err, okrList);
        }
    })
}

function getComments(obj_id, okr_id, next) {
    // console.log(obj_id, okr_id)
    var c_list = []
    // console.log(c_list.constructor)
    if (obj_id != undefined && obj_id != '') {
        c_list.push('ObjectiveId IN (' + obj_id + ')');
    }
    if (okr_id != undefined && okr_id != '') {
        c_list.push('OkrId IN (' + okr_id + ')');
    }
    q = "SELECT * FROM comments ";
    if (c_list.length > 0) {
        q += "WHERE " + c_list.join(" OR ");
        q += " AND Status = 1";
    }
    //console.log('comment',q);
    db.query(q, function(err, CommentList, fields) {
        if (err) {
            next(err, '');
        } else {

            // for()
            // console.log(CommentList[2].PostedBy)

            next(err, CommentList);
        }
    })
}

module.exports.getAllUsers = function(data, uData, callback) {
    //console.log('ddtata',data);
    q = "SELECT * FROM users";
    db.query(q, function(e, users, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {

                return callback(users);
            }
    })         
}

module.exports.getAllCompanies = function(data, uData, callback) {
    q = "SELECT * FROM users WHERE UserTypeId = '1'";
    db.query(q, function(e, users, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {
                return callback(users);
            }
    })         
}

module.exports.getAllMembers = function(data, uData, callback) {
    q = "SELECT * FROM users WHERE UserTypeId = '3' AND CompanyId = '"+data.CompanyId+"'";
    db.query(q, function(e, users, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {
                return callback(users);
            }
    })         
}

module.exports.getAllMentors = function(data, uData, callback) {
    q = "SELECT * FROM users WHERE UserTypeId = '2'";
    db.query(q, function(e, users, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {
                return callback(users);
            }
    })         
}

module.exports.getAllocatedMentors = function(data, uData, callback) {
    q = "SELECT u.id,u.UserName FROM users u INNER JOIN allocatementor a ON a.MentorId = "+data.id+" WHERE u.id = a.CompanyId";
    db.query(q, function(e, users, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {
                return callback(users);
            }
    })         
}

module.exports.updateAllocateMentors = function(data, uData, callback) {
    q = "DELETE FROM allocatementor WHERE MentorId= '" + data[0].MentorId + "'";
    db.query(q, data.data, function(e, result, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {
                var values = [];
                for(var i=0; i<data.length; i++){
                    values.push([CompanyId= data[i].CompanyId, MentorId= data[i].MentorId])
                }
                q = "INSERT INTO `allocateMentor` (`CompanyId`, `MentorId`) VALUES ?";

                db.query(q, [values], function(e, users, fields) {
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
                                "msg": 'Mentor allocated successfully'
                            })
                        }
                }) 
            }
    })       
}

module.exports.updateCompanyStatus = function(data, uData, callback) {
    q = "UPDATE users SET IsActive='"+ data.IsActive +"' WHERE id='" + data.id + "' ";
    db.query(q, function(e, users, fields) {
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
                    "msg": 'User updated successfully'
                })
            }
    })         
}

module.exports.updateMemberStatus = function(data, uData, callback) {
    q = "UPDATE users SET IsActive='"+ data.IsActive +"' WHERE id='" + data.id + "' ";
    db.query(q, function(e, users, fields) {
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
                    "msg": 'Member updated successfully'
                })
            }
    })         
}


module.exports.UpdateUserPassword = function(data, uData, callback) {
    //console.log('ddtata',data);
    var pass ='';
    //const salt = bcrypt.genSalt(20);
      pass = crypto.createHash('md5').update(data.Password).digest("hex");
    var q = "UPDATE team_members SET Password='"+ pass +"' WHERE Id='" + data.Id + "'";
    db.query(q, data.data, function(err, result, fields) {
        if (err) {
            return callback({ "statuscode": "203", "status": "error", "msg": "Error occurered while updating password", "error": err });
        } else {
            if (result.affectedRows > 0) {
                return callback({ "statuscode": "200", "status": "success", "msg": "Password added successfully" });
            } else {
                return callback({ "statuscode": "203", "status": "warning", "msg": "Password not updated " });
            }
        }
    })        
}

module.exports.DeleteSelectedUser = function(data, uData, callback) {
    //console.log('ddtata',data);
    var q = "DELETE FROM team_members WHERE Id='" + data.Id + "'";
    db.query(q, data.data, function(err, result, fields) {
        if (err) {
            return callback({ "statuscode": "203", "status": "error", "msg": "Error occurered while deleting user", "error": err });
        } else {
            if (result.affectedRows > 0) {
                return callback({ "statuscode": "200", "status": "success", "msg": "User deleted successfully" });
            } else {
                return callback({ "statuscode": "203", "status": "warning", "msg": "User not deleted updated " });
            }
        }
    })        
}


module.exports.registerMentor = function(data, uData, callback) {
    q = "INSERT INTO `users` (`UserTypeId`, `UserName`, `Phone`, `Email`, `Password`, `JobPosition`, `IsActive`, `CreatedDate`) VALUES ('"+data.Role+"','"+data.Name+"','"+data.Phone+"','"+data.Email+"','"+md5(data.Password)+"','"+data.JobPosition+"',1,'"+ dateFormat(new Date(), 'yyyy-mm-dd 00:00:00') +"')";
    db.query(q, function(e, users, fields) {
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
                    "msg": 'Mentor added successfully'
                })
            }
    })         
}

module.exports.allocateMentors = function(data, uData, callback) {
    var values = [];
    for(var i=0; i<data.length; i++){
        values.push([CompanyId= data[i].CompanyId, MentorId= data[i].MentorId])
    }
    q = "INSERT INTO `allocateMentor` (`CompanyId`, `MentorId`) VALUES ?";
    db.query(q, [values], function(e, users, fields) {
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
                    "msg": 'Mentor allocated successfully'
                })
            }
    })         
}


module.exports.getTeamsAndMembers = function(data, uData, callback) {
    q = "SELECT * FROM team WHERE CompanyId = '5'";
    db.query(q, function(err, teams, fields) {
        if (err) {
            return c({
                "statuscode": "203",
                "status": "error",
                "msg": 'something went wrong',
                "error": err
            });
        } else {

            var teams_id = [];
            var members_id = [];
            var teamList = [];
            var default_team = '';


            if (teams.length < 1) {
                return c({
                    "statuscode": "200",
                    "status": "success",
                    "data": { teams: teamList }
                })
            }



            teamList = teams;

            teams.forEach((t, index) => {
                teams_id.push(t.id)
                if (teamList[index].TeamType == 1) {
                    default_team = teamList[index];
                }
            });

            getAdmin(default_team.UserId, (e, admin_details) => {
                if (err) {
                    return callback({
                        "statuscode": "203",
                        "status": "error",
                        "msg": 'something went wrong',
                        "error": err
                    })
                } else {

                    if (admin_details.length > 0) {

                        teamList.forEach((t, index) => {
                            teamList[index]['members'] = [];
                            if (t.TeamType == 1) {
                                teamList[index]['members'].push(admin_details[0]);
                                members_id.push(admin_details[0].Id)
                            }
                        });

                        getMembers(teams_id.join(','), (e, membersList) => {
                            //console.log('membersList',membersList);
                            if (e) {
                                return callback({
                                    "statuscode": "203",
                                    "status": "error",
                                    "msg": 'something went wrong',
                                    "error": e
                                })
                            } else {

                                // for (var i = 0; i < teamList.length; i++) {
                                //     for (var j = 0; j < teamList[i]['members'].length; j++) {
                                //         teamList[i]['members'][j]['plans'] = { done: [], plans: [], problems: [] };
                                //     }
                                // }

                                membersList.forEach((t, index) => {
                                    members_id.push(t.id)

                                });

                                for (var i = 0; i < teamList.length; i++) {
                                    for (var j = 0; j < membersList.length; j++) {

                                        if (teamList[i].id == membersList[j].TeamId) {

                                            teamList[i]['members'].push(membersList[j]);
                                            // teamList[i]['members'][j]['plans']={ done: [], plans: [], problems: [] };
                                        }

                                    }
                                }

                                // for (var i = 0; i < teamList.length; i++) {
                                //     for (var j = 0; j < teamList[i]['members'].length; j++) {
                                //         teamList[i]['members'][j]['plans'] = { done: [], plans: [], problems: [] };
                                //     }
                                // }

                                return callback({
                                    "statuscode": "200",
                                    "status": "success",
                                    "data": { teams: teamList }
                                });

                            }
                        })

                    }


                }
            });

        }
    })
}

module.exports.getCompanyObjective = function(data, uData, callback) {

    q = "SELECT * FROM objectives WHERE CompanyId='" + uData.CompanyId + "' AND TeamId='0' AND MemberId='0' AND DueYear='" + data.Year + "' AND DueQuarter='" + data.Quarter + "' AND IsActive = '1'";
    
    db.query(q, function(e, Objectives, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {
                var obj_ids = [];
                var okr_ids = [];
                var obj = [];

                if (Objectives.length < 1) {
                    return callback({
                        "statuscode": "200",
                        "status": "success",
                        "data": obj
                    })
                }

                obj = Objectives;
                for (var i = 0; i < obj.length; i++) {
                    obj_ids.push(obj[i].id);
                    obj[i]['comments'] = [];
                    obj[i]['okrs'] = [];
                }

                getOKRS(obj_ids.join(","), (e, OkrList) => {
                    if (e) {
                        return callback({
                            "statuscode": "203",
                            "status": "error",
                            "msg": 'something went wrong',
                            "error": e
                        })
                    } else {
                        var o_v = 0;
                        var okr = 0;
                        if (OkrList.length > 0) {
                            for (var i = 0; i < obj.length; i++) {
                                var t_v = 0;
                                for (var j = 0; j < OkrList.length; j++) {
                                    if (obj[i].id == OkrList[j].ObjectiveId) {
                                        t_v += parseInt(OkrList[j].Value, 10);
                                        obj[i]['okrs'].push(OkrList[j]);
                                        okr++;
                                        okr_ids.push(OkrList[j].id);
                                    }
                                }
                                if (obj[i]['okrs'].length > 0) {
                                    obj[i]['average_okr'] = Math.round(t_v / obj[i]['okrs'].length);
                                } else {
                                    obj[i]['average_okr'] = 0;
                                }


                                if (obj[i]['average_okr'] >= 0) {
                                    o_v += parseInt(obj[i]['average_okr'], 10);
                                }
                            }
                        }
                        for (var i = 0; i < obj.length; i++) {
                            // console.log(obj[i]['average_okr'])
                        }
                        obj[0]['company_average'] = Math.round(o_v / obj.length);
                        getComments(obj_ids.join(","), okr_ids.join(","), (e, CommentList) => {

                            if (e) {
                                return callback({
                                    "statuscode": "203",
                                    "status": "error",
                                    "msg": 'something went wrong',
                                    "error": e
                                })
                            } else {
                                for (var i = 0; i < CommentList.length; i++) {
                                    for (var j = 0; j < obj.length; j++) {
                                        if (obj[j].id == CommentList[i].OkrId) {
                                            // console.log(CommentList[i].PostedBy)
                                            if (CommentList[i].PostedBy == 0) {
                                                CommentList[i].PostedBy = 'Admin'
                                            }

                                            obj[j]['comments'].push(CommentList[i]);
                                        }
                                        for (var k = 0; k < obj[j]['okrs'].length; k++) {
                                            obj[j]['okrs'][k]['comments'] = []
                                        }
                                    }
                                }

                                for (var i = 0; i < CommentList.length; i++) {
                                    for (var j = 0; j < obj.length; j++) {
                                        // if (obj[j].Id == CommentList[i].ObjectiveId) {
                                        //     obj[j]['comments'].push(CommentList[i]);
                                        // }
                                        for (var k = 0; k < obj[j]['okrs'].length; k++) {
                                            // obj[j]['okrs'][k]['comments']=[]
                                            if (obj[j]['okrs'][k].id == CommentList[i].OkrId) {
                                                obj[j]['okrs'][k]['comments'].push(CommentList[i]);
                                            }
                                        }
                                    }
                                }
                                return callback({
                                    "statuscode": "200",
                                    "status": "success",
                                    "data": obj
                                })
                            }
                        });
                    }
                });

            }
    });
};


module.exports.getMemberObjective = function(data, uData, callback) {
    q = "SELECT * FROM objectives WHERE CompanyId='" + uData.CompanyId + "' AND TeamId='" + data.TeamId + "' AND MemberId='" + data.MemberId + "' AND DueYear='" + data.Year + "' AND DueQuarter='" + data.Quarter + "' AND IsActive = '1'";
    db.query(q, function(e, Objectives, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {
                var obj_ids = [];
                var okr_ids = [];
                var obj = [];

                if (Objectives.length < 1) {
                    return callback({
                        "statuscode": "200",
                        "status": "success",
                        "data": obj
                    })
                }

                obj = Objectives;
                for (var i = 0; i < obj.length; i++) {
                    obj_ids.push(obj[i].id);
                    obj[i]['comments'] = [];
                    obj[i]['okrs'] = [];
                }

                getOKRS(obj_ids.join(","), (e, OkrList) => {
                    if (e) {
                        return callback({
                            "statuscode": "203",
                            "status": "error",
                            "msg": 'something went wrong',
                            "error": e
                        })
                    } else {
                        var o_v = 0;
                        var okr = 0;
                        if (OkrList.length > 0) {
                            for (var i = 0; i < obj.length; i++) {
                                var t_v = 0;
                                for (var j = 0; j < OkrList.length; j++) {
                                    if (obj[i].id == OkrList[j].ObjectiveId) {
                                        t_v += parseInt(OkrList[j].Value, 10);
                                        obj[i]['okrs'].push(OkrList[j]);
                                        okr++;
                                        okr_ids.push(OkrList[j].id);
                                    }
                                }
                                if (obj[i]['okrs'].length > 0) {
                                    obj[i]['average_okr'] = Math.round(t_v / obj[i]['okrs'].length);
                                } else {
                                    obj[i]['average_okr'] = 0;
                                }


                                if (obj[i]['average_okr'] >= 0) {
                                    o_v += parseInt(obj[i]['average_okr'], 10);
                                }
                            }
                        }
                        for (var i = 0; i < obj.length; i++) {
                            // console.log(obj[i]['average_okr'])
                        }
                        obj[0]['company_average'] = Math.round(o_v / obj.length);
                        getComments(obj_ids.join(","), okr_ids.join(","), (e, CommentList) => {

                            if (e) {
                                return callback({
                                    "statuscode": "203",
                                    "status": "error",
                                    "msg": 'something went wrong',
                                    "error": e
                                })
                            } else {
                                for (var i = 0; i < CommentList.length; i++) {
                                    for (var j = 0; j < obj.length; j++) {
                                        if (obj[j].id == CommentList[i].OkrId) {
                                            // console.log(CommentList[i].PostedBy)
                                            if (CommentList[i].PostedBy == 0) {
                                                CommentList[i].PostedBy = 'Admin'
                                            }

                                            obj[j]['comments'].push(CommentList[i]);
                                        }
                                        for (var k = 0; k < obj[j]['okrs'].length; k++) {
                                            obj[j]['okrs'][k]['comments'] = []
                                        }
                                    }
                                }

                                for (var i = 0; i < CommentList.length; i++) {
                                    for (var j = 0; j < obj.length; j++) {
                                        // if (obj[j].Id == CommentList[i].ObjectiveId) {
                                        //     obj[j]['comments'].push(CommentList[i]);
                                        // }
                                        for (var k = 0; k < obj[j]['okrs'].length; k++) {
                                            // obj[j]['okrs'][k]['comments']=[]
                                            if (obj[j]['okrs'][k].id == CommentList[i].OkrId) {
                                                obj[j]['okrs'][k]['comments'].push(CommentList[i]);
                                            }
                                        }
                                    }
                                }
                                return callback({
                                    "statuscode": "200",
                                    "status": "success",
                                    "data": obj
                                })
                            }
                        });
                    }
                });

            }
    });
};

module.exports.getTeamObjective = function(data, uData, callback) {
    //console.log(data, uData);
    q = "SELECT * FROM objectives WHERE CompanyId='" + uData.CompanyId + "' AND TeamId='" + data.TeamId + "' AND MemberId='0' AND DueYear='" + data.Year + "' AND DueQuarter='" + data.Quarter + "' AND IsActive = '1'";
    //console.log('q',q);
    db.query(q, function(e, Objectives, fields) {
            if (e) {
                return callback({
                    "statuscode": "203",
                    "status": "error",
                    "msg": 'something went wrong',
                    "error": e
                })
            } else {
                var obj_ids = [];
                var okr_ids = [];
                var obj = [];

                if (Objectives.length < 1) {
                    return callback({
                        "statuscode": "200",
                        "status": "success",
                        "data": obj
                    })
                }

                obj = Objectives;
                for (var i = 0; i < obj.length; i++) {
                    obj_ids.push(obj[i].id);
                    obj[i]['comments'] = [];
                    obj[i]['okrs'] = [];
                }

                getOKRS(obj_ids.join(","), (e, OkrList) => {
                    if (e) {
                        return callback({
                            "statuscode": "203",
                            "status": "error",
                            "msg": 'something went wrong',
                            "error": e
                        })
                    } else {
                        var o_v = 0;
                        var okr = 0;
                        if (OkrList.length > 0) {
                            for (var i = 0; i < obj.length; i++) {
                                var t_v = 0;
                                for (var j = 0; j < OkrList.length; j++) {
                                    if (obj[i].id == OkrList[j].ObjectiveId) {
                                        t_v += parseInt(OkrList[j].Value, 10);
                                        obj[i]['okrs'].push(OkrList[j]);
                                        okr++;
                                        okr_ids.push(OkrList[j].id);
                                    }
                                }
                                if (obj[i]['okrs'].length > 0) {
                                    obj[i]['average_okr'] = Math.round(t_v / obj[i]['okrs'].length);
                                } else {
                                    obj[i]['average_okr'] = 0;
                                }


                                if (obj[i]['average_okr'] >= 0) {
                                    o_v += parseInt(obj[i]['average_okr'], 10);
                                }
                            }
                        }
                        for (var i = 0; i < obj.length; i++) {
                            // console.log(obj[i]['average_okr'])
                        }
                        obj[0]['company_average'] = Math.round(o_v / obj.length);
                        getComments(obj_ids.join(","), okr_ids.join(","), (e, CommentList) => {

                            if (e) {
                                return callback({
                                    "statuscode": "203",
                                    "status": "error",
                                    "msg": 'something went wrong',
                                    "error": e
                                })
                            } else {
                                for (var i = 0; i < CommentList.length; i++) {
                                    for (var j = 0; j < obj.length; j++) {
                                        if (obj[j].id == CommentList[i].OkrId) {
                                            // console.log(CommentList[i].PostedBy)
                                            if (CommentList[i].PostedBy == 0) {
                                                CommentList[i].PostedBy = 'Admin'
                                            }

                                            obj[j]['comments'].push(CommentList[i]);
                                        }
                                        for (var k = 0; k < obj[j]['okrs'].length; k++) {
                                            obj[j]['okrs'][k]['comments'] = []
                                        }
                                    }
                                }

                                for (var i = 0; i < CommentList.length; i++) {
                                    for (var j = 0; j < obj.length; j++) {
                                        // if (obj[j].Id == CommentList[i].ObjectiveId) {
                                        //     obj[j]['comments'].push(CommentList[i]);
                                        // }
                                        for (var k = 0; k < obj[j]['okrs'].length; k++) {
                                            // obj[j]['okrs'][k]['comments']=[]
                                            if (obj[j]['okrs'][k].id == CommentList[i].OkrId) {
                                                obj[j]['okrs'][k]['comments'].push(CommentList[i]);
                                            }
                                        }
                                    }
                                }
                                return callback({
                                    "statuscode": "200",
                                    "status": "success",
                                    "data": obj
                                })
                            }
                        });
                    }
                });

            }
    });
};