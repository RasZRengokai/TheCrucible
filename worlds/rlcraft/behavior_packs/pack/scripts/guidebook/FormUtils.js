import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";
import { Player } from "@minecraft/server";

export function modalForm(pl, cat, opts, back) {
  let frm = new ModalFormData().title(`form.ecbl_bc.guide_book.${cat}.title`);
  opts.forEach((o) => {
    if (o.type === "toggle") {
      frm.toggle(`form.ecbl_bc.guide_book.${cat}.${o.text}`, !!o.default);
    } else if (o.type === "slider") {
      frm.slider(`form.ecbl_bc.guide_book.${cat}.${o.text}`, o.min ?? 0, o.max ?? 10, o.step ?? 1, o.default ?? 0);
    } else if (o.type === "dropdown") {
      frm.dropdown(`form.ecbl_bc.guide_book.${cat}.${o.text}`, o.options ?? [], o.default ?? 0);
    }
  });
  frm.show(pl).then((res) => {
    if (res.canceled) return;
    if (typeof back === "function") back(pl, res.formValues);
  });
}

/**
 * Displays an action form with support for nested forms.
 * @param {Player} player
 * @param {string} category
 * @param {Array<{text: string, image?: string, subpages?: any[]}>} pages
 * @param {() => {}} back
 */
export function actionForm(player, category, pages, back) {
  const form = new ActionFormData()
    .title(`form.ecbl_bc.guide_book.${category}.title`)
    .body(`form.ecbl_bc.guide_book.${category}.body`);

  // Generate buttons dynamically
  pages.forEach((p) => {
    if (p?.image) {
      form.button(`form.ecbl_bc.guide_book.${category}.${p.text}`, p.image);
    } else {
      form.button(`form.ecbl_bc.guide_book.${category}.${p.text}`);
    }
  });

  if (back) {
    form.button(`form.ecbl_bc.guide_book.button.back`, "textures/eternal/better_structures/guide/back");
  }
  form.button(`form.ecbl_bc.guide_book.button.close`, "textures/eternal/better_structures/guide/quit");

  form.show(player).then((r) => {
    if (r.canceled || r.selection === pages.length + (back ? 1 : 0)) return;
    if (typeof back === "function" && r.selection === pages.length) {
      back(player);
      return;
    }

    const selectedPage = pages[r.selection];

    if (selectedPage.newForm) {
      if (typeof selectedPage.newForm === "function") {
        selectedPage.newForm(player);
      }
      return;
    }

    if (selectedPage.subpages) {
      actionForm(player, `${selectedPage.text}`, selectedPage.subpages, () => {
        actionForm(player, category, pages, back);
      });
    } else {
      messageForm(player, category, selectedPage.text, () => {
        actionForm(player, category, pages, back);
      });
    }
  });
}

/**
 * Displays a message form.
 * @param {Player} player
 * @param {string} category
 * @param {string} topic
 * @param {() => {}} back
 */
export function messageForm(player, category, topic, back) {
  new MessageFormData()
    .title(`form.ecbl_bc.guide_book.${category}.${topic}.title`)
    .body({ rawtext: [{ translate: `form.ecbl_bc.guide_book.${category}.${topic}.body` }] })
    .button2(`form.ecbl_bc.guide_book.button.back`)
    .button1(`form.ecbl_bc.guide_book.button.close`)
    .show(player)
    .then((r) => {
      if (r.canceled) return;
      if (r.selection === 1) {
        back(player);
      }
    });
}
