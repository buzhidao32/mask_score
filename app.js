const pinyinApi = window.pinyinPro || {};
const THEME_STORAGE_KEY = "mask-score-theme";
const PANEL_STORAGE_KEY = "mask-score-panel-state";
const INVENTORY_STORAGE_KEY = "mask-score-inventory-v1";
const INVENTORY_ACTIVE_PROFILE_KEY = "mask-score-inventory-active-profile-v1";
const OCR_FAST_MODE_STORAGE_KEY = "mask-score-ocr-fast-mode-v1";
const INVENTORY_PROFILE_IDS = ["profile-1", "profile-2", "profile-3", "profile-4", "profile-5"];
const APPEARANCE_SCORE_LIMIT = 12;
const TESSERACT_VENDOR_BASE = new URL("./vendor/tesseract/", document.baseURI).href;
const TESSDATA_VENDOR_BASE = new URL("./vendor/tessdata/", document.baseURI).href;
const SERVICE_WORKER_URL = new URL("./sw.js?v=20260519-ocr-local18", document.baseURI).href;
const OCR_MAX_PARALLEL_FILES = 2;
const OCR_TITLE_ALIASES = new Map([
  ["区嫩人人太个", "茶韵悠悠"],
  ["团于伞晚", "酥手夺魄"],
  ["哮于十够", "酥手夺魄"],
  ["哮手车婉", "酥手夺魄"],
  ["啤手车饮", "酥手夺魄"],
  ["著于在魄", "酥手夺魄"],
  ["钱手车包", "酥手夺魄"],
  ["睐手革折", "酥手夺魄"],
  ["卫宪守居", "酥手夺魄"],
  ["卫手罕哆", "酥手夺魄"],
  ["丸于小上", "酥手夺魄"],
  ["亚衣广人瑟", "眉清目秀"],
  ["亚儿子", "眉清目秀"],
  ["一一阔一", "疏狂侠少"],
  ["人公去所", "婉兮清扬"],
  ["过分清翅", "婉兮清扬"],
  ["巡今消疡", "婉兮清扬"],
  ["刀今消杨", "婉兮清扬"],
  ["妮分消扬", "婉兮清扬"],
  ["坑分清场", "婉兮清扬"],
  ["和武刘下月", "武神下凡"],
  ["由人会人次", "神俊仙姿"],
  ["本和寺下一", "仙影重重"],
  ["号三三", "仙影重重"],
  ["川几和人", "娇似花仙"],
  ["月虹受昼", "青蝶曼舞"],
  ["育蝶罗评", "青蝶曼舞"],
  ["侈外次二", "傲霜凌雪"],
  ["一芷包以", "一世仇敌"],
  ["铬人会妆人", "师徒之情"],
  ["生亡追月", "星芒追月"],
  ["是本定吵", "酥手夺魄"],
  ["天人月当林", "铁骨雪萼"],
  ["多必人久了人", "克己复礼"],
  ["元已用礼", "克己复礼"],
  ["元已县礼", "克己复礼"],
  ["死已用礼", "克己复礼"],
  ["疮化以汪", "落花吹雪"],
  ["记人六", "疏狂侠少"],
  ["了人们", "如剑如仙"],
  ["一分洛人福", "王家才女"],
  ["人一一一一中", "君王之相"],
  ["经细全天", "缥缈空灵"],
  ["狐放出洗", "飘逸出尘"],
  ["和坏让下朋", "武神下凡"],
  ["人也了孚人", "花影随行"],
  ["了处人勾", "郭家小姐"],
  ["占腑学门", "古陵掌门"],
  ["专无吊", "黑无常"],
  ["他八和人人心", "落水女鬼"],
  ["站火和相狂", "古灵精怪"],
  ["中已中多天", "蛇蝎美人"],
  ["人月入六", "独臂大侠"],
  ["起统后催", "燕朝后裔"],
  ["年记忆站", "星芒追月"],
  ["藉攻公主", "戎装公主"],
  ["式闭公主", "戎装公主"],
  ["式攻公主", "戎装公主"],
  ["芭银公主", "戎装公主"],
  ["阁化了以己", "落花吹雪"],
  ["阁化以己", "落花吹雪"],
  ["过还这牛星", "迢迢牵牛星"],
  ["过过军下量", "迢迢牵牛星"],
  ["过过军人", "迢迢牵牛星"],
  ["过过军人是", "迢迢牵牛星"],
  ["如证守征星", "迢迢牵牛星"],
  ["证过这年星", "迢迢牵牛星"],
  ["地过了引妆", "傲云孤客"],
  ["从过路福", "傲云孤客"],
  ["了风", "落水女鬼"],
  ["乡安华了本", "岁宴华予"],
  ["人十寺人工", "禅锋砥柱"],
  ["西猫和伐生", "西疆煞星"],
  ["西独人然旦", "西疆煞星"],
  ["无的生外", "无拘尘外"],
  ["月共宕天", "月夜寒芒"],
  ["灼魅黑逢", "魑魅魍魉"],
  ["焙糙和烟汪", "魑魅魍魉"],
  ["簿括虹于", "器括寰宇"],
  ["挟可", "寒影于硎"],
  ["日分人也", "月宫仙灵"],
  ["去在沾癌二性生人", "静澜妙影"],
  ["太口下", "奔月之恨"],
  ["灵用了巧此", "灵秀巧燕"],
  ["手不至老", "手不释卷"],
  ["于不释疮", "手不释卷"],
  ["手不释孝", "手不释卷"],
  ["手不各卷", "手不释卷"],
  ["忌全和仁", "仙影重重"],
  ["瑶这出全", "飘逸出尘"],
  ["化各阁人律", "华山首徒"],
  ["用上映媒娟", "月映婵娟"],
  ["小了线砍", "苍山孤鹰"],
  ["全刀只世", "金刀驸马"],
]);
const themeMedia = window.matchMedia("(prefers-color-scheme: dark)");
const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
const compactControlsMedia = window.matchMedia("(max-width: 720px)");

const state = {
  loaded: false,
  themeSwitching: false,
  masks: [],
  achievements: [],
  scoreAchievements: [],
  tokenAchievements: [],
  appearanceAchievements: [],
  scoreMeta: {},
  servantMaterialTraits: [],
  selectedTraitIds: new Set(),
  materialBonusPercent: 0,
  maskFilters: {
    upgrade: null,
    decompose: null,
  },
  activeInventoryProfile: "profile-1",
  inventory: createEmptyInventory(),
  selectedFiles: [],
  pendingMatches: [],
  ocrRunId: 0,
  ocrActive: false,
  ocrFastMode: false,
  ocrStartedAt: 0,
  ocrTimerId: 0,
  ocrTimerLabel: "识别中",
  confirmAction: null,
  confirmReturnFocus: null,
  defaultStatus: "",
};

const indices = {
  masksById: new Map(),
  achievementsById: new Map(),
  tokensById: new Map(),
  appearancesById: new Map(),
  manualItems: [],
};

const elements = {
  themeToggle: document.getElementById("theme-toggle"),
  themeToggleText: document.getElementById("theme-toggle-text"),
  form: document.getElementById("search-form"),
  input: document.getElementById("query-input"),
  clearButton: document.getElementById("clear-button"),
  maskFilterForm: document.getElementById("mask-filter-form"),
  maskFilterToggle: document.getElementById("mask-filter-toggle"),
  maskFilterContent: document.getElementById("mask-filter-content"),
  traitForm: document.getElementById("trait-form"),
  traitToggle: document.getElementById("trait-toggle"),
  traitContent: document.getElementById("trait-content"),
  traitOptions: document.getElementById("trait-options"),
  traitBonus: document.getElementById("trait-bonus"),
  screenshotInput: document.getElementById("screenshot-input"),
  inventoryProfile: document.getElementById("inventory-profile"),
  uploadDrop: document.getElementById("upload-drop"),
  runOcrButton: document.getElementById("run-ocr"),
  ocrFastMode: document.getElementById("ocr-fast-mode"),
  ocrStatus: document.getElementById("ocr-status"),
  ocrTimer: document.getElementById("ocr-timer"),
  ocrProgress: document.getElementById("ocr-progress"),
  pendingList: document.getElementById("pending-list"),
  confirmAllButton: document.getElementById("confirm-all"),
  clearConfirmedButton: document.getElementById("clear-confirmed"),
  confirmedCount: document.getElementById("confirmed-count"),
  confirmedList: document.getElementById("confirmed-list"),
  manualQuery: document.getElementById("manual-query"),
  manualResults: document.getElementById("manual-results"),
  scoreSummary: document.getElementById("score-summary"),
  tokenCount: document.getElementById("token-count"),
  tokenList: document.getElementById("token-list"),
  resetInventory: document.getElementById("reset-inventory"),
  confirmDialog: document.getElementById("confirm-dialog"),
  confirmDialogTitle: document.getElementById("confirm-dialog-title"),
  confirmDialogMessage: document.getElementById("confirm-dialog-message"),
  confirmDialogCancel: document.getElementById("confirm-dialog-cancel"),
  confirmDialogConfirm: document.getElementById("confirm-dialog-confirm"),
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
const hasSearch = Boolean(elements.form);
const hasInventory = Boolean(elements.screenshotInput);

init();

async function init() {
  initTheme();
  registerServiceWorker();
  bindEvents();
  if (hasSearch) {
    initResponsivePanels();
  }
  if (hasSearch || hasInventory) {
    state.activeInventoryProfile = readActiveInventoryProfile();
    syncInventoryProfileControl();
  }
  if (hasInventory) {
    state.ocrFastMode = readOcrFastMode();
    syncOcrFastModeControl();
  }
  state.inventory = readInventory();

  try {
    const response = await fetch("./data/mask_scores.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    state.scoreMeta = payload.meta || {};
    state.masks = (payload.masks || []).map(enhanceMask);
    state.achievements = (payload.achievements || []).map(enhanceAchievement);
    state.tokenAchievements = (payload.tokenAchievements || []).map(enhanceAchievement);
    state.appearanceAchievements = (payload.appearanceAchievements || []).map(
      enhanceAchievement,
    );
    state.scoreAchievements = (payload.scoreAchievements || [
      ...state.achievements,
      ...state.tokenAchievements,
      ...state.appearanceAchievements,
    ]).map(enhanceAchievement);
    state.servantMaterialTraits = normalizeTraitOptions(
      payload.servantMaterialTraits || [],
    );
    state.loaded = true;

    buildIndices();
    state.defaultStatus = `已载入 ${state.masks.length} 个面具、${state.achievements.length} 个面具称号、${state.tokenAchievements.length} 个信物称号、${state.appearanceAchievements.length} 条容貌称号`;
    if (hasSearch) {
      renderTraitForm();
    }
    renderInventory();

    if (hasSearch) {
      const preset = readPresetQuery();
      if (preset) {
        elements.input.value = preset;
        toggleClearButton();
        runSearch(preset);
        return;
      }

      renderIdleState();
    }
  } catch (error) {
    if (elements.status) {
      elements.status.textContent = `数据加载失败：${error.message}`;
    }
    if (elements.results) {
      elements.results.hidden = true;
    }
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") {
    return;
  }
  navigator.serviceWorker.register(SERVICE_WORKER_URL).catch(() => {});
}

function bindEvents() {
  elements.themeToggle.addEventListener("click", toggleTheme);

  if (hasSearch) {
    elements.inventoryProfile?.addEventListener("change", handleInventoryProfileChange);
    window.addEventListener("storage", handleInventoryStorageChange);
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
    elements.maskFilterToggle.addEventListener("click", () => {
      toggleCollapsiblePanel(
        elements.maskFilterContent,
        elements.maskFilterToggle,
        "maskFilterCollapsed",
      );
    });

    elements.traitForm.addEventListener("change", handleTraitChange);
    elements.traitToggle.addEventListener("click", () => {
      toggleCollapsiblePanel(
        elements.traitContent,
        elements.traitToggle,
        "traitCollapsed",
      );
    });

    elements.suggestions.addEventListener("click", (event) => {
      const button = event.target.closest("[data-query]");
      if (!button) {
        return;
      }

      elements.input.value = button.dataset.query || "";
      toggleClearButton();
      runSearch(elements.input.value);
      elements.input.focus();
    });
  }

  if (hasInventory) {
    elements.inventoryProfile?.addEventListener("change", handleInventoryProfileChange);
    window.addEventListener("storage", handleInventoryStorageChange);
    elements.screenshotInput.addEventListener("change", handleFileSelection);
    elements.screenshotInput.addEventListener("click", prepareScreenshotPicker);
    elements.uploadDrop?.addEventListener("click", prepareScreenshotPicker);
    elements.uploadDrop?.addEventListener("dragenter", handleUploadDragEnter);
    elements.uploadDrop?.addEventListener("dragover", handleUploadDragOver);
    elements.uploadDrop?.addEventListener("dragleave", handleUploadDragLeave);
    elements.uploadDrop?.addEventListener("drop", handleUploadDrop);
    elements.ocrFastMode?.addEventListener("change", handleOcrFastModeChange);
    document.addEventListener("click", handleInventoryNavigationClick);
    window.addEventListener("pagehide", cancelActiveOcr);
    window.addEventListener("beforeunload", cancelActiveOcr);
    elements.runOcrButton.addEventListener("click", runOcr);
    elements.confirmAllButton.addEventListener("click", confirmAllPending);
    elements.clearConfirmedButton.addEventListener("click", clearConfirmedRecords);
    elements.pendingList.addEventListener("click", handlePendingClick);
    elements.confirmedList.addEventListener("click", handleConfirmedClick);
    elements.manualQuery.addEventListener("input", renderManualResults);
    elements.manualResults.addEventListener("click", handleManualClick);
    elements.tokenList?.addEventListener("click", handleManualClick);
    elements.resetInventory.addEventListener("click", resetInventory);
    elements.scoreSummary?.addEventListener("input", handleGameTotalInput);
    elements.scoreSummary?.addEventListener("change", handleGameTotalInput);
    elements.confirmDialog?.addEventListener("click", handleConfirmDialogClick);
    elements.confirmDialog?.addEventListener("keydown", handleConfirmDialogKeydown);
  }
}

function initResponsivePanels() {
  const panelState = readPanelState();
  setCollapsiblePanelState(
    elements.maskFilterContent,
    elements.maskFilterToggle,
    panelState.maskFilterCollapsed,
  );
  setCollapsiblePanelState(
    elements.traitContent,
    elements.traitToggle,
    panelState.traitCollapsed,
  );

  const handleViewportChange = () => {
    syncPanelLabels();
  };

  if (typeof compactControlsMedia.addEventListener === "function") {
    compactControlsMedia.addEventListener("change", handleViewportChange);
  } else if (typeof compactControlsMedia.addListener === "function") {
    compactControlsMedia.addListener(handleViewportChange);
  }
}

function createEmptyInventory() {
  return {
    claimedAchievementIds: new Set(),
    claimedAchievementTitles: new Map(),
    lastGameTotal: 0,
    updatedAt: "",
  };
}

function readActiveInventoryProfile() {
  try {
    const stored = localStorage.getItem(INVENTORY_ACTIVE_PROFILE_KEY);
    return INVENTORY_PROFILE_IDS.includes(stored) ? stored : INVENTORY_PROFILE_IDS[0];
  } catch (error) {
    return INVENTORY_PROFILE_IDS[0];
  }
}

function writeActiveInventoryProfile() {
  try {
    localStorage.setItem(INVENTORY_ACTIVE_PROFILE_KEY, state.activeInventoryProfile);
  } catch (error) {}
}

function getInventoryStorageKey(profileId = state.activeInventoryProfile) {
  return `${INVENTORY_STORAGE_KEY}:${profileId}`;
}

function getInventoryProfileLabel(profileId = state.activeInventoryProfile) {
  const index = INVENTORY_PROFILE_IDS.indexOf(profileId);
  return `档案 ${index >= 0 ? index + 1 : 1}`;
}

function syncInventoryProfileControl() {
  if (elements.inventoryProfile) {
    elements.inventoryProfile.value = state.activeInventoryProfile;
  }
}

function readOcrFastMode() {
  try {
    return localStorage.getItem(OCR_FAST_MODE_STORAGE_KEY) === "1";
  } catch (error) {
    return false;
  }
}

function writeOcrFastMode() {
  try {
    if (state.ocrFastMode) {
      localStorage.setItem(OCR_FAST_MODE_STORAGE_KEY, "1");
    } else {
      localStorage.removeItem(OCR_FAST_MODE_STORAGE_KEY);
    }
  } catch (error) {}
}

function syncOcrFastModeControl() {
  if (elements.ocrFastMode) {
    elements.ocrFastMode.checked = state.ocrFastMode;
  }
}

function handleOcrFastModeChange(event) {
  const shouldEnable = Boolean(event.target.checked);
  if (!shouldEnable) {
    state.ocrFastMode = false;
    writeOcrFastMode();
    syncOcrFastModeControl();
    if (elements.ocrStatus && !state.ocrActive) {
      elements.ocrStatus.textContent = "已切换为稳定识别模式";
    }
    return;
  }

  event.target.checked = false;
  showConfirmDialog({
    title: "开启快速识别模式",
    message: "快速识别模式会同时识别2张截图，占用更多CPU和内存，页面可能变卡或识别失败；识别规则不变，结果仍需要人工确认",
    confirmText: "开启快速模式",
    onConfirm: () => {
      state.ocrFastMode = true;
      writeOcrFastMode();
      syncOcrFastModeControl();
      if (elements.ocrStatus && !state.ocrActive) {
        elements.ocrStatus.textContent = "已开启快速识别模式";
      }
    },
  });
}

function readInventory() {
  const fallback = createEmptyInventory();
  try {
    const profileKey = getInventoryStorageKey();
    const storedText =
      localStorage.getItem(profileKey) ||
      (state.activeInventoryProfile === INVENTORY_PROFILE_IDS[0]
        ? localStorage.getItem(INVENTORY_STORAGE_KEY)
        : "") ||
      "{}";
    const stored = JSON.parse(storedText);
    const claimedAchievementIds = Array.isArray(stored.claimedAchievementIds)
      ? stored.claimedAchievementIds
      : [];
    const claimedAchievementTitles =
      stored.claimedAchievementTitles && typeof stored.claimedAchievementTitles === "object"
        ? Object.entries(stored.claimedAchievementTitles)
        : [];
    const hasRecords = claimedAchievementIds.length > 0 || claimedAchievementTitles.length > 0;
    return {
      claimedAchievementIds: new Set(claimedAchievementIds),
      claimedAchievementTitles: new Map(claimedAchievementTitles),
      lastGameTotal:
        hasRecords &&
        Number.isFinite(Number(stored.lastGameTotal)) &&
        stored.lastGameTotal !== null
          ? Number(stored.lastGameTotal)
          : 0,
      updatedAt: String(stored.updatedAt || ""),
    };
  } catch (error) {
    return fallback;
  }
}

function writeInventory() {
  state.inventory.updatedAt = new Date().toISOString();
  const payload = {
    claimedAchievementIds: Array.from(state.inventory.claimedAchievementIds),
    claimedAchievementTitles: Object.fromEntries(state.inventory.claimedAchievementTitles),
    lastGameTotal: state.inventory.lastGameTotal,
    updatedAt: state.inventory.updatedAt,
  };

  try {
    localStorage.setItem(getInventoryStorageKey(), JSON.stringify(payload));
  } catch (error) {}
}

function handleInventoryProfileChange(event) {
  const nextProfile = event.target.value || INVENTORY_PROFILE_IDS[0];
  if (!INVENTORY_PROFILE_IDS.includes(nextProfile) || nextProfile === state.activeInventoryProfile) {
    syncInventoryProfileControl();
    return;
  }

  if (state.ocrActive) {
    syncInventoryProfileControl();
    showOcrInterruptionDialog(() => {
      cancelActiveOcr();
      applyInventoryProfileChange(nextProfile);
    });
    return;
  }

  applyInventoryProfileChange(nextProfile);
}

function applyInventoryProfileChange(nextProfile) {
  cancelActiveOcr();
  state.activeInventoryProfile = nextProfile;
  writeActiveInventoryProfile();
  syncInventoryProfileControl();
  state.inventory = readInventory();
  state.pendingMatches = [];
  state.selectedFiles = [];
  if (hasInventory && elements.screenshotInput) {
    elements.screenshotInput.value = "";
  }
  if (hasInventory && elements.runOcrButton) {
    elements.runOcrButton.disabled = true;
  }
  if (hasInventory && elements.ocrProgress) {
    elements.ocrProgress.hidden = true;
    elements.ocrProgress.value = 0;
  }
  if (hasInventory && elements.ocrStatus) {
    elements.ocrStatus.textContent = `已切换到${getInventoryProfileLabel()}`;
  }
  renderInventory();
  refreshCurrentResults();
}

function handleInventoryStorageChange(event) {
  if (
    event.key !== INVENTORY_ACTIVE_PROFILE_KEY &&
    event.key !== getInventoryStorageKey()
  ) {
    return;
  }

  state.activeInventoryProfile = readActiveInventoryProfile();
  syncInventoryProfileControl();
  state.inventory = readInventory();
  renderInventory();
  refreshCurrentResults();
}

function resetInventory() {
  showConfirmDialog({
    title: `清空${getInventoryProfileLabel()}`,
    message: `确定清空${getInventoryProfileLabel()}保存的称号记录和待确认结果吗？其他档案不会受影响。`,
    confirmText: "清空记录",
    onConfirm: () => {
      state.inventory = createEmptyInventory();
      state.pendingMatches = [];
      try {
        localStorage.removeItem(getInventoryStorageKey());
        if (state.activeInventoryProfile === INVENTORY_PROFILE_IDS[0]) {
          localStorage.removeItem(INVENTORY_STORAGE_KEY);
        }
      } catch (error) {}
      renderInventory();
      refreshCurrentResults();
    },
  });
}

function showConfirmDialog({ title, message, confirmText, onConfirm }) {
  if (!elements.confirmDialog) {
    if (window.confirm(message)) {
      onConfirm();
    }
    return;
  }

  state.confirmAction = onConfirm;
  state.confirmReturnFocus =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;
  elements.confirmDialogTitle.textContent = title;
  elements.confirmDialogMessage.textContent = message;
  elements.confirmDialogConfirm.textContent = confirmText;
  elements.confirmDialog.hidden = false;
  document.body.classList.add("is-modal-open");
  elements.confirmDialogConfirm.focus();
}

function closeConfirmDialog() {
  if (!elements.confirmDialog || elements.confirmDialog.hidden) {
    return;
  }

  elements.confirmDialog.hidden = true;
  document.body.classList.remove("is-modal-open");
  state.confirmAction = null;
  const returnFocus = state.confirmReturnFocus;
  state.confirmReturnFocus = null;
  if (returnFocus?.isConnected) {
    returnFocus.focus();
  }
}

function handleConfirmDialogClick(event) {
  const button = event.target.closest("[data-dialog-action]");
  if (!button) {
    if (event.target === elements.confirmDialog) {
      closeConfirmDialog();
    }
    return;
  }

  if (button.dataset.dialogAction === "confirm") {
    const action = state.confirmAction;
    closeConfirmDialog();
    if (typeof action === "function") {
      action();
    }
    return;
  }

  closeConfirmDialog();
}

function handleConfirmDialogKeydown(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    closeConfirmDialog();
  }
}

function handleInventoryNavigationClick(event) {
  if (!state.ocrActive) {
    return;
  }

  const link = event.target.closest("a[href]");
  if (!link || link.target || link.hasAttribute("download")) {
    return;
  }
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  const nextUrl = new URL(link.getAttribute("href"), window.location.href);
  if (nextUrl.href === window.location.href || nextUrl.origin !== window.location.origin) {
    return;
  }

  event.preventDefault();
  showOcrInterruptionDialog(() => {
    cancelActiveOcr();
    window.location.href = nextUrl.href;
  });
}

function showOcrInterruptionDialog(onConfirm) {
  showConfirmDialog({
    title: "识别将中断",
    message: "正在识别图鉴截图。离开当前页面会中断识别，再次识别时需要重新上传图片",
    confirmText: "离开并中断",
    onConfirm,
  });
}

function buildIndices() {
  indices.masksById = new Map(state.masks.map((mask) => [mask.maskId, mask]));
  indices.achievementsById = new Map(
    state.achievements.map((achievement) => [achievement.achievementId, achievement]),
  );
  indices.tokensById = new Map(
    state.tokenAchievements.map((achievement) => [
      achievement.achievementId,
      achievement,
    ]),
  );
  indices.appearancesById = new Map(
    state.appearanceAchievements.map((achievement) => [
      achievement.achievementId,
      achievement,
    ]),
  );
  indices.manualItems = [
    ...state.achievements.map((item) => ({ kind: "achievement", item })),
    ...state.tokenAchievements.map((item) => ({ kind: "token", item })),
    ...state.appearanceAchievements.map((item) => ({ kind: "appearance", item })),
  ].map((entry) => ({
    ...entry,
    _searchEntries: buildSearchEntries(getManualSearchValues(entry.kind, entry.item)),
  }));
}

function getManualSearchValues(kind, item) {
  if (kind === "appearance") {
    return [item.achievement, item.maleTitle, item.femaleTitle, item.achievementId];
  }
  return [item.achievement, item.achievementId, ...(item.demandNames || [])];
}

function readPanelState() {
  const fallback = {
    maskFilterCollapsed: true,
    traitCollapsed: true,
  };

  try {
    const stored = JSON.parse(localStorage.getItem(PANEL_STORAGE_KEY) || "{}");
    return {
      maskFilterCollapsed:
        typeof stored.maskFilterCollapsed === "boolean"
          ? stored.maskFilterCollapsed
          : fallback.maskFilterCollapsed,
      traitCollapsed:
        typeof stored.traitCollapsed === "boolean"
          ? stored.traitCollapsed
          : fallback.traitCollapsed,
    };
  } catch (error) {
    return fallback;
  }
}

function writePanelState(panelKey, collapsed) {
  const panelState = readPanelState();
  panelState[panelKey] = collapsed;

  try {
    localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(panelState));
  } catch (error) {}
}

function syncPanelLabels() {
  setCollapsiblePanelState(
    elements.maskFilterContent,
    elements.maskFilterToggle,
    elements.maskFilterContent.hidden,
  );
  setCollapsiblePanelState(
    elements.traitContent,
    elements.traitToggle,
    elements.traitContent.hidden,
  );
}

function toggleCollapsiblePanel(content, toggle, panelKey) {
  const collapsed = !content.hidden;
  setCollapsiblePanelState(content, toggle, collapsed);
  writePanelState(panelKey, collapsed);
}

function setCollapsiblePanelState(content, toggle, collapsed) {
  const panel = content.closest(".filter-form, .trait-form");
  const panelLabel = panel?.getAttribute("aria-label") || "筛选面板";
  const actionLabel = collapsed ? "展开" : "收起";
  const compactLabel = panel?.classList.contains("trait-form") ? "特性" : "筛选";
  const visibleLabel =
    collapsed && compactControlsMedia.matches ? compactLabel : actionLabel;
  const label = toggle.querySelector(".collapse-toggle-label");

  content.hidden = collapsed;
  panel?.classList.toggle("is-collapsed", collapsed);
  if (label) {
    label.textContent = visibleLabel;
  } else {
    toggle.textContent = visibleLabel;
  }
  toggle.setAttribute("aria-label", `${actionLabel}${panelLabel}`);
  toggle.setAttribute("aria-expanded", String(!collapsed));
  toggle.title = `${actionLabel}${panelLabel}`;
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
  return String(text || "")
    .toLocaleLowerCase("zh-CN")
    .replace(/[\s"'`~!@#$%^&*()\-_=+\[\]{};:,.<>/?\\|，。；：、（）【】《》]+/g, "");
}

function normalizeLatinKey(text) {
  return String(text || "").toLocaleLowerCase("zh-CN").replace(/[^a-z0-9]/g, "");
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
  const titles = [
    achievement.achievement,
    achievement.maleTitle,
    achievement.femaleTitle,
    ...(achievement.titles || []),
    achievement.achievementId,
  ];
  return {
    ...achievement,
    point: Number(achievement.point) || 0,
    demand: Number(achievement.demand) || achievement.demand,
    _searchEntries: buildSearchEntries(titles),
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
  if (!hasSearch) {
    return;
  }
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
  if (hasSearch) {
    runSearch(elements.input.value);
  }
  renderInventory();
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

  return String(left.item[field] || "").localeCompare(
    String(right.item[field] || ""),
    "zh-CN",
  );
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
  const extraMatches = hasInventory
    ? [
        ...searchCollection(state.tokenAchievements, query, "achievement"),
        ...searchCollection(state.appearanceAchievements, query, "achievement"),
      ]
    : [];

  renderSuggestions(maskMatches, [...achievementMatches, ...extraMatches]);
  renderResults(cleaned, maskMatches, [...achievementMatches, ...extraMatches]);
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
      title: `${achievement.achievement} · ${getAchievementKindText(achievement)}`,
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

  elements.status.textContent = `“${query}” 共匹配到 ${masks.length} 条面具结果、${achievements.length} 条图鉴结果`;

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
    renderAchievementStatusLine(directLine, mask.directAchievement, {
      text: `${mask.directAchievement.achievement} · ${mask.directAchievement.point} 分`,
    });
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
      renderAchievementStatusLine(li, item, {
        text: partners.length
          ? `${item.achievement} · ${item.point} 分 · ${partners.join(" / ")}`
          : `${item.achievement} · ${item.point} 分`,
      });
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

function renderAchievementStatusLine(container, achievement, options = {}) {
  container.replaceChildren();
  container.classList.add("achievement-status-line");

  const text = document.createElement("span");
  text.className = "achievement-status-text";
  text.textContent = options.text || getInventoryAchievementLine(achievement);
  container.appendChild(text);

  if (isClaimedAchievement(achievement.achievementId)) {
    container.appendChild(createActivatedChip());
  }
}

function createActivatedChip() {
  const chip = document.createElement("span");
  chip.className = "state-chip is-active";
  chip.textContent = "已激活";
  return chip;
}

function createAchievementCard(item) {
  const fragment = elements.achievementTemplate.content.cloneNode(true);
  const title = fragment.querySelector(".card-title");
  const subtitle = fragment.querySelector(".card-subtitle");
  const heading = fragment.querySelector(".card-heading");
  title.textContent = getAchievementTitle(item);
  subtitle.textContent = getAchievementKindText(item);
  if (isClaimedAchievement(item.achievementId)) {
    const stateRow = document.createElement("div");
    stateRow.className = "card-state-row";
    stateRow.appendChild(createActivatedChip());
    heading.appendChild(stateRow);
  }
  fragment.querySelector(".score-badge").textContent = `${item.point} 分`;

  const list = fragment.querySelector(".detail-list");
  const label = fragment.querySelector(".detail-label");
  label.textContent =
    item.type === "token"
      ? "所需信物"
      : item.type === "appearance"
        ? "容貌条件"
        : "所需面具";

  if (item.type === "token") {
    item.demandIds.forEach((tokenId) => {
      const li = document.createElement("li");
      li.textContent = tokenId;
      list.appendChild(li);
    });
  } else if (item.type === "appearance") {
    const li = document.createElement("li");
    li.textContent = `容貌值达到 ${item.demand}`;
    list.appendChild(li);
  } else {
    item.demandIds.forEach((maskId, index) => {
      const li = document.createElement("li");
      const name = item.demandNames[index] || maskId;
      li.textContent = `${name} · ${maskId}`;
      list.appendChild(li);
    });
  }

  return fragment;
}

function getAchievementTitle(item) {
  if (item.type === "appearance") {
    return `${item.maleTitle} / ${item.femaleTitle}`;
  }
  return item.achievement;
}

function getAchievementKindText(item) {
  if (item.type === "token") {
    return "信物称号";
  }
  if (item.type === "appearance") {
    return "江湖容貌";
  }
  return item.type === "single" ? "单面具称号" : "组合称号";
}

function isClaimedAchievement(achievementId) {
  if (state.inventory.claimedAchievementIds.has(achievementId)) {
    return true;
  }

  const appearance = indices.appearancesById.get(achievementId);
  if (!appearance) {
    return false;
  }

  return false;
}

function toggleAchievement(achievementId) {
  if (state.inventory.claimedAchievementIds.has(achievementId)) {
    state.inventory.claimedAchievementIds.delete(achievementId);
    state.inventory.claimedAchievementTitles.delete(achievementId);
  } else {
    state.inventory.claimedAchievementIds.add(achievementId);
    const achievement =
      indices.achievementsById.get(achievementId) ||
      indices.tokensById.get(achievementId) ||
      indices.appearancesById.get(achievementId);
    if (achievement) {
      state.inventory.claimedAchievementTitles.set(
        achievementId,
        getAchievementTitle(achievement),
      );
    }
  }
  writeInventory();
  refreshCurrentResults();
}

function prepareScreenshotPicker() {
  if (elements.screenshotInput) {
    elements.screenshotInput.value = "";
  }
}

function handleFileSelection(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) {
    if (!state.selectedFiles.length) {
      elements.ocrStatus.textContent = "未选择图片";
      elements.runOcrButton.disabled = true;
    }
    return;
  }
  setSelectedFiles(files);
}

function setSelectedFiles(files) {
  const selectedFiles = Array.isArray(files) ? files : [];
  const imageFiles = selectedFiles
    .filter((file) => isImageFile(file))
    .sort(compareDroppedFiles);
  const ignoredCount = selectedFiles.length - imageFiles.length;
  state.ocrRunId += 1;
  state.ocrActive = false;
  state.selectedFiles = imageFiles;
  if (state.selectedFiles.length) {
    state.inventory.lastGameTotal = 0;
  }
  elements.runOcrButton.disabled = state.selectedFiles.length === 0;
  if (state.selectedFiles.length) {
    elements.ocrStatus.textContent = ignoredCount
      ? `已选择 ${state.selectedFiles.length} 张图片，已忽略 ${ignoredCount} 个非图片文件`
      : `已选择 ${state.selectedFiles.length} 张图片`;
  } else if (selectedFiles.length) {
    elements.ocrStatus.textContent = "未读取到可识别图片，请改选截图原图";
  } else {
    elements.ocrStatus.textContent = "未选择图片";
  }
  elements.uploadDrop?.classList.remove("is-drag-over");
  renderInventory();
}

function handleUploadDragEnter(event) {
  event.preventDefault();
  elements.uploadDrop?.classList.add("is-drag-over");
}

function handleUploadDragOver(event) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "copy";
  }
  elements.uploadDrop?.classList.add("is-drag-over");
}

function handleUploadDragLeave(event) {
  if (!elements.uploadDrop?.contains(event.relatedTarget)) {
    elements.uploadDrop?.classList.remove("is-drag-over");
  }
}

async function handleUploadDrop(event) {
  event.preventDefault();
  elements.uploadDrop?.classList.remove("is-drag-over");
  elements.ocrStatus.textContent = "正在读取拖入内容";
  try {
    const files = await getDroppedFiles(event.dataTransfer);
    setSelectedFiles(files);
  } catch (error) {
    elements.ocrStatus.textContent = `读取失败：${error.message}`;
  }
}

function isImageFile(file) {
  if (!file) {
    return false;
  }
  const type = String(file.type || "").toLowerCase();
  const name = String(file.name || "");
  if (/^image\//i.test(type)) {
    return true;
  }
  if (/\.(jpe?g|png|webp|bmp|gif|avif|heic|heif)$/i.test(name)) {
    return true;
  }
  if (/\.[a-z0-9]{1,8}$/i.test(name)) {
    return false;
  }
  return !type || type === "application/octet-stream" || type === "binary/octet-stream";
}

function compareDroppedFiles(left, right) {
  const leftPath = left.webkitRelativePath || left.relativePath || left.name || "";
  const rightPath = right.webkitRelativePath || right.relativePath || right.name || "";
  return leftPath.localeCompare(rightPath, "zh-CN", { numeric: true });
}

async function getDroppedFiles(dataTransfer) {
  if (!dataTransfer) {
    return [];
  }

  const items = Array.from(dataTransfer.items || []);
  const entryReaders = items
    .map((item) =>
      typeof item.webkitGetAsEntry === "function" ? item.webkitGetAsEntry() : null,
    )
    .filter(Boolean);

  if (entryReaders.length) {
    const nestedFiles = await Promise.all(
      entryReaders.map((entry) => readDroppedEntry(entry)),
    );
    return nestedFiles.flat();
  }

  return Array.from(dataTransfer.files || []);
}

function readDroppedEntry(entry, path = "") {
  if (!entry) {
    return Promise.resolve([]);
  }

  if (entry.isFile) {
    return new Promise((resolve, reject) => {
      entry.file(
        (file) => {
          if (path) {
            Object.defineProperty(file, "relativePath", {
              value: `${path}${file.name}`,
              configurable: true,
            });
          }
          resolve([file]);
        },
        () => reject(new Error("文件读取失败")),
      );
    });
  }

  if (!entry.isDirectory) {
    return Promise.resolve([]);
  }

  const reader = entry.createReader();
  const directoryPath = `${path}${entry.name}/`;
  const entries = [];

  return new Promise((resolve, reject) => {
    const readBatch = () => {
      reader.readEntries(
        async (batch) => {
          if (!batch.length) {
            try {
              const files = await Promise.all(
                entries.map((child) => readDroppedEntry(child, directoryPath)),
              );
              resolve(files.flat());
            } catch (error) {
              reject(error);
            }
            return;
          }
          entries.push(...batch);
          readBatch();
        },
        () => reject(new Error("文件夹读取失败")),
      );
    };
    readBatch();
  });
}

function cancelActiveOcr() {
  if (!state.ocrActive) {
    return;
  }
  state.ocrRunId += 1;
  state.ocrActive = false;
  stopOcrTimer("识别已取消");
}

function assertOcrRunActive(runId) {
  if (runId !== state.ocrRunId || !state.ocrActive) {
    throw new Error("识别已取消");
  }
}

async function runOcr() {
  if (!state.selectedFiles.length) {
    return;
  }

  if (!window.Tesseract) {
    elements.ocrStatus.textContent = "Tesseract.js 未加载，检查网络后重试";
    return;
  }

  elements.runOcrButton.disabled = true;
  elements.ocrProgress.hidden = false;
  elements.ocrProgress.value = 0;
  state.ocrRunId += 1;
  state.ocrActive = true;
  const runId = state.ocrRunId;
  const previousGameTotal = state.inventory.lastGameTotal;
  const newMatches = [];
  const gameTotalCandidates = [];
  const skippedFiles = [];
  const unreadableFiles = [];
  const ocrSessions = [];
  const fileProgress = new Array(state.selectedFiles.length).fill(0);
  const concurrency = getAdaptiveOcrConcurrency(state.selectedFiles.length);
  const runningFileNames = new Map();
  let nextFileIndex = 0;
  let completedFiles = 0;
  let slotError = null;
  startOcrTimer();

  const setFileProgress = (index, progress) => {
    fileProgress[index] = Math.max(
      fileProgress[index] || 0,
      clampNumber(progress, 0, 1),
    );
    elements.ocrProgress.value =
      fileProgress.reduce((sum, value) => sum + value, 0) / state.selectedFiles.length;
  };

  const processFile = async (index, ocrSession) => {
    assertOcrRunActive(runId);
    const file = state.selectedFiles[index];
    runningFileNames.set(index, file.name);
    elements.ocrStatus.textContent = getOcrRunningStatus(
      completedFiles,
      state.selectedFiles.length,
      concurrency,
      Array.from(runningFileNames.values()),
    );
    try {
      const screenshotLayout = await inspectAchievementScreenshot(file);
      if (screenshotLayout.decodeFailed) {
        unreadableFiles.push(file.name || "未命名图片");
        setFileProgress(index, 1);
        return;
      }
      if (isDefiniteUnsupportedOcrScreenshot(screenshotLayout)) {
        skippedFiles.push(file.name);
        setFileProgress(index, 1);
        return;
      }

      const [gameTotal, rows] = await Promise.all([
        recognizeGameTotalFromFile(file, {
          ocrSession,
          onProgress: (progress) => setFileProgress(index, progress * 0.16),
          shouldCancel: () => runId !== state.ocrRunId || !state.ocrActive,
        }),
        recognizeAchievementRowsFast(file, {
          ocrSession,
          onProgress: (progress) => setFileProgress(index, 0.16 + progress * 0.84),
          shouldCancel: () => runId !== state.ocrRunId || !state.ocrActive,
        }),
      ]);
      assertOcrRunActive(runId);
      const ocrPayload = {
        fullText: "",
        titleText: rows.map((row) => row.text).join("\n"),
        rows,
      };
      if (!isSupportedAchievementOcrScreenshot(screenshotLayout, gameTotal, rows)) {
        skippedFiles.push(file.name);
        setFileProgress(index, 1);
        return;
      }
      if (gameTotal !== null) {
        gameTotalCandidates.push(gameTotal);
      }
      newMatches.push(...matchOcrText(ocrPayload, file.name));
      setFileProgress(index, 1);
    } finally {
      runningFileNames.delete(index);
    }
  };

  const runSlot = async () => {
    const ocrSession = createOcrSession({
      shouldCancel: () => runId !== state.ocrRunId || !state.ocrActive,
    });
    ocrSessions.push(ocrSession);
    try {
      while (nextFileIndex < state.selectedFiles.length) {
        assertOcrRunActive(runId);
        const index = nextFileIndex;
        nextFileIndex += 1;
        await processFile(index, ocrSession);
        completedFiles += 1;
      }
    } catch (error) {
      slotError ||= error;
      if (runId === state.ocrRunId) {
        state.ocrActive = false;
      }
    }
  };

  try {
    await Promise.allSettled(
      Array.from({ length: concurrency }, () => runSlot()),
    );
    if (slotError) {
      throw slotError;
    }

    assertOcrRunActive(runId);
    const selectedGameTotal = selectGameTotalCandidate(gameTotalCandidates);
    if (selectedGameTotal !== null) {
      state.inventory.lastGameTotal = selectedGameTotal;
    }
    addPendingMatches(newMatches);
    writeInventory();
    elements.ocrProgress.value = 1;
    const statusNotes = [];
    if (skippedFiles.length) {
      statusNotes.push(`已跳过 ${skippedFiles.length} 张非图鉴截图`);
    }
    if (unreadableFiles.length) {
      statusNotes.push(`${unreadableFiles.length} 张图片浏览器无法读取`);
    }
    const skippedText = statusNotes.length ? `，${statusNotes.join("，")}` : "";
    elements.ocrStatus.textContent = newMatches.length
      ? `识别完成，待确认 ${state.pendingMatches.length} 条${skippedText}`
      : `识别完成，未匹配到可确认条目${skippedText}`;
    stopOcrTimer("识别完成");
  } catch (error) {
    state.inventory.lastGameTotal = previousGameTotal;
    elements.ocrStatus.textContent =
      error.message === "识别已取消" ? "识别已取消" : `识别失败：${error.message}`;
    stopOcrTimer(error.message === "识别已取消" ? "识别已取消" : "识别失败");
  } finally {
    await Promise.all(ocrSessions.map((session) => session.terminate().catch(() => {})));
    if (runId === state.ocrRunId) {
      state.ocrActive = false;
    }
    elements.runOcrButton.disabled = state.selectedFiles.length === 0;
    renderInventory();
  }
}

function getAdaptiveOcrConcurrency(fileCount) {
  if (!state.ocrFastMode || fileCount < 2) {
    return 1;
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection?.saveData) {
    return 1;
  }

  const memory = Number(navigator.deviceMemory) || 0;
  const cores = Number(navigator.hardwareConcurrency) || 0;
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
  if (isMobile || (memory && memory < 6) || (cores && cores < 8)) {
    return 1;
  }

  if ((memory >= 8 && cores >= 8) || (!memory && cores >= 8)) {
    return OCR_MAX_PARALLEL_FILES;
  }

  return 1;
}

function getOcrRunningStatus(completed, total, concurrency, fileNames) {
  const mode = concurrency > 1 ? `，快速识别，并行 ${concurrency} 张` : "";
  const runningNames = Array.isArray(fileNames) ? fileNames : [fileNames].filter(Boolean);
  const names = runningNames.length ? `：${runningNames.join("、")}` : "";
  return `正在识别 ${Math.min(completed + 1, total)}/${total}${mode}${names}`;
}

function startOcrTimer() {
  state.ocrStartedAt = Date.now();
  state.ocrTimerLabel = "识别中";
  updateOcrTimer();
  if (state.ocrTimerId) {
    window.clearTimeout(state.ocrTimerId);
  }
  scheduleOcrTimerTick();
}

function stopOcrTimer(label) {
  if (state.ocrTimerId) {
    window.clearTimeout(state.ocrTimerId);
    state.ocrTimerId = 0;
  }
  state.ocrTimerLabel = label;
  updateOcrTimer();
}

function scheduleOcrTimerTick() {
  if (!state.ocrStartedAt || !state.ocrActive) {
    return;
  }
  const elapsed = Date.now() - state.ocrStartedAt;
  const delay = Math.max(120, 1000 - (elapsed % 1000));
  state.ocrTimerId = window.setTimeout(() => {
    updateOcrTimer();
    scheduleOcrTimerTick();
  }, delay);
}

function updateOcrTimer() {
  if (!elements.ocrTimer) {
    return;
  }
  if (!state.ocrStartedAt) {
    elements.ocrTimer.hidden = true;
    elements.ocrTimer.textContent = "";
    return;
  }
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - state.ocrStartedAt) / 1000));
  elements.ocrTimer.textContent = `${state.ocrTimerLabel} ${formatDuration(elapsedSeconds)}`;
  elements.ocrTimer.hidden = false;
}

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) {
    return `${seconds} 秒`;
  }
  return `${minutes} 分 ${String(seconds).padStart(2, "0")} 秒`;
}

function inspectAchievementScreenshot(file) {
  return new Promise((resolve) => {
    const fallback = {
      isPortrait: false,
      decodeFailed: false,
      centerRedRatio: 0,
      leftRedRatio: 0,
      rightRedRatio: 0,
      hasCenterActiveTab: false,
      hasOffCenterActiveTab: false,
    };
    const reader = new FileReader();
    reader.onerror = () => resolve({ ...fallback, decodeFailed: true });
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => resolve({ ...fallback, decodeFailed: true });
      image.onload = () => {
        if (!image.width || !image.height) {
          resolve(fallback);
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        context.drawImage(image, 0, 0);
        const zones = {
          leftRedRatio: getRedPixelRatio(context, canvas.width, canvas.height, {
            x1: 0.1,
            x2: 0.38,
            y1: 0.17,
            y2: 0.235,
          }),
          centerRedRatio: getRedPixelRatio(context, canvas.width, canvas.height, {
            x1: 0.37,
            x2: 0.63,
            y1: 0.17,
            y2: 0.235,
          }),
          rightRedRatio: getRedPixelRatio(context, canvas.width, canvas.height, {
            x1: 0.62,
            x2: 0.92,
            y1: 0.17,
            y2: 0.235,
          }),
        };
        const centerDominant =
          zones.centerRedRatio >= 0.02 &&
          zones.centerRedRatio >= zones.leftRedRatio * 1.25 &&
          zones.centerRedRatio >= zones.rightRedRatio * 1.25;
        const offCenterRedRatio = Math.max(
          zones.leftRedRatio,
          zones.rightRedRatio,
        );
        const offCenterDominant =
          offCenterRedRatio >= 0.02 &&
          zones.centerRedRatio < 0.03 &&
          offCenterRedRatio >= zones.centerRedRatio * 3;
        resolve({
          isPortrait: image.height > image.width * 1.2,
          ...zones,
          hasCenterActiveTab: centerDominant,
          hasOffCenterActiveTab: offCenterDominant,
        });
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function getRedPixelRatio(context, width, height, zone) {
  const xStart = clampNumber(Math.round(width * zone.x1), 0, width - 1);
  const xEnd = clampNumber(Math.round(width * zone.x2), xStart + 1, width);
  const yStart = clampNumber(Math.round(height * zone.y1), 0, height - 1);
  const yEnd = clampNumber(Math.round(height * zone.y2), yStart + 1, height);
  const imageData = context.getImageData(xStart, yStart, xEnd - xStart, yEnd - yStart);
  const data = imageData.data;
  let redPixels = 0;
  const total = Math.max(1, data.length / 4);
  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    if (red >= 110 && green <= 90 && blue <= 100 && red > green * 1.4) {
      redPixels += 1;
    }
  }
  return redPixels / total;
}

function isDefiniteUnsupportedOcrScreenshot(layout) {
  if (!layout?.isPortrait) {
    return true;
  }
  return layout.hasOffCenterActiveTab && !layout.hasCenterActiveTab;
}

function isSupportedAchievementOcrScreenshot(layout, gameTotal, rows) {
  if (!layout?.isPortrait) {
    return false;
  }
  return !layout.hasOffCenterActiveTab;
}

async function recognizeGameTotalFromFile(file, options = {}) {
  const crops = await preprocessGameTotalCrops(file);
  const texts = [];
  for (let index = 0; index < crops.length; index += 1) {
    throwIfOcrCancelled(options.shouldCancel);
    const isFastNumberPass = index < 2;
    const text = await recognizeOcrSource(
      crops[index],
      isFastNumberPass ? "eng" : "chi_sim+eng",
      isFastNumberPass
        ? {
            tessedit_pageseg_mode: "7",
            tessedit_char_whitelist: "0123456789",
          }
        : {
            tessedit_pageseg_mode: "7",
          },
      options.ocrSession,
    );
    throwIfOcrCancelled(options.shouldCancel);
    texts.push(text);
    if (isFastNumberPass) {
      const total = detectGameTotalFromHeader(texts.join("\n"));
      if (total !== null) {
        options.onProgress?.(1);
        return total;
      }
    }
    options.onProgress?.((index + 1) / Math.max(crops.length, 1));
  }
  return detectGameTotalFromHeader(texts.join("\n"));
}

async function recognizeAchievementRowsFast(file, options = {}) {
  const sourceRows = await preprocessAchievementRows(file);
  const rows = sourceRows.map((row) => ({
    index: row.index,
    visibility: row.visibility,
    titleText: "",
    text: "",
  }));

  await recognizeRowStrip(sourceRows, rows, {
    ...options,
    progressStart: 0,
    progressWeight: 0.32,
  });

  const primarySelected = selectOrderedRowMatches(rows);
  const primaryJobs = sourceRows.flatMap((row, rowIndex) => {
    if (!shouldRunFallbackRowOcr(primarySelected.get(rowIndex))) {
      return [];
    }
    return (row.primaryTitleSources || row.titleSources.slice(0, 1)).map((source) => ({
      rowIndex,
      source,
    }));
  });
  if (primaryJobs.length) {
    await recognizeRowSourceJobs(primaryJobs, rows, {
      ...options,
      progressStart: 0.32,
      progressWeight: 0.3,
    });
  }

  const selected = selectOrderedRowMatches(rows);
  const fallbackJobs = sourceRows.flatMap((row, rowIndex) => {
    const candidate = selected.get(rowIndex);
    if (!shouldRunFallbackRowOcr(candidate)) {
      return [];
    }
    return (row.fallbackTitleSources || []).map((source) => ({
      rowIndex,
      source,
    }));
  });

  if (fallbackJobs.length) {
    await recognizeRowSourceJobs(fallbackJobs, rows, {
      ...options,
      progressStart: 0.62,
      progressWeight: 0.38,
    });
  } else {
    options.onProgress?.(1);
  }

  return rows.sort((left, right) => left.index - right.index);
}

async function recognizeRowStrip(sourceRows, rows, options = {}) {
  const sources = sourceRows.map(
    (row) => (row.primaryTitleSources || row.titleSources || [])[0] || null,
  );
  if (!sources.filter(Boolean).length) {
    options.onProgress?.(options.progressStart || 0);
    return;
  }

  try {
    const strip = await createOcrStripImage(sources);
    if (!strip) {
      options.onProgress?.(options.progressStart || 0);
      return;
    }
    throwIfOcrCancelled(options.shouldCancel);
    const text = await recognizeOcrSource(strip, "chi_sim", {
      tessedit_pageseg_mode: "6",
    }, options.ocrSession);
    throwIfOcrCancelled(options.shouldCancel);
    const lines = splitStripOcrLines(text, rows.length);
    if (lines.length === rows.length) {
      lines.forEach((line, index) => {
        if (line && rows[index]) {
          appendOcrRowText(rows[index], line);
        }
      });
    }
  } catch (error) {
    if (error.message === "识别已取消") {
      throw error;
    }
  }
  options.onProgress?.((options.progressStart || 0) + (options.progressWeight || 1));
}

async function createOcrStripImage(sources) {
  const images = await Promise.all(
    sources.map((source) => (source ? loadImageSource(source).catch(() => null) : null)),
  );
  const validImages = images.filter(Boolean);
  if (!validImages.length) {
    return null;
  }

  const padding = 12;
  const gap = 18;
  const rowWidth = Math.max(...validImages.map((image) => image.width));
  const rowHeight = Math.max(...validImages.map((image) => image.height));
  const canvas = document.createElement("canvas");
  canvas.width = rowWidth + padding * 2;
  canvas.height = sources.length * rowHeight + Math.max(0, sources.length - 1) * gap + padding * 2;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  images.forEach((image, index) => {
    if (!image) {
      return;
    }
    const y = padding + index * (rowHeight + gap) + Math.round((rowHeight - image.height) / 2);
    context.drawImage(image, padding, y);
  });

  return canvas.toDataURL("image/png");
}

function loadImageSource(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("图片预处理失败"));
    image.src = source;
  });
}

function splitStripOcrLines(text, expectedCount) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ""))
    .filter((line) => /[\u3400-\u9fff]/.test(line));
  if (!lines.length || expectedCount <= 0) {
    return [];
  }
  return lines;
}

async function recognizeRowSourceJobs(jobs, rows, options = {}) {
  for (let index = 0; index < jobs.length; index += 1) {
    throwIfOcrCancelled(options.shouldCancel);
    const job = jobs[index];
    const text = await recognizeOcrSource(job.source, "chi_sim", {
      tessedit_pageseg_mode: "7",
    }, options.ocrSession);
    throwIfOcrCancelled(options.shouldCancel);
    appendOcrRowText(rows[job.rowIndex], text);
    options.onProgress?.(
      (options.progressStart || 0) +
        ((index + 1) / Math.max(jobs.length, 1)) * (options.progressWeight || 1),
    );
  }
}

function createOcrSession(options = {}) {
  const workers = new Map();
  const pendingWorkers = new Map();
  const parameterKeys = new Map();

  async function getWorker(language, parameters = {}) {
    throwIfOcrCancelled(options.shouldCancel);
    if (!workers.has(language)) {
      if (!pendingWorkers.has(language)) {
        pendingWorkers.set(
          language,
          window.Tesseract
            .createWorker(language, 1, {
              workerPath: new URL("worker.min.js", TESSERACT_VENDOR_BASE).href,
              corePath: TESSERACT_VENDOR_BASE,
              langPath: TESSDATA_VENDOR_BASE,
              gzip: true,
            })
            .then((worker) => {
              workers.set(language, worker);
              pendingWorkers.delete(language);
              return worker;
            }),
        );
      }
      await pendingWorkers.get(language);
    }

    const worker = workers.get(language);
    const parameterKey = JSON.stringify(parameters || {});
    if (parameterKeys.get(language) !== parameterKey) {
      await worker.setParameters(parameters || {});
      parameterKeys.set(language, parameterKey);
    }
    throwIfOcrCancelled(options.shouldCancel);
    return worker;
  }

  return {
    async recognize(source, language, ocrOptions = {}) {
      const worker = await getWorker(language, ocrOptions);
      const result = await worker.recognize(source);
      throwIfOcrCancelled(options.shouldCancel);
      return result?.data?.text || "";
    },
    async terminate() {
      const allWorkers = [
        ...workers.values(),
        ...(await Promise.allSettled(pendingWorkers.values()))
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value),
      ];
      await Promise.all(
        allWorkers.map((worker) => worker.terminate().catch(() => {})),
      );
      workers.clear();
      pendingWorkers.clear();
      parameterKeys.clear();
    },
  };
}

async function recognizeOcrSource(source, language, ocrOptions = {}, ocrSession = null) {
  if (ocrSession?.recognize) {
    return ocrSession.recognize(source, language, ocrOptions);
  }
  const result = await window.Tesseract.recognize(source, language, ocrOptions);
  return result?.data?.text || "";
}

function appendOcrRowText(row, text) {
  if (!row) {
    return;
  }
  row.titleText = [row.titleText, text].filter(Boolean).join("\n");
  row.text = row.titleText;
}

function shouldRunFallbackRowOcr(candidate) {
  return (
    !candidate ||
    candidate.inferred ||
    candidate.rank >= 2 ||
    Number(candidate.distance) > 0 ||
    Number(candidate.score) >= 30
  );
}

function throwIfOcrCancelled(shouldCancel) {
  if (typeof shouldCancel === "function" && shouldCancel()) {
    throw new Error("识别已取消");
  }
}

function preprocessImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("图片解码失败"));
      image.onload = () => {
        const scale = Math.min(2.4, Math.max(1.4, 1800 / image.width));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d", { willReadFrequently: true });
        context.imageSmoothingEnabled = true;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let index = 0; index < data.length; index += 4) {
          const gray = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
          const contrasted = Math.max(0, Math.min(255, (gray - 128) * 1.55 + 128));
          const value = contrasted > 172 ? 255 : contrasted < 86 ? 0 : contrasted;
          data[index] = value;
          data[index + 1] = value;
          data[index + 2] = value;
        }

        context.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function preprocessAchievementRows(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("图片解码失败"));
      image.onload = () => {
        if (image.height <= image.width * 1.2) {
          resolve([]);
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        context.drawImage(image, 0, 0);

        const bands = detectAchievementRowBands(context, canvas.width, canvas.height);
        resolve(
          bands.map((band, index) => ({
            index,
            visibility: estimateAchievementRowVisibility(band, canvas.height),
            ...createAchievementRowOcrImages(
              context,
              canvas.width,
              canvas.height,
              band,
            ),
          })),
        );
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function preprocessGameTotalCrops(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("图片解码失败"));
      image.onload = () => {
        if (image.height <= image.width * 1.2) {
          resolve([]);
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        context.drawImage(image, 0, 0);
        const numberCrops = [
          {
            x: Math.round(image.width * 0.69),
            y: Math.round(image.height * 0.13),
            width: Math.round(image.width * 0.29),
            height: Math.round(image.height * 0.085),
          },
          {
            x: Math.round(image.width * 0.75),
            y: Math.round(image.height * 0.145),
            width: Math.round(image.width * 0.22),
            height: Math.round(image.height * 0.07),
          },
          {
            x: Math.round(image.width * 0.78),
            y: Math.round(image.height * 0.16),
            width: Math.round(image.width * 0.18),
            height: Math.round(image.height * 0.045),
          },
        ];
        const crops = [
          {
            x: Math.round(image.width * 0.66),
            y: Math.round(image.height * 0.175),
            width: Math.round(image.width * 0.29),
            height: Math.round(image.height * 0.045),
          },
          ...[0.145, 0.16, 0.175].map((y) => ({
            x: Math.round(image.width * 0.61),
            y: Math.round(image.height * y),
            width: Math.round(image.width * 0.36),
            height: Math.round(image.height * 0.06),
          })),
        ];
        resolve(
          [
            ...numberCrops.flatMap((crop) => [
              createGreenNumberCropOcrImage(context, crop, { scale: 8 }),
              createSingleCropOcrImage(context, crop, {
                scale: 7,
                threshold: 112,
                mode: "light",
              }),
            ]),
            ...crops.flatMap((crop) =>
              [118, 142].map((threshold) =>
                createSingleCropOcrImage(context, crop, {
                  scale: 5,
                  threshold,
                  mode: "light",
                }),
              ),
            ),
          ],
        );
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function detectAchievementRowBands(context, width, height) {
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;
  const xStart = Math.round(width * 0.35);
  const xEnd = Math.round(width * 0.55);
  const yStart = Math.round(height * 0.25);
  const yEnd = Math.round(height * 0.84);
  const xStep = Math.max(2, Math.round(width / 280));
  const yStep = Math.max(2, Math.round(height / 380));
  const rows = [];

  for (let y = yStart; y < yEnd; y += yStep) {
    let grayPixels = 0;
    let samples = 0;
    for (let x = xStart; x < xEnd; x += xStep) {
      const offset = (y * width + x) * 4;
      const gray =
        data[offset] * 0.299 + data[offset + 1] * 0.587 + data[offset + 2] * 0.114;
      if (gray >= 70 && gray <= 190) {
        grayPixels += 1;
      }
      samples += 1;
    }
    rows.push({
      y,
      ratio: samples ? grayPixels / samples : 0,
    });
  }

  const smoothed = rows.map((row, index) => {
    const from = Math.max(0, index - 2);
    const to = Math.min(rows.length - 1, index + 2);
    let sum = 0;
    for (let i = from; i <= to; i += 1) {
      sum += rows[i].ratio;
    }
    return {
      y: row.y,
      active: sum / (to - from + 1) >= 0.55,
    };
  });

  const bands = [];
  let start = null;
  smoothed.forEach((row) => {
    if (row.active && start === null) {
      start = row.y;
    } else if (!row.active && start !== null) {
      bands.push({ y: start, height: row.y - start });
      start = null;
    }
  });
  if (start !== null) {
    bands.push({ y: start, height: yEnd - start });
  }

  const minHeight = height * 0.026;
  const maxHeight = height * 0.095;
  const normalizedBands = fillMissingAchievementRowBands(
    mergeNearbyBands(bands, height * 0.012)
    .map((band) => ({
      ...band,
      partial: band.y <= yStart + height * 0.01 || band.y + band.height >= yEnd - height * 0.01,
    }))
    .filter(
      (band) =>
        (band.partial && band.height >= height * 0.015) ||
        (band.height >= minHeight && band.height <= maxHeight),
    ),
    height,
    yStart,
    yEnd,
  )
    .slice(0, 8);

  return normalizedBands.length
    ? normalizedBands
    : createFallbackAchievementBands(height);
}

function mergeNearbyBands(bands, maxGap) {
  const merged = [];
  bands.forEach((band) => {
    const previous = merged[merged.length - 1];
    if (previous && band.y - (previous.y + previous.height) <= maxGap) {
      const bottom = Math.max(previous.y + previous.height, band.y + band.height);
      previous.height = bottom - previous.y;
    } else {
      merged.push({ ...band });
    }
  });
  return merged;
}

function fillMissingAchievementRowBands(bands, height, yStart, yEnd) {
  if (bands.length < 3) {
    return bands;
  }

  const sorted = [...bands].sort((left, right) => left.y - right.y);
  const diffs = [];
  for (let index = 1; index < sorted.length; index += 1) {
    const diff = sorted[index].y - sorted[index - 1].y;
    if (diff >= height * 0.06 && diff <= height * 0.115) {
      diffs.push(diff);
    }
  }

  const rowStep = medianNumber(diffs, height * 0.087);
  const rowHeight = medianNumber(
    sorted.map((band) => band.height).filter((value) => value >= height * 0.025),
    height * 0.055,
  );
  const filled = [];

  sorted.forEach((band, index) => {
    filled.push(band);
    const next = sorted[index + 1];
    if (!next) {
      return;
    }
    const gap = next.y - band.y;
    const missingCount = Math.min(2, Math.round(gap / rowStep) - 1);
    if (missingCount <= 0 || gap < rowStep * 1.55) {
      return;
    }

    for (let offset = 1; offset <= missingCount; offset += 1) {
      const y = Math.round(band.y + rowStep * offset);
      if (y <= yStart || y + rowHeight >= yEnd) {
        continue;
      }
      filled.push({
        y,
        height: Math.round(rowHeight),
        partial: false,
        inferredBand: true,
      });
    }
  });

  return filled.sort((left, right) => left.y - right.y);
}

function medianNumber(values, fallback) {
  const sorted = values
    .map(Number)
    .filter((value) => Number.isFinite(value))
    .sort((left, right) => left - right);
  if (!sorted.length) {
    return fallback;
  }
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function createFallbackAchievementBands(height) {
  const rowHeight = Math.round(height * 0.062);
  const rowStep = Math.round(height * 0.087);
  const firstY = Math.round(height * 0.326);
  return Array.from({ length: 6 }, (_, index) => ({
    y: firstY + index * rowStep,
    height: rowHeight,
  })).filter((band) => band.y + band.height < height * 0.86);
}

function createAchievementRowOcrImages(context, width, height, band) {
  const scale = 5;
  const cropTopRatio = band.partial ? 0.02 : 0.08;
  const cropHeightRatio = band.partial ? 0.9 : 0.72;
  const baseCrop = createRowCropGeometry(band, height, cropTopRatio, cropHeightRatio);
  const titleCrops = [
    {
      x: Math.round(width * 0.05),
      y: baseCrop.y,
      width: Math.round(width * 0.31),
      height: baseCrop.height,
    },
  ];
  if (band.partial) {
    const standardCrop = createRowCropGeometry(band, height, 0.08, 0.72);
    titleCrops.push({
      x: Math.round(width * 0.05),
      y: standardCrop.y,
      width: Math.round(width * 0.31),
      height: standardCrop.height,
    });
  }
  const titlePillCrop = detectAchievementTitlePillCrop(context, width, height, band);
  const titlePillSources = titlePillCrop
    ? [
        createSingleCropOcrImage(context, titlePillCrop, {
          scale: 6,
          threshold: 155,
          mode: "light",
        }),
      ]
    : [];
  const cropSources = titleCrops.flatMap((titleCrop) => [
    createGrayCropOcrImage(context, titleCrop, { scale }),
    ...[135, 145, 155].map((threshold) =>
      createSingleCropOcrImage(context, titleCrop, {
        scale,
        threshold,
        mode: "light",
      }),
    ),
  ]);
  const titleSources = [...titlePillSources, ...cropSources];
  const primaryTitleSources = titlePillSources.length
    ? titlePillSources
    : cropSources.slice(0, 1);
  const primarySourceSet = new Set(primaryTitleSources);
  return {
    titleSources,
    primaryTitleSources,
    fallbackTitleSources: titleSources.filter((source) => !primarySourceSet.has(source)),
  };
}

function detectAchievementTitlePillCrop(context, width, height, band) {
  const xStart = Math.round(width * 0.045);
  const xEnd = Math.round(width * 0.35);
  const yStart = clampNumber(
    Math.round(band.y + band.height * (band.partial ? 0.03 : 0.12)),
    0,
    height - 1,
  );
  const yEnd = clampNumber(
    Math.round(band.y + band.height * (band.partial ? 0.9 : 0.78)),
    yStart + 1,
    height,
  );
  const regionWidth = xEnd - xStart;
  const regionHeight = yEnd - yStart;
  if (regionWidth < width * 0.12 || regionHeight < height * 0.012) {
    return null;
  }

  const imageData = context.getImageData(xStart, yStart, regionWidth, regionHeight);
  const data = imageData.data;
  const rowActive = [];
  for (let y = 0; y < regionHeight; y += 1) {
    let dark = 0;
    for (let x = 0; x < regionWidth; x += 2) {
      const offset = (y * regionWidth + x) * 4;
      const gray =
        data[offset] * 0.299 + data[offset + 1] * 0.587 + data[offset + 2] * 0.114;
      if (gray < 78) {
        dark += 1;
      }
    }
    rowActive[y] = dark / Math.ceil(regionWidth / 2) > 0.16;
  }

  const ySegment = findLongestActiveSegment(rowActive);
  if (!ySegment || ySegment.end - ySegment.start < Math.max(6, height * 0.01)) {
    return null;
  }

  const colActive = [];
  for (let x = 0; x < regionWidth; x += 1) {
    let dark = 0;
    for (let y = ySegment.start; y <= ySegment.end; y += 1) {
      const offset = (y * regionWidth + x) * 4;
      const gray =
        data[offset] * 0.299 + data[offset + 1] * 0.587 + data[offset + 2] * 0.114;
      if (gray < 82) {
        dark += 1;
      }
    }
    colActive[x] = dark / (ySegment.end - ySegment.start + 1) > 0.14;
  }

  const xSegment = findLongestActiveSegment(colActive);
  if (!xSegment || xSegment.end - xSegment.start < width * 0.12) {
    return null;
  }

  const padX = Math.round(width * 0.012);
  const padY = Math.round(height * 0.004);
  const cropX = clampNumber(xStart + xSegment.start - padX, 0, width - 1);
  const cropY = clampNumber(yStart + ySegment.start - padY, 0, height - 1);
  const cropRight = clampNumber(xStart + xSegment.end + padX, cropX + 1, width);
  const cropBottom = clampNumber(yStart + ySegment.end + padY, cropY + 1, height);
  return {
    x: cropX,
    y: cropY,
    width: cropRight - cropX,
    height: cropBottom - cropY,
  };
}

function findLongestActiveSegment(values) {
  let best = null;
  let start = null;
  values.forEach((active, index) => {
    if (active && start === null) {
      start = index;
    } else if (!active && start !== null) {
      const segment = { start, end: index - 1 };
      if (!best || segment.end - segment.start > best.end - best.start) {
        best = segment;
      }
      start = null;
    }
  });
  if (start !== null) {
    const segment = { start, end: values.length - 1 };
    if (!best || segment.end - segment.start > best.end - best.start) {
      best = segment;
    }
  }
  return best;
}

function createRowCropGeometry(band, height, topRatio, heightRatio) {
  const y = clampNumber(Math.round(band.y + band.height * topRatio), 0, height - 1);
  return {
    y,
    height: clampNumber(Math.round(band.height * heightRatio), 1, height - y),
  };
}

function estimateAchievementRowVisibility(band, height) {
  const standardHeight = height * 0.055;
  return clampNumber(band.height / standardHeight, 0.15, 1);
}

function drawThresholdedCrop(
  sourceContext,
  targetContext,
  crop,
  targetX,
  targetY,
  scale,
  threshold,
  mode = "dark",
) {
  const scratch = document.createElement("canvas");
  scratch.width = Math.round(crop.width * scale);
  scratch.height = Math.round(crop.height * scale);
  const scratchContext = scratch.getContext("2d", { willReadFrequently: true });
  scratchContext.imageSmoothingEnabled = true;
  scratchContext.drawImage(
    sourceContext.canvas,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    scratch.width,
    scratch.height,
  );
  const imageData = scratchContext.getImageData(0, 0, scratch.width, scratch.height);
  const data = imageData.data;
  for (let index = 0; index < data.length; index += 4) {
    const gray = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
    const value =
      mode === "light"
        ? gray > threshold
          ? 0
          : 255
        : gray > threshold
          ? 0
          : 255;
    data[index] = value;
    data[index + 1] = value;
    data[index + 2] = value;
  }
  scratchContext.putImageData(imageData, 0, 0);
  targetContext.drawImage(scratch, targetX, targetY);
}

function createSingleCropOcrImage(sourceContext, crop, options = {}) {
  const scale = options.scale || 4;
  const padding = Math.round(10 * scale);
  const output = document.createElement("canvas");
  output.width = Math.round(crop.width * scale) + padding * 2;
  output.height = Math.round(crop.height * scale) + padding * 2;
  const outputContext = output.getContext("2d", { willReadFrequently: true });
  outputContext.fillStyle = "#fff";
  outputContext.fillRect(0, 0, output.width, output.height);
  drawThresholdedCrop(
    sourceContext,
    outputContext,
    crop,
    padding,
    padding,
    scale,
    options.threshold || 142,
    options.mode || "dark",
  );
  return output.toDataURL("image/png");
}

function createGreenNumberCropOcrImage(sourceContext, crop, options = {}) {
  const scale = options.scale || 6;
  const padding = Math.round(10 * scale);
  const output = document.createElement("canvas");
  output.width = Math.round(crop.width * scale) + padding * 2;
  output.height = Math.round(crop.height * scale) + padding * 2;
  const outputContext = output.getContext("2d", { willReadFrequently: true });
  outputContext.fillStyle = "#fff";
  outputContext.fillRect(0, 0, output.width, output.height);

  const scratch = document.createElement("canvas");
  scratch.width = Math.round(crop.width * scale);
  scratch.height = Math.round(crop.height * scale);
  const scratchContext = scratch.getContext("2d", { willReadFrequently: true });
  scratchContext.imageSmoothingEnabled = true;
  scratchContext.drawImage(
    sourceContext.canvas,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    scratch.width,
    scratch.height,
  );
  const imageData = scratchContext.getImageData(0, 0, scratch.width, scratch.height);
  const data = imageData.data;
  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const isGreenDigit =
      green >= 95 &&
      green > red * 1.15 &&
      green > blue * 1.08 &&
      green - Math.max(red, blue) >= 18;
    const value = isGreenDigit ? 0 : 255;
    data[index] = value;
    data[index + 1] = value;
    data[index + 2] = value;
  }
  scratchContext.putImageData(imageData, 0, 0);
  outputContext.drawImage(scratch, padding, padding);
  return output.toDataURL("image/png");
}

function createGrayCropOcrImage(sourceContext, crop, options = {}) {
  const scale = options.scale || 4;
  const padding = Math.round(10 * scale);
  const output = document.createElement("canvas");
  output.width = Math.round(crop.width * scale) + padding * 2;
  output.height = Math.round(crop.height * scale) + padding * 2;
  const outputContext = output.getContext("2d", { willReadFrequently: true });
  outputContext.fillStyle = "#fff";
  outputContext.fillRect(0, 0, output.width, output.height);
  outputContext.imageSmoothingEnabled = true;
  outputContext.drawImage(
    sourceContext.canvas,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    padding,
    padding,
    Math.round(crop.width * scale),
    Math.round(crop.height * scale),
  );
  return output.toDataURL("image/png");
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function preprocessTitleCrops(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("图片解码失败"));
      image.onload = () => {
        if (image.height <= image.width * 1.2) {
          resolve([]);
          return;
        }

        const cropConfigs = [
          {
            x: 0.055,
            y: 0.245,
            width: 0.29,
            height: 0.53,
            scale: 7,
            threshold: 145,
            mode: "invert",
          },
          {
            x: 0.055,
            y: 0.282,
            width: 0.29,
            height: 0.445,
            scale: 7,
            threshold: 145,
            mode: "invert",
          },
          {
            x: 0.04,
            y: 0.245,
            width: 0.33,
            height: 0.53,
            scale: 6,
            threshold: 125,
            mode: "invert",
          },
          {
            x: 0.035,
            y: 0.245,
            width: 0.93,
            height: 0.53,
            scale: 4,
            threshold: 145,
            mode: "invert",
          },
        ];

        resolve(
          cropConfigs.map((config) => {
            const sourceX = Math.round(image.width * config.x);
            const sourceY = Math.round(image.height * config.y);
            const sourceWidth = Math.round(image.width * config.width);
            const sourceHeight = Math.round(image.height * config.height);
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(sourceWidth * config.scale);
            canvas.height = Math.round(sourceHeight * config.scale);
            const context = canvas.getContext("2d", { willReadFrequently: true });
            context.imageSmoothingEnabled = true;
            context.drawImage(
              image,
              sourceX,
              sourceY,
              sourceWidth,
              sourceHeight,
              0,
              0,
              canvas.width,
              canvas.height,
            );

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let index = 0; index < data.length; index += 4) {
              const gray = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
              const value =
                config.mode === "invert"
                  ? gray > config.threshold
                    ? 0
                    : 255
                  : gray > config.threshold
                    ? 255
                    : 0;
              data[index] = value;
              data[index + 1] = value;
              data[index + 2] = value;
            }
            context.putImageData(imageData, 0, 0);
            return canvas.toDataURL("image/png");
          }),
        );
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function detectGameTotal(text) {
  const compact = String(text || "").replace(/\s+/g, "");
  const normalized = compact.replace(/[效教敌放族]/g, "数");
  const labeled = normalized.match(/(?:总分|面具分|图鉴分|成就点数|点数)[^0-9OoAa]{0,10}([0-9OoAa]{3,5})/);
  if (labeled) {
    return getValidGameTotalNumbers(labeled[1])[0] ?? null;
  }

  return null;
}

function detectGameTotalFromHeader(text) {
  const compact = String(text || "").replace(/\s+/g, "");
  const direct = detectGameTotal(compact);
  if (direct !== null) {
    return direct;
  }
  const numbers = Array.from(compact.matchAll(/[0-9OoAa]{3,5}/g))
    .flatMap((match) => getValidGameTotalNumbers(match[0]));
  return numbers[0] ?? null;
}

function normalizeOcrNumber(value) {
  return Number(String(value || "").replace(/[Oo]/g, "0").replace(/[Aa]/g, "8"));
}

function getValidGameTotalNumbers(value) {
  const raw = String(value || "").replace(/[Oo]/g, "0").replace(/[Aa]/g, "8");
  const candidates = [];
  const normalized = Number(raw);
  if (isValidGameTotal(normalized)) {
    candidates.push(normalized);
  }
  if (raw.length === 5) {
    [2, 1, 3, 0, 4].forEach((index) => {
      const repaired = Number(raw.slice(0, index) + raw.slice(index + 1));
      if (isValidGameTotal(repaired)) {
        candidates.push(repaired);
      }
    });
  }
  return [...new Set(candidates)];
}

function isValidGameTotal(value) {
  return Number.isFinite(value) && value >= 100 && value <= 9985 && value % 5 === 0;
}

function selectGameTotalCandidate(values) {
  const counts = new Map();
  values
    .map((value) => Number(value))
    .filter(isValidGameTotal)
    .forEach((value) => {
      counts.set(value, (counts.get(value) || 0) + 1);
    });

  if (!counts.size) {
    return null;
  }

  return Math.max(...counts.keys());
}

function matchOcrText(text, sourceName) {
  const payload = normalizeOcrPayload(text);
  const screenType = detectOcrScreenType(payload);
  if (screenType === "maskInventory") {
    return [];
  }

  if (payload.rows.length) {
    return matchOcrRows(payload.rows);
  }

  const entityText =
    screenType === "achievementList"
      ? payload.titleText
      : [payload.titleText, payload.fullText].join("\n");
  const entityCandidates = extractOcrNameCandidates(entityText);
  const entityNormalized = normalizeTextKey(entityText);
  const scoredCandidates = extractScoredOcrCandidates(entityText);
  const matches = [];
  const achievementBlockKeys = new Set(
    [...state.achievements, ...state.tokenAchievements].map((achievement) =>
      normalizeTextKey(achievement.achievement),
    ),
  );
  const appearanceTitleKeys = new Set(
    state.appearanceAchievements.flatMap((appearance) =>
      appearance.titles.map((title) => normalizeTextKey(title)),
    ),
  );
  const allKnownTitleKeys = new Set([
    ...achievementBlockKeys,
    ...appearanceTitleKeys,
  ]);

  [...state.achievements, ...state.tokenAchievements].forEach((achievement) => {
    const hit = findOcrEntityHit([achievement.achievement], entityNormalized, entityCandidates, {
      allowFullTextIncludes: true,
      allowFullTextFuzzy: false,
      fuzzyDistance: screenType === "achievementList" ? 2 : 1,
      minFullTextLength: 3,
      blockExactKeys: allKnownTitleKeys,
    });
    const scoredHit =
      hit ||
      findScoredOcrEntityHit(
        achievement.achievement,
        achievement.point,
        scoredCandidates,
        allKnownTitleKeys,
      );
    if (scoredHit) {
      matches.push({
        key: `${achievement.type === "token" ? "token" : "achievement"}:${achievement.achievementId}`,
        kind: achievement.type === "token" ? "token" : "achievement",
        id: achievement.achievementId,
        title: achievement.achievement,
        meta: getAchievementKindText(achievement),
        point: Number(achievement.point) || 0,
      });
    }
  });

  state.appearanceAchievements.forEach((appearance) => {
    const hit = appearance.titles.find((title) =>
      isLikelyOcrTitleMatch(
        title,
        entityNormalized,
        entityCandidates,
        achievementBlockKeys,
      ),
    );
    if (hit) {
      matches.push(createAppearanceMatch(appearance, hit, ""));
    }
  });

  if (!matches.length) {
    entityCandidates.slice(0, 8).forEach((candidate) => {
      matches.push({
        key: `unmatched:${candidate}`,
        kind: "unmatched",
        id: "",
        title: candidate,
        meta: "无法匹配到已知称号",
        point: 0,
      });
    });
  }

  return sortOcrMatches(dedupeMatches(matches));
}

function normalizeOcrPayload(text) {
  if (text && typeof text === "object") {
    const fullText = String(text.fullText || "");
    const titleText = String(text.titleText || "");
    return {
      fullText,
      titleText,
      rows: Array.isArray(text.rows) ? text.rows : [],
      allText: [fullText, titleText].join("\n"),
    };
  }

  const fullText = String(text || "");
  return {
    fullText,
    titleText: fullText,
    rows: [],
    allText: fullText,
  };
}

function matchOcrRows(rows) {
  const selected = selectOrderedRowMatches(rows);
  const matches = rows
    .map((row, index) => {
      const match = selected.get(index);
      if (match) {
        return createMatchFromRowCandidate(match);
      }

      const unmatched = extractBestUnmatchedRowCandidate(
        row.titleText || row.text || "",
      );
      if (!unmatched) {
        return null;
      }
      return {
        key: `unmatched:${normalizeTextKey(unmatched)}:${index}`,
        kind: "unmatched",
        id: "",
        title: unmatched,
        meta: "无法匹配到已知称号",
        point: 0,
      };
    })
    .filter(Boolean);
  return sortOcrMatches(dedupeMatches(matches));
}

function selectOrderedRowMatches(rows) {
  const rowCandidates = rows.map((row) => getKnownRowCandidates(row).slice(0, 24));
  const dp = [];

  rowCandidates.forEach((candidates, rowIndex) => {
    dp[rowIndex] = candidates.map((candidate) => {
      let bestPrevious = null;
      const rowReward = 60;
      let bestScore = candidate.score - rowReward;
      for (let previousRow = rowIndex - 1; previousRow >= 0; previousRow -= 1) {
        for (const previousState of dp[previousRow] || []) {
          if (previousState.candidate.order >= candidate.order) {
            continue;
          }
          const gapPenalty = (rowIndex - previousRow - 1) * 3;
          const score = previousState.score + candidate.score - rowReward + gapPenalty;
          if (bestPrevious === null || score < bestScore) {
            bestPrevious = previousState;
            bestScore = score;
          }
        }
      }
      return {
        candidate,
        previous: bestPrevious,
        score: bestScore,
      };
    });
  });

  let best = null;
  dp.flat().forEach((node) => {
    if (
      !best ||
      node.score < best.score ||
      (node.score === best.score && node.candidate.order < best.candidate.order)
    ) {
      best = node;
    }
  });

  const selected = new Map();
  while (best) {
    selected.set(best.candidate.rowIndex, best.candidate);
    best = best.previous;
  }
  fillSequentialContextMatches(rows, selected);
  removeLowConfidenceOrderInversions(selected);
  return selected;
}

function removeLowConfidenceOrderInversions(selected) {
  const ordered = Array.from(selected.entries()).sort((left, right) => left[0] - right[0]);
  for (let index = 1; index < ordered.length; index += 1) {
    const [rowIndex, candidate] = ordered[index];
    const previous = ordered[index - 1][1];
    if (
      candidate.order < previous.order &&
      (candidate.rank >= 3 || candidate.inferred)
    ) {
      selected.delete(rowIndex);
    }
  }
}

function getKnownRowCandidates(rowText) {
  const row =
    rowText && typeof rowText === "object"
      ? rowText
      : { text: String(rowText || ""), titleText: String(rowText || "") };
  const rowPoint = 0;
  const candidates = extractOcrNameCandidates(row.titleText || row.text);
  const normalizedRow = normalizeTextKey(row.titleText || row.text);
  const knownRows = getKnownOcrRows();
  const matches = [];

  getOcrAliasHits(candidates, normalizedRow).forEach(({ alias, title }) => {
    const known = knownRows.find((item) => item.title === title);
    if (known) {
      const shared = countSharedCharacters(normalizedRow, normalizeTextKey(title));
      matches.push({
        ...known,
        rank: 1,
        distance: 0,
        hit: alias,
        pointMatched: false,
        pointChecked: false,
        rowIndex: row.index || 0,
        score: shared >= 2 ? 8 : 58,
      });
    }
  });

  knownRows.forEach((known) => {
    const result = scoreKnownRowMatch(known.title, known.point, {
      rowPoint,
      candidates,
      normalizedRow,
      visibility: row.visibility || 1,
    });
    if (!result) {
      return;
    }
    matches.push({
      ...known,
      ...result,
      rowIndex: row.index || 0,
      score: result.rank * 10 + result.distance * 2 + (result.pointMatched ? 0 : 6),
    });
  });

  return matches
    .filter((match) => match.rank < 8)
    .sort((left, right) => left.score - right.score || left.order - right.order);
}

function findOcrAliasTitle(candidates, normalizedRow) {
  return getOcrAliasHits(candidates, normalizedRow)[0]?.title || "";
}

function findAliasHit(candidates, normalizedRow) {
  return getOcrAliasHits(candidates, normalizedRow)[0]?.alias || "";
}

function getOcrAliasHits(candidates, normalizedRow) {
  const hits = [];
  for (const alias of OCR_TITLE_ALIASES.keys()) {
    const key = normalizeTextKey(alias);
    if (
      candidates.some((candidate) => normalizeTextKey(candidate) === key) ||
      normalizedRow.includes(key)
    ) {
      hits.push({ alias, title: OCR_TITLE_ALIASES.get(alias) || "" });
    }
  }
  return hits;
}

function createMatchFromRowCandidate(candidate) {
  if (candidate.kind === "appearance") {
    return createAppearanceMatch(
      candidate.item,
      candidate.title,
      createRowMatchDetail(candidate),
    );
  }

  return {
    key: `${candidate.kind}:${candidate.id}`,
    kind: candidate.kind,
    id: candidate.id,
    title: candidate.title,
    meta: formatPendingMatchMeta(
      getAchievementKindText(candidate.item),
      createRowMatchDetail(candidate),
    ),
    point: Number(candidate.point) || 0,
    order: Number(candidate.order),
  };
}

function getKnownOcrRows() {
  return getKnownDisplayRows().flatMap((row, displayIndex) => {
    const titles =
      row.kind === "appearance" && Array.isArray(row.item.titles)
        ? row.item.titles
        : [row.title];
    return titles.map((title) => ({
      ...row,
      title,
      displayIndex,
    }));
  });
}

function getKnownDisplayRows() {
  return [
    ...state.appearanceAchievements.map((appearance, index) => ({
      kind: "appearance",
      id: appearance.achievementId,
      title: getAchievementTitle(appearance),
      point: Number(appearance.point) || 0,
      item: appearance,
      order: getKnownRowOrder(appearance, index, "appearance"),
    })),
    ...state.achievements.map((achievement, index) => ({
      kind: "achievement",
      id: achievement.achievementId,
      title: achievement.achievement,
      point: Number(achievement.point) || 0,
      item: achievement,
      order: getKnownRowOrder(achievement, index, "achievement"),
    })),
    ...state.tokenAchievements.map((achievement, index) => ({
      kind: "token",
      id: achievement.achievementId,
      title: achievement.achievement,
      point: Number(achievement.point) || 0,
      item: achievement,
      order: getKnownRowOrder(achievement, index, "token"),
    })),
  ].sort((left, right) => left.order - right.order || left.title.localeCompare(right.title, "zh-CN"));
}

function fillSequentialContextMatches(rows, selected) {
  const displayRows = getKnownDisplayRows();
  const displayIndexByKey = new Map(
    displayRows.map((row, index) => [`${row.kind}:${row.id}`, index]),
  );
  if (!rows.length || !displayRows.length) {
    return;
  }

  const selectedRows = () =>
    Array.from(selected.entries())
      .filter(([, candidate]) => Number.isFinite(candidate.displayIndex))
      .sort((left, right) => left[0] - right[0]);

  selectedRows().forEach(([rowIndex, candidate], index, entries) => {
    const next = entries[index + 1];
    if (!next) {
      return;
    }
    const rowGap = next[0] - rowIndex - 1;
    const displayGap = next[1].displayIndex - candidate.displayIndex - 1;
    if (rowGap <= 0 || rowGap !== displayGap) {
      return;
    }
    for (let offset = 1; offset <= rowGap; offset += 1) {
      addInferredSequentialMatch(
        selected,
        rowIndex + offset,
        displayRows[candidate.displayIndex + offset],
        rows[rowIndex + offset],
        displayIndexByKey,
        false,
        getAppearanceColumnFromPair(candidate, next[1]),
      );
    }
  });

  const afterBetween = selectedRows();
  const firstPair = afterBetween[0] && afterBetween[1] ? afterBetween.slice(0, 2) : [];
  if (
    firstPair.length === 2 &&
    firstPair[0][0] > 0 &&
    firstPair[1][0] - firstPair[0][0] === 1 &&
    firstPair[1][1].displayIndex - firstPair[0][1].displayIndex === 1
  ) {
    for (let rowIndex = firstPair[0][0] - 1; rowIndex >= 0; rowIndex -= 1) {
      const displayIndex = firstPair[0][1].displayIndex - (firstPair[0][0] - rowIndex);
      addInferredSequentialMatch(
        selected,
        rowIndex,
        displayRows[displayIndex],
        rows[rowIndex],
        displayIndexByKey,
        false,
        getAppearanceTitleColumn(firstPair[0][1].item, firstPair[0][1].title),
      );
    }
  }

  const afterHead = selectedRows();
  const lastPair =
    afterHead.length >= 2 ? afterHead.slice(afterHead.length - 2, afterHead.length) : [];
  if (
    lastPair.length === 2 &&
    lastPair[1][0] < rows.length - 1 &&
    lastPair[1][0] - lastPair[0][0] === 1 &&
    lastPair[1][1].displayIndex - lastPair[0][1].displayIndex === 1
  ) {
    for (let rowIndex = lastPair[1][0] + 1; rowIndex < rows.length; rowIndex += 1) {
      const displayIndex = lastPair[1][1].displayIndex + (rowIndex - lastPair[1][0]);
      addInferredSequentialMatch(
        selected,
        rowIndex,
        displayRows[displayIndex],
        rows[rowIndex],
        displayIndexByKey,
        false,
        getAppearanceTitleColumn(lastPair[1][1].item, lastPair[1][1].title),
      );
    }
  }

  replaceLowConfidenceSequentialEdges(
    rows,
    selected,
    displayRows,
    displayIndexByKey,
  );
}

function replaceLowConfidenceSequentialEdges(
  rows,
  selected,
  displayRows,
  displayIndexByKey,
) {
  const ordered = Array.from(selected.entries())
    .filter(([, candidate]) => Number.isFinite(candidate.displayIndex))
    .sort((left, right) => left[0] - right[0]);

  ordered.forEach(([rowIndex, candidate], index) => {
    if (!(candidate.inferred || candidate.rank >= 3)) {
      return;
    }

    const previousPair = ordered.slice(Math.max(0, index - 2), index);
    if (
      previousPair.length === 2 &&
      previousPair[1][0] - previousPair[0][0] === 1 &&
      previousPair[1][1].displayIndex - previousPair[0][1].displayIndex === 1
    ) {
      const expectedIndex =
        previousPair[1][1].displayIndex + (rowIndex - previousPair[1][0]);
      if (
        replaceSequentialCandidateIfBetter(
          rows,
          selected,
          rowIndex,
          candidate,
          displayRows[expectedIndex],
          displayIndexByKey,
          getAppearanceTitleColumn(previousPair[1][1].item, previousPair[1][1].title),
        )
      ) {
        return;
      }
    }

    const nextPair = ordered.slice(index + 1, index + 3);
    if (
      nextPair.length === 2 &&
      nextPair[1][0] - nextPair[0][0] === 1 &&
      nextPair[1][1].displayIndex - nextPair[0][1].displayIndex === 1
    ) {
      const expectedIndex =
        nextPair[0][1].displayIndex - (nextPair[0][0] - rowIndex);
      replaceSequentialCandidateIfBetter(
        rows,
        selected,
        rowIndex,
        candidate,
        displayRows[expectedIndex],
        displayIndexByKey,
        getAppearanceTitleColumn(nextPair[0][1].item, nextPair[0][1].title),
      );
    }
  });
}

function replaceSequentialCandidateIfBetter(
  rows,
  selected,
  rowIndex,
  candidate,
  displayRow,
  displayIndexByKey,
  appearanceColumn = "",
) {
  if (
    !displayRow ||
    displayRow.kind !== candidate.kind ||
    displayRow.id === candidate.id ||
    !hasUsableRowText(rows[rowIndex])
  ) {
    return false;
  }

  const normalizedRow = normalizeTextKey(
    rows[rowIndex]?.titleText || rows[rowIndex]?.text || "",
  );
  const displayTitleKeys =
    displayRow.kind === "appearance" && Array.isArray(displayRow.item?.titles)
      ? displayRow.item.titles.map((title) => normalizeTextKey(title))
      : [normalizeTextKey(displayRow.title)];
  if (
    !displayTitleKeys.some((titleKey) => countSharedCharacters(normalizedRow, titleKey) >= 2)
  ) {
    return false;
  }

  addInferredSequentialMatch(
    selected,
    rowIndex,
    displayRow,
    rows[rowIndex],
    displayIndexByKey,
    true,
    appearanceColumn,
  );
  return true;
}

function addInferredSequentialMatch(
  selected,
  rowIndex,
  displayRow,
  sourceRow,
  displayIndexByKey,
  allowReplace = false,
  appearanceColumn = "",
) {
  if (
    !displayRow ||
    (!allowReplace && selected.has(rowIndex)) ||
    !hasUsableRowText(sourceRow) ||
    !canInferSequentialMatchFromRow(sourceRow, displayRow)
  ) {
    return;
  }
  selected.set(rowIndex, {
    ...displayRow,
    title:
      displayRow.kind === "appearance"
        ? getAppearanceDisplayTitleFromRow(
            displayRow.item,
            sourceRow,
            displayRow.title,
            appearanceColumn,
          )
        : displayRow.title,
    rowIndex,
    displayIndex: displayIndexByKey.get(`${displayRow.kind}:${displayRow.id}`),
    rank: 6,
    distance: 1,
    hit: "相邻顺序",
    inferred: true,
    pointMatched: false,
    pointChecked: false,
    score: 999,
  });
}

function canInferSequentialMatchFromRow(row, displayRow) {
  const normalizedRow = normalizeTextKey(row?.titleText || row?.text || "");
  const normalizedTitles =
    displayRow?.kind === "appearance" && Array.isArray(displayRow.item?.titles)
      ? displayRow.item.titles.map((title) => normalizeTextKey(title)).filter(Boolean)
      : [normalizeTextKey(displayRow?.title || "")].filter(Boolean);
  if (!normalizedTitles.length) {
    return false;
  }
  if (normalizedRow.length < 2) {
    return Number(row?.visibility) >= 0.75;
  }
  return normalizedTitles.some((titleKey) => countSharedCharacters(normalizedRow, titleKey) >= 2);
}

function hasUsableRowText(row) {
  return (
    /[\u3400-\u9fff]/.test(String(row?.titleText || row?.text || "")) ||
    Number(row?.visibility) >= 0.25
  );
}

function getKnownRowOrder(item, sourceIndex = 0, group = "") {
  const id = String(item.achievementId || "");
  const number = Number((id.match(/(\d+)$/) || [])[1]);
  const displayOrder = Number(item.displayOrder);
  const safeIndex = Number.isFinite(displayOrder)
    ? displayOrder
    : Number.isFinite(sourceIndex)
      ? sourceIndex
      : Number.isFinite(number)
        ? number
        : 9999;
  if (group === "achievement" || id.startsWith("mianjuchengjiu")) {
    return safeIndex;
  }
  if (group === "token" || id.startsWith("xinwuchengjiu")) {
    return 10000 + safeIndex;
  }
  if (group === "appearance" || id.startsWith("jianghurongmao")) {
    return -1000 + safeIndex;
  }
  return 30000 + safeIndex;
}

function getAchievementGroup(item) {
  const id = String(item?.achievementId || "");
  if (item?.type === "token" || id.startsWith("xinwuchengjiu")) {
    return "token";
  }
  if (item?.type === "appearance" || id.startsWith("jianghurongmao")) {
    return "appearance";
  }
  return "achievement";
}

function getInventoryItemByMatch(match) {
  if (match.kind === "achievement") {
    return indices.achievementsById.get(match.id);
  }
  if (match.kind === "token") {
    return indices.tokensById.get(match.id);
  }
  if (match.kind === "appearance") {
    return indices.appearancesById.get(match.id);
  }
  return null;
}

function getInventoryMatchOrder(match, fallbackIndex = 0) {
  if (Number.isFinite(Number(match.order))) {
    return Number(match.order);
  }
  const item = getInventoryItemByMatch(match);
  if (!item) {
    return 90000 + fallbackIndex;
  }
  return getKnownRowOrder(item, fallbackIndex, getAchievementGroup(item));
}

function compareInventoryDisplayOrder(left, right) {
  const leftOrder = getInventoryMatchOrder(left, left.index || 0);
  const rightOrder = getInventoryMatchOrder(right, right.index || 0);
  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }
  if (left.kind !== right.kind) {
    return String(left.kind || "").localeCompare(String(right.kind || ""), "zh-CN");
  }
  const titleCompare = String(left.title || "").localeCompare(
    String(right.title || ""),
    "zh-CN",
  );
  if (titleCompare) {
    return titleCompare;
  }
  return (left.index || 0) - (right.index || 0);
}

function scoreKnownRowMatch(title, point, row) {
  const key = normalizeTextKey(title);
  if (key.length < 2) {
    return null;
  }

  const pointMatched = row.rowPoint && Number(row.rowPoint) === Number(point);
  const pointMismatched = row.rowPoint && !pointMatched;
  const isPartial = Number(row.visibility) < 0.6;
  const exactCandidates = row.candidates.filter(
    (candidate) => normalizeTextKey(candidate) === key,
  );
  if (exactCandidates.length) {
    return {
      rank: pointMatched ? 0 : pointMismatched ? 3 : 1,
      distance: 0,
      hit: exactCandidates[0],
      pointMatched: Boolean(pointMatched),
      pointChecked: Boolean(row.rowPoint),
    };
  }

  if (key.length >= 3 && row.normalizedRow.includes(key)) {
    return {
      rank: pointMatched ? 1 : pointMismatched ? 5 : 2,
      distance: 0,
      hit: title,
      pointMatched: Boolean(pointMatched),
      pointChecked: Boolean(row.rowPoint),
    };
  }

  if (key.length >= 4) {
    const suffix = key.slice(-2);
    if (
      suffix.length === 2 &&
      row.normalizedRow.includes(suffix) &&
      isUniqueKnownTitleFragment(suffix, key)
    ) {
      return {
        rank: pointMatched ? 2 : pointMismatched ? 6 : 3,
        distance: key.length - suffix.length,
        hit: suffix,
        pointMatched: Boolean(pointMatched),
        pointChecked: Boolean(row.rowPoint),
      };
    }
  }

  let bestCandidate = null;
  row.candidates.forEach((candidate) => {
    const candidateKey = normalizeTextKey(candidate);
    if (!candidateKey || Math.abs(candidateKey.length - key.length) > 2) {
      return;
    }
    if (candidateKey.length < 3 && key.length > 2) {
      return;
    }
    if (candidateKey.includes(key) || key.includes(candidateKey)) {
      const sharedLength = Math.min(candidateKey.length, key.length);
      if (sharedLength < 3) {
        return;
      }
      if (isPartial && !pointMatched && sharedLength < key.length) {
        return;
      }
      const distance = Math.abs(candidateKey.length - key.length);
      const rank = pointMatched ? 2 : pointMismatched ? 6 : 3;
      bestCandidate = chooseBetterRowCandidate(bestCandidate, {
        rank,
        distance,
        hit: candidate,
        pointMatched: Boolean(pointMatched),
        pointChecked: Boolean(row.rowPoint),
      });
      return;
    }

    const distance = levenshteinDistance(candidateKey, key);
    const allowedDistance = isPartial ? 1 : key.length >= 4 ? 2 : 1;
    if (distance > allowedDistance) {
      return;
    }
    const minShared = key.length >= 3 ? 2 : 3;
    if (countSharedCharacters(candidateKey, key) < Math.min(minShared, key.length)) {
      return;
    }
    const rank = pointMatched ? 3 : pointMismatched ? 7 : 4;
    bestCandidate = chooseBetterRowCandidate(bestCandidate, {
      rank,
      distance,
      hit: candidate,
      pointMatched: Boolean(pointMatched),
      pointChecked: Boolean(row.rowPoint),
    });
  });

  return bestCandidate;
}

function isUniqueKnownTitleFragment(fragment, targetKey) {
  if (fragment.length < 2) {
    return false;
  }
  let count = 0;
  for (const row of getKnownOcrRows()) {
    const key = normalizeTextKey(row.title);
    if (key.includes(fragment)) {
      count += 1;
      if (count > 1 && key !== targetKey) {
        return false;
      }
    }
  }
  return count === 1;
}

function chooseBetterRowCandidate(current, next) {
  if (!current || next.rank < current.rank) {
    return next;
  }
  if (next.rank === current.rank && next.distance < current.distance) {
    return next;
  }
  return current;
}

function createRowMatchDetail(match) {
  if (match.inferred) {
    return "相邻顺序补齐，需确认";
  }
  if (match.distance > 0 || match.rank >= 3) {
    return "低置信，需确认";
  }
  return "";
}

function extractBestUnmatchedRowCandidate(rowText) {
  return extractOcrNameCandidates(rowText)
    .filter((candidate) => normalizeTextKey(candidate).length >= 3)
    .filter((candidate) => !/成就|点数|查看|全部|激活|装饰|图鉴/.test(candidate))
    .sort((left, right) => right.length - left.length)[0] || "";
}

function detectOcrScreenType(payload) {
  const fullText = normalizeTextKey(payload.fullText);
  const allText = normalizeTextKey(payload.allText);
  if (
    fullText.includes("装饰箱") ||
    fullText.includes("戏曲面具") ||
    fullText.includes("武学云镜") ||
    fullText.includes("饰品材料")
  ) {
    return "maskInventory";
  }
  if (
    allText.includes("装饰图鉴") ||
    allText.includes("全部成就") ||
    allText.includes("已激活") ||
    allText.includes("未激活") ||
    allText.includes("成就点数")
  ) {
    return "achievementList";
  }
  return "generic";
}

function findOcrEntityHit(names, normalizedText, candidates, options = {}) {
  const allowFullTextIncludes = Boolean(options.allowFullTextIncludes);
  const allowFullTextFuzzy = Boolean(options.allowFullTextFuzzy);
  const fuzzyDistance = Number.isFinite(options.fuzzyDistance)
    ? Number(options.fuzzyDistance)
    : 1;
  const minFullTextLength = Number.isFinite(options.minFullTextLength)
    ? Number(options.minFullTextLength)
    : 4;
  const blockExactKeys = options.blockExactKeys || new Set();

  return names.find((name) => {
    const key = normalizeTextKey(name);
    if (key.length < 2) {
      return false;
    }
    if (
      allowFullTextIncludes &&
      key.length >= minFullTextLength &&
      normalizedText.includes(key)
    ) {
      return true;
    }
    if (
      allowFullTextFuzzy &&
      key.length >= Math.max(4, minFullTextLength) &&
      hasFuzzyTextWindow(normalizedText, key, fuzzyDistance, blockExactKeys)
    ) {
      return true;
    }
    return candidates.some((candidate) =>
      isOcrCandidateEntityMatch(
        key,
        normalizeTextKey(candidate),
        fuzzyDistance,
        blockExactKeys,
      ),
    );
  });
}

function hasFuzzyTextWindow(normalizedText, key, maxDistance, blockExactKeys = new Set()) {
  const lengths = [key.length];

  return lengths.some((length) => {
    if (length <= 1 || normalizedText.length < length) {
      return false;
    }
    for (let index = 0; index <= normalizedText.length - length; index += 1) {
      const windowText = normalizedText.slice(index, index + length);
      if (windowText !== key && blockExactKeys.has(windowText)) {
        continue;
      }
      if (levenshteinDistance(windowText, key) <= maxDistance) {
        return true;
      }
    }
    return false;
  });
}

function isOcrCandidateEntityMatch(
  key,
  candidateKey,
  fuzzyDistance,
  blockExactKeys = new Set(),
) {
  if (!candidateKey) {
    return false;
  }
  if (candidateKey === key) {
    return true;
  }
  if (blockExactKeys.has(candidateKey)) {
    return false;
  }
  if (key.length <= 2) {
    return false;
  }
  if (candidateKey.includes(key) || key.includes(candidateKey)) {
    return Math.min(candidateKey.length, key.length) >= 3 &&
      Math.abs(candidateKey.length - key.length) <= 1;
  }
  if (Math.abs(candidateKey.length - key.length) > 1) {
    return false;
  }
  const allowedDistance = key.length >= 4 ? fuzzyDistance : Math.min(fuzzyDistance, 1);
  const distance = levenshteinDistance(candidateKey, key);
  if (distance > allowedDistance) {
    return false;
  }
  if (allowedDistance > 1 && countSharedCharacters(key, candidateKey) < 2) {
    return false;
  }
  if (
    allowedDistance > 1 &&
    (sharesOnlyTrailingPair(key, candidateKey) ||
      sharesOnlyAmbiguousLeadingPair(key, candidateKey, blockExactKeys))
  ) {
    return false;
  }
  return !hasCloserKnownEntity(candidateKey, key, distance, blockExactKeys);
}

function sharesOnlyTrailingPair(key, candidateKey) {
  if (key.length !== candidateKey.length || key.length < 4) {
    return false;
  }
  const suffix = key.slice(-2);
  if (candidateKey.slice(-2) !== suffix) {
    return false;
  }
  const shared = Array.from(new Set(Array.from(key))).filter((char) =>
    candidateKey.includes(char),
  );
  return shared.length === 2 && shared.every((char) => suffix.includes(char));
}

function sharesOnlyAmbiguousLeadingPair(key, candidateKey, knownKeys = new Set()) {
  if (key.length !== candidateKey.length || key.length < 4) {
    return false;
  }
  const prefix = key.slice(0, 2);
  if (candidateKey.slice(0, 2) !== prefix) {
    return false;
  }
  const shared = Array.from(new Set(Array.from(key))).filter((char) =>
    candidateKey.includes(char),
  );
  if (!(shared.length === 2 && shared.every((char) => prefix.includes(char)))) {
    return false;
  }
  return Array.from(knownKeys).some(
    (knownKey) => knownKey !== key && knownKey.startsWith(prefix),
  );
}

function hasCloserKnownEntity(candidateKey, currentKey, currentDistance, knownKeys) {
  for (const knownKey of knownKeys) {
    if (knownKey === currentKey || Math.abs(knownKey.length - candidateKey.length) > 1) {
      continue;
    }
    const knownDistance = levenshteinDistance(candidateKey, knownKey);
    if (knownDistance < currentDistance) {
      return true;
    }
    if (
      knownDistance === currentDistance &&
      countSharedCharacters(knownKey, candidateKey) >
        countSharedCharacters(currentKey, candidateKey)
    ) {
      return true;
    }
  }
  return false;
}

function extractScoredOcrCandidates(text) {
  const rows = [];
  String(text || "")
    .split(/[\r\n]+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const point = detectOcrLinePoint(line);
      if (!point) {
        return;
      }
      const titlePart = line.split(/查看|成就|\+|\d/)[0] || line;
      extractOcrNameCandidates(titlePart).forEach((candidate) => {
        rows.push({
          title: candidate,
          point,
        });
      });
    });
  return rows;
}

function detectOcrLinePoint(line) {
  const compact = String(line || "").replace(/\s+/g, "");
  if (!compact.includes("查看") && !compact.includes("成就") && !/[+十]/.test(compact)) {
    return 0;
  }

  const numeric = compact.match(/[+十]?(\d{2,3})(?!\d)/);
  if (numeric) {
    return Number(numeric[1]);
  }

  const ocrZero = compact.match(/([1-9])\s*[oO0](?!\d)/);
  if (ocrZero) {
    return Number(ocrZero[1]) * 10;
  }

  const afterAction = compact.split(/查看|成就/).pop() || "";
  const singleDigit = afterAction.match(/([1-9])(?!\d)/);
  if (singleDigit) {
    return Number(singleDigit[1]) * 10;
  }

  return 0;
}

function findScoredOcrEntityHit(name, point, scoredCandidates, blockExactKeys) {
  const expectedPoint = Number(point) || 0;
  if (!expectedPoint) {
    return "";
  }

  const key = normalizeTextKey(name);
  if (key.length < 3) {
    return "";
  }

  if (key.length < 4 || expectedPoint < 30) {
    return "";
  }

  const loose = scoredCandidates.find((candidate) => {
    if (Number(candidate.point) !== expectedPoint) {
      return false;
    }
    const candidateKey = normalizeTextKey(candidate.title);
    if (
      candidateKey.length < key.length - 1 ||
      candidateKey.length > key.length + 1 ||
      blockExactKeys.has(candidateKey)
    ) {
      return false;
    }
    const sharedCount = countSharedCharacters(key, candidateKey);
    return sharedCount >= 1 && levenshteinDistance(candidateKey, key) <= 3;
  });

  return loose?.title || "";
}

function countSharedCharacters(left, right) {
  const rightChars = new Set(Array.from(right));
  return Array.from(new Set(Array.from(left))).filter((char) => rightChars.has(char))
    .length;
}

function createAppearanceMatch(appearance, title, detail) {
  return {
    key: `appearance:${appearance.achievementId}`,
    kind: "appearance",
    id: appearance.achievementId,
    title,
    meta: formatPendingMatchMeta("江湖容貌", detail),
    point: Number(appearance.point) || 0,
    order: getKnownRowOrder(appearance, 0, "appearance"),
  };
}

function formatPendingMatchMeta(kind, detail = "") {
  return detail ? `${kind} · ${detail}` : kind;
}

function isLikelyOcrTitleMatch(
  title,
  normalizedText,
  candidates,
  blockExactKeys = new Set(),
) {
  const key = normalizeTextKey(title);
  if (key.length < 2) {
    return false;
  }
  if (normalizedText.includes(key)) {
    return true;
  }
  if (key.length < 4) {
    return false;
  }

  return candidates.some((candidate) => {
    const candidateKey = normalizeTextKey(candidate);
    if (blockExactKeys.has(candidateKey)) {
      return false;
    }
    if (candidateKey === key) {
      return true;
    }
    if (candidateKey.includes(key) || key.includes(candidateKey)) {
      return Math.min(candidateKey.length, key.length) >= 3;
    }
    if (Math.abs(candidateKey.length - key.length) > 1) {
      return false;
    }
    const distance = levenshteinDistance(candidateKey, key);
    const allowedDistance = key.length >= 4 ? 2 : 1;
    if (distance > allowedDistance) {
      return false;
    }
    if (
      allowedDistance > 1 &&
      sharesOnlyAmbiguousLeadingPair(key, candidateKey, blockExactKeys)
    ) {
      return false;
    }
    return !hasCloserKnownEntity(candidateKey, key, distance, blockExactKeys);
  });
}

function levenshteinDistance(left, right) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let i = 0; i < left.length; i += 1) {
    const current = [i + 1];
    for (let j = 0; j < right.length; j += 1) {
      const cost = left[i] === right[j] ? 0 : 1;
      current[j + 1] = Math.min(
        current[j] + 1,
        previous[j + 1] + 1,
        previous[j] + cost,
      );
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[right.length];
}

function extractOcrNameCandidates(text) {
  const junkPatterns = [
    /属性|装饰|图鉴|成就|点数|全部|查看|屋外|传来|一阵/,
    /面具分|总分|当前|返回|确定|取消|关闭|搜索|筛选/,
    /进入|庭院|后厅|大厅|练功|敲门|前来|拜访|水般/,
  ];
  const candidates = new Set();

  const pushCandidate = (value) => {
    const cleaned = String(value || "").replace(/[^\u3400-\u9fff]/g, "");
    if (cleaned.length < 2 || cleaned.length > 8) {
      return;
    }
    if (junkPatterns.some((pattern) => pattern.test(cleaned))) {
      return;
    }
    candidates.add(cleaned);
  };

  const pushCandidateWindows = (value) => {
    const cleaned = String(value || "").replace(/[^\u3400-\u9fff]/g, "");
    if (cleaned.length <= 8) {
      pushCandidate(cleaned);
      return;
    }
    if (cleaned.length > 40 || junkPatterns.some((pattern) => pattern.test(cleaned))) {
      return;
    }
    for (let length = 3; length <= 6; length += 1) {
      for (let index = 0; index <= cleaned.length - length; index += 1) {
        pushCandidate(cleaned.slice(index, index + length));
      }
    }
  };

  String(text || "")
    .split(/[\r\n|/\\，,。；;：:\[\]【】（）()]+/)
    .forEach((rawLine) => {
      const line = rawLine.replace(/\s+/g, "");
      pushCandidateWindows(line);
      if (rawLine.includes("查看")) {
        pushCandidateWindows(rawLine.split("查看")[0].replace(/\s+/g, ""));
      }
    });

  return Array.from(candidates);
}

function dedupeMatches(matches) {
  const seen = new Set();
  return matches.filter((match) => {
    if (seen.has(match.key)) {
      return false;
    }
    seen.add(match.key);
    return true;
  });
}

function sortOcrMatches(matches) {
  return matches
    .map((match, index) => ({ ...match, index }))
    .sort(compareInventoryDisplayOrder)
    .map(({ index, ...match }) => match);
}

function getAppearanceNumber(achievementId) {
  const number = Number(String(achievementId).replace("jianghurongmao", ""));
  return Number.isFinite(number) ? number : 0;
}

function addPendingMatches(matches) {
  const existing = new Set(state.pendingMatches.map((match) => match.key));
  matches.forEach((match) => {
    if (isMatchAlreadyRecorded(match)) {
      return;
    }
    if (!existing.has(match.key)) {
      existing.add(match.key);
      state.pendingMatches.push(match);
    }
  });
  state.pendingMatches = sortOcrMatches(state.pendingMatches);
}

function isMatchAlreadyRecorded(match) {
  if (
    match.kind === "achievement" ||
    match.kind === "token"
  ) {
    return isClaimedAchievement(match.id);
  }
  if (match.kind === "appearance") {
    return state.inventory.claimedAchievementIds.has(match.id);
  }
  return false;
}

function confirmAllPending() {
  state.pendingMatches
    .filter((match) => match.kind !== "unmatched")
    .forEach(applyPendingMatch);
  state.pendingMatches = state.pendingMatches.filter(
    (match) => match.kind === "unmatched",
  );
  writeInventory();
  updateOcrStatusAfterPendingChange();
  refreshCurrentResults();
}

function clearConfirmedRecords() {
  if (!getConfirmedRecords().length) {
    return;
  }
  showConfirmDialog({
    title: "删除全部已确认记录",
    message: "确定一键删除全部已确认记录吗？待确认结果会保留。",
    confirmText: "全部删除",
    onConfirm: () => {
      state.inventory.claimedAchievementIds.clear();
      state.inventory.claimedAchievementTitles.clear();
      state.inventory.lastGameTotal = 0;
      writeInventory();
      refreshCurrentResults();
    },
  });
}

function handlePendingClick(event) {
  const button = event.target.closest("[data-pending-action]");
  if (!button) {
    return;
  }

  const key = button.dataset.pendingKey || "";
  const index = state.pendingMatches.findIndex((match) => match.key === key);
  if (index === -1) {
    return;
  }

  const [match] = state.pendingMatches.splice(index, 1);
  if (button.dataset.pendingAction === "confirm") {
    applyPendingMatch(match);
  }

  writeInventory();
  updateOcrStatusAfterPendingChange();
  refreshCurrentResults();
}

function updateOcrStatusAfterPendingChange() {
  if (!elements.ocrStatus) {
    return;
  }
  const confirmableCount = state.pendingMatches.filter(
    (match) => match.kind !== "unmatched",
  ).length;
  const unmatchedCount = state.pendingMatches.length - confirmableCount;
  if (confirmableCount) {
    elements.ocrStatus.textContent = `待确认 ${confirmableCount} 条`;
  } else if (unmatchedCount) {
    elements.ocrStatus.textContent = `剩余无法匹配 ${unmatchedCount} 条`;
  } else {
    elements.ocrStatus.textContent = "待确认已处理完";
  }
}

function applyPendingMatch(match) {
  if (match.kind === "achievement" || match.kind === "token" || match.kind === "appearance") {
    state.inventory.claimedAchievementIds.add(match.id);
    state.inventory.claimedAchievementTitles.set(match.id, match.title);
  }
}

function handleManualClick(event) {
  const button = event.target.closest("[data-manual-kind]");
  if (!button || button.disabled) {
    return;
  }

  const kind = button.dataset.manualKind || "";
  const id = button.dataset.manualId || "";
  toggleAchievement(id);
}

function handleConfirmedClick(event) {
  const button = event.target.closest("[data-confirmed-achievement-id]");
  if (!button) {
    return;
  }

  const achievementId = button.dataset.confirmedAchievementId || "";
  if (achievementId) {
    state.inventory.claimedAchievementIds.delete(achievementId);
    state.inventory.claimedAchievementTitles.delete(achievementId);
  }
  writeInventory();
  refreshCurrentResults();
}

function renderInventory() {
  if (!state.loaded || !hasInventory) {
    return;
  }

  const totals = getScoreTotals();
  renderScoreSummary(totals);
  renderPendingList();
  renderConfirmedList();
  renderManualResults();
  renderTokenList();
}

function getScoreTotals() {
  const claimed = state.inventory.claimedAchievementIds;
  const maskItems = state.achievements.filter((achievement) =>
    claimed.has(achievement.achievementId),
  );
  const tokenItems = state.tokenAchievements.filter((achievement) =>
    claimed.has(achievement.achievementId),
  );
  const appearanceIds = getConfirmedAppearanceAchievementIds();
  const appearanceScoreItems = getScoredAppearanceItems(appearanceIds);
  const maskScore = sumPoints(maskItems);
  const tokenScore = sumPoints(tokenItems);
  const appearanceScore = getAppearanceScoreFromItems(appearanceScoreItems);
  const computedTotal = maskScore + tokenScore + appearanceScore;
  const gameTotal = Number.isFinite(Number(state.inventory.lastGameTotal))
    ? Number(state.inventory.lastGameTotal)
    : 0;
  const pending = getPendingScoreTotals();
  const maskScoreTotal = getScoreMetaTotal(
    "maskAchievementTotal",
    state.achievements,
  );
  const tokenScoreTotal = getScoreMetaTotal(
    "tokenAchievementTotal",
    state.tokenAchievements,
  );
  const appearanceScoreTotal = getScoreMetaTotal(
    "appearanceAchievementTotal",
    state.appearanceAchievements.slice(0, APPEARANCE_SCORE_LIMIT),
  );

  return {
    maskScore,
    maskCount: maskItems.length,
    maskTotal: maskScoreTotal,
    maskTotalCount: state.achievements.length,
    tokenScore,
    tokenCount: tokenItems.length,
    tokenTotal: tokenScoreTotal,
    tokenTotalCount: state.tokenAchievements.length,
    appearanceScore,
    appearanceScoreCount: appearanceScoreItems.length,
    appearanceTotal: appearanceScoreTotal,
    appearanceTotalCount: Math.min(
      APPEARANCE_SCORE_LIMIT,
      state.appearanceAchievements.length,
    ),
    computedTotal,
    computedTotalMax:
      Number(state.scoreMeta.gameMaskScoreTotal) ||
      maskScoreTotal + tokenScoreTotal + appearanceScoreTotal,
    gameTotal,
    difference: gameTotal - computedTotal,
    pending,
  };
}

function sumPoints(items) {
  return items.reduce((sum, item) => sum + (Number(item.point) || 0), 0);
}

function getScoreMetaTotal(key, items) {
  const value = Number(state.scoreMeta[key]);
  return Number.isFinite(value) && value > 0 ? value : sumPoints(items);
}

function getPendingScoreTotals() {
  const totals = {
    mask: { count: 0, score: 0 },
    token: { count: 0, score: 0 },
    appearance: { count: 0, score: 0 },
    all: { count: 0, score: 0 },
  };

  state.pendingMatches.forEach((match) => {
    if (match.kind === "unmatched") {
      return;
    }
    const bucket =
      match.kind === "token"
        ? "token"
        : match.kind === "appearance"
          ? "appearance"
          : "mask";
    const point = Number(match.point) || 0;
    totals[bucket].count += 1;
    totals[bucket].score += point;
    totals.all.count += 1;
    totals.all.score += point;
  });

  return totals;
}

function getConfirmedAppearanceAchievementIds() {
  const ids = new Set();
  state.appearanceAchievements.forEach((achievement) => {
    if (state.inventory.claimedAchievementIds.has(achievement.achievementId)) {
      ids.add(achievement.achievementId);
    }
  });
  return ids;
}

function getScoredAppearanceItems(ids) {
  return state.appearanceAchievements
    .filter((achievement) => ids.has(achievement.achievementId))
    .slice(0, APPEARANCE_SCORE_LIMIT);
}

function getAppearanceScoreFromItems(items) {
  return items.reduce((sum, achievement) => sum + achievement.point, 0);
}

function renderScoreSummary(totals) {
  if (!elements.scoreSummary) {
    return;
  }
  const items = [
    {
      label: "游戏总分",
      value: `${totals.gameTotal} 分`,
      detail: `总上限 ${totals.computedTotalMax} 分`,
      editable: true,
    },
    {
      label: "本站计算",
      value: `${totals.computedTotal} 分`,
      detail: `差异 ${totals.difference} 分 · 待确认 ${totals.pending.all.count} 条 / ${totals.pending.all.score} 分`,
      warning: totals.difference !== null && totals.difference !== 0,
    },
    {
      label: "面具称号",
      value: `${totals.maskScore} / ${totals.maskTotal} 分`,
      detail: `已确认 ${totals.maskCount}/${totals.maskTotalCount} 条 · 待确认 ${totals.pending.mask.count} 条 / ${totals.pending.mask.score} 分`,
    },
    {
      label: "信物",
      value: `${totals.tokenScore} / ${totals.tokenTotal} 分`,
      detail: `已确认 ${totals.tokenCount}/${totals.tokenTotalCount} 条 · 待确认 ${totals.pending.token.count} 条 / ${totals.pending.token.score} 分`,
    },
    {
      label: "江湖容貌",
      value: `${totals.appearanceScore} / ${totals.appearanceTotal} 分`,
      detail: `已确认 ${totals.appearanceScoreCount}/${totals.appearanceTotalCount} 条 · 待确认 ${totals.pending.appearance.count} 条 / ${totals.pending.appearance.score} 分`,
    },
  ];

  elements.scoreSummary.replaceChildren(
    ...items.map((item) => {
      const node = document.createElement("div");
      node.className = item.warning ? "summary-item is-warning" : "summary-item";
      if (item.label === "本站计算") {
        node.dataset.summaryRole = "computed";
      }

      const label = document.createElement("span");
      label.className = "summary-label";
      label.textContent = item.label;

      const value = document.createElement("span");
      value.className = item.editable ? "summary-value summary-editable-value" : "summary-value";
      if (item.editable) {
        const input = document.createElement("input");
        input.className = "summary-number-input";
        input.type = "number";
        input.min = "0";
        input.max = String(totals.computedTotalMax);
        input.step = "1";
        input.inputMode = "numeric";
        input.value = String(totals.gameTotal);
        input.setAttribute("aria-label", "游戏总分");
        input.dataset.gameTotalInput = "true";

        const unit = document.createElement("span");
        unit.className = "summary-number-unit";
        unit.textContent = "分";
        value.append(input, unit);
      } else {
        value.textContent = item.value;
      }

      const detail = document.createElement("span");
      detail.className = "summary-detail";
      detail.textContent = item.detail || "";

      node.append(label, value, detail);
      return node;
    }),
  );
}

function handleGameTotalInput(event) {
  const input = event.target.closest("[data-game-total-input]");
  if (!input) {
    return;
  }

  const value = Math.max(0, Math.floor(Number(input.value) || 0));
  state.inventory.lastGameTotal = value;
  writeInventory();
  updateComputedSummaryItem();
}

function updateComputedSummaryItem() {
  const totals = getScoreTotals();
  const item = elements.scoreSummary?.querySelector('[data-summary-role="computed"]');
  if (!item) {
    return;
  }
  item.classList.toggle("is-warning", totals.difference !== 0);
  const value = item.querySelector(".summary-value");
  const detail = item.querySelector(".summary-detail");
  if (value) {
    value.textContent = `${totals.computedTotal} 分`;
  }
  if (detail) {
    detail.textContent = `差异 ${totals.difference} 分 · 待确认 ${totals.pending.all.count} 条 / ${totals.pending.all.score} 分`;
  }
}

function renderPendingList() {
  if (!elements.pendingList) {
    return;
  }
  elements.confirmAllButton.disabled = !state.pendingMatches.some(
    (match) => match.kind !== "unmatched",
  );

  if (!state.pendingMatches.length) {
    const empty = document.createElement("p");
    empty.className = "subtle-line";
    empty.textContent = "暂无待确认结果";
    elements.pendingList.replaceChildren(empty);
    return;
  }

  const orderedMatches = sortOcrMatches(state.pendingMatches);
  elements.pendingList.replaceChildren(
    ...orderedMatches.map((match) => {
      const item = document.createElement("article");
      item.className = "pending-item";

      const top = document.createElement("div");
      top.className = "pending-top";
      const text = document.createElement("div");
      const title = document.createElement("p");
      title.className = "pending-title";
      const matchedItem = getInventoryItemByMatch(match);
      title.textContent = matchedItem
        ? getInventoryListTitleLine(matchedItem, match.title)
        : match.title;
      const meta = document.createElement("p");
      meta.className = "pending-meta";
      meta.textContent = matchedItem ? getPendingMatchStatusText(match, matchedItem) : match.meta;
      text.append(title, meta);

      const side = document.createElement("div");
      side.className = "pending-side";
      if (match.kind !== "unmatched" && Number(match.point) > 0) {
        const score = document.createElement("span");
        score.className = "score-pill";
        score.textContent = `${Number(match.point)} 分`;
        side.appendChild(score);
      }

      const actions = document.createElement("div");
      actions.className = "tiny-actions";
      if (match.kind !== "unmatched") {
        const confirm = document.createElement("button");
        confirm.type = "button";
        confirm.className = "tiny-button is-active";
        confirm.dataset.pendingAction = "confirm";
        confirm.dataset.pendingKey = match.key;
        confirm.textContent = "确认";
        actions.appendChild(confirm);
      }
      const dismiss = document.createElement("button");
      dismiss.type = "button";
      dismiss.className = "tiny-button";
      dismiss.dataset.pendingAction = "dismiss";
      dismiss.dataset.pendingKey = match.key;
      dismiss.textContent = "忽略";
      actions.appendChild(dismiss);
      side.appendChild(actions);

      top.append(text, side);
      item.appendChild(top);
      return item;
    }),
  );
}

function renderConfirmedList() {
  if (!elements.confirmedList) {
    return;
  }

  const records = getConfirmedRecords();
  if (elements.confirmedCount) {
    elements.confirmedCount.textContent = `${records.length} 条`;
  }
  if (elements.clearConfirmedButton) {
    elements.clearConfirmedButton.disabled = !records.length;
  }

  if (!records.length) {
    const empty = document.createElement("p");
    empty.className = "subtle-line";
    empty.textContent = "暂无已确认记录";
    elements.confirmedList.replaceChildren(empty);
    return;
  }

  elements.confirmedList.replaceChildren(...records.map(createConfirmedItem));
}

function getConfirmedRecords() {
  const records = [];
  state.inventory.claimedAchievementIds.forEach((achievementId) => {
    const achievement =
      indices.achievementsById.get(achievementId) ||
      indices.tokensById.get(achievementId) ||
      indices.appearancesById.get(achievementId);
    if (!achievement) {
      return;
    }
    records.push({
      achievementId,
      item: achievement,
      title: getConfirmedRecordTitle(achievement),
      meta: getConfirmedRecordMeta(achievement),
      point: Number(achievement.point) || 0,
      order: getKnownRowOrder(
        achievement,
        records.length,
        getAchievementGroup(achievement),
      ),
    });
  });

  return records.sort((left, right) => left.order - right.order);
}

function getConfirmedRecordTitle(achievement) {
  const storedTitle = state.inventory.claimedAchievementTitles.get(
    achievement.achievementId,
  );
  if (storedTitle) {
    return storedTitle;
  }
  if (achievement.type !== "appearance") {
    return achievement.achievement;
  }
  return achievement.femaleTitle || achievement.maleTitle || achievement.achievement;
}

function getConfirmedRecordMeta(achievement) {
  return getInventoryAchievementDetail(achievement);
}

function getInventoryAchievementLine(achievement, title = "") {
  const displayTitle = title || getAchievementTitle(achievement);
  const point = Number(achievement.point) || 0;
  const names = getInventoryAchievementDemandText(achievement);
  return names
    ? `${displayTitle} · ${point} 分 · ${names}`
    : `${displayTitle} · ${point} 分`;
}

function getInventoryListTitleLine(achievement, title = "") {
  const displayTitle =
    achievement?.type === "appearance"
      ? getSingleAppearanceDisplayTitle(achievement, title)
      : title || getAchievementTitle(achievement);
  const names =
    achievement?.type === "combo" ? getInventoryAchievementDemandText(achievement) : "";
  return names ? `${displayTitle} · ${names}` : displayTitle;
}

function getSingleAppearanceDisplayTitle(achievement, title = "") {
  if (!achievement || achievement.type !== "appearance") {
    return title || getAchievementTitle(achievement);
  }
  const cleanTitle = String(title || "").trim();
  const titles = getAppearanceSingleTitles(achievement);
  if (cleanTitle && !/[，,/]/.test(cleanTitle)) {
    return cleanTitle;
  }
  const exact = titles.find((item) => cleanTitle.includes(item));
  return exact || achievement.femaleTitle || achievement.maleTitle || cleanTitle || achievement.achievement;
}

function getAppearanceDisplayTitleFromRow(
  appearance,
  row,
  fallbackTitle = "",
  preferredColumn = "",
) {
  const preferredTitle = getAppearanceTitleByColumn(appearance, preferredColumn);
  const rowText = String(row?.titleText || row?.text || "");
  const normalizedRow = normalizeTextKey(rowText);
  const candidates = extractOcrNameCandidates(rowText);
  const titles = getAppearanceSingleTitles(appearance);
  const exact = titles.find((title) => {
    const key = normalizeTextKey(title);
    return normalizedRow.includes(key) ||
      candidates.some((candidate) => normalizeTextKey(candidate) === key);
  });
  if (exact) {
    return exact;
  }
  const fuzzy = titles.find((title) =>
    isLikelyOcrTitleMatch(title, normalizedRow, candidates),
  );
  return fuzzy || preferredTitle || getSingleAppearanceDisplayTitle(appearance, fallbackTitle);
}

function getAppearanceSingleTitles(achievement) {
  return [
    achievement?.maleTitle,
    achievement?.femaleTitle,
    ...(Array.isArray(achievement?.titles) ? achievement.titles : []),
  ].filter(Boolean);
}

function getAppearanceTitleColumn(appearance, title = "") {
  if (!appearance || appearance.type !== "appearance") {
    return "";
  }
  const key = normalizeTextKey(title);
  if (key && key === normalizeTextKey(appearance.maleTitle || "")) {
    return "male";
  }
  if (key && key === normalizeTextKey(appearance.femaleTitle || "")) {
    return "female";
  }
  return "";
}

function getAppearanceTitleByColumn(appearance, column = "") {
  if (!appearance || appearance.type !== "appearance") {
    return "";
  }
  if (column === "male") {
    return appearance.maleTitle || "";
  }
  if (column === "female") {
    return appearance.femaleTitle || "";
  }
  return "";
}

function getAppearanceColumnFromPair(left, right) {
  const leftColumn = getAppearanceTitleColumn(left?.item, left?.title);
  const rightColumn = getAppearanceTitleColumn(right?.item, right?.title);
  return leftColumn && leftColumn === rightColumn ? leftColumn : "";
}

function getInventoryAchievementDetail(achievement) {
  const point = Number(achievement.point) || 0;
  const names = getInventoryAchievementDemandText(achievement);
  return names ? `${point} 分 · ${names}` : `${point} 分`;
}

function getInventoryAchievementDemandText(achievement) {
  if (!achievement || achievement.type === "single" || achievement.type === "appearance") {
    return "";
  }
  return (achievement.demandNames || []).filter(Boolean).join(" / ");
}

function getPendingMatchStatusText(match, achievement) {
  const kind = getAchievementKindText(achievement);
  if (/低置信/.test(match.meta || "")) {
    return `${kind} · 低置信，需确认`;
  }
  if (/相邻|补齐/.test(match.meta || "")) {
    return `${kind} · 相邻顺序补齐，需确认`;
  }
  if (achievement.type === "appearance") {
    return kind;
  }
  return kind;
}

function createConfirmedItem(record) {
  const item = document.createElement("article");
  item.className = "manual-item";

  const top = document.createElement("div");
  top.className = "manual-top";
  const text = document.createElement("div");
  text.className = "confirmed-text";
  const title = document.createElement("p");
  title.className = "manual-title";
  title.textContent = getInventoryListTitleLine(record.item, record.title);
  const meta = document.createElement("p");
  meta.className = "manual-meta";
  meta.textContent = getAchievementKindText(record.item);
  text.append(title, meta);

  const side = document.createElement("div");
  side.className = "confirmed-side";
  if (record.point > 0) {
    const score = document.createElement("span");
    score.className = "score-pill";
    score.textContent = `${record.point} 分`;
    side.appendChild(score);
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "tiny-button";
  if (record.achievementId) {
    button.dataset.confirmedAchievementId = record.achievementId;
  }
  button.textContent = "删除";
  side.appendChild(button);

  top.append(text, side);
  item.appendChild(top);
  return item;
}

function renderManualResults() {
  if (!elements.manualResults) {
    return;
  }
  const query = buildQuery(elements.manualQuery.value || "");
  const matches = query.raw
    ? indices.manualItems
        .map((entry) => {
          const scores = entry._searchEntries
            .map((searchEntry) => scoreEntry(searchEntry, query))
            .filter((score) => score !== null);
          return { ...entry, score: scores.length ? Math.min(...scores) : null };
        })
        .filter((entry) => entry.score !== null)
        .sort((left, right) => left.score - right.score)
        .slice(0, 12)
    : [];

  if (!matches.length) {
    const empty = document.createElement("p");
    empty.className = "subtle-line";
    empty.textContent = query.raw ? "没有匹配项" : "";
    elements.manualResults.replaceChildren(empty);
    return;
  }

  elements.manualResults.replaceChildren(...matches.map(createManualItem));
}

function createManualItem(entry) {
  const id = entry.item.achievementId;
  const active = isClaimedAchievement(id);
  const pending = isManualEntryPending(entry.kind, id);
  const item = document.createElement("article");
  item.className = "manual-item";

  const top = document.createElement("div");
  top.className = "manual-top";
  const text = document.createElement("div");
  text.className = "manual-text";
  const title = document.createElement("p");
  title.className = "manual-title";
  title.textContent = getInventoryListTitleLine(entry.item);
  const meta = document.createElement("p");
  meta.className = "manual-meta";
  meta.textContent = getAchievementKindText(entry.item);
  text.append(title, meta);

  const button = document.createElement("button");
  button.type = "button";
  button.className = active || pending ? "tiny-button is-active" : "tiny-button";
  button.dataset.manualKind = entry.kind;
  button.dataset.manualId = id;
  button.disabled = active || pending;
  button.textContent = active ? "已记录" : pending ? "待确认" : "添加";

  const side = document.createElement("div");
  side.className = "manual-side";
  const point = Number(entry.item.point) || 0;
  if (point > 0) {
    const score = document.createElement("span");
    score.className = "score-pill";
    score.textContent = `${point} 分`;
    side.appendChild(score);
  }
  side.appendChild(button);

  top.append(text, side);
  item.appendChild(top);
  return item;
}

function isManualEntryPending(kind, id) {
  const pendingKind =
    kind === "token"
      ? "token"
      : kind === "appearance"
        ? "appearance"
        : "achievement";
  return state.pendingMatches.some(
    (match) => match.kind === pendingKind && match.id === id,
  );
}

function renderTokenList() {
  if (!elements.tokenList) {
    return;
  }
  const claimedCount = state.tokenAchievements.filter((achievement) =>
    state.inventory.claimedAchievementIds.has(achievement.achievementId),
  ).length;
  elements.tokenCount.textContent = `${claimedCount}/${state.tokenAchievements.length}`;
  elements.tokenList.replaceChildren(
    ...state.tokenAchievements.map((achievement) =>
      createManualItem({ kind: "token", item: achievement }),
    ),
  );
}
