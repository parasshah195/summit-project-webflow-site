"use strict";(()=>{var T=Object.defineProperty;var R=(e,n,r)=>n in e?T(e,n,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[n]=r;var u=(e,n,r)=>(R(e,typeof n!="symbol"?n+"":n,r),r);var c=class{constructor(){u(this,"API_BASE","https://applerouth.onecanoe.com/api/public/v2");u(this,"API_ENDPOINT")}async sendQuery(){let n=await fetch(this.API_BASE+this.API_ENDPOINT,{method:"post",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(this.API_BODY)});return n.ok?await n.json():(console.warn(`Error when sending query: ${this.API_BASE}${this.API_ENDPOINT}`),console.warn(n,n.statusText),null)}},y=c;var g=class extends y{constructor(r){super();u(this,"API_ENDPOINT","/events");u(this,"API_BODY");u(this,"DEFAULT_EVENT_LIMIT",12);this.API_BODY=r,this.setAPIDefaults()}setAPIDefaults(){this.API_BODY.limit||(this.API_BODY.limit=this.DEFAULT_EVENT_LIMIT),this.API_BODY.start||(this.API_BODY.start=0)}async getQueryData(){let r=await this.sendQuery();if(!r)return null;let{data:a}=r;return!a||!a.length?(console.warn(`Empty response from the query: ${this.API_BASE}${this.API_ENDPOINT}`),this.emptyResponse()):a}emptyResponse(){return[]}},h=g;function m(e){return!(e.type!=="class"||!e.class_schedule||1>=e.class_schedule.sessions_count)}function A(e){var n,r;return m(e)?dayjs((n=e.class_schedule)==null?void 0:n.first_session.starts_at).format("MMM Do")+" - "+dayjs((r=e.class_schedule)==null?void 0:r.final_session.starts_at).format("MMM Do")+" ("+e.days_of_week.join(", ")+")":dayjs(e.starts_at).format("MMM Do")+" ("+e.days_of_week.join(", ")+")"}function _(e,n,r=!0){let a="h:mm A",t=dayjs(e).format(a),s=dayjs(n).format(a),i=dayjs(e).format("z");return r?`${t} - ${s} (${i})`:`${t} - ${s}`}var E=()=>{var e;(e=window.Webflow)==null||e.require("slider").redraw(),window.dispatchEvent(new Event("resize"))};var P=["category","market","id","name","event_code","tags","limit","start","topics","before","after","timezone","test_date","is_online","extended_time_available","days_of_week","location_id"];function I(e,n){let r="query-",a=r.length;for(let t of e.attributes)if(t.name.startsWith(r)){let s=t.name.substring(a);P.includes(s)&&(n.apiBody[s]=v(t.value))}}function v(e){if(/^\d+$/.test(e))return Number(e);if(!isNaN(Date.parse(e)))return new Date(e);let n=e.toLowerCase();if(n==="true")return!0;if(n==="false")return!1;try{let r=/'([^']*)'/g,a=JSON.parse(e.replace(r,'"$1"'));return Array.isArray(a)?a:e}catch{return e}}var d="geolocation";var D=(e,n,r)=>{e.$watch(`$store.${d}.market_id`,a=>{document.body.contains(e.$root)&&((!r||r.autoUpdateMarket)&&(e.apiBody.market=a),n&&n(a))})};window.addEventListener("alpine:init",()=>{let n="data-unwatch-geostore",r="data-non-slider";window.Alpine.data("eventsList",function(){let a={category:["marketing_event"],market:window.Alpine.store(d).market_id,start:0,limit:12,name:void 0,tags:void 0,topics:void 0,before:void 0,after:void 0,is_online:void 0,extended_time_available:void 0,days_of_week:void 0,location_id:void 0};return{areEventsAvailable:!0,isLoading:!1,isQueryError:!1,moreEventsLoading:!1,eventsDepleted:!1,events:[],blogList:null,apiBody:a,eventSlideAttr:{[":key"](){return this.event.id}},eventWebinarImage:{[":src"](){return!this.event.tags||!this.event.tags.length?null:this.event.image_src},[":alt"](){return!this.event.tags||!this.event.tags.length?null:this.event.image_alt},srcset:"",sizes:""},async init(){var t;if(this.isLoading=!0,this.$refs.blogPostsList){let s=this.$refs.blogPostsList.querySelectorAll(":scope > div");this.blogList=s.length?s:null}await this.$nextTick(),this.setAPIParams(),this.processQuery(),(t=this.$refs)!=null&&t.componentEl.hasAttribute(n)||D(this,()=>{this.events=[],this.apiBody=a,this.setAPIParams(),this.processQuery()})},setAPIParams(){this.$refs.componentEl||console.warn("`componentEl` reference not found on the main component element - eventSlider","Processing query with the default attributes of",this.apiBody),I(this.$refs.componentEl,this)},async processQuery(t=!1){var i,o;t||(this.isLoading=!0),this.areEventsAvailable=!0,this.isQueryError=!1;let s=await new h(this.apiBody).getQueryData();if(!s){this.isLoading=!1,this.isQueryError=!0,this.areEventsAvailable=!1;return}if(!s.length&&!this.blogList&&!t){this.isLoading=!1,this.areEventsAvailable=!1;return}(!s.length&&t||s.length<(this.apiBody.limit||12))&&(this.eventsDepleted=!0),s.forEach(l=>{l.tags&&l.tags.length&&this.setTagImage(l)}),s.length&&this.events.push(...s),this.$nextTick(()=>{this.$refs.sliderMask&&this.blogList&&this.appendBlogPostsAndShuffle()===null&&!s.length&&(this.areEventsAvailable=!1)}),this.isLoading=!1,await this.$nextTick(),(o=(i=this.$refs)==null?void 0:i.componentEl)!=null&&o.hasAttribute(r)||E()},async viewMoreEvents(){this.apiBody.start||(this.apiBody.start=0),this.apiBody.limit||(this.apiBody.limit=6),this.apiBody.start+=this.apiBody.limit,this.moreEventsLoading=!0,await this.processQuery(!0),this.moreEventsLoading=!1},getTimeRange(t,s,i=!0){return _(t,s,i)},getPresenters(t){let{presenters:s}=t;return!s||!s.length?"No presenters":s.join(", ")},appendBlogPostsAndShuffle(){if(!this.blogList)return console.warn("Trying to shuffle event slider cards when blogList is null","slider mask element -",this.$refs.sliderMask),null;let t=this.$refs.sliderMask.querySelectorAll(":scope > div");if(!t.length)return null;let s=[...t];t.forEach(p=>p.remove());let i=document.createDocumentFragment(),o=0,l=0;for(;o<s.length||l<this.blogList.length;)if(o<s.length&&(i.appendChild(s[o]),o+=1),l<this.blogList.length){let p=this.blogList[l];p.classList.add("w-slide"),i.appendChild(p),l+=1}return this.$refs.sliderMask.appendChild(i),!0},getEventDateRange(t){return A(t)},isMultiDayEvent(t){return m(t)},setTagImage(t){var f;let s=Math.random(),i=Math.floor(s*t.tags.length),o=(f=this.$refs.blogTagsList)==null?void 0:f.querySelectorAll(`img[tag_name="${t.tags[i]}"]`);if(!o||!o.length)return null;let l=Math.floor(s*o.length),p=o[l];t.image_src=p.getAttribute("src")||null,t.image_alt=p.getAttribute("alt")||""}}})});})();
