"use strict";(()=>{var L=Object.defineProperty;var k=(t,s,r)=>s in t?L(t,s,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[s]=r;var l=(t,s,r)=>(k(t,typeof s!="symbol"?s+"":s,r),r);var y=(t=document)=>t.documentElement.getAttribute("data-wf-site");var S=async t=>{var r,n;let{Webflow:s}=window;if(!(!s||!("destroy"in s)||!("ready"in s)||!("require"in s))&&!(t&&!t.length)){if(t||(s.destroy(),s.ready()),!t||t.includes("ix2")){let a=s.require("ix2");if(a){let{store:u,actions:P}=a,{eventState:e}=u.getState().ixSession,i=Object.entries(e);t||a.destroy(),a.init(),await Promise.all(i.map(o=>u.dispatch(P.eventStateChanged(...o))))}}if(!t||t.includes("commerce")){let a=s.require("commerce"),u=y();a&&u&&(a.destroy(),a.init({siteId:u,apiUrl:"https://render.webflow.com"}))}if(t!=null&&t.includes("lightbox")&&((r=s.require("lightbox"))==null||r.ready()),t!=null&&t.includes("slider")){let a=s.require("slider");a&&(a.redraw(),a.ready())}return t!=null&&t.includes("tabs")&&((n=s.require("tabs"))==null||n.redraw()),new Promise(a=>s.push(()=>a(void 0)))}};var v=class{constructor(){l(this,"API_BASE","https://applerouth.onecanoe.com/api/public/v2");l(this,"API_ENDPOINT")}async sendQuery(){let s;try{s=await fetch(this.API_BASE+this.API_ENDPOINT,{method:"post",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify(this.API_BODY)})}catch(n){return console.error(`Error when sending query: ${this.API_BASE}${this.API_ENDPOINT}`,n),null}return s.ok?await s.json():(console.warn(`Error when sending query: ${this.API_BASE}${this.API_ENDPOINT}`),console.warn(s,s.statusText),null)}},w=v;var b=class extends w{constructor(r){super();l(this,"API_ENDPOINT","/pricing");l(this,"API_BODY");this.API_BODY=r,this.setAPIDefaults()}setAPIDefaults(){this.API_BODY.minimum_quantity||(this.API_BODY.minimum_quantity=0)}async getQueryData(){let r=await this.sendQuery();if(!r)return null;let{rates:n}=r;return!n||!n.length?(console.warn(`Empty response from the query: ${this.API_BASE}${this.API_ENDPOINT}`),this.emptyResponse()):n}emptyResponse(){return[]}},A=b;function I(t,s=0){let r=document.querySelector(".navbar_component"),n=(r==null?void 0:r.clientHeight)||0;return t.getBoundingClientRect().top+window.scrollY-n-s}function E(t){return new URLSearchParams(window.location.search).get(t)||""}function R(){let t={};return new URLSearchParams(window.location.search).forEach((r,n)=>{t[n]=r}),t}function h(t,s,r=!1){let n=new URL(window.location.href);s?n.searchParams.set(t,s):n.searchParams.delete(t),r?window.history.pushState({},"",n.href):window.history.replaceState({},"",n.href)}function T(t=!1){let s=new URL(window.location.href);s.searchParams.forEach((r,n)=>{s.searchParams.delete(n)}),t?window.history.pushState({},"",s.href):window.history.replaceState({},"",s.href)}window.addEventListener("alpine:init",()=>{window.Alpine.data("pricing",function(t=void 0,s=void 0,r=3){let n=[],a="1",u="1",P="166";return{checkoutBaseURL:"https://applerouth.onecanoe.com/registration/create/",checkoutLink:void 0,price:null,testName:void 0,subject:t,method:{id:void 0,name:void 0,step:1},grade:{id:void 0,name:void 0,step:1},level:{id:void 0,name:void 0,step:2},mode:{id:void 0,name:void 0,step:3},flowSteps:["mode","level","method"],isRatesPricing:!0,groupClass:{name:void 0,location:void 0,date:void 0,time:void 0,event_code:void 0,days:void 0,first_practice_test:void 0,prepares_for:void 0},selfPacedCourse:{id:void 0,name:void 0},topic:s,eventTopics:[],hours:0,rates:[],apiBody:{minimum_quantity:0},totalSteps:r,currentStep:1,isOfflineModeAvailable:!0,areRatesAvailable:!0,isLoading:!1,isQueryError:!1,isAffirmLoaded:!0,init(){this.currentStep=1,this.isTestPrep()&&(this.$watch("method.id",()=>{this.onStepOptionUpdate("method")}),this.moveSelfPacedCoursesCMS()),this.$watch("grade.id",()=>{this.onStepOptionUpdate("grade")}),this.$watch("level.id",()=>{this.onStepOptionUpdate("level")}),this.$watch("mode.id",()=>{this.onStepOptionUpdate("mode")}),this.$nextTick(()=>{this.setInitialQueryParams()}),n.push(window.Alpine.effect(()=>{this.currentStep===this.totalSteps&&this.updateCheckoutLink()})),n.push(window.Alpine.effect(()=>{this.currentStep===this.totalSteps&&this.updatePriceFromAPI()}))},destroy(){n.forEach(e=>{window.Alpine.release(e)})},async getRates(){this.isLoading=!0;let e=await new A(this.apiBody).getQueryData();if(this.isLoading=!1,!e){this.isQueryError=!0;return}if(!e.length){this.areRatesAvailable=!1;return}this.rates=e,this.isOfflineModeAvailable=!!e.find(i=>i.instruction_mode_id===1)},setInitialQueryParams(){let e=R();for(let i in e)if(this.flowSteps.includes(i)){let o=i;this[o].id=parseInt(e[i])}else h(i,null)},moveSelfPacedCoursesCMS(){let e=this.$root.querySelector("[data-self-paced-cms]"),i=this.$root.querySelector("[data-self-paced-cms-dropzone]");if(!e||!i){console.warn("Unable to find self-paced CMS source or destination dropzone.","Use `data-self-paced-cms` attribute for Collection List Wrapper and `data-self-paced-cms-dropzone` attribute for destination div",{source:e,destination:i});return}let o=e.cloneNode(!0);i.appendChild(o),e.remove()},resetParams(){h("level",null),this.level.id=void 0,this.level.name=void 0,h("mode",null),this.mode.id=void 0,this.mode.name=void 0,this.clearGroupClass(),this.selfPacedCourse.id=void 0,this.isTestPrep()&&!this.method.id||this.isAcademicTutoring()&&!this.grade.id?this.currentStep=1:this.currentStep=2},onStepOptionUpdate(e){var i,o;if(!this[e].id){e==="method"||e==="grade"?(T(),this.currentStep=1):(h(e,void 0),this.currentStep=this.getNextStep()),this[e].name=void 0;return}e==="method"&&this.onTestPrepMethodUpdate(),e==="grade"&&(this.subject=this.grade.id),this[e].name=((i=this.$refs[`${e}-${this[e].id}-text`])==null?void 0:i.innerText)||void 0,this[e].id!==parseInt(E(e))&&h(e,(o=this[e].id)==null?void 0:o.toString()),this.currentStep=this.getNextStep()},onTestPrepMethodUpdate(){switch(this.method.id){case 1:this.isRatesPricing=!0,this.totalSteps=4;break;case 2:this.isRatesPricing=!1,this.totalSteps=3;break;case 3:this.isRatesPricing=!1,this.totalSteps=3;break;default:this.isRatesPricing=!0,this.totalSteps=4;break}},updatePriceFromAPI(){var d;if(!this.isRatesPricing)return;if(!this.rates.length){console.warn("Trying to update price before the rates being set from the API");return}let e=!!this.flowSteps.includes("level"),i=!!this.flowSteps.includes("mode"),o=(d=this.rates.find(p=>{let f=!1,m=p.subject_id===this.subject,g=e?p.instructor_level_id===this.level.id:!0,C=i?p.instruction_mode_id===this.mode.id:!0;return m&&g&&C&&(f=!0),f}))==null?void 0:d.rate;if(!o){console.warn("No price match found from the API"),console.warn("Subject",this.subject,"Mode",this.mode.id,"Level",this.level.id,"Rates",this.rates);return}let c=parseInt(o);this.price!==c&&(this.price=c)},updateCheckoutLink(){this.checkoutLink=this.getNewCheckoutURL();let e=this.subject||1;if(this.isTestPrepPrivateTutoring()||this.isAcademicTutoring()||this.isExecutiveFunctionCoaching()){let i=this.level.id||a,o=this.mode.id||u;this.checkoutLink.searchParams.set("hours",this.hours.toString()),this.checkoutLink.searchParams.set("subject_id",e.toString()),this.checkoutLink.searchParams.set("instructor_level_id",i.toString()),this.checkoutLink.searchParams.set("instruction_mode_id",o.toString()),this.checkoutLink.searchParams.set("fee_product_id",P),this.topic&&this.checkoutLink.searchParams.set("topics[]",this.topic.toString())}if(this.isTestPrepGroupClass()){if(!this.groupClass.event_code)return;this.checkoutLink.searchParams.set("event_code",this.groupClass.event_code)}if(this.isTestPrepSelfPacedCourse()){if(!this.selfPacedCourse.id)return;this.checkoutLink.searchParams.set("product_id",this.selfPacedCourse.id.toString())}},getNextStep(){let e=1;return this.flowSteps.forEach(i=>{this[i].id&&e<this[i].step?e=this[i].step:!this[i].id&&e>this[i].step&&(e=this[i].step-1)}),e>=this.totalSteps?r:e+1},setMethod(){let e=this.$el.dataset.method;this.method.id=e&&parseInt(e)||void 0},setGrade(){let e=this.$el.dataset.grade;this.grade.id=e&&parseInt(e)||void 0},setLevel(){let e=this.$el.dataset.level;this.level.id=e&&parseInt(e)||void 0},setMode(){let e=this.$el.dataset.mode;this.mode.id=e&&parseInt(e)||void 0,this.updatePriceFromAPI()},setGroupClass(e){var i,o,c,d,p,f,m;if(this.groupClass.name=(i=this.$el.querySelector("[data-name]"))==null?void 0:i.innerText,this.groupClass.location=(o=this.$el.querySelector("[data-location]"))==null?void 0:o.innerText,this.groupClass.date=(c=this.$el.querySelector("[data-date]"))==null?void 0:c.innerText,this.groupClass.time=(d=this.$el.querySelector("[data-time]"))==null?void 0:d.innerText,this.groupClass.prepares_for=(p=this.$el.querySelector("[data-test-date]"))==null?void 0:p.innerText,this.groupClass.address=(f=this.$el.querySelector("[data-address]"))==null?void 0:f.innerText,this.groupClass.event_code=e.event_code,this.price=parseInt(e.price),(m=this.$refs)!=null&&m.groupClassScrollAnchor){let g=I(this.$refs.groupClassScrollAnchor,125);window.scrollTo({top:g,behavior:"smooth"})}},clearGroupClass(){for(let e in this.groupClass)this.groupClass.hasOwnProperty(e)&&(this.groupClass[e]=void 0);this.price=null,this.currentStep=2},setSelfPacedCourse(){var c,d;let e=(c=this.$el.querySelector("[data-name]"))==null?void 0:c.innerText,i=(d=this.$el.querySelector("[data-price]"))==null?void 0:d.innerText,o=this.$el.getAttribute("data-product-id");if(!o||!i){console.error("ID or price not found for the chosen self-paced course",this.$el);return}this.selfPacedCourse.name=e,this.selfPacedCourse.id=parseInt(o),i&&(this.price=parseInt(i)),this.currentStep+=1},isTestPrep(){return this.subject===1},isTestPrepPrivateTutoring(){return this.subject===1&&this.method.id===1},isTestPrepGroupClass(){return this.subject===1&&this.method.id===2},isTestPrepSelfPacedCourse(){return this.subject===1&&this.method.id===3},isAcademicTutoring(){return this.subject&&[2,10,12].includes(this.subject)},isExecutiveFunctionCoaching(){return this.subject===13},reinitWebflowIX2(){S(["ix2"])},getNewCheckoutURL(){return new URL(this.checkoutBaseURL)},getAffirmPricing(e){let i=e*100;return this.$nextTick(()=>{try{affirm.ui.refresh()}catch(o){this.isAffirmLoaded=!1,console.error("Affirm UI Refresh failed after price update. Error stack:"),console.error(o)}}),i}}})});})();
