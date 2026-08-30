/* ==========================================================================
   LEVEL UP KIDS - CORE APPLICATION LOGIC
   VERSÃO LOCAL - SEM BANCO DE DADOS
   ========================================================================== */

// --- CONFIGURAÇÃO DE NÍVEIS ---
const LEVELS = [
  { level: 1, name: 'COMEÇANDO', minXP: 0, maxXP: 99 },
  { level: 2, name: 'EXPLORADOR', minXP: 100, maxXP: 249 },
  { level: 3, name: 'GUERREIRO', minXP: 250, maxXP: 499 },
  { level: 4, name: 'DISCÍPULO', minXP: 500, maxXP: 799 },
  { level: 5, name: 'AVIVADO', minXP: 800, maxXP: 1199 },
  { level: 6, name: 'MESTRE', minXP: 1200, maxXP: 1599 },
  { level: 7, name: 'LEVEL UP!', minXP: 1600, maxXP: Infinity }
];

// --- LISTA DE MEDALHAS ---
const BADGES_DEFINITIONS = [
  { id: 'detetive', name: 'DETETIVE DA PALAVRA', icon: '📖' },
  { id: 'mente', name: 'MENTE BÍBLICA', icon: '🧠' },
  { id: 'guerreiro', name: 'GUERREIRO DA ORAÇÃO', icon: '🙏' },
  { id: 'servo', name: 'CORAÇÃO DE SERVO', icon: '❤️' },
  { id: 'missionario', name: 'PEQUENO MISSIONÁRIO', icon: '🌎' },
  { id: 'firme', name: 'NÃO DESISTIU!', icon: '🔥' },
  { id: 'levelup', name: 'LEVEL UP', icon: '👑' }
];

// --- ITENS DA LOJA ---
const STORE_ITEMS = [
  { id: 'adesivo', name: 'Adesivo especial', cost: 100, icon: '⭐' },
  { id: 'lapis', name: 'Lápis personalizado', cost: 200, icon: '✏️' },
  { id: 'atividade', name: 'Escolher uma atividade', cost: 300, icon: '🎨' },
  { id: 'brinde_peq', name: 'Brinde pequeno', cost: 400, icon: '🍫' },
  { id: 'brinde_esp', name: 'Brinde especial', cost: 700, icon: '🎁' },
  { id: 'premio_max', name: 'Prêmio Level Up', cost: 1000, icon: '👑' }
];

// --- DADOS INICIAIS ---
const INITIAL_DATA = [
  {
    id: '1',
    name: 'Samuel Davi',
    avatar: '🛡️',
    totalXP: 120,
    walletXP: 120,
    weeklyXP: 40,
    missionCompleted: false,
    unlockedBadges: ['detetive'],
    history: [
      { reason: '📖 Trouxe a Bíblia', xp: 10, date: '2026-08-20' },
      { reason: '📚 Leu a Bíblia semanalmente', xp: 20, date: '2026-08-22' }
    ]
  }
];

// --- ESTADO GLOBAL ---
let state = {
  students: [],
  selectedStudentId: null
};

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
  loadDataFromStorage();
  renderStudentSelectors();

  if (state.students.length > 0) {
    state.selectedStudentId = state.students[0].id;
    loadStudentDashboard(state.selectedStudentId);
  }

  renderStore();
  renderAdminBadgesOptions();
});

// --- PERSISTÊNCIA LOCAL ---
function loadDataFromStorage() {
  const data = localStorage.getItem('LEVEL_UP_KIDS_DATA');

  if (data) {
    try {
      state.students = JSON.parse(data);
    } catch (error) {
      console.error('Erro ao carregar dados locais:', error);
      state.students = INITIAL_DATA;
      saveDataToStorage();
    }
  } else {
    state.students = INITIAL_DATA;
    saveDataToStorage();
  }
}

function saveDataToStorage() {
  localStorage.setItem(
    'LEVEL_UP_KIDS_DATA',
    JSON.stringify(state.students)
  );
}

// --- NAVEGAÇÃO ENTRE ABAS ---
function switchTab(tabId, button) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  const selectedTab = document.getElementById(tabId);

  if (selectedTab) {
    selectedTab.classList.add('active');
  }

  if (button) {
    button.classList.add('active');
  }

  if (tabId === 'store-tab') {
    renderStore();
  }

  if (tabId === 'admin-tab') {
    renderStudentSelectors();
    updateAdminView();
  }
}

// --- LÓGICA DE NÍVEIS ---
function getLevelInfo(totalXP) {
  return (
    LEVELS.find(
      level => totalXP >= level.minXP && totalXP <= level.maxXP
    ) || LEVELS[LEVELS.length - 1]
  );
}

// --- DASHBOARD DA CRIANÇA ---
function loadStudentDashboard(studentId) {
  state.selectedStudentId = studentId;

  const student = state.students.find(
    student => student.id === studentId
  );

  if (!student) return;

  const currentLevel = getLevelInfo(student.totalXP);
  const nextLevel = LEVELS.find(
    level => level.level === currentLevel.level + 1
  );

  document.getElementById('dash-avatar').textContent = student.avatar;
  document.getElementById('dash-name').textContent = student.name;

  document.getElementById('dash-title').textContent =
    `Nível ${currentLevel.level} — ${currentLevel.name}`;

  document.getElementById('dash-level-badge').textContent =
    `LVL ${currentLevel.level}`;

  document.getElementById('dash-xp-total').textContent =
    `${student.totalXP} XP`;

  document.getElementById('dash-xp-wallet').textContent =
    `⭐ ${student.walletXP} XP`;

  // --- BARRA DE XP ---
  let progressPercent = 100;

  if (nextLevel) {
    const xpInCurrentLevel =
      student.totalXP - currentLevel.minXP;

    const xpNeededForNext =
      nextLevel.minXP - currentLevel.minXP;

    progressPercent = Math.min(
      100,
      Math.floor(
        (xpInCurrentLevel / xpNeededForNext) * 100
      )
    );

    document.getElementById('dash-xp-ratio').textContent =
      `${student.totalXP} / ${nextLevel.minXP} XP`;

    document.getElementById('dash-next-level').textContent =
      `Faltam ${nextLevel.minXP - student.totalXP} XP para Nível ${nextLevel.level}`;
  } else {
    document.getElementById('dash-xp-ratio').textContent =
      `${student.totalXP} XP (MAX)`;

    document.getElementById('dash-next-level').textContent =
      `Você atingiu o Nível Máximo! 🎉`;
  }

  document.getElementById('dash-xp-progress').style.width =
    `${progressPercent}%`;

  // --- MISSÃO ---
  const missionPill =
    document.getElementById('dash-mission-status');

  if (student.missionCompleted) {
    missionPill.textContent = 'Concluída! 🎉';
    missionPill.className = 'status-pill completed';
  } else {
    missionPill.textContent = 'Em Andamento';
    missionPill.className = 'status-pill pending';
  }

  // --- MEDALHAS ---
  const badgesGrid =
    document.getElementById('dash-badges-grid');

  badgesGrid.innerHTML = '';

  BADGES_DEFINITIONS.forEach(badge => {
    const isUnlocked =
      student.unlockedBadges.includes(badge.id);

    const badgeElement =
      document.createElement('div');

    badgeElement.className =
      `badge-item ${isUnlocked ? 'unlocked' : ''}`;

    badgeElement.innerHTML = `
      <span class="badge-icon">${badge.icon}</span>
      <div class="badge-name">${badge.name}</div>
    `;

    badgesGrid.appendChild(badgeElement);
  });

  // --- HISTÓRICO ---
  const historyList =
    document.getElementById('dash-history-list');

  historyList.innerHTML = '';

  [...student.history].reverse().forEach(item => {
    const li = document.createElement('li');

    li.className = 'history-item';

    const isSpend = item.xp < 0;

    li.innerHTML = `
      <span class="reason">${item.reason}</span>
      <span class="${isSpend ? 'xp-spend' : 'xp-gain'}">
        ${isSpend ? '' : '+'}${item.xp} XP
      </span>
    `;

    historyList.appendChild(li);
  });

  // Atualiza seletores
  const dashSelector =
    document.getElementById('student-selector');

  const adminSelector =
    document.getElementById('admin-student-select');

  if (dashSelector) {
    dashSelector.value = student.id;
  }

  if (adminSelector) {
    adminSelector.value = student.id;
  }

  updateAdminView();
}

// --- SELETORES DE ALUNOS ---
function renderStudentSelectors() {
  const selectDash =
    document.getElementById('student-selector');

  const selectAdmin =
    document.getElementById('admin-student-select');

  if (!selectDash || !selectAdmin) return;

  selectDash.innerHTML = '';
  selectAdmin.innerHTML = '';

  state.students.forEach(student => {
    const optionDash =
      new Option(
        `${student.avatar} ${student.name}`,
        student.id
      );

    const optionAdmin =
      new Option(
        `${student.avatar} ${student.name}`,
        student.id
      );

    selectDash.add(optionDash);
    selectAdmin.add(optionAdmin);
  });

  if (state.selectedStudentId) {
    selectDash.value = state.selectedStudentId;
    selectAdmin.value = state.selectedStudentId;
    updateAdminView();
  }
}

function syncAdminSelection(studentId) {
  state.selectedStudentId = studentId;

  const dashboardSelector =
    document.getElementById('student-selector');

  if (dashboardSelector) {
    dashboardSelector.value = studentId;
  }

  loadStudentDashboard(studentId);
  updateAdminView();
}

function updateAdminView() {
  const student =
    state.students.find(
      student => student.id === state.selectedStudentId
    );

  if (!student) return;

  const weeklyXP =
    document.getElementById('admin-weekly-xp');

  if (weeklyXP) {
    weeklyXP.textContent =
      `${student.weeklyXP} / 150 XP`;
  }
}

// --- CONCEDER XP ---
function grantXP(
  amount,
  reason,
  isSpecialMission = false
) {
  const student =
    state.students.find(
      student => student.id === state.selectedStudentId
    );

  if (!student) {
    alert('Selecione um aluno primeiro!');
    return;
  }

  // Limite semanal das ações regulares
  if (
    !isSpecialMission &&
    student.weeklyXP + amount > 150
  ) {
    alert(
      `Limite semanal atingido! A criança já possui ${student.weeklyXP} XP na semana. O limite para ações regulares é 150 XP.`
    );

    return;
  }

  const oldLevel =
    getLevelInfo(student.totalXP);

  student.totalXP += amount;
  student.walletXP += amount;

  if (!isSpecialMission) {
    student.weeklyXP += amount;
  }

  student.history.push({
    reason: reason,
    xp: amount,
    date: new Date()
      .toISOString()
      .split('T')[0]
  });

  const newLevel =
    getLevelInfo(student.totalXP);

  if (newLevel.level > oldLevel.level) {

    if (
      !student.unlockedBadges.includes('levelup')
    ) {
      student.unlockedBadges.push('levelup');
    }

    showLevelUpModal(newLevel);
  }

  saveDataToStorage();

  loadStudentDashboard(student.id);

  updateAdminView();

  renderStore();
}

// --- COMPLETAR MISSÃO ---
function completeMission() {
  const student =
    state.students.find(
      student => student.id === state.selectedStudentId
    );

  if (!student) {
    alert('Selecione um aluno primeiro!');
    return;
  }

  if (student.missionCompleted) {
    alert(
      'Missão semanal já foi concluída por este aluno!'
    );
    return;
  }

  student.missionCompleted = true;

  grantXP(
    50,
    '🎯 Missão da Semana Concluída',
    true
  );
}

// --- MEDALHAS DO ADMIN ---
function renderAdminBadgesOptions() {
  const container =
    document.getElementById('admin-badges-list');

  if (!container) return;

  container.innerHTML = '';

  BADGES_DEFINITIONS.forEach(badge => {
    const button =
      document.createElement('button');

    button.className = 'btn-mini-badge';

    button.textContent =
      `${badge.icon} ${badge.name}`;

    button.onclick = () =>
      toggleBadge(badge.id);

    container.appendChild(button);
  });
}

function toggleBadge(badgeId) {
  const student =
    state.students.find(
      student => student.id === state.selectedStudentId
    );

  if (!student) return;

  const index =
    student.unlockedBadges.indexOf(badgeId);

  if (index > -1) {
    student.unlockedBadges.splice(index, 1);
  } else {
    student.unlockedBadges.push(badgeId);
  }

  saveDataToStorage();

  loadStudentDashboard(student.id);
}

// --- CADASTRAR ALUNO ---
function handleAddStudent(event) {
  event.preventDefault();

  const nameInput =
    document.getElementById('new-student-name');

  const avatarInput =
    document.getElementById('new-student-avatar');

  const name =
    nameInput.value.trim();

  if (!name) {
    alert('Digite o nome da criança.');
    return;
  }

  const newStudent = {
    id: Date.now().toString(),
    name: name,
    avatar: avatarInput.value,
    totalXP: 0,
    walletXP: 0,
    weeklyXP: 0,
    missionCompleted: false,
    unlockedBadges: [],
    history: []
  };

  state.students.push(newStudent);

  state.selectedStudentId =
    newStudent.id;

  saveDataToStorage();

  renderStudentSelectors();

  loadStudentDashboard(
    newStudent.id
  );

  nameInput.value = '';

  alert(
    'Aluno cadastrado com sucesso!'
  );
}

// --- LOJA ---
function renderStore() {
  const student =
    state.students.find(
      student => student.id === state.selectedStudentId
    );

  const walletAmount =
    document.getElementById(
      'store-wallet-amount'
    );

  if (walletAmount) {
    walletAmount.textContent =
      student
        ? `${student.walletXP} XP`
        : '0 XP';
  }

  const grid =
    document.getElementById('store-grid');

  if (!grid) return;

  grid.innerHTML = '';

  STORE_ITEMS.forEach(item => {

    const canAfford =
      student &&
      student.walletXP >= item.cost;

    const card =
      document.createElement('div');

    card.className =
      'store-item-card';

    card.innerHTML = `
      <div class="store-item-icon">
        ${item.icon}
      </div>

      <div class="store-item-title">
        ${item.name}
      </div>

      <div class="store-item-price">
        ⭐ ${item.cost} XP
      </div>

      <button
        class="btn ${canAfford ? 'btn-gold' : ''}"
        ${!canAfford ? 'disabled' : ''}
        onclick="buyStoreItem(
          '${item.id}',
          ${item.cost},
          '${item.name.replace(/'/g, "\\'")}'
        )"
      >
        ${canAfford
          ? 'RESGATAR 🎁'
          : 'XP INSUFICIENTE'}
      </button>
    `;

    grid.appendChild(card);
  });
}

// --- COMPRAR RECOMPENSA ---
function buyStoreItem(
  itemId,
  cost,
  itemName
) {
  const student =
    state.students.find(
      student => student.id === state.selectedStudentId
    );

  if (
    !student ||
    student.walletXP < cost
  ) {
    return;
  }

  const confirmed =
    confirm(
      `Deseja resgatar "${itemName}" por ${cost} XP?`
    );

  if (!confirmed) return;

  // Retira somente do XP disponível
  student.walletXP -= cost;

  student.history.push({
    reason:
      `🛍️ Resgate: ${itemName}`,
    xp: -cost,
    date: new Date()
      .toISOString()
      .split('T')[0]
  });

  saveDataToStorage();

  loadStudentDashboard(student.id);

  renderStore();

  alert(
    'Recompensa resgatada! Mostre este aviso ao seu professor! 🎉'
  );
}

// --- MODAL LEVEL UP ---
function showLevelUpModal(levelInfo) {
  document.getElementById(
    'modal-new-level'
  ).textContent =
    `NÍVEL ${levelInfo.level}`;

  document.getElementById(
    'modal-level-name'
  ).textContent =
    levelInfo.name;

  document.getElementById(
    'levelup-modal'
  ).classList.add('active');
}

function closeLevelUpModal() {
  document.getElementById(
    'levelup-modal'
  ).classList.remove('active');
}
