const chartData = {
  rd: {
    max: 3,
    suffix: "%",
    decimals: 2,
    points: [
      ["2023", 2.58],
      ["2024", 2.69],
      ["2025", 2.8],
    ],
  },
  fiscal: {
    max: 13000,
    suffix: "亿",
    decimals: 0,
    points: [
      ["2023", 10886],
      ["2024", 11510],
      ["2025", 12062],
    ],
  },
  share: {
    max: 20,
    suffix: "%",
    decimals: 1,
    points: [
      ["2023", 15.7],
      ["2024", 16.3],
      ["2025", 17.1],
    ],
  },
  ipo: {
    max: 100,
    suffix: "%",
    decimals: 0,
    points: [
      ["2023", 74],
      ["2024", 60],
      ["2025", 67],
    ],
  },
  fund: {
    max: 12.84,
    suffix: "万亿",
    decimals: 2,
    points: [
      ["目标规模", 12.84],
      ["已认缴", 7.7],
      ["产业/创投已认缴", 6.44],
    ],
  },
  ipoBoards: {
    max: 116,
    suffix: "家",
    decimals: 0,
    points: [
      ["创业板", 33],
      ["北交所", 26],
      ["科创板", 19],
      ["主板", 38],
    ],
  },
};

function formatValue(value, suffix, decimals) {
  if (suffix === "亿") return `${value.toLocaleString("zh-CN")}${suffix}`;
  if (suffix === "家") return `${value.toFixed(0)}${suffix}`;
  return `${value.toFixed(decimals)}${suffix}`;
}

document.querySelectorAll("[data-chart]").forEach((chart) => {
  const data = chartData[chart.dataset.chart];
  chart.innerHTML = data.points
    .map(([year, value]) => {
      const width = Math.max(5, Math.round((value / data.max) * 100));
      return `
        <div class="bar-row">
          <span>${year}</span>
          <span class="bar-track" aria-hidden="true">
            <span class="bar-fill" style="--w: ${width}%"></span>
          </span>
          <span class="bar-value">${formatValue(value, data.suffix, data.decimals)}</span>
        </div>
      `;
    })
    .join("");
});

const eraColors = {
  state: "#23384d",
  export: "#0f8b6d",
  land: "#c18a1f",
  tech: "#2563eb",
};

document.querySelectorAll(".era-card").forEach((card) => {
  card.addEventListener("mouseenter", () => {
    document.querySelectorAll(".era-card").forEach((item) => item.classList.remove("active"));
    card.classList.add("active");
    document.documentElement.style.setProperty("--deep", eraColors[card.dataset.era]);
  });
});

const editToggle = document.querySelector("#editToggle");
const editStatus = document.querySelector("#editStatus");
const editableSelector = [
  "h1",
  "h2",
  "h3",
  "h4",
  "p",
  ".brand",
  ".lead",
  ".hero-note",
  ".era-card strong",
  ".metric-name",
  ".evidence-tag",
  ".number-note",
  ".mini-stats span",
  ".tax-grid span",
  ".tax-grid strong",
  ".tax-grid small",
  ".policy-row span",
  ".policy-row strong",
  ".closing p",
].join(",");
const editableNodes = [...document.querySelectorAll(editableSelector)].filter(
  (node) => !node.closest("footer") && !node.closest(".bars") && !node.closest(".source-links"),
);
const editStorageKey = "china-credit-site-edits";

function setEditStatus(message, showReset = false) {
  if (!editStatus) return;
  editStatus.innerHTML = message
    ? `${message}${showReset ? '<button class="reset-edit-btn" type="button">重置</button>' : ""}`
    : "";
  editStatus.classList.toggle("visible", Boolean(message));
  editStatus.querySelector(".reset-edit-btn")?.addEventListener("click", () => {
    localStorage.removeItem(editStorageKey);
    window.location.reload();
  });
}

function saveEdits() {
  const edits = editableNodes.map((node) => node.innerHTML);
  localStorage.setItem(editStorageKey, JSON.stringify(edits));
}

function loadEdits() {
  const raw = localStorage.getItem(editStorageKey);
  if (!raw) return;
  try {
    const edits = JSON.parse(raw);
    editableNodes.forEach((node, index) => {
      if (typeof edits[index] === "string") node.innerHTML = edits[index];
    });
    setEditStatus("已加载本地编辑稿。", true);
  } catch {
    localStorage.removeItem(editStorageKey);
  }
}

function setEditing(isEditing) {
  document.body.classList.toggle("editing", isEditing);
  editableNodes.forEach((node) => {
    node.contentEditable = String(isEditing);
    node.spellcheck = false;
  });
  editToggle.textContent = isEditing ? "保存" : "编辑";
  editToggle.setAttribute("aria-pressed", String(isEditing));

  if (isEditing) {
    setEditStatus("编辑模式已开启，点文字即可修改。");
    editableNodes[0]?.focus();
    return;
  }

  saveEdits();
  setEditStatus("已保存到当前浏览器。", true);
}

loadEdits();
editToggle?.addEventListener("click", () => {
  setEditing(!document.body.classList.contains("editing"));
});
