"use strict";(self.webpackChunkpeertube_client=self.webpackChunkpeertube_client||[]).push([[844],{53940:(N,D,i)=>{i.d(D,{W:()=>O});var g=i(61855),S=i(42741),t=i(39445);const P=["contentWrapper"];let O=(()=>{class M{constructor(d){this.customMarkupService=d,this.displayed=!1}ngOnChanges(){return(0,g.mG)(this,void 0,void 0,function*(){yield this.buildElement()})}buildElement(){return(0,g.mG)(this,void 0,void 0,function*(){if(!this.content)return;const{rootElement:d,componentsLoaded:f}=yield this.customMarkupService.buildElement(this.content);this.contentWrapper.nativeElement.appendChild(d),yield f,this.displayed=!0})}}return M.\u0275fac=function(d){return new(d||M)(S.Y36(t.R))},M.\u0275cmp=S.Xpm({type:M,selectors:[["my-custom-markup-container"]],viewQuery:function(d,f){if(1&d&&S.Gf(P,5),2&d){let A;S.iGM(A=S.CRH())&&(f.contentWrapper=A.first)}},inputs:{content:"content"},features:[S.TTD],decls:2,vars:1,consts:[[1,"custom-markup-container",3,"hidden"],["contentWrapper",""]],template:function(d,f){1&d&&S._UZ(0,"div",0,1),2&d&&S.Q6J("hidden",!f.displayed)},encapsulation:2}),M})()},39445:(N,D,i)=>{i.d(D,{R:()=>Z});var g=i(61855),S=i(711),t=i(42741),P=i(16274);let O=(()=>{class a{getTarget(){return!0===this.blankTarget?"_blank":""}getClasses(){return["peertube-button-link","primary"===this.theme?"orange-button":"grey-button"]}}return a.\u0275fac=function(e){return new(e||a)},a.\u0275cmp=t.Xpm({type:a,selectors:[["my-button-markup"]],inputs:{theme:"theme",href:"href",label:"label",blankTarget:"blankTarget"},decls:2,vars:4,consts:[[3,"href","ngClass","target"]],template:function(e,n){1&e&&(t.TgZ(0,"a",0),t._uU(1),t.qZA()),2&e&&(t.Q6J("href",n.href,t.LSH)("ngClass",n.getClasses())("target",n.getTarget()),t.xp6(1),t.Oqu(n.label))},directives:[P.mk],styles:[""]}),a})();var M=i(70612),y=i(17310),d=i(72754),f=i(61017),A=i(29230),_=i(54755),L=i(68237),C=i(62026),R=i(86552),p=i(49393),r=i(69469);function s(a,h){if(1&a&&t._UZ(0,"my-video-miniature",1),2&a){const e=t.oxw();t.Q6J("video",e.video)("user",e.getUser())("displayAsRow",!1)("displayVideoActions",!1)("displayOptions",e.displayOptions)}}let m=(()=>{class a{constructor(e,n,o){this.auth=e,this.findInBulk=n,this.notifier=o,this.loaded=new t.vpe,this.displayOptions={date:!0,views:!0,by:!0,avatar:!1,privacyLabel:!1,privacyText:!1,state:!1,blacklistInfo:!1}}getUser(){return this.auth.getUser()}ngOnInit(){if(this.onlyDisplayTitle)for(const e of Object.keys(this.displayOptions))this.displayOptions[e]=!1;this.findInBulk.getVideo(this.uuid).pipe((0,f.x)(()=>this.loaded.emit(!0))).subscribe({next:e=>this.video=e,error:e=>this.notifier.error("Error in video miniature component: " + e.message + "")})}}return a.\u0275fac=function(e){return new(e||a)(t.Y36(_.e8),t.Y36(L.XX),t.Y36(_.d4))},a.\u0275cmp=t.Xpm({type:a,selectors:[["my-video-miniature-markup"]],inputs:{uuid:"uuid",onlyDisplayTitle:"onlyDisplayTitle"},outputs:{loaded:"loaded"},decls:1,vars:1,consts:[[3,"video","user","displayAsRow","displayVideoActions","displayOptions",4,"ngIf"],[3,"video","user","displayAsRow","displayVideoActions","displayOptions"]],template:function(e,n){1&e&&t.YNc(0,s,1,5,"my-video-miniature",0),2&e&&t.Q6J("ngIf",n.video)},directives:[P.O5,r.v],styles:["my-video-miniature[_ngcontent-%COMP%]{display:inline-block;width:280px}"]}),a})();function b(a,h){if(1&a&&(t.TgZ(0,"span",11),t.SDv(1,12),t.qZA()),2&a){const e=t.oxw(2);t.xp6(1),t.pQV(e.totalVideos)(e.totalVideos),t.QtT(1)}}function c(a,h){if(1&a&&t._UZ(0,"div",13),2&a){const e=t.oxw(2);t.Q6J("innerHTML",e.descriptionHTML,t.oJD)}}function E(a,h){if(1&a&&(t.TgZ(0,"div",14),t.TgZ(1,"div",15),t.SDv(2,16),t.qZA(),t._UZ(3,"my-video-miniature-markup",17),t.qZA()),2&a){const e=t.oxw(2);t.xp6(3),t.Q6J("uuid",e.video.uuid)("onlyDisplayTitle",!0)}}function I(a,h){if(1&a&&(t.TgZ(0,"div",1),t.TgZ(1,"div",2),t._UZ(2,"my-actor-avatar",3),t.TgZ(3,"h6"),t.TgZ(4,"a",4),t._uU(5),t.qZA(),t.qZA(),t.TgZ(6,"div",5),t.TgZ(7,"div",6),t.SDv(8,7),t.qZA(),t.YNc(9,b,2,2,"span",8),t.qZA(),t.YNc(10,c,1,1,"div",9),t.qZA(),t.YNc(11,E,4,2,"div",10),t.qZA()),2&a){const e=t.oxw();t.xp6(2),t.Q6J("channel",e.channel)("internalHref",e.getVideoChannelLink()),t.xp6(2),t.Q6J("routerLink",e.getVideoChannelLink()),t.xp6(1),t.hij(" ",e.channel.displayName," "),t.xp6(3),t.pQV(e.channel.followersCount)(e.channel.followersCount),t.QtT(8),t.xp6(1),t.Q6J("ngIf",void 0!==e.totalVideos),t.xp6(1),t.Q6J("ngIf",e.displayDescription),t.xp6(1),t.Q6J("ngIf",e.video&&e.displayLatestVideo)}}let V=(()=>{class a{constructor(e,n,o,l,v){this.markdown=e,this.findInBulk=n,this.videoService=o,this.userService=l,this.notifier=v,this.loaded=new t.vpe}ngOnInit(){this.findInBulk.getChannel(this.name).pipe((0,y.b)(e=>{this.channel=e}),(0,d.w)(()=>(0,M.Dp)(this.markdown.textMarkdownToHTML(this.channel.description))),(0,y.b)(e=>{this.descriptionHTML=e}),(0,d.w)(()=>this.loadVideosObservable()),(0,f.x)(()=>this.loaded.emit(!0))).subscribe({next:({total:e,data:n})=>{this.totalVideos=e,this.video=n[0]},error:e=>this.notifier.error("Error in channel miniature component: " + e.message + "")})}getVideoChannelLink(){return["/c",this.channel.nameWithHost]}loadVideosObservable(){const e={videoChannel:this.channel,videoPagination:{currentPage:1,itemsPerPage:1},sort:"-publishedAt",count:1};return this.userService.getAnonymousOrLoggedUser().pipe((0,A.U)(n=>n.nsfwPolicy),(0,d.w)(n=>this.videoService.getVideoChannelVideos(Object.assign(Object.assign({},e),{nsfwPolicy:n}))))}}return a.\u0275fac=function(e){return new(e||a)(t.Y36(_.Zy),t.Y36(L.XX),t.Y36(C.kI),t.Y36(_.KD),t.Y36(_.d4))},a.\u0275cmp=t.Xpm({type:a,selectors:[["my-channel-miniature-markup"]],inputs:{name:"name",displayLatestVideo:"displayLatestVideo",displayDescription:"displayDescription"},outputs:{loaded:"loaded"},decls:1,vars:1,consts:function(){let h,e,n,o,l,v;return h="See this video channel",e="See this video channel",n="{VAR_PLURAL, plural, =1 {1 subscriber} other {{INTERPOLATION} subscribers}}",n=t.Zx4(n,{VAR_PLURAL:"\ufffd0\ufffd",INTERPOLATION:"\ufffd1\ufffd"}),o="{VAR_PLURAL, plural, =1 {1 videos} other {{INTERPOLATION} videos}}",o=t.Zx4(o,{VAR_PLURAL:"\ufffd0\ufffd",INTERPOLATION:"\ufffd1\ufffd"}),l=" " + o + " ",v="Latest published video",[["class","channel",4,"ngIf"],[1,"channel"],[1,"channel-avatar-row"],["title",h,3,"channel","internalHref"],["title",e,3,"routerLink"],[1,"actor-counters"],[1,"followers"],n,["class","videos-count",4,"ngIf"],["class","description-html",3,"innerHTML",4,"ngIf"],["class","video",4,"ngIf"],[1,"videos-count"],l,[1,"description-html",3,"innerHTML"],[1,"video"],[1,"video-label"],v,[3,"uuid","onlyDisplayTitle"]]},template:function(e,n){1&e&&t.YNc(0,I,12,9,"div",0),2&e&&t.Q6J("ngIf",n.channel)},directives:[P.O5,R.b,p.yS,m],styles:['@charset "UTF-8";.channel[_ngcontent-%COMP%]{padding:20px;background-color:var(--channelBackgroundColor);margin-bottom:30px;width:-webkit-fit-content;width:-moz-fit-content;width:fit-content}.channel-avatar-row[_ngcontent-%COMP%], .video[_ngcontent-%COMP%]{width:280px}.channel-avatar-row[_ngcontent-%COMP%]{display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto 1fr;grid-column-gap:15px;column-gap:15px}.channel-avatar-row[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{word-break:break-word;word-wrap:break-word;overflow-wrap:break-word;-webkit-hyphens:auto;hyphens:auto;color:var(--mainForegroundColor)}.channel-avatar-row[_ngcontent-%COMP%]   my-actor-avatar[_ngcontent-%COMP%]{display:inline-block;width:75px;height:75px;min-width:75px;min-height:75px;grid-column:1;grid-row:1/4}.channel-avatar-row[_ngcontent-%COMP%]   h6[_ngcontent-%COMP%]{grid-column:2;margin:0}.channel-avatar-row[_ngcontent-%COMP%]   .actor-counters[_ngcontent-%COMP%]{color:var(--greyForegroundColor);font-size:16px;display:flex;align-items:center;font-size:13px;grid-column:2}.channel-avatar-row[_ngcontent-%COMP%]   .actor-counters[_ngcontent-%COMP%] > *[_ngcontent-%COMP%]:not(:last-child):after{content:"\\2022";margin:0 5px;color:var(--mainColor)}.channel-avatar-row[_ngcontent-%COMP%]   .description-html[_ngcontent-%COMP%]{position:relative;overflow:hidden;max-height:60px;grid-column:2}.channel-avatar-row[_ngcontent-%COMP%]   .description-html[_ngcontent-%COMP%]:after{content:"";pointer-events:none;width:100%;height:100%;position:absolute;left:0;top:0;background:linear-gradient(transparent 30px,var(--channelBackgroundColor))}.video-label[_ngcontent-%COMP%]{font-size:12px;color:var(--greyForegroundColor);margin:15px 0 5px}']}),a})();var k=i(3782),B=i(24766),x=i(54175);let w=(()=>{class a{constructor(e){this.el=e,this.type="video"}ngOnInit(){const e="video"===this.type?(0,x.Ce)({uuid:this.uuid},B.N.originServerUrl):(0,x.pb)({uuid:this.uuid},B.N.originServerUrl);this.el.nativeElement.innerHTML=(0,k.t3)(e,this.uuid)}}return a.\u0275fac=function(e){return new(e||a)(t.Y36(t.SBq))},a.\u0275cmp=t.Xpm({type:a,selectors:[["my-embed-markup"]],inputs:{uuid:"uuid",type:"type"},decls:0,vars:0,template:function(e,n){},encapsulation:2}),a})();var H=i(33373);function F(a,h){if(1&a&&t._UZ(0,"my-video-playlist-miniature",1),2&a){const e=t.oxw();t.Q6J("playlist",e.playlist)}}let j=(()=>{class a{constructor(e,n){this.findInBulkService=e,this.notifier=n,this.loaded=new t.vpe,this.displayOptions={date:!0,views:!0,by:!0,avatar:!1,privacyLabel:!1,privacyText:!1,state:!1,blacklistInfo:!1}}ngOnInit(){this.findInBulkService.getPlaylist(this.uuid).pipe((0,f.x)(()=>this.loaded.emit(!0))).subscribe({next:e=>this.playlist=e,error:e=>this.notifier.error("Error in playlist miniature component: " + e.message + "")})}}return a.\u0275fac=function(e){return new(e||a)(t.Y36(L.XX),t.Y36(_.d4))},a.\u0275cmp=t.Xpm({type:a,selectors:[["my-playlist-miniature-markup"]],inputs:{uuid:"uuid"},outputs:{loaded:"loaded"},decls:1,vars:1,consts:[[3,"playlist",4,"ngIf"],[3,"playlist"]],template:function(e,n){1&e&&t.YNc(0,F,1,1,"my-video-playlist-miniature",0),2&e&&t.Q6J("ngIf",n.playlist)},directives:[P.O5,H.U],styles:["my-video-playlist-miniature[_ngcontent-%COMP%]{display:inline-block;width:280px}"]}),a})();function K(a,h){if(1&a&&(t.TgZ(0,"div",3),t._UZ(1,"my-video-miniature",4),t.qZA()),2&a){const e=h.$implicit,n=t.oxw();t.xp6(1),t.Q6J("video",e)("user",n.getUser())("displayAsRow",!1)("displayVideoActions",!1)("displayOptions",n.displayOptions)}}let G=(()=>{class a{constructor(e,n,o){this.auth=e,this.videoService=n,this.notifier=o,this.loaded=new t.vpe,this.displayOptions={date:!1,views:!0,by:!0,avatar:!1,privacyLabel:!1,privacyText:!1,state:!1,blacklistInfo:!1}}getUser(){return this.auth.getUser()}limitRowsStyle(){return this.maxRows<=0?{}:{"grid-template-rows":`repeat(${this.maxRows}, 1fr)`,"grid-auto-rows":"0","overflow-y":"hidden"}}ngOnInit(){if(this.onlyDisplayTitle)for(const e of Object.keys(this.displayOptions))this.displayOptions[e]=!1;return this.getVideosObservable().pipe((0,f.x)(()=>this.loaded.emit(!0))).subscribe({next:({data:e})=>this.videos=e,error:e=>this.notifier.error("Error in videos list component: " + e.message + "")})}getVideosObservable(){const e={videoPagination:{currentPage:1,itemsPerPage:this.count},categoryOneOf:this.categoryOneOf,languageOneOf:this.languageOneOf,filter:this.filter,isLive:this.isLive,sort:this.sort,account:{nameWithHost:this.accountHandle},videoChannel:{nameWithHost:this.channelHandle}};return this.channelHandle?this.videoService.getVideoChannelVideos(e):this.accountHandle?this.videoService.getAccountVideos(e):this.videoService.getVideos(e)}}return a.\u0275fac=function(e){return new(e||a)(t.Y36(_.e8),t.Y36(C.kI),t.Y36(_.d4))},a.\u0275cmp=t.Xpm({type:a,selectors:[["my-videos-list-markup"]],inputs:{sort:"sort",categoryOneOf:"categoryOneOf",languageOneOf:"languageOneOf",count:"count",onlyDisplayTitle:"onlyDisplayTitle",filter:"filter",isLive:"isLive",maxRows:"maxRows",channelHandle:"channelHandle",accountHandle:"accountHandle"},outputs:{loaded:"loaded"},decls:3,vars:2,consts:[[1,"root"],[1,"videos",3,"ngStyle"],["class","video-wrapper",4,"ngFor","ngForOf"],[1,"video-wrapper"],[3,"video","user","displayAsRow","displayVideoActions","displayOptions"]],template:function(e,n){1&e&&(t.TgZ(0,"div",0),t.TgZ(1,"div",1),t.YNc(2,K,2,5,"div",2),t.qZA(),t.qZA()),2&e&&(t.xp6(1),t.Q6J("ngStyle",n.limitRowsStyle()),t.xp6(1),t.Q6J("ngForOf",n.videos))},directives:[P.PC,P.sg,r.v],styles:["@media screen and (min-width: 500px){.root[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%], .root[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]{--miniatureMinWidth: 255px;--miniatureMaxWidth: 280px;display:grid;grid-column-gap:30px;column-gap:30px;grid-template-columns:repeat(auto-fill,minmax(var(--miniatureMinWidth),1fr))}.root[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%]   .video-wrapper[_ngcontent-%COMP%], .root[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%]   .playlist-wrapper[_ngcontent-%COMP%], .root[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]   .video-wrapper[_ngcontent-%COMP%], .root[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]   .playlist-wrapper[_ngcontent-%COMP%]{margin:0 auto;width:100%}.root[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%]   .video-wrapper[_ngcontent-%COMP%]   my-video-miniature[_ngcontent-%COMP%], .root[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%]   .video-wrapper[_ngcontent-%COMP%]   my-video-playlist-miniature[_ngcontent-%COMP%], .root[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%]   .playlist-wrapper[_ngcontent-%COMP%]   my-video-miniature[_ngcontent-%COMP%], .root[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%]   .playlist-wrapper[_ngcontent-%COMP%]   my-video-playlist-miniature[_ngcontent-%COMP%], .root[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]   .video-wrapper[_ngcontent-%COMP%]   my-video-miniature[_ngcontent-%COMP%], .root[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]   .video-wrapper[_ngcontent-%COMP%]   my-video-playlist-miniature[_ngcontent-%COMP%], .root[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]   .playlist-wrapper[_ngcontent-%COMP%]   my-video-miniature[_ngcontent-%COMP%], .root[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]   .playlist-wrapper[_ngcontent-%COMP%]   my-video-playlist-miniature[_ngcontent-%COMP%]{display:block;min-width:var(--miniatureMinWidth);max-width:var(--miniatureMaxWidth)}}@media screen and (min-width: 500px) and (min-width: breakpoint(xm)){.root[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%], .root[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]{grid-column-gap:15px;column-gap:15px}}@media screen and (min-width: 500px) and (min-width: breakpoint(fhd)){.root[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%], .root[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]{grid-column-gap:2%;column-gap:2%}}"]}),a})();var $=i(19823);let Z=(()=>{class a{constructor(e,n){this.dynamicElementService=e,this.markdown=n,this.angularBuilders={"peertube-button":o=>this.buttonBuilder(o),"peertube-video-embed":o=>this.embedBuilder(o,"video"),"peertube-playlist-embed":o=>this.embedBuilder(o,"playlist"),"peertube-video-miniature":o=>this.videoMiniatureBuilder(o),"peertube-playlist-miniature":o=>this.playlistMiniatureBuilder(o),"peertube-channel-miniature":o=>this.channelMiniatureBuilder(o),"peertube-videos-list":o=>this.videosListBuilder(o)},this.htmlBuilders={"peertube-container":o=>this.containerBuilder(o)},this.customMarkdownRenderer=o=>this.buildElement(o).then(({rootElement:l})=>l)}getCustomMarkdownRenderer(){return this.customMarkdownRenderer}buildElement(e){return(0,g.mG)(this,void 0,void 0,function*(){const n=yield this.markdown.customPageMarkdownToHTML(e,this.getSupportedTags()),o=document.createElement("div");o.innerHTML=n;for(const v of Object.keys(this.htmlBuilders))o.querySelectorAll(v).forEach(u=>{try{const T=this.execHTMLBuilder(v,u);u.insertBefore(T,u.firstChild)}catch(T){console.error("Cannot inject component %s.",v,T)}});const l=[];for(const v of Object.keys(this.angularBuilders))o.querySelectorAll(v).forEach(u=>{try{const T=this.execAngularBuilder(v,u);if(T.instance.loaded){const U=(0,S.z)(T.instance.loaded);l.push(U)}this.dynamicElementService.injectElement(u,T)}catch(T){console.error("Cannot inject component %s.",v,T)}});return{rootElement:o,componentsLoaded:Promise.all(l)}})}getSupportedTags(){return Object.keys(this.angularBuilders).concat(Object.keys(this.htmlBuilders))}execHTMLBuilder(e,n){return this.htmlBuilders[e](n)}execAngularBuilder(e,n){return this.angularBuilders[e](n)}embedBuilder(e,n){const o=e.dataset,l=this.dynamicElementService.createElement(w);return this.dynamicElementService.setModel(l,{uuid:o.uuid,type:n}),l}playlistMiniatureBuilder(e){const n=e.dataset,o=this.dynamicElementService.createElement(j);return this.dynamicElementService.setModel(o,{uuid:n.uuid}),o}channelMiniatureBuilder(e){var n,o;const l=e.dataset,v=this.dynamicElementService.createElement(V),u={name:l.name,displayLatestVideo:null===(n=this.buildBoolean(l.displayLatestVideo))||void 0===n||n,displayDescription:null===(o=this.buildBoolean(l.displayDescription))||void 0===o||o};return this.dynamicElementService.setModel(v,u),v}buttonBuilder(e){var n,o;const l=e.dataset,v=this.dynamicElementService.createElement(O),u={theme:null!==(n=l.theme)&&void 0!==n?n:"primary",href:l.href,label:l.label,blankTarget:null!==(o=this.buildBoolean(l.blankTarget))&&void 0!==o&&o};return this.dynamicElementService.setModel(v,u),v}videoMiniatureBuilder(e){var n;const o=e.dataset,l=this.dynamicElementService.createElement(m),v={uuid:o.uuid,onlyDisplayTitle:null!==(n=this.buildBoolean(o.onlyDisplayTitle))&&void 0!==n&&n};return this.dynamicElementService.setModel(l,v),l}videosListBuilder(e){var n,o,l,v;const u=e.dataset,T=this.dynamicElementService.createElement(G),U={onlyDisplayTitle:null!==(n=this.buildBoolean(u.onlyDisplayTitle))&&void 0!==n&&n,maxRows:null!==(o=this.buildNumber(u.maxRows))&&void 0!==o?o:-1,sort:u.sort||"-publishedAt",count:this.buildNumber(u.count)||10,categoryOneOf:null!==(l=this.buildArrayNumber(u.categoryOneOf))&&void 0!==l?l:[],languageOneOf:null!==(v=this.buildArrayString(u.languageOneOf))&&void 0!==v?v:[],accountHandle:u.accountHandle||void 0,channelHandle:u.channelHandle||void 0,isLive:this.buildBoolean(u.isLive),filter:this.buildBoolean(u.onlyLocal)?"local":void 0};return this.dynamicElementService.setModel(T,U),T}containerBuilder(e){const n=e.dataset,o=e.innerHTML;e.innerHTML="";const l=document.createElement("div");if(l.innerHTML=o,l.classList.add("peertube-container",n.layout?"layout-"+n.layout:"layout-column"),l.style.justifyContent=n.justifyContent||"space-between",n.width&&l.setAttribute("width",n.width),n.title||n.description){const u=document.createElement("div");if(u.classList.add("header"),n.title){const T=document.createElement("h4");T.innerText=n.title,u.appendChild(T)}if(n.description){const T=document.createElement("div");T.innerText=n.description,u.append(T)}l.insertBefore(u,l.firstChild)}return l}buildNumber(e){if(e)return parseInt(e,10)}buildBoolean(e){return"true"===e||"false"!==e&&void 0}buildArrayNumber(e){if(e)return e.split(",").map(n=>parseInt(n,10))}buildArrayString(e){if(e)return e.split(",")}}return a.\u0275fac=function(e){return new(e||a)(t.LFG($.D),t.LFG(_.Zy))},a.\u0275prov=t.Yz7({token:a,factory:a.\u0275fac}),a})()},19823:(N,D,i)=>{i.d(D,{D:()=>S});var g=i(42741);let S=(()=>{class t{constructor(O,M,y){this.injector=O,this.applicationRef=M,this.componentFactoryResolver=y}createElement(O){const M=document.createElement("div");return this.componentFactoryResolver.resolveComponentFactory(O).create(this.injector,[],M)}injectElement(O,M){const y=M.hostView;this.applicationRef.attachView(y),O.appendChild(y.rootNodes[0])}setModel(O,M){const y={};for(const f of Object.keys(M)){const A=O.instance[f],_=M[f];O.instance[f]=_,y[f]=new g.WD2(A,_,void 0===A)}const d=O.instance;"function"==typeof d.ngOnChanges&&d.ngOnChanges(y),O.changeDetectorRef.detectChanges()}}return t.\u0275fac=function(O){return new(O||t)(g.LFG(g.zs3),g.LFG(g.z2F),g.LFG(g._Vd))},t.\u0275prov=g.Yz7({token:t,factory:t.\u0275fac}),t})()},83844:(N,D,i)=>{i.d(D,{R9:()=>g.R,VY:()=>L});var g=i(39445),t=(i(53940),i(16274)),P=i(63192),O=i(97694),M=i(62026),y=i(68237),d=i(15586),f=i(36226),A=i(19823),_=i(42741);let L=(()=>{class C{}return C.\u0275fac=function(p){return new(p||C)},C.\u0275mod=_.oAB({type:C}),C.\u0275inj=_.cJS({providers:[g.R,A.D],imports:[[t.ez,M.nC,O.Y,d.F5,f.xq,P.v,y.DV]]}),C})()},68237:(N,D,i)=>{i.d(D,{ZJ:()=>S,XX:()=>_,oD:()=>f.o,DV:()=>R});var g=i(86804);class S{constructor(r){this.silentFilters=new Set(["sort","searchTarget"]),r&&(this.startDate=r.startDate||void 0,this.endDate=r.endDate||void 0,this.originallyPublishedStartDate=r.originallyPublishedStartDate||void 0,this.originallyPublishedEndDate=r.originallyPublishedEndDate||void 0,this.nsfw=r.nsfw||void 0,this.isLive=r.isLive||void 0,this.categoryOneOf=r.categoryOneOf||void 0,this.licenceOneOf=r.licenceOneOf||void 0,this.languageOneOf=r.languageOneOf||void 0,this.tagsOneOf=(0,g.g9)(r.tagsOneOf),this.tagsAllOf=(0,g.g9)(r.tagsAllOf),this.durationMin=parseInt(r.durationMin,10),this.durationMax=parseInt(r.durationMax,10),this.host=r.host||void 0,this.searchTarget=r.searchTarget||void 0,isNaN(this.durationMin)&&(this.durationMin=void 0),isNaN(this.durationMax)&&(this.durationMax=void 0),this.sort=r.sort||"-match")}containsValues(){const r=this.toUrlObject();for(const s of Object.keys(r))if(!this.silentFilters.has(s)&&this.isValidValue(r[s]))return!0;return!1}reset(){this.startDate=void 0,this.endDate=void 0,this.originallyPublishedStartDate=void 0,this.originallyPublishedEndDate=void 0,this.nsfw=void 0,this.categoryOneOf=void 0,this.licenceOneOf=void 0,this.languageOneOf=void 0,this.tagsOneOf=void 0,this.tagsAllOf=void 0,this.durationMin=void 0,this.durationMax=void 0,this.isLive=void 0,this.host=void 0,this.sort="-match"}toUrlObject(){return{startDate:this.startDate,endDate:this.endDate,originallyPublishedStartDate:this.originallyPublishedStartDate,originallyPublishedEndDate:this.originallyPublishedEndDate,nsfw:this.nsfw,categoryOneOf:this.categoryOneOf,licenceOneOf:this.licenceOneOf,languageOneOf:this.languageOneOf,tagsOneOf:this.tagsOneOf,tagsAllOf:this.tagsAllOf,durationMin:this.durationMin,durationMax:this.durationMax,isLive:this.isLive,host:this.host,sort:this.sort,searchTarget:this.searchTarget}}toVideosAPIObject(){let r;return this.isLive&&(r="true"===this.isLive),{startDate:this.startDate,endDate:this.endDate,originallyPublishedStartDate:this.originallyPublishedStartDate,originallyPublishedEndDate:this.originallyPublishedEndDate,nsfw:this.nsfw,categoryOneOf:(0,g.g9)(this.categoryOneOf),licenceOneOf:(0,g.g9)(this.licenceOneOf),languageOneOf:(0,g.g9)(this.languageOneOf),tagsOneOf:this.tagsOneOf,tagsAllOf:this.tagsAllOf,durationMin:this.durationMin,durationMax:this.durationMax,host:this.host,isLive:r,sort:this.sort,searchTarget:this.searchTarget}}toPlaylistAPIObject(){return{host:this.host,searchTarget:this.searchTarget}}toChannelAPIObject(){return{host:this.host,searchTarget:this.searchTarget}}size(){let r=0;const s=this.toUrlObject();for(const m of Object.keys(s))this.silentFilters.has(m)||this.isValidValue(s[m])&&r++;return r}isValidValue(r){return!(void 0===r||""===r||Array.isArray(r)&&0===r.length)}}var t=i(57115),P=i(48022),O=i(64033),M=i(24898),y=i(29230),d=i(42741),f=i(7958);const A=t("peertube:search:FindInBulkService");let _=(()=>{class p{constructor(s,m){this.searchService=s,this.ngZone=m,this.getVideoInBulk=this.buildBulkObservableObject(this.getVideosInBulk.bind(this)),this.getChannelInBulk=this.buildBulkObservableObject(this.getChannelsInBulk.bind(this)),this.getPlaylistInBulk=this.buildBulkObservableObject(this.getPlaylistsInBulk.bind(this))}getVideo(s){return A("Schedule video fetch for uuid %s.",s),this.getData({observableObject:this.getVideoInBulk,finder:m=>m.uuid===s,param:s})}getChannel(s){return A("Schedule channel fetch for handle %s.",s),this.getData({observableObject:this.getChannelInBulk,finder:m=>m.nameWithHost===s||m.nameWithHostForced===s,param:s})}getPlaylist(s){return A("Schedule playlist fetch for uuid %s.",s),this.getData({observableObject:this.getPlaylistInBulk,finder:m=>m.uuid===s,param:s})}getData(s){const{observableObject:m,param:b,finder:c}=s;return new P.y(E=>{m.result.pipe((0,M.P)(),(0,y.U)(({data:I})=>I),(0,y.U)(I=>I.find(c))).subscribe(I=>{I?(E.next(I),E.complete()):E.error(new Error("Element " + b + " not found"))}),m.notifier.next(b)})}getVideosInBulk(s){return A("Fetching videos %s.",s.join(", ")),this.searchService.searchVideos({uuids:s})}getChannelsInBulk(s){return A("Fetching channels %s.",s.join(", ")),this.searchService.searchVideoChannels({handles:s})}getPlaylistsInBulk(s){return A("Fetching playlists %s.",s.join(", ")),this.searchService.searchVideoPlaylists({uuids:s})}buildBulkObservableObject(s){const m=new O.x;return{notifier:m,result:(0,g.f8)({time:500,bulkGet:s,ngZone:this.ngZone,notifierObservable:m.asObservable()})}}}return p.\u0275fac=function(s){return new(s||p)(d.LFG(f.o),d.LFG(d.R0b))},p.\u0275prov=d.Yz7({token:p,factory:p.\u0275fac}),p})();var L=i(62026),C=i(36226);let R=(()=>{class p{}return p.\u0275fac=function(s){return new(s||p)},p.\u0275mod=d.oAB({type:p}),p.\u0275inj=d.cJS({providers:[_,f.o],imports:[[L.nC,C.xq]]}),p})()},7958:(N,D,i)=>{i.d(D,{o:()=>_});var g=i(72754),S=i(97142),t=i(29230),P=i(31887),O=i(62026),M=i(8931),y=i(24766),d=i(42741),f=i(54755),A=i(36226);class _{constructor(C,R,p,r,s){this.authHttp=C,this.restExtractor=R,this.restService=p,this.videoService=r,this.playlistService=s;const m=M.X.getItem("search-url");m&&(_.BASE_SEARCH_URL=m)}searchVideos(C){const{search:R,uuids:p,componentPagination:r,advancedSearch:s}=C,m=_.BASE_SEARCH_URL+"videos";let b;r&&(b=this.restService.componentPaginationToRestPagination(r));let c=new P.LE;if(c=this.restService.addRestGetParams(c,b),R&&(c=c.append("search",R)),p&&(c=this.restService.addArrayParams(c,"uuids",p)),s){const E=s.toVideosAPIObject();c=this.restService.addObjectParams(c,E)}return this.authHttp.get(m,{params:c}).pipe((0,g.w)(E=>this.videoService.extractVideos(E)),(0,S.K)(E=>this.restExtractor.handleError(E)))}searchVideoChannels(C){const{search:R,advancedSearch:p,componentPagination:r,handles:s}=C,m=_.BASE_SEARCH_URL+"video-channels";let b;r&&(b=this.restService.componentPaginationToRestPagination(r));let c=new P.LE;if(c=this.restService.addRestGetParams(c,b),R&&(c=c.append("search",R)),s&&(c=this.restService.addArrayParams(c,"handles",s)),p){const E=p.toChannelAPIObject();c=this.restService.addObjectParams(c,E)}return this.authHttp.get(m,{params:c}).pipe((0,t.U)(E=>O.B1.extractVideoChannels(E)),(0,S.K)(E=>this.restExtractor.handleError(E)))}searchVideoPlaylists(C){const{search:R,advancedSearch:p,componentPagination:r,uuids:s}=C,m=_.BASE_SEARCH_URL+"video-playlists";let b;r&&(b=this.restService.componentPaginationToRestPagination(r));let c=new P.LE;if(c=this.restService.addRestGetParams(c,b),R&&(c=c.append("search",R)),s&&(c=this.restService.addArrayParams(c,"uuids",s)),p){const E=p.toPlaylistAPIObject();c=this.restService.addObjectParams(c,E)}return this.authHttp.get(m,{params:c}).pipe((0,g.w)(E=>this.playlistService.extractPlaylists(E)),(0,S.K)(E=>this.restExtractor.handleError(E)))}}_.BASE_SEARCH_URL=y.N.apiUrl+"/api/v1/search/",_.\u0275fac=function(C){return new(C||_)(d.LFG(P.eN),d.LFG(f.DI),d.LFG(f.vg),d.LFG(O.kI),d.LFG(A.Qq))},_.\u0275prov=d.Yz7({token:_,factory:_.\u0275fac})}}]);