// ------------------------------------------------------------------
// CONFIG
// ------------------------------------------------------------------
const API_BASE = "/api"; // Vercel serverless endpoint (api.json.js)
const TASK_IDS = ["t1", "t2", "t3", "t4", "t5", "t6"];

// ------------------------------------------------------------------
// STATE
// ------------------------------------------------------------------
let records = []; // array of { taskId, completed, timestamp }
let taskStates = {}; // current checked state per task

// DOM refs
const errorBanner = document.getElementById("errorBanner");
const statTotal = document.getElementById("statTotal");
const statDays = document.getElementById("statDays");
const statStreak = document.getElementById("statStreak");
const filterFrom = document.getElementById("filterFrom");
const filterTo = document.getElementById("filterTo");
const resetFilter = document.getElementById("resetFilter");
const canvas = document.getElementById("perfChart");
const chartEmpty = document.getElementById("chartEmpty");
const ctx = canvas.getContext("2d");

// ------------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------------
function showError(msg) {
    errorBanner.textContent = msg;
    errorBanner.style.display = msg ? "block" : "none";
}

function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

// returns YYYY-MM-DD in local time (for grouping / filtering)
function localDateKey(iso) {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

// compute stats & aggregated daily counts from current records + filter
function computeStats() {
    const from = filterFrom.value
        ? new Date(filterFrom.value + "T00:00:00")
        : null;
    const to = filterTo.value
        ? new Date(filterTo.value + "T23:59:59")
        : null;

    const filtered = records.filter((r) => {
        const t = new Date(r.timestamp);
        if (from && t < from) return false;
        if (to && t > to) return false;
        return true;
    });

    // total completed (only "completed: true" events count toward performance)
    const completedEvents = filtered.filter((r) => r.completed === true);
    const total = completedEvents.length;

    // group by local date
    const dayMap = new Map(); // dateKey -> count
    completedEvents.forEach((r) => {
        const key = localDateKey(r.timestamp);
        dayMap.set(key, (dayMap.get(key) || 0) + 1);
    });

    const days = dayMap.size;

    // streak: consecutive days ending today (or yesterday if today has 0)
    const todayKey = localDateKey(new Date().toISOString());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = localDateKey(yesterday.toISOString());

    let streak = 0;
    let checkKey = dayMap.has(todayKey)
        ? todayKey
        : dayMap.has(yKey)
            ? yKey
            : null;
    if (checkKey) {
        let d = new Date(checkKey + "T12:00:00");
        while (dayMap.has(localDateKey(d.toISOString()))) {
            streak++;
            d.setDate(d.getDate() - 1);
        }
    }

    // chart data: sorted date keys
    const sortedKeys = Array.from(dayMap.keys()).sort();
    const chartData = sortedKeys.map((k) => ({
        date: k,
        count: dayMap.get(k),
    }));

    return {
        total,
        days,
        streak,
        chartData,
        filteredCount: filtered.length,
    };
}

// ------------------------------------------------------------------
// CHART (simple line chart, no external lib)
// ------------------------------------------------------------------
function drawChart() {
    const { chartData } = computeStats();
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    if (!chartData.length) {
        chartEmpty.style.display = "grid";
        canvas.style.display = "none";
        return;
    }
    chartEmpty.style.display = "none";
    canvas.style.display = "block";

    const pad = { top: 18, right: 16, bottom: 28, left: 32 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    const maxCount = Math.max(...chartData.map((d) => d.count), 1);
    const yStep = Math.max(1, Math.ceil(maxCount / 4));

    // axes
    ctx.strokeStyle = "#e7eaf0";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#9aa5b5";
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let i = 0; i <= maxCount; i += yStep) {
        const y = pad.top + plotH - (i / maxCount) * plotH;
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(w - pad.right, y);
        ctx.stroke();
        ctx.fillText(i, pad.left - 6, y);
    }

    // x positions
    const n = chartData.length;
    const xFor = (i) => {
        if (n === 1) return pad.left + plotW / 2;
        return pad.left + (i / (n - 1)) * plotW;
    };
    const yFor = (v) => pad.top + plotH - (v / maxCount) * plotH;

    // line + area
    ctx.beginPath();
    chartData.forEach((d, i) => {
        const x = xFor(i);
        const y = yFor(d.count);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2.2;
    ctx.lineJoin = "round";
    ctx.stroke();

    // area fill
    ctx.lineTo(xFor(n - 1), pad.top + plotH);
    ctx.lineTo(xFor(0), pad.top + plotH);
    ctx.closePath();
    ctx.fillStyle = "rgba(37,99,235,0.08)";
    ctx.fill();

    // points
    chartData.forEach((d, i) => {
        const x = xFor(i);
        const y = yFor(d.count);
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#2563eb";
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
    });

    // x labels (show up to ~6)
    ctx.fillStyle = "#9aa5b5";
    ctx.font = "9px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const step = Math.max(1, Math.ceil(n / 6));
    chartData.forEach((d, i) => {
        if (i % step === 0 || i === n - 1) {
            const x = xFor(i);
            const label = d.date.slice(5); // MM-DD
            ctx.fillText(label, x, pad.top + plotH + 6);
        }
    });
}

// ------------------------------------------------------------------
// UI REFRESH
// ------------------------------------------------------------------
function updateStatsUI() {
    const { total, days, streak } = computeStats();
    statTotal.textContent = total;
    statDays.textContent = days;
    statStreak.textContent = streak;
}

function renderTasksFromRecords() {
    // reset
    taskStates = {};
    TASK_IDS.forEach((id) => {
        taskStates[id] = false;
    });

    // sort records by timestamp ascending, latest wins
    const sorted = [...records].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    );
    sorted.forEach((r) => {
        if (TASK_IDS.includes(r.taskId)) {
            taskStates[r.taskId] = !!r.completed;
        }
    });

    TASK_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.checked = taskStates[id];
        el.closest(".task").classList.toggle("done", taskStates[id]);
    });
}

// ------------------------------------------------------------------
// API CALLS
// ------------------------------------------------------------------
async function fetchAllRecords() {
    try {
        const res = await fetch(API_BASE, {
            headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        records = Array.isArray(data.records) ? data.records : [];
        showError("");
    } catch (err) {
        console.error("Failed to load records:", err);
        showError(
            "⚠️ Could not load saved data from api.json. Changes will be kept in memory until the API is available.",
        );
        // fall back to empty / cached in-memory
        records = records || [];
    }
}

async function postRecord(taskId, completed) {
    const entry = {
        taskId,
        completed,
        timestamp: new Date().toISOString(),
    };

    // optimistic update
    records.push(entry);
    renderTasksFromRecords();
    updateStatsUI();
    drawChart();

    try {
        const res = await fetch(API_BASE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(entry),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const saved = await res.json();
        // If server returns full records, sync them
        if (saved && Array.isArray(saved.records)) {
            records = saved.records;
            renderTasksFromRecords();
            updateStatsUI();
            drawChart();
        }
        showError("");
    } catch (err) {
        console.error("Failed to save record:", err);
        showError(
            "⚠️ Could not save to api.json. The change is only in memory for now.",
        );
    }
}

// ------------------------------------------------------------------
// EVENT BINDINGS
// ------------------------------------------------------------------
function bindTaskCheckboxes() {
    TASK_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("change", () => {
            const completed = el.checked;
            el.closest(".task").classList.toggle("done", completed);
            postRecord(id, completed);
        });
    });
}

function bindFilters() {
    function onFilterChange() {
        updateStatsUI();
        drawChart();
    }
    filterFrom.addEventListener("change", onFilterChange);
    filterTo.addEventListener("change", onFilterChange);
    resetFilter.addEventListener("click", () => {
        filterFrom.value = "";
        filterTo.value = "";
        onFilterChange();
    });
}

// redraw on resize
let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => drawChart(), 120);
});

// ------------------------------------------------------------------
// INIT
// ------------------------------------------------------------------
(async function init() {
    document.getElementById("year").textContent = new Date().getFullYear();

    // build initial state from any cached (optional)
    const cached = localStorage.getItem("parvez-routine-cache");
    if (cached) {
        try {
            records = JSON.parse(cached);
        } catch (e) { }
    }

    // load from API
    await fetchAllRecords();

    // cache for quick start next time (in case API is slow)
    try {
        localStorage.setItem("parvez-routine-cache", JSON.stringify(records));
    } catch (e) { }

    renderTasksFromRecords();
    updateStatsUI();
    drawChart();

    bindTaskCheckboxes();
    bindFilters();

    // periodic cache refresh (every 20s)
    setInterval(() => {
        try {
            localStorage.setItem(
                "parvez-routine-cache",
                JSON.stringify(records),
            );
        } catch (e) { }
    }, 20000);
})();