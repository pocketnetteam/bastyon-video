"use strict";(self.webpackChunkpeertube_client=self.webpackChunkpeertube_client||[]).push([[954],{28954:(y,r,N)=>{N.r(r),N.d(r,{PageNotFoundModule:()=>V});var T=N(16274),O=N(49393),s=N(359),_=N(42741),D=N(93220);function C(e,n){if(1&e&&(_.ynx(0),_.SDv(1,12),_.BQk()),2&e){const t=_.oxw(2);_.xp6(1),_.pQV(t.pathname),_.QtT(1)}}function p(e,n){if(1&e&&(_.ynx(0),_.SDv(1,13),_.BQk()),2&e){const t=_.oxw(2);_.xp6(1),_.pQV(t.pathname),_.QtT(1)}}function M(e,n){1&e&&(_.ynx(0),_.SDv(1,14),_.BQk())}function m(e,n){1&e&&(_.ynx(0),_.SDv(1,15),_.BQk())}function F(e,n){if(1&e&&(_.TgZ(0,"div",3),_.TgZ(1,"strong"),_._uU(2),_.qZA(),_.TgZ(3,"span",4),_.SDv(4,5),_.qZA(),_.TgZ(5,"div",6),_.YNc(6,C,2,1,"ng-container",7),_.YNc(7,p,2,1,"ng-container",7),_.qZA(),_.TgZ(8,"div",8),_.TgZ(9,"span"),_.SDv(10,9),_.qZA(),_.TgZ(11,"ul"),_.TgZ(12,"li"),_.SDv(13,10),_.qZA(),_.TgZ(14,"li"),_.YNc(15,M,2,0,"ng-container",7),_.YNc(16,m,2,0,"ng-container",7),_.qZA(),_.TgZ(17,"li"),_.SDv(18,11),_.qZA(),_.qZA(),_.qZA(),_.qZA()),2&e){const t=_.oxw();_.xp6(2),_.hij("",t.status,"."),_.xp6(4),_.Q6J("ngIf","video"===t.type),_.xp6(1),_.Q6J("ngIf","video"!==t.type),_.xp6(8),_.Q6J("ngIf","video"===t.type),_.xp6(1),_.Q6J("ngIf","video"!==t.type)}}function f(e,n){1&e&&(_.ynx(0),_.SDv(1,17),_.BQk())}function I(e,n){1&e&&(_.ynx(0),_.SDv(1,18),_.BQk())}function h(e,n){if(1&e&&(_.TgZ(0,"div",3),_.TgZ(1,"strong"),_._uU(2),_.qZA(),_.TgZ(3,"span",4),_.SDv(4,16),_.qZA(),_.TgZ(5,"div",6),_.YNc(6,f,2,0,"ng-container",7),_.YNc(7,I,2,0,"ng-container",7),_.qZA(),_.qZA()),2&e){const t=_.oxw();_.xp6(2),_.hij("",t.status,"."),_.xp6(4),_.Q6J("ngIf","video"===t.type),_.xp6(1),_.Q6J("ngIf","video"!==t.type)}}function U(e,n){if(1&e&&(_.TgZ(0,"div",3),_.TgZ(1,"strong"),_._uU(2),_.qZA(),_.TgZ(3,"span",4),_._uU(4,"I'm a teapot."),_.qZA(),_.TgZ(5,"div",6),_.SDv(6,19),_.qZA(),_.TgZ(7,"div",20),_.SDv(8,21),_.qZA(),_.qZA()),2&e){const t=_.oxw();_.xp6(2),_.hij("",t.status,".")}}let L=(()=>{class e{constructor(t,i){var a;this.titleService=t,this.router=i,this.status=s.WE.NOT_FOUND_404,this.type="other";const E=null===(a=this.router.getCurrentNavigation())||void 0===a?void 0:a.extras.state;this.type=(null==E?void 0:E.type)||this.type,this.status=(null==E?void 0:E.obj.status)||this.status}ngOnInit(){this.pathname.includes("teapot")&&(this.status=s.WE.I_AM_A_TEAPOT_418,this.titleService.setTitle("I'm a teapot"+" - PeerTube"))}get pathname(){return window.location.pathname}getMascotName(){switch(this.status){case s.WE.I_AM_A_TEAPOT_418:return"happy";case s.WE.FORBIDDEN_403:return"arguing";case s.WE.NOT_FOUND_404:default:return"defeated"}}}return e.\u0275fac=function(t){return new(t||e)(_.Y36(D.Dx),_.Y36(O.F0))},e.\u0275cmp=_.Xpm({type:e,selectors:[["my-page-not-found"]],decls:5,vars:5,consts:function(){let n,t,i,a,E,g,S,u,A,l,c,P,R;return n="\u0647\u0630\u0627 \u062E\u0637\u0623.",t="\u0627\u0644\u0623\u0633\u0628\u0627\u0628 \u0627\u0644\u0645\u062D\u062A\u0645\u0644\u0629:",i="\u0627\u0633\u062A\u062E\u062F\u0645\u062A \u0631\u0627\u0628\u0637 \u0645\u0639\u0637\u0644 \u0623\u0648 \u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629",a="\u0631\u0628\u0645\u0627 \u0623\u062E\u0637\u0623\u062A \u0643\u062A\u0627\u0628\u0629 \u0627\u0644\u0631\u0627\u0628\u0637",E="We couldn't find any video tied to the URL " + "\ufffd0\ufffd" + " you were looking for.",g="We couldn't find any resource tied to the URL " + "\ufffd0\ufffd" + " you were looking for.",S="The video may have been moved or deleted",u="The resource may have been moved or deleted",A="You are not authorized here.",l="You might need to check your account is allowed by the video or instance owner.",c="You might need to check your account is allowed by the resource or instance owner.",P=" The requested entity body blends sweet bits with a mellow earthiness. ",R="\u064A\u0628\u062F\u0648 \u0623\u0646\u0651\u0647 \u064A\u0639\u062C\u0628 \u0633\u0628\u064A\u0627.",[[1,"root"],["class","box",4,"ngIf"],[3,"src","alt"],[1,"box"],[1,"ml-1","text-muted"],n,[1,"text","mt-4"],[4,"ngIf"],[1,"text-muted","mt-4"],t,i,a,E,g,S,u,A,l,c,P,[1,"text-muted"],R]},template:function(t,i){1&t&&(_.TgZ(0,"div",0),_.YNc(1,F,19,5,"div",1),_.YNc(2,h,8,3,"div",1),_.YNc(3,U,9,1,"div",1),_._UZ(4,"img",2),_.qZA()),2&t&&(_.xp6(1),_.Q6J("ngIf",403!==i.status&&418!==i.status),_.xp6(1),_.Q6J("ngIf",403===i.status),_.xp6(1),_.Q6J("ngIf",418===i.status),_.xp6(1),_.MGl("src","/client/assets/images/mascot/",i.getMascotName(),".svg",_.LSH),_.MGl("alt","",i.status," mascot"))},directives:[T.O5],styles:[".root[_ngcontent-%COMP%]{height:100%;text-align:center;padding-top:150px;display:flex;justify-content:center;flex-direction:column-reverse}@supports (margin-inline-start: auto){.root[_ngcontent-%COMP%]{margin-inline-start:auto}}@supports not (margin-inline-start: auto){.root[_ngcontent-%COMP%]{margin-left:auto}}@supports (margin-inline-end: auto){.root[_ngcontent-%COMP%]{margin-inline-end:auto}}@supports not (margin-inline-end: auto){.root[_ngcontent-%COMP%]{margin-right:auto}}.root[_ngcontent-%COMP%]   .box[_ngcontent-%COMP%]{text-align:start;font-size:120%;padding:0 15px}.root[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{width:220px;height:auto}@supports (margin-inline-start: auto){.root[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{margin-inline-start:auto}}@supports not (margin-inline-start: auto){.root[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{margin-left:auto}}@media screen and (max-width: 500px){@supports (margin-inline-end: auto){.root[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{margin-inline-end:auto}}@supports not (margin-inline-end: auto){.root[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{margin-right:auto}}}@media screen and (min-width: 500px){.root[_ngcontent-%COMP%]{width:400px}}@media screen and (min-width: breakpoint(lg)){.root[_ngcontent-%COMP%]{width:600px}}@media screen and (min-width: breakpoint(xl)){.root[_ngcontent-%COMP%]{width:700px}}@media screen and (min-width: breakpoint(xxl)){.root[_ngcontent-%COMP%]{width:800px}}@media screen and (max-height: 600px){.root[_ngcontent-%COMP%]{padding-top:50px}.root[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{width:160px}}"]}),e})();var d=N(54755);const v=[{path:"",component:L,canActivate:[d.t.close(!0)],canDeactivate:[d.t.open(!0)],data:{meta:{title:"\u0644\u0645 \u064A\u064F\u0639\u062B\u0631 \u0639\u0644\u064A\u0647"}}}];let G=(()=>{class e{}return e.\u0275fac=function(t){return new(t||e)},e.\u0275mod=_.oAB({type:e}),e.\u0275inj=_.cJS({imports:[[O.Bz.forChild(v)],O.Bz]}),e})(),V=(()=>{class e{}return e.\u0275fac=function(t){return new(t||e)},e.\u0275mod=_.oAB({type:e}),e.\u0275inj=_.cJS({providers:[],imports:[[T.ez,G]]}),e})()}}]);