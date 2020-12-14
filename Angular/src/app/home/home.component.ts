import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { MultiDataSet, Label } from 'ng2-charts';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '@app/_models';
import { AccountService } from '@app/_services';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent {
  user: User;
  Role:any;

  companiesLength = 0;
  mentorsLength = 0;
  greet ='';
  constructor(
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.user = this.accountService.userValue;
  }

  ngOnInit(){
    this.Role = this.user.role;
    this.getCompanies();
    this.getMentors();
    /* Greerting Msg Start */
      let myDate = new Date();
      let hrs = myDate.getHours();

      if (hrs < 12)
          this.greet = 'Good Morning';
      else if (hrs >= 12 && hrs <= 17)
          this.greet = 'Good Afternoon';
      else if (hrs >= 17 && hrs <= 24)
          this.greet = 'Good Evening';     
    /* Greerting Msg End */
  }


  getCompanies(){
    this.accountService.getAllCompanies()
      .subscribe((users:any)=>{   
      this.companiesLength = users.length; 
      });
  }

  getMentors(){
    this.accountService.getAllMentors()
    .subscribe((res:any)=>{   
    this.mentorsLength = res.length; 
    });
  }

}
