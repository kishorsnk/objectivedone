import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectionStrategy, TemplateRef } from '@angular/core';
import { AccountService, AlertService } from '@app/_services';
import { User } from '@app/_models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@environments/environment';
import { Location } from "@angular/common";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.less']
})
export class SidebarComponent implements OnInit {
  @ViewChild('team_create_content', { static: true }) team_create_content: TemplateRef<any>;
  @ViewChild('invite_content', { static: true }) invite_content: TemplateRef<any>;

  modalReference = null;
	currentUser:any = [];
  teamData:any = {};
  companyTeams:any = [];
  adminData:any = [];

  user: User;
  inviteByEmailForm: FormGroup;
  inviteByLinkForm: FormGroup;

  role:any;
  currentRole = '';
  teamName = '';
  CurrentUserName = '';  
  submitted = false;
  submittedLink = false;
  forbidden = true;
  invitationLink = '';
  loading = false;
  sidebarMenu:any =[];
  getFullRoute:any;
  constructor(
          private accountService: AccountService,
          private modal: NgbModal,
          private formBuilder: FormBuilder,
          private route: ActivatedRoute,
          private router: Router,
          private alertService: AlertService,
          private toastr: ToastrService,
          private location: Location
        ) {
  	this.user = this.accountService.userValue;
  	this.role = this.user.role;
    this.CurrentUserName = this.user.data[0].UserName;
    //console.log(this.user);
  }

  ngOnInit(){
    this.inviteByEmailForm = this.formBuilder.group({
        companyTeam: ['', Validators.required],
        emails: ['', [Validators.required, this.commaSepEmail]],
        message: ['']
    });

    this.inviteByLinkForm = this.formBuilder.group({
        InviteTeam: ['', Validators.required]
    });

    this.getCompanyTeam();
    this.getTeamsAndMembers();

    this.route.queryParams.subscribe(params => {
      console.log(params);
    });
    this.getFullRoute = this.route;
    console.log(this.route.snapshot.url);
    console.log(window.location.href);
    

  }

 

   commaSepEmail = (control: AbstractControl): { [key: string]: any } | null => {
    const emails = control.value.split(',');
    this.forbidden = emails.some(email => Validators.email(new FormControl(email)));
    return this.forbidden ? { 'emails': { value: control.value } } : null;
  };
  OpenPopup() {
    this.modalReference = this.modal.open(this.team_create_content);
  }
  OpenInvitePopup() {
    this.modalReference = this.modal.open(this.invite_content, { size: 'lg' });
  }

  createTeam(){
    if(this.teamName != ''){

        this.teamData = {'CompanyId': this.user.data[0].CompanyId,'UserId': this.user.data[0].id,'TeamName':this.teamName};

        this.accountService.createTeamforCompany(this.teamData)
            .subscribe((response:any)=>{ 
              //console.log(response);
              if(response.statuscode == 200){
                this.toastr.success(response.msg);
                this.modalReference.close();
              }else{
                this.toastr.error(response.msg);
              }
            });

    }else{
        this.toastr.error('Please enter team name');
    }
  }

  getCompanyTeam(){
    if(this.user.data[0].CompanyId != ''){

        this.teamData = {'CompanyId': this.user.data[0].CompanyId};

        this.accountService.getTeams(this.teamData)
          .subscribe((response:any)=>{ 
            //console.log(response);
            if(response.statuscode == 200){
              this.companyTeams = response.data;
            }else{
              this.toastr.error(response.msg);
            }
        });

    }else{
        this.toastr.error('Company not selected');
    }
  }

  get f() { return this.inviteByEmailForm.controls; }

  onSubmitByEmail(){
    this.submitted = true;

    if (this.inviteByEmailForm.invalid) {
        return;
    }

    //console.log(this.inviteByEmailForm.value);

    
    this.loading = true;
    let base64 = window.btoa(this.user.data[0].UserName);
    this.invitationLink = window.location.origin+'/#/account/join?base='+base64+'&i='+this.user.data[0].CompanyId+'&ti='+this.inviteByEmailForm.value.companyTeam;
     
    const formData = 
      {
        'companyTeam': this.inviteByEmailForm.get('companyTeam').value,
        'Name': this.CurrentUserName,
        'emails': this.inviteByEmailForm.get('emails').value,
        'message': this.inviteByEmailForm.get('message').value,
        'link': this.invitationLink
      };

    //console.log(formData);
    this.accountService.inviteMembers(formData).subscribe((data: any) => {
      console.log(data);
      if (data.status == 'error' || data.status == 'success') {
        this.modalReference.close();
        this.toastr[data.status](data.msg, data.status);
        this.loading = false;
      } else {
        this.toastr['warning'](data.msg, 'Warning!');
        this.loading = false;
      }
    })

  }

  onResetByEMail() {
      this.submitted = false;
      this.inviteByEmailForm.reset();
  }



  get g() { return this.inviteByLinkForm.controls; }
  
  onSubmitByLink(){
    this.submittedLink = true;
    if (this.inviteByLinkForm.invalid) {        
      this.submittedLink = false;
    }else{
      let base64 = window.btoa(this.user.data[0].UserName);
      this.invitationLink = window.location.origin+'/#/account/join?base='+base64+'&i='+this.user.data[0].CompanyId+'&ti='+this.inviteByLinkForm.value.InviteTeam;
    }
  
  }

  copyToClipboard() {
    var copyText = document.getElementById("i_link") as HTMLInputElement;
    copyText.select();
    document.execCommand("copy");
    this.toastr.info('Copied to clipboard');
  }

  getTeamsAndMembers(){
    this.accountService.getTeamsAndMembers(this.teamData).subscribe((data: any) => {
      //console.log(JSON.stringify(data));
      if(data.statuscode == 200){
        this.sidebarMenu = data.data.teams;
      }else{
        this.sidebarMenu = '';
      }
      
    })
  }


  getLink(value,tid,mid) {
    switch (value) {
      case 'team':
        return this.router.navigate(['okr'], { queryParams: { tm: tid,id:tid} });          
      case 'member':
        return this.router.navigate(['okr'], { queryParams: { tm: tid,mid:mid} }); 
      case 'company':
        return this.router.navigate(['okr']);
    }
  }  

}
