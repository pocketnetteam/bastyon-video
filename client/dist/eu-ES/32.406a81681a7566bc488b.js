"use strict";(self.webpackChunkpeertube_client=self.webpackChunkpeertube_client||[]).push([[32],{1032:(pn,S,a)=>{a.r(S),a.d(S,{LoginModule:()=>dn});var M=a(84167),v=a(97694),$=a(33716),V=a(62026),g=a(49393),G=a(85230),y=a(24766),l=a(93324);const b={VALIDATORS:[l.kI.required],MESSAGES:{required:"Erabiltzaile izena beha da."}},k={VALIDATORS:[l.kI.required],MESSAGES:{required:"Pasahitza behar da."}};var n=a(42741),Z=a(76476),d=a(54755),Y=a(68099),m=a(16274),U=a(32724),K=a(2003),B=a(10112),X=a(19895);const q=["forgotPasswordModal"];function J(e,o){1&e&&(n.TgZ(0,"div",6),n.tHW(1,7),n._UZ(2,"a",8),n.N_p(),n.qZA())}function z(e,o){1&e&&(n.TgZ(0,"span"),n.TgZ(1,"a",33),n.SDv(2,34),n.qZA(),n.qZA())}function Q(e,o){if(1&e&&(n.TgZ(0,"div",6),n._uU(1),n.YNc(2,z,3,0,"span",4),n.qZA()),2&e){const _=n.oxw(2);n.xp6(1),n.hij("",_.error," "),n.xp6(1),n.Q6J("ngIf","User email is not verified."===_.error)}}function H(e,o){if(1&e&&(n.TgZ(0,"div",35),n._uU(1),n.qZA()),2&e){const _=n.oxw(2);n.xp6(1),n.hij(" ",_.formErrors.username," ")}}function j(e,o){1&e&&(n.TgZ(0,"div",36),n.SDv(1,37),n.qZA())}function W(e,o){if(1&e&&(n.TgZ(0,"div",35),n._uU(1),n.qZA()),2&e){const _=n.oxw(2);n.xp6(1),n.hij(" ",_.formErrors.password," ")}}function nn(e,o){1&e&&(n.TgZ(0,"div",38),n.TgZ(1,"span"),n._uU(2,"\xb7"),n.qZA(),n.TgZ(3,"a",39),n.SDv(4,40),n.qZA(),n.qZA())}function _n(e,o){if(1&e){const _=n.EpF();n.TgZ(0,"div"),n.tHW(1,41),n.TgZ(2,"a",42),n.NdJ("click",function(r){n.CHM(_),n.oxw();const s=n.MAs(29);return n.oxw().onTermsClick(r,s)}),n.qZA(),n._UZ(3,"a",43),n._UZ(4,"br"),n._UZ(5,"a",44),n.N_p(),n.qZA()}}function en(e,o){if(1&e){const _=n.EpF();n.TgZ(0,"div"),n.tHW(1,45),n.TgZ(2,"a",46),n.NdJ("click",function(r){n.CHM(_),n.oxw();const s=n.MAs(29);return n.oxw().onTermsClick(r,s)}),n.qZA(),n._UZ(3,"br"),n._UZ(4,"a",44),n.N_p(),n.qZA()}}function tn(e,o){if(1&e&&(n.TgZ(0,"a",51),n._uU(1),n.qZA()),2&e){const _=o.$implicit,t=n.oxw(3);n.Q6J("href",t.getAuthHref(_),n.LSH),n.xp6(1),n.hij(" ",_.authDisplayName," ")}}function on(e,o){if(1&e&&(n.TgZ(0,"div",47),n.TgZ(1,"div",48),n.SDv(2,49),n.qZA(),n.TgZ(3,"div"),n.YNc(4,tn,2,2,"a",50),n.qZA(),n.qZA()),2&e){const _=n.oxw(2);n.xp6(4),n.Q6J("ngForOf",_.getExternalLogins())}}const N=function(e){return{"input-error":e}};function rn(e,o){if(1&e){const _=n.EpF();n.ynx(0),n.YNc(1,Q,3,2,"div",3),n.TgZ(2,"div",9),n.TgZ(3,"div",10),n.TgZ(4,"form",11),n.NdJ("ngSubmit",function(){return n.CHM(_),n.oxw().login()}),n.TgZ(5,"div",12),n.TgZ(6,"div"),n.TgZ(7,"label",13),n.SDv(8,14),n.qZA(),n._UZ(9,"input",15),n.qZA(),n.YNc(10,H,2,1,"div",16),n.YNc(11,j,2,0,"div",17),n.qZA(),n.TgZ(12,"div",12),n.TgZ(13,"label",18),n.SDv(14,19),n.qZA(),n._UZ(15,"my-input-toggle-hidden",20),n.YNc(16,W,2,1,"div",16),n.qZA(),n._UZ(17,"input",21),n.TgZ(18,"div",22),n.TgZ(19,"a",23),n.NdJ("click",function(){return n.CHM(_),n.oxw().openForgotPasswordModal()}),n.SDv(20,24),n.qZA(),n.YNc(21,nn,5,0,"div",25),n.qZA(),n.TgZ(22,"div",26),n.TgZ(23,"h6",27),n.SDv(24,28),n.qZA(),n.YNc(25,_n,6,0,"div",4),n.YNc(26,en,5,0,"div",4),n.qZA(),n.qZA(),n.YNc(27,on,5,1,"div",29),n.qZA(),n.TgZ(28,"div",30,31),n.TgZ(30,"my-instance-about-accordion",32),n.NdJ("init",function(r){return n.CHM(_),n.oxw().onInstanceAboutAccordionInit(r)}),n.qZA(),n.qZA(),n.qZA(),n.BQk()}if(2&e){const _=n.oxw();n.xp6(1),n.Q6J("ngIf",_.error),n.xp6(3),n.Q6J("formGroup",_.form),n.xp6(5),n.Q6J("ngClass",n.VKq(14,N,_.formErrors.username)),n.xp6(1),n.Q6J("ngIf",_.formErrors.username),n.xp6(1),n.Q6J("ngIf",_.hasUsernameUppercase()),n.xp6(4),n.Q6J("ngClass",n.VKq(16,N,_.formErrors.password))("tabindex",2),n.xp6(1),n.Q6J("ngIf",_.formErrors.password),n.xp6(1),n.Q6J("disabled",!_.form.valid),n.xp6(4),n.Q6J("ngIf",_.signupAllowed),n.xp6(4),n.Q6J("ngIf",_.signupAllowed),n.xp6(1),n.Q6J("ngIf",!_.signupAllowed),n.xp6(1),n.Q6J("ngIf",0!==_.getExternalLogins().length),n.xp6(3),n.Q6J("panels",_.instanceInformationPanels)}}function an(e,o){1&e&&(n.TgZ(0,"div",6),n.SDv(1,66),n.qZA())}function sn(e,o){1&e&&(n.TgZ(0,"div",67),n.SDv(1,68),n.qZA())}function ln(e,o){if(1&e){const _=n.EpF();n.TgZ(0,"div",52),n.TgZ(1,"h4",53),n.SDv(2,54),n.qZA(),n.TgZ(3,"my-global-icon",55),n.NdJ("click",function(){return n.CHM(_),n.oxw().hideForgotPasswordModal()}),n.qZA(),n.qZA(),n.TgZ(4,"div",56),n.YNc(5,an,2,0,"div",3),n.YNc(6,sn,2,0,"div",57),n.TgZ(7,"div",58),n.TgZ(8,"label",59),n.SDv(9,60),n.qZA(),n.TgZ(10,"input",61,62),n.NdJ("ngModelChange",function(r){return n.CHM(_),n.oxw().forgotPasswordEmail=r}),n.qZA(),n.qZA(),n.qZA(),n.TgZ(12,"div",63),n.TgZ(13,"input",64),n.NdJ("click",function(){return n.CHM(_),n.oxw().hideForgotPasswordModal()})("key.enter",function(){return n.CHM(_),n.oxw().hideForgotPasswordModal()}),n.qZA(),n.TgZ(14,"input",65),n.NdJ("click",function(){return n.CHM(_),n.oxw().askResetPassword()}),n.qZA(),n.qZA()}if(2&e){const _=n.MAs(11),t=n.oxw();n.xp6(5),n.Q6J("ngIf",t.isEmailDisabled()),n.xp6(1),n.Q6J("ngIf",!t.isEmailDisabled()),n.xp6(1),n.Q6J("hidden",t.isEmailDisabled()),n.xp6(3),n.Q6J("ngModel",t.forgotPasswordEmail),n.xp6(4),n.Q6J("disabled",!_.validity.valid)}}const cn=[{path:"",component:(()=>{class e extends M.OI{constructor(_,t,r,s,c,p,O,E){super(),this.formValidatorService=_,this.route=t,this.modalService=r,this.authService=s,this.userService=c,this.redirectService=p,this.notifier=O,this.hooks=E,this.error=null,this.forgotPasswordEmail="",this.isAuthenticatedWithExternalAuth=!1,this.externalAuthError=!1,this.externalLogins=[],this.instanceInformationPanels={terms:!0,administrators:!1,features:!1,moderation:!1,codeOfConduct:!1}}get signupAllowed(){return!0===this.serverConfig.signup.allowed}onTermsClick(_,t){_.preventDefault(),this.accordion&&(this.accordion.expand("terms"),t.scrollIntoView({behavior:"smooth"}))}isEmailDisabled(){return!1===this.serverConfig.email.enabled}ngOnInit(){const _=this.route.snapshot;this.buildForm({username:b,password:k}),this.serverConfig=_.data.serverConfig,_.queryParams.externalAuthToken?this.loadExternalAuthToken(_.queryParams.username,_.queryParams.externalAuthToken):_.queryParams.externalAuthError&&(this.externalAuthError=!0)}ngAfterViewInit(){this.hooks.runAction("action:login.init","login")}getExternalLogins(){return this.serverConfig.plugin.registeredExternalAuths}getAuthHref(_){return y.N.apiUrl+`/plugins/${_.name}/${_.version}/auth/${_.authName}`}login(){this.error=null;const{username:_,password:t}=this.form.value;this.authService.login(_,t).subscribe({next:()=>this.redirectService.redirectToPreviousRoute(),error:r=>this.handleError(r)})}askResetPassword(){this.userService.askResetPassword(this.forgotPasswordEmail).subscribe({next:()=>{const _="Pasahitza berrezartzeko argibideak dituen mezu bat bidaliko da " + this.forgotPasswordEmail + " helbidera. Esteka ordubete barru iraungiko da.";this.notifier.success(_),this.hideForgotPasswordModal()},error:_=>this.notifier.error(_.message)})}openForgotPasswordModal(){this.openedForgotPasswordModal=this.modalService.open(this.forgotPasswordModal)}hideForgotPasswordModal(){this.openedForgotPasswordModal.close()}onInstanceAboutAccordionInit(_){this.accordion=_.accordion}hasUsernameUppercase(){return this.form.value.username.match(/[A-Z]/)}loadExternalAuthToken(_,t){this.isAuthenticatedWithExternalAuth=!0,this.authService.login(_,null,t).subscribe({next:()=>this.redirectService.redirectToPreviousRoute(),error:r=>{this.handleError(r),this.isAuthenticatedWithExternalAuth=!1}})}handleError(_){this.error=-1!==_.message.indexOf("credentials are invalid")?"Erabiltzaile-izen edo pasahitz okerra.":-1!==_.message.indexOf("blocked")?"Your account is blocked.":_.message}}return e.\u0275fac=function(_){return new(_||e)(n.Y36(M.Q4),n.Y36(g.gz),n.Y36(Z.FF),n.Y36(d.e8),n.Y36(d.KD),n.Y36(d.VH),n.Y36(d.d4),n.Y36(Y.n))},e.\u0275cmp=n.Xpm({type:e,selectors:[["my-login"]],viewQuery:function(_,t){if(1&_&&n.Gf(q,7),2&_){let r;n.iGM(r=n.CRH())&&(t.forgotPasswordModal=r.first)}},features:[n.qOj],decls:7,vars:2,consts:function(){let o,_,t,r,s,c,p,O,E,P,f,T,A,u,C,L,R,I,F,x,h,D,w;return o="\n    Hasi saioa\n  ",_="Sentitzen dugu, baina arazo bat egon da kanpoko sarbidearekin. Mesedez \n          " + "\ufffd#2\ufffd" + "jarri harremanetan administradorearekin\n          " + "\ufffd/#2\ufffd" + ". \n        ",t="Erabiltzailea",r="Erabiltzaile-izena edo eposta helbidea",s="Pasahitza",c="Pasahitza",p="Hasi saioa",O="Egin klik hemen zure pasahitza berrezartzeko",E="Pasahitza ahaztu dut",P="Kontu batekin sartzeak edukia argitaratzea ahalbidetuko dizu",f="Eskatu baieztatze eposta berria",T=" \u26A0\uFE0F Most email addresses do not include capital letters. ",A="Sortu kontu bat",u=" This instance allows registration. However, be careful to check the " + "\ufffd#2\ufffd" + "Terms" + "[\ufffd/#2\ufffd|\ufffd/#3\ufffd|\ufffd/#5\ufffd]" + "" + "\ufffd#3\ufffd" + "Terms" + "[\ufffd/#2\ufffd|\ufffd/#3\ufffd|\ufffd/#5\ufffd]" + " before creating an account. You may also search for another instance to match your exact needs at: " + "\ufffd#4\ufffd\ufffd/#4\ufffd" + "" + "\ufffd#5\ufffd" + "https://joinpeertube.org/instances" + "[\ufffd/#2\ufffd|\ufffd/#3\ufffd|\ufffd/#5\ufffd]" + ". ",u=n.Zx4(u),C=" Currently this instance doesn't allow for user registration, you may check the " + "\ufffd#2\ufffd" + "Terms" + "[\ufffd/#2\ufffd|\ufffd/#4\ufffd]" + " for more details or find an instance that gives you the possibility to sign up for an account and upload your videos there. Find yours among multiple instances at: " + "\ufffd#3\ufffd\ufffd/#3\ufffd" + "" + "\ufffd#4\ufffd" + "https://joinpeertube.org/instances" + "[\ufffd/#2\ufffd|\ufffd/#4\ufffd]" + ". ",C=n.Zx4(C),L="Edo hasi saioa honekin",R="Pasahitza ahaztu duzu",I="Eposta",F="Eposta helbidea",x="Utzi",h="Berrezarri",D="Sentitzen dugu, ezin duzu zure pasahitza berreskuratu, instantziaren administratzaileak ez baitzuen PeerTubeko posta elektronikoko sistema konfiguratu.",w="Sartu zure eposta helbidea eta zure pasahitza berrezartzeko esteka bat bidaliko dizugu.",[[1,"margin-content"],[1,"title-page","title-page-single"],o,["class","alert alert-danger",4,"ngIf"],[4,"ngIf"],["forgotPasswordModal",""],[1,"alert","alert-danger"],_,["routerLink","/about"],[1,"wrapper"],[1,"login-form-and-externals"],["role","form",3,"formGroup","ngSubmit"],[1,"form-group"],["for","username"],t,["type","text","id","username","placeholder",r,"required","","tabindex","1","formControlName","username","myAutofocus","",1,"form-control",3,"ngClass"],["class","form-error",4,"ngIf"],["class","form-warning",4,"ngIf"],["for","password"],s,["formControlName","password","inputId","password","placeholder",c,"autocomplete","current-password",3,"ngClass","tabindex"],["type","submit","value",p,1,"peertube-button","orange-button",3,"disabled"],[1,"additionnal-links"],["title",O,1,"forgot-password-button",3,"click"],E,["class","signup-link",4,"ngIf"],["role","alert",1,"looking-for-account","alert","alert-info"],[1,"alert-heading"],P,["class","external-login-blocks",4,"ngIf"],[1,"instance-information"],["instanceInformation",""],[3,"panels","init"],["routerLink","/verify-account/ask-send-email"],f,[1,"form-error"],[1,"form-warning"],T,[1,"signup-link"],["routerLink","/signup",1,"create-an-account"],A,u,["href","#",1,"terms-anchor",3,"click"],["target","_blank","routerLink","/about/instance","fragment","terms",1,"terms-link"],["href","https://joinpeertube.org/instances","target","_blank","rel","noopener noreferrer",1,"alert-link"],C,["href","#",3,"click"],[1,"external-login-blocks"],[1,"block-title"],L,["class","external-login-block","role","button",3,"href",4,"ngFor","ngForOf"],["role","button",1,"external-login-block",3,"href"],[1,"modal-header"],[1,"modal-title"],R,["iconName","cross","aria-label","Close","role","button",3,"click"],[1,"modal-body"],["class","forgot-password-instructions",4,"ngIf"],[1,"form-group",3,"hidden"],["for","forgot-password-email"],I,["type","email","id","forgot-password-email","placeholder",F,"required","",3,"ngModel","ngModelChange"],["forgotPasswordEmailInput",""],[1,"modal-footer","inputs"],["type","button","role","button","value",x,1,"peertube-button","grey-button",3,"click","key.enter"],["type","submit","value",h,1,"peertube-button","orange-button",3,"disabled","click"],D,[1,"forgot-password-instructions"],w]},template:function(_,t){1&_&&(n.TgZ(0,"div",0),n.TgZ(1,"div",1),n.SDv(2,2),n.qZA(),n.YNc(3,J,3,0,"div",3),n.YNc(4,rn,31,18,"ng-container",4),n.qZA(),n.YNc(5,ln,15,5,"ng-template",null,5,n.W1O)),2&_&&(n.xp6(3),n.Q6J("ngIf",t.externalAuthError),n.xp6(1),n.Q6J("ngIf",!t.externalAuthError&&!t.isAuthenticatedWithExternalAuth))},directives:[m.O5,g.yS,l._Y,l.JL,l.sg,l.Fj,l.Q7,l.JJ,l.u,U.U,m.mk,K.X,B.J,m.sg,X.$,l.On],styles:["label[_ngcontent-%COMP%]{display:block}input[type=text][_ngcontent-%COMP%], input[type=email][_ngcontent-%COMP%]{padding:0 15px;display:inline-block;height:30px;width:340px;color:var(--inputForegroundColor);background-color:var(--inputBackgroundColor);border:1px solid #C6C6C6;border-radius:3px;font-size:15px}input[type=text][_ngcontent-%COMP%]::placeholder, input[type=email][_ngcontent-%COMP%]::placeholder{color:var(--inputPlaceholderColor)}input[type=text][readonly][_ngcontent-%COMP%], input[type=email][readonly][_ngcontent-%COMP%]{opacity:.7}@media screen and (max-width: calc(340px + 40px)){input[type=text][_ngcontent-%COMP%], input[type=email][_ngcontent-%COMP%]{width:100%}}.modal-body[_ngcontent-%COMP%]{text-align:start}.modal-body[_ngcontent-%COMP%]   .forgot-password-instructions[_ngcontent-%COMP%]{margin-bottom:20px}@media screen and (max-width: 540px){.modal-body[_ngcontent-%COMP%]   #forgot-password-email[_ngcontent-%COMP%]{width:100%}.modal-footer[_ngcontent-%COMP%]   .grey-button[_ngcontent-%COMP%]{display:none}}.create-an-account[_ngcontent-%COMP%], .forgot-password-button[_ngcontent-%COMP%]{color:var(--mainForegroundColor);cursor:pointer;transition:opacity cubic-bezier(.39,.575,.565,1)}.create-an-account[_ngcontent-%COMP%]:hover, .forgot-password-button[_ngcontent-%COMP%]:hover{text-decoration:none!important;opacity:.7!important}.wrapper[_ngcontent-%COMP%]{display:flex;justify-content:space-around;flex-wrap:wrap}.wrapper[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]{flex:1 1}.wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;font-size:15px;max-width:450px;margin-bottom:40px}@supports (margin-inline-start: 10px){.wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%]{margin-inline-start:10px}}@supports not (margin-inline-start: 10px){.wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%]{margin-left:10px}}@supports (margin-inline-end: 10px){.wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%]{margin-inline-end:10px}}@supports not (margin-inline-end: 10px){.wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%]{margin-right:10px}}.wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%]   form[_ngcontent-%COMP%]{margin:0}.wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%]   form[_ngcontent-%COMP%], .wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%]   form[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]{width:100%}.wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%]   form[_ngcontent-%COMP%]   .additionnal-links[_ngcontent-%COMP%]{display:block;text-align:center;margin-top:20px;margin-bottom:20px}.wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%]   form[_ngcontent-%COMP%]   .additionnal-links[_ngcontent-%COMP%]   .forgot-password-button[_ngcontent-%COMP%], .wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%]   form[_ngcontent-%COMP%]   .additionnal-links[_ngcontent-%COMP%]   .create-an-account[_ngcontent-%COMP%]{padding:4px;display:inline-block;color:var(--mainColor)}.wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%]   form[_ngcontent-%COMP%]   .additionnal-links[_ngcontent-%COMP%]   .forgot-password-button[_ngcontent-%COMP%]:hover, .wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%]   form[_ngcontent-%COMP%]   .additionnal-links[_ngcontent-%COMP%]   .forgot-password-button[_ngcontent-%COMP%]:active, .wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%]   form[_ngcontent-%COMP%]   .additionnal-links[_ngcontent-%COMP%]   .create-an-account[_ngcontent-%COMP%]:hover, .wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%]   form[_ngcontent-%COMP%]   .additionnal-links[_ngcontent-%COMP%]   .create-an-account[_ngcontent-%COMP%]:active{color:var(--mainHoverColor)}.wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%]   .external-login-blocks[_ngcontent-%COMP%]{min-width:200px}.wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%]   .external-login-blocks[_ngcontent-%COMP%]   .block-title[_ngcontent-%COMP%]{font-weight:600}.wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%]   .external-login-blocks[_ngcontent-%COMP%]   .external-login-block[_ngcontent-%COMP%]{cursor:pointer;border:1px solid #d1d7e0;border-radius:5px;color:var(--mainForegroundColor);margin:10px 10px 0 0;display:flex;justify-content:center;align-items:center;min-height:35px;min-width:100px}.wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%]   .external-login-blocks[_ngcontent-%COMP%]   .external-login-block[_ngcontent-%COMP%]:hover, .wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%]   .external-login-blocks[_ngcontent-%COMP%]   .external-login-block[_ngcontent-%COMP%]:focus, .wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%]   .external-login-blocks[_ngcontent-%COMP%]   .external-login-block[_ngcontent-%COMP%]:active{text-decoration:none!important;outline:none!important}.wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%]   .external-login-blocks[_ngcontent-%COMP%]   .external-login-block[_ngcontent-%COMP%]:hover{background-color:#d1d7e080}.wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%]   .signup-link[_ngcontent-%COMP%]{display:inline-block}.wrapper[_ngcontent-%COMP%]   .instance-information[_ngcontent-%COMP%]{max-width:600px;min-width:350px;margin-bottom:40px}@supports (margin-inline-start: 10px){.wrapper[_ngcontent-%COMP%]   .instance-information[_ngcontent-%COMP%]{margin-inline-start:10px}}@supports not (margin-inline-start: 10px){.wrapper[_ngcontent-%COMP%]   .instance-information[_ngcontent-%COMP%]{margin-left:10px}}@supports (margin-inline-end: 10px){.wrapper[_ngcontent-%COMP%]   .instance-information[_ngcontent-%COMP%]{margin-inline-end:10px}}@supports not (margin-inline-end: 10px){.wrapper[_ngcontent-%COMP%]   .instance-information[_ngcontent-%COMP%]{margin-right:10px}}.wrapper[_ngcontent-%COMP%]   .terms-anchor[_ngcontent-%COMP%]{display:inline}.wrapper[_ngcontent-%COMP%]   .terms-link[_ngcontent-%COMP%]{display:none}@media screen and (max-width: breakpoint(md)){.wrapper[_ngcontent-%COMP%]{flex-direction:column-reverse}.wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%], .wrapper[_ngcontent-%COMP%]   .instance-information[_ngcontent-%COMP%]{width:100%;max-width:450px;min-width:unset;align-self:center}@supports (margin-inline-start: 0){.wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%], .wrapper[_ngcontent-%COMP%]   .instance-information[_ngcontent-%COMP%]{margin-inline-start:0}}@supports not (margin-inline-start: 0){.wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%], .wrapper[_ngcontent-%COMP%]   .instance-information[_ngcontent-%COMP%]{margin-left:0}}@supports (margin-inline-end: 0){.wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%], .wrapper[_ngcontent-%COMP%]   .instance-information[_ngcontent-%COMP%]{margin-inline-end:0}}@supports not (margin-inline-end: 0){.wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%], .wrapper[_ngcontent-%COMP%]   .instance-information[_ngcontent-%COMP%]{margin-right:0}}.wrapper[_ngcontent-%COMP%]   .instance-information[_ngcontent-%COMP%]     .accordion{display:none}.wrapper[_ngcontent-%COMP%]   .terms-anchor[_ngcontent-%COMP%]{display:none}.wrapper[_ngcontent-%COMP%]   .terms-link[_ngcontent-%COMP%]{display:inline}}@media screen and (max-width: breakpoint(md)240px){.main-col:not(.expanded)[_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%], .main-col:not(.expanded)   [_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]{flex-direction:column-reverse}.main-col:not(.expanded)[_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%], .main-col:not(.expanded)   [_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%], .main-col:not(.expanded)[_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .instance-information[_ngcontent-%COMP%], .main-col:not(.expanded)   [_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .instance-information[_ngcontent-%COMP%]{width:100%;max-width:450px;min-width:unset;align-self:center}@supports (margin-inline-start: 0){.main-col:not(.expanded)[_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%], .main-col:not(.expanded)   [_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%], .main-col:not(.expanded)[_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .instance-information[_ngcontent-%COMP%], .main-col:not(.expanded)   [_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .instance-information[_ngcontent-%COMP%]{margin-inline-start:0}}@supports not (margin-inline-start: 0){.main-col:not(.expanded)[_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%], .main-col:not(.expanded)   [_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%], .main-col:not(.expanded)[_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .instance-information[_ngcontent-%COMP%], .main-col:not(.expanded)   [_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .instance-information[_ngcontent-%COMP%]{margin-left:0}}@supports (margin-inline-end: 0){.main-col:not(.expanded)[_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%], .main-col:not(.expanded)   [_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%], .main-col:not(.expanded)[_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .instance-information[_ngcontent-%COMP%], .main-col:not(.expanded)   [_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .instance-information[_ngcontent-%COMP%]{margin-inline-end:0}}@supports not (margin-inline-end: 0){.main-col:not(.expanded)[_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%], .main-col:not(.expanded)   [_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .login-form-and-externals[_ngcontent-%COMP%], .main-col:not(.expanded)[_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .instance-information[_ngcontent-%COMP%], .main-col:not(.expanded)   [_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .instance-information[_ngcontent-%COMP%]{margin-right:0}}.main-col:not(.expanded)[_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .instance-information[_ngcontent-%COMP%]     .accordion, .main-col:not(.expanded)   [_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .instance-information[_ngcontent-%COMP%]     .accordion{display:none}.main-col:not(.expanded)[_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .terms-anchor[_ngcontent-%COMP%], .main-col:not(.expanded)   [_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .terms-anchor[_ngcontent-%COMP%]{display:none}.main-col:not(.expanded)[_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .terms-link[_ngcontent-%COMP%], .main-col:not(.expanded)   [_nghost-%COMP%]   .wrapper[_ngcontent-%COMP%]   .terms-link[_ngcontent-%COMP%]{display:inline}}"]}),e})(),data:{meta:{title:"Hasi saioa"}},resolve:{serverConfig:G.m}}];let gn=(()=>{class e{}return e.\u0275fac=function(_){return new(_||e)},e.\u0275mod=n.oAB({type:e}),e.\u0275inj=n.cJS({imports:[[g.Bz.forChild(cn)],g.Bz]}),e})(),dn=(()=>{class e{}return e.\u0275fac=function(_){return new(_||e)},e.\u0275mod=n.oAB({type:e}),e.\u0275inj=n.cJS({providers:[],imports:[[gn,V.nC,M.hA,v.Y,$.nN]]}),e})()}}]);