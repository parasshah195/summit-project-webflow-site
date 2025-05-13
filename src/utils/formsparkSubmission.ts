import { getAnchorScrollOffset } from './getAnchorScrollOffset';

function formsparkSubmission() {
  // @link https://documentation.formspark.io/examples/webflow.html#botpoison-spam-protection
  document
    .querySelectorAll<HTMLFormElement>('form[action^="https://submit-form.com"]')
    .forEach((formEl) => {
      let $form = $(formEl);
      $form.submit(function (e) {
        e.preventDefault();
        $form = $(e.target);
        const action = $form.attr('action');
        const data = Formson.toJSON(new FormData(e.target));
        $.ajax({
          url: action,
          method: 'POST',
          data: data,
          dataType: 'json',
          success: function () {
            const parent = $($form.parent());
            parent.children('form').css('display', 'none');
            parent.children('.w-form-done').css('display', 'block');

            scrollToForm(formEl);
          },
          error: function () {
            const parent = $($form.parent());
            parent.find('.w-form-fail').css('display', 'block');
          },
        });
      });
    });
}

function scrollToForm(formEl: HTMLFormElement) {
  const offset = 150;
  const scrollTo = getAnchorScrollOffset(formEl, offset);
  window.scrollTo({ top: scrollTo, behavior: 'smooth' });
}

window.Webflow?.push(() => {
  formsparkSubmission();
});
