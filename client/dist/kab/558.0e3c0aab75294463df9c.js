"use strict";(self.webpackChunkpeertube_client=self.webpackChunkpeertube_client||[]).push([[558],{34558:(I,y,a)=>{a.r(y),a.d(y,{RemoteInteractionModule:()=>b});var f=a(16274),O=a(68237),v=a(49393),m=a(54755),E=a(19212),S=a(62026),o=a(42741);function d(n,l){if(1&n&&(o.TgZ(0,"div",2),o._uU(1),o.qZA()),2&n){const i=o.oxw();o.xp6(1),o.hij(" ",i.error," ")}}const g=[{path:"",component:(()=>{class n{constructor(i,e,t){this.route=i,this.router=e,this.search=t,this.error=""}ngOnInit(){const i=this.route.snapshot.queryParams.uri;i?this.loadUrl(i):this.error="A\u0263ewwar n URL ixu\u1E63\u1E63 deg yi\u0263ewwaren n URL"}loadUrl(i){(0,E.D)([this.search.searchVideos({search:i}),this.search.searchVideoChannels({search:i})]).subscribe(([e,t])=>{let r;if(0!==e.data.length)r=S.nk.buildWatchUrl(e.data[0]);else{if(0===t.data.length)return void(this.error="Anekcum \u0263er u\u0263balu anmeggag d awez\u0263i");r="/c/"+new S.aO(t.data[0]).nameWithHost}this.router.navigateByUrl(r)})}}return n.\u0275fac=function(i){return new(i||n)(o.Y36(v.gz),o.Y36(v.F0),o.Y36(O.oD))},n.\u0275cmp=o.Xpm({type:n,selectors:[["my-remote-interaction"]],decls:2,vars:1,consts:[[1,"root"],["class","alert alert-error",4,"ngIf"],[1,"alert","alert-error"]],template:function(i,e){1&i&&(o.TgZ(0,"div",0),o.YNc(1,d,2,1,"div",1),o.qZA()),2&i&&(o.xp6(1),o.Q6J("ngIf",e.error))},directives:[f.O5],styles:[""]}),n})(),canActivate:[m.ie],data:{meta:{title:"Amyigew anmeggag"}}}];let c=(()=>{class n{}return n.\u0275fac=function(i){return new(i||n)},n.\u0275mod=o.oAB({type:n}),n.\u0275inj=o.cJS({imports:[[v.Bz.forChild(g)],v.Bz]}),n})(),b=(()=>{class n{}return n.\u0275fac=function(i){return new(i||n)},n.\u0275mod=o.oAB({type:n}),n.\u0275inj=o.cJS({providers:[],imports:[[f.ez,O.DV,c]]}),n})()},68237:(I,y,a)=>{a.d(y,{ZJ:()=>O,XX:()=>c,oD:()=>P.o,DV:()=>l});var f=a(86804);class O{constructor(e){this.silentFilters=new Set(["sort","searchTarget"]),e&&(this.startDate=e.startDate||void 0,this.endDate=e.endDate||void 0,this.originallyPublishedStartDate=e.originallyPublishedStartDate||void 0,this.originallyPublishedEndDate=e.originallyPublishedEndDate||void 0,this.nsfw=e.nsfw||void 0,this.isLive=e.isLive||void 0,this.categoryOneOf=e.categoryOneOf||void 0,this.licenceOneOf=e.licenceOneOf||void 0,this.languageOneOf=e.languageOneOf||void 0,this.tagsOneOf=(0,f.g9)(e.tagsOneOf),this.tagsAllOf=(0,f.g9)(e.tagsAllOf),this.durationMin=parseInt(e.durationMin,10),this.durationMax=parseInt(e.durationMax,10),this.host=e.host||void 0,this.searchTarget=e.searchTarget||void 0,isNaN(this.durationMin)&&(this.durationMin=void 0),isNaN(this.durationMax)&&(this.durationMax=void 0),this.sort=e.sort||"-match")}containsValues(){const e=this.toUrlObject();for(const t of Object.keys(e))if(!this.silentFilters.has(t)&&this.isValidValue(e[t]))return!0;return!1}reset(){this.startDate=void 0,this.endDate=void 0,this.originallyPublishedStartDate=void 0,this.originallyPublishedEndDate=void 0,this.nsfw=void 0,this.categoryOneOf=void 0,this.licenceOneOf=void 0,this.languageOneOf=void 0,this.tagsOneOf=void 0,this.tagsAllOf=void 0,this.durationMin=void 0,this.durationMax=void 0,this.isLive=void 0,this.host=void 0,this.sort="-match"}toUrlObject(){return{startDate:this.startDate,endDate:this.endDate,originallyPublishedStartDate:this.originallyPublishedStartDate,originallyPublishedEndDate:this.originallyPublishedEndDate,nsfw:this.nsfw,categoryOneOf:this.categoryOneOf,licenceOneOf:this.licenceOneOf,languageOneOf:this.languageOneOf,tagsOneOf:this.tagsOneOf,tagsAllOf:this.tagsAllOf,durationMin:this.durationMin,durationMax:this.durationMax,isLive:this.isLive,host:this.host,sort:this.sort,searchTarget:this.searchTarget}}toVideosAPIObject(){let e;return this.isLive&&(e="true"===this.isLive),{startDate:this.startDate,endDate:this.endDate,originallyPublishedStartDate:this.originallyPublishedStartDate,originallyPublishedEndDate:this.originallyPublishedEndDate,nsfw:this.nsfw,categoryOneOf:(0,f.g9)(this.categoryOneOf),licenceOneOf:(0,f.g9)(this.licenceOneOf),languageOneOf:(0,f.g9)(this.languageOneOf),tagsOneOf:this.tagsOneOf,tagsAllOf:this.tagsAllOf,durationMin:this.durationMin,durationMax:this.durationMax,host:this.host,isLive:e,sort:this.sort,searchTarget:this.searchTarget}}toPlaylistAPIObject(){return{host:this.host,searchTarget:this.searchTarget}}toChannelAPIObject(){return{host:this.host,searchTarget:this.searchTarget}}size(){let e=0;const t=this.toUrlObject();for(const r of Object.keys(t))this.silentFilters.has(r)||this.isValidValue(t[r])&&e++;return e}isValidValue(e){return!(void 0===e||""===e||Array.isArray(e)&&0===e.length)}}var v=a(57115),m=a(48022),E=a(64033),S=a(24898),o=a(29230),d=a(42741),P=a(7958);const g=v("peertube:search:FindInBulkService");let c=(()=>{class i{constructor(t,r){this.searchService=t,this.ngZone=r,this.getVideoInBulk=this.buildBulkObservableObject(this.getVideosInBulk.bind(this)),this.getChannelInBulk=this.buildBulkObservableObject(this.getChannelsInBulk.bind(this)),this.getPlaylistInBulk=this.buildBulkObservableObject(this.getPlaylistsInBulk.bind(this))}getVideo(t){return g("Schedule video fetch for uuid %s.",t),this.getData({observableObject:this.getVideoInBulk,finder:r=>r.uuid===t,param:t})}getChannel(t){return g("Schedule channel fetch for handle %s.",t),this.getData({observableObject:this.getChannelInBulk,finder:r=>r.nameWithHost===t||r.nameWithHostForced===t,param:t})}getPlaylist(t){return g("Schedule playlist fetch for uuid %s.",t),this.getData({observableObject:this.getPlaylistInBulk,finder:r=>r.uuid===t,param:t})}getData(t){const{observableObject:r,param:u,finder:s}=t;return new m.y(h=>{r.result.pipe((0,S.P)(),(0,o.U)(({data:D})=>D),(0,o.U)(D=>D.find(s))).subscribe(D=>{D?(h.next(D),h.complete()):h.error(new Error("Element " + u + " not found"))}),r.notifier.next(u)})}getVideosInBulk(t){return g("Fetching videos %s.",t.join(", ")),this.searchService.searchVideos({uuids:t})}getChannelsInBulk(t){return g("Fetching channels %s.",t.join(", ")),this.searchService.searchVideoChannels({handles:t})}getPlaylistsInBulk(t){return g("Fetching playlists %s.",t.join(", ")),this.searchService.searchVideoPlaylists({uuids:t})}buildBulkObservableObject(t){const r=new E.x;return{notifier:r,result:(0,f.f8)({time:500,bulkGet:t,ngZone:this.ngZone,notifierObservable:r.asObservable()})}}}return i.\u0275fac=function(t){return new(t||i)(d.LFG(P.o),d.LFG(d.R0b))},i.\u0275prov=d.Yz7({token:i,factory:i.\u0275fac}),i})();var b=a(62026),n=a(36226);let l=(()=>{class i{}return i.\u0275fac=function(t){return new(t||i)},i.\u0275mod=d.oAB({type:i}),i.\u0275inj=d.cJS({providers:[c,P.o],imports:[[b.nC,n.xq]]}),i})()},7958:(I,y,a)=>{a.d(y,{o:()=>c});var f=a(72754),O=a(97142),v=a(29230),m=a(31887),E=a(62026),S=a(8931),o=a(24766),d=a(42741),P=a(54755),g=a(36226);class c{constructor(n,l,i,e,t){this.authHttp=n,this.restExtractor=l,this.restService=i,this.videoService=e,this.playlistService=t;const r=S.X.getItem("search-url");r&&(c.BASE_SEARCH_URL=r)}searchVideos(n){const{search:l,uuids:i,componentPagination:e,advancedSearch:t}=n,r=c.BASE_SEARCH_URL+"videos";let u;e&&(u=this.restService.componentPaginationToRestPagination(e));let s=new m.LE;if(s=this.restService.addRestGetParams(s,u),l&&(s=s.append("search",l)),i&&(s=this.restService.addArrayParams(s,"uuids",i)),t){const h=t.toVideosAPIObject();s=this.restService.addObjectParams(s,h)}return this.authHttp.get(r,{params:s}).pipe((0,f.w)(h=>this.videoService.extractVideos(h)),(0,O.K)(h=>this.restExtractor.handleError(h)))}searchVideoChannels(n){const{search:l,advancedSearch:i,componentPagination:e,handles:t}=n,r=c.BASE_SEARCH_URL+"video-channels";let u;e&&(u=this.restService.componentPaginationToRestPagination(e));let s=new m.LE;if(s=this.restService.addRestGetParams(s,u),l&&(s=s.append("search",l)),t&&(s=this.restService.addArrayParams(s,"handles",t)),i){const h=i.toChannelAPIObject();s=this.restService.addObjectParams(s,h)}return this.authHttp.get(r,{params:s}).pipe((0,v.U)(h=>E.B1.extractVideoChannels(h)),(0,O.K)(h=>this.restExtractor.handleError(h)))}searchVideoPlaylists(n){const{search:l,advancedSearch:i,componentPagination:e,uuids:t}=n,r=c.BASE_SEARCH_URL+"video-playlists";let u;e&&(u=this.restService.componentPaginationToRestPagination(e));let s=new m.LE;if(s=this.restService.addRestGetParams(s,u),l&&(s=s.append("search",l)),t&&(s=this.restService.addArrayParams(s,"uuids",t)),i){const h=i.toPlaylistAPIObject();s=this.restService.addObjectParams(s,h)}return this.authHttp.get(r,{params:s}).pipe((0,f.w)(h=>this.playlistService.extractPlaylists(h)),(0,O.K)(h=>this.restExtractor.handleError(h)))}}c.BASE_SEARCH_URL=o.N.apiUrl+"/api/v1/search/",c.\u0275fac=function(n){return new(n||c)(d.LFG(m.eN),d.LFG(P.DI),d.LFG(P.vg),d.LFG(E.kI),d.LFG(g.Qq))},c.\u0275prov=d.Yz7({token:c,factory:c.\u0275fac})}}]);