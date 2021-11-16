"use strict";(self.webpackChunkpeertube_client=self.webpackChunkpeertube_client||[]).push([[713],{16713:(v,u,r)=>{r.r(u),r.d(u,{VerifyAccountModule:()=>P});var C=r(86658),l=r(49393),m=r(44560),S=r(84167),_=r(42741),E=r(54755),A=r(16274),c=r(93324);function f(i,n){if(1&i&&(_.TgZ(0,"div",12),_._uU(1),_.qZA()),2&i){const e=_.oxw(2);_.xp6(1),_.hij(" ",e.formErrors["verify-email-email"]," ")}}const N=function(i){return{"input-error":i}};function d(i,n){if(1&i){const e=_.EpF();_.TgZ(0,"form",5),_.NdJ("ngSubmit",function(){return _.CHM(e),_.oxw().askSendVerifyEmail()}),_.TgZ(1,"div",6),_.TgZ(2,"label",7),_.SDv(3,8),_.qZA(),_._UZ(4,"input",9),_.YNc(5,f,2,1,"div",10),_.qZA(),_._UZ(6,"input",11),_.qZA()}if(2&i){const e=_.oxw();_.Q6J("formGroup",e.form),_.xp6(4),_.Q6J("ngClass",_.VKq(4,N,e.formErrors["verify-email-email"])),_.xp6(1),_.Q6J("ngIf",e.formErrors["verify-email-email"]),_.xp6(1),_.Q6J("disabled",!e.form.valid)}}function g(i,n){1&i&&(_.TgZ(0,"div"),_.SDv(1,13),_.qZA())}let I=(()=>{class i extends S.OI{constructor(e,t,o,s,a){super(),this.formValidatorService=e,this.userService=t,this.serverService=o,this.notifier=s,this.redirectService=a,this.requiresEmailVerification=!1}ngOnInit(){this.serverService.getConfig().subscribe(e=>this.requiresEmailVerification=e.signup.requiresEmailVerification),this.buildForm({"verify-email-email":m.oo})}askSendVerifyEmail(){const e=this.form.value["verify-email-email"];this.userService.askSendVerifyEmail(e).subscribe({next:()=>{this.notifier.success("\u042D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0435 \u043F\u0438\u0441\u044C\u043C\u043E \u0441\u043E \u0441\u0441\u044B\u043B\u043A\u043E\u0439 \u043D\u0430 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u0431\u044B\u043B\u043E \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u043D\u0430 " + e + "."),this.redirectService.redirectToHomepage()},error:t=>this.notifier.error(t.message)})}}return i.\u0275fac=function(e){return new(e||i)(_.Y36(S.Q4),_.Y36(E.KD),_.Y36(E.NG),_.Y36(E.d4),_.Y36(E.VH))},i.\u0275cmp=_.Xpm({type:i,selectors:[["my-verify-account-ask-send-email"]],features:[_.qOj],decls:6,vars:2,consts:function(){let n,e,t,o,s;return n="\n    \u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0435 \u043F\u0438\u0441\u044C\u043C\u043E \u0434\u043B\u044F \u0430\u043A\u0442\u0438\u0432\u0430\u0446\u0438\u0438 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430\n  ",e="Email",t="Email \u0430\u0434\u0440\u0435\u0441",o="\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u043F\u043E \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0439 \u043F\u043E\u0447\u0442\u0435",s="\u042D\u0442\u043E\u0442 \u0441\u0435\u0440\u0432\u0435\u0440 \u043D\u0435 \u043D\u0443\u0436\u0434\u0430\u0435\u0442\u0441\u044F \u0432 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0438 \u043F\u043E \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0439 \u043F\u043E\u0447\u0442\u0435.",[[1,"margin-content"],[1,"title-page","title-page-single"],n,["role","form",3,"formGroup","ngSubmit",4,"ngIf","ngIfElse"],["emailVerificationNotRequired",""],["role","form",3,"formGroup","ngSubmit"],[1,"form-group"],["for","verify-email-email"],e,["type","email","id","verify-email-email","placeholder",t,"required","","formControlName","verify-email-email",1,"form-control",3,"ngClass"],["class","form-error",4,"ngIf"],["type","submit","value",o,3,"disabled"],[1,"form-error"],s]},template:function(e,t){if(1&e&&(_.TgZ(0,"div",0),_.TgZ(1,"div",1),_.SDv(2,2),_.qZA(),_.YNc(3,d,7,6,"form",3),_.YNc(4,g,2,0,"ng-template",null,4,_.W1O),_.qZA()),2&e){const o=_.MAs(5);_.xp6(3),_.Q6J("ngIf",t.requiresEmailVerification)("ngIfElse",o)}},directives:[A.O5,c._Y,c.JL,c.sg,c.Fj,c.Q7,c.JJ,c.u,A.mk],styles:["input[_ngcontent-%COMP%]:not([type=submit]){padding:0 15px;display:inline-block;height:30px;width:340px;color:var(--inputForegroundColor);background-color:var(--inputBackgroundColor);border:1px solid #C6C6C6;border-radius:3px;font-size:15px;display:block}input[_ngcontent-%COMP%]:not([type=submit])::placeholder{color:var(--inputPlaceholderColor)}input[_ngcontent-%COMP%]:not([type=submit])[readonly]{opacity:.7}@media screen and (max-width: calc(340px + 40px)){input[_ngcontent-%COMP%]:not([type=submit]){width:100%}}input[type=submit][_ngcontent-%COMP%]{padding-top:0;padding-bottom:0;border:0;font-weight:600;font-size:15px;height:30px;line-height:30px;border-radius:3px!important;text-align:center;cursor:pointer}@supports (padding-inline-start: 13px){input[type=submit][_ngcontent-%COMP%]{padding-inline-start:13px}}@supports not (padding-inline-start: 13px){input[type=submit][_ngcontent-%COMP%]{padding-left:13px}}@supports (padding-inline-end: 17px){input[type=submit][_ngcontent-%COMP%]{padding-inline-end:17px}}@supports not (padding-inline-end: 17px){input[type=submit][_ngcontent-%COMP%]{padding-right:17px}}input[type=submit][_ngcontent-%COMP%]:focus, input[type=submit].focus-visible[_ngcontent-%COMP%]{box-shadow:0 0 0 .2rem var(--mainColorLightest)}input[type=submit][_ngcontent-%COMP%], input[type=submit][_ngcontent-%COMP%]:active, input[type=submit][_ngcontent-%COMP%]:focus{color:#fff;background-color:var(--mainColor)}input[type=submit][_ngcontent-%COMP%]:hover{color:#fff;background-color:var(--mainHoverColor)}input[type=submit][disabled][_ngcontent-%COMP%], input[type=submit].disabled[_ngcontent-%COMP%]{cursor:default;color:#fff;background-color:#c6c6c6}input[type=submit][_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .feather, input[type=submit][_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .material, input[type=submit][_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .misc{color:#fff}"]}),i})();var p=r(79146);function R(i,n){1&i&&_._UZ(0,"my-signup-success",6)}function T(i,n){1&i&&(_.TgZ(0,"div",7),_.SDv(1,8),_.qZA())}const O=function(i){return{isPendingEmail:i}};function V(i,n){if(1&i&&(_.TgZ(0,"div"),_.TgZ(1,"span"),_.SDv(2,9),_.qZA(),_.TgZ(3,"a",10),_.SDv(4,11),_.qZA(),_.qZA()),2&i){const e=_.oxw();_.xp6(3),_.Q6J("queryParams",_.VKq(1,O,e.isPendingEmail))}}const M=[{path:"",children:[{path:"email",component:(()=>{class i{constructor(e,t,o,s){this.userService=e,this.authService=t,this.notifier=o,this.route=s,this.success=!1,this.failed=!1,this.isPendingEmail=!1}ngOnInit(){const e=this.route.snapshot.queryParams;this.userId=e.userId,this.verificationString=e.verificationString,this.isPendingEmail="true"===e.isPendingEmail,this.userId&&this.verificationString?this.verifyEmail():this.notifier.error("\u041D\u0435\u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E \u043D\u0430\u0439\u0442\u0438 ID \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u0438\u043B\u0438 \u043F\u0440\u043E\u0432\u0435\u0440\u043E\u0447\u043D\u0443\u044E \u0441\u0442\u0440\u043E\u043A\u0443.")}verifyEmail(){this.userService.verifyEmail(this.userId,this.verificationString,this.isPendingEmail).subscribe({next:()=>{this.authService.isLoggedIn()&&this.authService.refreshUserInformation(),this.success=!0},error:e=>{this.failed=!0,this.notifier.error(e.message)}})}}return i.\u0275fac=function(e){return new(e||i)(_.Y36(E.KD),_.Y36(E.e8),_.Y36(E.d4),_.Y36(l.gz))},i.\u0275cmp=_.Xpm({type:i,selectors:[["my-verify-account-email"]],decls:6,vars:3,consts:function(){let n,e,t,o;return n="\n    \u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0439 \u043F\u043E\u0447\u0442\u044B \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F\n  ",e="\u0410\u0434\u0440\u0435\u0441 \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0439 \u043F\u043E\u0447\u0442\u044B \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D.",t="\u041F\u0440\u043E\u0438\u0437\u043E\u0448\u043B\u0430 \u043E\u0448\u0438\u0431\u043A\u0430.",o="\u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u043D\u043E\u0432\u043E\u0435 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0439 \u043F\u043E\u0447\u0442\u044B.",[[1,"margin-content"],[1,"title-page","title-page-single"],n,["message","Your email has been verified and you may now login.",4,"ngIf"],["class","alert alert-success",4,"ngIf"],[4,"ngIf"],["message","Your email has been verified and you may now login."],[1,"alert","alert-success"],e,t,["routerLink","/verify-account/ask-send-email",3,"queryParams"],o]},template:function(e,t){1&e&&(_.TgZ(0,"div",0),_.TgZ(1,"div",1),_.SDv(2,2),_.qZA(),_.YNc(3,R,1,0,"my-signup-success",3),_.YNc(4,T,2,0,"div",4),_.YNc(5,V,5,3,"div",5),_.qZA()),2&e&&(_.xp6(3),_.Q6J("ngIf",!t.isPendingEmail&&t.success),_.xp6(1),_.Q6J("ngIf",t.isPendingEmail&&t.success),_.xp6(1),_.Q6J("ngIf",t.failed))},directives:[A.O5,p.Q,l.yS],encapsulation:2}),i})(),data:{meta:{title:"\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442 \u043F\u043E \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0439 \u043F\u043E\u0447\u0442\u0435"}}},{path:"ask-send-email",component:I,data:{meta:{title:"\u041F\u043E\u043F\u0440\u043E\u0441\u0438\u0442\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0435 \u043F\u0438\u0441\u044C\u043C\u043E \u0434\u043B\u044F \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F \u0432\u0430\u0448\u0435\u0439 \u0443\u0447\u0435\u0442\u043D\u043E\u0439 \u0437\u0430\u043F\u0438\u0441\u0438"}}}]}];let y=(()=>{class i{}return i.\u0275fac=function(e){return new(e||i)},i.\u0275mod=_.oAB({type:i}),i.\u0275inj=_.cJS({imports:[[l.Bz.forChild(M)],l.Bz]}),i})(),P=(()=>{class i{}return i.\u0275fac=function(e){return new(e||i)},i.\u0275mod=_.oAB({type:i}),i.\u0275inj=_.cJS({providers:[],imports:[[y,C.X]]}),i})()}}]);