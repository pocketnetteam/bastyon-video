(()=>{var e={6038:function(e){e.exports=function(){"use strict";return function(){var e=Math.floor(1000001*Math.random()),t={};function n(e){return Array.isArray?Array.isArray(e):-1!=e.constructor.toString().indexOf("Array")}var i={},r=function(e){try{var n=JSON.parse(e.data);if("object"!=typeof n||null===n)throw"malformed"}catch(e){return}var r,o,s,a=e.source,d=e.origin;if("string"==typeof n.method){var c=n.method.split("::");2==c.length?(r=c[0],s=c[1]):s=n.method}if(void 0!==n.id&&(o=n.id),"string"==typeof s){var l=!1;if(t[d]&&t[d][r])for(var u=0;u<t[d][r].length;u++)if(t[d][r][u].win===a){t[d][r][u].handler(d,s,n),l=!0;break}if(!l&&t["*"]&&t["*"][r])for(u=0;u<t["*"][r].length;u++)if(t["*"][r][u].win===a){t["*"][r][u].handler(d,s,n);break}}else void 0!==o&&i[o]&&i[o](d,s,n)};return window.addEventListener?window.addEventListener("message",r,!1):window.attachEvent&&window.attachEvent("onmessage",r),{build:function(r){var o=function(e){if(r.debugOutput&&window.console&&window.console.log){try{"string"!=typeof e&&(e=JSON.stringify(e))}catch(e){}window.console.log("["+d+"] "+e)}};if(!window.postMessage)throw"jschannel cannot run this browser, no postMessage";if(!window.JSON||!window.JSON.stringify||!window.JSON.parse)throw"jschannel cannot run this browser, no JSON parsing/serialization";if("object"!=typeof r)throw"Channel build invoked without a proper object argument";if(!r.window||!r.window.postMessage)throw"Channel.build() called without a valid window argument";window===r.window&&o("target window is same as present window -- use at your own risk");var s,a=!1;if("string"==typeof r.origin&&("*"===r.origin?a=!0:null!==(s=r.origin.match(/^https?:\/\/(?:[-a-zA-Z0-9_\.])+(?::\d+)?/))&&(r.origin=s[0].toLowerCase(),a=!0)),!a)throw"Channel.build() called with an invalid origin";if(void 0!==r.scope){if("string"!=typeof r.scope)throw"scope, when specified, must be a string";if(r.scope.split("::").length>1)throw"scope may not contain double colons: '::'"}else r.scope="__default";var d=function(){for(var e="",t="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",n=0;n<5;n++)e+=t.charAt(Math.floor(Math.random()*t.length));return e}(),c={},l={},u={},h=!1,f=[],g=[],p=function(e,t,s){if("function"==typeof r.gotMessageObserver)try{r.gotMessageObserver(e,s)}catch(e){o("gotMessageObserver() raised an exception: "+e.toString())}if(s.id&&t){u[s.id]={};var a=function(e,t,n){var i=!1,r=!1;return{origin:t,invoke:function(t,i){if(!u[e])throw"attempting to invoke a callback of a nonexistent transaction: "+e;for(var r=!1,o=0;o<n.length;o++)if(t===n[o]){r=!0;break}if(!r)throw"request supports no such callback '"+t+"'";v({id:e,callback:t,params:i})},error:function(t,n){if(r=!0,!u[e])throw"error called for nonexistent message: "+e;delete u[e],v({id:e,error:t,message:n})},complete:function(t){if(r=!0,!u[e])throw"complete called for nonexistent message: "+e;delete u[e],v({id:e,result:t})},delayReturn:function(e){return"boolean"==typeof e&&(i=!0===e),i},completed:function(){return r}}}(s.id,e,s.callbacks?s.callbacks:[]);if(c[t])try{if(s.callbacks&&n(s.callbacks)&&s.callbacks.length>0)for(var d=0;d<s.callbacks.length;d++){for(var h=s.callbacks[d],f=s.params,g=h.split("/"),p=0;p<g.length-1;p++){var m=g[p];"object"!=typeof f[m]&&(f[m]={}),f=f[m]}f[g[g.length-1]]=function(){var e=h;return function(t){return a.invoke(e,t)}}()}var y=c[t](a,s.params);a.delayReturn()||a.completed()||a.complete(y)}catch(e){var w="runtime_error",b=null;if("string"==typeof e?b=e:"object"==typeof e&&(e instanceof Error?(w=e.constructor.name,b=e.message):e&&n(e)&&2==e.length?(w=e[0],b=e[1]):"string"==typeof e.error&&(w=e.error,e.message?"string"==typeof e.message?b=e.message:e=e.message:b="")),null===b)try{void 0===(b=JSON.stringify(e))&&(b=e.toString())}catch(t){b=e.toString()}a.error(w,b)}else a.error("method_not_found","No method '"+t+"' was (yet) bound by the provider")}else s.id&&s.callback?l[s.id]&&l[s.id].callbacks&&l[s.id].callbacks[s.callback]?l[s.id].callbacks[s.callback](s.params):o("ignoring invalid callback, id:"+s.id+" ("+s.callback+")"):s.id?l[s.id]?(s.error?l[s.id].error&&l[s.id].error(s.error,s.message):void 0!==s.result?l[s.id].success(s.result):l[s.id].success(),delete l[s.id],delete i[s.id]):o("ignoring invalid response: "+s.id):t&&c[t]&&c[t]({origin:e},s.params)};!function(e,n,i,r){function o(t){for(var n=0;n<t.length;n++)if(t[n].win===e)return!0;return!1}var s=!1;if("*"===n){for(var a in t)if(t.hasOwnProperty(a)&&"*"!==a&&"object"==typeof t[a][i]&&(s=o(t[a][i])))break}else t["*"]&&t["*"][i]&&(s=o(t["*"][i])),!s&&t[n]&&t[n][i]&&(s=o(t[n][i]));if(s)throw"A channel is already bound to the same window which overlaps with origin '"+n+"' and has scope '"+i+"'";"object"!=typeof t[n]&&(t[n]={}),"object"!=typeof t[n][i]&&(t[n][i]=[]),t[n][i].push({win:e,handler:r})}(r.window,r.origin,r.scope,p);var m=function(e){return[r.scope,e].join("::")},v=function(e,t){if(!e)throw"postMessage called with null message";if(t||h){if("function"==typeof r.postMessageObserver)try{r.postMessageObserver(r.origin,e)}catch(e){o("postMessageObserver() raised an exception: "+e.toString())}o("post message: "+JSON.stringify(e)+" with origin "+r.origin),r.window.postMessage(JSON.stringify(e),r.origin)}else o("queue message: "+JSON.stringify(e)),f.push(e)},y=function(e,t){var n;e=[].concat(e);for(var i=0;i<e.length;i++)t[n=e[i].toString()]=function(e){return function(t,n,i){n?w.call({method:e,params:t,success:n,error:i}):w.notify({method:e,params:t})}}(n)},w={remote:{},unbind:function(e,t){if(c[e]){if(!delete c[e])throw"can't delete method: "+e;return r.publish&&!t&&(h?w.notify({method:"__unbind",params:e}):g.push({action:"unbind",method:e})),!0}return!1},bind:function(e,t,n){if(!e||"string"!=typeof e)throw"'method' argument to bind must be string";if(!t||"function"!=typeof t)throw"callback missing from bind params";if(c[e])throw"method '"+e+"' is already bound!";return c[e]=t,r.publish&&!n&&(h?w.notify({method:"__bind",params:e}):g.push({action:"bind",method:e})),this},call:function(t){if(!t)throw"missing arguments to call function";if(!t.method||"string"!=typeof t.method)throw"'method' argument to call must be string";if(!t.success||"function"!=typeof t.success)throw"'success' callback missing from call";var n={},r=[],o=[],s=function(e,t){if(o.indexOf(t)>=0)throw"params cannot be a recursive data structure";if(t&&o.push(t),"object"==typeof t)for(var i in t)if(t.hasOwnProperty(i)){var a=e+(e.length?"/":"")+i;"function"==typeof t[i]?(n[a]=t[i],r.push(a),delete t[i]):"object"==typeof t[i]&&s(a,t[i])}};s("",t.params);var a,d,c,u={id:e,method:m(t.method),params:t.params};r.length&&(u.callbacks=r),t.timeout&&(a=e,d=t.timeout,c=m(t.method),window.setTimeout((function(){l[a]&&(l[a].error&&l[a].error("timeout_error","timeout ("+d+"ms) exceeded on method '"+c+"'"),delete l[a],delete i[a])}),d)),l[e]={callbacks:n,error:t.error,success:t.success},i[e]=p,e++,v(u)},notify:function(e){if(!e)throw"missing arguments to notify function";if(!e.method||"string"!=typeof e.method)throw"'method' argument to notify must be string";v({method:m(e.method),params:e.params})},destroy:function(){(function(e,n,i){for(var r=t[n][i],o=0;o<r.length;o++)r[o].win===e&&r.splice(o,1);0===t[n][i].length&&delete t[n][i]})(r.window,r.origin,r.scope),window.removeEventListener?window.removeEventListener("message",p,!1):window.detachEvent&&window.detachEvent("onmessage",p),h=!1,c={},u={},l={},r.origin=null,f=[],o("channel destroyed"),d=""}};return w.bind("__ready",(function(e,t){if(o("ready msg received"),h&&!r.reconnect)throw"received ready message while in ready state.";h=!0,d.length<6&&(d+="publish-request"===t.type?"-R":"-L"),o("ready msg accepted."),"publish-request"===t.type&&w.notify({method:"__ready",params:{type:"publish-reply",publish:g}});for(var n=0;n<t.publish.length;n++)"bind"===t.publish[n].action?y([t.publish[n].method],w.remote):delete w.remote[t.publish[n].method];for(r.reconnect||w.unbind("__ready",!0);f.length;)v(f.splice(0,1)[0]);g=[],"function"==typeof r.onReady&&r.onReady(w)}),!0),w.bind("__bind",(function(e,t){y([t],w.remote)}),!0),w.bind("__unbind",(function(e,t){w.remote[t]&&delete w.remote[t]}),!0),r.remote&&y(r.remote,w.remote),setTimeout((function(){d.length>0&&v({method:m("__ready"),params:{type:"publish-request",publish:g}},!0)}),0),w}}}()}()},3867:(e,t,n)=>{"use strict";function i(e,t,n,i){return new(n||(n=Promise))((function(r,o){function s(e){try{d(i.next(e))}catch(e){o(e)}}function a(e){try{d(i.throw(e))}catch(e){o(e)}}function d(e){var t;e.done?r(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(s,a)}d((i=i.apply(e,t||[])).next())}))}n.d(t,{mG:()=>i})}},t={};function n(i){var r=t[i];if(void 0!==r)return r.exports;var o=t[i]={exports:{}};return e[i].call(o.exports,o,o.exports,n),o.exports}n.d=(e,t)=>{for(var i in t)n.o(t,i)&&!n.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{"use strict";var e=n(3867),t=n(6038);class i{constructor(){this.eventRegistrations={}}bindToChannel(e){for(const t of Object.keys(this.eventRegistrations))e.bind(t,((e,n)=>this.fire(t,n)))}registerTypes(e){for(const t of e)this.eventRegistrations[t]={registrations:[]}}fire(e,t){this.eventRegistrations[e].registrations.forEach((e=>e(t)))}addListener(e,t){return this.eventRegistrations[e]?(this.eventRegistrations[e].registrations.push(t),!0):(console.warn(`PeerTube: addEventListener(): The event '${e}' is not supported`),!1)}removeListener(e,t){return!!this.eventRegistrations[e]&&(this.eventRegistrations[e].registrations=this.eventRegistrations[e].registrations.filter((e=>e===t)),!0)}}const r=["pause","play","playbackStatusUpdate","playbackStatusChange","resolutionUpdate","volumeChange"];window.PeerTubePlayer=class{constructor(e,t){this.embedElement=e,this.scope=t,this.eventRegistrar=new i,this.eventRegistrar.registerTypes(r),this.constructChannel(),this.prepareToBeReady()}destroy(){this.embedElement.remove()}addEventListener(e,t){return this.eventRegistrar.addListener(e,t)}removeEventListener(e,t){return this.eventRegistrar.removeListener(e,t)}get ready(){return this.readyPromise}play(){return(0,e.mG)(this,void 0,void 0,(function*(){yield this.sendMessage("play")}))}pause(){return(0,e.mG)(this,void 0,void 0,(function*(){yield this.sendMessage("pause")}))}setVolume(t){return(0,e.mG)(this,void 0,void 0,(function*(){yield this.sendMessage("setVolume",t)}))}getVolume(){return(0,e.mG)(this,void 0,void 0,(function*(){return this.sendMessage("getVolume")}))}setCaption(t){return(0,e.mG)(this,void 0,void 0,(function*(){yield this.sendMessage("setCaption",t)}))}getCaptions(){return(0,e.mG)(this,void 0,void 0,(function*(){return this.sendMessage("getCaptions")}))}seek(t){return(0,e.mG)(this,void 0,void 0,(function*(){yield this.sendMessage("seek",t)}))}setResolution(t){return(0,e.mG)(this,void 0,void 0,(function*(){yield this.sendMessage("setResolution",t)}))}getResolutions(){return(0,e.mG)(this,void 0,void 0,(function*(){return this.sendMessage("getResolutions")}))}getPlaybackRates(){return(0,e.mG)(this,void 0,void 0,(function*(){return this.sendMessage("getPlaybackRates")}))}getPlaybackRate(){return(0,e.mG)(this,void 0,void 0,(function*(){return this.sendMessage("getPlaybackRate")}))}setPlaybackRate(t){return(0,e.mG)(this,void 0,void 0,(function*(){yield this.sendMessage("setPlaybackRate",t)}))}playNextVideo(){return(0,e.mG)(this,void 0,void 0,(function*(){yield this.sendMessage("playNextVideo")}))}playPreviousVideo(){return(0,e.mG)(this,void 0,void 0,(function*(){yield this.sendMessage("playPreviousVideo")}))}getCurrentPosition(){return(0,e.mG)(this,void 0,void 0,(function*(){return this.sendMessage("getCurrentPosition")}))}constructChannel(){this.channel=t.build({window:this.embedElement.contentWindow,origin:"*",scope:this.scope||"peertube"}),this.eventRegistrar.bindToChannel(this.channel)}prepareToBeReady(){let e,t;this.readyPromise=new Promise(((n,i)=>{e=n,t=i})),this.channel.bind("ready",(n=>n?e():t())),this.channel.call({method:"isReady",success:t=>t?e():null})}sendMessage(e,t){return new Promise(((n,i)=>{this.channel.call({method:e,params:t,success:e=>n(e),error:e=>i(e)})}))}}})()})();