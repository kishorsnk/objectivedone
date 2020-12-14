import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import jwt_decode from "jwt-decode";
import { environment } from '@environments/environment';
import { User } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private userSubject: BehaviorSubject<User>;
  public user: Observable<User>;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.userSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('user')));
    this.user = this.userSubject.asObservable();
  }

  public get userValue(): User {
    //console.log(this.userSubject.value);
    return this.userSubject.value;
  }

  login(Email, Password) {
    return this.http.post<User>(`${environment.apiUrl}/user/login`, { Email, Password })
      .pipe(map(user => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        //console.log('user', user.message);
        debugger;
        console.log('user', user);
        if (user.statuscode === '200') {
          localStorage.setItem('user', JSON.stringify(user));
          //localStorage.setItem('__hbvhfbvjvjdnvjjncjmkcmckm', JSON.stringify(user.token));
          this.userSubject.next(user);
        }
        return user;
      }));
  }

  logout() {
    //this.sessionDetails();
    // remove user from local storage and set current user to null
    localStorage.removeItem('user');
    localStorage.removeItem('__hbvhfbvjvjdnvjjncjmkcmckm');
    this.userSubject.next(null);
    this.router.navigate(['/account/login']);
  }

/*-- Token Start --*/
resolveToken(token) {
  debugger;
        if (token == "0") token = this.getToken();
        token = token == 0 ? null : token;
        if (token == null) {
            this.changeCurrentUser(0);
            // this.router.navigate(['/login'])
            return;
        } else {

            var user = this.getDecodedAccessToken(token);
console.log(user);
            //this.changeCurrentUser(user.data);
        }
    }
  getToken() {
        return localStorage.getItem("__hbvhfbvjvjdnvjjncjmkcmckm");
        // this.resolveToken(localStorage.getItem("token"));
    }
    removeToken() {
        localStorage.removeItem("__hbvhfbvjvjdnvjjncjmkcmckm");
        this.resolveToken(0)
    }
    storeToken(token) {
        if (token == "0") {
            localStorage.setItem("__hbvhfbvjvjdnvjjncjmkcmckm", null);
        } else {
            localStorage.setItem("__hbvhfbvjvjdnvjjncjmkcmckm", token);
            console.log(token)
            this.resolveToken(token);
        }
    }
    getDecodedAccessToken(token) {
        try {
            return jwt_decode(token);
        } catch (Error) {
          console.log(Error);
            return null;
        }
    }
    getTokenExpirationDate(token: string): Date {
        const decoded = jwt_decode(token);
        console.log(decoded);

        if (decoded.exp === undefined) return null;

        const date = new Date(0);
        date.setUTCSeconds(decoded.exp);
        return date;
    }
    isTokenExpired(token?: string): boolean {
        if (!token) token = this.getToken();
        if (!token) return true;

        const date = this.getTokenExpirationDate(token);
        if (date === undefined) return false;
        return !(date.valueOf() > new Date().valueOf());
    }
    changeCurrentUser(data) {
        if (data == 0) {
            localStorage.setItem("token", "0");
        }
        //this._current_user.next(data);
    }

    /*-- Token End --*/

  register(user: User) {
    return this.http.post(`${environment.apiUrl}/user/register`, user);
  }

  registerMember(data) {
    return this.http.post(`${environment.apiUrl}/user/registerMember`, data);
  }

  getAll() {
    return this.http.get<User[]>(`${environment.apiUrl}/user/allusers`);
  }

  getById(id: string) {
    return this.http.get<User>(`${environment.apiUrl}/user/${id}`);
  }

  validateEmail(email) {
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
  }


  update(id, params) {
    return this.http.put(`${environment.apiUrl}/user/${id}`, params)
      .pipe(map(x => {
        // update stored user if the logged in user updated their own record
        if (id == this.userValue.id) {
          // update local storage
          const user = { ...this.userValue, ...params };
          localStorage.setItem('user', JSON.stringify(user));

          // publish updated user to subscribers
          this.userSubject.next(user);
        }
        return x;
      }));
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/user/${id}`)
      .pipe(map(x => {
        // auto logout if the logged in user deleted their own record
        if (id == this.userValue.id) {
          this.logout();
        }
        return x;
      }));
  }

  sessionDetails(data){
    //console.log(data.data);
    return this.http.post(`${environment.apiUrl}/user/logout`, data.data);
  }

  getAllCompanies(){
    return this.http.post(`${environment.apiUrl}/getAllCompanies`, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  getAllMembers(CompanyId){
    return this.http.post(`${environment.apiUrl}/getAllMembers`,CompanyId, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  updateCompanyStatus(data){
    return this.http.post(`${environment.apiUrl}/updateCompanyStatus`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  updateMemberStatus(data){
    return this.http.post(`${environment.apiUrl}/updateMemberStatus`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  registerMentor(data){
    return this.http.post(`${environment.apiUrl}/registerMentor`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  getAllMentors(){
    return this.http.post(`${environment.apiUrl}/getAllMentors`, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  getTeamsAndMembers(data){
    return this.http.post(`${environment.apiUrl}/getTeamsAndMembers`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  allocateMentors(data){
    return this.http.post(`${environment.apiUrl}/allocateMentors`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  getAllocationsData(data){
    console.log(data);
    return this.http.post(`${environment.apiUrl}/getAllocatedMentors`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  updateAllocateMentors(data){
    console.log(data);
    return this.http.post(`${environment.apiUrl}/updateAllocateMentors`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  createTeamforCompany(data){
    console.log(data);
    return this.http.post(`${environment.apiUrl}/team/createTeam`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  getTeams(data){
    return this.http.post(`${environment.apiUrl}/team/getTeams`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  inviteMembers(data){
    return this.http.post(`${environment.apiUrl}/team/inviteMembers`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  /* Objectives */

  addObjective(data){
    return this.http.post(`${environment.apiUrl}/team/addObjective`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  updateObjective(data){
    return this.http.post(`${environment.apiUrl}/team/updateObjective`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  deleteObjective(data){
    return this.http.post(`${environment.apiUrl}/team/deleteObjective`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  getUserByObjective(data){
    return this.http.post(`${environment.apiUrl}/team/getUserByObjective`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  UnlinkFromObjective(data){
    return this.http.post(`${environment.apiUrl}/team/UnlinkFromObjective`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  UnlinkFromKeyResult(data){
    return this.http.post(`${environment.apiUrl}/team/UnlinkFromKeyResult`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  assignOkrAsObjective(data){
    return this.http.post(`${environment.apiUrl}/team/assignOkrAsObjective`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  assignObjectiveAsOkr(data){
    return this.http.post(`${environment.apiUrl}/team/assignObjectiveAsOkr`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  addOKR(data){
    return this.http.post(`${environment.apiUrl}/team/addOKR`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  updateOKR(data){
    return this.http.post(`${environment.apiUrl}/team/updateOKR`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  updateOKRProgress(data){
    return this.http.post(`${environment.apiUrl}/team/updateOKRProgress`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  updateTargetValue(data){
    return this.http.post(`${environment.apiUrl}/team/updateTargetValue`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  updateWeightage(data){
    return this.http.post(`${environment.apiUrl}/team/updateWeightage`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  deleteOKR(data){
    return this.http.post(`${environment.apiUrl}/team/deleteOKR`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  addComment(data){
    return this.http.post(`${environment.apiUrl}/team/addComment`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  updateComment(data){
    return this.http.post(`${environment.apiUrl}/team/updateComment`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  deleteComment(data){
    return this.http.post(`${environment.apiUrl}/team/deleteComment`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  getCompanyObjective(data){
    return this.http.post(`${environment.apiUrl}/getCompanyObjective`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  getMemberObjective(data){
    return this.http.post(`${environment.apiUrl}/getMemberObjective`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  getTeamObjective(data){
    return this.http.post(`${environment.apiUrl}/getTeamObjective`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

  getLinkData(data){
    return this.http.post(`${environment.apiUrl}/getLinkData`,data, { headers: new HttpHeaders({ "Content-Type": "application/json", 'Authorization': this.getToken() }) });
  }

}
