import { Component, OnInit } from '@angular/core';
import {formatDate } from '@angular/common';
import { AccountService } from '../_services';
import { User } from '../_models';
import * as $ from 'jquery';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.less']
})
export class TopbarComponent implements OnInit {
	now:any;
  user: User;
  role:any;
    currentRole = '';
  CurrentUserName = '';
  locationame = '';
  loading = false;
  constructor(private accountService: AccountService) {
        this.accountService.user.subscribe(x => this.user = x);
        this.role = this.user;
        this.CurrentUserName = this.user.data[0].UserName;
    }

  ngOnInit(): void {

  	//this.now = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US');
  	this.now = new Date();

  	$(document).ready(function() {
  		$('.hamburger').click(function(){
  			var left = $('.sidebar').css("left");
  			if(left == '0px'){
  				$('.sidebar').css('left','-260px');
				$('.main-panel').css('width','calc(100% - 40px)');
  			}else{
  				$('.sidebar').css('left','0');
				$('.main-panel').css('width','calc(100% - 260px)');
  			}
			
		});
  	});

  }

  logout() {
    this.loading = true;
      this.accountService.sessionDetails(this.user)
          .subscribe((response:any) => {
              console.log(response);
          });
        this.accountService.logout();
        this.loading = false;
    }

}
