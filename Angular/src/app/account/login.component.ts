import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AccountService, AlertService } from '@app/_services';
import { ToastrService } from 'ngx-toastr';

@Component({ templateUrl: 'login.component.html' })
export class LoginComponent implements OnInit {
    form: FormGroup;
    formforgot: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    errorMessage: string;
    loginMode = true;
    result:any = [];
    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService,        
        private toastr: ToastrService,
    ) { }

    ngOnInit() {
        this.form = this.formBuilder.group({
            email_id: ['', Validators.required],
            password: ['', Validators.required]
        });

        this.formforgot = this.formBuilder.group({
            email_id: ['', Validators.required]
        });

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }


    changeView(mode){
      if(mode == 'forgot'){
        this.loginMode = false;
      }else{
        this.loginMode = true;
      }
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }
    get ff() { return this.formforgot.controls; }

    /*forgotPassword() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.formforgot.invalid) {
            return;
        }

        this.loading = true;
        var newObj = [];
        newObj.push({'email_id':this.ff.email_id.value});
        this.accountService.forgotPassword(newObj)
            .pipe(first())
            .subscribe(
                data => {
                    this.result = data;
                      console.log(data);
                     if(this.result.status == 200){
                         this.alertService.success(this.result.message);
                         //this.toastr.success(this.result.message);
                          this.form.reset();
                          this.loginMode = true;
                     }else{
                          this.loading = false;
                          this.alertService.success(this.result.message);
                          //this.toastr.error(this.result.message);
                     }
                },
                error => {
                  //console.log(error);
                    //this.alertService.error(error);
                    this.loading = false;
                    //console.log('error', error);
                });
    }*/

    onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        /*this.accountService.login(this.f.email_id.value, this.f.password.value)
            .pipe(first())
            .subscribe(
                data => {
                    if (data.statuscode === 400 || data.statuscode === 500) {
                      this.toastr.error(data.message);
                      this.loading = false;
                      console.log('data', data.message);
                      console.log('data', data.statuscode);
                    } else{
                      this.router.navigateByUrl(this.returnUrl);
                      //window.location.replace('/');
                    }
                },
                error => {
                    this.toastr.error(error);
                    this.loading = false;
                    console.log('error', error);
                });*/
        this.accountService.login(this.f.email_id.value, this.f.password.value)
          .subscribe((response:any) => {
            if (response.statuscode == 203) {
              this.toastr.error(response.msg);
              this.loading = false;
              console.log('data', response.msg);
              console.log('data', response.statuscode);
            } else{
              console.log(response);
              //this.router.navigateByUrl(this.returnUrl);
              this.accountService.storeToken(response.token);
              //this.router.navigate(['/']);
              window.location.replace(this.returnUrl);
              //this.router.navigate([this.returnUrl]);
            }
          });
    }
}
