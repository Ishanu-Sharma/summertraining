import { useState } from "react";

/**
 * Expandable list, used for the FAQ.
 *
 * Built on <button aria-expanded> + a region, rather than <details>/<summary>,
 * for two reasons: the open height can then be animated (a <details> element
 * jumps), and only one panel is open at a time, which <details> cannot express
 * without JavaScript anyway.
 *
 * Every answer stays in the DOM so in-page search (Ctrl+F) and crawlers see it;
 * the closed panel is collapsed with max-height and marked hidden, not removed.
 */
export default function Accordion({ items = [], allowMultiple = false }) {
  const [open, setOpen] = useState(() => new Set());

  function toggle(index) {
    setOpen((prev) => {
      const next = allowMultiple ? new Set(prev) : new Set();
      if (prev.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="accordion">
      {items.map((item, index) => {
        const isOpen = open.has(index);
        return (
          <div className={"accordion__item" + (isOpen ? " is-open" : "")} key={item.q}>
            <h3>
              <button
                type="button"
                className="accordion__trigger"
                aria-expanded={isOpen}
                aria-controls={"faq-panel-" + index}
                id={"faq-trigger-" + index}
                onClick={() => toggle(index)}
              >
                <span>{item.q}</span>
                <i className="fa-solid fa-plus" aria-hidden="true"></i>
              </button>
            </h3>
            <div
              className="accordion__panel"
              id={"faq-panel-" + index}
              role="region"
              aria-labelledby={"faq-trigger-" + index}
            >
              <div className="accordion__panel-inner">{item.a}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
