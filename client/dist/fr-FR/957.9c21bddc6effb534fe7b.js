"use strict";(self.webpackChunkpeertube_client=self.webpackChunkpeertube_client||[]).push([[957],{33957:(F,A,e)=>{e.d(A,{jT:()=>O.j,yC:()=>n.y});var O=e(47372),n=(e(51214),e(77738),e(37116))},77738:(F,A,e)=>{e.d(A,{V:()=>x});var O=e(84167),I=e(44560),t=e(42741),n=e(54755),p=e(93324),d=e(16274),N=e(6733),R=e(73797);function P(a,S){1&a&&(t.tHW(0,4,1),t._UZ(1,"span"),t.N_p())}function h(a,S){1&a&&(t.tHW(0,4,2),t._UZ(1,"span"),t.N_p())}function B(a,S){1&a&&(t.ynx(0),t.SDv(1,7),t.BQk())}function f(a,S){1&a&&(t.TgZ(0,"my-help"),t.YNc(1,B,2,0,"ng-template",6),t.qZA())}function L(a,S){1&a&&(t.ynx(0),t.SDv(1,8),t.BQk())}function v(a,S){1&a&&(t.TgZ(0,"my-help"),t.YNc(1,L,2,0,"ng-template",6),t.qZA())}let x=(()=>{class a extends O.OI{constructor(E,c){super(),this.formValidatorService=E,this.notifier=c,this.interact=!1,this.showHelp=!1}ngOnInit(){this.buildForm({text:I.RJ})}onValidKey(){this.check(),this.form.valid&&this.formValidated()}formValidated(){const E=this.form.value.text,[c,T]=E.split("@"),i=window.location.protocol;fetch(`${i}//${T}/.well-known/webfinger?resource=acct:${c}@${T}`).then(u=>u.json()).then(u=>{if(!u||!1===Array.isArray(u.links))throw new Error("Not links in webfinger response");const b=u.links.find(g=>g&&"string"==typeof g.template&&"http://ostatus.org/schema/1.0/subscribe"===g.rel);if(null==b?void 0:b.template.includes("{uri}"))return b.template.replace("{uri}",encodeURIComponent(this.uri));throw new Error("No subscribe template in webfinger response")}).then(window.open).catch(u=>{console.error(u),this.notifier.error("Impossible d'obtenir des informations sur ce compte \xE0 distance")})}}return a.\u0275fac=function(E){return new(E||a)(t.Y36(O.Q4),t.Y36(n.d4))},a.\u0275cmp=t.Xpm({type:a,selectors:[["my-remote-subscribe"]],inputs:{uri:"uri",interact:"interact",showHelp:"showHelp"},features:[t.qOj],decls:9,vars:6,consts:function(){let S,E,c;return S="" + "\ufffd*5:1\ufffd\ufffd#1:1\ufffd" + "S'abonner \xE0 distance" + "[\ufffd/#1:1\ufffd\ufffd/*5:1\ufffd|\ufffd/#1:2\ufffd\ufffd/*6:2\ufffd]" + "" + "\ufffd*6:2\ufffd\ufffd#1:2\ufffd" + "Interaction distante" + "[\ufffd/#1:1\ufffd\ufffd/*5:1\ufffd|\ufffd/#1:2\ufffd\ufffd/*6:2\ufffd]" + "",S=t.Zx4(S),E="Vous pouvez vous abonner \xE0 la cha\xEEne via n'importe quelle instance fediverse compatible avec ActivityPub (PeerTube, Mastodon ou Pleroma par exemple).",c="Vous pouvez interagir avec cela via n'importe quelle instance fediverse compatible avec ActivityPub (PeerTube, Mastodon ou Pleroma par exemple).",[["novalidate","",3,"formGroup","ngSubmit"],[1,"form-group","mb-2"],["type","email","formControlName","text","placeholder","jane_doe@example.com",1,"form-control",3,"keyup.control.enter","keyup.meta.enter"],["type","submit",1,"btn","btn-sm","btn-remote-follow",3,"disabled"],S,[4,"ngIf"],["ptTemplate","customHtml"],E,c]},template:function(E,c){1&E&&(t.TgZ(0,"form",0),t.NdJ("ngSubmit",function(){return c.formValidated()}),t.TgZ(1,"div",1),t.TgZ(2,"input",2),t.NdJ("keyup.control.enter",function(){return c.onValidKey()})("keyup.meta.enter",function(){return c.onValidKey()}),t.qZA(),t.qZA(),t.TgZ(3,"button",3),t.tHW(4,4),t.YNc(5,P,2,0,"span",5),t.YNc(6,h,2,0,"span",5),t.N_p(),t.qZA(),t.YNc(7,f,2,0,"my-help",5),t.YNc(8,v,2,0,"my-help",5),t.qZA()),2&E&&(t.Q6J("formGroup",c.form),t.xp6(3),t.Q6J("disabled",!c.form.valid),t.xp6(2),t.Q6J("ngIf",!c.interact),t.xp6(1),t.Q6J("ngIf",c.interact),t.xp6(1),t.Q6J("ngIf",!c.interact&&c.showHelp),t.xp6(1),t.Q6J("ngIf",c.showHelp&&c.interact))},directives:[p._Y,p.JL,p.sg,p.Fj,p.JJ,p.u,d.O5,N.I,R.Y],styles:[".btn-remote-follow[_ngcontent-%COMP%]{padding-top:0;padding-bottom:0;border:0;font-weight:600;font-size:15px;height:30px;line-height:30px;border-radius:3px!important;text-align:center;cursor:pointer}@supports (padding-inline-start: 13px){.btn-remote-follow[_ngcontent-%COMP%]{padding-inline-start:13px}}@supports not (padding-inline-start: 13px){.btn-remote-follow[_ngcontent-%COMP%]{padding-left:13px}}@supports (padding-inline-end: 17px){.btn-remote-follow[_ngcontent-%COMP%]{padding-inline-end:17px}}@supports not (padding-inline-end: 17px){.btn-remote-follow[_ngcontent-%COMP%]{padding-right:17px}}.btn-remote-follow[_ngcontent-%COMP%]:focus, .btn-remote-follow.focus-visible[_ngcontent-%COMP%]{box-shadow:0 0 0 .2rem var(--mainColorLightest)}.btn-remote-follow[_ngcontent-%COMP%], .btn-remote-follow[_ngcontent-%COMP%]:active, .btn-remote-follow[_ngcontent-%COMP%]:focus{color:#fff;background-color:var(--mainColor)}.btn-remote-follow[_ngcontent-%COMP%]:hover{color:#fff;background-color:var(--mainHoverColor)}.btn-remote-follow[disabled][_ngcontent-%COMP%], .btn-remote-follow.disabled[_ngcontent-%COMP%]{cursor:default;color:#fff;background-color:#c6c6c6}.btn-remote-follow[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .feather, .btn-remote-follow[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .material, .btn-remote-follow[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .misc{color:#fff}"]}),a})()},37116:(F,A,e)=>{e.d(A,{y:()=>p});var O=e(84167),I=e(13010),t=e(47372),n=e(42741);let p=(()=>{class d{}return d.\u0275fac=function(R){return new(R||d)},d.\u0275mod=n.oAB({type:d}),d.\u0275inj=n.cJS({providers:[t.j],imports:[[I.n,O.hA]]}),d})()},51214:(F,A,e)=>{e.d(A,{h:()=>G});var O=e(19212),I=e(67066),t=e(4209),n=e(42741),p=e(54755),d=e(49393),N=e(47372),R=e(62026),P=e(16274),h=e(76476),B=e(77738),f=e(53067);function L(o,l){1&o&&n.GkF(0)}function v(o,l){1&o&&n.SDv(0,24)}function x(o,l){if(1&o&&(n.TgZ(0,"span"),n._uU(1),n.ynx(2),n.SDv(3,26),n.BQk(),n.qZA()),2&o){const _=n.oxw(3);n.xp6(1),n.AsE("",_.subscribeStatus(!0).length,"/",_.subscribed.size," ")}}function a(o,l){if(1&o&&(n.TgZ(0,"span"),n.SDv(1,25),n.qZA(),n.YNc(2,x,4,2,"span",10)),2&o){const _=n.oxw(2);n.xp6(2),n.Q6J("ngIf",_.isAtLeastOneChannelSubscribed)}}function S(o,l){if(1&o&&(n.TgZ(0,"span",27),n._uU(1),n.ALo(2,"myNumberFormatter"),n.qZA()),2&o){const _=n.oxw(2);n.xp6(1),n.hij(" ",n.lcZ(2,1,_.videoChannels[0].followersCount)," ")}}const E=function(o){return{"extra-text":o}};function c(o,l){if(1&o&&(n.TgZ(0,"span",19),n.YNc(1,L,1,0,"ng-container",20),n.YNc(2,v,1,0,"ng-template",null,21,n.W1O),n.YNc(4,a,3,1,"ng-template",null,22,n.W1O),n.qZA(),n.YNc(6,S,3,3,"span",23)),2&o){const _=n.MAs(3),r=n.MAs(5),s=n.oxw();n.Q6J("ngClass",n.VKq(5,E,s.isAtLeastOneChannelSubscribed)),n.xp6(1),n.Q6J("ngIf",s.account)("ngIfThen",r)("ngIfElse",_),n.xp6(5),n.Q6J("ngIf",!s.isBigButton&&s.displayFollowers&&s.videoChannels.length>1&&0!==s.videoChannel.followersCount)}}function T(o,l){}function i(o,l){if(1&o){const _=n.EpF();n.TgZ(0,"button",30),n.NdJ("click",function(){return n.CHM(_),n.oxw(2).subscribe()}),n.YNc(1,T,0,0,"ng-template",31),n.qZA()}if(2&o){n.oxw(2);const _=n.MAs(2);n.xp6(1),n.Q6J("ngTemplateOutlet",_)}}function u(o,l){if(1&o){const _=n.EpF();n.TgZ(0,"button",32),n.NdJ("click",function(){return n.CHM(_),n.oxw(2).unsubscribe()}),n.ynx(1),n.SDv(2,33),n.BQk(),n.qZA()}if(2&o){const _=n.oxw(2);n.xp6(2),n.pQV(_.account+""),n.QtT(2)}}function b(o,l){if(1&o&&(n.YNc(0,i,2,1,"button",28),n.YNc(1,u,3,1,"button",29)),2&o){const _=n.oxw();n.Q6J("ngIf",!_.isAllChannelsSubscribed),n.xp6(1),n.Q6J("ngIf",_.isAllChannelsSubscribed)}}function g(o,l){1&o&&n.GkF(0)}function U(o,l){1&o&&n.GkF(0)}function C(o,l){1&o&&(n.TgZ(0,"span"),n.SDv(1,34),n.qZA())}function m(o,l){1&o&&(n.TgZ(0,"span"),n.SDv(1,35),n.qZA())}const Z=function(o,l,_){return{"subscribe-button":o,"unsubscribe-button":l,big:_}};let G=(()=>{class o{constructor(_,r,s,D,y){this.authService=_,this.router=r,this.notifier=s,this.userSubscriptionService=D,this.videoService=y,this.displayFollowers=!1,this.size="normal",this.subscribed=new Map}get handle(){return this.account?this.account.nameWithHost:this.videoChannel.name+"@"+this.videoChannel.host}get channelHandle(){return this.getChannelHandler(this.videoChannel)}get uri(){return this.account?this.account.url:this.videoChannels[0].url}get rssUri(){return(this.account?this.videoService.getAccountFeedUrls(this.account.id).find(r=>"xml"===r.format):this.videoService.getVideoChannelFeedUrls(this.videoChannels[0].id).find(r=>"xml"===r.format)).url}get videoChannel(){return this.videoChannels[0]}get isAllChannelsSubscribed(){return this.subscribeStatus(!0).length===this.videoChannels.length}get isAtLeastOneChannelSubscribed(){return this.subscribeStatus(!0).length>0}get isBigButton(){return this.isUserLoggedIn()&&this.videoChannels.length>1&&this.isAtLeastOneChannelSubscribed}ngOnInit(){this.loadSubscribedStatus()}ngOnChanges(){this.ngOnInit()}subscribe(){return this.isUserLoggedIn()?this.localSubscribe():this.gotoLogin()}localSubscribe(){const _=this.subscribeStatus(!1),r=this.videoChannels.map(s=>this.getChannelHandler(s)).filter(s=>_.includes(s)).map(s=>this.userSubscriptionService.addSubscription(s));(0,O.D)(r).subscribe({next:()=>{this.notifier.success(this.account?"Abonn\xE9 \xE0 toutes les cha\xEEnes actuelles de " + this.account.displayName + ". Vous serez avertis de toutes leurs nouvelles vid\xE9os.":"Vous \xEAtes abonn\xE9 \xE0 " + this.videoChannels[0].displayName + ". Vous serez avertis de toutes leurs nouvelles vid\xE9os.","Abonn\xE9")},error:s=>this.notifier.error(s.message)})}unsubscribe(){this.isUserLoggedIn()&&this.localUnsubscribe()}localUnsubscribe(){const _=this.subscribeStatus(!0),r=this.videoChannels.map(s=>this.getChannelHandler(s)).filter(s=>_.includes(s)).map(s=>this.userSubscriptionService.deleteSubscription(s));(0,I.z)(...r).subscribe({complete:()=>{this.notifier.success(this.account?"D\xE9sabonn\xE9 de toutes les cha\xEEnes de " + this.account.nameWithHost + " ":"D\xE9sabonn\xE9 de " + this.videoChannels[0].nameWithHost + " ","D\xE9sabonn\xE9")},error:s=>this.notifier.error(s.message)})}isUserLoggedIn(){return this.authService.isLoggedIn()}gotoLogin(){this.router.navigate(["/login"])}subscribeStatus(_){const r=[];for(const[s,D]of this.subscribed.entries())D===_&&r.push(s);return r}isSubscribedToAll(){return Array.from(this.subscribed.values()).every(_=>!0===_)}getChannelHandler(_){return _.name+"@"+_.host}loadSubscribedStatus(){if(this.isUserLoggedIn())for(const _ of this.videoChannels){const r=this.getChannelHandler(_);this.subscribed.set(r,!1),(0,t.T)(this.userSubscriptionService.listenToSubscriptionCacheChange(r),this.userSubscriptionService.doesSubscriptionExist(r)).subscribe({next:s=>this.subscribed.set(r,s),error:s=>this.notifier.error(s.message)})}}}return o.\u0275fac=function(_){return new(_||o)(n.Y36(p.e8),n.Y36(d.F0),n.Y36(p.d4),n.Y36(N.j),n.Y36(R.kI))},o.\u0275cmp=n.Xpm({type:o,selectors:[["my-subscribe-button"]],inputs:{account:"account",videoChannels:"videoChannels",displayFollowers:"displayFollowers",size:"size"},features:[n.TTD],decls:24,vars:14,consts:function(){let l,_,r,s,D,y,$,w,K,V,H,Y;return l="Plusieurs fa\xE7ons de s'abonner \xE0 la cha\xEEne actuelle",_="Ouvrir le menu d'abonnement",r="En utilisant un compte ActivityPub",s="Souscrivez avec un compte \xE0 distance :",D="Utilisation d'un flux de syndication",y="S'abonner par RSS",$="S'abonner",w="S'abonner \xE0 toutes les cha\xEEnes",K="cha\xEEnes souscrites",V="{VAR_SELECT, select, undefined {Se d\xE9sabonner} other {Se d\xE9sabonner de tous les cha\xEEnes}}",V=n.Zx4(V,{VAR_SELECT:"\ufffd0\ufffd"}),H="S\u2019abonner avec un compte sur cette instance",Y="S'abonner avec un compte local",[[1,"btn-group-subscribe","btn-group",3,"ngClass"],["userLoggedOut",""],["userLoggedIn",""],[4,"ngIf","ngIfThen"],["ngbDropdown","","autoClose","outside","placement","bottom-right bottom-left","role","group","aria-label",l,1,"btn-group"],["ngbDropdownToggle","","aria-label",_,1,"btn","btn-sm","dropdown-toggle-split"],["ngbDropdownMenu","",1,"dropdown-menu"],[1,"dropdown-header"],r,[1,"dropdown-item",3,"click"],[4,"ngIf"],[1,"dropdown-item","dropdown-item-neutral"],[1,"mb-1"],s,[3,"showHelp","uri"],[1,"dropdown-divider"],D,["target","_blank",1,"dropdown-item",3,"href"],y,[3,"ngClass"],[4,"ngIf","ngIfThen","ngIfElse"],["single",""],["multiple",""],["class","followers-count",4,"ngIf"],$,w,K,[1,"followers-count"],["type","button","class","btn btn-sm",3,"click",4,"ngIf"],["type","button","class","btn btn-sm","role","button",3,"click",4,"ngIf"],["type","button",1,"btn","btn-sm",3,"click"],[3,"ngTemplateOutlet"],["type","button","role","button",1,"btn","btn-sm",3,"click"],V,H,Y]},template:function(_,r){if(1&_&&(n.TgZ(0,"div",0),n.YNc(1,c,7,7,"ng-template",null,1,n.W1O),n.YNc(3,b,2,2,"ng-template",null,2,n.W1O),n.YNc(5,g,1,0,"ng-container",3),n.TgZ(6,"div",4),n.TgZ(7,"button",5),n.YNc(8,U,1,0,"ng-container",3),n.qZA(),n.TgZ(9,"div",6),n.TgZ(10,"h6",7),n.SDv(11,8),n.qZA(),n.TgZ(12,"button",9),n.NdJ("click",function(){return r.subscribe()}),n.YNc(13,C,2,0,"span",10),n.YNc(14,m,2,0,"span",10),n.qZA(),n.TgZ(15,"button",11),n.TgZ(16,"div",12),n.SDv(17,13),n.qZA(),n._UZ(18,"my-remote-subscribe",14),n.qZA(),n._UZ(19,"div",15),n.TgZ(20,"h6",7),n.SDv(21,16),n.qZA(),n.TgZ(22,"a",17),n.SDv(23,18),n.qZA(),n.qZA(),n.qZA(),n.qZA()),2&_){const s=n.MAs(2),D=n.MAs(4);n.Q6J("ngClass",n.kEZ(10,Z,!r.isAllChannelsSubscribed,r.isAllChannelsSubscribed,r.isBigButton)),n.xp6(5),n.Q6J("ngIf",r.isUserLoggedIn())("ngIfThen",D),n.xp6(3),n.Q6J("ngIf",!r.isUserLoggedIn())("ngIfThen",s),n.xp6(5),n.Q6J("ngIf",!r.isUserLoggedIn()),n.xp6(1),n.Q6J("ngIf",r.isUserLoggedIn()),n.xp6(4),n.Q6J("showHelp",!0)("uri",r.uri),n.xp6(4),n.Q6J("href",r.rssUri,n.LSH)}},directives:[P.mk,P.O5,h.jt,h.iD,h.Vi,B.V,P.tP],pipes:[f.m],styles:[".btn-group-subscribe[_ngcontent-%COMP%]{border:0;font-weight:600;font-size:15px;height:30px;line-height:30px;border-radius:3px!important;text-align:center;cursor:pointer;float:right;padding:0}@supports (padding-inline-start: 13px){.btn-group-subscribe[_ngcontent-%COMP%]{padding-inline-start:13px}}@supports not (padding-inline-start: 13px){.btn-group-subscribe[_ngcontent-%COMP%]{padding-left:13px}}@supports (padding-inline-end: 17px){.btn-group-subscribe[_ngcontent-%COMP%]{padding-inline-end:17px}}@supports not (padding-inline-end: 17px){.btn-group-subscribe[_ngcontent-%COMP%]{padding-right:17px}}.btn-group-subscribe[_ngcontent-%COMP%]:hover, .btn-group-subscribe[_ngcontent-%COMP%]:focus, .btn-group-subscribe[_ngcontent-%COMP%]:active{text-decoration:none!important;outline:none!important}.btn-group-subscribe[_ngcontent-%COMP%] > .btn[_ngcontent-%COMP%], .btn-group-subscribe[_ngcontent-%COMP%] > .dropdown[_ngcontent-%COMP%] > .dropdown-toggle[_ngcontent-%COMP%]{font-size:15px}.btn-group-subscribe[_ngcontent-%COMP%]:not(.big){white-space:nowrap}.btn-group-subscribe.big[_ngcontent-%COMP%]{height:35px}.btn-group-subscribe.big[_ngcontent-%COMP%] > button[_ngcontent-%COMP%]:first-child{width:-webkit-max-content;width:max-content;min-width:175px}.btn-group-subscribe.big[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]   .extra-text[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]:first-child{line-height:80%}.btn-group-subscribe.big[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]   .extra-text[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]:not(:first-child){font-size:75%}@supports (padding-inline-end: 3px){.btn-group-subscribe[_ngcontent-%COMP%] > .dropdown[_ngcontent-%COMP%] > .dropdown-toggle[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]{padding-inline-end:3px}}@supports not (padding-inline-end: 3px){.btn-group-subscribe[_ngcontent-%COMP%] > .dropdown[_ngcontent-%COMP%] > .dropdown-toggle[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]{padding-right:3px}}@supports (padding-inline-end: 4px){.btn-group-subscribe[_ngcontent-%COMP%] > .btn[_ngcontent-%COMP%]{padding-inline-end:4px}}@supports not (padding-inline-end: 4px){.btn-group-subscribe[_ngcontent-%COMP%] > .btn[_ngcontent-%COMP%]{padding-right:4px}}@supports (padding-inline-start: 2px){.btn-group-subscribe[_ngcontent-%COMP%] > .btn[_ngcontent-%COMP%] + .dropdown[_ngcontent-%COMP%] > button[_ngcontent-%COMP%]{padding-inline-start:2px}}@supports not (padding-inline-start: 2px){.btn-group-subscribe[_ngcontent-%COMP%] > .btn[_ngcontent-%COMP%] + .dropdown[_ngcontent-%COMP%] > button[_ngcontent-%COMP%]{padding-left:2px}}.btn-group-subscribe[_ngcontent-%COMP%] > .btn[_ngcontent-%COMP%] + .dropdown[_ngcontent-%COMP%] > button[_ngcontent-%COMP%]:after{position:relative;top:1px}.btn-group-subscribe.subscribe-button[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]{font-weight:600}.btn-group-subscribe.subscribe-button[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]:focus, .btn-group-subscribe.subscribe-button[_ngcontent-%COMP%]   .btn.focus-visible[_ngcontent-%COMP%]{box-shadow:0 0 0 .2rem var(--mainColorLightest)}.btn-group-subscribe.subscribe-button[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%], .btn-group-subscribe.subscribe-button[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]:active, .btn-group-subscribe.subscribe-button[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]:focus{color:#fff;background-color:var(--mainColor)}.btn-group-subscribe.subscribe-button[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]:hover{color:#fff;background-color:var(--mainHoverColor)}.btn-group-subscribe.subscribe-button[_ngcontent-%COMP%]   .btn[disabled][_ngcontent-%COMP%], .btn-group-subscribe.subscribe-button[_ngcontent-%COMP%]   .btn.disabled[_ngcontent-%COMP%]{cursor:default;color:#fff;background-color:#c6c6c6}.btn-group-subscribe.subscribe-button[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .feather, .btn-group-subscribe.subscribe-button[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .material, .btn-group-subscribe.subscribe-button[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .misc{color:#fff}@supports (padding-inline-start: 5px){.btn-group-subscribe.subscribe-button[_ngcontent-%COMP%]   span.followers-count[_ngcontent-%COMP%]{padding-inline-start:5px}}@supports not (padding-inline-start: 5px){.btn-group-subscribe.subscribe-button[_ngcontent-%COMP%]   span.followers-count[_ngcontent-%COMP%]{padding-left:5px}}.btn-group-subscribe.unsubscribe-button[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]{background-color:#e5e5e5;color:var(--greyForegroundColor);font-weight:600}.btn-group-subscribe.unsubscribe-button[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]:focus, .btn-group-subscribe.unsubscribe-button[_ngcontent-%COMP%]   .btn.focus-visible[_ngcontent-%COMP%]{box-shadow:0 0 0 .2rem #5858580d}.btn-group-subscribe.unsubscribe-button[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]:hover, .btn-group-subscribe.unsubscribe-button[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]:active, .btn-group-subscribe.unsubscribe-button[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]:focus, .btn-group-subscribe.unsubscribe-button[_ngcontent-%COMP%]   .btn[disabled][_ngcontent-%COMP%], .btn-group-subscribe.unsubscribe-button[_ngcontent-%COMP%]   .btn.disabled[_ngcontent-%COMP%]{color:var(--greyForegroundColor);background-color:#efefef}.btn-group-subscribe.unsubscribe-button[_ngcontent-%COMP%]   .btn[disabled][_ngcontent-%COMP%], .btn-group-subscribe.unsubscribe-button[_ngcontent-%COMP%]   .btn.disabled[_ngcontent-%COMP%]{cursor:default}.btn-group-subscribe.unsubscribe-button[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .feather, .btn-group-subscribe.unsubscribe-button[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .material, .btn-group-subscribe.unsubscribe-button[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .misc{color:var(--greyForegroundColor)}.btn-group-subscribe[_ngcontent-%COMP%]   .dropdown-menu[_ngcontent-%COMP%]{cursor:default}.btn-group-subscribe[_ngcontent-%COMP%]   .dropdown-menu[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{cursor:pointer}.btn-group-subscribe[_ngcontent-%COMP%]   .dropdown-menu[_ngcontent-%COMP%]   .dropdown-item-neutral[_ngcontent-%COMP%]{cursor:default}.btn-group-subscribe[_ngcontent-%COMP%]   .dropdown-menu[_ngcontent-%COMP%]   .dropdown-item-neutral[_ngcontent-%COMP%]:hover, .btn-group-subscribe[_ngcontent-%COMP%]   .dropdown-menu[_ngcontent-%COMP%]   .dropdown-item-neutral[_ngcontent-%COMP%]:focus{background-color:inherit}.btn-group-subscribe[_ngcontent-%COMP%]     form{padding:.25rem 1rem}.btn-group-subscribe[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]{padding:0 15px;display:inline-block;height:30px;width:100%;color:var(--inputForegroundColor);background-color:var(--inputBackgroundColor);border:1px solid #C6C6C6;border-radius:3px;font-size:15px}.btn-group-subscribe[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]::placeholder{color:var(--inputPlaceholderColor)}.btn-group-subscribe[_ngcontent-%COMP%]   input[readonly][_ngcontent-%COMP%]{opacity:.7}@media screen and (max-width: calc(100% + 40px)){.btn-group-subscribe[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]{width:100%}}.extra-text[_ngcontent-%COMP%]{display:flex;flex-direction:column}.extra-text[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]:first-child{line-height:75%}.extra-text[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]:not(:first-child){font-size:60%;text-align:start}"]}),o})()},47372:(F,A,e)=>{e.d(A,{j:()=>c});var O=e(57115),t=e(87347),n=e(64033),p=e(4209),d=e(36371),N=e(72754),R=e(97142),P=e(29230),h=e(17310),B=e(17144),f=e(31887),L=e(86804),v=e(62026),x=e(24766),a=e(42741),S=e(54755);const E=O("peertube:subscriptions:UserSubscriptionService");class c{constructor(i,u,b,g,U){this.authHttp=i,this.restExtractor=u,this.videoService=b,this.restService=g,this.ngZone=U,this.existsSubject=new t.t(1),this.myAccountSubscriptionCache={},this.myAccountSubscriptionCacheObservable={},this.myAccountSubscriptionCacheSubject=new n.x,this.existsObservable=(0,p.T)((0,L.f8)({time:500,ngZone:this.ngZone,notifierObservable:this.existsSubject,bulkGet:this.doSubscriptionsExist.bind(this)}),this.myAccountSubscriptionCacheSubject)}getUserSubscriptionVideos(i){const{videoPagination:u,sort:b,skipCount:g}=i,U=this.restService.componentPaginationToRestPagination(u);let C=new f.LE;return C=this.restService.addRestGetParams(C,U,b),g&&(C=C.set("skipCount",g+"")),this.authHttp.get(c.BASE_USER_SUBSCRIPTIONS_URL+"/videos",{params:C}).pipe((0,N.w)(m=>this.videoService.extractVideos(m)),(0,R.K)(m=>this.restExtractor.handleError(m)))}deleteSubscription(i){return this.authHttp.delete(c.BASE_USER_SUBSCRIPTIONS_URL+"/"+i).pipe((0,P.U)(this.restExtractor.extractDataBool),(0,h.b)(()=>{this.myAccountSubscriptionCache[i]=!1,this.myAccountSubscriptionCacheSubject.next(this.myAccountSubscriptionCache)}),(0,R.K)(b=>this.restExtractor.handleError(b)))}addSubscription(i){return this.authHttp.post(c.BASE_USER_SUBSCRIPTIONS_URL,{uri:i}).pipe((0,P.U)(this.restExtractor.extractDataBool),(0,h.b)(()=>{this.myAccountSubscriptionCache[i]=!0,this.myAccountSubscriptionCacheSubject.next(this.myAccountSubscriptionCache)}),(0,R.K)(g=>this.restExtractor.handleError(g)))}listSubscriptions(i){const{pagination:u,search:b}=i,g=c.BASE_USER_SUBSCRIPTIONS_URL,U=this.restService.componentPaginationToRestPagination(u);let C=new f.LE;return C=this.restService.addRestGetParams(C,U),b&&(C=C.append("search",b)),this.authHttp.get(g,{params:C}).pipe((0,P.U)(m=>v.B1.extractVideoChannels(m)),(0,R.K)(m=>this.restExtractor.handleError(m)))}listenToMyAccountSubscriptionCacheSubject(){return this.myAccountSubscriptionCacheSubject.asObservable()}listenToSubscriptionCacheChange(i){if(i in this.myAccountSubscriptionCacheObservable)return this.myAccountSubscriptionCacheObservable[i];const u=this.existsObservable.pipe((0,B.h)(b=>void 0!==b[i]),(0,P.U)(b=>b[i]));return this.myAccountSubscriptionCacheObservable[i]=u,u}doesSubscriptionExist(i){return E("Running subscription check for %d.",i),i in this.myAccountSubscriptionCache?(E("Found cache for %d.",i),(0,d.of)(this.myAccountSubscriptionCache[i])):(this.existsSubject.next(i),E("Fetching from network for %d.",i),this.existsObservable.pipe((0,B.h)(u=>void 0!==u[i]),(0,P.U)(u=>u[i]),(0,h.b)(u=>this.myAccountSubscriptionCache[i]=u)))}doSubscriptionsExist(i){const u=c.BASE_USER_SUBSCRIPTIONS_URL+"/exist";let b=new f.LE;return b=this.restService.addObjectParams(b,{uris:i}),this.authHttp.get(u,{params:b}).pipe((0,h.b)(g=>{this.myAccountSubscriptionCache=Object.assign(Object.assign({},this.myAccountSubscriptionCache),g)}),(0,R.K)(g=>this.restExtractor.handleError(g)))}}c.BASE_USER_SUBSCRIPTIONS_URL=x.N.apiUrl+"/api/v1/users/me/subscriptions",c.\u0275fac=function(i){return new(i||c)(a.LFG(f.eN),a.LFG(S.DI),a.LFG(v.kI),a.LFG(S.vg),a.LFG(a.R0b))},c.\u0275prov=a.Yz7({token:c,factory:c.\u0275fac})}}]);