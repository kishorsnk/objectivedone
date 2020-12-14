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
  selector: 'app-checkins',
  templateUrl: './checkins.component.html',
  styleUrls: ['./checkins.component.less']
})
export class CheckinsComponent implements OnInit {

	user: User;
	workingUserName:any;
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

  	ngOnInit(): void {
  		this.titleService.setTitle( 'Weekly Checkins' );
  		console.log(this.user);
  	}

}
