var $localize=Object.assign(void 0===$localize?{}:$localize,{locale:"nl"});
"use strict";(function(global){global.ng=global.ng||{};global.ng.common=global.ng.common||{};global.ng.common.locales=global.ng.common.locales||{};const u=undefined;function plural(n){const i=Math.floor(Math.abs(n)),v=n.toString().replace(/^[^.]*\.?/,"").length;if(i===1&&v===0)return 1;return 5}global.ng.common.locales["nl"]=["nl",[["a.m.","p.m."],u,u],u,[["Z","M","D","W","D","V","Z"],["zo","ma","di","wo","do","vr","za"],["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],["zo","ma","di","wo","do","vr","za"]],u,[["J","F","M","A","M","J","J","A","S","O","N","D"],["jan.","feb.","mrt.","apr.","mei","jun.","jul.","aug.","sep.","okt.","nov.","dec."],["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"]],u,[["v.C.","n.C."],["v.Chr.","n.Chr."],["voor Christus","na Christus"]],1,[6,0],["dd-MM-y","d MMM y","d MMMM y","EEEE d MMMM y"],["HH:mm","HH:mm:ss","HH:mm:ss z","HH:mm:ss zzzz"],["{1} {0}",u,"{1} 'om' {0}",u],[",",".",";","%","+","-","E","\xD7","\u2030","\u221E","NaN",":"],["#,##0.###","#,##0%","\xA4\xA0#,##0.00;\xA4\xA0-#,##0.00","#E0"],"EUR","\u20AC","Euro",{"AUD":["AU$","$"],"CAD":["C$","$"],"FJD":["FJ$","$"],"JPY":["JP\xA5","\xA5"],"SBD":["SI$","$"],"THB":["\u0E3F"],"TWD":["NT$"],"USD":["US$","$"],"XPF":[],"XXX":[]},"ltr",plural,[[["middernacht","\u2019s ochtends","\u2019s middags","\u2019s avonds","\u2019s nachts"],u,u],[["middernacht","ochtend","middag","avond","nacht"],u,u],["00:00",["06:00","12:00"],["12:00","18:00"],["18:00","24:00"],["00:00","06:00"]]]]})(typeof globalThis!=="undefined"&&globalThis||typeof global!=="undefined"&&global||typeof window!=="undefined"&&window);;