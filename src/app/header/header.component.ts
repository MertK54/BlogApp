import { Subscription } from "rxjs";
import { Component } from "@angular/core";
import { AuthService } from "../auth/auth.service";
@Component ({
    selector:'app-header',
    templateUrl:'./header.component.html',
    styleUrls:['./header.component.css']
})
export class HeaderComponent{
    userIsAuthenticated = false;
    private authListenerSubs:Subscription;

    constructor(private authService:AuthService){}

    ngOnInit(){
        this.userIsAuthenticated = this.authService.getIsAuth();
        this.authListenerSubs=this.authService
        .getAuthStatusListener()
        .subscribe(isAuthenticated => {
            this.userIsAuthenticated = isAuthenticated;
        })
    }

    onLogout() {
      this.authService.logout();
    }
  
    ngOnDestroy() {
      this.authListenerSubs.unsubscribe();
    }
}