import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

import { HomeComponent } from './home';
import { AuthGuard } from './_helpers';

import { UserManagementComponent } from './user-management/user-management.component'
import { MemberManagementComponent } from './member-management/member-management.component';
import { OkrComponent } from './okr/okr.component';
import { CheckinsComponent } from './checkins/checkins.component';

const accountModule = () => import('./account/account.module').then(x => x.AccountModule);
const usersModule = () => import('./users/users.module').then(x => x.UsersModule);

const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard]},
    // { path: 'users', loadChildren: usersModule, canActivate: [AuthGuard] },
    { path: 'account', loadChildren: accountModule },
    { path: 'userManagement', component: UserManagementComponent, canActivate: [AuthGuard]},
    { path: 'MemberManagement', component: MemberManagementComponent, canActivate: [AuthGuard]},
    { path: 'okr', component: OkrComponent, canActivate: [AuthGuard]},
    { path: 'Checkins', component: CheckinsComponent, canActivate: [AuthGuard]},
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
