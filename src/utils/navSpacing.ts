const NAVBAR_EL_SELECTOR = '.navbar_component';
const NAV_SPACER_EL_SELECTOR = '.nav-spacer_component';
const ANCHOR_LINK_SELECTOR = '.anchor-link';

const navbarEl: HTMLElement | null = document.querySelector(NAVBAR_EL_SELECTOR);
const navSpacerList = document.querySelectorAll<HTMLElement>(NAV_SPACER_EL_SELECTOR);
const anchorLinkList = document.querySelectorAll<HTMLElement>(ANCHOR_LINK_SELECTOR);

const EVENT_DEBOUNCE_TIMER_IN_MS = 200;

calculateSpacers();

window.Webflow = window.Webflow || [];
window.Webflow.push(() => {
  if (!navbarEl) {
    return;
  }

  if (!navSpacerList.length && !anchorLinkList.length) {
    return;
  }

  calculateSpacers();

  setTimeout(() => {
    setSpacerListeners();
  }, 1000);
});

document.addEventListener(
  'visibilitychange',
  function () {
    if (document.visibilityState === 'visible') {
      // Tab is active
      console.debug('Tab is active');
      setTimeout(() => {
        calculateSpacers();
      }, 500);
    }
  },
  { once: true }
);

function calculateSpacers() {
  console.debug('calculating nav spacers');
  setDynamicNavSpacerHeight();
  setAnchorLinkOffset();
}

function setSpacerListeners() {
  let resizeDebounce: number;
  let scrollDebounce: number;

  window.addEventListener('resize', () => {
    window.requestAnimationFrame(() => {
      clearTimeout(resizeDebounce);

      resizeDebounce = setTimeout(() => {
        setDynamicNavSpacerHeight();
        setAnchorLinkOffset();
      }, EVENT_DEBOUNCE_TIMER_IN_MS);
    });
  });

  if (!anchorLinkList.length) {
    return;
  }

  window.addEventListener('scroll', () => {
    window.requestAnimationFrame(() => {
      clearTimeout(scrollDebounce);

      scrollDebounce = setTimeout(() => {
        setAnchorLinkOffset();
      }, EVENT_DEBOUNCE_TIMER_IN_MS);
    });
  });
}

function setDynamicNavSpacerHeight() {
  navSpacerList.forEach((spacerEl) => {
    spacerEl.style.height = `${navbarEl?.clientHeight}px`;
  });
}

function setAnchorLinkOffset() {
  anchorLinkList.forEach((anchorLinkEl) => {
    anchorLinkEl.style.transform = `translateY(-${navbarEl?.clientHeight}px)`;
  });
}
