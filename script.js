/* ==========================================================================
   LEVEL UP KIDS - CORE APPLICATION LOGIC
   ========================================================================== */
const SUPABASE_URL = 'https://pukhhtefxjotjvgyaiwc.supabase.co/rest/v1/';
const SUPABASE_KEY = 'sb_publishable_YNkkUU6LFxFIQrXF8XHN9g_zK_zXy7b';

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
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

// --- LISTA DE MEDALHAS DO SISTEMA ---
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

// --- DADOS INICIAIS (SEED) ---
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

// --- ESTADO GLOBAL DA APLICAÇÃO ---
let state = {
  students: [],
  selectedStudentId: null
};

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', async () => {
  await loadDataFromStorage();
  renderStudentSelectors();
  if (state.students.length > 0) {
    state.selectedStudentId = state.students[0].id;
    loadStudentDashboard(state.selectedStudentId);
  }
  renderStore();
  renderAdminBadgesOptions();
});


// --- PERSISTÊNCIA ONLINE (SUPABASE) ---

async function loadDataFromStorage() {
  const { data, error } = await supabaseClient
    .from('students')
    .select('*');

  if (error) {
    console.error('Erro ao carregar alunos:', error);
    alert('ERRO SUPABASE: ' + error.message);
    return;
  }

  if (data && data.length > 0) {
    state.students = data.map(student => ({
      id: student.id,
      name: student.name,
      avatar: student.avatar,
      totalXP: student.total_xp || 0,
      walletXP: student.wallet_xp || 0,
      weeklyXP: student.weekly_xp || 0,
      missionCompleted: student.mission_completed || false,
      unlockedBadges: student.unlocked_badges || [],
      history: student.history || []
    }));

    return;
  }

  for (const student of INITIAL_DATA) {
    await saveStudentToSupabase(student);
  }

  state.students = [...INITIAL_DATA];
}

async function saveDataToStorage() {
  for (const student of state.students) {
    await saveStudentToSupabase(student);
  }
}

async function saveStudentToSupabase(student) {
  const { error } = await supabaseClient
    .from('students')
    .upsert({
      id: student.id,
      name: student.name,
      avatar: student.avatar,
      total_xp: student.totalXP,
      wallet_xp: student.walletXP,
      weekly_xp: student.weeklyXP,
      mission_completed: student.missionCompleted,
      unlocked_badges: student.unlockedBadges,
      history: student.history
    });

  if (error) {
    console.error('Erro ao salvar aluno:', error);
  }
}

// --- NAVEGAÇÃO ENTRE ABAS ---
function switchTab(tabId, button) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  
  document.getElementById(tabId).classList.add('active');
  button.classList.add('active');

  if (tabId === 'store-tab') renderStore();
}

// --- LÓGICA DE NÍVEIS ---
function getLevelInfo(totalXP) {
  return LEVELS.find(l => totalXP >= l.minXP && totalXP <= l.maxXP) || LEVELS[LEVELS.length - 1];
}

// --- RENDERIZAR DASHBOARD DA CRIANÇA ---
function loadStudentDashboard(studentId) {
  state.selectedStudentId = studentId;
  const student = state.students.find(s => s.id === studentId);
  if (!student) return;

  const currentLevel = getLevelInfo(student.totalXP);
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);

  // Atualizar Infos básicas
  document.getElementById('dash-avatar').textContent = student.avatar;
  document.getElementById('dash-name').textContent = student.name;
  document.getElementById('dash-title').textContent = `Nível ${currentLevel.level} — ${currentLevel.name}`;
  document.getElementById('dash-level-badge').textContent = `LVL ${currentLevel.level}`;
  
  document.getElementById('dash-xp-total').textContent = `${student.totalXP} XP`;
  document.getElementById('dash-xp-wallet').textContent = `⭐ ${student.walletXP} XP`;

  // Calcular progresso para a barra
  let progressPercent = 100;
  if (nextLevel) {
    const xpInCurrentLevel = student.totalXP - currentLevel.minXP;
    const xpNeededForNext = nextLevel.minXP - currentLevel.minXP;
    progressPercent = Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForNext) * 100));
    document.getElementById('dash-xp-ratio').textContent = `${student.totalXP} / ${nextLevel.minXP} XP`;
    document.getElementById('dash-next-level').textContent = `Faltam ${nextLevel.minXP - student.totalXP} XP para Nível ${nextLevel.level}`;
  } else {
    document.getElementById('dash-xp-ratio').textContent = `${student.totalXP} XP (MAX)`;
    document.getElementById('dash-next-level').textContent = `Você atingiu o Nível Máximo! 🎉`;
  }
  document.getElementById('dash-xp-progress').style.width = `${progressPercent}%`;

  // Status da Missão
  const missionPill = document.getElementById('dash-mission-status');
  if (student.missionCompleted) {
    missionPill.textContent = 'Concluída! 🎉';
    missionPill.className = 'status-pill completed';
  } else {
    missionPill.textContent = 'Em Andamento';
    missionPill.className = 'status-pill pending';
  }

  // Renderizar Medalhas
  const badgesGrid = document.getElementById('dash-badges-grid');
  badgesGrid.innerHTML = '';
  BADGES_DEFINITIONS.forEach(badge => {
    const isUnlocked = student.unlockedBadges.includes(badge.id);
    const badgeEl = document.createElement('div');
    badgeEl.className = `badge-item ${isUnlocked ? 'unlocked' : ''}`;
    badgeEl.innerHTML = `
      <span class="badge-icon">${badge.icon}</span>
      <div class="badge-name">${badge.name}</div>
    `;
    badgesGrid.appendChild(badgeEl);
  });

  // Renderizar Histórico
  const historyList = document.getElementById('dash-history-list');
  historyList.innerHTML = '';
  [...student.history].reverse().forEach(item => {
    const li = document.createElement('li');
    li.className = 'history-item';
    const isSpend = item.xp < 0;
    li.innerHTML = `
      <span class="reason">${item.reason}</span>
      <span class="${isSpend ? 'xp-spend' : 'xp-gain'}">${isSpend ? '' : '+'}${item.xp} XP</span>
    `;
    historyList.appendChild(li);
  });
}

// --- RENDERIZAR SELETORES DO ADMIN E DASHBOARD ---
function renderStudentSelectors() {
  const selectDash = document.getElementById('student-selector');
  const selectAdmin = document.getElementById('admin-student-select');

  selectDash.innerHTML = '';
  selectAdmin.innerHTML = '';

  state.students.forEach(s => {
    const opt1 = new Option(`${s.avatar} ${s.name}`, s.id);
    const opt2 = new Option(`${s.avatar} ${s.name}`, s.id);
    selectDash.add(opt1);
    selectAdmin.add(opt2);
  });

  if (state.selectedStudentId) {
    selectDash.value = state.selectedStudentId;
    selectAdmin.value = state.selectedStudentId;
    updateAdminView();
  }
}

function syncAdminSelection(studentId) {
  state.selectedStudentId = studentId;
  document.getElementById('student-selector').value = studentId;
  loadStudentDashboard(studentId);
  updateAdminView();
}

function updateAdminView() {
  const student = state.students.find(s => s.id === state.selectedStudentId);
  if (student) {
    document.getElementById('admin-weekly-xp').textContent = `${student.weeklyXP} / 150 XP`;
  }
}

// --- CONCESSÃO DE XP (LÓGICA PRINCIPAL) ---
function grantXP(amount, reason, isSpecialMission = false) {
  const student = state.students.find(s => s.id === state.selectedStudentId);
  if (!student) return alert('Selecione um aluno primeiro!');

  // Validação de limite de 150 XP semanal em atividades regulares
  if (!isSpecialMission && (student.weeklyXP + amount > 150)) {
    return alert(`Limite semanal atingido! A criança já possui ${student.weeklyXP} XP na semana. O limite para ações regulares é 150 XP.`);
  }

  const oldLevel = getLevelInfo(student.totalXP);

  // Aplicação dos valores
  student.totalXP += amount;
  student.walletXP += amount;
  if (!isSpecialMission) student.weeklyXP += amount;

  // Registrar Histórico
  student.history.push({
    reason: reason,
    xp: amount,
    date: new Date().toISOString().split('T')[0]
  });

  // Verificar Level Up
  const newLevel = getLevelInfo(student.totalXP);
  if (newLevel.level > oldLevel.level) {
    // Auto-desbloquear a medalha LEVEL UP
    if (!student.unlockedBadges.includes('levelup')) {
      student.unlockedBadges.push('levelup');
    }
    showLevelUpModal(newLevel);
  }

  saveDataToStorage();
  loadStudentDashboard(student.id);
  updateAdminView();
}

// --- COMPLETAR MISSÃO ---
function completeMission() {
  const student = state.students.find(s => s.id === state.selectedStudentId);
  if (!student) return;
  if (student.missionCompleted) return alert('Missão semanal já foi concluída por este aluno!');

  student.missionCompleted = true;
  grantXP(50, '🎯 Missão da Semana Concluída', true);
}

// --- GERENCIAMENTO DE MEDALHAS NO ADMIN ---
function renderAdminBadgesOptions() {
  const container = document.getElementById('admin-badges-list');
  container.innerHTML = '';
  BADGES_DEFINITIONS.forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'btn-mini-badge';
    btn.textContent = `${b.icon} ${b.name}`;
    btn.onclick = () => toggleBadge(b.id);
    container.appendChild(btn);
  });
}

function toggleBadge(badgeId) {
  const student = state.students.find(s => s.id === state.selectedStudentId);
  if (!student) return;

  const index = student.unlockedBadges.indexOf(badgeId);
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
  const nameInput = document.getElementById('new-student-name');
  const avatarInput = document.getElementById('new-student-avatar');

  const newStudent = {
    id: Date.now().toString(),
    name: nameInput.value.trim(),
    avatar: avatarInput.value,
    totalXP: 0,
    walletXP: 0,
    weeklyXP: 0,
    missionCompleted: false,
    unlockedBadges: [],
    history: []
  };

  state.students.push(newStudent);
  saveDataToStorage();
  renderStudentSelectors();
  loadStudentDashboard(newStudent.id);

  nameInput.value = '';
  alert('Aluno cadastrado com sucesso!');
}

// --- LOJA DE RECOMPENSAS ---
function renderStore() {
  const student = state.students.find(s => s.id === state.selectedStudentId);
  const walletAmountEl = document.getElementById('store-wallet-amount');
  walletAmountEl.textContent = student ? `${student.walletXP} XP` : '0 XP';

  const grid = document.getElementById('store-grid');
  grid.innerHTML = '';

  STORE_ITEMS.forEach(item => {
    const canAfford = student && student.walletXP >= item.cost;
    const card = document.createElement('div');
    card.className = 'store-item-card';
    card.innerHTML = `
      <div class="store-item-icon">${item.icon}</div>
      <div class="store-item-title">${item.name}</div>
      <div class="store-item-price">⭐ ${item.cost} XP</div>
      <button class="btn ${canAfford ? 'btn-gold' : ''}" 
              ${!canAfford ? 'disabled' : ''} 
              onclick="buyStoreItem('${item.id}', ${item.cost}, '${item.name}')">
        ${canAfford ? 'RESGATAR 🎁' : 'XP INSUFICIENTE'}
      </button>
    `;
    grid.appendChild(card);
  });
}

function buyStoreItem(itemId, cost, itemName) {
  const student = state.students.find(s => s.id === state.selectedStudentId);
  if (!student || student.walletXP < cost) return;

  if (confirm(`Deseja resgatar "${itemName}" por ${cost} XP?`)) {
    // Diminui APENAS o XP Disponível (walletXP)
    student.walletXP -= cost;
    
    student.history.push({
      reason: `🛍️ Resgate: ${itemName}`,
      xp: -cost,
      date: new Date().toISOString().split('T')[0]
    });

    saveDataToStorage();
    loadStudentDashboard(student.id);
    renderStore();
    alert('Recompensa resgatada! Mostre este aviso ao seu professor! 🎉');
  }
}

// --- MODAL DE LEVEL UP ---
function showLevelUpModal(levelInfo) {
  document.getElementById('modal-new-level').textContent = `NÍVEL ${levelInfo.level}`;
  document.getElementById('modal-level-name').textContent = levelInfo.name;
  document.getElementById('levelup-modal').classList.add('active');
}

function closeLevelUpModal() {
  document.getElementById('levelup-modal').classList.remove('active');
}
