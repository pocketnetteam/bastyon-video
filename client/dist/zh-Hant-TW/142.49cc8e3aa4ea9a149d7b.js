"use strict";(self.webpackChunkpeertube_client=self.webpackChunkpeertube_client||[]).push([[142],{11142:(G,n,d)=>{n.__esModule=!0,n.tokenize=n.test=n.scanner=n.parser=n.options=n.inherits=n.find=void 0;var c=d(73586),v=s(d(97467)),b=s(d(70507)),i=s(d(95940));function s(h){if(h&&h.__esModule)return h;var f={};if(null!=h)for(var m in h)Object.prototype.hasOwnProperty.call(h,m)&&(f[m]=h[m]);return f.default=h,f}Array.isArray||(Array.isArray=function(h){return"[object Array]"===Object.prototype.toString.call(h)});var o=function(f){return i.run(b.run(f))};n.find=function(f){for(var m=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,g=o(f),p=[],u=0;u<g.length;u++){var A=g[u];A.isLink&&(!m||A.type===m)&&p.push(A.toObject())}return p},n.inherits=c.inherits,n.options=v,n.parser=i,n.scanner=b,n.test=function(f){var m=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,g=o(f);return 1===g.length&&g[0].isLink&&(!m||g[0].type===m)},n.tokenize=o},95940:(G,n,d)=>{n.__esModule=!0,n.start=n.run=n.TOKENS=n.State=void 0;var c=d(50211),t=d(58744),v=function(B){if(B&&B.__esModule)return B;var k={};if(null!=B)for(var W in B)Object.prototype.hasOwnProperty.call(B,W)&&(k[W]=B[W]);return k.default=B,k}(t),a=d(66209),e=function(k){return new c.TokenState(k)},i=e(),s=e(),o=e(),r=e(),l=e(),h=e(),f=e(),m=e(t.URL),g=e(),p=e(t.URL),u=e(t.URL),A=e(),_=e(),M=e(),U=e(),z=e(),w=e(t.URL),R=e(t.URL),P=e(t.URL),L=e(t.URL),N=e(),j=e(),H=e(),x=e(),D=e(),q=e(),y=e(t.EMAIL),T=e(),Y=e(t.EMAIL),I=e(t.MAILTOEMAIL),X=e(),S=e(),K=e(),J=e(),V=e(t.NL);i.on(a.NL,V).on(a.PROTOCOL,s).on(a.MAILTO,o).on(a.SLASH,r),s.on(a.SLASH,r),r.on(a.SLASH,l),i.on(a.TLD,h).on(a.DOMAIN,h).on(a.LOCALHOST,m).on(a.NUM,h),l.on(a.TLD,u).on(a.DOMAIN,u).on(a.NUM,u).on(a.LOCALHOST,u),h.on(a.DOT,f),D.on(a.DOT,q),f.on(a.TLD,m).on(a.DOMAIN,h).on(a.NUM,h).on(a.LOCALHOST,h),q.on(a.TLD,y).on(a.DOMAIN,D).on(a.NUM,D).on(a.LOCALHOST,D),m.on(a.DOT,f),y.on(a.DOT,q),m.on(a.COLON,g).on(a.SLASH,u),g.on(a.NUM,p),p.on(a.SLASH,u),y.on(a.COLON,T),T.on(a.NUM,Y);var E=[a.DOMAIN,a.AT,a.LOCALHOST,a.NUM,a.PLUS,a.POUND,a.PROTOCOL,a.SLASH,a.TLD,a.UNDERSCORE,a.SYM,a.AMPERSAND],O=[a.COLON,a.DOT,a.QUERY,a.PUNCTUATION,a.CLOSEBRACE,a.CLOSEBRACKET,a.CLOSEANGLEBRACKET,a.CLOSEPAREN,a.OPENBRACE,a.OPENBRACKET,a.OPENANGLEBRACKET,a.OPENPAREN];u.on(a.OPENBRACE,_).on(a.OPENBRACKET,M).on(a.OPENANGLEBRACKET,U).on(a.OPENPAREN,z),A.on(a.OPENBRACE,_).on(a.OPENBRACKET,M).on(a.OPENANGLEBRACKET,U).on(a.OPENPAREN,z),_.on(a.CLOSEBRACE,u),M.on(a.CLOSEBRACKET,u),U.on(a.CLOSEANGLEBRACKET,u),z.on(a.CLOSEPAREN,u),w.on(a.CLOSEBRACE,u),R.on(a.CLOSEBRACKET,u),P.on(a.CLOSEANGLEBRACKET,u),L.on(a.CLOSEPAREN,u),N.on(a.CLOSEBRACE,u),j.on(a.CLOSEBRACKET,u),H.on(a.CLOSEANGLEBRACKET,u),x.on(a.CLOSEPAREN,u),_.on(E,w),M.on(E,R),U.on(E,P),z.on(E,L),_.on(O,N),M.on(O,j),U.on(O,H),z.on(O,x),w.on(E,w),R.on(E,R),P.on(E,P),L.on(E,L),w.on(O,w),R.on(O,R),P.on(O,P),L.on(O,L),N.on(E,w),j.on(E,R),H.on(E,P),x.on(E,L),N.on(O,N),j.on(O,j),H.on(O,H),x.on(O,x),u.on(E,u),A.on(E,u),u.on(O,A),A.on(O,A),o.on(a.TLD,I).on(a.DOMAIN,I).on(a.NUM,I).on(a.LOCALHOST,I),I.on(E,I).on(O,X),X.on(E,I).on(O,X);var Q=[a.DOMAIN,a.NUM,a.PLUS,a.POUND,a.QUERY,a.UNDERSCORE,a.SYM,a.AMPERSAND,a.TLD];h.on(Q,S).on(a.AT,K),m.on(Q,S).on(a.AT,K),f.on(Q,S),S.on(Q,S).on(a.AT,K).on(a.DOT,J),J.on(Q,S),K.on(a.TLD,D).on(a.DOMAIN,D).on(a.LOCALHOST,y),n.State=c.TokenState,n.TOKENS=v,n.run=function(k){for(var W=k.length,C=0,aa=[],F=[];C<W;){for(var $=i,ta=null,ia=null,na=0,oa=null,Z=-1;C<W&&!(ta=$.next(k[C]));)F.push(k[C++]);for(;C<W&&(ia=ta||$.next(k[C]));)ta=null,($=ia).accepts()?(Z=0,oa=$):Z>=0&&Z++,C++,na++;if(Z<0)for(var ra=C-na;ra<C;ra++)F.push(k[ra]);else{F.length>0&&(aa.push(new t.TEXT(F)),F=[]),C-=Z,na-=Z;var sa=oa.emit();aa.push(new sa(k.slice(C-na,C)))}}return F.length>0&&aa.push(new t.TEXT(F)),aa},n.start=i},70507:(G,n,d)=>{n.__esModule=!0,n.start=n.run=n.TOKENS=n.State=void 0;var c=d(50211),t=d(66209),v=function(y){if(y&&y.__esModule)return y;var T={};if(null!=y)for(var Y in y)Object.prototype.hasOwnProperty.call(y,Y)&&(T[Y]=y[Y]);return T.default=y,T}(t),b="aaa|aarp|abarth|abb|abbott|abbvie|abc|able|abogado|abudhabi|ac|academy|accenture|accountant|accountants|aco|active|actor|ad|adac|ads|adult|ae|aeg|aero|aetna|af|afamilycompany|afl|africa|ag|agakhan|agency|ai|aig|aigo|airbus|airforce|airtel|akdn|al|alfaromeo|alibaba|alipay|allfinanz|allstate|ally|alsace|alstom|am|americanexpress|americanfamily|amex|amfam|amica|amsterdam|analytics|android|anquan|anz|ao|aol|apartments|app|apple|aq|aquarelle|ar|arab|aramco|archi|army|arpa|art|arte|as|asda|asia|associates|at|athleta|attorney|au|auction|audi|audible|audio|auspost|author|auto|autos|avianca|aw|aws|ax|axa|az|azure|ba|baby|baidu|banamex|bananarepublic|band|bank|bar|barcelona|barclaycard|barclays|barefoot|bargains|baseball|basketball|bauhaus|bayern|bb|bbc|bbt|bbva|bcg|bcn|bd|be|beats|beauty|beer|bentley|berlin|best|bestbuy|bet|bf|bg|bh|bharti|bi|bible|bid|bike|bing|bingo|bio|biz|bj|black|blackfriday|blanco|blockbuster|blog|bloomberg|blue|bm|bms|bmw|bn|bnl|bnpparibas|bo|boats|boehringer|bofa|bom|bond|boo|book|booking|boots|bosch|bostik|boston|bot|boutique|box|br|bradesco|bridgestone|broadway|broker|brother|brussels|bs|bt|budapest|bugatti|build|builders|business|buy|buzz|bv|bw|by|bz|bzh|ca|cab|cafe|cal|call|calvinklein|cam|camera|camp|cancerresearch|canon|capetown|capital|capitalone|car|caravan|cards|care|career|careers|cars|cartier|casa|case|caseih|cash|casino|cat|catering|catholic|cba|cbn|cbre|cbs|cc|cd|ceb|center|ceo|cern|cf|cfa|cfd|cg|ch|chanel|channel|chase|chat|cheap|chintai|chloe|christmas|chrome|chrysler|church|ci|cipriani|circle|cisco|citadel|citi|citic|city|cityeats|ck|cl|claims|cleaning|click|clinic|clinique|clothing|cloud|club|clubmed|cm|cn|co|coach|codes|coffee|college|cologne|com|comcast|commbank|community|company|compare|computer|comsec|condos|construction|consulting|contact|contractors|cooking|cookingchannel|cool|coop|corsica|country|coupon|coupons|courses|cr|credit|creditcard|creditunion|cricket|crown|crs|cruise|cruises|csc|cu|cuisinella|cv|cw|cx|cy|cymru|cyou|cz|dabur|dad|dance|data|date|dating|datsun|day|dclk|dds|de|deal|dealer|deals|degree|delivery|dell|deloitte|delta|democrat|dental|dentist|desi|design|dev|dhl|diamonds|diet|digital|direct|directory|discount|discover|dish|diy|dj|dk|dm|dnp|do|docs|doctor|dodge|dog|doha|domains|dot|download|drive|dtv|dubai|duck|dunlop|duns|dupont|durban|dvag|dvr|dz|earth|eat|ec|eco|edeka|edu|education|ee|eg|email|emerck|energy|engineer|engineering|enterprises|epost|epson|equipment|er|ericsson|erni|es|esq|estate|esurance|et|etisalat|eu|eurovision|eus|events|everbank|exchange|expert|exposed|express|extraspace|fage|fail|fairwinds|faith|family|fan|fans|farm|farmers|fashion|fast|fedex|feedback|ferrari|ferrero|fi|fiat|fidelity|fido|film|final|finance|financial|fire|firestone|firmdale|fish|fishing|fit|fitness|fj|fk|flickr|flights|flir|florist|flowers|fly|fm|fo|foo|food|foodnetwork|football|ford|forex|forsale|forum|foundation|fox|fr|free|fresenius|frl|frogans|frontdoor|frontier|ftr|fujitsu|fujixerox|fun|fund|furniture|futbol|fyi|ga|gal|gallery|gallo|gallup|game|games|gap|garden|gb|gbiz|gd|gdn|ge|gea|gent|genting|george|gf|gg|ggee|gh|gi|gift|gifts|gives|giving|gl|glade|glass|gle|global|globo|gm|gmail|gmbh|gmo|gmx|gn|godaddy|gold|goldpoint|golf|goo|goodhands|goodyear|goog|google|gop|got|gov|gp|gq|gr|grainger|graphics|gratis|green|gripe|grocery|group|gs|gt|gu|guardian|gucci|guge|guide|guitars|guru|gw|gy|hair|hamburg|hangout|haus|hbo|hdfc|hdfcbank|health|healthcare|help|helsinki|here|hermes|hgtv|hiphop|hisamitsu|hitachi|hiv|hk|hkt|hm|hn|hockey|holdings|holiday|homedepot|homegoods|homes|homesense|honda|honeywell|horse|hospital|host|hosting|hot|hoteles|hotels|hotmail|house|how|hr|hsbc|ht|htc|hu|hughes|hyatt|hyundai|ibm|icbc|ice|icu|id|ie|ieee|ifm|ikano|il|im|imamat|imdb|immo|immobilien|in|industries|infiniti|info|ing|ink|institute|insurance|insure|int|intel|international|intuit|investments|io|ipiranga|iq|ir|irish|is|iselect|ismaili|ist|istanbul|it|itau|itv|iveco|iwc|jaguar|java|jcb|jcp|je|jeep|jetzt|jewelry|jio|jlc|jll|jm|jmp|jnj|jo|jobs|joburg|jot|joy|jp|jpmorgan|jprs|juegos|juniper|kaufen|kddi|ke|kerryhotels|kerrylogistics|kerryproperties|kfh|kg|kh|ki|kia|kim|kinder|kindle|kitchen|kiwi|km|kn|koeln|komatsu|kosher|kp|kpmg|kpn|kr|krd|kred|kuokgroup|kw|ky|kyoto|kz|la|lacaixa|ladbrokes|lamborghini|lamer|lancaster|lancia|lancome|land|landrover|lanxess|lasalle|lat|latino|latrobe|law|lawyer|lb|lc|lds|lease|leclerc|lefrak|legal|lego|lexus|lgbt|li|liaison|lidl|life|lifeinsurance|lifestyle|lighting|like|lilly|limited|limo|lincoln|linde|link|lipsy|live|living|lixil|lk|loan|loans|locker|locus|loft|lol|london|lotte|lotto|love|lpl|lplfinancial|lr|ls|lt|ltd|ltda|lu|lundbeck|lupin|luxe|luxury|lv|ly|ma|macys|madrid|maif|maison|makeup|man|management|mango|map|market|marketing|markets|marriott|marshalls|maserati|mattel|mba|mc|mckinsey|md|me|med|media|meet|melbourne|meme|memorial|men|menu|meo|merckmsd|metlife|mg|mh|miami|microsoft|mil|mini|mint|mit|mitsubishi|mk|ml|mlb|mls|mm|mma|mn|mo|mobi|mobile|mobily|moda|moe|moi|mom|monash|money|monster|mopar|mormon|mortgage|moscow|moto|motorcycles|mov|movie|movistar|mp|mq|mr|ms|msd|mt|mtn|mtr|mu|museum|mutual|mv|mw|mx|my|mz|na|nab|nadex|nagoya|name|nationwide|natura|navy|nba|nc|ne|nec|net|netbank|netflix|network|neustar|new|newholland|news|next|nextdirect|nexus|nf|nfl|ng|ngo|nhk|ni|nico|nike|nikon|ninja|nissan|nissay|nl|no|nokia|northwesternmutual|norton|now|nowruz|nowtv|np|nr|nra|nrw|ntt|nu|nyc|nz|obi|observer|off|office|okinawa|olayan|olayangroup|oldnavy|ollo|om|omega|one|ong|onl|online|onyourside|ooo|open|oracle|orange|org|organic|origins|osaka|otsuka|ott|ovh|pa|page|panasonic|panerai|paris|pars|partners|parts|party|passagens|pay|pccw|pe|pet|pf|pfizer|pg|ph|pharmacy|phd|philips|phone|photo|photography|photos|physio|piaget|pics|pictet|pictures|pid|pin|ping|pink|pioneer|pizza|pk|pl|place|play|playstation|plumbing|plus|pm|pn|pnc|pohl|poker|politie|porn|post|pr|pramerica|praxi|press|prime|pro|prod|productions|prof|progressive|promo|properties|property|protection|pru|prudential|ps|pt|pub|pw|pwc|py|qa|qpon|quebec|quest|qvc|racing|radio|raid|re|read|realestate|realtor|realty|recipes|red|redstone|redumbrella|rehab|reise|reisen|reit|reliance|ren|rent|rentals|repair|report|republican|rest|restaurant|review|reviews|rexroth|rich|richardli|ricoh|rightathome|ril|rio|rip|rmit|ro|rocher|rocks|rodeo|rogers|room|rs|rsvp|ru|rugby|ruhr|run|rw|rwe|ryukyu|sa|saarland|safe|safety|sakura|sale|salon|samsclub|samsung|sandvik|sandvikcoromant|sanofi|sap|sapo|sarl|sas|save|saxo|sb|sbi|sbs|sc|sca|scb|schaeffler|schmidt|scholarships|school|schule|schwarz|science|scjohnson|scor|scot|sd|se|search|seat|secure|security|seek|select|sener|services|ses|seven|sew|sex|sexy|sfr|sg|sh|shangrila|sharp|shaw|shell|shia|shiksha|shoes|shop|shopping|shouji|show|showtime|shriram|si|silk|sina|singles|site|sj|sk|ski|skin|sky|skype|sl|sling|sm|smart|smile|sn|sncf|so|soccer|social|softbank|software|sohu|solar|solutions|song|sony|soy|space|spiegel|spot|spreadbetting|sr|srl|srt|st|stada|staples|star|starhub|statebank|statefarm|statoil|stc|stcgroup|stockholm|storage|store|stream|studio|study|style|su|sucks|supplies|supply|support|surf|surgery|suzuki|sv|swatch|swiftcover|swiss|sx|sy|sydney|symantec|systems|sz|tab|taipei|talk|taobao|target|tatamotors|tatar|tattoo|tax|taxi|tc|tci|td|tdk|team|tech|technology|tel|telecity|telefonica|temasek|tennis|teva|tf|tg|th|thd|theater|theatre|tiaa|tickets|tienda|tiffany|tips|tires|tirol|tj|tjmaxx|tjx|tk|tkmaxx|tl|tm|tmall|tn|to|today|tokyo|tools|top|toray|toshiba|total|tours|town|toyota|toys|tr|trade|trading|training|travel|travelchannel|travelers|travelersinsurance|trust|trv|tt|tube|tui|tunes|tushu|tv|tvs|tw|tz|ua|ubank|ubs|uconnect|ug|uk|unicom|university|uno|uol|ups|us|uy|uz|va|vacations|vana|vanguard|vc|ve|vegas|ventures|verisign|versicherung|vet|vg|vi|viajes|video|vig|viking|villas|vin|vip|virgin|visa|vision|vista|vistaprint|viva|vivo|vlaanderen|vn|vodka|volkswagen|volvo|vote|voting|voto|voyage|vu|vuelos|wales|walmart|walter|wang|wanggou|warman|watch|watches|weather|weatherchannel|webcam|weber|website|wed|wedding|weibo|weir|wf|whoswho|wien|wiki|williamhill|win|windows|wine|winners|wme|wolterskluwer|woodside|work|works|world|wow|ws|wtc|wtf|xbox|xerox|xfinity|xihuan|xin|xn--11b4c3d|xn--1ck2e1b|xn--1qqw23a|xn--2scrj9c|xn--30rr7y|xn--3bst00m|xn--3ds443g|xn--3e0b707e|xn--3hcrj9c|xn--3oq18vl8pn36a|xn--3pxu8k|xn--42c2d9a|xn--45br5cyl|xn--45brj9c|xn--45q11c|xn--4gbrim|xn--54b7fta0cc|xn--55qw42g|xn--55qx5d|xn--5su34j936bgsg|xn--5tzm5g|xn--6frz82g|xn--6qq986b3xl|xn--80adxhks|xn--80ao21a|xn--80aqecdr1a|xn--80asehdb|xn--80aswg|xn--8y0a063a|xn--90a3ac|xn--90ae|xn--90ais|xn--9dbq2a|xn--9et52u|xn--9krt00a|xn--b4w605ferd|xn--bck1b9a5dre4c|xn--c1avg|xn--c2br7g|xn--cck2b3b|xn--cg4bki|xn--clchc0ea0b2g2a9gcd|xn--czr694b|xn--czrs0t|xn--czru2d|xn--d1acj3b|xn--d1alf|xn--e1a4c|xn--eckvdtc9d|xn--efvy88h|xn--estv75g|xn--fct429k|xn--fhbei|xn--fiq228c5hs|xn--fiq64b|xn--fiqs8s|xn--fiqz9s|xn--fjq720a|xn--flw351e|xn--fpcrj9c3d|xn--fzc2c9e2c|xn--fzys8d69uvgm|xn--g2xx48c|xn--gckr3f0f|xn--gecrj9c|xn--gk3at1e|xn--h2breg3eve|xn--h2brj9c|xn--h2brj9c8c|xn--hxt814e|xn--i1b6b1a6a2e|xn--imr513n|xn--io0a7i|xn--j1aef|xn--j1amh|xn--j6w193g|xn--jlq61u9w7b|xn--jvr189m|xn--kcrx77d1x4a|xn--kprw13d|xn--kpry57d|xn--kpu716f|xn--kput3i|xn--l1acc|xn--lgbbat1ad8j|xn--mgb9awbf|xn--mgba3a3ejt|xn--mgba3a4f16a|xn--mgba7c0bbn0a|xn--mgbaakc7dvf|xn--mgbaam7a8h|xn--mgbab2bd|xn--mgbai9azgqp6j|xn--mgbayh7gpa|xn--mgbb9fbpob|xn--mgbbh1a|xn--mgbbh1a71e|xn--mgbc0a9azcg|xn--mgbca7dzdo|xn--mgberp4a5d4ar|xn--mgbgu82a|xn--mgbi4ecexp|xn--mgbpl2fh|xn--mgbt3dhd|xn--mgbtx2b|xn--mgbx4cd0ab|xn--mix891f|xn--mk1bu44c|xn--mxtq1m|xn--ngbc5azd|xn--ngbe9e0a|xn--ngbrx|xn--node|xn--nqv7f|xn--nqv7fs00ema|xn--nyqy26a|xn--o3cw4h|xn--ogbpf8fl|xn--p1acf|xn--p1ai|xn--pbt977c|xn--pgbs0dh|xn--pssy2u|xn--q9jyb4c|xn--qcka1pmc|xn--qxam|xn--rhqv96g|xn--rovu88b|xn--rvc1e0am3e|xn--s9brj9c|xn--ses554g|xn--t60b56a|xn--tckwe|xn--tiq49xqyj|xn--unup4y|xn--vermgensberater-ctb|xn--vermgensberatung-pwb|xn--vhquv|xn--vuq861b|xn--w4r85el8fhu5dnra|xn--w4rs40l|xn--wgbh1c|xn--wgbl6a|xn--xhq521b|xn--xkc2al3hye2a|xn--xkc2dl3a5ee0h|xn--y9a3aq|xn--yfro4i67o|xn--ygbi2ammx|xn--zfr164b|xperia|xxx|xyz|yachts|yahoo|yamaxun|yandex|ye|yodobashi|yoga|yokohama|you|youtube|yt|yun|za|zappos|zara|zero|zip|zippo|zm|zone|zuerich|zw".split("|"),e="0123456789".split(""),i="0123456789abcdefghijklmnopqrstuvwxyz".split(""),s=[" ","\f","\r","\t","\v","\xa0","\u1680","\u180e"],o=[],r=function(T){return new c.CharacterState(T)},l=r(),h=r(t.NUM),f=r(t.DOMAIN),m=r(),g=r(t.WS);l.on("@",r(t.AT)).on(".",r(t.DOT)).on("+",r(t.PLUS)).on("#",r(t.POUND)).on("?",r(t.QUERY)).on("/",r(t.SLASH)).on("_",r(t.UNDERSCORE)).on(":",r(t.COLON)).on("{",r(t.OPENBRACE)).on("[",r(t.OPENBRACKET)).on("<",r(t.OPENANGLEBRACKET)).on("(",r(t.OPENPAREN)).on("}",r(t.CLOSEBRACE)).on("]",r(t.CLOSEBRACKET)).on(">",r(t.CLOSEANGLEBRACKET)).on(")",r(t.CLOSEPAREN)).on("&",r(t.AMPERSAND)).on([",",";","!",'"',"'"],r(t.PUNCTUATION)),l.on("\n",r(t.NL)).on(s,g),g.on(s,g);for(var p=0;p<b.length;p++){var u=(0,c.stateify)(b[p],l,t.TLD,t.DOMAIN);o.push.apply(o,u)}var A=(0,c.stateify)("file",l,t.DOMAIN,t.DOMAIN),_=(0,c.stateify)("ftp",l,t.DOMAIN,t.DOMAIN),M=(0,c.stateify)("http",l,t.DOMAIN,t.DOMAIN),U=(0,c.stateify)("mailto",l,t.DOMAIN,t.DOMAIN);o.push.apply(o,A),o.push.apply(o,_),o.push.apply(o,M),o.push.apply(o,U);var z=A.pop(),w=_.pop(),R=M.pop(),P=U.pop(),L=r(t.DOMAIN),N=r(t.PROTOCOL),j=r(t.MAILTO);w.on("s",L).on(":",N),R.on("s",L).on(":",N),o.push(L),z.on(":",N),L.on(":",N),P.on(":",j);var H=(0,c.stateify)("localhost",l,t.LOCALHOST,t.DOMAIN);o.push.apply(o,H),l.on(e,h),h.on("-",m).on(e,h).on(i,f),f.on("-",m).on(i,f);for(var x=0;x<o.length;x++)o[x].on("-",m).on(i,f);m.on("-",m).on(e,f).on(i,f),l.defaultTransition=r(t.SYM);var q=l;n.State=c.CharacterState,n.TOKENS=v,n.run=function(T){for(var Y=T.replace(/[A-Z]/g,function(ea){return ea.toLowerCase()}),I=T.length,X=[],S=0;S<I;){for(var K=l,J=null,V=0,E=null,O=-1;S<I&&(J=K.next(Y[S]));)(K=J).accepts()?(O=0,E=K):O>=0&&O++,V++,S++;if(!(O<0)){S-=O,V-=O;var Q=E.emit();X.push(new Q(T.substr(S-V,V)))}}return X},n.start=q},50211:(G,n,d)=>{n.__esModule=!0,n.stateify=n.TokenState=n.CharacterState=void 0;var c=d(73586),v=function(i){this.j=[],this.T=i||null};v.prototype={defaultTransition:!1,on:function(s,o){if(s instanceof Array){for(var r=0;r<s.length;r++)this.j.push([s[r],o]);return this}return this.j.push([s,o]),this},next:function(s){for(var o=0;o<this.j.length;o++){var r=this.j[o],h=r[1];if(this.test(s,r[0]))return h}return this.defaultTransition},accepts:function(){return!!this.T},test:function(s,o){return s===o},emit:function(){return this.T}};var a=(0,c.inherits)(v,function(i){this.j=[],this.T=i||null},{test:function(s,o){return s===o||o instanceof RegExp&&o.test(s)}}),b=(0,c.inherits)(v,function(i){this.j=[],this.T=i||null},{jump:function(s){var o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,r=this.next(new s(""));return r===this.defaultTransition?(r=new this.constructor(o),this.on(s,r)):o&&(r.T=o),r},test:function(s,o){return s instanceof o}});n.CharacterState=a,n.TokenState=b,n.stateify=function(i,s,o,r){for(var l=0,h=i.length,f=s,m=[],g=void 0;l<h&&(g=f.next(i[l]));)f=g,l++;if(l>=h)return[];for(;l<h-1;)g=new a(r),m.push(g),f.on(i[l],g),f=g,l++;return g=new a(o),m.push(g),f.on(i[h-1],g),m}},61325:(G,n)=>{n.__esModule=!0,n.createTokenClass=function(){return function(c){c&&(this.v=c)}}},58744:(G,n,d)=>{n.__esModule=!0,n.URL=n.TEXT=n.NL=n.EMAIL=n.MAILTOEMAIL=n.Base=void 0;var c=d(61325),t=d(73586),v=d(66209);function a(l){return l instanceof v.DOMAIN||l instanceof v.TLD}var b=(0,c.createTokenClass)();b.prototype={type:"token",isLink:!1,toString:function(){for(var h=[],f=0;f<this.v.length;f++)h.push(this.v[f].toString());return h.join("")},toHref:function(){return this.toString()},toObject:function(){var h=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"http";return{type:this.type,value:this.toString(),href:this.toHref(h)}}};var e=(0,t.inherits)(b,(0,c.createTokenClass)(),{type:"email",isLink:!0}),i=(0,t.inherits)(b,(0,c.createTokenClass)(),{type:"email",isLink:!0,toHref:function(){return"mailto:"+this.toString()}}),s=(0,t.inherits)(b,(0,c.createTokenClass)(),{type:"text"}),o=(0,t.inherits)(b,(0,c.createTokenClass)(),{type:"nl"}),r=(0,t.inherits)(b,(0,c.createTokenClass)(),{type:"url",isLink:!0,toHref:function(){for(var h=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"http",f=!1,m=!1,g=this.v,p=[],u=0;g[u]instanceof v.PROTOCOL;)f=!0,p.push(g[u].toString().toLowerCase()),u++;for(;g[u]instanceof v.SLASH;)m=!0,p.push(g[u].toString()),u++;for(;a(g[u]);)p.push(g[u].toString().toLowerCase()),u++;for(;u<g.length;u++)p.push(g[u].toString());return p=p.join(""),f||m||(p=h+"://"+p),p},hasProtocol:function(){return this.v[0]instanceof v.PROTOCOL}});n.Base=b,n.MAILTOEMAIL=e,n.EMAIL=i,n.NL=o,n.TEXT=s,n.URL=r},66209:(G,n,d)=>{n.__esModule=!0,n.AMPERSAND=n.CLOSEPAREN=n.CLOSEANGLEBRACKET=n.CLOSEBRACKET=n.CLOSEBRACE=n.OPENPAREN=n.OPENANGLEBRACKET=n.OPENBRACKET=n.OPENBRACE=n.WS=n.TLD=n.SYM=n.UNDERSCORE=n.SLASH=n.MAILTO=n.PROTOCOL=n.QUERY=n.POUND=n.PLUS=n.NUM=n.NL=n.LOCALHOST=n.PUNCTUATION=n.DOT=n.COLON=n.AT=n.DOMAIN=n.Base=void 0;var c=d(61325),t=d(73586),v=(0,c.createTokenClass)();function a(q){var y=q?{v:q}:{};return(0,t.inherits)(v,(0,c.createTokenClass)(),y)}v.prototype={toString:function(){return this.v+""}};var b=a(),e=a("@"),i=a(":"),s=a("."),o=a(),r=a(),l=a("\n"),h=a(),f=a("+"),m=a("#"),g=a(),p=a("mailto:"),u=a("?"),A=a("/"),_=a("_"),M=a(),U=a(),z=a(),w=a("{"),R=a("["),P=a("<"),L=a("("),N=a("}"),j=a("]"),H=a(">"),x=a(")"),D=a("&");n.Base=v,n.DOMAIN=b,n.AT=e,n.COLON=i,n.DOT=s,n.PUNCTUATION=o,n.LOCALHOST=r,n.NL=l,n.NUM=h,n.PLUS=f,n.POUND=m,n.QUERY=u,n.PROTOCOL=g,n.MAILTO=p,n.SLASH=A,n.UNDERSCORE=_,n.SYM=M,n.TLD=U,n.WS=z,n.OPENBRACE=w,n.OPENBRACKET=R,n.OPENANGLEBRACKET=P,n.OPENPAREN=L,n.CLOSEBRACE=N,n.CLOSEBRACKET=j,n.CLOSEANGLEBRACKET=H,n.CLOSEPAREN=x,n.AMPERSAND=D},73586:(G,n)=>{n.__esModule=!0,n.inherits=function(c,t){var v=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},a=Object.create(c.prototype);for(var b in v)a[b]=v[b];return a.constructor=t,t.prototype=a,t}},97467:(G,n)=>{n.__esModule=!0;var d="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},c={defaultProtocol:"http",events:null,format:a,formatHref:a,nl2br:!1,tagName:"a",target:function(e,i){return"url"===i?"_blank":null},validate:!0,ignoreTags:[],attributes:null,className:"linkified"};function t(e){this.defaultProtocol=(e=e||{}).hasOwnProperty("defaultProtocol")?e.defaultProtocol:c.defaultProtocol,this.events=e.hasOwnProperty("events")?e.events:c.events,this.format=e.hasOwnProperty("format")?e.format:c.format,this.formatHref=e.hasOwnProperty("formatHref")?e.formatHref:c.formatHref,this.nl2br=e.hasOwnProperty("nl2br")?e.nl2br:c.nl2br,this.tagName=e.hasOwnProperty("tagName")?e.tagName:c.tagName,this.target=e.hasOwnProperty("target")?e.target:c.target,this.validate=e.hasOwnProperty("validate")?e.validate:c.validate,this.ignoreTags=[],this.attributes=e.attributes||e.linkAttributes||c.attributes,this.className=e.hasOwnProperty("className")?e.className:e.linkClass||c.className;for(var i=e.hasOwnProperty("ignoreTags")?e.ignoreTags:c.ignoreTags,s=0;s<i.length;s++)this.ignoreTags.push(i[s].toUpperCase())}function a(e){return e}n.defaults=c,n.Options=t,n.contains=function(e,i){for(var s=0;s<e.length;s++)if(e[s]===i)return!0;return!1},t.prototype={resolve:function(i){var s=i.toHref(this.defaultProtocol);return{formatted:this.get("format",i.toString(),i),formattedHref:this.get("formatHref",s,i),tagName:this.get("tagName",s,i),className:this.get("className",s,i),target:this.get("target",s,i),events:this.getObject("events",s,i),attributes:this.getObject("attributes",s,i)}},check:function(i){return this.get("validate",i.toString(),i)},get:function(i,s,o){var r=void 0,l=this[i];if(!l)return l;switch(void 0===l?"undefined":d(l)){case"function":return l(s,o.type);case"object":return"function"==typeof(r=l.hasOwnProperty(o.type)?l[o.type]:c[i])?r(s,o.type):r}return l},getObject:function(i,s,o){var r=this[i];return"function"==typeof r?r(s,o.type):r}}}}]);