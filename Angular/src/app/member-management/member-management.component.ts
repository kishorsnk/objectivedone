import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '@app/_models';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { AccountService, AlertService } from '@app/_services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-member-management',
  templateUrl: './member-management.component.html',
  styleUrls: ['./member-management.component.less']
})
export class MemberManagementComponent implements OnInit {

  	user: User;
	allMembers:any = [];
	activeNo = {};

  	p=1;
    loading = false;

	constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService,
        private toastr: ToastrService
	) {
	    this.user = this.accountService.userValue;
	}

  	ngOnInit(): void {
  		if(this.user.role != '1'){
			this.router.navigate(['/']);
		}

		this.getMembers({'CompanyId':this.user.data[0].CompanyId});
  	}

  	getMembers(CompanyId){
		this.accountService.getAllMembers(CompanyId)
            .subscribe((users:any)=>{   
            this.allMembers = users;         	
            	console.log(users);
            });
	}

	userStatus(IsActive,id){
		if(IsActive == '1'){
			this.activeNo = {'id':id,'IsActive':0};
		}else{
			this.activeNo = {'id':id,'IsActive':1};
		}

		this.accountService.updateMemberStatus(this.activeNo)
            .subscribe((response:any)=>{ 
            	console.log(response);
            	if(response.statuscode == 200){
            		this.getMembers({'CompanyId':this.user.data[0].CompanyId});
            		this.toastr.success(response.msg);
            	}else{
            		this.toastr.error(response.msg);
            	}
            });

	}

}
