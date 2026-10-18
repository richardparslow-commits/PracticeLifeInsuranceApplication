import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { DISCLOSURE, formatReceivedAt } from "@/lib/formatApplicationEmail";
import { buildPrintWorksheet, type PrintSection } from "@/lib/printWorksheet";

function Answers({ section }: { section: PrintSection }) {
  return section.rows.length ? (
    <table className="worksheet-print-table">
      <colgroup>
        <col className="worksheet-print-question" />
        <col />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">Question</th>
          <th scope="col">Your answer</th>
        </tr>
      </thead>
      <tbody>
        {section.rows.map((row) => (
          <tr key={row.key}>
            <th scope="row">{row.question}</th>
            <td>
              {row.lines.length > 1 ? (
                <ul>
                  {row.lines.map((line, index) => (
                    <li key={index}>{line}</li>
                  ))}
                </ul>
              ) : (
                row.lines[0]
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p className="worksheet-print-empty">
      No answers recorded in this section.
    </p>
  );
}
export function PrintableWorksheet({ application }: { application: unknown }) {
  const latest = useRef(application);
  latest.current = application;
  const [snapshot, setSnapshot] = useState<{
    preparedAt: Date;
    sections: PrintSection[];
  } | null>(null);
  useEffect(() => {
    // Build only when the browser prints (including Ctrl/Cmd+P), so editing does
    // not keep hundreds of hidden answer rows mounted or duplicate control labels.
    const refresh = () =>
      flushSync(() =>
        setSnapshot({
          preparedAt: new Date(),
          sections: buildPrintWorksheet(latest.current),
        }),
      );
    const clear = () => setSnapshot(null);
    window.addEventListener("beforeprint", refresh);
    window.addEventListener("afterprint", clear);
    return () => {
      window.removeEventListener("beforeprint", refresh);
      window.removeEventListener("afterprint", clear);
    };
  }, []);
  if (!snapshot)
    return (
      <section
        className="print-values hidden"
        aria-label="Printable practice worksheet"
        data-print-worksheet=""
      />
    );
  const timestamp = formatReceivedAt(snapshot.preparedAt);
  return (
    <section
      className="print-values hidden"
      aria-label="Printable practice worksheet"
      data-print-worksheet=""
    >
      <h1 className="worksheet-print-title">
        Practice Life Insurance Application — worksheet copy
      </h1>
      <p className="worksheet-print-disclosure">{DISCLOSURE}</p>
      <p className="worksheet-print-time">
        Prepared for printing: {timestamp.central}
        <br />
        UTC: {timestamp.utc}
      </p>
      <p className="worksheet-print-note">
        This local copy may contain unfinished answers. Blank questions are
        omitted; an empty section means no answers are recorded. Printing does
        not submit the worksheet.
      </p>
      {snapshot.sections.map((section) => (
        <section
          key={section.key}
          data-print-section={section.key}
          className="worksheet-print-section"
        >
          <h2>{section.title}</h2>
          <Answers section={section} />
          {section.modules?.map((module) => (
            <section key={module.key} className="worksheet-print-module">
              <h3>{module.title}</h3>
              <Answers section={module} />
            </section>
          ))}
        </section>
      ))}
    </section>
  );
}
