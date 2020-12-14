import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectionStrategy, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '@app/_models';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { AccountService, AlertService } from '@app/_services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import * as $ from 'jquery';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

declare var $: any;

@Component({
  selector: 'app-okr',
  templateUrl: './okr.component.html',
  styleUrls: ['./okr.component.less']
})
export class OkrComponent implements OnInit {

  @ViewChild('dueDate_template', { static: true }) dueDate_template: TemplateRef<any>;
  @ViewChild('assign_template', { static: true }) assign_template: TemplateRef<any>;
  @ViewChild('targetvalue', { static: true }) targetvalue: TemplateRef<any>;
  @ViewChild('weightages', { static: true }) weightages: TemplateRef<any>;

	user: User;

	Role:any;
  teamData:any;
	CompanyId:any;
	TeamId:any;
	MemberId:any;
	workingUser:any;
  workingUserName:any;
  workingUserType:any;
	currentQuarter:any;
	currentYear:any;
  editOkrSel:any;
  editOkr:any;
  objOkrs:any = [];
  sidebarMenu:any = [];
  loading = false;
  editObj:any;
  membersMenu:any=[];
  public isCollapsed = false;
  modalReference = null;
  setDueYear:any;
  setDueQuarter:any;
  dueDateobj:any;
  newOkrComment:any;
  editComments:any;
  personalTab = false;
  teamTab = false;
  companyTab = false;
  allPersons:any =[];
  filterargs:any;
  assignOKRSelected = {'AssignUserType': "",'ObjectiveType':"",'CompanyId': "",'MemberId': "",'TeamId': "",'TeamName': "",'UserName': "",'id': ""};
  selectedOKRItem:any;
  selectedType:any;
  selectedWhich:any;
  foundPersonalObj:any=[];
  foundTeamObj:any=[];
  foundCompanyObj:any=[];
  MemId:any;
  gWeightage:any;
  gTargetValue:any;
  wOKrId:any;
  wObjId:any;
  	constructor(
  		private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService,
        private toastr: ToastrService,
        private titleService: Title,
        private modal: NgbModal,
    ) { this.user = this.accountService.userValue; }

  	ngOnInit() {
  		this.titleService.setTitle( 'Quarterly Objectives' );
  		console.log(this.user);
  		this.teamData = {'CompanyId': this.user.data[0].CompanyId};
  		this.setCurrentDate();
      this.getTeamsAndMembers(this.teamData);
      
      this.route.queryParams.subscribe(params => {
        this.TeamId = params.tm;
        this.MemberId = params.mid;
        if(this.TeamId == undefined && this.MemberId == undefined){
          this.workingUser = 'Company';
          this.getCompanyObjective();
        }else if(this.TeamId != undefined && this.MemberId != undefined){
          this.workingUser = 'Member';
          this.getMemberObjective();
        }else{
          this.workingUser = 'Team';
          this.getTeamObjective();
        }
      });

      this.router.routeReuseStrategy.shouldReuseRoute = (params) => {
        this.TeamId = params.queryParams.tm;
        this.MemberId = params.queryParams.mid;

        if(this.TeamId == undefined && this.MemberId == undefined){
          this.workingUser = 'Company';
          this.getCompanyObjective();
        }else if(this.TeamId != undefined && this.MemberId != undefined){
          this.workingUser = 'Member';
          this.getMemberObjective();
        }else{
          this.workingUser = 'Team';
          this.getTeamObjective();
        }
        return false;
      }

      
  	}

    OpenPopup() {
      //this.modalReference = this.modal.open(this.dueDate_template, { size: 'lg' });
      this.modalReference = this.modal.open(this.dueDate_template);
    }

    getTeamsAndMembers(teamData){
      this.accountService.getTeamsAndMembers(teamData).subscribe((data: any) => {
        if(data.statuscode == 200){
          this.sidebarMenu = data.data.teams;
            let i=0;
            for(i=0;i<this.sidebarMenu.length;i++){
              let j=0;
              for(j=0;j<this.sidebarMenu[i].members.length;j++){
                this.membersMenu.push(this.sidebarMenu[i].members[j]);
              }              
            }
          this.setCurrentUserData();
          console.log(this.sidebarMenu);
          console.log(this.membersMenu);
        }else{
          this.sidebarMenu = '';
        }
        
      })
    }

    commentedBy(PostedBy){
      let i =0;
      for(i=0;i<this.membersMenu.length;i++){
        if(PostedBy == this.membersMenu[i].id){
          return this.membersMenu[i].UserName;
        }
      }
    }

    getAssingedUser(userType,userId){
      if(userType == '1'){
        return 'Company';
      }else if(userType == '2'){
          let i=0;
          for(i=0;i<this.sidebarMenu.length;i++){
            if(userId == this.sidebarMenu[i].id){
              return this.sidebarMenu[i].TeamName;
            }
          }
      }else if(userType == '3'){
        let i=0;
        for(i=0;i<this.membersMenu.length;i++){
          if(userId == this.membersMenu[i].id){
            return this.membersMenu[i].UserName;
          }
        }
      }
    }

    getNameSymbol(n) {
        if (n != undefined && n != '') {
            n = n.toUpperCase();
            let nn = n.split(' ');
            if (nn.length > 1) {
                return nn[0][0] + nn[1][0];
            } else {
                return nn[0][0] + nn[0][1];
            }
        }
    }

    getLapsedTime(d) {
        let s = Math.floor(((new Date()).getTime() - (new Date(d)).getTime()) / 1000);
        if (s < 60) return s + ' s';
        s = Math.floor(s / 60);
        if (s < 60) return s + ' m';
        s = Math.floor(s / 60);
        if (s < 60) return s + ' h';
        s = Math.floor(s / 24);
        if (s < 8) return s + ' d';
        s = Math.floor(s / 7);
        if (s < 4) return s + ' w';
        s = Math.floor(s / 4);
        if (s < 12) return s + ' m';
        // s = s / 48;
        // if (s < ) return s + ' m';
        // console.log(s)
        return 1 + 'y ago';
    }

    setCurrentUserData(){
      if(this.TeamId == undefined && this.MemberId == undefined){
        this.workingUserName = this.user.data[0].UserName;
        this.workingUserType = 'Company';
      }else if(this.TeamId != undefined && this.MemberId != undefined){
        let i=0;
        for(i=0;i<this.sidebarMenu.length;i++){
          if(this.sidebarMenu[i].members.length != 0){
            let j=0;
            for(j=0;j<this.sidebarMenu[i].members.length;j++){
              if(this.TeamId == this.sidebarMenu[i].id && this.MemberId == this.sidebarMenu[i].members[j].id){
                this.workingUserName = this.sidebarMenu[i].members[j].UserName;
                this.workingUserType = 'Member';
              }
            }
            
          }
        }
      }else{
        let i=0;
        for(i=0;i<this.sidebarMenu.length;i++){
                    
            if(this.TeamId == this.sidebarMenu[i].id){
              this.workingUserName = this.sidebarMenu[i].TeamName;
              this.workingUserType = 'Team';
            }          
            
          
        }
      }
      
    }

  	setCurrentDate() {
        let today = new Date();
        let m = today.getMonth() + 1;
        this.currentYear = today.getFullYear();

        if (m > 0 && m < 4) {
            this.currentQuarter = '1';
        }
        if (m > 3 && m < 7) {
            this.currentQuarter = '2';
        } if (m > 6 && m < 10) {
            this.currentQuarter = '3';
        } if (m > 9) {
            this.currentQuarter = '4';
        }
    }
    getQuarterDetails(w, y, m) {
          let d = {};
          switch (w) {
              case 'q':
                  if (m > 0 && m < 4) {
                      d = '1';
                  }
                  if (m > 3 && m < 7) {
                      d = '2';
                  } if (m > 6 && m < 10) {
                      d = '3';
                  } if (m > 9) {
                      d = '4';
                  }
                  break;
          }
          return d;
      }


  	Objective(w,event,Iid){	
  		switch (w) {
            case 'add':

            	let fd = new FormData();
          		if(this.workingUser == 'Company'){
                fd.append('ObjectiveName', event.target.children[0].value);
                fd.append('CreatedBy', this.user.data[0].id);   
          		}else if(this.workingUser == 'Member'){
                fd.append('ObjectiveName', event.target.children[0].value);
                fd.append('CompanyId', this.user.data[0].CompanyId);
                fd.append('CreatedBy', this.user.data[0].id);
          		}else{
                fd.append('ObjectiveName', event.target.children[0].value);
                fd.append('CompanyId', this.user.data[0].CompanyId);
                fd.append('CreatedBy', this.user.data[0].id);
              }

            		fd.append('DueYear', this.currentYear);
                fd.append('DueQuarter', this.currentQuarter);
                var object = {};
                fd.forEach(function(value, key){
    				      object[key] = value;
    				    });
    				    var json = JSON.stringify(object);
              	this.accountService.addObjective(object).subscribe((response: any) => {
                    this.toastr[response.status](response.msg, response.status);
                  if (response.statuscode == 200 && response.status == 'success') {	
                      event.target.children[0].value = '';
                      if(this.workingUser == 'Company'){
                        this.getCompanyObjective();
                      }else if(this.workingUser == 'Member'){
                         this.getMemberObjective();
                      }else{
                        this.getTeamObjective();
                      }
                  }
                });
            	break;

            case 'update':
                this.accountService.updateObjective({objid:Iid, ObjectiveName: event.target.children[0].value }).subscribe((response: any) => {
                    this.toastr[response.status](response.msg, response.status);
                    if (response.statuscode == 200 && response.status == 'success') {  
                      event.target.children[0].value = '';
                      this.editObj = '';
                      if(this.workingUser == 'Company'){
                        this.getCompanyObjective();
                      }else if(this.workingUser == 'Member'){
                         this.getMemberObjective();
                      }else{
                        this.getTeamObjective();
                      }
                  }
                });
                break;
            case 'delete':
              if (confirm('Are you sure to delete ?')) {
            	  this.accountService.deleteObjective({objid:Iid}).subscribe((response: any) => {
                    this.toastr[response.status](response.msg, response.status);
                    if (response.statuscode == 200 && response.status == 'success') {  
                      if(this.workingUser == 'Company'){
                        this.getCompanyObjective();
                      }else if(this.workingUser == 'Member'){
                         this.getMemberObjective();
                      }else{
                        this.getTeamObjective();
                      }
                  }
                });
              }
            	break;
        }

        return false;
  	}


    KeyResults(w,event,objId){
      switch (w) {
          case 'add':

            let fd = new FormData();
            if(this.workingUser == 'Company'){
              fd.append('KeyResultName', event.target.children[0].value);
              fd.append('CreatedBy', this.user.data[0].id);
            }else if(this.workingUser == 'Member'){
              fd.append('KeyResultName', event.target.children[0].value);
              fd.append('CreatedBy', this.user.data[0].id);
              console.log(fd);
            }else{
              fd.append('KeyResultName', event.target.children[0].value);
              fd.append('CreatedBy', this.user.data[0].id);
            }
            var object = {};
            fd.forEach(function(value, key){
                object[key] = value;
            });
            var json = JSON.stringify(object);
            //return;
            this.accountService.addOKR(object).subscribe((response: any) => {
                  this.toastr[response.status](response.msg, response.status);
                  if (response.statuscode == 200 && response.status == 'success') {  
                      event.target.children[0].value = '';
                      if(this.workingUser == 'Company'){
                        this.getCompanyObjective();
                      }else if(this.workingUser == 'Member'){
                        this.getMemberObjective();
                      }else{
                        this.getTeamObjective();
                      }
                  }
              });

            break;

          case 'update':
              this.accountService.updateOKR({okrid:objId, KeyResultName: event.target.children[0].value }).subscribe((response: any) => {
                    this.toastr[response.status](response.msg, response.status);
                    if (response.statuscode == 200 && response.status == 'success') {  
                      event.target.children[0].value = '';
                      this.editOkrSel = '';
                      if(this.workingUser == 'Company'){
                        this.getCompanyObjective();
                      }else if(this.workingUser == 'Member'){
                         this.getMemberObjective();
                      }else{
                        this.getTeamObjective();
                      }
                  }
                });
            break;
          case 'delete':
            if (confirm('Are you sure to delete ?')) {
              this.accountService.deleteOKR({okrid:objId}).subscribe((response: any) => {
                  this.toastr[response.status](response.msg, response.status);
                  if (response.statuscode == 200 && response.status == 'success') {  
                    if(this.workingUser == 'Company'){
                      this.getCompanyObjective();
                    }else if(this.workingUser == 'Member'){
                       this.getMemberObjective();
                    }else{
                      this.getTeamObjective();
                    }
                }
              });
            }
            break;
      }

      return false;

    }

    addComment(w, d, id) {
        if (w == 'keyresult') {
            this.accountService.addComment({ 'Message': d.target.children[0].value, 'ObjectiveId': 0, 'OkrId': id, 'PlanId': 0, 'Status': 0 }).subscribe((data: any) => {
                this.toastr[data.status](data.msg, data.status);
                if (data.statuscode == 200 && data.status == 'success') {
                    d.target.children[0].value = '';
                    this.newOkrComment = '';
                    if(this.workingUser == 'Company'){
                      this.getCompanyObjective();
                    }else if(this.workingUser == 'Member'){
                       this.getMemberObjective();
                    }else{
                      this.getTeamObjective();
                    }
                }
            })
        } 
        return false;
    }

    updateComment(w, e, d) {
        let dd = {}
        switch (w) {
            case 'update_comment':
                this.accountService.updateComment({ 'Message': e.target.children[0].value, 'ObjectiveId': 0, 'OkrId': d, 'PlanId': 0, 'Status': 0 }).subscribe((data: any) => {
                    this.toastr[data.status](data.msg, data.status);
                    e.target.children[0].value = '';
                    this.editComments = '';
                    if (data.statuscode == 200 && data.status == 'success') {
                      e.target.children[0].value = '';
                      this.newOkrComment = '';
                      if(this.workingUser == 'Company'){
                        this.getCompanyObjective();
                      }else if(this.workingUser == 'Member'){
                         this.getMemberObjective();
                      }else{
                        this.getTeamObjective();
                      }
                  }
                });
                break;
        }
        return false;
    }

    deleteComment(w, d, e) {
      switch (w) {
        case 'delete_comment':
          if (confirm('Are you sure to delete ?')) {
            this.accountService.deleteComment({'ObjectiveId': 0, 'OkrId': d.id, 'PlanId': 0, 'Status': 0 }).subscribe((response: any) => {
                this.toastr[response.status](response.msg, response.status);
                if (response.statuscode == 200 && response.status == 'success') {  
                  if(this.workingUser == 'Company'){
                    this.getCompanyObjective();
                  }else if(this.workingUser == 'Member'){
                     this.getMemberObjective();
                  }else{
                    this.getTeamObjective();
                  }
              }
            });
          }
      }
      return false;
    }

    getCompanyObjective() {
      if (this.currentYear == null || this.currentQuarter == null) { return; }
      this.accountService.getCompanyObjective({ Year: this.currentYear, Quarter: this.currentQuarter }).subscribe((response: any) => {
            //this.toastr[response.status](response.msg, response.status);
            if (response.statuscode == 200 && response.status == 'success') {  
              this.objOkrs = response.data;
            }else{
              this.objOkrs = [];
            }
            
      })     
    }

    getMemberObjective() {
      if (this.currentYear == null || this.currentQuarter == null) { return; }
      this.accountService.getMemberObjective({ MemberId: this.MemberId, TeamId: this.TeamId, Year: this.currentYear, Quarter: this.currentQuarter }).subscribe((response: any) => {
            //this.toastr[response.status](response.msg, response.status);
            if (response.statuscode == 200 && response.status == 'success') {  
              this.objOkrs = response.data;
            }else{
              this.objOkrs = [];
            }
            console.log(this.objOkrs);
      })     
    }

    getTeamObjective() {
      this.loading = true;
      if (this.currentYear == null || this.currentQuarter == null) { return; }
      this.accountService.getTeamObjective({ MemberId: 0, TeamId: this.TeamId, Year: this.currentYear, Quarter: this.currentQuarter }).subscribe((response: any) => {
            //this.toastr[response.status](response.msg, response.status);
            console.log(response.data);
            if (response.statuscode == 200 && response.status == 'success') {  
              this.objOkrs = response.data;
              this.loading = false;
            }else{
              this.objOkrs = [];
              this.loading = false;
            }
            
      })     
    }

    menuSelected(w, d, e) {
      switch (w) {
        case 'edit_obj':
          console.log(d);
          this.editObj = d;
          setTimeout(() => {
              let elem = (<HTMLInputElement>document.getElementById('obj_edit_input_' + d.id));
              elem.value = d.ObjectiveName;
              elem.focus();
          }, 100);
          $('.dropdown-menu').removeClass('show');
          break;
        case 'edit_okr':
          console.log(d);
          this.editOkr = d;
          this.editOkrSel = d.id;

          setTimeout(() => {
              let elem = (<HTMLInputElement>document.getElementById('okr_edit_input_' + d.id));
              elem.value = d.KeyResultName;
              elem.focus();
          }, 100);
          $('.dropdown-menu').removeClass('show');
          break;
        case 'okr_comment':
          if (this.newOkrComment != d.id) {
              this.newOkrComment = d.id;
              setTimeout(() => {
                  let elem = (<HTMLInputElement>document.getElementById('okr_comment_input_' + d.id));
                  // elem.value = d.Title;
                  elem.focus();
              }, 100);
          } else {
              this.newOkrComment = '';
          }
          break;
        case 'edit_comment':
          this.editComments = d.id;
          setTimeout(() => {
              let elem = (<HTMLInputElement>document.getElementById('edit_comment_field' + d.id));
              elem.value = d.Message;
              elem.focus();
          }, 100);
          break;
      }
    }

    appendText(w, id, t, m) {
        console.log(w, id ,t);
        (<HTMLInputElement>document.getElementById(id)).value += t;
    }

    setDueDate(w, d){
      if (w == 'save_obj') {
        this.accountService.updateObjective({objid:this.dueDateobj, DueYear: this.setDueYear, DueQuarter: d }).subscribe((data: any) => {
          this.toastr[data.status](data.msg, data.status);
          if (data.statuscode == 200 && data.status == 'success') {
              document.getElementById('closeWeeklyModelBTN').click();
              if(this.workingUser == 'Company'){
                this.getCompanyObjective();
              }else if(this.workingUser == 'Member'){
                this.getMemberObjective();
              }else{
                this.getTeamObjective();
              }
          }
        });

      }
      if (w == 'changeYear') {
        this.setDueYear = d.target.value;
      }
      if (w == 'setObj') {
        this.dueDateobj = d.id;
        if (d.DueYear != null) {
            this.setDueYear = d.DueYear;
        } else {
            this.setDueYear = new Date().getFullYear();
        }
        if (d.DueQuarter != null) {
            this.setDueQuarter = d.DueQuarter;
        } else {
            let t = new Date();
            this.setDueQuarter = this.getQuarterDetails('q', '', t.getMonth() + 1);
        }
      }

    }
  
    assignItem(w,item,uType,uId){

      console.log('AssignItem',w,item,uType,uId);
      this.modalReference = this.modal.open(this.assign_template, { size: 'lg' });
      this.selectedType = w;
      this.selectedWhich = uType;
      this.MemId = uId;

      switch (uType) {

        case 'member':
          this.getLinkData({ Type: w, Item: item, Which: uType });
          if(w == 'KeyResult'){
            this.selectedOKRItem = item;
            this.personalTab = true;
            this.teamTab = false;
            this.companyTab = false;   
            //document.getElementById('personal').className +=' show active';  
            //document.getElementById('ppTab').className +=' active';
            $('.ppTab a').addClass('active');
            $('#personal').addClass(' show active');
            $('#team, #company').removeClass(' show active');            
            
          }
        break;

        case 'team':
          this.getLinkData({ Type: w, Item: item, Which: uType });
          if(w == 'KeyResult'){
            this.selectedOKRItem = item;
            this.personalTab = true;
            this.teamTab = true;
            this.companyTab = false;  
            $('.ppTab a').addClass('active');
            $('#personal').addClass(' show active'); 
            $('#team, #company').removeClass(' show active');         
          }
        break;

        case 'company':
          this.getLinkData({ Type: w, Item: item, Which: uType });
          if(w == 'KeyResult'){
            this.selectedOKRItem = item;
            this.personalTab = true;
            this.teamTab = true;
            this.companyTab = true;  
            $('.ppTab a').addClass('active');
            $('#personal').addClass(' show active'); 
            $('#team, #company').removeClass(' show active');            
          }
        break;

      }

    }    

    getLinkData(d) {
      console.log('getLinkData',d);

      this.accountService.getLinkData(d).subscribe((data: any) => {
        if (data.statuscode == 200 && data.status == 'success') {
          if(this.selectedType == 'KeyResult'){
            this.allPersons = data.data;
          }
          if(this.selectedType == 'Objective'){
            this.foundPersonalObj = data.data.personal_objs[0];
            this.foundTeamObj = data.data.team_objs[0];
            this.foundCompanyObj = data.data.company_objs[0];
          }
        }
      });
    }

    assignItemSelected(userType,userInfo){
      userInfo['AssignUserType'] = userType;
      this.assignOKRSelected = userInfo;
      console.log('assignOKRSelected',this.assignOKRSelected);
    }

    submitAssign(){

      if(this.assignOKRSelected.id == ''){
        return;
      }

      let fd = new FormData();

      if(this.selectedWhich == 'member' && this.selectedType == 'KeyResult'){
        fd.append('ObjectiveName', this.selectedOKRItem.KeyResultName);
        fd.append('CompanyId', this.user.data[0].CompanyId);
        fd.append('TeamId', this.assignOKRSelected.TeamId);
      }else if(this.selectedWhich == 'member' && this.selectedType == 'Objective'){
        fd.append('KeyResultName', this.selectedOKRItem.ObjectiveName);
        fd.append('ObjectiveId', this.assignOKRSelected.id);
        if(this.selectedOKRItem.ObjectiveType == '3'){
          fd.append('ObjectiveTypeBy', '3');
          fd.append('userIds', this.selectedOKRItem.MemberId);
        }else if(this.selectedOKRItem.ObjectiveType == '2'){
          fd.append('ObjectiveTypeBy', '2');
          fd.append('userIds', this.selectedOKRItem.TeamId);
        }else if(this.selectedOKRItem.ObjectiveType == '1'){
          fd.append('ObjectiveTypeBy', '1');
          fd.append('userIds', this.selectedOKRItem.CompanyId);
        }
        fd.append('ObjectiveType', this.assignOKRSelected.ObjectiveType);   
        fd.append('DueQuarter', this.currentQuarter);
      }else if(this.selectedWhich == 'team' && this.selectedType == 'KeyResult'){
        fd.append('ObjectiveName', this.selectedOKRItem.KeyResultName);
        if(this.assignOKRSelected.AssignUserType == 'member'){
          fd.append('CompanyId', this.user.data[0].CompanyId);
          fd.append('ObjectiveType', '3');
        }else if(this.assignOKRSelected.AssignUserType == 'team'){
          fd.append('CompanyId', this.user.data[0].CompanyId);
        }        
        fd.append('Status', '1');
        fd.append('CreatedBy', this.user.data[0].id);
      }else if(this.selectedWhich == 'team' && this.selectedType == 'Objective'){
        fd.append('KeyResultName', this.selectedOKRItem.ObjectiveName);
        fd.append('ObjectiveId', this.assignOKRSelected.id);
        if(this.selectedOKRItem.ObjectiveType == '3'){
          fd.append('ObjectiveTypeBy', '3');
          fd.append('userIds', this.selectedOKRItem.MemberId);
        }else if(this.selectedOKRItem.ObjectiveType == '2'){
          fd.append('ObjectiveTypeBy', '2');
          fd.append('userIds', this.selectedOKRItem.TeamId);
        }else if(this.selectedOKRItem.ObjectiveType == '1'){
          fd.append('ObjectiveTypeBy', '1');
          fd.append('userIds', this.selectedOKRItem.CompanyId);
        }
        fd.append('ObjectiveType', this.assignOKRSelected.ObjectiveType);        
        fd.append('Status', '1');
        fd.append('ProgressValue', this.selectedOKRItem.ProgressValue);
        fd.append('AssignedByObj', this.selectedOKRItem.id);
        fd.append('CreatedBy', this.user.data[0].id);        
        fd.append('DueYear', this.currentYear);
        fd.append('DueQuarter', this.currentQuarter);
      }else if(this.selectedWhich == 'company' && this.selectedType == 'KeyResult'){
        fd.append('ObjectiveName', this.selectedOKRItem.KeyResultName);
        if(this.assignOKRSelected.AssignUserType == 'member'){
          fd.append('CompanyId', this.user.data[0].CompanyId);
          fd.append('ObjectiveType', '3');
        }else if(this.assignOKRSelected.AssignUserType == 'team'){
          fd.append('CompanyId', this.user.data[0].CompanyId);
          fd.append('ObjectiveType', '2');
        }else if(this.assignOKRSelected.AssignUserType == 'company'){
          fd.append('CompanyId', this.user.data[0].CompanyId);
          fd.append('ObjectiveType', '1');
        }        
        fd.append('Status', '1');
        fd.append('CreatedBy', this.user.data[0].id);
        fd.append('AssignedByOkr', this.selectedOKRItem.id);
        fd.append('AssignedByUserType', '1');
        fd.append('AssignedByUser', this.MemId);
        fd.append('DueYear', this.currentYear);
        fd.append('DueQuarter', this.currentQuarter);
      }else if(this.selectedWhich == 'company' && this.selectedType == 'Objective'){
        fd.append('KeyResultName', this.selectedOKRItem.ObjectiveName);
        fd.append('ObjectiveId', this.assignOKRSelected.id);
        if(this.selectedOKRItem.ObjectiveType == '3'){
          fd.append('ObjectiveTypeBy', '3');
          fd.append('userIds', this.selectedOKRItem.MemberId);
        }else if(this.selectedOKRItem.ObjectiveType == '2'){
          fd.append('ObjectiveTypeBy', '2');
          fd.append('userIds', this.selectedOKRItem.TeamId);
        }else if(this.selectedOKRItem.ObjectiveType == '1'){
          fd.append('ObjectiveTypeBy', '1');
          fd.append('userIds', this.selectedOKRItem.CompanyId);
        }
        fd.append('ObjectiveType', this.assignOKRSelected.ObjectiveType);        
        fd.append('Status', '1');
        fd.append('ProgressValue', this.selectedOKRItem.ProgressValue);
        fd.append('AssignedByObj', this.selectedOKRItem.id);
        fd.append('CreatedBy', this.user.data[0].id);        
        fd.append('DueYear', this.currentYear);
        fd.append('DueQuarter', this.currentQuarter);
      }

      var object = {};
      fd.forEach(function(value, key){
        object[key] = value;
      });
      var json = JSON.stringify(object);
      console.log('object',object);
      //return;
      if(this.selectedType == 'KeyResult'){
        this.accountService.assignOkrAsObjective(object).subscribe((response: any) => {
            this.toastr[response.status](response.msg, response.status);
            if (response.statuscode == 200 && response.status == 'success') { 
                document.getElementById('closeAssignPopup').click();
                if(this.workingUser == 'Company'){
                  this.getCompanyObjective();
                }else if(this.workingUser == 'Member'){
                   this.getMemberObjective();
                }else{
                  this.getTeamObjective();
                }
            }
        });
      }
      if(this.selectedType == 'Objective'){
        this.accountService.assignObjectiveAsOkr(object).subscribe((response: any) => {
            this.toastr[response.status](response.msg, response.status);
          if (response.statuscode == 200 && response.status == 'success') { 
              document.getElementById('closeAssignPopup').click();
              if(this.workingUser == 'Company'){
                this.getCompanyObjective();
              }else if(this.workingUser == 'Member'){
                 this.getMemberObjective();
              }else{
                this.getTeamObjective();
              }
          }
        });
      }
      

    }

    getAssignUser(toUser){
      console.log(toUser);
      /*let toUsers = {'objId':toUser};
      this.accountService.getUserByObjective(toUsers).subscribe((response: any) => {
             console.log(response);

            return toUser;
          });*/
    }

    UnlinkFromObjective(userType,okrId){
        let linkData = {'userType':userType,'okrId':okrId};
        this.accountService.UnlinkFromObjective(linkData).subscribe((response: any) => {
          this.toastr[response.status](response.msg, response.status);
          if (response.statuscode == 200 && response.status == 'success') {
              if(this.workingUser == 'Company'){
                this.getCompanyObjective();
              }else if(this.workingUser == 'Member'){
                 this.getMemberObjective();
              }else{
                this.getTeamObjective();
              }
          }
        });
    }

    UnlinkFromKeyResult(userType,objId){
        let linkData = {'userType':userType,'objId':objId};
        this.accountService.UnlinkFromKeyResult(linkData).subscribe((response: any) => {
          this.toastr[response.status](response.msg, response.status);
          if (response.statuscode == 200 && response.status == 'success') {
              if(this.workingUser == 'Company'){
                this.getCompanyObjective();
              }else if(this.workingUser == 'Member'){
                 this.getMemberObjective();
              }else{
                this.getTeamObjective();
              }
          }
        });
    }

    okrProgress(event,okrId,objId,okrTl){
      console.log(event.target.value,okrId,objId);
      setTimeout(() => {
        //return;
        this.accountService.updateOKRProgress({newValue:event.target.value, okrId:okrId, objId:objId,CreatedBy:this.user.data[0].id}).subscribe((response: any) => {
            //this.toastr[response.status](response.msg, response.status);
            if (response.statuscode == 200 && response.status == 'success') {  
              //event.target.children[0].value = '';
              //this.editOkrSel = '';
              if(this.workingUser == 'Company'){
                this.getCompanyObjective();
              }else if(this.workingUser == 'Member'){
                 this.getMemberObjective();
              }else{
                this.getTeamObjective();
              }
          }
        });
      }, 2000);
    }

    TargetValue(evn,wht,okrId,objId){
      this.modalReference = this.modal.open(this.targetvalue);
      this.gTargetValue = wht;
      this.wOKrId = okrId;
      this.wObjId = objId;
    }


    setTargetValue(){
      this.accountService.updateTargetValue({TargetValue:this.gTargetValue, okrId:this.wOKrId, objId:this.wObjId}).subscribe((response: any) => {
          //this.toastr[response.status](response.msg, response.status);
          if (response.statuscode == 200 && response.status == 'success') {  
            document.getElementById('closeWeeklyModelBTN').click();
            if(this.workingUser == 'Company'){
              this.getCompanyObjective();
            }else if(this.workingUser == 'Member'){
               this.getMemberObjective();
            }else{
              this.getTeamObjective();
            }
        }
      });
    }

    Weightage(evn,wht,okrId,objId){
      this.modalReference = this.modal.open(this.weightages);
      this.gWeightage = wht;
      this.wOKrId = okrId;
      this.wObjId = objId;
    }

    setWeightage(){
      this.accountService.updateWeightage({Weightage:this.gWeightage, okrId:this.wOKrId, objId:this.wObjId}).subscribe((response: any) => {
          //this.toastr[response.status](response.msg, response.status);
          if (response.statuscode == 200 && response.status == 'success') {  
            document.getElementById('closeWeeklyModelBTN').click();
            if(this.workingUser == 'Company'){
              this.getCompanyObjective();
            }else if(this.workingUser == 'Member'){
               this.getMemberObjective();
            }else{
              this.getTeamObjective();
            }
        }
      });
    }


}
