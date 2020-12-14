import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AccountService, AlertService } from '@app/_services';

@Component({
  templateUrl: './join.component.html'
})
export class JoinComponent implements OnInit {

  	form: FormGroup;
    loading = false;
    submitted = false;
    result:any = [];
    actualArray:any = [];
    UserName = '';
    CompanyId = '';
    TeamId = '';
    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService,
        private toastr: ToastrService
    ) { }

  ngOnInit(){

    this.route.queryParams.subscribe(params => {
      this.UserName = atob(params.base);
      this.CompanyId = params.i;
      this.TeamId = params.ti;
      if(this.UserName == '' || this.UserName == undefined || this.CompanyId == '' || this.CompanyId == undefined || this.TeamId == '' || this.TeamId == undefined){
        this.router.navigate(['/']);
      }
    });

  	this.form = this.formBuilder.group({
            Name: ['', Validators.required],
            Email: ['', [Validators.required, Validators.email]],
            Phone: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
            Address: ['', Validators.required],
            JobPosition: ['', Validators.required],
            Password: ['', [Validators.required, Validators.minLength(6)]],
            acceptTerms: [false, Validators.requiredTrue],
            Role: ['3', Validators.required],
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
        this.actualArray = [this.form.value];

        this.actualArray.forEach((key) => {
            key["CompanyId"] = this.CompanyId;
            key["TeamId"] = this.TeamId;
        })
        this.accountService.registerMember(this.actualArray)
            .pipe(first())
            .subscribe(
                data => {
                    this.result = data;
                    if(this.result.statuscode == '200'){
                        this.toastr.success(this.result.msg);
                        this.router.navigate(['../login'], { relativeTo: this.route });
                        this.loading = false;
                    }else{
                        this.toastr.error(this.result.msg);
                        this.loading = false;
                    }                    
                },
                error => {
                    this.toastr.error(error);
                    this.loading = false;
                });
    }

}
