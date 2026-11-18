const { readFileSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");
const directory = resolve(__dirname, "../../docs/10-user-guide");
const guide = JSON.parse(
  readFileSync(resolve(directory, "guide.json"), "utf8"),
);
function tableText(value) {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}
function render() {
  const lines = [
    `# ${guide.title}`,
    "",
    "<!-- Gerado de guide.json por npm run docs:generate. Não editar este Markdown diretamente. -->",
    "",
    guide.introduction,
    "",
    "## Índice",
    "",
    ...guide.sections.map(section => `- [${section.title}](#${section.id})`),
    "",
  ];
  const ids = new Set();
  for (const section of guide.sections) {
    if (!/^[a-z0-9-]+$/.test(section.id) || ids.has(section.id))
      throw new Error("Identificador de seção inválido/duplicado.");
    ids.add(section.id);
    lines.push(`<a id="${section.id}"></a>`, "", `## ${section.title}`, "");
    for (const paragraph of section.paragraphs) lines.push(paragraph, "");
    if (section.steps) {
      section.steps.forEach((step, index) =>
        lines.push(`${index + 1}. ${step}`),
      );
      lines.push("");
    }
    if (section.fields) {
      lines.push(
        "| Campo ou função | Como usar / para que serve | Exemplo fictício |",
        "| --- | --- | --- |",
      );
      section.fields.forEach(field =>
        lines.push(
          `| ${tableText(field.name)} | ${tableText(field.description)} | ${tableText(field.example ?? "—")} |`,
        ),
      );
      lines.push("");
    }
    if (section.notes) {
      section.notes.forEach(note => lines.push(`- ${note}`));
      lines.push("");
    }
    if (section.problems) {
      lines.push("| Situação | O que fazer |", "| --- | --- |");
      section.problems.forEach(problem =>
        lines.push(
          `| ${tableText(problem.symptom)} | ${tableText(problem.action)} |`,
        ),
      );
      lines.push("");
    }
  }
  return lines.join("\n");
}
const output = resolve(directory, "README.md");
const mode = process.argv[2];
if (process.argv.length !== 3 || !["--write", "--check"].includes(mode)) {
  console.error("Use --write para gerar ou --check para conferir o guia.");
  process.exitCode = 1;
} else {
  const expected = render();
  if (mode === "--write") {
    writeFileSync(output, expected);
    console.log("Guia do usuário gerado.");
  } else if (readFileSync(output, "utf8") !== expected) {
    console.error(
      "Guia divergente. Execute npm run docs:generate e revise o resultado.",
    );
    process.exitCode = 1;
  } else console.log("Guia do usuário sincronizado com a Ajuda offline.");
}
