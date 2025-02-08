"use strict";(()=>{var L=Object.defineProperty;var b=(s,n,e)=>n in s?L(s,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[n]=e;var l=(s,n,e)=>(b(s,typeof n!="symbol"?n+"":n,e),e);var m=class{constructor(){l(this,"API_BASE","https://applerouth.onecanoe.com/api/public/v2");l(this,"API_ENDPOINT")}async sendQuery(){let n;try{n=await fetch(this.API_BASE+this.API_ENDPOINT,{method:"post",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(this.API_BODY)})}catch(t){return console.error(`Error when sending query: ${this.API_BASE}${this.API_ENDPOINT}`,t),null}return n.ok?await n.json():(console.warn(`Error when sending query: ${this.API_BASE}${this.API_ENDPOINT}`),console.warn(n,n.statusText),null)}},g=m;var f=class extends g{constructor(e){super();l(this,"API_ENDPOINT","/events");l(this,"API_BODY");l(this,"DEFAULT_EVENT_LIMIT",12);this.API_BODY=e,this.setAPIDefaults()}setAPIDefaults(){this.API_BODY.limit||(this.API_BODY.limit=this.DEFAULT_EVENT_LIMIT),this.API_BODY.start||(this.API_BODY.start=0)}async getQueryData(){let e=await this.sendQuery();if(!e)return null;let{data:t}=e;return!t||!t.length?(console.warn(`Empty response from the query: ${this.API_BASE}${this.API_ENDPOINT}`),this.emptyResponse()):t}emptyResponse(){return[]}},_=f;function u(s){return!(s.type!=="class"||!s.class_schedule||1>=s.class_schedule.sessions_count)}function E(s){var n,e;return u(s)?dayjs((n=s.class_schedule)==null?void 0:n.first_session.starts_at).format("MMM Do")+" - "+dayjs((e=s.class_schedule)==null?void 0:e.final_session.starts_at).format("MMM Do")+" ("+s.days_of_week.join(", ")+")":dayjs(s.starts_at).format("MMM Do")+" ("+s.days_of_week.join(", ")+")"}var N={Mon:"Mondays",Tue:"Tuesdays",Wed:"Wednesdays",Thu:"Thursdays",Fri:"Fridays",Sat:"Saturdays",Sun:"Sundays"};function A(s,n,e=!0){let t="h:mm A",o=dayjs(s).format(t),r=dayjs(n).format(t),i=dayjs(s).format("z");return e?`${o} - ${r} (${i})`:`${o} - ${r}`}function h(s){let n=new Set,e=Object.keys(N);s.forEach(o=>{o.days_of_week.map(r=>n.add(r))});let t=[...n];return t.sort((o,r)=>e.indexOf(o)-e.indexOf(r)),`Weekly (${t.join(", ")})`}function I(s){let n=new Set,e=["Mornings","Afternoons","Evenings","Nights"];s.forEach(o=>{if(!o.starts_at)return;let r=new Date(o.starts_at).getHours();r>=5&&r<12?n.add(e[0]):r>=12&&r<17?n.add(e[1]):r>=17&&r<21?n.add(e[2]):n.add(e[3])});let t=[...n];return t.sort((o,r)=>e.indexOf(o)-e.indexOf(r)),t.join("/")}function P(s){let n=new Set;return s.forEach(e=>{e.topics.map(t=>n.add(t))}),Array.from(n).join(", ")}var v=["category","market","id","name","event_code","tags","limit","start","topics","before","after","timezone","test_date","is_online","extended_time_available","days_of_week","location_id"];function D(s,n){let e="query-",t=e.length;for(let o of s.attributes)if(o.name.startsWith(e)){let r=o.name.substring(t);v.includes(r)&&(n.apiBody[r]=O(o.value))}}function O(s){if(/^\d+$/.test(s))return Number(s);if(!isNaN(Date.parse(s)))return new Date(s);let n=s.toLowerCase();if(n==="true")return!0;if(n==="false")return!1;try{let e=/'([^']*)'/g,t=JSON.parse(s.replace(e,'"$1"'));return Array.isArray(t)?t:s}catch{return s}}var T="filters";window.addEventListener("alpine:init",()=>{window.Alpine.data("filterEventsLocations",function(){let s=[];return{isLoading:!1,isQueryError:!1,areEventsAvailable:!0,locationIds:[],locations:[],apiBody:{category:["practice_test"],start:0,limit:30,is_online:!1,timezone:dayjs().format("Z")},filterLocationItemAttr:{[":key"](){return this.location.id}},filterLocationEventsItemAttr:{[":key"](){return this.event.id}},locationImageAttr:{[":src"](){var o;let e=this.$el.getAttribute("src"),t=(o=this.$refs.locationList)==null?void 0:o.querySelector(`img[location_id="${this.location.id}"]`);return t&&t.getAttribute("src")||e},srcset:"",sizes:""},async init(){await this.$nextTick(),D(this.$refs.componentEl,this);let e=this.$refs.componentEl.getAttribute("locations");if(e)try{let t=JSON.parse(e.replace(/'/g,'"'));this.locationIds=Array.isArray(t)?t.map(Number):[Number(t)]}catch(t){console.warn("Failed to parse locations attribute:",t)}s.push(window.Alpine.effect(()=>{this.setAPIQueryFilters(),this.$nextTick(()=>{this.processQuery()})}))},destroy(){s.forEach(e=>{window.Alpine.release(e)})},setAPIQueryFilters(){let e=this.$store[T];this.apiBody.topics=e.testTopics,this.apiBody.after=e.start_date,this.apiBody.before=e.end_date,this.apiBody.extended_time_available=e.extended_time_available,this.apiBody.test_date=e.test_date,this.apiBody.days_of_week=e.days_of_week},async queryLocationEvents(e){let t={...this.apiBody};return e!==void 0&&(t.location_id=e),await new _(t).getQueryData()||[]},async processQuery(){this.areEventsAvailable=!0,this.isLoading=!0,this.isQueryError=!1,this.locations=[];try{let e=this.locationIds.length>0?this.locationIds:this.apiBody.location_id?[this.apiBody.location_id]:[];if(e.length===0){let i=await this.queryLocationEvents();if(!i||i.length===0){this.areEventsAvailable=!1;return}this.processEventsIntoLocations(i);return}let t=[],o=!1,r=!0;for(let i of e)try{let a=await this.queryLocationEvents(i);a&&a.length>0&&(o=!0,t.push(...a)),r=!1}catch(a){console.warn(`Failed to fetch events for location ${i}:`,a)}if(this.isQueryError=r,!o){this.areEventsAvailable=!1;return}this.processEventsIntoLocations(t)}catch(e){console.error("Error processing query:",e),this.isQueryError=!0}finally{this.isLoading=!1}},processEventsIntoLocations(e){var r;let t=e.reduce((i,a)=>{if(!a.location_id)return i;let c=i.find(d=>d.id===a.location_id);return c?c.events.length<6&&c.events.push(a):i.push({id:a.location_id,name:a.location_name,address:a.address,directions:a.google_maps_url,events:[a],eventsDepleted:!1,moreEventsLoading:!1}),i},[]),o=(r=this.$refs.locationList)==null?void 0:r.querySelectorAll('[data-el="collection-item"]');if(o){let i=Array.from(o).map(a=>a.getAttribute("location_id"));t.sort((a,c)=>{let d=i.findIndex(y=>{var p;return y===((p=a.id)==null?void 0:p.toString())}),R=i.findIndex(y=>{var p;return y===((p=c.id)==null?void 0:p.toString())});return d-R})}this.locations=t,this.fillInitEvents()},async fillInitEvents(){this.locations.forEach(e=>{if(6<=e.events.length)return;let t=6-e.events.length;this.viewMoreEvents(e.id,t,!0)})},async getGroupedDays(e){let t=this.getLocationArrayByID(e);if(t)return await this.$nextTick(),h(t.events)},async getGroupedTimings(e){let t=this.getLocationArrayByID(e);if(t)return await this.$nextTick(),I(t.events)},async getGroupedTests(e){let t=this.getLocationArrayByID(e);if(t)return await this.$nextTick(),P(t.events)},async viewMoreEvents(e,t=6,o=!1){let r=this.getLocationArrayByID(e);if(!r){console.warn("No location found to view more events for the Location ID - ",e);return}let i={...this.apiBody};i.location_id=r.id,i.start=r.events.length,i.limit=o?t+1:t,r.moreEventsLoading=!0;let a=await new _(i).getQueryData();r.moreEventsLoading=!1,(!a.length||t===6&&a.length<6||o&&a.length<=t)&&(r.eventsDepleted=!0),a.length&&(o&&a.length>t&&a.pop(),r.events.push(...a))},getTimeRange(e,t,o=!0){return A(e,t,o)},getEventDateRange(e){return E(e)},isMultiDayEvent(e){return u(e)},getLocationArrayByID(e){return this.locations.find(t=>t.id===e)}}})});})();
