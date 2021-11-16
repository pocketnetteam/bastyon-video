"use strict";(self.webpackChunkpeertube_client=self.webpackChunkpeertube_client||[]).push([[367],{66367:(nt,h,r)=>{r.r(h),r.d(h,{VideosModule:()=>tt});var V=r(63192),b=r(84167),S=r(97694),u=r(62026),v=r(33957),T=r(15586),_=r(36371),E=r(19212),p=r(72754),x=r(97142),O=r(29230),m=r(17310),f=r(31887),A=r(86804),w=r(35436),F=r(24766),t=r(42741),c=r(54755);class d{constructor(o,e,n,s){this.authHttp=o,this.restExtractor=e,this.videosService=n,this.serverService=s}getVideosOverview(o){let e=new f.LE;return e=e.append("page",o+""),this.authHttp.get(d.BASE_OVERVIEW_URL+"videos",{params:e}).pipe((0,p.w)(n=>this.updateVideosOverview(n)),(0,x.K)(n=>this.restExtractor.handleError(n)))}updateVideosOverview(o){const e=[],n={tags:[],categories:[],channels:[]};for(const s of Object.keys(o))for(const a of o[s])e.push((0,_.of)(a.videos).pipe((0,p.w)(l=>this.videosService.extractVideos({total:0,data:l})),(0,O.U)(l=>l.data),(0,m.b)(l=>{n[s].push((0,A.Ne)(a,{videos:l}))})));return 0===e.length?(0,_.of)(n):(0,E.D)(e).pipe((0,p.w)(()=>this.serverService.getServerLocale().pipe((0,m.b)(s=>{for(const a of n.categories)a.category.label=(0,w.ol)(a.category.label,s)}))),(0,O.U)(()=>n))}}d.BASE_OVERVIEW_URL=F.N.apiUrl+"/api/v1/overviews/",d.\u0275fac=function(o){return new(o||d)(t.LFG(f.eN),t.LFG(c.DI),t.LFG(u.kI),t.LFG(c.NG))},d.\u0275prov=t.Yz7({token:d,factory:d.\u0275fac});var R=r(64033),C=r(16274),I=r(66717),g=r(49393),D=r(69469),N=r(86552);function L(i,o){1&i&&(t.TgZ(0,"div",6),t.SDv(1,7),t.qZA())}function Z(i,o){if(1&i&&(t.TgZ(0,"div",14),t._UZ(1,"my-video-miniature",15),t.qZA()),2&i){const e=o.$implicit,n=t.oxw(3);t.xp6(1),t.Q6J("video",e)("user",n.userMiniature)("displayVideoActions",!0)}}const M=function(i){return[i]},B=function(i){return{categoryOneOf:i}};function k(i,o){if(1&i&&(t.TgZ(0,"div",10),t.TgZ(1,"h1",11),t.TgZ(2,"a",12),t._uU(3),t.qZA(),t.qZA(),t.YNc(4,Z,2,3,"div",13),t.qZA()),2&i){const e=o.$implicit,n=t.oxw(2);t.xp6(2),t.Q6J("queryParams",t.VKq(5,B,t.VKq(3,M,e.category.id))),t.xp6(1),t.Oqu(e.category.label),t.xp6(1),t.Q6J("ngForOf",n.buildVideos(e.videos))}}function U(i,o){if(1&i&&(t.TgZ(0,"div",14),t._UZ(1,"my-video-miniature",15),t.qZA()),2&i){const e=o.$implicit,n=t.oxw(3);t.xp6(1),t.Q6J("video",e)("user",n.userMiniature)("displayVideoActions",!0)}}const z=function(i){return{tagsOneOf:i}};function $(i,o){if(1&i&&(t.TgZ(0,"div",10),t.TgZ(1,"h2",11),t.TgZ(2,"a",12),t._uU(3),t.qZA(),t.qZA(),t.YNc(4,U,2,3,"div",13),t.qZA()),2&i){const e=o.$implicit,n=t.oxw(2);t.xp6(2),t.Q6J("queryParams",t.VKq(5,z,t.VKq(3,M,e.tag))),t.xp6(1),t.hij("#",e.tag,""),t.xp6(1),t.Q6J("ngForOf",n.buildVideos(e.videos))}}function Y(i,o){if(1&i&&(t.TgZ(0,"div",14),t._UZ(1,"my-video-miniature",15),t.qZA()),2&i){const e=o.$implicit,n=t.oxw(3);t.xp6(1),t.Q6J("video",e)("user",n.userMiniature)("displayVideoActions",!0)}}const J=function(i){return["/c",i]};function j(i,o){if(1&i&&(t.TgZ(0,"div",16),t.TgZ(1,"div",11),t.TgZ(2,"a",17),t._UZ(3,"my-actor-avatar",18),t.TgZ(4,"h2",11),t._uU(5),t.qZA(),t.qZA(),t.qZA(),t.YNc(6,Y,2,3,"div",13),t.qZA()),2&i){const e=o.$implicit,n=t.oxw(2);t.xp6(2),t.Q6J("routerLink",t.VKq(4,J,n.buildVideoChannelBy(e))),t.xp6(1),t.Q6J("channel",n.buildVideoChannel(e)),t.xp6(2),t.Oqu(e.channel.displayName),t.xp6(1),t.Q6J("ngForOf",n.buildVideos(e.videos))}}function Q(i,o){if(1&i&&(t.ynx(0),t.YNc(1,k,5,7,"div",8),t.YNc(2,$,5,7,"div",8),t.YNc(3,j,7,6,"div",9),t.BQk()),2&i){const e=o.$implicit;t.xp6(1),t.Q6J("ngForOf",e.categories),t.xp6(1),t.Q6J("ngForOf",e.tags),t.xp6(1),t.Q6J("ngForOf",e.channels)}}let W=(()=>{class i{constructor(e,n,s,a){this.notifier=e,this.userService=n,this.overviewService=s,this.screenService=a,this.onDataSubject=new R.x,this.overviews=[],this.notResults=!1,this.loaded=!1,this.currentPage=1,this.maxPage=20,this.lastWasEmpty=!1,this.isLoading=!1}ngOnInit(){this.loadMoreResults(),this.userService.getAnonymousOrLoggedUser().subscribe(e=>this.userMiniature=e),this.userService.listenAnonymousUpdate().subscribe(e=>this.userMiniature=e)}buildVideoChannelBy(e){return e.videos[0].byVideoChannel}buildVideoChannel(e){return e.videos[0].channel}buildVideos(e){const n=this.screenService.getNumberOfAvailableMiniatures();return e.slice(0,2*n)}onNearOfBottom(){this.currentPage>=this.maxPage||this.lastWasEmpty||this.isLoading||(this.currentPage++,this.loadMoreResults())}loadMoreResults(){this.isLoading=!0,this.overviewService.getVideosOverview(this.currentPage).subscribe({next:e=>{if(this.isLoading=!1,0===e.tags.length&&0===e.channels.length&&0===e.categories.length)return this.lastWasEmpty=!0,void(!1===this.loaded&&(this.notResults=!0));this.loaded=!0,this.onDataSubject.next(e),this.overviews.push(e)},error:e=>{this.notifier.error(e.message),this.isLoading=!1}})}}return i.\u0275fac=function(e){return new(e||i)(t.Y36(c.d4),t.Y36(c.KD),t.Y36(d),t.Y36(c.H2))},i.\u0275cmp=t.Xpm({type:i,selectors:[["my-video-overview"]],decls:6,vars:3,consts:function(){let o,e;return o="Entdecken",e="Keine Ergebnisse.",[[1,"sr-only"],o,[1,"margin-content"],["class","no-results",4,"ngIf"],["myInfiniteScroller","",3,"dataObservable","nearOfBottom"],[4,"ngFor","ngForOf"],[1,"no-results"],e,["class","section videos",4,"ngFor","ngForOf"],["class","section channel videos",4,"ngFor","ngForOf"],[1,"section","videos"],[1,"section-title"],["routerLink","/search",3,"queryParams"],["class","video-wrapper",4,"ngFor","ngForOf"],[1,"video-wrapper"],[3,"video","user","displayVideoActions"],[1,"section","channel","videos"],[3,"routerLink"],[3,"channel"]]},template:function(e,n){1&e&&(t.TgZ(0,"h1",0),t.SDv(1,1),t.qZA(),t.TgZ(2,"div",2),t.YNc(3,L,2,0,"div",3),t.TgZ(4,"div",4),t.NdJ("nearOfBottom",function(){return n.onNearOfBottom()}),t.YNc(5,Q,4,3,"ng-container",5),t.qZA(),t.qZA()),2&e&&(t.xp6(3),t.Q6J("ngIf",n.notResults),t.xp6(1),t.Q6J("dataObservable",n.onDataSubject.asObservable()),t.xp6(1),t.Q6J("ngForOf",n.overviews))},directives:[C.O5,I.A,C.sg,g.yS,D.v,N.b],styles:[".section-title[_ngcontent-%COMP%]{grid-column:1/-1}.margin-content[_ngcontent-%COMP%]{--gridVideosMiniatureMargins: var(--videosHorizontalMarginContent)}@supports (margin-inline-start: var(--gridVideosMiniatureMargins) !important){.margin-content[_ngcontent-%COMP%]{margin-inline-start:var(--gridVideosMiniatureMargins)!important}}@supports not (margin-inline-start: var(--gridVideosMiniatureMargins) !important){.margin-content[_ngcontent-%COMP%]{margin-left:var(--gridVideosMiniatureMargins)!important}}@supports (margin-inline-end: var(--gridVideosMiniatureMargins) !important){.margin-content[_ngcontent-%COMP%]{margin-inline-end:var(--gridVideosMiniatureMargins)!important}}@supports not (margin-inline-end: var(--gridVideosMiniatureMargins) !important){.margin-content[_ngcontent-%COMP%]{margin-right:var(--gridVideosMiniatureMargins)!important}}@media screen and (max-width: 500px){.margin-content[_ngcontent-%COMP%]{--gridVideosMiniatureMargins: 0;width:auto}}@media screen and (min-width: 500px){.margin-content[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]{--miniatureMinWidth: 255px;--miniatureMaxWidth: 280px;display:grid;grid-column-gap:30px;column-gap:30px;grid-template-columns:repeat(auto-fill,minmax(var(--miniatureMinWidth),1fr))}.margin-content[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%]   .video-wrapper[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%]   .playlist-wrapper[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]   .video-wrapper[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]   .playlist-wrapper[_ngcontent-%COMP%]{margin:0 auto;width:100%}.margin-content[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%]   .video-wrapper[_ngcontent-%COMP%]   my-video-miniature[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%]   .video-wrapper[_ngcontent-%COMP%]   my-video-playlist-miniature[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%]   .playlist-wrapper[_ngcontent-%COMP%]   my-video-miniature[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%]   .playlist-wrapper[_ngcontent-%COMP%]   my-video-playlist-miniature[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]   .video-wrapper[_ngcontent-%COMP%]   my-video-miniature[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]   .video-wrapper[_ngcontent-%COMP%]   my-video-playlist-miniature[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]   .playlist-wrapper[_ngcontent-%COMP%]   my-video-miniature[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]   .playlist-wrapper[_ngcontent-%COMP%]   my-video-playlist-miniature[_ngcontent-%COMP%]{display:block;min-width:var(--miniatureMinWidth);max-width:var(--miniatureMaxWidth)}}@media screen and (min-width: 500px) and (min-width: breakpoint(xm)){.margin-content[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]{grid-column-gap:15px;column-gap:15px}}@media screen and (min-width: 500px) and (min-width: breakpoint(fhd)){.margin-content[_ngcontent-%COMP%]   .videos[_ngcontent-%COMP%], .margin-content[_ngcontent-%COMP%]   .playlists[_ngcontent-%COMP%]{grid-column-gap:2%;column-gap:2%}}.section[_ngcontent-%COMP%]:first-child{padding-top:30px}.section[_ngcontent-%COMP%]:first-child   .section-title[_ngcontent-%COMP%]{border-top:0!important}.section[_ngcontent-%COMP%]   .section-title[_ngcontent-%COMP%]{font-size:24px;font-weight:600;padding-top:15px;margin-bottom:15px;display:flex;justify-content:space-between}.section[_ngcontent-%COMP%]   .section-title[_ngcontent-%COMP%]:not(h2){border-top:1px solid rgba(0,0,0,.1)}.section[_ngcontent-%COMP%]   .section-title[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{color:var(--mainForegroundColor)}.section[_ngcontent-%COMP%]   .section-title[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover, .section[_ngcontent-%COMP%]   .section-title[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:focus:not(.focus-visible), .section[_ngcontent-%COMP%]   .section-title[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:active{text-decoration:none;outline:none}.section.channel[_ngcontent-%COMP%]   .section-title[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{display:flex;width:-webkit-fit-content;width:-moz-fit-content;width:fit-content;align-items:center}.section.channel[_ngcontent-%COMP%]   .section-title[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   my-actor-avatar[_ngcontent-%COMP%]{display:inline-block;width:28px;height:28px;min-width:28px;min-height:28px;font-size:initial}@supports (margin-inline-end: 8px){.section.channel[_ngcontent-%COMP%]   .section-title[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   my-actor-avatar[_ngcontent-%COMP%]{margin-inline-end:8px}}@supports not (margin-inline-end: 8px){.section.channel[_ngcontent-%COMP%]   .section-title[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   my-actor-avatar[_ngcontent-%COMP%]{margin-right:8px}}.section.channel[_ngcontent-%COMP%]   .section-title[_ngcontent-%COMP%]   .followers[_ngcontent-%COMP%]{color:var(--greyForegroundColor);font-weight:normal;font-size:14px;position:relative;top:2px}@supports (margin-inline-start: 10px){.section.channel[_ngcontent-%COMP%]   .section-title[_ngcontent-%COMP%]   .followers[_ngcontent-%COMP%]{margin-inline-start:10px}}@supports not (margin-inline-start: 10px){.section.channel[_ngcontent-%COMP%]   .section-title[_ngcontent-%COMP%]   .followers[_ngcontent-%COMP%]{margin-left:10px}}.section[_ngcontent-%COMP%]   .show-more[_ngcontent-%COMP%]{position:relative;top:-5px;display:inline-block;font-size:16px;text-transform:uppercase;color:var(--greyForegroundColor);margin-bottom:10px;font-weight:600;text-decoration:none}@media screen and (max-width: 500px){.section[_ngcontent-%COMP%]{max-height:initial;overflow:initial}.section[_ngcontent-%COMP%]   .section-title[_ngcontent-%COMP%]{font-size:17px}@supports (margin-inline-start: 10px){.section[_ngcontent-%COMP%]   .section-title[_ngcontent-%COMP%]{margin-inline-start:10px}}@supports not (margin-inline-start: 10px){.section[_ngcontent-%COMP%]   .section-title[_ngcontent-%COMP%]{margin-left:10px}}}"]}),i})();var P=r(68099),y=r(75585);let G=(()=>{class i{constructor(e,n,s,a,l,et){this.server=e,this.route=n,this.videoService=s,this.hooks=a,this.meta=l,this.redirectService=et,this.getVideosObservableFunction=this.getVideosObservable.bind(this),this.getSyndicationItemsFunction=this.getSyndicationItems.bind(this),this.baseRouteBuilderFunction=this.baseRouteBuilder.bind(this),this.loadUserVideoPreferences=!0,this.displayFilters=!0,this.disabled=!1}ngOnInit(){this.trendingDays=this.server.getHTMLConfig().trending.videos.intervalDays,this.routeSub=this.route.params.subscribe(e=>{this.update(e.page)})}ngOnDestroy(){this.routeSub&&this.routeSub.unsubscribe()}getVideosObservable(e,n){const s=Object.assign(Object.assign({},n.toVideosAPIObject()),{videoPagination:e,skipCount:!0});return this.hooks.wrapObsFun(this.videoService.getVideos.bind(this.videoService),s,"common",this.hookParams,this.hookResult)}getSyndicationItems(e){const n=e.toVideosAPIObject();return this.videoService.getVideoFeedUrls(n.sort,n.filter)}onFiltersChanged(e){this.buildTitle(e.scope,e.sort),this.updateGroupByDate(e.sort)}baseRouteBuilder(e){const n=this.getSanitizedSort(e.sort);let s;return s="local"===e.scope?"local":"publishedAt"===n?"recently-added":"trending",["/videos",s]}disableForReuse(){this.disabled=!0}enabledForReuse(){this.disabled=!1}update(e){const n=this.getData(e);this.hookParams=n.hookParams,this.hookResult=n.hookResult,this.defaultSort=n.sort,this.defaultScope=n.scope,this.buildTitle(),this.updateGroupByDate(this.defaultSort),this.meta.setTitle(this.title)}getData(e){return"trending"===e?this.generateTrendingData(this.route.snapshot):"local"===e?this.generateLocalData():this.generateRecentlyAddedData()}generateRecentlyAddedData(){return{sort:"-publishedAt",scope:"federated",hookParams:"filter:api.recently-added-videos.videos.list.params",hookResult:"filter:api.recently-added-videos.videos.list.result"}}generateLocalData(){return{sort:"-publishedAt",scope:"local",hookParams:"filter:api.local-videos.videos.list.params",hookResult:"filter:api.local-videos.videos.list.result"}}generateTrendingData(e){var n;return{sort:null!==(n=e.queryParams.sort)&&void 0!==n?n:this.parseTrendingAlgorithm(this.redirectService.getDefaultTrendingAlgorithm()),scope:"federated",hookParams:"filter:api.trending-videos.videos.list.params",hookResult:"filter:api.trending-videos.videos.list.result"}}parseTrendingAlgorithm(e){switch(e){case"most-viewed":return"-trending";case"most-liked":return"-likes";default:return"-"+e}}updateGroupByDate(e){this.groupByDate="-publishedAt"===e||"publishedAt"===e}buildTitle(e=this.defaultScope,n=this.defaultSort){const s=this.getSanitizedSort(n);return"local"===e?(this.title="Lokale Videos",void(this.titleTooltip="Es werden nur Videos angezeigt, die auf dieser Instanz hochgeladen wurden")):"publishedAt"===s?(this.title="K\xFCrzlich hinzugef\xFCgt",void(this.titleTooltip=void 0)):["best","hot","trending","likes"].includes(s)?(this.title="Beliebt","best"===s&&(this.titleTooltip="Videos mit den meisten Interaktionen f\xFCr aktuelle Videos, abz\xFCglich des Benutzerverlaufs"),"hot"===s&&(this.titleTooltip="Videos mit den meisten Interaktionen f\xFCr aktuelle Videos"),"likes"===s&&(this.titleTooltip="Videos mit den meisten positiven Bewertungen"),void("trending"===s&&(this.titleTooltip=1===this.trendingDays?"Videos mit den meisten Aufrufen in den letzten 24 Stunden":"Videos mit den meisten Aufrufen w\xE4hrend der letzten " + this.trendingDays + " Tage"))):void 0}getSanitizedSort(e){return e.replace(/^-/,"")}}return i.\u0275fac=function(e){return new(e||i)(t.Y36(c.NG),t.Y36(g.gz),t.Y36(u.kI),t.Y36(P.n),t.Y36(c.Rj),t.Y36(c.VH))},i.\u0275cmp=t.Xpm({type:i,selectors:[["ng-component"]],decls:1,vars:12,consts:[[3,"getVideosObservableFunction","getSyndicationItemsFunction","baseRouteBuilderFunction","title","titleTooltip","defaultSort","defaultScope","displayFilters","displayModerationBlock","loadUserVideoPreferences","groupByDate","disabled","filtersChanged"]],template:function(e,n){1&e&&(t.TgZ(0,"my-videos-list",0),t.NdJ("filtersChanged",function(a){return n.onFiltersChanged(a)}),t.qZA()),2&e&&t.Q6J("getVideosObservableFunction",n.getVideosObservableFunction)("getSyndicationItemsFunction",n.getSyndicationItemsFunction)("baseRouteBuilderFunction",n.baseRouteBuilderFunction)("title",n.title)("titleTooltip",n.titleTooltip)("defaultSort",n.defaultSort)("defaultScope",n.defaultScope)("displayFilters",!0)("displayModerationBlock",!0)("loadUserVideoPreferences",!0)("groupByDate",n.groupByDate)("disabled",n.disabled)},directives:[y.d],encapsulation:2}),i})();var K=r(711);let X=(()=>{class i{constructor(e,n,s,a,l){this.authService=e,this.userSubscription=n,this.hooks=s,this.videoService=a,this.scopedTokensService=l,this.getVideosObservableFunction=this.getVideosObservable.bind(this),this.getSyndicationItemsFunction=this.getSyndicationItems.bind(this),this.defaultSort="-publishedAt",this.actions=[{routerLink:"/my-library/subscriptions",label:"Abos",iconName:"cog"}],this.titlePage="Videos aus deinen Abos",this.disabled=!1}getVideosObservable(e,n){const s=Object.assign(Object.assign({},n.toVideosAPIObject()),{videoPagination:e,skipCount:!0});return this.hooks.wrapObsFun(this.userSubscription.getUserSubscriptionVideos.bind(this.userSubscription),s,"common","filter:api.user-subscriptions-videos.videos.list.params","filter:api.user-subscriptions-videos.videos.list.result")}getSyndicationItems(){return this.loadFeedToken().then(()=>{const e=this.authService.getUser();return this.videoService.getVideoSubscriptionFeedUrls(e.account.id,this.feedToken)})}disableForReuse(){this.disabled=!0}enabledForReuse(){this.disabled=!1}loadFeedToken(){if(this.feedToken)return Promise.resolve(this.feedToken);const e=this.authService.userInformationLoaded.pipe((0,p.w)(()=>this.scopedTokensService.getScopedTokens()),(0,m.b)(n=>this.feedToken=n.feedToken));return(0,K.z)(e)}}return i.\u0275fac=function(e){return new(e||i)(t.Y36(c.e8),t.Y36(v.jT),t.Y36(P.n),t.Y36(u.kI),t.Y36(c.pI))},i.\u0275cmp=t.Xpm({type:i,selectors:[["my-videos-user-subscriptions"]],decls:1,vars:10,consts:[[3,"getVideosObservableFunction","getSyndicationItemsFunction","title","defaultSort","displayFilters","displayModerationBlock","loadUserVideoPreferences","groupByDate","disabled","headerActions"]],template:function(e,n){1&e&&t._UZ(0,"my-videos-list",0),2&e&&t.Q6J("getVideosObservableFunction",n.getVideosObservableFunction)("getSyndicationItemsFunction",n.getSyndicationItemsFunction)("title",n.titlePage)("defaultSort",n.defaultSort)("displayFilters",!1)("displayModerationBlock",!1)("loadUserVideoPreferences",!1)("groupByDate",!0)("disabled",n.disabled)("headerActions",n.actions)},directives:[y.d],encapsulation:2}),i})();const H=[{path:"",component:(()=>{class i{}return i.\u0275fac=function(e){return new(e||i)},i.\u0275cmp=t.Xpm({type:i,selectors:[["ng-component"]],decls:1,vars:0,template:function(e,n){1&e&&t._UZ(0,"router-outlet")},directives:[g.lC],encapsulation:2}),i})(),children:[{path:"overview",component:W,data:{meta:{title:"Videos entdecken"}}},{path:"most-liked",redirectTo:"trending?sort=most-liked"},{matcher:i=>1===i.length&&["recently-added","trending","local"].includes(i[0].path)?{consumed:i,posParams:{page:new g.bq(i[0].path,{})}}:null,component:G,data:{reuse:{enabled:!0,key:"videos-list"}}},{path:"subscriptions",canActivate:[c.ie],component:X,data:{meta:{title:"Abos"},reuse:{enabled:!0,key:"subscription-videos-list"}}}]}];let q=(()=>{class i{}return i.\u0275fac=function(e){return new(e||i)},i.\u0275mod=t.oAB({type:i}),i.\u0275inj=t.cJS({imports:[[g.Bz.forChild(H)],g.Bz]}),i})(),tt=(()=>{class i{}return i.\u0275fac=function(e){return new(e||i)},i.\u0275mod=t.oAB({type:i}),i.\u0275inj=t.cJS({providers:[d],imports:[[q,u.nC,b.hA,T.F5,v.yC,S.Y,V.v]]}),i})()}}]);