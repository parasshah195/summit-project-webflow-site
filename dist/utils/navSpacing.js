"use strict";(()=>{var u=".navbar_component",a=".nav-spacer_component",m=".anchor-link",e=document.querySelector(u),r=document.querySelectorAll(a),i=document.querySelectorAll(m),s=200;o();window.Webflow=window.Webflow||[];window.Webflow.push(()=>{e&&(!r.length&&!i.length||(o(),setTimeout(()=>{d()},1e3)))});document.addEventListener("visibilitychange",function(){document.visibilityState==="visible"&&(console.debug("Tab is active"),setTimeout(()=>{o()},500))},{once:!0});function o(){console.debug("calculating nav spacers"),l(),n()}function d(){let t,c;window.addEventListener("resize",()=>{window.requestAnimationFrame(()=>{clearTimeout(t),t=setTimeout(()=>{l(),n()},s)})}),i.length&&window.addEventListener("scroll",()=>{window.requestAnimationFrame(()=>{clearTimeout(c),c=setTimeout(()=>{n()},s)})})}function l(){r.forEach(t=>{t.style.height=`${e==null?void 0:e.clientHeight}px`})}function n(){i.forEach(t=>{t.style.transform=`translateY(-${e==null?void 0:e.clientHeight}px)`})}})();
