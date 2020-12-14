import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '@app/_models';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs/operators';
import { AccountService, AlertService } from '@app/_services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.less']
})
export class UserManagementComponent implements OnInit {
	user: User;
	companies:any = [];
	mentors:any = [];
    result:any = [];
    allocateData:any = [];
    allocatedMentors:any = [];
	activeNo = {};

  	p=1;
  	form: FormGroup;
    loading = false;
    submitted = false;
    sCompany:any;
    sMentor:any;
    choosenMentor:any;
    updateAllocation = false;
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

	ngOnInit(){
		if(this.user.role != '4'){
			this.router.navigate(['/']);
		}

		this.getCompanies();
		this.getMentors();

		this.form = this.formBuilder.group({
            Name: ['', Validators.required],
            Email: ['', [Validators.required, Validators.email]],
            Phone: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
            JobPosition: ['', Validators.required],
            Password: ['', [Validators.required, Validators.minLength(6)]],
            Role: ['2', Validators.required],
        });


	}

	getCompanies(){
		this.accountService.getAllCompanies()
            .subscribe((users:any)=>{   
            this.companies = users;         	
            	console.log(users);
            });
	}

	getMentors(){
		this.accountService.getAllMentors()
            .subscribe((res:any)=>{   
            this.mentors = res;         	
            	console.log(res);
            });
	}

    getMentor(){
        this.choosenMentor = this.sMentor.id;
        this.getAllocation();
    }

    getAllocation(){
        let mentor = {'id':this.choosenMentor};
        this.accountService.getAllocationsData(mentor)
            .subscribe((res:any)=>{   
            this.sCompany = res;             
                console.log(res);
                if(this.sCompany.length == 0){
                    this.updateAllocation = false;
                }else{
                    this.updateAllocation = true;
                }
                
            });
    }

	userStatus(IsActive,id){
		if(IsActive == '1'){
			this.activeNo = {'id':id,'IsActive':0};
		}else{
			this.activeNo = {'id':id,'IsActive':1};
		}

		this.accountService.updateCompanyStatus(this.activeNo)
            .subscribe((response:any)=>{ 
            	console.log(response);
            	if(response.statuscode == 200){
            		this.getCompanies();
            		this.toastr.success(response.msg);
            	}else{
            		this.toastr.error(response.msg);
            	}
            });

	}


	get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
          console.log(this.form.value);

        this.accountService.registerMentor(this.form.value)
            .pipe(first())
            .subscribe(
                data => {
                    this.result = data;
                    if(this.result.statuscode == '200'){
                        this.toastr.success(this.result.msg);
                    }else{
                        this.toastr.error(this.result.msg);
                    }
                    this.loading = false;
                },
                error => {
                    this.toastr.error(error);
                    this.loading = false;
                });
    }

    allocate(){
    	if(this.sCompany == ''){
    		this.toastr.error('Please select Company');
    	}else if(this.sMentor == ''){
    		this.toastr.error('Please select Mentor');
    	}else{
    		this.loading = true;
    		let i = 0;
		    let length = this.sCompany.length;

		    for (i = 0; i < length; i++) {
		    	this.allocateData.push({
		    		'CompanyId':this.sCompany[i].CompanyId,
		    		'MentorId':this.sMentor.id
		    	});
		    }
		    console.log(this.allocateData);
		    //return;
		    this.accountService.allocateMentors(this.allocateData)
		      .subscribe((response: any) => {
		        if (response.statuscode == 200) {
		          	this.loading = false;
		          	this.toastr.success(response.msg);
		          	setTimeout(() => {
		            	window.location.reload();
		          	}, 3000);

		        } else {
		          this.loading = false;
		          this.toastr.error(response.msg);
		        }
		    });
    		
    	}
    	
    }

    updateAllocate(){
        if(this.sCompany == ''){
            this.toastr.error('Please select Company');
        }else if(this.sMentor == ''){
            this.toastr.error('Please select Mentor');
        }else{
            this.loading = true;
            let i = 0;
            let length = this.sCompany.length;
            console.log(this.sCompany);
            for (i = 0; i < length; i++) {
                this.allocateData.push({
                    'CompanyId':this.sCompany[i].id,
                    'MentorId':this.sMentor.id
                });
            }
            console.log(this.allocateData);
            //return;
            this.accountService.updateAllocateMentors(this.allocateData)
              .subscribe((response: any) => {
                if (response.statuscode == 200) {
                      this.loading = false;
                      this.toastr.success(response.msg);
                      setTimeout(() => {
                        window.location.reload();
                      }, 3000);

                } else {
                  this.loading = false;
                  this.toastr.error(response.msg);
                }
            });
            
        }
        
    }

}
