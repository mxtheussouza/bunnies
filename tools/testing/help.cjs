const assert = require("node:assert/strict");
const guide = require("../../docs/10-user-guide/guide.json");

// Uses only the isolated packaged smoke profile. No app IPC or network capability is added.
module.exports = async function verifyHelp(
  page,
  window,
  { resize, captureNative },
) {
  await page.context().setOffline(true);
  try {
    await resize(1440, 900);
    await page.reload();
    await page
      .getByRole("heading", { name: "Conexões", exact: true })
      .waitFor();
    const help = page.getByRole("button", { name: "Ajuda", exact: true });
    await help.focus();
    await page.keyboard.press("Enter");
    const heading = page.getByRole("heading", { name: "Ajuda", exact: true });
    await heading.waitFor();
    assert.equal(
      await heading.evaluate(element => element === document.activeElement),
      true,
    );
    const article = page.getByRole("article", { name: guide.title });
    const text = await article.textContent();
    assert.ok(text.includes(guide.introduction));
    for (const section of guide.sections) {
      await article
        .getByRole("heading", { name: section.title, exact: true })
        .waitFor();
      for (const paragraph of [
        ...section.paragraphs,
        ...(section.steps ?? []),
        ...(section.notes ?? []),
      ])
        assert.ok(text.includes(paragraph));
      for (const field of section.fields ?? []) {
        assert.ok(text.includes(field.name));
        assert.ok(text.includes(field.description));
        if (field.example) assert.ok(text.includes(field.example));
      }
      for (const problem of section.problems ?? []) {
        assert.ok(text.includes(problem.symptom));
        assert.ok(text.includes(problem.action));
      }
    }
    assert.equal(await article.locator("a, iframe, script, form").count(), 0);
    const index = article.getByRole("navigation", {
      name: "Tópicos da ajuda",
      exact: true,
    });
    assert.equal(
      await index.getByRole("button").count(),
      guide.sections.length,
    );
    await page
      .getByRole("combobox", { name: "Tema", exact: true })
      .selectOption("light");
    await page.waitForFunction(
      () => document.documentElement.dataset.theme === "light",
    );
    const topic = index.getByRole("button", {
      name: "Criar um perfil local",
      exact: true,
    });
    await topic.focus();
    await page.keyboard.press("Enter");
    assert.equal(
      await article
        .getByRole("heading", { name: "Criar um perfil local", exact: true })
        .evaluate(element => element === document.activeElement),
      true,
    );
    await captureNative("out/help-doc1-fields-light.png");
    await article
      .getByRole("region", { name: "Criar um perfil local", exact: true })
      .getByRole("button", { name: "Voltar ao índice", exact: true })
      .click();
    assert.equal(
      await index
        .getByRole("button")
        .first()
        .evaluate(element => element === document.activeElement),
      true,
    );
    await page
      .getByRole("combobox", { name: "Tema", exact: true })
      .selectOption("dark");
    await page.waitForFunction(
      () => document.documentElement.dataset.theme === "dark",
    );
    await index.getByRole("button").first().focus();
    await captureNative("out/help-doc1-index-dark.png");
    await resize(1024, 700);
    await window.evaluate(win => win.webContents.setZoomFactor(2));
    await page.waitForFunction(() => window.innerWidth <= 512);
    await page
      .getByRole("button", { name: "Expandir navegação", exact: true })
      .click();
    const panel = page.getByRole("dialog", { name: "Navegação", exact: true });
    await panel
      .getByRole("button", { name: "Ajuda", exact: true })
      .scrollIntoViewIfNeeded();
    await panel.getByRole("button", { name: "Ajuda", exact: true }).click();
    await panel.waitFor({ state: "hidden" });
    await index
      .getByRole("button", { name: "Resolver problemas", exact: true })
      .focus();
    await page.keyboard.press("Enter");
    const problems = article.getByRole("region", {
      name: "Resolver problemas",
      exact: true,
    });
    assert.equal(
      await problems
        .getByRole("heading")
        .evaluate(element => element === document.activeElement),
      true,
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
      true,
    );
    await captureNative("out/help-doc1-zoom200.png");
    const back = problems.getByRole("button", {
      name: "Voltar ao índice",
      exact: true,
    });
    await back.scrollIntoViewIfNeeded();
    await back.focus();
    assert.equal(
      await back.evaluate(button => {
        const rect = button.getBoundingClientRect();
        const main = document.querySelector("main").getBoundingClientRect();
        return (
          rect.top >= main.top &&
          rect.bottom <= main.bottom &&
          rect.left >= main.left &&
          rect.right <= main.right
        );
      }),
      true,
    );
    await page.keyboard.press("Enter");
    assert.equal(
      await index
        .getByRole("button")
        .first()
        .evaluate(element => element === document.activeElement),
      true,
    );
    assert.equal(page.url(), "bunnies://app/app_window/index.html");
    await window.evaluate(win => win.webContents.setZoomFactor(1));
    await resize(1440, 900);
    await page
      .getByRole("combobox", { name: "Tema", exact: true })
      .selectOption("light");
    await page.waitForFunction(
      () => document.documentElement.dataset.theme === "light",
    );
    await page.getByRole("button", { name: "Conexões", exact: true }).click();
    return {
      offline: true,
      completeContent: true,
      sections: guide.sections.length,
      keyboard: true,
      focus: true,
      compactPanel: true,
      zoom200: true,
      fixedUrl: true,
    };
  } finally {
    await page.context().setOffline(false);
  }
};
