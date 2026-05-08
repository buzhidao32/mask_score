const pinyinApi = window.pinyinPro || {};
const THEME_STORAGE_KEY = "mask-score-theme";
const themeMedia = window.matchMedia("(prefers-color-scheme: dark)");
const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

const state = {
  loaded: false,
  themeSwitching: false,
  masks: [],
  achievements: [],
  servantMaterialTraits: [],
  selectedTraitIds: new Set(),
  materialBonusPercent: 0,
  maskFilters: {
    upgrade: null,
    decompose: null,
  },
  defaultStatus: "",
};

const elements = {
  themeToggle: document.getElementById("theme-toggle"),
  themeToggleText: document.getElementById("theme-toggle-text"),
  form: document.getElementById("search-form"),
  input: document.getElementById("query-input"),
  clearButton: document.getElementById("clear-button"),
  maskFilterForm: document.getElementById("mask-filter-form"),
  traitForm: document.getElementById("trait-form"),
  traitOptions: document.getElementById("trait-options"),
  traitBonus: document.getElementById("trait-bonus"),
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
};

init();

async function init() {
  initTheme();
  bindEvents();

  try {
    const response = await fetch("./data/mask_scores.json");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    state.masks = (payload.masks || []).map(enhanceMask);
    state.achievements = (payload.achievements || []).map(enhanceAchievement);
    state.servantMaterialTraits = normalizeTraitOptions(
      payload.servantMaterialTraits || [],
    );
    state.loaded = true;

    state.defaultStatus = `已载入 ${state.masks.length} 个面具与 ${state.achievements.length} 个称号`;
    renderTraitForm();

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
  elements.themeToggle.addEventListener("click", toggleTheme);

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

  elements.maskFilterForm.addEventListener("change", handleMaskFilterChange);

  elements.traitForm.addEventListener("change", handleTraitChange);

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

function initTheme() {
  updateThemeToggle();

  const updateOnSystemThemeChange = () => {
    if (!document.documentElement.dataset.theme) {
      updateThemeToggle();
    }
  };

  if (typeof themeMedia.addEventListener === "function") {
    themeMedia.addEventListener("change", updateOnSystemThemeChange);
  } else if (typeof themeMedia.addListener === "function") {
    themeMedia.addListener(updateOnSystemThemeChange);
  }
}

function getSystemTheme() {
  return themeMedia.matches ? "dark" : "light";
}

function getActiveTheme() {
  const selectedTheme = document.documentElement.dataset.theme;
  return selectedTheme === "dark" || selectedTheme === "light"
    ? selectedTheme
    : getSystemTheme();
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {}

  updateThemeToggle();
}

function setTheme(theme) {
  if (state.themeSwitching) {
    return;
  }

  const root = document.documentElement;
  const shouldAnimate = !reducedMotionMedia.matches;
  let cleanupTimer = 0;
  state.themeSwitching = true;

  const cleanup = () => {
    window.clearTimeout(cleanupTimer);
    root.classList.remove("is-theme-switching");
    elements.themeToggle.classList.remove("is-switching");
    state.themeSwitching = false;
  };

  root.classList.add("is-theme-switching");
  elements.themeToggle.classList.add("is-switching");

  if (shouldAnimate && typeof document.startViewTransition === "function") {
    const transition = document.startViewTransition(() => applyTheme(theme));
    transition.finished.then(cleanup, cleanup);
    return;
  }

  applyTheme(theme);
  cleanupTimer = window.setTimeout(cleanup, shouldAnimate ? 280 : 0);
}

function toggleTheme() {
  setTheme(getActiveTheme() === "dark" ? "light" : "dark");
}

function updateThemeToggle() {
  const currentTheme = getActiveTheme();
  const nextThemeText = currentTheme === "dark" ? "白天" : "黑夜";
  elements.themeToggleText.textContent = nextThemeText;
  elements.themeToggle.setAttribute(
    "aria-label",
    `切换为${nextThemeText}模式`,
  );
  elements.themeToggle.setAttribute("aria-pressed", currentTheme === "dark");
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
    maxLevel: Number(mask.maxLevel) || 1,
    upgradeCosts: Array.isArray(mask.upgradeCosts) ? mask.upgradeCosts : [],
    canDecompose: Boolean(mask.canDecompose),
    decomposeMaterial: Number(mask.decomposeMaterial) || 0,
    hasDecomposeData:
      Object.prototype.hasOwnProperty.call(mask, "canDecompose") ||
      Object.prototype.hasOwnProperty.call(mask, "decomposeMaterial"),
    _searchEntries: buildSearchEntries([...mask.allNames, mask.maskId]),
  };
}

function enhanceAchievement(achievement) {
  return {
    ...achievement,
    _searchEntries: buildSearchEntries([achievement.achievement]),
  };
}

function handleMaskFilterChange(event) {
  const input = event.target.closest('input[type="checkbox"]');
  if (!input || !elements.maskFilterForm.contains(input)) {
    return;
  }

  const filterKey =
    input.name === "upgrade-filter"
      ? "upgrade"
      : input.name === "decompose-filter"
        ? "decompose"
        : "";
  if (!filterKey) {
    return;
  }

  if (input.checked) {
    elements.maskFilterForm
      .querySelectorAll(`input[name="${input.name}"]`)
      .forEach((option) => {
        if (option !== input) {
          option.checked = false;
          option.closest(".filter-option")?.classList.remove("is-selected");
        }
      });
    state.maskFilters[filterKey] = input.value;
    input.closest(".filter-option")?.classList.add("is-selected");
  } else {
    state.maskFilters[filterKey] = null;
    input.closest(".filter-option")?.classList.remove("is-selected");
  }

  refreshCurrentResults();
}

function normalizeTraitOptions(traits) {
  return traits
    .map((trait) => ({
      id: String(trait.id || ""),
      name: String(trait.name || ""),
      level: Number(trait.level) || 0,
      bonusPercent: Number(trait.bonusPercent) || 0,
    }))
    .filter((trait) => trait.id && trait.name && trait.bonusPercent > 0)
    .sort((left, right) => left.level - right.level);
}

function handleTraitChange(event) {
  const input = event.target.closest('input[name="servant-trait"]');
  if (!input) {
    return;
  }

  if (input.checked) {
    if (state.selectedTraitIds.size >= 3) {
      input.checked = false;
      return;
    }
    state.selectedTraitIds.add(input.value);
  } else {
    state.selectedTraitIds.delete(input.value);
  }

  updateMaterialBonus();
  renderTraitForm();
  refreshCurrentResults();
}

function updateMaterialBonus() {
  state.materialBonusPercent = state.servantMaterialTraits.reduce(
    (sum, trait) =>
      state.selectedTraitIds.has(trait.id) ? sum + trait.bonusPercent : sum,
    0,
  );
}

function renderTraitForm() {
  if (!state.servantMaterialTraits.length) {
    elements.traitForm.hidden = true;
    elements.traitOptions.replaceChildren();
    return;
  }

  const selectedCount = state.selectedTraitIds.size;
  const options = state.servantMaterialTraits.map((trait) => {
    const checked = state.selectedTraitIds.has(trait.id);
    const disabled = !checked && selectedCount >= 3;
    const label = document.createElement("label");
    label.className = "trait-option";
    if (checked) {
      label.classList.add("is-selected");
    }
    if (disabled) {
      label.classList.add("is-disabled");
    }

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "servant-trait";
    input.value = trait.id;
    input.checked = checked;
    input.disabled = disabled;

    const name = document.createElement("span");
    name.className = "trait-name";
    name.textContent = trait.name;

    const bonus = document.createElement("span");
    bonus.className = "trait-percent";
    bonus.textContent = `+${trait.bonusPercent}%`;

    label.append(input, name, bonus);
    return label;
  });

  elements.traitOptions.replaceChildren(...options);
  elements.traitBonus.textContent = `总加成 ${state.materialBonusPercent}%`;
  elements.traitForm.hidden = false;
}

function refreshCurrentResults() {
  runSearch(elements.input.value);
}

function getAdjustedDecomposeMaterial(baseAmount) {
  const amount = Number(baseAmount) || 0;
  if (state.materialBonusPercent <= 0) {
    return amount;
  }

  return Math.floor(amount * (1 + state.materialBonusPercent / 100));
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
  runSearch("");
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

function filterAchievementMatches(masks, achievements) {
  const matchedMasksById = new Map(masks.map((mask) => [mask.maskId, mask]));

  return achievements.filter((achievement) => {
    if (achievement.type !== "single") {
      return true;
    }

    const mask = matchedMasksById.get(achievement.demandIds[0]);
    if (!mask) {
      return true;
    }

    return achievement.achievement !== mask.maskName;
  });
}

function hasActiveMaskFilters() {
  return Boolean(state.maskFilters.upgrade || state.maskFilters.decompose);
}

function isMaskUpgradable(mask) {
  return mask.maxLevel > 1;
}

function applyMaskFilters(masks) {
  if (!hasActiveMaskFilters()) {
    return masks;
  }

  return masks.filter((mask) => {
    if (state.maskFilters.upgrade === "upgradable" && !isMaskUpgradable(mask)) {
      return false;
    }
    if (state.maskFilters.upgrade === "not-upgradable" && isMaskUpgradable(mask)) {
      return false;
    }
    if (state.maskFilters.decompose === "decomposable" && !mask.canDecompose) {
      return false;
    }
    if (state.maskFilters.decompose === "not-decomposable" && mask.canDecompose) {
      return false;
    }
    return true;
  });
}

function runSearch(rawQuery) {
  if (!state.loaded) {
    return;
  }

  const cleaned = normalizeQuery(rawQuery);
  if (!cleaned) {
    syncQueryParam("");
    renderSuggestions([], []);
    renderFilteredMasks(applyMaskFilters(state.masks));
    return;
  }

  syncQueryParam(cleaned);

  const query = buildQuery(cleaned);
  const maskMatches = applyMaskFilters(
    searchCollection(state.masks, query, "maskName"),
  );
  const achievementMatches = filterAchievementMatches(
    maskMatches,
    searchCollection(state.achievements, query, "achievement"),
  );

  renderSuggestions(maskMatches, achievementMatches);
  renderResults(cleaned, maskMatches, achievementMatches);
}

function renderFilteredMasks(masks) {
  elements.maskList.replaceChildren();
  elements.achievementList.replaceChildren();
  elements.results.hidden = false;
  elements.achievementSection.hidden = true;

  if (!masks.length) {
    elements.status.textContent = "没有找到符合筛选的面具";
    elements.maskSection.hidden = true;
    return;
  }

  elements.status.textContent = hasActiveMaskFilters()
    ? `筛选出 ${masks.length} 条面具结果`
    : `共显示 ${masks.length} 条面具结果`;
  elements.maskCount.textContent = `${masks.length} 条`;
  elements.maskSection.hidden = false;
  elements.maskList.append(...masks.map(createMaskCard));
}

function renderIdleState() {
  elements.suggestions.hidden = true;
  elements.suggestions.replaceChildren();
  if (state.loaded) {
    renderFilteredMasks(applyMaskFilters(state.masks));
  } else {
    elements.status.textContent = state.defaultStatus || "正在加载数据...";
    renderEmpty();
  }
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
      title: `${mask.maskName} · ${mask.maskId}`,
    });
  });

  achievementMatches.slice(0, 3).forEach((achievement) => {
    suggestions.push({
      query: achievement.achievement,
      title:
        achievement.type === "single"
          ? `${achievement.achievement} · 单面具图鉴`
          : `${achievement.achievement} · 组合图鉴`,
    });
  });

  const unique = [];
  const seen = new Set();

  suggestions.forEach((item) => {
    const key = `${item.query}|${item.title}`;
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
    button.textContent = item.title;
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
    elements.status.textContent = `没有找到和“${query}”相关的结果，可试试：嫦娥、广寒上仙、ghsx、niulang`;
    elements.maskSection.hidden = true;
    elements.achievementSection.hidden = true;
    return;
  }

  elements.status.textContent = `“${query}” 共匹配到 ${masks.length} 条面具结果、${achievements.length} 条称号结果`;

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

  renderMaskMeta(fragment, mask);

  fragment.querySelector(".score-badge").textContent =
    mask.directPoint === null ? "暂无单独分" : `${mask.directPoint} 分`;

  const directLine = fragment.querySelector(".direct-line");
  if (mask.directAchievement) {
    directLine.textContent = `${mask.directAchievement.achievement} · ${mask.directAchievement.point} 分`;
  } else if (comboAchievements.length) {
    directLine.innerHTML = '<span class="empty-note">暂无单独图鉴分，仅参与组合称号</span>';
  } else {
    directLine.innerHTML = '<span class="empty-note">暂无图鉴分数据</span>';
  }

  const comboList = fragment.querySelector(".detail-list");
  if (comboAchievements.length) {
    comboAchievements.forEach((item) => {
      const partners = item.demandIds
        .map((maskId, index) => ({
          maskId,
          maskName: item.demandNames[index] || maskId,
        }))
        .map((entry) => entry.maskName);

      const li = document.createElement("li");
      li.textContent = partners.length
        ? `${item.achievement} · ${item.point} 分 · ${partners.join(" / ")}`
        : `${item.achievement} · ${item.point} 分`;
      comboList.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.className = "empty-note";
    li.textContent = "没有相关组合称号";
    comboList.appendChild(li);
  }

  return fragment;
}

function renderMaskMeta(fragment, mask) {
  const meta = fragment.querySelector(".mask-meta");
  const upgradeCosts = fragment.querySelector(".upgrade-costs");
  const levelSummary = fragment.querySelector(".level-chip");
  const upgradeCostList = fragment.querySelector(".upgrade-cost-list");
  const decomposeChip = fragment.querySelector(".decompose-chip");
  let hasMeta = false;

  if (mask.maxLevel > 1) {
    hasMeta = true;
    upgradeCosts.hidden = false;
    levelSummary.textContent = `最高 ${mask.maxLevel} 级`;

    mask.upgradeCosts.forEach((cost) => {
      const li = document.createElement("li");
      li.textContent = `${cost.level}级：${cost.text}`;
      upgradeCostList.appendChild(li);
    });
  }

  if (mask.canDecompose) {
    const adjustedMaterial = getAdjustedDecomposeMaterial(mask.decomposeMaterial);
    hasMeta = true;
    decomposeChip.hidden = false;
    decomposeChip.textContent = `分解得${adjustedMaterial}饰品材料`;
    decomposeChip.title =
      state.materialBonusPercent > 0
        ? `基础${mask.decomposeMaterial}，烛阴加成${state.materialBonusPercent}%`
        : "";
  } else if (mask.hasDecomposeData) {
    hasMeta = true;
    decomposeChip.hidden = false;
    decomposeChip.textContent = "不可分解";
  }

  meta.hidden = !hasMeta;
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
