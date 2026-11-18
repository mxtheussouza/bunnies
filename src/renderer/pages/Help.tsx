import React from "react";
import guideData from "../../../docs/10-user-guide/guide.json";
import Button from "../components/Button";
import Card from "../components/Card";
import "./help.scss";

type GuideSection = {
  id: string;
  title: string;
  paragraphs: string[];
  steps?: string[];
  fields?: { name: string; description: string; example?: string }[];
  notes?: string[];
  problems?: { symptom: string; action: string }[];
};
const guide: { title: string; introduction: string; sections: GuideSection[] } =
  guideData;

export default function Help() {
  const headings = React.useRef<Record<string, HTMLHeadingElement | null>>({});
  const firstTopic = React.useRef<HTMLButtonElement>(null);
  function openTopic(id: string) {
    const heading = headings.current[id];
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ block: "start" });
  }
  return (
    <article className="help-guide" aria-label={guide.title}>
      <Card className="help-index">
        <h2>Guia do usuário</h2>
        <p>{guide.introduction}</p>
        <nav aria-label="Tópicos da ajuda">
          <ol>
            {guide.sections.map((section, index) => (
              <li key={section.id}>
                <button
                  ref={index === 0 ? firstTopic : undefined}
                  type="button"
                  className="help-topic"
                  onClick={() => openTopic(section.id)}
                >
                  {section.title}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </Card>
      {guide.sections.map(section => (
        <section
          className="help-section card"
          key={section.id}
          aria-labelledby={`help-title-${section.id}`}
        >
          <h2
            tabIndex={-1}
            id={`help-title-${section.id}`}
            ref={node => {
              headings.current[section.id] = node;
            }}
          >
            {section.title}
          </h2>
          {section.paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
          {section.steps && (
            <ol>
              {section.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          )}
          {section.fields && (
            <dl className="help-fields">
              {section.fields.map(field => (
                <div key={field.name}>
                  <dt>{field.name}</dt>
                  <dd>
                    <p>{field.description}</p>
                    {field.example && (
                      <p className="help-example">
                        Exemplo fictício: <code>{field.example}</code>
                      </p>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {section.notes && (
            <ul>
              {section.notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          )}
          {section.problems && (
            <dl className="help-fields">
              {section.problems.map(problem => (
                <div key={problem.symptom}>
                  <dt>{problem.symptom}</dt>
                  <dd>{problem.action}</dd>
                </div>
              ))}
            </dl>
          )}
          <Button
            variant="quiet"
            onClick={() => {
              firstTopic.current?.focus();
              firstTopic.current?.scrollIntoView({ block: "center" });
            }}
          >
            Voltar ao índice
          </Button>
        </section>
      ))}
    </article>
  );
}
