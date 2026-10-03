import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/format";

/**
 * The admin panel's alumni stories editor.
 *
 * Deliberately plain-text, not a rich text editor: the public page renders the
 * body as paragraphs split on blank lines and never as HTML, so nothing typed
 * here can inject markup into a visitor's page.
 *
 * New stories start as drafts. Publishing is a separate, confirmed action,
 * because a story is about a real person and goes out under the university's
 * name.
 */

const BLANK = {
  title: "", subjectName: "", subjectRole: "", subjectUserId: "",
  gradYear: "", department: "", summary: "", body: "", outcome: ""
};

export default function StoriesPanel({ stories, alumni, onSave, onTogglePublished, onDelete }) {
  const [editing, setEditing] = useState(null); // a story id, or "new", or null
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function startNew() {
    setForm(BLANK);
    setErrors({});
    setEditing("new");
  }

  function startEdit(story) {
    setForm({
      title: story.title || "",
      subjectName: story.subjectName || "",
      subjectRole: story.subjectRole || "",
      subjectUserId: story.subjectUserId || "",
      gradYear: story.gradYear || "",
      department: story.department || "",
      summary: story.summary || "",
      body: story.body || "",
      outcome: story.outcome || ""
    });
    setErrors({});
    setEditing(story.id);
  }

  function set(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    const e = {};
    if (!form.title.trim()) e.title = "Give the story a headline.";
    if (!form.subjectName.trim()) e.subjectName = "Who is this story about?";
    if (form.summary.trim().length < 20) e.summary = "Write a summary of at least 20 characters.";
    if (form.body.trim().length < 80) e.body = "The story body needs at least 80 characters.";
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      await onSave(
        {
          ...form,
          gradYear: form.gradYear ? parseInt(form.gradYear, 10) : null,
          subjectUserId: form.subjectUserId || null
        },
        editing === "new" ? null : editing
      );
      setEditing(null);
      setForm(BLANK);
    } catch (err) {
      setErrors({ body: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card card--pad-lg">
      <div className="flex-between" style={{ marginBottom: 18 }}>
        <div>
          <h4>Alumni Stories</h4>
          <p className="text-soft" style={{ fontSize: ".9rem" }}>
            Published stories appear on <Link to="/stories">the public stories page</Link>.
            Drafts are visible only here.
          </p>
        </div>
        {editing === null && (
          <button type="button" className="btn btn-primary btn-sm" onClick={startNew}>
            <i className="fa-solid fa-plus" aria-hidden="true"></i> Write a story
          </button>
        )}
      </div>

      {editing !== null && (
        <form onSubmit={submit} className="story-form" noValidate>
          <div className={"field" + (errors.title ? " has-error" : "")}>
            <label htmlFor="stTitle">Headline</label>
            <input
              id="stTitle"
              type="text"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="From the Panikhaiti labs to a chip design team"
            />
            {errors.title && (
              <span className="field-error">
                <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i> {errors.title}
              </span>
            )}
          </div>

          <div className="field-row">
            <div className={"field" + (errors.subjectName ? " has-error" : "")}>
              <label htmlFor="stName">Graduate&rsquo;s name</label>
              <input
                id="stName"
                type="text"
                value={form.subjectName}
                onChange={e => set("subjectName", e.target.value)}
                placeholder="Full name"
              />
              {errors.subjectName && (
                <span className="field-error">
                  <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i> {errors.subjectName}
                </span>
              )}
            </div>
            <div className="field">
              <label htmlFor="stRole">Current role</label>
              <input
                id="stRole"
                type="text"
                value={form.subjectRole}
                onChange={e => set("subjectRole", e.target.value)}
                placeholder="Design verification engineer"
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="stYear">Graduating year</label>
              <input
                id="stYear"
                type="number"
                min="1990"
                max="2040"
                value={form.gradYear}
                onChange={e => set("gradYear", e.target.value)}
                placeholder="2019"
              />
            </div>
            <div className="field">
              <label htmlFor="stDept">Department</label>
              <input
                id="stDept"
                type="text"
                value={form.department}
                onChange={e => set("department", e.target.value)}
                placeholder="Electronics and Communication"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="stUser">Link to their profile on The Quad</label>
            <select id="stUser" value={form.subjectUserId} onChange={e => set("subjectUserId", e.target.value)}>
              <option value="">Not on The Quad, or keep unlinked</option>
              {alumni.map(u => (
                <option key={u.id} value={u.id}>
                  {u.fullName}{u.gradYear ? " (" + u.gradYear + ")" : ""}
                </option>
              ))}
            </select>
            <span className="field-hint">Adds a &ldquo;View profile&rdquo; button to the story.</span>
          </div>

          <div className={"field" + (errors.summary ? " has-error" : "")}>
            <label htmlFor="stSummary">Summary</label>
            <textarea
              id="stSummary"
              rows={2}
              value={form.summary}
              onChange={e => set("summary", e.target.value)}
              placeholder="One or two sentences. This is what shows on the stories list and in search results."
            />
            {errors.summary && (
              <span className="field-error">
                <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i> {errors.summary}
              </span>
            )}
          </div>

          <div className="field">
            <label htmlFor="stOutcome">The concrete outcome</label>
            <input
              id="stOutcome"
              type="text"
              value={form.outcome}
              onChange={e => set("outcome", e.target.value)}
              placeholder="Hired through a referral from a 2015 graduate"
            />
            <span className="field-hint">Optional. Keep it factual and specific.</span>
          </div>

          <div className={"field" + (errors.body ? " has-error" : "")}>
            <label htmlFor="stBody">The story</label>
            <textarea
              id="stBody"
              rows={10}
              value={form.body}
              onChange={e => set("body", e.target.value)}
              placeholder="Plain text. Leave a blank line between paragraphs."
            />
            {errors.body ? (
              <span className="field-error">
                <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i> {errors.body}
              </span>
            ) : (
              <span className="field-hint">Plain text only. Blank lines become paragraph breaks.</span>
            )}
          </div>

          <div className="flex gap-sm flex-wrap">
            <button type="submit" className={"btn btn-primary" + (saving ? " is-loading" : "")} disabled={saving}>
              {saving ? "Saving" : editing === "new" ? "Save as draft" : "Save changes"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setErrors({}); }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {editing === null && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Story</th><th>Graduate</th><th>Status</th><th>Published</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {stories.map(story => (
                <tr key={story.id}>
                  <td>
                    <strong>{story.title}</strong>
                    <div className="text-faint" style={{ fontSize: ".82rem" }}>{story.summary}</div>
                  </td>
                  <td>
                    {story.subjectName}
                    {story.gradYear ? (
                      <div className="text-faint" style={{ fontSize: ".82rem" }}>Class of {story.gradYear}</div>
                    ) : null}
                  </td>
                  <td>
                    <span className={"status-pill " + (story.published ? "approved" : "pending")}>
                      {story.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td>{story.publishedAt ? formatDate(story.publishedAt) : "Not yet"}</td>
                  <td>
                    <div className="flex gap-sm flex-wrap">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEdit(story)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => onTogglePublished(story)}>
                        {story.published ? "Unpublish" : "Publish"}
                      </button>
                      {story.published && (
                        <Link to={"/stories/" + story.slug} className="btn btn-ghost btn-sm">View</Link>
                      )}
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(story)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!stories.length && (
                <tr>
                  <td colSpan={5}>
                    <p className="text-faint" style={{ padding: "20px 0" }}>
                      No stories yet. The public stories page shows an empty state until the
                      first one is published, which is intentional: nothing here is filled in
                      with made-up examples.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
