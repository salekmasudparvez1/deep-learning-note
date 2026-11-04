"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Question = {
  id: string;
  question: string;
  answer: string;
  category: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "not-started" | "reviewing" | "learned";
  created_at?: string;
  updated_at?: string;
};

type Draft = Omit<Question, "id" | "created_at" | "updated_at">;

const emptyDraft: Draft = {
  question: "",
  answer: "",
  category: "",
  topic: "",
  difficulty: "Medium",
  status: "not-started",
};

const statusLabels: Record<Question["status"], string> = {
  "not-started": "Not started",
  reviewing: "Reviewing",
  learned: "Learned",
};

export function QuestionsPanel() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Question | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [modal, setModal] = useState<"view" | "edit" | "create" | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadQuestions = useCallback(async () => {
    try {
      setError("");
      const response = await fetch("/api/questions");
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Failed to load questions.");
      setQuestions(body.questions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // The initial fetch synchronizes this client panel with the database.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadQuestions();
  }, [loadQuestions]);

  const categories = useMemo(
    () => Array.from(new Set(questions.map((item) => item.category).filter(Boolean))).sort(),
    [questions],
  );

  const filteredQuestions = useMemo(() => {
    const term = search.trim().toLowerCase();
    return questions.filter((item) => {
      const searchable = `${item.question} ${item.answer} ${item.category} ${item.topic}`.toLowerCase();
      return (
        (!term || searchable.includes(term)) &&
        (category === "all" || item.category === category) &&
        (status === "all" || item.status === status) &&
        (difficulty === "all" || item.difficulty === difficulty)
      );
    });
  }, [category, difficulty, questions, search, status]);

  function openQuestion(item: Question) {
    setSelected(item);
    setModal("view");
  }

  function openCreate() {
    setSelected(null);
    setDraft(emptyDraft);
    setModal("create");
  }

  function openEdit(item: Question) {
    setSelected(item);
    setDraft({
      question: item.question,
      answer: item.answer,
      category: item.category,
      topic: item.topic,
      difficulty: item.difficulty,
      status: item.status,
    });
    setModal("edit");
  }

  async function saveQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.question.trim()) {
      setError("Question text is required.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const response = await fetch("/api/questions", {
        method: modal === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modal === "edit" ? { ...draft, id: selected?.id } : draft),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Could not save question.");
      setModal(null);
      await loadQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save question.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuestion() {
    if (!selected || !window.confirm("Delete this question permanently?")) return;
    try {
      setSaving(true);
      const response = await fetch("/api/questions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Could not delete question.");
      setModal(null);
      await loadQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete question.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="section questions-page">
      <div className="section-head questions-heading">
        <div>
          <span className="eyebrow">Knowledge library</span>
          <h1>Interview questions</h1>
          <p>Click any question to open its answer, review it, or update its progress.</p>
        </div>
        <button className="btn primary" onClick={openCreate}>＋ New question</button>
      </div>

      <div className="question-toolbar card">
        <label className="search-field">
          <span>Search</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search questions, answers, topics..." />
        </label>
        <label><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="not-started">Not started</option><option value="reviewing">Reviewing</option><option value="learned">Learned</option></select></label>
        <label><span>Difficulty</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="all">All levels</option><option>Easy</option><option>Medium</option><option>Hard</option></select></label>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? <div className="card empty-state"><p>Loading your question bank...</p></div> : filteredQuestions.length === 0 ? (
        <div className="card empty-state"><div className="empty-icon">?</div><h2>{questions.length ? "No matching questions" : "Your question bank is empty"}</h2><p>{questions.length ? "Try changing the filters or search term." : "Add a question to start building your interview library."}</p>{!questions.length && <button className="btn primary" onClick={openCreate}>Add your first question</button>}</div>
      ) : (
        <div className="question-grid">
          {filteredQuestions.map((item) => (
            <button className="question-card" key={item.id} onClick={() => openQuestion(item)}>
              <div className="question-card-top"><span className={`difficulty difficulty-${item.difficulty.toLowerCase()}`}>{item.difficulty}</span><span className={`status status-${item.status}`}>{statusLabels[item.status]}</span></div>
              <h2>{item.question}</h2>
              <p className="answer-preview">{item.answer || "No answer added yet. Click to add one."}</p>
              <div className="question-card-bottom"><span>{item.category || "Uncategorized"}{item.topic ? ` · ${item.topic}` : ""}</span><span className="open-link">Open →</span></div>
            </button>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="question-modal-title">
            {modal === "view" && selected ? (
              <>
                <div className="modal-header"><div><div className="question-card-top"><span className={`difficulty difficulty-${selected.difficulty.toLowerCase()}`}>{selected.difficulty}</span><span className={`status status-${selected.status}`}>{statusLabels[selected.status]}</span></div><h2 id="question-modal-title">{selected.question}</h2></div><button className="icon-button" onClick={() => setModal(null)} aria-label="Close">×</button></div>
                <div className="modal-meta">{selected.category || "Uncategorized"}{selected.topic ? ` · ${selected.topic}` : ""}</div>
                <div className="answer-box"><div className="answer-label">Answer</div><p>{selected.answer || "No answer has been added yet."}</p></div>
                <div className="modal-actions"><button className="btn danger" onClick={deleteQuestion} disabled={saving}>Delete</button><span /><button className="btn" onClick={() => openEdit(selected)}>Edit question</button><button className="btn primary" onClick={() => setModal(null)}>Done</button></div>
              </>
            ) : (
              <form onSubmit={saveQuestion}>
                <div className="modal-header"><div><span className="eyebrow">{modal === "create" ? "New entry" : "Edit entry"}</span><h2 id="question-modal-title">{modal === "create" ? "Add interview question" : "Edit question"}</h2></div><button type="button" className="icon-button" onClick={() => setModal(null)} aria-label="Close">×</button></div>
                <div className="modal-form">
                  <label>Question<textarea required autoFocus rows={3} value={draft.question} onChange={(event) => setDraft({ ...draft, question: event.target.value })} placeholder="What would you like to practice?" /></label>
                  <label>Answer<textarea rows={7} value={draft.answer} onChange={(event) => setDraft({ ...draft, answer: event.target.value })} placeholder="Write the ideal answer or key points..." /></label>
                  <div className="form-grid"><label>Category<input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} placeholder="Machine Learning" /></label><label>Topic<input value={draft.topic} onChange={(event) => setDraft({ ...draft, topic: event.target.value })} placeholder="Neural networks" /></label><label>Difficulty<select value={draft.difficulty} onChange={(event) => setDraft({ ...draft, difficulty: event.target.value as Draft["difficulty"] })}><option>Easy</option><option>Medium</option><option>Hard</option></select></label><label>Status<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as Draft["status"] })}><option value="not-started">Not started</option><option value="reviewing">Reviewing</option><option value="learned">Learned</option></select></label></div>
                </div>
                <div className="modal-actions"><span /><button type="button" className="btn" onClick={() => setModal(null)}>Cancel</button><button className="btn primary" disabled={saving}>{saving ? "Saving..." : modal === "create" ? "Add question" : "Save changes"}</button></div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
