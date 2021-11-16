"use strict";(self.webpackChunkpeertube_client=self.webpackChunkpeertube_client||[]).push([[592],{35851:m=>{function c(i){if("string"!=typeof i)throw new TypeError("Path must be a string. Received "+JSON.stringify(i))}function l(i,t){for(var r,e="",o=0,_=-1,s=0,a=0;a<=i.length;++a){if(a<i.length)r=i.charCodeAt(a);else{if(47===r)break;r=47}if(47===r){if(_!==a-1&&1!==s)if(_!==a-1&&2===s){if(e.length<2||2!==o||46!==e.charCodeAt(e.length-1)||46!==e.charCodeAt(e.length-2))if(e.length>2){var u=e.lastIndexOf("/");if(u!==e.length-1){-1===u?(e="",o=0):o=(e=e.slice(0,u)).length-1-e.lastIndexOf("/"),_=a,s=0;continue}}else if(2===e.length||1===e.length){e="",o=0,_=a,s=0;continue}t&&(e.length>0?e+="/..":e="..",o=2)}else e.length>0?e+="/"+i.slice(_+1,a):e=i.slice(_+1,a),o=a-_-1;_=a,s=0}else 46===r&&-1!==s?++s:s=-1}return e}var g={resolve:function(){for(var o,t="",e=!1,_=arguments.length-1;_>=-1&&!e;_--){var s;_>=0?s=arguments[_]:(void 0===o&&(o=process.cwd()),s=o),c(s),0!==s.length&&(t=s+"/"+t,e=47===s.charCodeAt(0))}return t=l(t,!e),e?t.length>0?"/"+t:"/":t.length>0?t:"."},normalize:function(t){if(c(t),0===t.length)return".";var e=47===t.charCodeAt(0),o=47===t.charCodeAt(t.length-1);return 0===(t=l(t,!e)).length&&!e&&(t="."),t.length>0&&o&&(t+="/"),e?"/"+t:t},isAbsolute:function(t){return c(t),t.length>0&&47===t.charCodeAt(0)},join:function(){if(0===arguments.length)return".";for(var t,e=0;e<arguments.length;++e){var o=arguments[e];c(o),o.length>0&&(void 0===t?t=o:t+="/"+o)}return void 0===t?".":g.normalize(t)},relative:function(t,e){if(c(t),c(e),t===e||(t=g.resolve(t))===(e=g.resolve(e)))return"";for(var o=1;o<t.length&&47===t.charCodeAt(o);++o);for(var _=t.length,s=_-o,r=1;r<e.length&&47===e.charCodeAt(r);++r);for(var u=e.length-r,f=s<u?s:u,S=-1,d=0;d<=f;++d){if(d===f){if(u>f){if(47===e.charCodeAt(r+d))return e.slice(r+d+1);if(0===d)return e.slice(r+d)}else s>f&&(47===t.charCodeAt(o+d)?S=d:0===d&&(S=0));break}var h=t.charCodeAt(o+d);if(h!==e.charCodeAt(r+d))break;47===h&&(S=d)}var F="";for(d=o+S+1;d<=_;++d)(d===_||47===t.charCodeAt(d))&&(F+=0===F.length?"..":"/..");return F.length>0?F+e.slice(r+S):(47===e.charCodeAt(r+=S)&&++r,e.slice(r))},_makeLong:function(t){return t},dirname:function(t){if(c(t),0===t.length)return".";for(var e=t.charCodeAt(0),o=47===e,_=-1,s=!0,r=t.length-1;r>=1;--r)if(47===(e=t.charCodeAt(r))){if(!s){_=r;break}}else s=!1;return-1===_?o?"/":".":o&&1===_?"//":t.slice(0,_)},basename:function(t,e){if(void 0!==e&&"string"!=typeof e)throw new TypeError('"ext" argument must be a string');c(t);var r,o=0,_=-1,s=!0;if(void 0!==e&&e.length>0&&e.length<=t.length){if(e.length===t.length&&e===t)return"";var a=e.length-1,u=-1;for(r=t.length-1;r>=0;--r){var f=t.charCodeAt(r);if(47===f){if(!s){o=r+1;break}}else-1===u&&(s=!1,u=r+1),a>=0&&(f===e.charCodeAt(a)?-1==--a&&(_=r):(a=-1,_=u))}return o===_?_=u:-1===_&&(_=t.length),t.slice(o,_)}for(r=t.length-1;r>=0;--r)if(47===t.charCodeAt(r)){if(!s){o=r+1;break}}else-1===_&&(s=!1,_=r+1);return-1===_?"":t.slice(o,_)},extname:function(t){c(t);for(var e=-1,o=0,_=-1,s=!0,r=0,a=t.length-1;a>=0;--a){var u=t.charCodeAt(a);if(47!==u)-1===_&&(s=!1,_=a+1),46===u?-1===e?e=a:1!==r&&(r=1):-1!==e&&(r=-1);else if(!s){o=a+1;break}}return-1===e||-1===_||0===r||1===r&&e===_-1&&e===o+1?"":t.slice(e,_)},format:function(t){if(null===t||"object"!=typeof t)throw new TypeError('The "pathObject" argument must be of type Object. Received type '+typeof t);return function(i,t){var e=t.dir||t.root,o=t.base||(t.name||"")+(t.ext||"");return e?e===t.root?e+o:e+"/"+o:o}(0,t)},parse:function(t){c(t);var e={root:"",dir:"",base:"",ext:"",name:""};if(0===t.length)return e;var s,o=t.charCodeAt(0),_=47===o;_?(e.root="/",s=1):s=0;for(var r=-1,a=0,u=-1,f=!0,S=t.length-1,d=0;S>=s;--S)if(47!==(o=t.charCodeAt(S)))-1===u&&(f=!1,u=S+1),46===o?-1===r?r=S:1!==d&&(d=1):-1!==r&&(d=-1);else if(!f){a=S+1;break}return-1===r||-1===u||0===d||1===d&&r===u-1&&r===a+1?-1!==u&&(e.base=e.name=t.slice(0===a&&_?1:a,u)):(0===a&&_?(e.name=t.slice(1,r),e.base=t.slice(1,u)):(e.name=t.slice(a,r),e.base=t.slice(a,u)),e.ext=t.slice(r,u)),a>0?e.dir=t.slice(0,a-1):_&&(e.dir="/"),e},sep:"/",delimiter:":",win32:null,posix:null};g.posix=g,m.exports=g},86658:(m,c,l)=>{l.d(c,{X:()=>e});var n=l(62026),g=l(84167),i=l(97694),t=l(42741);let e=(()=>{class o{}return o.\u0275fac=function(s){return new(s||o)},o.\u0275mod=t.oAB({type:o}),o.\u0275inj=t.cJS({providers:[],imports:[[n.nC,g.hA,i.Y],n.nC,g.hA,i.Y]}),o})()},79146:(m,c,l)=>{l.d(c,{Q:()=>e});var n=l(42741),g=l(16274),i=l(49393);function t(o,_){if(1&o&&(n.TgZ(0,"div",6),n.TgZ(1,"p"),n._uU(2),n.qZA(),n.TgZ(3,"p"),n.tHW(4,7),n._UZ(5,"a",8),n.N_p(),n.qZA(),n.TgZ(6,"p"),n.tHW(7,9),n._UZ(8,"strong"),n._UZ(9,"a",10),n._UZ(10,"strong"),n._UZ(11,"strong"),n.N_p(),n.qZA(),n.qZA()),2&o){const s=n.oxw();n.xp6(2),n.Oqu(s.message)}}let e=(()=>{class o{}return o.\u0275fac=function(s){return new(s||o)},o.\u0275cmp=n.Xpm({type:o,selectors:[["my-signup-success"]],inputs:{message:"message"},decls:6,vars:1,consts:function(){let _,s,r;return _="Welcome to PeerTube!",s="If you need help to use PeerTube, you can have a look at the \n          " + "\ufffd#5\ufffd" + "documentation\n          " + "\ufffd/#5\ufffd" + ". \n        ",r=" To help moderators and other users to know " + "[\ufffd#8\ufffd|\ufffd#10\ufffd|\ufffd#11\ufffd]" + "who you are" + "[\ufffd/#8\ufffd|\ufffd/#10\ufffd|\ufffd/#11\ufffd]" + ", don't forget to " + "\ufffd#9\ufffd" + "set up your account profile" + "\ufffd/#9\ufffd" + " by adding an " + "[\ufffd#8\ufffd|\ufffd#10\ufffd|\ufffd#11\ufffd]" + "avatar" + "[\ufffd/#8\ufffd|\ufffd/#10\ufffd|\ufffd/#11\ufffd]" + " and a " + "[\ufffd#8\ufffd|\ufffd#10\ufffd|\ufffd#11\ufffd]" + "description" + "[\ufffd/#8\ufffd|\ufffd/#10\ufffd|\ufffd/#11\ufffd]" + ". ",r=n.Zx4(r),[["version","1.1","xmlns","http://www.w3.org/2000/svg","viewBox","0 0 130.2 130.2"],["fill","none","stroke","#73AF55","stroke-width","6","stroke-miterlimit","10","cx","65.1","cy","65.1","r","62.1",1,"path","circle"],["fill","none","stroke","#73AF55","stroke-width","6","stroke-linecap","round","stroke-miterlimit","10","points","100.2,40.2 51.5,88.8 29.8,67.5 ",1,"path","check"],[1,"bottom-message"],_,["class","alert alert-success",4,"ngIf"],[1,"alert","alert-success"],s,["href","https://docs.joinpeertube.org/use-setup-account","target","_blank","rel","noopener noreferrer"],r,["routerLink","/my-account/settings"]]},template:function(s,r){1&s&&(n.O4$(),n.TgZ(0,"svg",0),n._UZ(1,"circle",1),n._UZ(2,"polyline",2),n.qZA(),n.kcU(),n.TgZ(3,"p",3),n.SDv(4,4),n.qZA(),n.YNc(5,t,12,1,"div",5)),2&s&&(n.xp6(5),n.Q6J("ngIf",r.message))},directives:[g.O5,i.yS],styles:["svg[_ngcontent-%COMP%]{width:100px;display:block;margin:40px auto 0}.path[_ngcontent-%COMP%]{stroke-dasharray:1000;stroke-dashoffset:0}.path.circle[_ngcontent-%COMP%]{animation:dash .9s ease-in-out}.path.line[_ngcontent-%COMP%]{stroke-dashoffset:1000;animation:dash .9s .35s ease-in-out forwards}.path.check[_ngcontent-%COMP%]{stroke-dashoffset:-100;animation:dash-check .9s .35s ease-in-out forwards}.bottom-message[_ngcontent-%COMP%]{text-align:center;margin:20px 0 60px;font-size:1.25em;color:#73af55}.alert[_ngcontent-%COMP%]{font-size:15px;text-align:center}@keyframes dash{0%{stroke-dashoffset:1000}to{stroke-dashoffset:0}}@keyframes dash-check{0%{stroke-dashoffset:-100}to{stroke-dashoffset:900}}"]}),o})()},96867:(m,c,l)=>{l.d(c,{BX:()=>i,nP:()=>t,UD:()=>e,rE:()=>o});var n=l(93324);const i={VALIDATORS:l(44560).FC.VALIDATORS,MESSAGES:{required:"Nimi vaaditaan.",minlength:"Name must be at least 1 character long.",maxlength:"Name cannot be more than 50 characters long.",pattern:"Name should be lowercase alphanumeric; dots and underscores are allowed."}},t={VALIDATORS:[n.kI.required,n.kI.minLength(1),n.kI.maxLength(50)],MESSAGES:{required:"N\xE4ytt\xF6nimi vaaditaan.",minlength:"N\xE4ytt\xF6nimess\xE4 pit\xE4\xE4 olla ainakin yksi kirjain.",maxlength:"N\xE4ytt\xF6nimi ei voi olla 50 kirjainta pidempi."}},e={VALIDATORS:[n.kI.minLength(3),n.kI.maxLength(1e3)],MESSAGES:{minlength:"Kuvauksen pit\xE4\xE4 olla v\xE4hint\xE4\xE4n kolme kirjainta pitk\xE4.",maxlength:"Kuvaus ei voi olla 1000 kirjainta pidempi."}},o={VALIDATORS:[n.kI.minLength(3),n.kI.maxLength(1e3)],MESSAGES:{minlength:"Support text must be at least 3 characters long.",maxlength:"Support text cannot be more than 1000 characters long"}}},32724:(m,c,l)=>{l.d(c,{U:()=>g});var n=l(42741);let g=(()=>{class i{constructor(e){this.host=e}ngAfterViewInit(){this.host.nativeElement.focus()}}return i.\u0275fac=function(e){return new(e||i)(n.Y36(n.SBq))},i.\u0275dir=n.lG2({type:i,selectors:[["","myAutofocus",""]]}),i})()},95619:(m,c,l)=>{l.d(c,{w:()=>g});var n=l(42741);let g=(()=>{class i{transform(e){const o=Math.floor(e/3600),_=Math.floor(e%3600/60),s=e%60;if(o>0){let r="" + o + "h";return 0!==_&&(r+=" "+"" + _ + "min"),0!==s&&(r+=" "+"" + s + "sec"),r}if(_>0){let r="" + _ + "min";return 0!==s&&(r+=` ${s}sec`),r}return "\n          " + s + " sec\n        "}}return i.\u0275fac=function(e){return new(e||i)},i.\u0275pipe=n.Yjl({name:"myDurationFormatter",type:i,pure:!0}),i})()},67861:(m,c,l)=>{l.d(c,{a:()=>o}),l(11132);var g=l(84167),i=l(97694),t=l(13010),e=l(42741);let o=(()=>{class _{}return _.\u0275fac=function(r){return new(r||_)},_.\u0275mod=e.oAB({type:_}),_.\u0275inj=e.cJS({providers:[],imports:[[t.n,g.hA,i.Y]]}),_})()},11132:(m,c,l)=>{l.d(c,{N:()=>_});var n=l(42741),g=l(54755),i=l(76476),t=l(19895);const e=["modal"];function o(s,r){if(1&s){const a=n.EpF();n.TgZ(0,"div",1),n.TgZ(1,"h4",2),n.SDv(2,3),n.qZA(),n.TgZ(3,"my-global-icon",4),n.NdJ("click",function(){return n.CHM(a).close()}),n.qZA(),n.qZA(),n._UZ(4,"div",5),n.TgZ(5,"div",6),n.TgZ(6,"input",7),n.NdJ("click",function(){return n.CHM(a).close()})("key.enter",function(){return n.CHM(a).close()}),n.qZA(),n.qZA()}if(2&s){const a=n.oxw();n.xp6(2),n.pQV(a.displayName),n.QtT(2),n.xp6(2),n.Q6J("innerHTML",a.htmlSupport,n.oJD)}}let _=(()=>{class s{constructor(a,u){this.markdownService=a,this.modalService=u,this.video=null,this.videoChannel=null,this.htmlSupport="",this.displayName=""}show(){var a;const u=this.modalService.open(this.modal,{centered:!0}),f=(null===(a=this.video)||void 0===a?void 0:a.support)||this.videoChannel.support;return this.markdownService.enhancedMarkdownToHTML(f).then(S=>{this.htmlSupport=S}),this.displayName=this.video?this.video.channel.displayName:this.videoChannel.displayName,u}}return s.\u0275fac=function(a){return new(a||s)(n.Y36(g.Zy),n.Y36(i.FF))},s.\u0275cmp=n.Xpm({type:s,selectors:[["my-support-modal"]],viewQuery:function(a,u){if(1&a&&n.Gf(e,7),2&a){let f;n.iGM(f=n.CRH())&&(u.modal=f.first)}},inputs:{video:"video",videoChannel:"videoChannel"},decls:2,vars:0,consts:function(){let r,a;return r="Support " + "\ufffd0\ufffd" + "",a="Maybe later",[["modal",""],[1,"modal-header"],[1,"modal-title"],r,["iconName","cross","aria-label","Close","role","button",3,"click"],[1,"modal-body",3,"innerHTML"],[1,"modal-footer","inputs"],["type","button","role","button","value",a,1,"peertube-button","grey-button",3,"click","key.enter"]]},template:function(a,u){1&a&&n.YNc(0,o,7,2,"ng-template",null,0,n.W1O)},directives:[t.$],encapsulation:2}),s})()},83832:(m,c,l)=>{l.r(c),l.d(c,{NOOP:()=>n});const n=0},49899:(m,c,l)=>{m.exports=l(35851)},96938:m=>{m.exports=JSON.parse('{"grinning":"\u{1f600}","smiley":"\u{1f603}","smile":"\u{1f604}","grin":"\u{1f601}","laughing":"\u{1f606}","satisfied":"\u{1f606}","sweat_smile":"\u{1f605}","joy":"\u{1f602}","wink":"\u{1f609}","blush":"\u{1f60a}","innocent":"\u{1f607}","heart_eyes":"\u{1f60d}","kissing_heart":"\u{1f618}","kissing":"\u{1f617}","kissing_closed_eyes":"\u{1f61a}","kissing_smiling_eyes":"\u{1f619}","yum":"\u{1f60b}","stuck_out_tongue":"\u{1f61b}","stuck_out_tongue_winking_eye":"\u{1f61c}","stuck_out_tongue_closed_eyes":"\u{1f61d}","neutral_face":"\u{1f610}","expressionless":"\u{1f611}","no_mouth":"\u{1f636}","smirk":"\u{1f60f}","unamused":"\u{1f612}","relieved":"\u{1f60c}","pensive":"\u{1f614}","sleepy":"\u{1f62a}","sleeping":"\u{1f634}","mask":"\u{1f637}","dizzy_face":"\u{1f635}","sunglasses":"\u{1f60e}","confused":"\u{1f615}","worried":"\u{1f61f}","open_mouth":"\u{1f62e}","hushed":"\u{1f62f}","astonished":"\u{1f632}","flushed":"\u{1f633}","frowning":"\u{1f626}","anguished":"\u{1f627}","fearful":"\u{1f628}","cold_sweat":"\u{1f630}","disappointed_relieved":"\u{1f625}","cry":"\u{1f622}","sob":"\u{1f62d}","scream":"\u{1f631}","confounded":"\u{1f616}","persevere":"\u{1f623}","disappointed":"\u{1f61e}","sweat":"\u{1f613}","weary":"\u{1f629}","tired_face":"\u{1f62b}","rage":"\u{1f621}","pout":"\u{1f621}","angry":"\u{1f620}","smiling_imp":"\u{1f608}","smiley_cat":"\u{1f63a}","smile_cat":"\u{1f638}","joy_cat":"\u{1f639}","heart_eyes_cat":"\u{1f63b}","smirk_cat":"\u{1f63c}","kissing_cat":"\u{1f63d}","scream_cat":"\u{1f640}","crying_cat_face":"\u{1f63f}","pouting_cat":"\u{1f63e}","heart":"\u2764\ufe0f","hand":"\u270b","raised_hand":"\u270b","v":"\u270c\ufe0f","point_up":"\u261d\ufe0f","fist_raised":"\u270a","fist":"\u270a","monkey_face":"\u{1f435}","cat":"\u{1f431}","cow":"\u{1f42e}","mouse":"\u{1f42d}","coffee":"\u2615","hotsprings":"\u2668\ufe0f","anchor":"\u2693","airplane":"\u2708\ufe0f","hourglass":"\u231b","watch":"\u231a","sunny":"\u2600\ufe0f","star":"\u2b50","cloud":"\u2601\ufe0f","umbrella":"\u2614","zap":"\u26a1","snowflake":"\u2744\ufe0f","sparkles":"\u2728","black_joker":"\u{1f0cf}","mahjong":"\u{1f004}","phone":"\u260e\ufe0f","telephone":"\u260e\ufe0f","envelope":"\u2709\ufe0f","pencil2":"\u270f\ufe0f","black_nib":"\u2712\ufe0f","scissors":"\u2702\ufe0f","wheelchair":"\u267f","warning":"\u26a0\ufe0f","aries":"\u2648","taurus":"\u2649","gemini":"\u264a","cancer":"\u264b","leo":"\u264c","virgo":"\u264d","libra":"\u264e","scorpius":"\u264f","sagittarius":"\u2650","capricorn":"\u2651","aquarius":"\u2652","pisces":"\u2653","heavy_multiplication_x":"\u2716\ufe0f","heavy_plus_sign":"\u2795","heavy_minus_sign":"\u2796","heavy_division_sign":"\u2797","bangbang":"\u203c\ufe0f","interrobang":"\u2049\ufe0f","question":"\u2753","grey_question":"\u2754","grey_exclamation":"\u2755","exclamation":"\u2757","heavy_exclamation_mark":"\u2757","wavy_dash":"\u3030\ufe0f","recycle":"\u267b\ufe0f","white_check_mark":"\u2705","ballot_box_with_check":"\u2611\ufe0f","heavy_check_mark":"\u2714\ufe0f","x":"\u274c","negative_squared_cross_mark":"\u274e","curly_loop":"\u27b0","loop":"\u27bf","part_alternation_mark":"\u303d\ufe0f","eight_spoked_asterisk":"\u2733\ufe0f","eight_pointed_black_star":"\u2734\ufe0f","sparkle":"\u2747\ufe0f","copyright":"\xa9\ufe0f","registered":"\xae\ufe0f","tm":"\u2122\ufe0f","information_source":"\u2139\ufe0f","m":"\u24c2\ufe0f","black_circle":"\u26ab","white_circle":"\u26aa","black_large_square":"\u2b1b","white_large_square":"\u2b1c","black_medium_square":"\u25fc\ufe0f","white_medium_square":"\u25fb\ufe0f","black_medium_small_square":"\u25fe","white_medium_small_square":"\u25fd","black_small_square":"\u25aa\ufe0f","white_small_square":"\u25ab\ufe0f"}')}}]);