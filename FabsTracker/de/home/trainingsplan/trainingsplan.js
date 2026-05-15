const messageDiv = document.getElementById('message');
const weekLabel = document.getElementById('week-label');
const weekGrid = document.getElementById('week-grid');
const prevWeekBtn = document.getElementById('prev-week-btn');
const nextWeekBtn = document.getElementById('next-week-btn');
const repeatFutureBtn = document.getElementById('repeat-future-btn');
const exercisePalette = document.getElementById('exercise-palette');
const customExerciseBtn = document.getElementById('custom-exercise-btn');
const customModal = document.getElementById('custom-modal');
const customNameInput = document.getElementById('custom-name-input');
const customColorInput = document.getElementById('custom-color-input');
const customCancelBtn = document.getElementById('custom-cancel');
const customSaveBtn = document.getElementById('custom-save');

const dayTemplates = [
  { key: 'monday', label: 'Montag' },
  { key: 'tuesday', label: 'Dienstag' },
  { key: 'wednesday', label: 'Mittwoch' },
  { key: 'thursday', label: 'Donnerstag' },
  { key: 'friday', label: 'Freitag' },
  { key: 'saturday', label: 'Samstag' },
  { key: 'sunday', label: 'Sonntag' }
];

let currentWeekStart = getMonday(new Date());
let plan = createEmptyPlan(formatDate(currentWeekStart));
let draggedBlock = null;
let selectedPaletteBlock = null;
let saveTimer = null;
let isSaving = false;
let dropMarker = null;

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function showMessage(text, color = 'red') {
  messageDiv.textContent = text;
  messageDiv.style.color = color;
  messageDiv.style.display = text ? 'block' : 'none';
}

function queueSave(options = {}) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveWeek(options), options.immediate ? 0 : 550);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonday(date) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function addDays(date, amount) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function addWeeks(date, amount) {
  return addDays(date, amount * 7);
}

function createEmptyPlan(weekStart) {
  return {
    weekStart,
    customBlocks: [],
    days: dayTemplates.map((day) => ({
      ...day,
      status: 'planned',
      blocks: []
    }))
  };
}

function normalizeBlock(block) {
  return {
    id: String(block.id || createId()),
    type: String(block.type || 'custom'),
    title: String(block.title || 'Training'),
    color: typeof block.color === 'string' ? block.color : null
  };
}

function normalizePlan(rawPlan) {
  const weekStart = formatDate(currentWeekStart);
  const rawDays = Array.isArray(rawPlan?.days) ? rawPlan.days : [];

  return {
    weekStart,
    customBlocks: Array.isArray(rawPlan?.customBlocks)
      ? rawPlan.customBlocks.map(normalizeBlock)
      : [],
    days: dayTemplates.map((day) => {
      const savedDay = rawDays.find((saved) => saved.key === day.key) || {};
      return {
        ...day,
        status: savedDay.status === 'skipped' ? 'skipped' : 'planned',
        blocks: Array.isArray(savedDay.blocks) ? savedDay.blocks.map(normalizeBlock) : []
      };
    })
  };
}

function updateWeekLabel() {
  const end = addDays(currentWeekStart, 6);
  const formatter = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  weekLabel.textContent = `${formatter.format(currentWeekStart)} - ${formatter.format(end)}`;

  const thisWeek = getMonday(new Date());
  prevWeekBtn.disabled = currentWeekStart <= thisWeek;
}

async function checkLogin() {
  try {
    const res = await fetch('/me', { credentials: 'include' });
    if (res.status === 401) {
      showMessage('Nicht eingeloggt. Weiterleitung...');
      window.location.replace('../');
      return;
    }
    if (!res.ok) {
      showMessage('Server nicht erreichbar');
      return;
    }
    const data = await res.json();
    if (data.user?.role === 'admin') {
      if (typeof window.createAdminButtonSidebar === 'function') window.createAdminButtonSidebar();
      if (typeof window.createAdminButtonBottomNav === 'function') window.createAdminButtonBottomNav();
    }
  } catch (err) {
    console.error('Login check error:', err);
    showMessage('Netzwerkfehler');
  }
}

async function loadTheme() {
  try {
    const res = await fetch('/getUserData', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    const theme = data.userData?.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    const themeSwitch = document.getElementById('themeSwitch');
    if (themeSwitch) themeSwitch.checked = theme === 'light';
  } catch (err) {
    console.error('Theme load error:', err);
  }
}

async function loadWeek() {
  clearTimeout(saveTimer);
  showMessage('');
  updateWeekLabel();

  try {
    const weekStart = formatDate(currentWeekStart);
    const res = await fetch(`/trainingsplan?weekStart=${encodeURIComponent(weekStart)}`, {
      credentials: 'include'
    });
    if (res.status === 401) {
      showMessage('Nicht eingeloggt. Weiterleitung...');
      window.location.replace('../');
      return;
    }
    if (!res.ok) {
      showMessage('Trainingsplan konnte nicht geladen werden.');
      return;
    }
    const data = await res.json();
    if (!data.success) {
      showMessage(data.message || 'Fehler');
      return;
    }
    plan = normalizePlan(data.plan);
    selectedPaletteBlock = null;
    renderPalette();
    renderWeek();
  } catch (err) {
    console.error('Load week error:', err);
    showMessage('Netzwerkfehler');
  }
}

function renderPalette() {
  exercisePalette.querySelectorAll('.custom-palette-item').forEach((item) => item.remove());
  plan.customBlocks.forEach((block) => {
    exercisePalette.insertBefore(createPaletteButton(block, true), customExerciseBtn);
  });
}

function createPaletteButton(block, isCustom) {
  const wrapper = document.createElement('div');
  wrapper.className = `palette-wrap${isCustom ? ' custom-palette-item' : ''}`;

  const button = document.createElement('button');
  button.className = `palette-item ${block.type}`;
  button.type = 'button';
  button.draggable = true;
  button.dataset.type = block.type;
  button.dataset.title = block.title;
  if (block.color) button.style.setProperty('--block-color', block.color);
  button.textContent = block.title;
  bindPaletteButton(button);
  wrapper.appendChild(button);

  if (isCustom) {
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'palette-remove-btn';
    remove.textContent = 'x';
    remove.setAttribute('aria-label', `${block.title} löschen`);
    remove.addEventListener('click', () => {
      plan.customBlocks = plan.customBlocks.filter((item) => item.id !== block.id);
      plan.days.forEach((day) => {
        day.blocks = day.blocks.filter((item) => item.title !== block.title || item.type !== block.type);
      });
      renderPalette();
      renderWeek();
      queueSave();
    });
    wrapper.appendChild(remove);
  }

  return wrapper;
}

function renderWeek() {
  clearDropMarker();
  weekGrid.innerHTML = '';
  const today = formatDate(new Date());

  plan.days.forEach((day, index) => {
    const date = addDays(currentWeekStart, index);
    const dateValue = formatDate(date);
    const isPast = dateValue < today;
    const column = document.createElement('section');
    column.className = `day-column${dateValue === today ? ' today' : ''}${day.status === 'skipped' ? ' skipped' : ''}`;
    column.dataset.dayKey = day.key;

    const header = document.createElement('div');
    header.className = 'day-header';

    const name = document.createElement('h2');
    name.textContent = day.label;

    const dateLabel = document.createElement('span');
    dateLabel.textContent = new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit'
    }).format(date);

    header.append(name, dateLabel);

    if (isPast) {
      const skipBtn = document.createElement('button');
      skipBtn.type = 'button';
      skipBtn.className = 'skip-btn';
      skipBtn.textContent = day.status === 'skipped' ? 'Geskippt' : 'Skip';
      skipBtn.addEventListener('click', () => toggleSkipped(day.key));
      header.appendChild(skipBtn);
    }

    const dropzone = document.createElement('div');
    dropzone.className = 'day-dropzone';
    dropzone.dataset.dayKey = day.key;

    day.blocks.forEach((block) => {
      dropzone.appendChild(createTrainingBlock(block, day.key));
    });

    dropzone.addEventListener('click', () => {
      if (selectedPaletteBlock) addBlockToDay(day.key, selectedPaletteBlock);
    });
    dropzone.addEventListener('dragover', (event) => {
      event.preventDefault();
      dropzone.classList.add('drag-over');
      showDropMarker(dropzone, getDropIndex(dropzone, event.clientY));
    });
    dropzone.addEventListener('dragleave', (event) => {
      if (!dropzone.contains(event.relatedTarget)) {
        dropzone.classList.remove('drag-over');
        clearDropMarker();
      }
    });
    dropzone.addEventListener('drop', (event) => {
      event.preventDefault();
      const indexAtDrop = Number(dropMarker?.dataset.index ?? getDropIndex(dropzone, event.clientY));
      dropzone.classList.remove('drag-over');
      clearDropMarker();
      handleDrop(day.key, indexAtDrop);
    });

    column.append(header, dropzone);
    weekGrid.appendChild(column);
  });
}

function createTrainingBlock(block, dayKey) {
  const item = document.createElement('div');
  item.className = `training-block ${block.type}`;
  item.draggable = true;
  item.dataset.blockId = block.id;
  item.dataset.dayKey = dayKey;
  if (block.color) item.style.setProperty('--block-color', block.color);

  const title = document.createElement('span');
  title.textContent = block.title;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'remove-block-btn';
  removeBtn.setAttribute('aria-label', `${block.title} entfernen`);
  removeBtn.textContent = 'x';
  removeBtn.addEventListener('click', () => removeBlock(dayKey, block.id));

  item.append(title, removeBtn);
  item.addEventListener('dragstart', () => {
    item.classList.add('dragging');
    draggedBlock = { sourceDayKey: dayKey, block };
  });
  item.addEventListener('dragend', () => {
    item.classList.remove('dragging');
    document.querySelectorAll('.drag-over').forEach((node) => node.classList.remove('drag-over'));
    clearDropMarker();
  });

  return item;
}

function getDropIndex(dropzone, pointerY) {
  const blocks = Array.from(dropzone.querySelectorAll('.training-block:not(.dragging)'));
  const foundIndex = blocks.findIndex((block) => {
    const rect = block.getBoundingClientRect();
    return pointerY < rect.top + rect.height / 2;
  });
  return foundIndex === -1 ? blocks.length : foundIndex;
}

function showDropMarker(dropzone, index) {
  if (!dropMarker) {
    dropMarker = document.createElement('div');
    dropMarker.className = 'drop-marker';
  }
  dropMarker.dataset.index = String(index);
  const blocks = Array.from(dropzone.querySelectorAll('.training-block:not(.dragging)'));
  dropzone.insertBefore(dropMarker, blocks[index] || null);
}

function clearDropMarker() {
  if (dropMarker) dropMarker.remove();
}

function hasDuplicateBlock(dayKey, block, ignoredBlockId = null) {
  const day = plan.days.find((item) => item.key === dayKey);
  if (!day) return false;
  const normalizedTitle = block.title.trim().toLowerCase();
  return day.blocks.some((item) => (
    item.id !== ignoredBlockId &&
    item.type === block.type &&
    item.title.trim().toLowerCase() === normalizedTitle
  ));
}

function addBlockToDay(dayKey, block, insertIndex = null) {
  const day = plan.days.find((item) => item.key === dayKey);
  if (!day) return false;
  if (hasDuplicateBlock(dayKey, block)) {
    showMessage(`${block.title} ist an diesem Tag schon eingeplant.`);
    return false;
  }
  const nextBlock = { ...block, id: createId() };
  if (insertIndex === null || insertIndex >= day.blocks.length) {
    day.blocks.push(nextBlock);
  } else {
    day.blocks.splice(insertIndex, 0, nextBlock);
  }
  selectedPaletteBlock = null;
  clearPaletteSelection();
  renderWeek();
  queueSave();
  return true;
}

function handleDrop(targetDayKey, insertIndex) {
  if (!draggedBlock) return;
  if (!draggedBlock.sourceDayKey) {
    addBlockToDay(targetDayKey, draggedBlock.block, insertIndex);
    draggedBlock = null;
    return;
  }
  const sourceDay = plan.days.find((day) => day.key === draggedBlock.sourceDayKey);
  const targetDay = plan.days.find((day) => day.key === targetDayKey);
  if (!sourceDay || !targetDay) return;
  const movedBlock = sourceDay.blocks.find((block) => block.id === draggedBlock.block.id);
  if (!movedBlock) return;
  if (draggedBlock.sourceDayKey !== targetDayKey && hasDuplicateBlock(targetDayKey, movedBlock)) {
    showMessage(`${movedBlock.title} ist an diesem Tag schon eingeplant.`);
    draggedBlock = null;
    return;
  }
  sourceDay.blocks = sourceDay.blocks.filter((block) => block.id !== movedBlock.id);
  const safeIndex = Math.min(insertIndex, targetDay.blocks.length);
  targetDay.blocks.splice(safeIndex, 0, movedBlock);
  draggedBlock = null;
  renderWeek();
  queueSave();
}

function removeBlock(dayKey, blockId) {
  const day = plan.days.find((item) => item.key === dayKey);
  if (!day) return;
  day.blocks = day.blocks.filter((block) => block.id !== blockId);
  renderWeek();
  queueSave();
}

function toggleSkipped(dayKey) {
  const day = plan.days.find((item) => item.key === dayKey);
  if (!day) return;
  day.status = day.status === 'skipped' ? 'planned' : 'skipped';
  renderWeek();
  queueSave();
}

async function saveWeek(options = {}) {
  if (isSaving) return true;
  isSaving = true;
  try {
    const weekStart = formatDate(currentWeekStart);
    const res = await fetch('/trainingsplan', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekStart, plan, repeatFuture: Boolean(options.repeatFuture) })
    });
    if (!res.ok) {
      showMessage('Trainingsplan konnte nicht gespeichert werden.');
      return false;
    }
    const data = await res.json();
    if (!data.success) {
      showMessage(data.message || 'Fehler');
      return false;
    }
    plan = normalizePlan(data.plan);
    renderPalette();
    renderWeek();
    if (!options.silent) showMessage(options.repeatFuture ? 'Für folgende Wochen übernommen.' : 'Gespeichert.', '#49d17d');
    return true;
  } catch (err) {
    console.error('Save week error:', err);
    showMessage('Netzwerkfehler');
    return false;
  } finally {
    isSaving = false;
  }
}

async function changeWeek(amount) {
  clearTimeout(saveTimer);
  const saved = await saveWeek({ silent: true });
  if (!saved) return;
  currentWeekStart = addWeeks(currentWeekStart, amount);
  loadWeek();
}

function bindPaletteButton(item) {
  item.addEventListener('dragstart', () => {
    draggedBlock = {
      sourceDayKey: null,
      block: {
        id: createId(),
        type: item.dataset.type,
        title: item.dataset.title,
        color: item.style.getPropertyValue('--block-color') || null
      }
    };
  });
  item.addEventListener('click', () => {
    selectedPaletteBlock = {
      id: createId(),
      type: item.dataset.type,
      title: item.dataset.title,
      color: item.style.getPropertyValue('--block-color') || null
    };
    clearPaletteSelection();
    item.classList.add('selected');
    showMessage(`${item.dataset.title} ausgewählt. Tippe einen Tag an.`, '#49d17d');
  });
}

function clearPaletteSelection() {
  document.querySelectorAll('.palette-item.selected').forEach((item) => item.classList.remove('selected'));
}

function openCustomModal() {
  customNameInput.value = 'rr';
  customColorInput.value = '#2bbcff';
  customModal.style.display = 'flex';
  customNameInput.focus();
}

function closeCustomModal() {
  customModal.style.display = 'none';
}

function saveCustomBlock() {
  const title = customNameInput.value.trim();
  if (!title) {
    showMessage('Bitte gib einen Namen ein.');
    return;
  }
  const exists = [...document.querySelectorAll('.palette-item')].some((item) => (
    item.dataset.title?.trim().toLowerCase() === title.toLowerCase()
  ));
  if (exists) {
    showMessage('Diesen Baustein gibt es schon.');
    return;
  }
  plan.customBlocks.push({ id: createId(), type: 'custom', title, color: customColorInput.value });
  renderPalette();
  closeCustomModal();
  queueSave();
}

document.querySelectorAll('.exercise-palette > .palette-item').forEach(bindPaletteButton);

exercisePalette.addEventListener('dragover', (event) => {
  event.preventDefault();
  exercisePalette.classList.add('drag-over');
});
exercisePalette.addEventListener('dragleave', () => exercisePalette.classList.remove('drag-over'));
exercisePalette.addEventListener('drop', (event) => {
  event.preventDefault();
  exercisePalette.classList.remove('drag-over');
  if (draggedBlock?.sourceDayKey) removeBlock(draggedBlock.sourceDayKey, draggedBlock.block.id);
  draggedBlock = null;
});

prevWeekBtn.addEventListener('click', () => {
  const thisWeek = getMonday(new Date());
  if (currentWeekStart <= thisWeek) return;
  changeWeek(-1);
});
nextWeekBtn.addEventListener('click', () => changeWeek(1));
repeatFutureBtn.addEventListener('click', () => saveWeek({ repeatFuture: true }));
customExerciseBtn.addEventListener('click', openCustomModal);
customCancelBtn.addEventListener('click', closeCustomModal);
customSaveBtn.addEventListener('click', saveCustomBlock);
customModal.addEventListener('click', (event) => {
  if (event.target === customModal) closeCustomModal();
});
customNameInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') saveCustomBlock();
});

function initMobileTouchControls() {
  let touchActiveBlock = null;
  let touchStartOffset = { x: 0, y: 0 };
  let touchOriginalParent = null;
  let touchOriginalNextSibling = null;
  let touchIsNewFromPalette = false;

  // 1. TOUCHSTART: Prüft, ob ein ziehbares Element berührt wurde
  document.addEventListener('touchstart', function(e) {
    const target = e.target.closest('.palette-item, .training-block');
    if (!target || e.target.classList.contains('remove-block-btn') || e.target.classList.contains('skip-btn')) return;

    touchActiveBlock = target;
    const rect = touchActiveBlock.getBoundingClientRect();
    const touch = e.touches[0];
    
    touchStartOffset.x = touch.clientX - rect.left;
    touchStartOffset.y = touch.clientY - rect.top;

    touchOriginalParent = touchActiveBlock.parentNode;
    touchOriginalNextSibling = touchActiveBlock.nextSibling;

    // Unterscheiden: Kommt das Element aus der Palette oder ist es ein bestehender Block?
    touchIsNewFromPalette = touchActiveBlock.classList.contains('palette-item');

    if (touchIsNewFromPalette) {
      // Bereite globalen draggedBlock Zustand für neue Palette-Elemente vor
      draggedBlock = {
        sourceDayKey: null,
        block: {
          id: createId(),
          type: touchActiveBlock.dataset.type,
          title: touchActiveBlock.dataset.title,
          color: touchActiveBlock.style.getPropertyValue('--block-color') || null
        }
      };
    } else {
      // Bereite globalen draggedBlock Zustand für bestehende Blöcke vor
      const dayKey = touchActiveBlock.dataset.dayKey;
      const blockId = touchActiveBlock.dataset.blockId;
      const day = plan.days.find(d => d.key === dayKey);
      const foundBlock = day ? day.blocks.find(b => b.id === blockId) : null;
      
      if (foundBlock) {
        draggedBlock = { sourceDayKey: dayKey, block: foundBlock };
        touchActiveBlock.classList.add('dragging');
      }
    }
  }, { passive: true });

  // 2. TOUCHMOVE: Verschiebt das Element visuell unter dem Finger und steuert Drop-Marker
  document.addEventListener('touchmove', function(e) {
    if (!touchActiveBlock || !draggedBlock) return;

    const touch = e.touches[0];

    // CSS-Klassen vergeben, damit das Element frei über den Bildschirm schwebt
    if (!touchActiveBlock.style.position) {
      const rect = touchActiveBlock.getBoundingClientRect();
      touchActiveBlock.style.position = 'fixed';
      touchActiveBlock.style.width = rect.width + 'px';
      touchActiveBlock.style.height = rect.height + 'px';
      touchActiveBlock.style.zIndex = '1000';
      touchActiveBlock.style.pointerEvents = 'none'; // Wichtig, um Elemente darunter zu scannen
    }

    // Element-Position aktualisieren
    touchActiveBlock.style.left = (touch.clientX - touchStartOffset.x) + 'px';
    touchActiveBlock.style.top = (touch.clientY - touchStartOffset.y) + 'px';

    // Element unter dem Finger ermitteln
    const elementUnderFinger = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Alte Drop-Zonen aufräumen
    document.querySelectorAll('.day-dropzone, #exercise-palette').forEach(zone => zone.classList.remove('drag-over'));
    clearDropMarker();

    if (!elementUnderFinger) return;

    // Fall 1: Finger über einer Tages-Dropzone
    const dropzone = elementUnderFinger.closest('.day-dropzone');
    if (dropzone) {
      e.preventDefault(); // Verhindert das Scrollen des Bildschirms nur beim aktiven Platzieren
      dropzone.classList.add('drag-over');
      const calculatedIndex = getDropIndex(dropzone, touch.clientY);
      showDropMarker(dropzone, calculatedIndex);
      return;
    }

    // Fall 2: Finger über der Palette (Zum Löschen bestehender Blöcke)
    const paletteZone = elementUnderFinger.closest('#exercise-palette');
    if (paletteZone && !touchIsNewFromPalette) {
      paletteZone.classList.add('drag-over');
    }
  }, { passive: false });

  // 3. TOUCHEND: Verarbeitet das Loslassen auf dem Smartphone
  document.addEventListener('touchend', function(e) {
    if (!touchActiveBlock) return;

    const touch = e.changedTouches[0];
    const elementUnderFinger = document.elementFromPoint(touch.clientX, touch.clientY);

    // Styles des schwebenden Touch-Elements sofort zurücksetzen
    touchActiveBlock.style.position = '';
    touchActiveBlock.style.width = '';
    touchActiveBlock.style.height = '';
    touchActiveBlock.style.zIndex = '';
    touchActiveBlock.style.pointerEvents = '';
    if (!touchIsNewFromPalette) touchActiveBlock.classList.remove('dragging');

    document.querySelectorAll('.day-dropzone, #exercise-palette').forEach(zone => zone.classList.remove('drag-over'));

    const dropzone = elementUnderFinger ? elementUnderFinger.closest('.day-dropzone') : null;
    const paletteZone = elementUnderFinger ? elementUnderFinger.closest('#exercise-palette') : null;

    if (dropzone && draggedBlock) {
      // Korrekten Einfüge-Index über den Drop-Marker auslesen oder berechnen
      const indexAtDrop = Number(dropMarker?.dataset.index ?? getDropIndex(dropzone, touch.clientY));
      clearDropMarker();
      handleDrop(dropzone.dataset.dayKey, indexAtDrop);
    } 
    else if (paletteZone && !touchIsNewFromPalette && draggedBlock?.sourceDayKey) {
      // Wenn ein bestehender Trainingsblock auf die Palette gezogen wird -> Löschen
      clearDropMarker();
      removeBlock(draggedBlock.sourceDayKey, draggedBlock.block.id);
      draggedBlock = null;
    } 
    else {
      // Abgebrochen: Element an die alte visuelle Position im DOM zurücksetzen
      clearDropMarker();
      if (touchOriginalNextSibling) {
        touchOriginalParent.insertBefore(touchActiveBlock, touchOriginalNextSibling);
      } else {
        touchOriginalParent.appendChild(touchActiveBlock);
      }
      draggedBlock = null;
    }

    touchActiveBlock = null;
  });
}

// Mobile Touchsteuerung beim Laden direkt ausführen
initMobileTouchControls();

checkLogin();
loadTheme();
loadWeek();
setInterval(checkLogin, 5000);
