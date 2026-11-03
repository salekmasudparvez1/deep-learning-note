const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

const content = {
  meta: {
    siteTitle: "Parvez AI Eng Routine",
    brandMark: "PA",
    hero: {
      eyebrow: "Personal learning dashboard",
      titleLine1: "Prepare with focus.",
      titleLine2: "Build interview confidence.",
      description:
        "A simple home for AI/ML interview resources, hands-on coding practice, and your daily study routine. Keep it consistent, one problem at a time.",
      primaryCta: { label: "Practice on LeetML ↗", url: "https://leetml.org/" },
      secondaryCta: {
        label: "Open Excel problem tracker ↗",
        url: "https://docs.google.com/spreadsheets/d/1bp1rbBAdUY1kVHD86aSO1NHAPJ9pfE8S2DT0N_4G_9A/edit?usp=sharing",
      },
    },
    nav: [
      { label: "Resources", href: "#resources" },
      { label: "Routine", href: "/routine" },
      { label: "Dashboard", href: "/dashboard" },
    ],
    footer: {
      left: "Parvez AI Eng Routine",
      right: "Simple routine. Consistent practice. Better interviews.",
    },
  },
  tracker: {
    heading: "Problem tracker",
    subheading: "Keep your solved questions and progress in one place.",
    cardTitle: "AI Engineer — Excel / Google Sheets problem list",
    cardDescription: "Your linked spreadsheet for tracking coding problems and study progress.",
    buttonLabel: "Open spreadsheet ↗",
    buttonUrl:
      "https://docs.google.com/spreadsheets/d/1bp1rbBAdUY1kVHD86aSO1NHAPJ9pfE8S2DT0N_4G_9A/edit?usp=sharing",
  },
  performance: {
    heading: "📈 Performance over time",
    statsLabels: {
      total: "Total tasks completed",
      days: "Active days",
      streak: "Current streak",
    },
  },
  resources: {
    heading: "Interview resources",
    subheading: "Curated links for real-world preparation and practice.",
    items: [
      ["AI", "Guide · 2026", "AIMLInterviews", "https://github.com/alirezadir/AIMLInterviews"],
      ["ML", "Question bank", "MLQuestions", "https://github.com/topics/machine-learning-interview-questions"],
      ["★", "Curated", "Awesome AI Interviews", "https://github.com/JustInCache/awesome-ai-interviews"],
      ["DL", "Reference", "AI/ML/DL Interview Resources", "https://github.com/DengZhiyuan-math/awesome-ai-ml-dl-interview-resources/blob/main/README.md"],
      ["LC", "Community", "LeetCode Discuss", "https://leetcode.com/discuss/"],
      ["LM", "Practice", "LeetML", "https://leetml.org/problems.html"],
    ].map(([icon, tag, title, linkUrl]) => ({
      icon,
      tag,
      title,
      linkUrl,
      linkText: "Explore resource ↗",
      description: `Explore ${title} for focused AI/ML interview preparation.`,
    })),
  },
};

function assertConfig() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  }
}

async function supabase(pathname, options = {}) {
  assertConfig();
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${pathname}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message || body?.hint || `Supabase HTTP ${response.status}`);
  }
  return body;
}

function bodyOf(req) {
  return !req.body ? {} : typeof req.body === "string" ? JSON.parse(req.body) : req.body;
}

function id(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

async function readData() {
  const [groups, records] = await Promise.all([
    supabase("routine_groups?select=id,title,subtitle,sort_order&order=sort_order.asc"),
    supabase("routine_records?select=task_id,completed,timestamp&order=timestamp.asc"),
  ]);
  const topics = await supabase(
    `routine_topics?select=id,group_id,title,hint,sort_order&order=sort_order.asc`,
  );
  const topicsByGroup = new Map();
  topics.forEach((topic) => {
    const list = topicsByGroup.get(topic.group_id) || [];
    list.push({ id: topic.id, title: topic.title, hint: topic.hint || "" });
    topicsByGroup.set(topic.group_id, list);
  });
  return {
    ...content,
    routine: {
      heading: "Daily routine",
      subheading: "Check tasks as you complete them. Progress is saved securely in Supabase.",
      groups: groups.map((group) => ({
        id: group.id,
        title: group.title,
        subtitle: group.subtitle || "",
        tasks: topicsByGroup.get(group.id) || [],
      })),
    },
    records: records.map((record) => ({
      taskId: record.task_id,
      completed: record.completed,
      timestamp: record.timestamp,
    })),
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    if (req.method === "GET") return res.status(200).json(await readData());
    const body = bodyOf(req);

    if (req.method === "POST" && (body.type || "record") === "record") {
      const task = await supabase(`routine_topics?id=eq.${encodeURIComponent(body.taskId)}&select=id`);
      if (!body.taskId || typeof body.completed !== "boolean" || !task.length) {
        return res.status(400).json({ error: "A valid taskId and completed boolean are required." });
      }
      const [entry] = await supabase("routine_records", {
        method: "POST",
        body: JSON.stringify({
          task_id: body.taskId,
          completed: body.completed,
          timestamp: body.timestamp || new Date().toISOString(),
        }),
      });
      return res.status(200).json({ ok: true, entry, ...(await readData()) });
    }

    if (req.method === "POST" && body.type === "group") {
      if (!body.title?.trim()) return res.status(400).json({ error: "Group title is required." });
      const [group] = await supabase("routine_groups", {
        method: "POST",
        body: JSON.stringify({ id: id("group"), title: body.title.trim(), subtitle: (body.subtitle || "").trim() }),
      });
      return res.status(201).json({ ok: true, group });
    }

    if (req.method === "POST" && body.type === "topic") {
      if (!body.groupId || !body.title?.trim()) {
        return res.status(400).json({ error: "A valid groupId and topic title are required." });
      }
      const [task] = await supabase("routine_topics", {
        method: "POST",
        body: JSON.stringify({ id: id("topic"), group_id: body.groupId, title: body.title.trim(), hint: (body.hint || "").trim() }),
      });
      return res.status(201).json({ ok: true, task });
    }

    if (req.method === "PUT" && body.type === "topic") {
      if (!body.taskId || !body.title?.trim()) return res.status(400).json({ error: "A valid taskId and topic title are required." });
      const [task] = await supabase(`routine_topics?id=eq.${encodeURIComponent(body.taskId)}`, {
        method: "PATCH",
        body: JSON.stringify({ title: body.title.trim(), hint: (body.hint || "").trim() }),
      });
      return res.status(200).json({ ok: true, task });
    }

    if (req.method === "DELETE" && body.type === "topic") {
      if (!body.taskId) return res.status(400).json({ error: "taskId is required." });
      await supabase(`routine_topics?id=eq.${encodeURIComponent(body.taskId)}`, { method: "DELETE" });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Unsupported method or request type." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
