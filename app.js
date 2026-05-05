const pinyinApi = window.pinyinPro || {};

const state = {
  loaded: false,
  masks: [],
  achievements: [],
  defaultStatus: "",
};

const elements = {
  form: document.getElementById("search-form"),
  input: document.getElementById("query-input"),
  clearButton: document.getElementById("clear-button"),
  helper: document.getElementById("helper-text"),
  status: document.getElementById("status"),
  suggestions: document.getElementById("suggestions"),
  results: document.getElementById("results"),
  maskSection: document.getElementById("mask-section"),
  maskCount: document.getElementById("mask-count"),
  maskList: document.getElementById("mask-list"),
  achievementSection: document.getElementById("achievement-section"),
  achievementCount: document.getElementById("achievement-count"),
  achievementList: document.getElementById("achievement-list"),
  maskTemplate: document.getElementById("mask-card-template"),
  achievementTemplate: document.getElementById("achievement-card-template"),
  maskTotal: document.getElementById("mask-total"),
  achievementTotal: document.getElementById("achievement-total"),
  quickChips: Array.from(document.querySelectorAll(".quick-chip")),
};

init();

async function init() {
  bindEvents();

  try {
    const response = await fetch("./data/mask_scores.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    state.masks = (payload.masks || []).map(enhanceMask);
    state.achievements = (payload.achievements || []).map(enhanceAchievement);
    state.loaded = true;

    elements.maskTotal.textContent = String(payload.meta?.maskCount ?? state.masks.length);
    elements.achievementTotal.textContent = String(
      payload.meta?.achievementCount ?? state.achievements.length,
    );

    state.defaultStatus = `已载入 ${state.masks.length} 个面具与 ${state.achievements.length} 个称号，支持中文、全拼、首字母实时查询。`;

    const preset = readPresetQuery();
    if (preset) {
      elements.input.value = preset;
      toggleClearButton();
      runSearch(preset);
      return;
    }

    renderIdleState();
  } catch (error) {
    elements.status.textContent = `数据加载失败：${error.message}`;
    elements.results.hidden = true;
  }
}

function bindEvents() {
  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    runSearch(elements.input.value);
  });

  elements.input.addEventListener("input", () => {
    toggleClearButton();
    runSearch(elements.input.value);
  });

  elements.input.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && elements.input.value) {
      event.preventDefault();
      clearQuery();
    }
  });

  elements.clearButton.addEventListener("click", clearQuery);

  elements.quickChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const query = chip.dataset.query || "";
      elements.input.value = query;
      toggleClearButton();
      runSearch(query);
      elements.input.focus();
    });
  });

  elements.suggestions.addEventListener("click", (event) => {
    const button = event.target.closest("[data-query]");
    if (!button) {
      return;
    }

    const query = button.dataset.query || "";
    elements.input.value = query;
    toggleClearButton();
    runSearch(query);
    elements.input.focus();
  });
}

function readPresetQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("q")?.trim() || "";
}

function normalizeQuery(raw) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }

  const bracketMatch = trimmed.match(/\[\[([^[\]]+)\]\]/);
  if (bracketMatch) {
    return bracketMatch[1].trim();
  }

  return trimmed;
}

function normalizeTextKey(text) {
  return text
    .toLocaleLowerCase("zh-CN")
    .replace(/[\s"'`~!@#$%^&*()\-_=+\[\]{};:,.<>/?\\|]+/g, "");
}

function normalizeLatinKey(text) {
  return text.toLocaleLowerCase("zh-CN").replace(/[^a-z0-9]/g, "");
}

function hasChinese(text) {
  return /[\u3400-\u9fff]/.test(text);
}

function getPinyinFull(text) {
  if (!hasChinese(text) || typeof pinyinApi.pinyin !== "function") {
    return normalizeLatinKey(text);
  }

  return normalizeLatinKey(pinyinApi.pinyin(text, { toneType: "none" }));
}

function getPinyinInitials(text) {
  if (!hasChinese(text) || typeof pinyinApi.pinyin !== "function") {
    return "";
  }

  return normalizeLatinKey(
    pinyinApi.pinyin(text, {
      pattern: "first",
      toneType: "none",
    }),
  );
}

function buildSearchEntries(values) {
  return Array.from(new Set(values.filter(Boolean))).map((raw) => ({
    raw,
    normalizedText: normalizeTextKey(raw),
    normalizedLatin: normalizeLatinKey(raw),
    pinyinFull: getPinyinFull(raw),
    pinyinInitials: getPinyinInitials(raw),
  }));
}

function enhanceMask(mask) {
  const aliases = mask.allNames.slice(1);
  return {
    ...mask,
    aliases,
    _searchEntries: buildSearchEntries([...mask.allNames, mask.maskId]),
  };
}

function enhanceAchievement(achievement) {
  return {
    ...achievement,
    _searchEntries: buildSearchEntries([achievement.achievement]),
  };
}

function buildQuery(rawQuery) {
  const cleaned = normalizeQuery(rawQuery);
  return {
    raw: cleaned,
    textKey: normalizeTextKey(cleaned),
    latinKey: normalizeLatinKey(cleaned),
  };
}

function toggleClearButton() {
  elements.clearButton.hidden = elements.input.value.trim() === "";
}

function clearQuery() {
  elements.input.value = "";
  toggleClearButton();
  syncQueryParam("");
  renderIdleState();
  elements.input.focus();
}

function syncQueryParam(query) {
  const url = new URL(window.location.href);
  if (query) {
    url.searchParams.set("q", query);
  } else {
    url.searchParams.delete("q");
  }
  window.history.replaceState({}, "", url);
}

function scoreEntry(entry, query) {
  if (!query.textKey) {
    return null;
  }

  if (entry.normalizedText === query.textKey) {
    return 0;
  }

  if (entry.normalizedText.startsWith(query.textKey)) {
    return 1;
  }

  if (entry.normalizedText.includes(query.textKey)) {
    return 2;
  }

  if (!query.latinKey) {
    return null;
  }

  if (entry.normalizedLatin && entry.normalizedLatin === query.latinKey) {
    return 3;
  }

  if (entry.pinyinFull && entry.pinyinFull === query.latinKey) {
    return 4;
  }

  if (entry.pinyinInitials && entry.pinyinInitials === query.latinKey) {
    return 5;
  }

  if (entry.pinyinFull && entry.pinyinFull.startsWith(query.latinKey)) {
    return 6;
  }

  if (entry.pinyinInitials && entry.pinyinInitials.startsWith(query.latinKey)) {
    return 7;
  }

  if (entry.pinyinFull && entry.pinyinFull.includes(query.latinKey)) {
    return 8;
  }

  if (entry.pinyinInitials && entry.pinyinInitials.includes(query.latinKey)) {
    return 9;
  }

  if (
    typeof pinyinApi.match === "function" &&
    hasChinese(entry.raw) &&
    pinyinApi.match(entry.raw, query.latinKey)
  ) {
    return 10;
  }

  return null;
}

function sortMatches(left, right, field) {
  if (left.score !== right.score) {
    return left.score - right.score;
  }

  return left.item[field].localeCompare(right.item[field], "zh-CN");
}

function searchCollection(items, query, field) {
  return items
    .map((item) => {
      const scores = item._searchEntries
        .map((entry) => scoreEntry(entry, query))
        .filter((score) => score !== null);

      return {
        item,
        score: scores.length ? Math.min(...scores) : null,
      };
    })
    .filter((result) => result.score !== null)
    .sort((left, right) => sortMatches(left, right, field))
    .map((result) => result.item);
}

function runSearch(rawQuery) {
  if (!state.loaded) {
    return;
  }

  const cleaned = normalizeQuery(rawQuery);
  if (!cleaned) {
    syncQueryParam("");
    renderIdleState();
    return;
  }

  syncQueryParam(cleaned);

  const query = buildQuery(cleaned);
  const maskMatches = searchCollection(state.masks, query, "maskName");
  const achievementMatches = searchCollection(state.achievements, query, "achievement");

  renderSuggestions(maskMatches, achievementMatches);
  renderResults(cleaned, maskMatches, achievementMatches);
}

function renderIdleState() {
  elements.status.textContent = state.defaultStatus || "正在加载数据...";
  elements.suggestions.hidden = true;
  elements.suggestions.replaceChildren();
  renderEmpty();
}

function renderEmpty() {
  elements.results.hidden = true;
  elements.maskSection.hidden = true;
  elements.achievementSection.hidden = true;
  elements.maskList.replaceChildren();
  elements.achievementList.replaceChildren();
}

function renderSuggestions(maskMatches, achievementMatches) {
  const suggestions = [];

  maskMatches.slice(0, 3).forEach((mask) => {
    suggestions.push({
      query: mask.maskName,
      title: mask.maskName,
      meta: `面具 · ${mask.maskId}`,
    });
  });

  achievementMatches.slice(0, 3).forEach((achievement) => {
    suggestions.push({
      query: achievement.achievement,
      title: achievement.achievement,
      meta: achievement.type === "single" ? "称号 · 单面具图鉴" : "称号 · 组合图鉴",
    });
  });

  const unique = [];
  const seen = new Set();

  suggestions.forEach((item) => {
    const key = `${item.query}|${item.meta}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    unique.push(item);
  });

  if (!unique.length) {
    elements.suggestions.hidden = true;
    elements.suggestions.replaceChildren();
    return;
  }

  const nodes = unique.map((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "suggestion-item";
    button.dataset.query = item.query;
    button.innerHTML = `<span class="suggestion-title">${item.title}</span><span class="suggestion-meta">${item.meta}</span>`;
    return button;
  });

  elements.suggestions.hidden = false;
  elements.suggestions.replaceChildren(...nodes);
}

function renderResults(query, masks, achievements) {
  elements.maskList.replaceChildren();
  elements.achievementList.replaceChildren();
  elements.results.hidden = false;

  if (!masks.length && !achievements.length) {
    elements.status.textContent = `没有找到和“${query}”相关的结果。可试试：嫦娥、广寒上仙、ghsx、niulang。`;
    elements.maskSection.hidden = true;
    elements.achievementSection.hidden = true;
    return;
  }

  elements.status.textContent = `“${query}” 共匹配到 ${masks.length} 条面具结果、${achievements.length} 条称号结果。`;

  if (masks.length) {
    elements.maskCount.textContent = `${masks.length} 条`;
    elements.maskSection.hidden = false;
    elements.maskList.append(...masks.map(createMaskCard));
  } else {
    elements.maskSection.hidden = true;
  }

  if (achievements.length) {
    elements.achievementCount.textContent = `${achievements.length} 条`;
    elements.achievementSection.hidden = false;
    elements.achievementList.append(...achievements.map(createAchievementCard));
  } else {
    elements.achievementSection.hidden = true;
  }
}

function createMaskCard(mask) {
  const fragment = elements.maskTemplate.content.cloneNode(true);
  const comboAchievements = mask.relatedAchievements
    .filter((item) => item.type === "combo")
    .slice()
    .sort(
      (left, right) =>
        right.point - left.point ||
        left.achievement.localeCompare(right.achievement, "zh-CN"),
    );

  fragment.querySelector(".card-title").textContent = mask.maskName;
  fragment.querySelector(".card-subtitle").textContent = mask.maskId;

  const aliasLine = fragment.querySelector(".alias-line");
  if (mask.aliases.length) {
    aliasLine.hidden = false;
    aliasLine.textContent = `别名：${mask.aliases.join(" / ")}`;
  }

  fragment.querySelector(".score-badge").textContent =
    mask.directPoint === null ? "暂无单独分" : `${mask.directPoint} 分`;

  const directLine = fragment.querySelector(".direct-line");
  if (mask.directAchievement) {
    directLine.textContent = `${mask.directAchievement.achievement} · ${mask.directAchievement.point} 分`;
  } else if (comboAchievements.length) {
    directLine.innerHTML = '<span class="empty-note">暂无单独图鉴分，仅参与组合称号。</span>';
  } else {
    directLine.innerHTML = '<span class="empty-note">暂无图鉴分数据。</span>';
  }

  const comboList = fragment.querySelector(".detail-list");
  if (comboAchievements.length) {
    comboAchievements.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.achievement} · ${item.point} 分`;
      comboList.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.className = "empty-note";
    li.textContent = "没有相关组合称号。";
    comboList.appendChild(li);
  }

  return fragment;
}

function createAchievementCard(item) {
  const fragment = elements.achievementTemplate.content.cloneNode(true);
  fragment.querySelector(".card-title").textContent = item.achievement;
  fragment.querySelector(".card-subtitle").textContent =
    item.type === "single" ? "单面具图鉴" : "组合图鉴";
  fragment.querySelector(".score-badge").textContent = `${item.point} 分`;

  const list = fragment.querySelector(".detail-list");
  item.demandIds.forEach((maskId, index) => {
    const li = document.createElement("li");
    const name = item.demandNames[index] || maskId;
    li.textContent = `${name} · ${maskId}`;
    list.appendChild(li);
  });

  return fragment;
}
