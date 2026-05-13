const messageDiv = document.getElementById('message');
const planOverview = document.getElementById('plan-overview');
const dayList = document.getElementById('day-list');
const addDayCard = document.getElementById('add-day-card');
const dayEditor = document.getElementById('day-editor');
const backToOverviewBtn = document.getElementById('back-to-overview');
const deleteDayBtn = document.getElementById('delete-day-btn');
const dayNameInput = document.getElementById('day-name-input');
const exerciseList = document.getElementById('exercise-list');
const addExerciseBtn = document.getElementById('add-exercise-btn');
const saveDayBtn = document.getElementById('save-day-btn');
const confirmModal = document.getElementById('confirm-modal');
const confirmText = document.getElementById('confirm-text');
const confirmCancelBtn = document.getElementById('confirm-cancel');
const confirmDeleteBtn = document.getElementById('confirm-delete');

let linksSet = false;
let planState = {
  firstTime: true,
  activeIndex: 0,
  days: []
};
let activeDayIndex = 0;
let deleteIndex = null;

function showMessage(text, color = 'red') {
  messageDiv.textContent = text;
  messageDiv.style.color = color;
  messageDiv.style.display = text ? 'block' : 'none';
}

function normalizeName(name) {
  return String(name || '').trim().toLowerCase();
}

function isDuplicateDayName(name, ignoredIndex = -1) {
  const normalizedName = normalizeName(name);
  return planState.days.some((day, index) => (
    index !== ignoredIndex && normalizeName(day.name) === normalizedName
  ));
}

function getDefaultDayName() {
  const names = ['Push', 'Pull', 'Beine', 'Oberkörper', 'Unterkörper'];
  const unusedName = names.find((name) => !isDuplicateDayName(name));
  if (unusedName) return unusedName;

  let counter = planState.days.length + 1;
  let name = `Training ${counter}`;
  while (isDuplicateDayName(name)) {
    counter += 1;
    name = `Training ${counter}`;
  }
  return name;
}

function normalizePlanState(config = {}) {
  const days = Array.isArray(config.days) ? config.days : [];
  return {
    firstTime: days.length === 0,
    activeIndex: Number.isInteger(config.activeIndex) ? config.activeIndex : 0,
    days: days.map((day, index) => ({
      name: day.name || `Training ${index + 1}`,
      exercises: Array.isArray(day.exercises) ? day.exercises : []
    }))
  };
}

async function savePlanState(updatedDays, activeIndex = 0) {
  const nextActiveIndex = updatedDays.length > 0
    ? Math.min(Math.max(activeIndex, 0), updatedDays.length - 1)
    : 0;

  const nextState = {
    firstTime: updatedDays.length === 0,
    activeIndex: nextActiveIndex,
    days: updatedDays
  };

  const res = await fetch('/updateUserData', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      trainingsplan: nextState
    })
  });

  if (!res.ok) {
    throw new Error('Fehler beim Speichern.');
  }

  planState = nextState;
  activeDayIndex = nextActiveIndex;
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
    if (!data.success) {
      showMessage(data.message || 'Fehler');
      return;
    }

    const role = data.user.role;
    if (role === 'admin') {
      if (typeof window.createAdminButtonSidebar === 'function') {
        window.createAdminButtonSidebar();
      }
      if (typeof window.createAdminButtonBottomNav === 'function') {
        window.createAdminButtonBottomNav();
      }
    }

    linksSet = true;
  } catch (err) {
    console.error('Login check error:', err);
    showMessage('Netzwerkfehler');
  }
}

async function loadPlan() {
  try {
    const res = await fetch('/getUserData', { credentials: 'include' });

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
    if (!data.success) {
      showMessage(data.message || 'Fehler');
      return;
    }

    const theme = data.userData?.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);

    const themeSwitch = document.getElementById('themeSwitch');
    if (themeSwitch) {
      themeSwitch.checked = theme === 'light';
    }

    planState = normalizePlanState(data.userData?.trainingsplan);
    renderOverview();
  } catch (err) {
    console.error('Plan load error:', err);
    showMessage('Netzwerkfehler');
  }
}

function renderOverview() {
  showMessage('');
  dayEditor.style.display = 'none';
  confirmModal.style.display = 'none';
  planOverview.style.display = 'block';
  dayList.innerHTML = '';

  planState.days.forEach((day, index) => {
    const card = document.createElement('div');
    card.className = 'day-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');

    const name = document.createElement('span');
    name.className = 'day-name';
    name.textContent = day.name;

    const count = document.createElement('span');
    count.className = 'exercise-count';
    count.textContent = `${day.exercises.length} Übungen`;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'card-delete-btn';
    deleteBtn.type = 'button';
    deleteBtn.setAttribute('aria-label', `${day.name} löschen`);
    deleteBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      openDeleteModal(index);
    });

    card.append(name, count, deleteBtn);
    card.addEventListener('click', () => openEditor(index));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openEditor(index);
      }
    });

    dayList.appendChild(card);
  });

  dayList.appendChild(addDayCard);
}

function openEditor(index) {
  activeDayIndex = index;
  const day = planState.days[index];
  if (!day) {
    renderOverview();
    return;
  }

  showMessage('');
  planOverview.style.display = 'none';
  dayEditor.style.display = 'block';
  dayNameInput.value = day.name;
  renderExercises(day.exercises);
}

function createExerciseRow(exercise = {}) {
  const row = document.createElement('div');
  row.className = 'exercise-row';

  row.innerHTML = `
    <label>
      Übung
      <input class="exercise-name" type="text" maxlength="40" autocomplete="off" value="${escapeHtml(exercise.name || '')}">
    </label>
    <label>
      Sätze
      <input class="exercise-sets" type="number" min="1" max="20" step="1" value="${Number(exercise.sets) || 3}">
    </label>
    <label>
      Wdh.
      <input class="exercise-reps" type="number" min="1" max="100" step="1" value="${Number(exercise.reps) || 10}">
    </label>
    <label>
      kg
      <input class="exercise-weight" type="number" min="0" max="500" step="0.5" value="${Number(exercise.weight) || 0}">
    </label>
    <button class="remove-exercise-btn" type="button" aria-label="Übung entfernen">×</button>
  `;

  row.querySelector('.remove-exercise-btn').addEventListener('click', () => {
    row.remove();
  });

  return row;
}

function renderExercises(exercises) {
  exerciseList.innerHTML = '';
  exercises.forEach((exercise) => {
    exerciseList.appendChild(createExerciseRow(exercise));
  });

  if (exercises.length === 0) {
    exerciseList.appendChild(createExerciseRow());
  }
}

function readExercises() {
  return Array.from(exerciseList.querySelectorAll('.exercise-row')).map((row) => ({
    name: row.querySelector('.exercise-name').value.trim(),
    sets: Number(row.querySelector('.exercise-sets').value),
    reps: Number(row.querySelector('.exercise-reps').value),
    weight: Number(row.querySelector('.exercise-weight').value)
  })).filter((exercise) => exercise.name);
}

async function createDay() {
  const newDay = {
    name: getDefaultDayName(),
    exercises: []
  };

  const updatedDays = [...planState.days, newDay];

  try {
    await savePlanState(updatedDays, updatedDays.length - 1);
    openEditor(activeDayIndex);
  } catch (err) {
    console.error('Create day error:', err);
    showMessage(err.message || 'Netzwerkfehler');
  }
}

async function saveActiveDay() {
  const day = planState.days[activeDayIndex];
  if (!day) {
    renderOverview();
    return;
  }

  const name = dayNameInput.value.trim() || `Training ${activeDayIndex + 1}`;
  if (isDuplicateDayName(name, activeDayIndex)) {
    showMessage('Dieser Trainingsname existiert schon.');
    return;
  }

  const exercises = readExercises();
  if (exercises.length === 0) {
    showMessage('Füge mindestens eine Übung hinzu.');
    return;
  }

  const invalidExercise = exercises.find((exercise) => (
    !Number.isFinite(exercise.sets) ||
    !Number.isFinite(exercise.reps) ||
    !Number.isFinite(exercise.weight) ||
    exercise.sets <= 0 ||
    exercise.reps <= 0 ||
    exercise.weight < 0
  ));

  if (invalidExercise) {
    showMessage('Bitte prüfe Sätze, Wiederholungen und Gewicht.');
    return;
  }

  const updatedDays = planState.days.map((item, index) => (
    index === activeDayIndex ? { name, exercises } : item
  ));

  try {
    await savePlanState(updatedDays, activeDayIndex);
    renderOverview();
  } catch (err) {
    console.error('Save day error:', err);
    showMessage(err.message || 'Netzwerkfehler');
  }
}

function openDeleteModal(index = activeDayIndex) {
  const day = planState.days[index];
  if (!day) {
    renderOverview();
    return;
  }

  deleteIndex = index;
  confirmText.textContent = `${day.name} wirklich löschen?`;
  confirmModal.style.display = 'flex';
}

function closeDeleteModal() {
  deleteIndex = null;
  confirmModal.style.display = 'none';
}

async function deleteSelectedDay() {
  if (deleteIndex === null) return;

  const removedIndex = deleteIndex;
  const updatedDays = planState.days.filter((_, index) => index !== removedIndex);

  try {
    await savePlanState(updatedDays, removedIndex - 1);
    closeDeleteModal();
    renderOverview();
  } catch (err) {
    console.error('Delete day error:', err);
    showMessage(err.message || 'Netzwerkfehler');
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

addDayCard.addEventListener('click', createDay);
backToOverviewBtn.addEventListener('click', renderOverview);
addExerciseBtn.addEventListener('click', () => {
  exerciseList.appendChild(createExerciseRow());
});
saveDayBtn.addEventListener('click', saveActiveDay);
deleteDayBtn.addEventListener('click', () => openDeleteModal(activeDayIndex));
confirmCancelBtn.addEventListener('click', closeDeleteModal);
confirmDeleteBtn.addEventListener('click', deleteSelectedDay);
confirmModal.addEventListener('click', (event) => {
  if (event.target === confirmModal) closeDeleteModal();
});

checkLogin();
loadPlan();
setInterval(checkLogin, 5000);
