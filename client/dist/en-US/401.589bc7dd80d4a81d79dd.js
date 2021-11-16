"use strict";(self.webpackChunkpeertube_client=self.webpackChunkpeertube_client||[]).push([[401],{32401:(Tn,M,_)=>{_.r(M),_.d(M,{VideoChannelsModule:()=>An});var A=_(84167),T=_(97694),d=_(62026),V=_(67861),f=_(33957),x=_(15586),E=_(36226),g=_(49393),y=_(64033),l=_(54755),n=_(42741),c=_(16274),I=_(66717),L=_(33373);function b(e,o){if(1&e&&(n.TgZ(0,"div",5),n.SDv(1,6),n.qZA()),2&e){const t=n.oxw();n.xp6(1),n.pQV(t.pagination.totalItems)(t.pagination.totalItems),n.QtT(1)}}function w(e,o){1&e&&(n.TgZ(0,"div",7),n.SDv(1,8),n.qZA())}function R(e,o){if(1&e&&(n.TgZ(0,"div",9),n._UZ(1,"my-video-playlist-miniature",10),n.qZA()),2&e){const t=o.$implicit,i=n.oxw();n.xp6(1),n.Q6J("playlist",t)("toManage",!1)("displayAsRow",i.displayAsRow())}}let D=(()=>{class e{constructor(t,i,a){this.videoPlaylistService=t,this.videoChannelService=i,this.screenService=a,this.videoPlaylists=[],this.pagination={currentPage:1,itemsPerPage:20,totalItems:null},this.onDataSubject=new y.x}ngOnInit(){this.videoChannelSub=this.videoChannelService.videoChannelLoaded.subscribe(t=>{this.videoChannel=t,this.loadVideoPlaylists()})}ngOnDestroy(){this.videoChannelSub&&this.videoChannelSub.unsubscribe()}onNearOfBottom(){!(0,l._T)(this.pagination)||(this.pagination.currentPage+=1,this.loadVideoPlaylists())}displayAsRow(){return this.screenService.isInMobileView()}loadVideoPlaylists(){this.videoPlaylistService.listChannelPlaylists(this.videoChannel,this.pagination).subscribe(t=>{this.videoPlaylists=this.videoPlaylists.concat(t.data),this.pagination.totalItems=t.total,this.onDataSubject.next(t.data)})}}return e.\u0275fac=function(t){return new(t||e)(n.Y36(E.Qq),n.Y36(d.B1),n.Y36(l.H2))},e.\u0275cmp=n.Xpm({type:e,selectors:[["my-video-channel-playlists"]],decls:5,vars:4,consts:function(){let o,t,i;return o="{VAR_PLURAL, plural, =1 {1 playlist} other {{INTERPOLATION} playlists}}",o=n.Zx4(o,{VAR_PLURAL:"\ufffd0\ufffd",INTERPOLATION:"\ufffd1\ufffd"}),t=" Created " + o + " ",i="This channel does not have playlists.",[[1,"margin-content"],["class","title-page title-page-single",4,"ngIf"],["class","no-results",4,"ngIf"],["myInfiniteScroller","",1,"playlists",3,"dataObservable","nearOfBottom"],["class","playlist-wrapper",4,"ngFor","ngForOf"],[1,"title-page","title-page-single"],t,[1,"no-results"],i,[1,"playlist-wrapper"],[3,"playlist","toManage","displayAsRow"]]},template:function(t,i){1&t&&(n.TgZ(0,"div",0),n.YNc(1,b,2,2,"div",1),n.YNc(2,w,2,0,"div",2),n.TgZ(3,"div",3),n.NdJ("nearOfBottom",function(){return i.onNearOfBottom()}),n.YNc(4,R,2,3,"div",4),n.qZA(),n.qZA()),2&t&&(n.xp6(1),n.Q6J("ngIf",i.pagination.totalItems),n.xp6(1),n.Q6J("ngIf",0===i.pagination.totalItems),n.xp6(1),n.Q6J("dataObservable",i.onDataSubject.asObservable()),n.xp6(1),n.Q6J("ngForOf",i.videoPlaylists))},directives:[c.O5,I.A,c.sg,L.U],styles:[".playlists[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;justify-content:center}.playlists[_ngcontent-%COMP%]   .playlist-wrapper[_ngcontent-%COMP%]{padding-bottom:15px}@supports (margin-inline-end: 15px){.playlists[_ngcontent-%COMP%]   .playlist-wrapper[_ngcontent-%COMP%]{margin-inline-end:15px}}@supports not (margin-inline-end: 15px){.playlists[_ngcontent-%COMP%]   .playlist-wrapper[_ngcontent-%COMP%]{margin-right:15px}}.margin-content[_ngcontent-%COMP%]{--gridVideosMiniatureMargins: var(--videosHorizontalMarginContent)}@supports (margin-inline-start: var(--gridVideosMiniatureMargins) !important){.margin-content[_ngcontent-%COMP%]{margin-inline-start:var(--gridVideosMiniatureMargins)!important}}@supports not (margin-inline-start: var(--gridVideosMiniatureMargins) !important){.margin-content[_ngcontent-%COMP%]{margin-left:var(--gridVideosMiniatureMargins)!important}}@supports (margin-inline-end: var(--gridVideosMiniatureMargins) !important){.margin-content[_ngcontent-%COMP%]{margin-inline-end:var(--gridVideosMiniatureMargins)!important}}@supports not (margin-inline-end: var(--gridVideosMiniatureMargins) !important){.margin-content[_ngcontent-%COMP%]{margin-right:var(--gridVideosMiniatureMargins)!important}}@media screen and (max-width: 500px){.margin-content[_ngcontent-%COMP%]{--gridVideosMiniatureMargins: 0;width:auto}}@media screen and (min-width: 500px){.margin-content[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]{--miniatureMinWidth: 255px;--miniatureMaxWidth: 280px;display:grid;grid-column-gap:30px;column-gap:30px;grid-template-columns:repeat(auto-fill,minmax(var(--miniatureMinWidth),1fr))}.margin-content[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%]   .video-wrapper[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%]   .playlist-wrapper[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]   .video-wrapper[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]   .playlist-wrapper[_ngcontent-%COMP%]{margin:0 auto;width:100%}.margin-content[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%]   .video-wrapper[_ngcontent-%COMP%]   my-video-miniature[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%]   .video-wrapper[_ngcontent-%COMP%]   my-video-playlist-miniature[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%]   .playlist-wrapper[_ngcontent-%COMP%]   my-video-miniature[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%]   .playlist-wrapper[_ngcontent-%COMP%]   my-video-playlist-miniature[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]   .video-wrapper[_ngcontent-%COMP%]   my-video-miniature[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]   .video-wrapper[_ngcontent-%COMP%]   my-video-playlist-miniature[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]   .playlist-wrapper[_ngcontent-%COMP%]   my-video-miniature[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]   .playlist-wrapper[_ngcontent-%COMP%]   my-video-playlist-miniature[_ngcontent-%COMP%]{display:block;min-width:var(--miniatureMinWidth);max-width:var(--miniatureMaxWidth)}}@media screen and (min-width: 500px) and (min-width: breakpoint(xm)){.margin-content[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]{grid-column-gap:15px;column-gap:15px}}@media screen and (min-width: 500px) and (min-width: breakpoint(fhd)){.margin-content[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]{grid-column-gap:2%;column-gap:2%}}@media screen and (max-width: 500px){.title-page[_ngcontent-%COMP%]{display:block;text-align:center}.playlists[_ngcontent-%COMP%]{justify-content:left}@supports (margin-inline-start: var(--horizontalMarginContent) !important){.playlists[_ngcontent-%COMP%]{margin-inline-start:var(--horizontalMarginContent)!important}}@supports not (margin-inline-start: var(--horizontalMarginContent) !important){.playlists[_ngcontent-%COMP%]{margin-left:var(--horizontalMarginContent)!important}}@supports (margin-inline-end: var(--horizontalMarginContent) !important){.playlists[_ngcontent-%COMP%]{margin-inline-end:var(--horizontalMarginContent)!important}}@supports not (margin-inline-end: var(--horizontalMarginContent) !important){.playlists[_ngcontent-%COMP%]{margin-right:var(--horizontalMarginContent)!important}}}"]}),e})();var Z=_(24898),H=_(75585);function k(e,o){if(1&e&&n._UZ(0,"my-videos-list",1),2&e){const t=n.oxw();n.Q6J("title",t.title)("displayTitle",!1)("getVideosObservableFunction",t.getVideosObservableFunction)("getSyndicationItemsFunction",t.getSyndicationItemsFunction)("defaultSort",t.defaultSort)("displayFilters",!0)("displayModerationBlock",!0)("displayOptions",t.displayOptions)("displayAsRow",t.displayAsRow())("hideScopeFilter",!0)("loadUserVideoPreferences",!0)("disabled",t.disabled)}}let $=(()=>{class e{constructor(t,i,a){this.screenService=t,this.videoChannelService=i,this.videoService=a,this.getVideosObservableFunction=this.getVideosObservable.bind(this),this.getSyndicationItemsFunction=this.getSyndicationItems.bind(this),this.title="Videos",this.defaultSort="-publishedAt",this.displayOptions={date:!0,views:!0,by:!1,avatar:!1,privacyLabel:!0,privacyText:!1,state:!1,blacklistInfo:!1},this.disabled=!1}ngOnInit(){this.videoChannelService.videoChannelLoaded.pipe((0,Z.P)()).subscribe(t=>{this.videoChannel=t})}ngOnDestroy(){this.videoChannelSub&&this.videoChannelSub.unsubscribe()}getVideosObservable(t,i){const a=Object.assign(Object.assign({},i.toVideosAPIObject()),{videoPagination:t,videoChannel:this.videoChannel,skipCount:!0});return this.videoService.getVideoChannelVideos(a)}getSyndicationItems(){return this.videoService.getVideoChannelFeedUrls(this.videoChannel.id)}displayAsRow(){return this.screenService.isInMobileView()}disableForReuse(){this.disabled=!0}enabledForReuse(){this.disabled=!1}}return e.\u0275fac=function(t){return new(t||e)(n.Y36(l.H2),n.Y36(d.B1),n.Y36(d.kI))},e.\u0275cmp=n.Xpm({type:e,selectors:[["my-video-channel-videos"]],decls:1,vars:1,consts:[[3,"title","displayTitle","getVideosObservableFunction","getSyndicationItemsFunction","defaultSort","displayFilters","displayModerationBlock","displayOptions","displayAsRow","hideScopeFilter","loadUserVideoPreferences","disabled",4,"ngIf"],[3,"title","displayTitle","getVideosObservableFunction","getSyndicationItemsFunction","defaultSort","displayFilters","displayModerationBlock","displayOptions","displayAsRow","hideScopeFilter","loadUserVideoPreferences","disabled"]],template:function(t,i){1&t&&n.YNc(0,k,1,12,"my-videos-list",0),2&t&&n.Q6J("ngIf",i.videoChannel)},directives:[c.O5,H.d],encapsulation:2}),e})();var U=_(61855),v=_(7365),F=_(29230),Y=_(34920),B=_(72754),z=_(97142),S=_(359),G=_(11132),Q=_(86552),J=_(26368),K=_(52223),X=_(51214),q=_(19895);const j=["subscribeButton"],W=["supportModal"];function nn(e,o){if(1&e&&(n.TgZ(0,"div",32),n._UZ(1,"img",33),n.qZA()),2&e){const t=n.oxw(2);n.xp6(1),n.Q6J("src",t.videoChannel.bannerUrl,n.LSH)}}const tn=function(e){return["/my-library/video-channels/update",e]};function en(e,o){if(1&e&&(n.TgZ(0,"a",37),n.SDv(1,38),n.qZA()),2&e){const t=n.oxw(3);n.Q6J("routerLink",n.VKq(1,tn,t.videoChannel.nameWithHost))}}const on=function(e){return[e]};function _n(e,o){if(1&e&&n._UZ(0,"my-subscribe-button",39,40),2&e){const t=n.oxw(3);n.Q6J("videoChannels",n.VKq(1,on,t.videoChannel))}}function an(e,o){if(1&e){const t=n.EpF();n.TgZ(0,"button",41),n.NdJ("click",function(){return n.CHM(t),n.oxw(3).showSupportModal()}),n._UZ(1,"my-global-icon",42),n.TgZ(2,"span",43),n.SDv(3,44),n.qZA(),n.qZA()}}function rn(e,o){if(1&e&&(n.YNc(0,en,2,3,"a",34),n.YNc(1,_n,2,3,"my-subscribe-button",35),n.YNc(2,an,4,0,"button",36)),2&e){const t=n.oxw(2);n.Q6J("ngIf",t.isManageable()),n.xp6(1),n.Q6J("ngIf",!t.isManageable()),n.xp6(1),n.Q6J("ngIf",t.videoChannel.support)}}function sn(e,o){if(1&e&&(n.TgZ(0,"div",45),n.TgZ(1,"div",10),n.SDv(2,46),n.qZA(),n.TgZ(3,"div",47),n._UZ(4,"my-actor-avatar",48),n.TgZ(5,"div",12),n.TgZ(6,"h4"),n.TgZ(7,"a",49),n._uU(8),n.qZA(),n.qZA(),n.TgZ(9,"div",15),n._uU(10),n.qZA(),n.qZA(),n.qZA(),n.TgZ(11,"div",50),n._UZ(12,"div",24),n.qZA(),n.TgZ(13,"a",51),n.SDv(14,52),n.qZA(),n.TgZ(15,"a",53),n.SDv(16,54),n.qZA(),n.qZA()),2&e){const t=n.oxw(2);n.xp6(4),n.Q6J("account",t.videoChannel.ownerAccount)("internalHref",t.getAccountUrl()),n.xp6(3),n.Q6J("routerLink",t.getAccountUrl()),n.xp6(1),n.Oqu(t.videoChannel.ownerAccount.displayName),n.xp6(2),n.hij("@",t.videoChannel.ownerBy,""),n.xp6(2),n.Q6J("innerHTML",t.ownerDescriptionHTML,n.oJD),n.xp6(1),n.Q6J("routerLink",t.getAccountUrl()),n.xp6(2),n.Q6J("routerLink",t.getAccountUrl())}}function ln(e,o){if(1&e&&(n.TgZ(0,"span",55),n.SDv(1,56),n.qZA()),2&e){const t=n.oxw(2);n.xp6(1),n.pQV(t.channelVideosCount)(t.channelVideosCount),n.QtT(1)}}function cn(e,o){}function dn(e,o){1&e&&n.YNc(0,cn,0,0,"ng-template")}function gn(e,o){if(1&e){const t=n.EpF();n.TgZ(0,"div",57),n.NdJ("click",function(){n.CHM(t);const a=n.oxw(2);return a.channelDescriptionExpanded=!a.channelDescriptionExpanded}),n.SDv(1,58),n.qZA()}}function pn(e,o){}function Cn(e,o){1&e&&n.YNc(0,pn,0,0,"ng-template")}function un(e,o){}function mn(e,o){1&e&&n.YNc(0,un,0,0,"ng-template")}function hn(e,o){}function On(e,o){1&e&&n.YNc(0,hn,0,0,"ng-template")}function Mn(e,o){if(1&e&&(n.TgZ(0,"a",59),n._uU(1),n.qZA()),2&e){const t=o.item;n.Q6J("routerLink",t.routerLink),n.xp6(1),n.Oqu(t.label)}}const En=function(e){return{expanded:e}};function vn(e,o){if(1&e){const t=n.EpF();n.TgZ(0,"div",3),n.YNc(1,nn,2,1,"div",4),n.TgZ(2,"div",5),n.YNc(3,rn,3,3,"ng-template",null,6,n.W1O),n.YNc(5,sn,17,8,"ng-template",null,7,n.W1O),n.TgZ(7,"div",8),n._UZ(8,"my-actor-avatar",9),n.TgZ(9,"div"),n.TgZ(10,"div",10),n.SDv(11,11),n.qZA(),n.TgZ(12,"div",12),n.TgZ(13,"div"),n.TgZ(14,"div",13),n.TgZ(15,"h1",14),n.ALo(16,"date"),n._uU(17),n.qZA(),n.qZA(),n.TgZ(18,"div",15),n.TgZ(19,"span"),n._uU(20),n.qZA(),n.TgZ(21,"button",16),n.NdJ("click",function(){return n.CHM(t),n.oxw().activateCopiedMessage()}),n._UZ(22,"span",17),n.qZA(),n.qZA(),n.TgZ(23,"div",18),n.TgZ(24,"span"),n.SDv(25,19),n.qZA(),n.YNc(26,ln,2,2,"span",20),n.qZA(),n.qZA(),n.TgZ(27,"div",21),n.YNc(28,dn,1,0,void 0,22),n.qZA(),n.qZA(),n.qZA(),n.qZA(),n.TgZ(29,"div",23),n._UZ(30,"div",24),n.qZA(),n.YNc(31,gn,2,0,"div",25),n.TgZ(32,"div",26),n.YNc(33,Cn,1,0,void 0,22),n.qZA(),n.TgZ(34,"div",27),n.YNc(35,mn,1,0,void 0,22),n.qZA(),n.qZA(),n.TgZ(36,"div",28),n.YNc(37,On,1,0,void 0,22),n.qZA(),n.TgZ(38,"div",29),n.YNc(39,Mn,2,2,"ng-template",null,30,n.W1O),n._UZ(41,"my-list-overflow",31),n.qZA(),n._UZ(42,"router-outlet"),n.qZA()}if(2&e){const t=n.MAs(4),i=n.MAs(6),a=n.MAs(40),r=n.oxw();n.xp6(1),n.Q6J("ngIf",r.videoChannel.bannerUrl),n.xp6(7),n.Q6J("channel",r.videoChannel),n.xp6(7),n.Q6J("title","Channel created on "+n.lcZ(16,18,r.videoChannel.createdAt)),n.xp6(2),n.Oqu(r.videoChannel.displayName),n.xp6(3),n.hij("@",r.videoChannel.nameWithHost,""),n.xp6(1),n.Q6J("cdkCopyToClipboard",r.videoChannel.nameWithHostForced),n.xp6(4),n.pQV(r.videoChannel.followersCount)(r.videoChannel.followersCount),n.QtT(25),n.xp6(1),n.Q6J("ngIf",void 0!==r.channelVideosCount),n.xp6(2),n.Q6J("ngTemplateOutlet",t),n.xp6(1),n.Q6J("ngClass",n.VKq(20,En,r.channelDescriptionExpanded)),n.xp6(1),n.Q6J("innerHTML",r.channelDescriptionHTML,n.oJD),n.xp6(1),n.Q6J("ngIf",r.hasShowMoreDescription()),n.xp6(2),n.Q6J("ngTemplateOutlet",t),n.xp6(2),n.Q6J("ngTemplateOutlet",i),n.xp6(2),n.Q6J("ngTemplateOutlet",i),n.xp6(4),n.Q6J("items",r.links)("itemTemplate",a)}}const Sn=[{path:":videoChannelName",component:(()=>{class e{constructor(t,i,a,r,p,C,u,m,h){this.route=t,this.notifier=i,this.authService=a,this.videoChannelService=r,this.videoService=p,this.restExtractor=C,this.hotkeysService=u,this.screenService=m,this.markdown=h,this.links=[],this.isChannelManageable=!1,this.ownerDescriptionHTML="",this.channelDescriptionHTML="",this.channelDescriptionExpanded=!1}ngOnInit(){this.routeSub=this.route.params.pipe((0,F.U)(t=>t.videoChannelName),(0,Y.x)(),(0,B.w)(t=>this.videoChannelService.getVideoChannel(t)),(0,z.K)(t=>this.restExtractor.redirectTo404IfNotFound(t,"other",[S.WE.BAD_REQUEST_400,S.WE.NOT_FOUND_404]))).subscribe(t=>(0,U.mG)(this,void 0,void 0,function*(){this.channelDescriptionHTML=yield this.markdown.textMarkdownToHTML(t.description),this.ownerDescriptionHTML=yield this.markdown.textMarkdownToHTML(t.ownerAccount.description),this.videoChannel=t,this.loadChannelVideosCount()})),this.hotkeys=[new v.qm("S",t=>(this.subscribeButton.subscribed?this.subscribeButton.unsubscribe():this.subscribeButton.subscribe(),!1),void 0,"Subscribe to the account")],this.isUserLoggedIn()&&this.hotkeysService.add(this.hotkeys),this.links=[{label:"VIDEOS",routerLink:"videos"},{label:"PLAYLISTS",routerLink:"video-playlists"}]}ngOnDestroy(){this.routeSub&&this.routeSub.unsubscribe(),this.isUserLoggedIn()&&this.hotkeysService.remove(this.hotkeys)}isInSmallView(){return this.screenService.isInSmallView()}isUserLoggedIn(){return this.authService.isLoggedIn()}isManageable(){var t;return!!this.isUserLoggedIn()&&(null===(t=this.videoChannel)||void 0===t?void 0:t.ownerAccount.userId)===this.authService.getUser().id}activateCopiedMessage(){this.notifier.success("Username copied")}hasShowMoreDescription(){return!this.channelDescriptionExpanded&&this.channelDescriptionHTML.length>100}showSupportModal(){this.supportModal.show()}getAccountUrl(){return["/a",this.videoChannel.ownerBy]}loadChannelVideosCount(){this.videoService.getVideoChannelVideos({videoChannel:this.videoChannel,videoPagination:{currentPage:1,itemsPerPage:0},sort:"-publishedAt"}).subscribe(t=>this.channelVideosCount=t.total)}}return e.\u0275fac=function(t){return new(t||e)(n.Y36(g.gz),n.Y36(l.d4),n.Y36(l.e8),n.Y36(d.B1),n.Y36(d.kI),n.Y36(l.DI),n.Y36(v.tm),n.Y36(l.H2),n.Y36(l.Zy))},e.\u0275cmp=n.Xpm({type:e,selectors:[["ng-component"]],viewQuery:function(t,i){if(1&t&&(n.Gf(j,5),n.Gf(W,5)),2&t){let a;n.iGM(a=n.CRH())&&(i.subscribeButton=a.first),n.iGM(a=n.CRH())&&(i.supportModal=a.first)}},decls:3,vars:2,consts:function(){let o,t,i,a,r,p,C,u,m,h,O,P,N;return o="VIDEO CHANNEL",t="Copy channel handle",i="{VAR_PLURAL, plural, =1 {1 subscriber} other {{INTERPOLATION} subscribers}}",i=n.Zx4(i,{VAR_PLURAL:"\ufffd0\ufffd",INTERPOLATION:"\ufffd1\ufffd"}),a="Show the complete description",r=" Manage channel ",p="Support",C="OWNER ACCOUNT",u="View account",m=" View account ",h=" View owner account ",O="{VAR_PLURAL, plural, =1 {1 videos} other {{INTERPOLATION} videos}}",O=n.Zx4(O,{VAR_PLURAL:"\ufffd0\ufffd",INTERPOLATION:"\ufffd1\ufffd"}),P=" " + O + " ",N=" Show more... ",[["class","root",4,"ngIf"],[3,"videoChannel"],["supportModal",""],[1,"root"],["class","banner",4,"ngIf"],[1,"channel-info"],["buttonsTemplate",""],["ownerTemplate",""],[1,"channel-avatar-row"],[1,"main-avatar",3,"channel"],[1,"section-label"],o,[1,"actor-info"],[1,"actor-display-name"],[3,"title"],[1,"actor-handle"],["title",t,1,"btn","btn-outline-secondary","btn-sm","copy-button",3,"cdkCopyToClipboard","click"],[1,"glyphicon","glyphicon-duplicate"],[1,"actor-counters"],i,["class","videos-count",4,"ngIf"],[1,"channel-buttons","right"],[4,"ngTemplateOutlet"],[1,"channel-description",3,"ngClass"],[1,"description-html",3,"innerHTML"],["class","show-more","role","button","title",a,3,"click",4,"ngIf"],[1,"channel-buttons","bottom"],[1,"owner-card"],[1,"bottom-owner"],[1,"links"],["linkTemplate",""],[3,"items","itemTemplate"],[1,"banner"],["alt","Channel banner",3,"src"],["class","peertube-button-link orange-button",3,"routerLink",4,"ngIf"],[3,"videoChannels",4,"ngIf"],["class","support-button peertube-button orange-button-inverted",3,"click",4,"ngIf"],[1,"peertube-button-link","orange-button",3,"routerLink"],r,[3,"videoChannels"],["subscribeButton",""],[1,"support-button","peertube-button","orange-button-inverted",3,"click"],["iconName","support","aria-hidden","true"],[1,"icon-text"],p,[1,"owner-block"],C,[1,"avatar-row"],[1,"account-avatar",3,"account","internalHref"],["title",u,3,"routerLink"],[1,"owner-description"],[1,"view-account","short",3,"routerLink"],m,[1,"view-account","complete",3,"routerLink"],h,[1,"videos-count"],P,["role","button","title",a,1,"show-more",3,"click"],N,["routerLinkActive","active",1,"title-page",3,"routerLink"]]},template:function(t,i){1&t&&(n.YNc(0,vn,43,22,"div",0),n._UZ(1,"my-support-modal",1,2)),2&t&&(n.Q6J("ngIf",i.videoChannel),n.xp6(1),n.Q6J("videoChannel",i.videoChannel))},directives:[c.O5,G.N,Q.b,J.i3,c.tP,c.mk,K.d,g.lC,g.yS,X.h,q.$,g.Od],pipes:[c.uU],styles:['@charset "UTF-8";.root[_ngcontent-%COMP%]{--myGlobalTopPadding: 60px;--myChannelImgMargin: 30px;--myFontSize: 16px;--myGreyChannelFontSize: 16px;--myGreyOwnerFontSize: 14px}.banner[_ngcontent-%COMP%]{position:relative;height:0;width:100%;padding-top:16.66666666%}.banner[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{position:absolute;width:100%;height:100%;top:0}.section-label[_ngcontent-%COMP%]{color:var(--mainColor);font-size:12px;margin-bottom:15px;font-weight:700;letter-spacing:2.5px}@media screen and (max-width: 500px){.section-label[_ngcontent-%COMP%]{font-size:10px;letter-spacing:2.1px;margin-bottom:5px}}.links[_ngcontent-%COMP%]{--gridVideosMiniatureMargins: var(--videosHorizontalMarginContent)}@supports (margin-inline-start: var(--gridVideosMiniatureMargins) !important){.links[_ngcontent-%COMP%]{margin-inline-start:var(--gridVideosMiniatureMargins)!important}}@supports not (margin-inline-start: var(--gridVideosMiniatureMargins) !important){.links[_ngcontent-%COMP%]{margin-left:var(--gridVideosMiniatureMargins)!important}}@supports (margin-inline-end: var(--gridVideosMiniatureMargins) !important){.links[_ngcontent-%COMP%]{margin-inline-end:var(--gridVideosMiniatureMargins)!important}}@supports not (margin-inline-end: var(--gridVideosMiniatureMargins) !important){.links[_ngcontent-%COMP%]{margin-right:var(--gridVideosMiniatureMargins)!important}}@media screen and (max-width: 500px){.links[_ngcontent-%COMP%]{--gridVideosMiniatureMargins: 0;width:auto}}.actor-info[_ngcontent-%COMP%]{min-width:1px;width:100%}.actor-info[_ngcontent-%COMP%] > h4[_ngcontent-%COMP%], .actor-info[_ngcontent-%COMP%] > .actor-handle[_ngcontent-%COMP%]{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.channel-info[_ngcontent-%COMP%]{--gridVideosMiniatureMargins: var(--videosHorizontalMarginContent);display:grid;grid-template-columns:1fr auto;grid-template-rows:auto auto;background-color:var(--channelBackgroundColor);margin-bottom:45px;padding-top:var(--myGlobalTopPadding);font-size:var(--myFontSize)}@supports (padding-inline-start: var(--gridVideosMiniatureMargins) !important){.channel-info[_ngcontent-%COMP%]{padding-inline-start:var(--gridVideosMiniatureMargins)!important}}@supports not (padding-inline-start: var(--gridVideosMiniatureMargins) !important){.channel-info[_ngcontent-%COMP%]{padding-left:var(--gridVideosMiniatureMargins)!important}}@supports (padding-inline-end: var(--gridVideosMiniatureMargins) !important){.channel-info[_ngcontent-%COMP%]{padding-inline-end:var(--gridVideosMiniatureMargins)!important}}@supports not (padding-inline-end: var(--gridVideosMiniatureMargins) !important){.channel-info[_ngcontent-%COMP%]{padding-right:var(--gridVideosMiniatureMargins)!important}}@media screen and (max-width: 500px){.channel-info[_ngcontent-%COMP%]{--gridVideosMiniatureMargins: 15px;width:auto}}.channel-avatar-row[_ngcontent-%COMP%]{display:flex;grid-column:1;margin-bottom:30px}.channel-avatar-row[_ngcontent-%COMP%]   .main-avatar[_ngcontent-%COMP%]{display:inline-block;width:120px;height:120px;min-width:120px;min-height:120px}.channel-avatar-row[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]{min-width:1px}@supports (margin-inline-start: var(--myChannelImgMargin)){.channel-avatar-row[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]{margin-inline-start:var(--myChannelImgMargin)}}@supports not (margin-inline-start: var(--myChannelImgMargin)){.channel-avatar-row[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]{margin-left:var(--myChannelImgMargin)}}.channel-avatar-row[_ngcontent-%COMP%]   .actor-info[_ngcontent-%COMP%]{display:flex}.channel-avatar-row[_ngcontent-%COMP%]   .actor-info[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]:first-child{flex-grow:1;min-width:1px}.channel-avatar-row[_ngcontent-%COMP%]   .actor-display-name[_ngcontent-%COMP%]{word-break:break-word;word-wrap:break-word;overflow-wrap:break-word;-webkit-hyphens:auto;hyphens:auto;display:flex;flex-wrap:wrap}.channel-avatar-row[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%]{font-size:28px;font-weight:700;margin:0}.channel-avatar-row[_ngcontent-%COMP%]   .actor-handle[_ngcontent-%COMP%]{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.channel-avatar-row[_ngcontent-%COMP%]   .actor-handle[_ngcontent-%COMP%], .channel-avatar-row[_ngcontent-%COMP%]   .actor-counters[_ngcontent-%COMP%]{color:var(--greyForegroundColor);font-size:var(--myGreyChannelFontSize)}.channel-avatar-row[_ngcontent-%COMP%]   .actor-counters[_ngcontent-%COMP%] > *[_ngcontent-%COMP%]:not(:last-child):after{content:"\\2022";margin:0 10px;color:var(--mainColor)}@media screen and (max-width: 500px){.channel-avatar-row[_ngcontent-%COMP%]{margin-bottom:15px}.channel-avatar-row[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%]{font-size:22px}.channel-avatar-row[_ngcontent-%COMP%]   .main-avatar[_ngcontent-%COMP%]{display:inline-block;width:80px;height:80px;min-width:80px;min-height:80px}}.support-button[_ngcontent-%COMP%]{display:inline-flex;align-items:center;line-height:normal!important}.support-button[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]{position:relative;width:21px;top:-1px}@supports (margin-inline-end: 0){.support-button[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]{margin-inline-end:0}}@supports not (margin-inline-end: 0){.support-button[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]{margin-right:0}}.channel-description[_ngcontent-%COMP%]{grid-column:1;word-break:break-word;padding-bottom:var(--myGlobalTopPadding)}.show-more[_ngcontent-%COMP%]{color:var(--mainColor);cursor:pointer;margin:10px auto 45px;display:none}.channel-buttons[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap}@supports (margin-inline-end: 15px){.channel-buttons[_ngcontent-%COMP%] > *[_ngcontent-%COMP%]:not(:last-child){margin-inline-end:15px}}@supports not (margin-inline-end: 15px){.channel-buttons[_ngcontent-%COMP%] > *[_ngcontent-%COMP%]:not(:last-child){margin-right:15px}}@supports (margin-inline-start: 45px){.channel-buttons.right[_ngcontent-%COMP%]{margin-inline-start:45px}}@supports not (margin-inline-start: 45px){.channel-buttons.right[_ngcontent-%COMP%]{margin-left:45px}}.channel-buttons.bottom[_ngcontent-%COMP%]{display:none}.owner-card[_ngcontent-%COMP%]{grid-column:2;grid-row:1/3;place-self:end}@supports (margin-inline-start: 105px){.owner-card[_ngcontent-%COMP%]{margin-inline-start:105px}}@supports not (margin-inline-start: 105px){.owner-card[_ngcontent-%COMP%]{margin-left:105px}}.bottom-owner[_ngcontent-%COMP%]{display:none}.owner-block[_ngcontent-%COMP%]{background-color:var(--mainBackgroundColor);padding:30px;width:300px;font-size:var(--myFontSize)}.owner-block[_ngcontent-%COMP%]   .avatar-row[_ngcontent-%COMP%]{display:flex;margin-bottom:15px}.owner-block[_ngcontent-%COMP%]   .avatar-row[_ngcontent-%COMP%]   .account-avatar[_ngcontent-%COMP%]{display:inline-block;width:48px;height:48px;min-width:48px;min-height:48px}@supports (margin-inline-start: 15px){.owner-block[_ngcontent-%COMP%]   .avatar-row[_ngcontent-%COMP%]   .actor-info[_ngcontent-%COMP%]{margin-inline-start:15px}}@supports not (margin-inline-start: 15px){.owner-block[_ngcontent-%COMP%]   .avatar-row[_ngcontent-%COMP%]   .actor-info[_ngcontent-%COMP%]{margin-left:15px}}.owner-block[_ngcontent-%COMP%]   .avatar-row[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%]{font-size:18px;margin:0}.owner-block[_ngcontent-%COMP%]   .avatar-row[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{color:var(--mainForegroundColor)}.owner-block[_ngcontent-%COMP%]   .avatar-row[_ngcontent-%COMP%]   .actor-handle[_ngcontent-%COMP%]{font-size:var(--myGreyOwnerFontSize);color:var(--greyForegroundColor)}.owner-block[_ngcontent-%COMP%]   .owner-description[_ngcontent-%COMP%]{position:relative;overflow:hidden;max-height:140px;word-break:break-word}.owner-block[_ngcontent-%COMP%]   .owner-description[_ngcontent-%COMP%]:after{content:"";pointer-events:none;width:100%;height:100%;position:absolute;left:0;top:0;background:linear-gradient(transparent 120px,var(--mainBackgroundColor))}.view-account.short[_ngcontent-%COMP%]{padding-top:0;padding-bottom:0;border:0;font-size:15px;height:30px;line-height:30px;border-radius:3px!important;text-align:center;cursor:pointer;display:inline-block;border:2px solid var(--mainColor);font-weight:600;margin-top:30px}.view-account.short[_ngcontent-%COMP%]:hover, .view-account.short[_ngcontent-%COMP%]:focus, .view-account.short[_ngcontent-%COMP%]:active{text-decoration:none!important;outline:none!important}@supports (padding-inline-start: 13px){.view-account.short[_ngcontent-%COMP%]{padding-inline-start:13px}}@supports not (padding-inline-start: 13px){.view-account.short[_ngcontent-%COMP%]{padding-left:13px}}@supports (padding-inline-end: 17px){.view-account.short[_ngcontent-%COMP%]{padding-inline-end:17px}}@supports not (padding-inline-end: 17px){.view-account.short[_ngcontent-%COMP%]{padding-right:17px}}.view-account.short[_ngcontent-%COMP%]:focus, .view-account.short.focus-visible[_ngcontent-%COMP%]{box-shadow:0 0 0 .2rem var(--mainColorLightest)}.view-account.short[_ngcontent-%COMP%], .view-account.short[_ngcontent-%COMP%]:active, .view-account.short[_ngcontent-%COMP%]:focus{color:var(--mainColor);background-color:var(--mainBackgroundColor)}.view-account.short[_ngcontent-%COMP%]:hover{color:var(--mainColor);background-color:var(--mainColorLightest)}.view-account.short[disabled][_ngcontent-%COMP%], .view-account.short.disabled[_ngcontent-%COMP%]{cursor:default;color:var(--mainColor);background-color:#c6c6c6}.view-account.short[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .feather, .view-account.short[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .material, .view-account.short[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .misc{color:var(--mainColor)}.view-account.complete[_ngcontent-%COMP%]{display:none}.copy-button[_ngcontent-%COMP%]{border:0}@media screen and (max-width: 1400px){.channel-avatar-row[_ngcontent-%COMP%]{grid-column:1/3}.owner-card[_ngcontent-%COMP%]{grid-row:2}@supports (margin-inline-start: 60px){.owner-card[_ngcontent-%COMP%]{margin-inline-start:60px}}@supports not (margin-inline-start: 60px){.owner-card[_ngcontent-%COMP%]{margin-left:60px}}}@media screen and (max-width: 1100px){.root[_ngcontent-%COMP%]{--myGlobalTopPadding: 45px;--myChannelImgMargin: 15px}.channel-info[_ngcontent-%COMP%]{display:flex;flex-direction:column;margin-bottom:0}.channel-description[_ngcontent-%COMP%]:not(.expanded){position:relative;overflow:hidden;max-height:70px}.channel-description[_ngcontent-%COMP%]:not(.expanded):after{content:"";pointer-events:none;width:100%;height:100%;position:absolute;left:0;top:0;background:linear-gradient(transparent 30px,var(--channelBackgroundColor))}.show-more[_ngcontent-%COMP%]{display:inline-block}.channel-buttons.bottom[_ngcontent-%COMP%]{display:flex;justify-content:center;margin-bottom:30px}.channel-buttons.right[_ngcontent-%COMP%]{display:none}.owner-card[_ngcontent-%COMP%]{display:none}.bottom-owner[_ngcontent-%COMP%]{display:block;width:100%;border-bottom:2px solid rgba(0,0,0,.1);padding:var(--myGlobalTopPadding) 45px;margin-bottom:60px}.owner-block[_ngcontent-%COMP%]{display:grid;width:100%;padding:0}.owner-block[_ngcontent-%COMP%]   .avatar-row[_ngcontent-%COMP%]{grid-column:1}@supports (margin-inline-end: 30px){.owner-block[_ngcontent-%COMP%]   .avatar-row[_ngcontent-%COMP%]{margin-inline-end:30px}}@supports not (margin-inline-end: 30px){.owner-block[_ngcontent-%COMP%]   .avatar-row[_ngcontent-%COMP%]{margin-right:30px}}.owner-block[_ngcontent-%COMP%]   .owner-description[_ngcontent-%COMP%]{position:relative;overflow:hidden;grid-column:2;max-height:70px}.owner-block[_ngcontent-%COMP%]   .owner-description[_ngcontent-%COMP%]:after{content:"";pointer-events:none;width:100%;height:100%;position:absolute;left:0;top:0;background:linear-gradient(transparent 30px,var(--mainBackgroundColor))}.owner-block[_ngcontent-%COMP%]   .view-account[_ngcontent-%COMP%]{grid-column:2}.view-account.complete[_ngcontent-%COMP%]{display:block;text-align:end;margin-top:10px;color:var(--mainColor)}.view-account.short[_ngcontent-%COMP%]{display:none}}@media screen and (max-width: 500px){.root[_ngcontent-%COMP%]{--myGlobalTopPadding: 15px;--myFontSize: 14px;--myGreyChannelFontSize: 13px;--myGreyOwnerFontSize: 13px}.links[_ngcontent-%COMP%]{margin:auto!important;width:-webkit-min-content;width:min-content}.show-more[_ngcontent-%COMP%]{margin-bottom:30px}.bottom-owner[_ngcontent-%COMP%]{padding:15px;margin-bottom:30px}.bottom-owner[_ngcontent-%COMP%]   .section-label[_ngcontent-%COMP%]{display:none}.owner-block[_ngcontent-%COMP%]{display:block}.owner-block[_ngcontent-%COMP%]   .avatar-row[_ngcontent-%COMP%]{display:flex;flex-direction:row-reverse;margin:0}.owner-block[_ngcontent-%COMP%]   .avatar-row[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%]{font-size:16px}.owner-block[_ngcontent-%COMP%]   .avatar-row[_ngcontent-%COMP%]   .actor-info[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:flex-end;justify-content:flex-end;margin-top:-5px}.owner-block[_ngcontent-%COMP%]   .avatar-row[_ngcontent-%COMP%]   .account-avatar[_ngcontent-%COMP%]{display:inline-block;width:64px;height:64px;min-width:64px;min-height:64px;margin:-30px 0 0 15px}.owner-block[_ngcontent-%COMP%]   .owner-description[_ngcontent-%COMP%]{display:none}}']}),e})(),children:[{path:"",redirectTo:"videos",pathMatch:"full"},{path:"videos",component:$,data:{meta:{title:"Video channel videos"},reuse:{enabled:!0,key:"video-channel-videos-list"}}},{path:"video-playlists",component:D,data:{meta:{title:"Video channel playlists"}}}]}];let Pn=(()=>{class e{}return e.\u0275fac=function(t){return new(t||e)},e.\u0275mod=n.oAB({type:e}),e.\u0275inj=n.cJS({imports:[[g.Bz.forChild(Sn)],g.Bz]}),e})();var Nn=_(63192);let An=(()=>{class e{}return e.\u0275fac=function(t){return new(t||e)},e.\u0275mod=n.oAB({type:e}),e.\u0275inj=n.cJS({providers:[],imports:[[Pn,d.nC,A.hA,E.xq,x.F5,f.yC,T.Y,V.a,Nn.v]]}),e})()}}]);