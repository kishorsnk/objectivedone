import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AccountService, AlertService } from '@app/_services';

@Component({ templateUrl: 'register.component.html' })
export class RegisterComponent implements OnInit {
    form: FormGroup;
    loading = false;
    submitted = false;
    result:any = [];
    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService,
        private toastr: ToastrService
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            Name: ['', Validators.required],
            Email: ['', [Validators.required, Validators.email]],
            Phone: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
            Address: ['', Validators.required],
            JobPosition: ['', Validators.required],
            TIN: ['', Validators.required],
            FieldOfExpertise: ['', Validators.required],
            NumberOfUsers: ['', Validators.required],
            Password: ['', [Validators.required, Validators.minLength(6)]],
            acceptTerms: [false, Validators.requiredTrue],
            Role: ['1', Validators.required],
        });
    }

    // convenience getter for easy access to form fields
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

        this.accountService.register(this.form.value)
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