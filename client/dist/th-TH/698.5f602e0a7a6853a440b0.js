"use strict";(self.webpackChunkpeertube_client=self.webpackChunkpeertube_client||[]).push([[698],{67698:(I,P,i)=>{i.r(P),i.d(P,{VideoUpdateModule:()=>T});var l=i(54755),v=i(81346),s=i(49393),g=i(36371),p=i(29230),u=i(72754),M=i(84167),d=i(62026),b=(i(359),i(45574)),e=i(42741),f=i(59849),h=i(22557),_=i(93324),y=i(70006),x=i(64990);let V=(()=>{class o extends M.OI{constructor(n,t,r,c,C,O,R,A){super(),this.formValidatorService=n,this.route=t,this.router=r,this.notifier=c,this.videoService=C,this.loadingBar=O,this.videoCaptionService=R,this.liveVideoService=A,this.userVideoChannels=[],this.videoCaptions=[],this.isUpdatingVideo=!1,this.schedulePublicationPossible=!1,this.waitTranscodingEnabled=!0,this.updateDone=!1}ngOnInit(){this.buildForm({}),this.route.data.pipe((0,p.U)(n=>n.videoData)).subscribe({next:({video:n,videoChannels:t,videoCaptions:r,liveVideo:c})=>{this.video=new d.fc(n),this.videoDetails=n,this.userVideoChannels=t,this.videoCaptions=r,this.liveVideo=c,this.schedulePublicationPossible=3===this.video.privacy,setTimeout(()=>{(0,b.X)(this.form,this.video,!0),this.liveVideo&&this.form.patchValue({saveReplay:this.liveVideo.saveReplay,permanentLive:this.liveVideo.permanentLive})})},error:n=>{console.error(n),this.notifier.error(n.message)}})}onUnload(n){const{text:t,canDeactivate:r}=this.canDeactivate();if(!r)return n.returnValue=t,t}canDeactivate(){if(!0===this.updateDone)return{canDeactivate:!0};const n="\u0E04\u0E38\u0E13\u0E21\u0E35\u0E01\u0E32\u0E23\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E41\u0E1B\u0E25\u0E07\u0E17\u0E35\u0E48\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01 \u0E16\u0E49\u0E32\u0E04\u0E38\u0E13\u0E2D\u0E2D\u0E01\u0E08\u0E32\u0E01\u0E2B\u0E19\u0E49\u0E32\u0E19\u0E35\u0E49 \u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E08\u0E30\u0E2B\u0E32\u0E22\u0E44\u0E1B";for(const t of this.videoCaptions)if(t.action)return{canDeactivate:!1,text:n};return{canDeactivate:!1===this.formChanged,text:n}}checkForm(){return this.forceCheck(),this.form.valid}isWaitTranscodingEnabled(){return!(this.videoDetails.getFiles().length>1||this.liveVideo&&!0!==this.form.value.saveReplay)}update(){!1===this.checkForm()||!0===this.isUpdatingVideo||(this.video.patch(this.form.value),this.loadingBar.useRef().start(),this.isUpdatingVideo=!0,this.videoService.updateVideo(this.video).pipe((0,u.w)(()=>this.videoCaptionService.updateCaptions(this.video.id,this.videoCaptions)),(0,u.w)(()=>{if(!this.liveVideo)return(0,g.of)(void 0);const n={saveReplay:!!this.form.value.saveReplay,permanentLive:!!this.form.value.permanentLive};return Object.keys(n).some(r=>this.liveVideo[r]!==n[r])?this.liveVideoService.updateLive(this.video.id,n):(0,g.of)(void 0)})).subscribe({next:()=>{this.updateDone=!0,this.isUpdatingVideo=!1,this.loadingBar.useRef().complete(),this.notifier.success("\u0E2D\u0E31\u0E1B\u0E40\u0E14\u0E15\u0E27\u0E34\u0E14\u0E35\u0E42\u0E2D\u0E41\u0E25\u0E49\u0E27"),this.router.navigateByUrl(d.nk.buildWatchUrl(this.video))},error:n=>{this.loadingBar.useRef().complete(),this.isUpdatingVideo=!1,this.notifier.error(n.message),console.error(n)}}))}hydratePluginFieldsFromVideo(){!this.video.pluginData||this.form.patchValue({pluginData:this.video.pluginData})}getVideoUrl(){return d.nk.buildWatchUrl(this.videoDetails)}}return o.\u0275fac=function(n){return new(n||o)(e.Y36(M.Q4),e.Y36(s.gz),e.Y36(s.F0),e.Y36(l.d4),e.Y36(d.kI),e.Y36(f.dL),e.Y36(d.iW),e.Y36(h.CS))},o.\u0275cmp=e.Xpm({type:o,selectors:[["my-videos-update"]],hostBindings:function(n,t){1&n&&e.NdJ("beforeunload",function(c){return t.onUnload(c)},!1,e.Jf7)},features:[e.qOj],decls:10,vars:13,consts:function(){let a,n;return a="\u0E2D\u0E31\u0E1B\u0E40\u0E14\u0E15",n="\u0E2D\u0E31\u0E1B\u0E40\u0E14\u0E15",[[1,"margin-content"],[1,"title-page","title-page-single"],[1,"mr-1"],a,[3,"routerLink"],["novalidate","",3,"formGroup"],["type","update",3,"form","formErrors","schedulePublicationPossible","validationMessages","userVideoChannels","videoCaptions","waitTranscodingEnabled","liveVideo","videoToUpdate","pluginFieldsAdded"],[1,"submit-container"],["className","orange-button","label",n,"icon","circle-tick",3,"disabled","click","keydown.enter"]]},template:function(n,t){1&n&&(e.TgZ(0,"div",0),e.TgZ(1,"div",1),e.TgZ(2,"span",2),e.SDv(3,3),e.qZA(),e.TgZ(4,"a",4),e._uU(5),e.qZA(),e.qZA(),e.TgZ(6,"form",5),e.TgZ(7,"my-video-edit",6),e.NdJ("pluginFieldsAdded",function(){return t.hydratePluginFieldsFromVideo()}),e.qZA(),e.TgZ(8,"div",7),e.TgZ(9,"my-button",8),e.NdJ("click",function(){return t.update()})("keydown.enter",function(){return t.update()}),e.qZA(),e.qZA(),e.qZA(),e.qZA()),2&n&&(e.xp6(4),e.Q6J("routerLink",t.getVideoUrl()),e.xp6(1),e.Oqu(null==t.video?null:t.video.name),e.xp6(1),e.Q6J("formGroup",t.form),e.xp6(1),e.Q6J("form",t.form)("formErrors",t.formErrors)("schedulePublicationPossible",t.schedulePublicationPossible)("validationMessages",t.validationMessages)("userVideoChannels",t.userVideoChannels)("videoCaptions",t.videoCaptions)("waitTranscodingEnabled",t.isWaitTranscodingEnabled())("liveVideo",t.liveVideo)("videoToUpdate",t.videoDetails),e.xp6(2),e.Q6J("disabled",!t.form.valid||!0===t.isUpdatingVideo))},directives:[s.yS,_._Y,_.JL,_.sg,y.T,x.r],styles:['label[_ngcontent-%COMP%], my-dynamic-form-field[_ngcontent-%COMP%]     label{font-weight:400;font-size:100%}.peertube-select-container[_ngcontent-%COMP%]{padding:0;margin:0;width:auto;border-radius:3px;color:var(--inputForegroundColor);background:var(--inputBackgroundColor);position:relative;font-size:15px}.peertube-select-container.disabled[_ngcontent-%COMP%]{background-color:#e5e5e5}.peertube-select-container.disabled[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]{cursor:default}@media screen and (max-width: auto){.peertube-select-container[_ngcontent-%COMP%]{width:100%}}.peertube-select-container[_ngcontent-%COMP%]:after{top:50%;right:calc(0% + 15px);content:" ";height:0;width:0;position:absolute;pointer-events:none;border:5px solid rgba(0,0,0,0);border-top-color:#000;margin-top:-2px;z-index:100}.peertube-select-container[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]{padding:0 35px 0 12px;position:relative;border:1px solid #C6C6C6;background:transparent none;-webkit-appearance:none;-moz-appearance:none;appearance:none;cursor:pointer;height:30px;text-overflow:ellipsis;color:var(--mainForegroundColor)}.peertube-select-container[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]:focus{outline:none}.peertube-select-container[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]:-moz-focusring{color:transparent;text-shadow:0 0 0 #000}.peertube-select-container[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]   option[_ngcontent-%COMP%]{color:#000}.peertube-select-container.peertube-select-button[_ngcontent-%COMP%]{background-color:#e5e5e5;color:var(--greyForegroundColor)}.peertube-select-container.peertube-select-button[_ngcontent-%COMP%]:focus, .peertube-select-container.peertube-select-button.focus-visible[_ngcontent-%COMP%]{box-shadow:0 0 0 .2rem #5858580d}.peertube-select-container.peertube-select-button[_ngcontent-%COMP%]:hover, .peertube-select-container.peertube-select-button[_ngcontent-%COMP%]:active, .peertube-select-container.peertube-select-button[_ngcontent-%COMP%]:focus, .peertube-select-container.peertube-select-button[disabled][_ngcontent-%COMP%], .peertube-select-container.peertube-select-button.disabled[_ngcontent-%COMP%]{color:var(--greyForegroundColor);background-color:#efefef}.peertube-select-container.peertube-select-button[disabled][_ngcontent-%COMP%], .peertube-select-container.peertube-select-button.disabled[_ngcontent-%COMP%]{cursor:default}.peertube-select-container.peertube-select-button[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .feather, .peertube-select-container.peertube-select-button[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .material, .peertube-select-container.peertube-select-button[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .misc{color:var(--greyForegroundColor)}.peertube-select-container.peertube-select-button[_ngcontent-%COMP%]   select[_ngcontent-%COMP%], .peertube-select-container.peertube-select-button[_ngcontent-%COMP%]   option[_ngcontent-%COMP%]{font-weight:600;color:var(--greyForegroundColor);border:0}.title-page[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{color:var(--mainForegroundColor)}.title-page[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover{text-decoration:none;opacity:.8}my-peertube-checkbox[_ngcontent-%COMP%]{display:block;margin-bottom:1rem}.nav-tabs[_ngcontent-%COMP%]{margin-bottom:15px}.video-edit[_ngcontent-%COMP%]{height:100%;min-height:300px}.video-edit[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%]{margin-bottom:25px}.video-edit[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]{padding:0 15px;display:inline-block;height:30px;width:100%;color:var(--inputForegroundColor);background-color:var(--inputBackgroundColor);border:1px solid #C6C6C6;border-radius:3px;font-size:15px;display:block}.video-edit[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]::placeholder{color:var(--inputPlaceholderColor)}.video-edit[_ngcontent-%COMP%]   input[readonly][_ngcontent-%COMP%]{opacity:.7}@media screen and (max-width: calc(100% + 40px)){.video-edit[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]{width:100%}}.video-edit[_ngcontent-%COMP%]   .label-tags[_ngcontent-%COMP%] + span[_ngcontent-%COMP%]{font-size:15px}.video-edit[_ngcontent-%COMP%]   .advanced-settings[_ngcontent-%COMP%]   .form-group[_ngcontent-%COMP%]{margin-bottom:20px}.captions-header[_ngcontent-%COMP%]{text-align:end;margin-bottom:1rem}.create-caption[_ngcontent-%COMP%]{padding-top:0;padding-bottom:0;border:0;font-weight:600;font-size:15px;height:30px;line-height:30px;border-radius:3px!important;text-align:center;cursor:pointer;display:inline-block;display:inline-flex;align-items:center;line-height:normal!important}.create-caption[_ngcontent-%COMP%]:hover, .create-caption[_ngcontent-%COMP%]:focus, .create-caption[_ngcontent-%COMP%]:active{text-decoration:none!important;outline:none!important}@supports (padding-inline-start: 13px){.create-caption[_ngcontent-%COMP%]{padding-inline-start:13px}}@supports not (padding-inline-start: 13px){.create-caption[_ngcontent-%COMP%]{padding-left:13px}}@supports (padding-inline-end: 17px){.create-caption[_ngcontent-%COMP%]{padding-inline-end:17px}}@supports not (padding-inline-end: 17px){.create-caption[_ngcontent-%COMP%]{padding-right:17px}}.create-caption[_ngcontent-%COMP%]:focus, .create-caption.focus-visible[_ngcontent-%COMP%]{box-shadow:0 0 0 .2rem var(--mainColorLightest)}.create-caption[_ngcontent-%COMP%], .create-caption[_ngcontent-%COMP%]:active, .create-caption[_ngcontent-%COMP%]:focus{color:#fff;background-color:var(--mainColor)}.create-caption[_ngcontent-%COMP%]:hover{color:#fff;background-color:var(--mainHoverColor)}.create-caption[disabled][_ngcontent-%COMP%], .create-caption.disabled[_ngcontent-%COMP%]{cursor:default;color:#fff;background-color:#c6c6c6}.create-caption[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .feather, .create-caption[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .material, .create-caption[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .misc{color:#fff}.create-caption[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]{position:relative;width:20px;top:-1px}@supports (margin-inline-end: 5px){.create-caption[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]{margin-inline-end:5px}}@supports not (margin-inline-end: 5px){.create-caption[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]{margin-right:5px}}.caption-entry[_ngcontent-%COMP%]{display:flex;height:40px;align-items:center}.caption-entry[_ngcontent-%COMP%]   a.caption-entry-label[_ngcontent-%COMP%]{flex-grow:1;color:#000}.caption-entry[_ngcontent-%COMP%]   a.caption-entry-label[_ngcontent-%COMP%]:hover, .caption-entry[_ngcontent-%COMP%]   a.caption-entry-label[_ngcontent-%COMP%]:focus, .caption-entry[_ngcontent-%COMP%]   a.caption-entry-label[_ngcontent-%COMP%]:active{text-decoration:none!important;outline:none!important}.caption-entry[_ngcontent-%COMP%]   a.caption-entry-label[_ngcontent-%COMP%]:hover{opacity:.8}.caption-entry[_ngcontent-%COMP%]   .caption-entry-label[_ngcontent-%COMP%]{font-size:15px;font-weight:bold;width:150px}@supports (margin-inline-end: 20px){.caption-entry[_ngcontent-%COMP%]   .caption-entry-label[_ngcontent-%COMP%]{margin-inline-end:20px}}@supports not (margin-inline-end: 20px){.caption-entry[_ngcontent-%COMP%]   .caption-entry-label[_ngcontent-%COMP%]{margin-right:20px}}.caption-entry[_ngcontent-%COMP%]   .caption-entry-state[_ngcontent-%COMP%]{width:200px}.caption-entry[_ngcontent-%COMP%]   .caption-entry-state.caption-entry-state-create[_ngcontent-%COMP%]{color:#39cc0b}.caption-entry[_ngcontent-%COMP%]   .caption-entry-state.caption-entry-state-delete[_ngcontent-%COMP%]{color:red}.caption-entry[_ngcontent-%COMP%]   .caption-entry-delete[_ngcontent-%COMP%]{padding-top:0;padding-bottom:0;border:0;font-weight:600;font-size:15px;height:30px;line-height:30px;border-radius:3px!important;text-align:center;cursor:pointer;background-color:#e5e5e5;color:var(--greyForegroundColor)}@supports (padding-inline-start: 13px){.caption-entry[_ngcontent-%COMP%]   .caption-entry-delete[_ngcontent-%COMP%]{padding-inline-start:13px}}@supports not (padding-inline-start: 13px){.caption-entry[_ngcontent-%COMP%]   .caption-entry-delete[_ngcontent-%COMP%]{padding-left:13px}}@supports (padding-inline-end: 17px){.caption-entry[_ngcontent-%COMP%]   .caption-entry-delete[_ngcontent-%COMP%]{padding-inline-end:17px}}@supports not (padding-inline-end: 17px){.caption-entry[_ngcontent-%COMP%]   .caption-entry-delete[_ngcontent-%COMP%]{padding-right:17px}}.caption-entry[_ngcontent-%COMP%]   .caption-entry-delete[_ngcontent-%COMP%]:focus, .caption-entry[_ngcontent-%COMP%]   .caption-entry-delete.focus-visible[_ngcontent-%COMP%]{box-shadow:0 0 0 .2rem #5858580d}.caption-entry[_ngcontent-%COMP%]   .caption-entry-delete[_ngcontent-%COMP%]:hover, .caption-entry[_ngcontent-%COMP%]   .caption-entry-delete[_ngcontent-%COMP%]:active, .caption-entry[_ngcontent-%COMP%]   .caption-entry-delete[_ngcontent-%COMP%]:focus, .caption-entry[_ngcontent-%COMP%]   .caption-entry-delete[disabled][_ngcontent-%COMP%], .caption-entry[_ngcontent-%COMP%]   .caption-entry-delete.disabled[_ngcontent-%COMP%]{color:var(--greyForegroundColor);background-color:#efefef}.caption-entry[_ngcontent-%COMP%]   .caption-entry-delete[disabled][_ngcontent-%COMP%], .caption-entry[_ngcontent-%COMP%]   .caption-entry-delete.disabled[_ngcontent-%COMP%]{cursor:default}.caption-entry[_ngcontent-%COMP%]   .caption-entry-delete[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .feather, .caption-entry[_ngcontent-%COMP%]   .caption-entry-delete[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .material, .caption-entry[_ngcontent-%COMP%]   .caption-entry-delete[_ngcontent-%COMP%]   my-global-icon[_ngcontent-%COMP%]     .misc{color:var(--greyForegroundColor)}.no-caption[_ngcontent-%COMP%]{text-align:center;font-size:15px}.submit-container[_ngcontent-%COMP%]{text-align:end}.submit-container[_ngcontent-%COMP%]   .message-submit[_ngcontent-%COMP%]{display:inline-block;color:var(--greyForegroundColor);font-size:15px}@supports (margin-inline-end: 25px){.submit-container[_ngcontent-%COMP%]   .message-submit[_ngcontent-%COMP%]{margin-inline-end:25px}}@supports not (margin-inline-end: 25px){.submit-container[_ngcontent-%COMP%]   .message-submit[_ngcontent-%COMP%]{margin-right:25px}}p-calendar[_ngcontent-%COMP%]{display:block}p-calendar[_ngcontent-%COMP%]     .p-calendar{width:100%}p-calendar[_ngcontent-%COMP%]     .p-inputtext{padding:0 15px;display:inline-block;height:30px;width:100%;color:var(--inputForegroundColor);background-color:var(--inputBackgroundColor);border:1px solid #C6C6C6;border-radius:3px;font-size:15px;color:#000}p-calendar[_ngcontent-%COMP%]     .p-inputtext::placeholder{color:var(--inputPlaceholderColor)}p-calendar[_ngcontent-%COMP%]     .p-inputtext[readonly]{opacity:.7}@media screen and (max-width: calc(100% + 40px)){p-calendar[_ngcontent-%COMP%]     .p-inputtext{width:100%}}.form-columns[_ngcontent-%COMP%]{display:grid;grid-template-columns:66% 1fr;grid-gap:30px}@media screen and (max-width: 1040px){.main-col:not(.expanded)[_nghost-%COMP%]   .form-columns[_ngcontent-%COMP%], .main-col:not(.expanded)   [_nghost-%COMP%]   .form-columns[_ngcontent-%COMP%]{grid-template-columns:1fr}}@media screen and (max-width: 800px){.main-col.expanded[_nghost-%COMP%]   .form-columns[_ngcontent-%COMP%], .main-col.expanded   [_nghost-%COMP%]   .form-columns[_ngcontent-%COMP%]{grid-template-columns:1fr}}']}),o})();var E=i(19212),S=i(86804);let m=(()=>{class o{constructor(n,t,r,c){this.videoService=n,this.liveVideoService=t,this.authService=r,this.videoCaptionService=c}resolve(n){return this.videoService.getVideo({videoId:n.params.uuid}).pipe((0,u.w)(r=>(0,E.D)(this.buildVideoObservables(r))),(0,p.U)(([r,c,C,O])=>({video:r,videoChannels:c,videoCaptions:C,liveVideo:O})))}buildVideoObservables(n){return[this.videoService.loadCompleteDescription(n.descriptionPath).pipe((0,p.U)(t=>Object.assign(n,{description:t}))),(0,S.S8)(this.authService),this.videoCaptionService.listCaptions(n.id).pipe((0,p.U)(t=>t.data)),n.isLive?this.liveVideoService.getVideoLive(n.id):(0,g.of)(void 0)]}}return o.\u0275fac=function(n){return new(n||o)(e.LFG(d.kI),e.LFG(h.CS),e.LFG(l.e8),e.LFG(d.iW))},o.\u0275prov=e.Yz7({token:o,factory:o.\u0275fac}),o})();const D=[{path:"",component:V,canActivate:[l.ie],canDeactivate:[l.Ic],resolve:{videoData:m}}];let U=(()=>{class o{}return o.\u0275fac=function(n){return new(n||o)},o.\u0275mod=e.oAB({type:o}),o.\u0275inj=e.cJS({imports:[[s.Bz.forChild(D)],s.Bz]}),o})(),T=(()=>{class o{}return o.\u0275fac=function(n){return new(n||o)},o.\u0275mod=e.oAB({type:o}),o.\u0275inj=e.cJS({providers:[m,l.Ic],imports:[[U,v.w]]}),o})()}}]);