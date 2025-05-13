import { getAnchorScrollOffset } from './getAnchorScrollOffset';

function formSubmitAnchorScroll() {
  const formElList = document.querySelectorAll('form[name^="wf-form-"]');

  formElList.forEach((formEl) => {
    formEl.addEventListener('submit', (e) => {
      // scroll self to reach 150px from the top of the page
      const offset = 150;
      const scrollTo = getAnchorScrollOffset(formEl, offset);
      window.scrollTo({ top: scrollTo, behavior: 'smooth' });
    });
  });
}

window.Webflow?.push(() => {
  formSubmitAnchorScroll();
});
