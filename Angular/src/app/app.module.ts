import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { ChartsModule } from 'ng2-charts';
import { NgxPaginationModule } from 'ngx-pagination';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { TooltipModule } from 'ng2-tooltip-directive';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MyFilterPipe } from './pipes/my-filter.pipe';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

import { JwtInterceptor, ErrorInterceptor } from './_helpers';
import { AppComponent } from './app.component';
import { AlertComponent } from './_components';
import { HomeComponent } from './home';
import { HeaderComponent } from './header/header.component';
import { TopbarComponent } from './topbar/topbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { MemberManagementComponent } from './member-management/member-management.component';
import { OkrComponent } from './okr/okr.component';
import { ObjectivesComponent } from './objectives/objectives.component';
import { CheckinsComponent } from './checkins/checkins.component';


@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        AppRoutingModule,
        ChartsModule,
        NgxPaginationModule,
        BrowserAnimationsModule, // required animations module
        ToastrModule.forRoot(),
        TooltipModule,
        BrowserAnimationsModule,
        NgSelectModule,
        NgbModule,
        Ng2SearchPipeModule
    ],
    declarations: [
        AppComponent,
        AlertComponent,
        HomeComponent,
        HeaderComponent,
        TopbarComponent,
        SidebarComponent,
        UserManagementComponent,
        MemberManagementComponent,
        OkrComponent,
        ObjectivesComponent,
         MyFilterPipe,
         CheckinsComponent
        ],
    providers: [
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

        // provider used to create fake backend
        //fakeBackendProvider
    ],
    bootstrap: [AppComponent]
})
export class AppModule { };
