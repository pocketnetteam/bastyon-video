"use strict";(self.webpackChunkpeertube_client=self.webpackChunkpeertube_client||[]).push([[402],{84402:(Pn,T,a)=>{a.r(T),a.d(T,{AccountsModule:()=>vn});var I=a(84167),L=a(97694),l=a(62026),D=a(48600),x=a(33957),b=a(15586),U=a(63192),u=a(49393),M=a(61855),y=a(64033),w=a(70612),m=a(17310),h=a(72754),$=a(68499),v=a(29230),d=a(54755),n=a(42741),E=a(16274),Z=a(66717),P=a(86552),R=a(51214),F=a(69469);function Y(o,_){1&o&&(n.TgZ(0,"div",6),n.SDv(1,7),n.qZA())}function H(o,_){if(1&o&&(n.TgZ(0,"span",23),n.SDv(1,24),n.qZA()),2&o){const t=n.oxw().$implicit,e=n.oxw();n.xp6(1),n.pQV(e.getTotalVideosOf(t))(e.getTotalVideosOf(t)),n.QtT(1)}}function B(o,_){1&o&&(n.TgZ(0,"div",6),n.SDv(1,25),n.qZA())}function k(o,_){if(1&o&&n._UZ(0,"my-video-miniature",26),2&o){const t=_.$implicit,e=n.oxw(2);n.Q6J("video",t)("user",e.userMiniature)("displayVideoActions",!0)("displayOptions",e.miniatureDisplayOptions)}}function z(o,_){if(1&o&&(n.TgZ(0,"div",27),n.TgZ(1,"a",28),n.SDv(2,29),n.qZA(),n.qZA()),2&o){const t=n.oxw().$implicit,e=n.oxw();n.xp6(1),n.Q6J("routerLink",e.getVideoChannelLink(t))}}const G=function(o){return[o]};function K(o,_){if(1&o&&(n.TgZ(0,"div",8),n.TgZ(1,"div",9),n._UZ(2,"my-actor-avatar",10),n.TgZ(3,"h2"),n.TgZ(4,"a",11),n._uU(5),n.qZA(),n.qZA(),n.TgZ(6,"div",12),n.TgZ(7,"div",13),n.SDv(8,14),n.qZA(),n.YNc(9,H,2,2,"span",15),n.qZA(),n._UZ(10,"div",16),n.qZA(),n._UZ(11,"my-subscribe-button",17),n.TgZ(12,"a",18),n.SDv(13,19),n.qZA(),n.TgZ(14,"div",20),n.YNc(15,B,2,0,"div",3),n.YNc(16,k,1,4,"my-video-miniature",21),n.YNc(17,z,3,1,"div",22),n.qZA(),n.qZA()),2&o){const t=_.$implicit,e=n.oxw();n.xp6(2),n.Q6J("channel",t)("internalHref",e.getVideoChannelLink(t)),n.xp6(2),n.Q6J("routerLink",e.getVideoChannelLink(t)),n.xp6(1),n.hij(" ",t.displayName," "),n.xp6(3),n.pQV(t.followersCount)(t.followersCount),n.QtT(8),n.xp6(1),n.Q6J("ngIf",void 0!==e.getTotalVideosOf(t)),n.xp6(1),n.Q6J("innerHTML",e.getChannelDescription(t),n.oJD),n.xp6(1),n.Q6J("videoChannels",n.VKq(13,G,t)),n.xp6(1),n.Q6J("routerLink",e.getVideoChannelLink(t)),n.xp6(3),n.Q6J("ngIf",0===e.getTotalVideosOf(t)),n.xp6(1),n.Q6J("ngForOf",e.getVideosOf(t)),n.xp6(1),n.Q6J("ngIf",e.getTotalVideosOf(t))}}let Q=(()=>{class o{constructor(t,e,i,r,g){this.accountService=t,this.videoChannelService=e,this.videoService=i,this.markdown=r,this.userService=g,this.videoChannels=[],this.videos={},this.channelsDescriptionHTML={},this.channelPagination={currentPage:1,itemsPerPage:2,totalItems:null},this.videosPagination={currentPage:1,itemsPerPage:5,totalItems:null},this.videosSort="-publishedAt",this.onChannelDataSubject=new y.x,this.miniatureDisplayOptions={date:!0,views:!0,by:!1,avatar:!1,privacyLabel:!1,privacyText:!1,state:!1,blacklistInfo:!1}}ngOnInit(){this.accountSub=this.accountService.accountLoaded.subscribe(t=>{this.account=t,this.loadMoreChannels()}),this.userService.getAnonymousOrLoggedUser().subscribe(t=>{this.userMiniature=t,this.nsfwPolicy=t.nsfwPolicy})}ngOnDestroy(){this.accountSub&&this.accountSub.unsubscribe()}loadMoreChannels(){this.videoChannelService.listAccountVideoChannels({account:this.account,componentPagination:this.channelPagination,sort:"-updatedAt"}).pipe((0,m.b)(e=>{this.channelPagination.totalItems=e.total}),(0,h.w)(e=>(0,w.Dp)(e.data)),(0,$.b)(e=>this.videoService.getVideoChannelVideos({videoChannel:e,videoPagination:this.videosPagination,sort:this.videosSort,nsfwPolicy:this.nsfwPolicy}).pipe((0,v.U)(r=>({videoChannel:e,videos:r.data,total:r.total}))))).subscribe(({videoChannel:e,videos:i,total:r})=>(0,M.mG)(this,void 0,void 0,function*(){this.channelsDescriptionHTML[e.id]=yield this.markdown.textMarkdownToHTML(e.description),this.videoChannels.push(e),this.videos[e.id]={videos:i,total:r},this.onChannelDataSubject.next([e])}))}getVideosOf(t){const e=this.videos[t.id];return e?e.videos:[]}getTotalVideosOf(t){const e=this.videos[t.id];if(e)return e.total}getChannelDescription(t){return this.channelsDescriptionHTML[t.id]}onNearOfBottom(){!(0,d._T)(this.channelPagination)||(this.channelPagination.currentPage+=1,this.loadMoreChannels())}getVideoChannelLink(t){return["/c",t.nameWithHost]}}return o.\u0275fac=function(t){return new(t||o)(n.Y36(l.BR),n.Y36(l.B1),n.Y36(l.kI),n.Y36(d.Zy),n.Y36(d.KD))},o.\u0275cmp=n.Xpm({type:o,selectors:[["my-account-video-channels"]],decls:6,vars:3,consts:function(){let _,t,e,i,r,g,C,p,S,O;return _="Video channels",t="T\xE4ll\xE4 k\xE4ytt\xE4j\xE4ll\xE4 ei ole kanavia.",e="N\xE4yt\xE4 t\xE4m\xE4 videokanava",i="N\xE4yt\xE4 t\xE4m\xE4 videokanava",r="{VAR_PLURAL, plural, =1 {1 subscriber} other {{INTERPOLATION} subscribers}}",r=n.Zx4(r,{VAR_PLURAL:"\ufffd0\ufffd",INTERPOLATION:"\ufffd1\ufffd"}),g="Show this channel",C="{VAR_PLURAL, plural, =1 {1 videos} other {{INTERPOLATION} videos}}",C=n.Zx4(C,{VAR_PLURAL:"\ufffd0\ufffd",INTERPOLATION:"\ufffd1\ufffd"}),p=" " + C + " ",S="This channel doesn't have any videos.",O="SHOW THIS CHANNEL >",[[1,"sr-only"],_,[1,"margin-content"],["class","no-results",4,"ngIf"],["myInfiniteScroller","",1,"channels",3,"dataObservable","nearOfBottom"],["class","channel",4,"ngFor","ngForOf"],[1,"no-results"],t,[1,"channel"],[1,"channel-avatar-row"],["title",e,3,"channel","internalHref"],["title",i,3,"routerLink"],[1,"actor-counters"],[1,"followers"],r,["class","videos-count",4,"ngIf"],[1,"description-html",3,"innerHTML"],[3,"videoChannels"],[1,"button-show-channel","peertube-button-link","orange-button-inverted",3,"routerLink"],g,[1,"videos"],[3,"video","user","displayVideoActions","displayOptions",4,"ngFor","ngForOf"],["class","miniature-show-channel",4,"ngIf"],[1,"videos-count"],p,S,[3,"video","user","displayVideoActions","displayOptions"],[1,"miniature-show-channel"],[3,"routerLink"],O]},template:function(t,e){1&t&&(n.TgZ(0,"h1",0),n.SDv(1,1),n.qZA(),n.TgZ(2,"div",2),n.YNc(3,Y,2,0,"div",3),n.TgZ(4,"div",4),n.NdJ("nearOfBottom",function(){return e.onNearOfBottom()}),n.YNc(5,K,18,15,"div",5),n.qZA(),n.qZA()),2&t&&(n.xp6(3),n.Q6J("ngIf",0===e.channelPagination.totalItems),n.xp6(1),n.Q6J("dataObservable",e.onChannelDataSubject.asObservable()),n.xp6(1),n.Q6J("ngForOf",e.videoChannels))},directives:[E.O5,Z.A,E.sg,P.b,u.yS,R.h,F.v],styles:['@charset "UTF-8";.margin-content[_ngcontent-%COMP%]{--gridVideosMiniatureMargins: var(--videosHorizontalMarginContent)}@supports (margin-inline-start: var(--gridVideosMiniatureMargins) !important){.margin-content[_ngcontent-%COMP%]{margin-inline-start:var(--gridVideosMiniatureMargins)!important}}@supports not (margin-inline-start: var(--gridVideosMiniatureMargins) !important){.margin-content[_ngcontent-%COMP%]{margin-left:var(--gridVideosMiniatureMargins)!important}}@supports (margin-inline-end: var(--gridVideosMiniatureMargins) !important){.margin-content[_ngcontent-%COMP%]{margin-inline-end:var(--gridVideosMiniatureMargins)!important}}@supports not (margin-inline-end: var(--gridVideosMiniatureMargins) !important){.margin-content[_ngcontent-%COMP%]{margin-right:var(--gridVideosMiniatureMargins)!important}}@media screen and (max-width: 500px){.margin-content[_ngcontent-%COMP%]{--gridVideosMiniatureMargins: 0;width:auto}}.channel[_ngcontent-%COMP%]{max-width:1200px;background-color:var(--channelBackgroundColor);padding:30px;margin:30px 0;display:grid;grid-template-columns:1fr auto;grid-template-rows:auto auto;grid-column-gap:15px;column-gap:15px}.channel-avatar-row[_ngcontent-%COMP%]{grid-column:1;grid-row:1;display:grid;grid-template-columns:auto auto 1fr;grid-template-rows:auto 1fr}.channel-avatar-row[_ngcontent-%COMP%]   my-actor-avatar[_ngcontent-%COMP%]{display:inline-block;width:75px;height:75px;min-width:75px;min-height:75px;grid-column:1;grid-row:1/3}@supports (margin-inline-end: 15px){.channel-avatar-row[_ngcontent-%COMP%]   my-actor-avatar[_ngcontent-%COMP%]{margin-inline-end:15px}}@supports not (margin-inline-end: 15px){.channel-avatar-row[_ngcontent-%COMP%]   my-actor-avatar[_ngcontent-%COMP%]{margin-right:15px}}.channel-avatar-row[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{word-break:break-word;word-wrap:break-word;overflow-wrap:break-word;-webkit-hyphens:auto;hyphens:auto;color:var(--mainForegroundColor)}.channel-avatar-row[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{grid-row:1;grid-column:2;font-size:20px;line-height:1;font-weight:700;margin:0}.channel-avatar-row[_ngcontent-%COMP%]   .actor-counters[_ngcontent-%COMP%]{color:var(--greyForegroundColor);font-size:16px;display:flex;align-items:center;grid-row:1;grid-column:3}@supports (margin-inline-start: 15px){.channel-avatar-row[_ngcontent-%COMP%]   .actor-counters[_ngcontent-%COMP%]{margin-inline-start:15px}}@supports not (margin-inline-start: 15px){.channel-avatar-row[_ngcontent-%COMP%]   .actor-counters[_ngcontent-%COMP%]{margin-left:15px}}.channel-avatar-row[_ngcontent-%COMP%]   .actor-counters[_ngcontent-%COMP%] > *[_ngcontent-%COMP%]:not(:last-child):after{content:"\\2022";margin:0 10px;color:var(--mainColor)}.channel-avatar-row[_ngcontent-%COMP%]   .description-html[_ngcontent-%COMP%]{position:relative;overflow:hidden;grid-column:2/4;grid-row:2;max-height:80px;font-size:16px}.channel-avatar-row[_ngcontent-%COMP%]   .description-html[_ngcontent-%COMP%]:after{content:"";pointer-events:none;width:100%;height:100%;position:absolute;left:0;top:0;background:linear-gradient(transparent 30px,var(--channelBackgroundColor))}my-subscribe-button[_ngcontent-%COMP%]{grid-row:1;grid-column:2}.videos[_ngcontent-%COMP%]{display:flex;grid-column:1/3;grid-row:2;margin-top:30px;position:relative;overflow:hidden}.videos[_ngcontent-%COMP%]   my-video-miniature[_ngcontent-%COMP%]{min-width:201px;max-width:201px}@supports (margin-inline-end: 15px){.videos[_ngcontent-%COMP%]   my-video-miniature[_ngcontent-%COMP%]{margin-inline-end:15px}}@supports not (margin-inline-end: 15px){.videos[_ngcontent-%COMP%]   my-video-miniature[_ngcontent-%COMP%]{margin-right:15px}}.videos[_ngcontent-%COMP%]   .no-results[_ngcontent-%COMP%]{height:auto}.miniature-show-channel[_ngcontent-%COMP%]{height:100%;position:absolute;right:0;background:linear-gradient(90deg,transparent 0,var(--channelBackgroundColor) 45px);padding:47px 15px 0 60px;z-index:11}.miniature-show-channel[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{color:var(--mainColor);font-size:16px;font-weight:600}.button-show-channel[_ngcontent-%COMP%]{display:none}@media screen and (max-width: 500px){.channel[_ngcontent-%COMP%]{padding:15px}.channel-avatar-row[_ngcontent-%COMP%]{grid-template-columns:auto auto auto 1fr}.channel-avatar-row[_ngcontent-%COMP%]   .avatar-link[_ngcontent-%COMP%]{grid-row:1/4}.channel-avatar-row[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{font-size:16px}.channel-avatar-row[_ngcontent-%COMP%]   .actor-counters[_ngcontent-%COMP%]{margin:0;font-size:13px;grid-row:2;grid-column:2/4}.channel-avatar-row[_ngcontent-%COMP%]   .description-html[_ngcontent-%COMP%]{grid-row:3;font-size:14px}.show-channel[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{padding-top:0;padding-bottom:0;border:0;font-size:15px;height:30px;line-height:30px;border-radius:3px!important;text-align:center;cursor:pointer;display:inline-block;border:2px solid var(--mainColor);font-weight:600}.show-channel[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover, .show-channel[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:focus, .show-channel[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:active{text-decoration:none!important;outline:none!important}@supports (padding-inline-start: 13px){.show-channel[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{padding-inline-start:13px}}@supports not (padding-inline-start: 13px){.show-channel[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{padding-left:13px}}@supports (padding-inline-end: 17px){.show-channel[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{padding-inline-end:17px}}@supports not (padding-inline-end: 17px){.show-channel[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{padding-right:17px}}.show-channel[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:focus, .show-channel[_ngcontent-%COMP%]   a.focus-visible[_ngcontent-%COMP%]{box-shadow:0 0 0 .2rem var(--mainColorLightest)}.show-channel[_ngcontent-%COMP%]   a[_ngcontent-%COMP%], .show-channel[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:active, .show-channel[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:focus{color:var(--mainColor);background-color:var(--mainBackgroundColor)}.show-channel[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover{color:var(--mainColor);background-color:var(--mainColorLightest)}.show-channel[_ngcontent-%COMP%]   a[disabled][_ngcontent-%COMP%], .show-channel[_ngcontent-%COMP%]   a.disabled[_ngcontent-%COMP%]{cursor:default;color:var(--mainColor);background-color:#c6c6c6}.show-channel[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .feather, .show-channel[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .material, .show-channel[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .misc{color:var(--mainColor)}.videos[_ngcontent-%COMP%]{display:none}my-subscribe-button[_ngcontent-%COMP%], .button-show-channel[_ngcontent-%COMP%]{grid-column:1/4;grid-row:3;margin-top:15px}my-subscribe-button[_ngcontent-%COMP%]{justify-self:start}.button-show-channel[_ngcontent-%COMP%]{display:block;justify-self:end}}']}),o})();var X=a(24898),J=a(75585);function j(o,_){if(1&o&&n._UZ(0,"my-videos-list",1),2&o){const t=n.oxw();n.Q6J("title",t.title)("displayTitle",!1)("getVideosObservableFunction",t.getVideosObservableFunction)("getSyndicationItemsFunction",t.getSyndicationItemsFunction)("defaultSort",t.defaultSort)("displayFilters",!0)("displayModerationBlock",!0)("displayAsRow",t.displayAsRow())("hideScopeFilter",!0)("loadUserVideoPreferences",!0)("disabled",t.disabled)}}let q=(()=>{class o{constructor(t,e,i){this.screenService=t,this.accountService=e,this.videoService=i,this.getVideosObservableFunction=this.getVideosObservable.bind(this),this.getSyndicationItemsFunction=this.getSyndicationItems.bind(this),this.title="Videot",this.defaultSort="-publishedAt",this.disabled=!1}ngOnInit(){this.accountService.accountLoaded.pipe((0,X.P)()).subscribe(t=>this.account=t)}ngOnDestroy(){this.accountSub&&this.accountSub.unsubscribe()}getVideosObservable(t,e){const i=Object.assign(Object.assign({},e.toVideosAPIObject()),{videoPagination:t,account:this.account,skipCount:!0});return this.videoService.getAccountVideos(i)}getSyndicationItems(){return this.videoService.getAccountFeedUrls(this.account.id)}displayAsRow(){return this.screenService.isInMobileView()}disableForReuse(){this.disabled=!0}enabledForReuse(){this.disabled=!1}}return o.\u0275fac=function(t){return new(t||o)(n.Y36(d.H2),n.Y36(l.BR),n.Y36(l.kI))},o.\u0275cmp=n.Xpm({type:o,selectors:[["my-account-videos"]],decls:1,vars:1,consts:[[3,"title","displayTitle","getVideosObservableFunction","getSyndicationItemsFunction","defaultSort","displayFilters","displayModerationBlock","displayAsRow","hideScopeFilter","loadUserVideoPreferences","disabled",4,"ngIf"],[3,"title","displayTitle","getVideosObservableFunction","getSyndicationItemsFunction","defaultSort","displayFilters","displayModerationBlock","displayAsRow","hideScopeFilter","loadUserVideoPreferences","disabled"]],template:function(t,e){1&t&&n.YNc(0,j,1,11,"my-videos-list",0),2&t&&n.Q6J("ngIf",e.account)},directives:[E.O5,J.d],encapsulation:2}),o})();var W=a(34920),nn=a(97142),f=a(359),tn=a(59930),en=a(26368),on=a(52223),_n=a(58494),an=a(76476),rn=a(21436);const sn=["accountReportModal"];function cn(o,_){if(1&o&&(n.TgZ(0,"span",30),n.SDv(1,31),n.qZA()),2&o){const t=n.oxw(2);n.Q6J("ngbTooltip",t.accountUser.blockedReason)}}function dn(o,_){1&o&&(n.TgZ(0,"span",32),n.SDv(1,33),n.qZA())}function ln(o,_){1&o&&(n.TgZ(0,"span",32),n.SDv(1,34),n.qZA())}function gn(o,_){1&o&&(n.TgZ(0,"span",32),n.SDv(1,35),n.qZA())}function Cn(o,_){1&o&&(n.TgZ(0,"span",32),n.SDv(1,36),n.qZA())}function un(o,_){if(1&o&&(n.TgZ(0,"span",37),n.SDv(1,38),n.qZA()),2&o){const t=n.oxw(2);n.xp6(1),n.pQV(t.accountVideosCount)(t.accountVideosCount),n.QtT(1)}}function pn(o,_){if(1&o){const t=n.EpF();n.TgZ(0,"div",39),n.NdJ("click",function(){n.CHM(t);const i=n.oxw(2);return i.accountDescriptionExpanded=!i.accountDescriptionExpanded}),n.SDv(1,40),n.qZA()}}function Sn(o,_){1&o&&(n.TgZ(0,"a",41),n.SDv(1,42),n.qZA())}function On(o,_){if(1&o&&n._UZ(0,"my-subscribe-button",43),2&o){const t=n.oxw(2);n.Q6J("account",t.account)("videoChannels",t.videoChannels)}}function En(o,_){if(1&o&&(n.TgZ(0,"a",44),n._uU(1),n.qZA()),2&o){const t=_.item;n.Q6J("routerLink",t.routerLink),n.xp6(1),n.Oqu(t.label)}}const An=function(o){return{expanded:o}},Nn=function(o){return{"on-channel-page":o}};function hn(o,_){if(1&o){const t=n.EpF();n.TgZ(0,"div",2),n.TgZ(1,"div",3),n.TgZ(2,"div",4),n._UZ(3,"my-actor-avatar",5),n.TgZ(4,"div"),n.TgZ(5,"div",6),n.SDv(6,7),n.qZA(),n.TgZ(7,"div",8),n.TgZ(8,"div"),n.TgZ(9,"div",9),n.TgZ(10,"h1",10),n.ALo(11,"date"),n._uU(12),n.qZA(),n.TgZ(13,"my-user-moderation-dropdown",11),n.NdJ("userChanged",function(){return n.CHM(t),n.oxw().onUserChanged()})("userDeleted",function(){return n.CHM(t),n.oxw().onUserDeleted()}),n.qZA(),n.YNc(14,cn,2,1,"span",12),n.YNc(15,dn,2,0,"span",13),n.YNc(16,ln,2,0,"span",13),n.YNc(17,gn,2,0,"span",13),n.YNc(18,Cn,2,0,"span",13),n.qZA(),n.TgZ(19,"div",14),n.TgZ(20,"span"),n._uU(21),n.qZA(),n.TgZ(22,"button",15),n.NdJ("click",function(){return n.CHM(t),n.oxw().activateCopiedMessage()}),n._UZ(23,"span",16),n.qZA(),n.qZA(),n.TgZ(24,"div",17),n.TgZ(25,"span"),n.SDv(26,18),n.qZA(),n.YNc(27,un,2,2,"span",19),n.qZA(),n.qZA(),n.qZA(),n.qZA(),n.qZA(),n.TgZ(28,"div",20),n._UZ(29,"div",21),n.qZA(),n.YNc(30,pn,2,0,"div",22),n.TgZ(31,"div",23),n.YNc(32,Sn,2,0,"a",24),n.YNc(33,On,1,2,"my-subscribe-button",25),n.qZA(),n.qZA(),n.TgZ(34,"div",26),n.YNc(35,En,2,2,"ng-template",null,27,n.W1O),n._UZ(37,"my-list-overflow",28),n.TgZ(38,"my-simple-search-input",29),n.NdJ("searchChanged",function(i){return n.CHM(t),n.oxw().searchChanged(i)})("inputDisplayChanged",function(i){return n.CHM(t),n.oxw().onSearchInputDisplayChanged(i)}),n.qZA(),n.qZA(),n._UZ(39,"router-outlet"),n.qZA()}if(2&o){const t=n.MAs(36),e=n.oxw();n.xp6(3),n.Q6J("account",e.account),n.xp6(7),n.Q6J("title","Created on "+n.lcZ(11,26,e.account.createdAt)),n.xp6(2),n.Oqu(e.account.displayName),n.xp6(1),n.Q6J("prependActions",e.prependModerationActions)("account",e.account)("user",e.accountUser),n.xp6(1),n.Q6J("ngIf",null==e.accountUser?null:e.accountUser.blocked),n.xp6(1),n.Q6J("ngIf",e.account.mutedByUser),n.xp6(1),n.Q6J("ngIf",e.account.mutedServerByUser),n.xp6(1),n.Q6J("ngIf",e.account.mutedByInstance),n.xp6(1),n.Q6J("ngIf",e.account.mutedServerByInstance),n.xp6(3),n.hij("@",e.account.nameWithHost,""),n.xp6(1),n.Q6J("cdkCopyToClipboard",e.account.nameWithHostForced),n.xp6(4),n.pQV(e.naiveAggregatedSubscribers())(e.naiveAggregatedSubscribers()),n.QtT(26),n.xp6(1),n.Q6J("ngIf",void 0!==e.accountVideosCount),n.xp6(1),n.Q6J("ngClass",n.VKq(28,An,e.accountDescriptionExpanded)),n.xp6(1),n.Q6J("innerHTML",e.accountDescriptionHTML,n.oJD),n.xp6(1),n.Q6J("ngIf",e.hasShowMoreDescription()),n.xp6(2),n.Q6J("ngIf",e.isManageable()),n.xp6(1),n.Q6J("ngIf",e.hasVideoChannels()&&!e.isManageable()),n.xp6(1),n.Q6J("ngClass",n.VKq(30,Nn,e.isOnChannelPage())),n.xp6(3),n.Q6J("hidden",e.hideMenu)("items",e.links)("itemTemplate",t),n.xp6(1),n.Q6J("alwaysShow",!e.isInSmallView())}}function Tn(o,_){if(1&o&&(n.ynx(0),n._UZ(1,"my-account-report",45,46),n.BQk()),2&o){const t=n.oxw();n.xp6(1),n.Q6J("account",t.account)}}const Mn=[{path:"peertube",redirectTo:"/videos/local"},{path:":accountId",component:(()=>{class o{constructor(t,e,i,r,g,C,p,S,O,s,A,N){this.route=t,this.router=e,this.userService=i,this.accountService=r,this.videoChannelService=g,this.notifier=C,this.restExtractor=p,this.redirectService=S,this.authService=O,this.videoService=s,this.markdown=A,this.screenService=N,this.videoChannels=[],this.links=[],this.hideMenu=!1,this.accountFollowerTitle="",this.accountDescriptionHTML="",this.accountDescriptionExpanded=!1}ngOnInit(){this.routeSub=this.route.params.pipe((0,v.U)(t=>t.accountId),(0,W.x)(),(0,h.w)(t=>this.accountService.getAccount(t)),(0,m.b)(t=>this.onAccount(t)),(0,h.w)(t=>this.videoChannelService.listAccountVideoChannels({account:t})),(0,nn.K)(t=>this.restExtractor.redirectTo404IfNotFound(t,"other",[f.WE.BAD_REQUEST_400,f.WE.NOT_FOUND_404]))).subscribe({next:t=>{this.videoChannels=t.data},error:t=>this.notifier.error(t.message)}),this.links=[{label:"CHANNELS",routerLink:"video-channels"},{label:"VIDEOS",routerLink:"videos"}]}ngOnDestroy(){this.routeSub&&this.routeSub.unsubscribe()}naiveAggregatedSubscribers(){return this.videoChannels.reduce((t,e)=>t+e.followersCount,this.account.followersCount)}isUserLoggedIn(){return this.authService.isLoggedIn()}isInSmallView(){return this.screenService.isInSmallView()}isManageable(){var t;return!!this.isUserLoggedIn()&&(null===(t=this.account)||void 0===t?void 0:t.userId)===this.authService.getUser().id}onUserChanged(){this.loadUserIfNeeded(this.account)}onUserDeleted(){this.redirectService.redirectToHomepage()}activateCopiedMessage(){this.notifier.success("K\xE4ytt\xE4j\xE4nimi kopioitu")}subscribersDisplayFor(t){return 1===t?"1 subscriber":"" + t + " subscribers"}searchChanged(t){this.router.navigate(["./videos"],{queryParams:{search:t},relativeTo:this.route,queryParamsHandling:"merge"})}onSearchInputDisplayChanged(t){this.hideMenu=this.isInSmallView()&&t}hasVideoChannels(){return 0!==this.videoChannels.length}hasShowMoreDescription(){return!this.accountDescriptionExpanded&&this.accountDescriptionHTML.length>100}isOnChannelPage(){return"video-channels"===this.route.children[0].snapshot.url[0].path}onAccount(t){return(0,M.mG)(this,void 0,void 0,function*(){this.accountFollowerTitle="\n          " + t.followersCount + " direct account followers\n        ",this.prependModerationActions=void 0,this.accountDescriptionHTML=yield this.markdown.textMarkdownToHTML(t.description),this.account=t,this.updateModerationActions(),this.loadUserIfNeeded(t),this.loadAccountVideosCount()})}showReportModal(){this.accountReportModal.show()}loadUserIfNeeded(t){t.userId&&this.authService.isLoggedIn()&&this.authService.getUser().hasRight(1)&&this.userService.getUser(t.userId).subscribe({next:i=>{this.accountUser=i},error:i=>this.notifier.error(i.message)})}updateModerationActions(){!this.authService.isLoggedIn()||this.authService.userInformationLoaded.subscribe(()=>{this.isManageable()||(this.prependModerationActions=[{label:"Report this account",handler:()=>this.showReportModal()}])})}loadAccountVideosCount(){this.videoService.getAccountVideos({account:this.account,videoPagination:{currentPage:1,itemsPerPage:0},sort:"-publishedAt"}).subscribe(t=>{this.accountVideosCount=t.total})}}return o.\u0275fac=function(t){return new(t||o)(n.Y36(u.gz),n.Y36(u.F0),n.Y36(d.KD),n.Y36(l.BR),n.Y36(l.B1),n.Y36(d.d4),n.Y36(d.DI),n.Y36(d.VH),n.Y36(d.e8),n.Y36(l.kI),n.Y36(d.Zy),n.Y36(d.H2))},o.\u0275cmp=n.Xpm({type:o,selectors:[["ng-component"]],viewQuery:function(t,e){if(1&t&&n.Gf(sn,5),2&t){let i;n.iGM(i=n.CRH())&&(e.accountReportModal=i.first)}},decls:2,vars:2,consts:function(){let _,t,e,i,r,g,C,p,S,O,s,A,N,V;return _="ACCOUNT",t="Copy account handle",e="{VAR_PLURAL, plural, =1 {1 subscriber} other {{INTERPOLATION} subscribers}}",e=n.Zx4(e,{VAR_PLURAL:"\ufffd0\ufffd",INTERPOLATION:"\ufffd1\ufffd"}),i="Show the complete description",r="Search account videos",g="Suljettu",C="Mykistetty",p="Instanssi mykistetty",S="Mykistetty sinun instanssin toimesta",O="Instanssi mykistetty sinun instanssin toimesta",s="{VAR_PLURAL, plural, =1 {1 videos} other {{INTERPOLATION} videos}}",s=n.Zx4(s,{VAR_PLURAL:"\ufffd0\ufffd",INTERPOLATION:"\ufffd1\ufffd"}),A=" " + s + " ",N=" Show more... ",V=" Manage account ",[["class","root",4,"ngIf"],[4,"ngIf"],[1,"root"],[1,"account-info"],[1,"account-avatar-row"],[1,"main-avatar",3,"account"],[1,"section-label"],_,[1,"actor-info"],[1,"actor-display-name"],[3,"title"],["buttonSize","small","placement","bottom-left auto",3,"prependActions","account","user","userChanged","userDeleted"],["class","badge badge-danger",3,"ngbTooltip",4,"ngIf"],["class","badge badge-danger",4,"ngIf"],[1,"actor-handle"],["title",t,1,"btn","btn-outline-secondary","btn-sm","copy-button",3,"cdkCopyToClipboard","click"],[1,"glyphicon","glyphicon-duplicate"],[1,"actor-counters"],e,["class","videos-count",4,"ngIf"],[1,"description",3,"ngClass"],[1,"description-html",3,"innerHTML"],["class","show-more","role","button","title",i,3,"click",4,"ngIf"],[1,"buttons"],["routerLink","/my-account","class","peertube-button-link orange-button",4,"ngIf"],[3,"account","videoChannels",4,"ngIf"],[1,"links",3,"ngClass"],["linkTemplate",""],[3,"hidden","items","itemTemplate"],["name","search-videos","icon-title","Search account videos","placeholder",r,3,"alwaysShow","searchChanged","inputDisplayChanged"],[1,"badge","badge-danger",3,"ngbTooltip"],g,[1,"badge","badge-danger"],C,p,S,O,[1,"videos-count"],A,["role","button","title",i,1,"show-more",3,"click"],N,["routerLink","/my-account",1,"peertube-button-link","orange-button"],V,[3,"account","videoChannels"],["routerLinkActive","active",1,"title-page",3,"routerLink"],[3,"account"],["accountReportModal",""]]},template:function(t,e){1&t&&(n.YNc(0,hn,40,32,"div",0),n.YNc(1,Tn,3,1,"ng-container",1)),2&t&&(n.Q6J("ngIf",e.account),n.xp6(1),n.Q6J("ngIf",e.prependModerationActions))},directives:[E.O5,P.b,tn.a,en.i3,E.mk,on.d,_n.Y,u.lC,an._L,u.yS,R.h,u.Od,rn.E],pipes:[E.uU],styles:['@charset "UTF-8";.root[_ngcontent-%COMP%]{--myGlobalTopPadding: 60px;--myImgMargin: 30px;--myFontSize: 16px;--myGreyFontSize: 16px}.section-label[_ngcontent-%COMP%]{color:var(--mainColor);font-size:12px;margin-bottom:15px;font-weight:700;letter-spacing:2.5px}@media screen and (max-width: 500px){.section-label[_ngcontent-%COMP%]{font-size:10px;letter-spacing:2.1px;margin-bottom:5px}}.links[_ngcontent-%COMP%]{--gridVideosMiniatureMargins: var(--videosHorizontalMarginContent);display:flex;justify-content:space-between;align-items:center}@supports (margin-inline-start: var(--gridVideosMiniatureMargins) !important){.links[_ngcontent-%COMP%]{margin-inline-start:var(--gridVideosMiniatureMargins)!important}}@supports not (margin-inline-start: var(--gridVideosMiniatureMargins) !important){.links[_ngcontent-%COMP%]{margin-left:var(--gridVideosMiniatureMargins)!important}}@supports (margin-inline-end: var(--gridVideosMiniatureMargins) !important){.links[_ngcontent-%COMP%]{margin-inline-end:var(--gridVideosMiniatureMargins)!important}}@supports not (margin-inline-end: var(--gridVideosMiniatureMargins) !important){.links[_ngcontent-%COMP%]{margin-right:var(--gridVideosMiniatureMargins)!important}}@media screen and (max-width: 500px){.links[_ngcontent-%COMP%]{--gridVideosMiniatureMargins: 0;width:auto}}.links.on-channel-page[_ngcontent-%COMP%]{max-width:1200px}@supports (margin-inline-start: auto){.links[_ngcontent-%COMP%]   simple-search-input[_ngcontent-%COMP%]{margin-inline-start:auto}}@supports not (margin-inline-start: auto){.links[_ngcontent-%COMP%]   simple-search-input[_ngcontent-%COMP%]{margin-left:auto}}my-user-moderation-dropdown[_ngcontent-%COMP%], .badge[_ngcontent-%COMP%]{position:relative;top:3px}@supports (margin-inline-start: 10px){my-user-moderation-dropdown[_ngcontent-%COMP%], .badge[_ngcontent-%COMP%]{margin-inline-start:10px}}@supports not (margin-inline-start: 10px){my-user-moderation-dropdown[_ngcontent-%COMP%], .badge[_ngcontent-%COMP%]{margin-left:10px}}.badge[_ngcontent-%COMP%]{font-size:13px}.copy-button[_ngcontent-%COMP%]{border:0}.account-info[_ngcontent-%COMP%]{--gridVideosMiniatureMargins: var(--videosHorizontalMarginContent);display:grid;grid-template-columns:1fr -webkit-min-content;grid-template-columns:1fr min-content;grid-template-rows:auto auto;background-color:var(--submenuBackgroundColor);margin-bottom:45px;padding-top:var(--myGlobalTopPadding);padding-bottom:var(--myGlobalTopPadding);font-size:var(--myFontSize)}@supports (padding-inline-start: var(--gridVideosMiniatureMargins) !important){.account-info[_ngcontent-%COMP%]{padding-inline-start:var(--gridVideosMiniatureMargins)!important}}@supports not (padding-inline-start: var(--gridVideosMiniatureMargins) !important){.account-info[_ngcontent-%COMP%]{padding-left:var(--gridVideosMiniatureMargins)!important}}@supports (padding-inline-end: var(--gridVideosMiniatureMargins) !important){.account-info[_ngcontent-%COMP%]{padding-inline-end:var(--gridVideosMiniatureMargins)!important}}@supports not (padding-inline-end: var(--gridVideosMiniatureMargins) !important){.account-info[_ngcontent-%COMP%]{padding-right:var(--gridVideosMiniatureMargins)!important}}@media screen and (max-width: 500px){.account-info[_ngcontent-%COMP%]{--gridVideosMiniatureMargins: 15px;width:auto}}.account-avatar-row[_ngcontent-%COMP%]{display:flex;grid-column:1;margin-bottom:30px}.account-avatar-row[_ngcontent-%COMP%]   .main-avatar[_ngcontent-%COMP%]{display:inline-block;width:120px;height:120px;min-width:120px;min-height:120px}.account-avatar-row[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]{min-width:1px}@supports (margin-inline-start: var(--myImgMargin)){.account-avatar-row[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]{margin-inline-start:var(--myImgMargin)}}@supports not (margin-inline-start: var(--myImgMargin)){.account-avatar-row[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]{margin-left:var(--myImgMargin)}}.account-avatar-row[_ngcontent-%COMP%]   .actor-info[_ngcontent-%COMP%]{display:flex}.account-avatar-row[_ngcontent-%COMP%]   .actor-info[_ngcontent-%COMP%] > div[_ngcontent-%COMP%]:first-child{flex-grow:1;min-width:1px}.account-avatar-row[_ngcontent-%COMP%]   .actor-display-name[_ngcontent-%COMP%]{word-break:break-word;word-wrap:break-word;overflow-wrap:break-word;-webkit-hyphens:auto;hyphens:auto;display:flex;flex-wrap:wrap}.account-avatar-row[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%]{font-size:28px;font-weight:700;margin:0}.account-avatar-row[_ngcontent-%COMP%]   .actor-handle[_ngcontent-%COMP%]{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.account-avatar-row[_ngcontent-%COMP%]   .actor-handle[_ngcontent-%COMP%], .account-avatar-row[_ngcontent-%COMP%]   .actor-counters[_ngcontent-%COMP%]{color:var(--greyForegroundColor);font-size:var(--myGreyFontSize)}.account-avatar-row[_ngcontent-%COMP%]   .actor-counters[_ngcontent-%COMP%] > *[_ngcontent-%COMP%]:not(:last-child):after{content:"\\2022";margin:0 10px;color:var(--mainColor)}@media screen and (max-width: 500px){.account-avatar-row[_ngcontent-%COMP%]{margin-bottom:15px}.account-avatar-row[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%]{font-size:22px}.account-avatar-row[_ngcontent-%COMP%]   .main-avatar[_ngcontent-%COMP%]{display:inline-block;width:80px;height:80px;min-width:80px;min-height:80px}}.description[_ngcontent-%COMP%]{grid-column:1/3;max-width:1000px;word-break:break-word}.show-more[_ngcontent-%COMP%]{color:var(--mainColor);cursor:pointer;margin:10px auto 45px;display:none;text-align:center}.buttons[_ngcontent-%COMP%]{grid-column:2;grid-row:1;display:flex;flex-wrap:wrap;justify-content:flex-end;align-content:flex-start}.buttons[_ngcontent-%COMP%] > *[_ngcontent-%COMP%]:not(:last-child){margin-bottom:15px}.buttons[_ngcontent-%COMP%] > a[_ngcontent-%COMP%]{white-space:nowrap}@media screen and (max-width: 800px){.root[_ngcontent-%COMP%]{--myGlobalTopPadding: 45px;--myChannelImgMargin: 15px}.account-info[_ngcontent-%COMP%]{display:block;padding-bottom:60px}.description[_ngcontent-%COMP%]:not(.expanded){position:relative;overflow:hidden;max-height:70px}.description[_ngcontent-%COMP%]:not(.expanded):after{content:"";pointer-events:none;width:100%;height:100%;position:absolute;left:0;top:0;background:linear-gradient(transparent 30px,var(--submenuBackgroundColor))}.show-more[_ngcontent-%COMP%]{display:block}.buttons[_ngcontent-%COMP%]{justify-content:center}}@media screen and (max-width: 500px){.root[_ngcontent-%COMP%]{--myGlobalTopPadding: 15px;--myFontSize: 14px;--myGreyFontSize: 13px}.account-info[_ngcontent-%COMP%]{display:block;padding-bottom:30px}.links[_ngcontent-%COMP%]{margin:auto!important;width:-webkit-min-content;width:min-content}.show-more[_ngcontent-%COMP%]{margin-bottom:30px}}']}),o})(),children:[{path:"",redirectTo:"video-channels",pathMatch:"full"},{path:"video-channels",component:Q,data:{meta:{title:"Account video channels"}}},{path:"videos",component:q,data:{meta:{title:"Account videos"},reuse:{enabled:!0,key:"account-videos-list"}}},{path:"search",redirectTo:"videos"}]}];let mn=(()=>{class o{}return o.\u0275fac=function(t){return new(t||o)},o.\u0275mod=n.oAB({type:o}),o.\u0275inj=n.cJS({imports:[[u.Bz.forChild(Mn)],u.Bz]}),o})(),vn=(()=>{class o{}return o.\u0275fac=function(t){return new(t||o)},o.\u0275mod=n.oAB({type:o}),o.\u0275inj=n.cJS({providers:[],imports:[[mn,l.nC,I.hA,x.yC,D.DA,b.F5,L.Y,U.v]]}),o})()}}]);