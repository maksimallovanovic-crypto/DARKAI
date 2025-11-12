// Элементы
const authScreen = document.getElementById('auth-screen');
const mainApp = document.getElementById('main-app');
const usernameInput = document.getElementById('usernameInput');
const loginBtn = document.getElementById('loginBtn');
const usernameDisplay = document.getElementById('usernameDisplay');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const onlineCount = document.getElementById('onlineCount');
const onlineList = document.getElementById('onlineList');
const profileName = document.getElementById('profileName');
const profileStatus = document.getElementById('profileStatus');
const profileRequests = document.getElementById('profileRequests');
const profileBanner = document.getElementById('profileBanner');
const profileAvatar = document.getElementById('profileAvatar');
const editProfileBtn = document.getElementById('editProfileBtn');
const editModal = document.getElementById('editModal');
const closeModal = document.getElementById('closeModal');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const avatarInput = document.getElementById('avatarInput');
const bannerInput = document.getElementById('bannerInput');
const colorInput = document.getElementById('colorInput');
const requestsUsedEl = document.getElementById('requestsUsed');
const requestsMaxEl = document.getElementById('requestsMax');

// 🔐 OpenAI
const OPENAI_API_KEY = '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';

// Данные
let currentUser = null;
let requestsUsed = 0;
let totalRequests = 50;
let onlineUsers = [];

// === Логика ===

// Проверка входа
function checkAuth() {
  const saved = localStorage.getItem('darkai-user');
  if (saved) {
    currentUser = JSON.parse(saved);
    showMainApp();
  } else {
    showAuth();
  }
}

loginBtn.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  if (!name) return alert('Введите ник!');
  currentUser = { name, status: 'Гость', avatar: '👤', banner: '', color: '#10a37f', requests: 50 };
  localStorage.setItem('darkai-user', JSON.stringify(currentUser));
  showMainApp();
});

function showAuth() {
  authScreen.style.display = 'flex';
  mainApp.style.display = 'none';
}

function showMainApp() {
  authScreen.style.display = 'none';
  mainApp.style.display = 'flex';
  loadUserData();
  updateUserCard();
  startOnlineUpdate();
}

function loadUserData() {
  const statuses = JSON.parse(localStorage.getItem('user-statuses')) || {};
  const saved = JSON.parse(localStorage.getItem('darkai-user'));
  if (!saved) return;

  currentUser = saved;
  currentUser.status = statuses[currentUser.name] || 'Гость';

  // Лимиты
  const multipliers = { Гость: 1, Afun: 10, VIP: 4, Эксклюзив: 100, Админ: 1000 };
  totalRequests = currentUser.status === 'Админ' ? Infinity : 50 * multipliers[currentUser.status];
  requestsMaxEl.textContent = totalRequests === Infinity ? '∞' : totalRequests;
  requestsUsedEl.textContent = requestsUsed;

  updateUserCard();
}

function updateUserCard() {
  profileName.textContent = currentUser.name;
  profileStatus.textContent = currentUser.status;
  profileStatus.className = 'status-tag ' + currentUser.status.toLowerCase();
  profileRequests.textContent = totalRequests === Infinity ? '∞' : totalRequests;

  if (currentUser.banner) {
    profileBanner.style.backgroundImage = `url(${currentUser.banner})`;
    profileBanner.style.backgroundSize = 'cover';
    profileBanner.innerHTML = '';
  }
  if (currentUser.avatar && !currentUser.avatar.includes('http')) {
    profileAvatar.innerHTML = currentUser.avatar;
  }
  if (currentUser.avatar && currentUser.avatar.includes('http')) {
    profileAvatar.innerHTML = `<img src="${currentUser.avatar}" alt="avatar">`;
  }
  document.body.style.setProperty('--accent', currentUser.color);
}

// Вкладки
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
    if (tab.dataset.tab === 'online') updateOnlineList();
  });
});

// Онлайн
function startOnlineUpdate() {
  setInterval(() => {
    const users = [{ name: currentUser.name, status: currentUser.status, avatar: currentUser.avatar }];
    onlineUsers = users;
    updateOnlineList();
    onlineCount.textContent = onlineUsers.length;
  }, 3000);
}

function updateOnlineList() {
  onlineList.innerHTML = '';
  onlineUsers.forEach(user => {
    const el = document.createElement('div');
    el.classList.add('online-user');
    el.innerHTML = `
      <div class="online-avatar">${user.avatar.includes('http') ? `<img src="${user.avatar}" alt="">` : user.avatar}</div>
      <div>${user.name} <small>(${user.status})</small></div>
    `;
    el.addEventListener('click', () => openProfileModal(user));
    onlineList.appendChild(el);
  });
}

function openProfileModal(user) {
  alert(`Профиль: ${user.name}\nСтатус: ${user.status}`);
}

// Редактирование профиля
editProfileBtn.addEventListener('click', () => {
  avatarInput.value = currentUser.avatar || '';
  bannerInput.value = currentUser.banner || '';
  colorInput.value = currentUser.color || '#10a37f';
  editModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
  editModal.style.display = 'none';
});

saveProfileBtn.addEventListener('click', () => {
  currentUser.avatar = avatarInput.value || '👤';
  currentUser.banner = bannerInput.value;
  currentUser.color = colorInput.value;
  localStorage.setItem('darkai-user', JSON.stringify(currentUser));
  updateUserCard();
  editModal.style.display = 'none';
});

// Чат
sendBtn.addEventListener('click', sendMessage);

async function sendMessage() {
  if (requestsUsed >= totalRequests && totalRequests !== Infinity) {
    addMessage('❌ Лимит запросов исчерпан. Купите донат для увеличения.', 'bot');
    return;
  }

  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  userInput.value = '';
  requestsUsed++;
  requestsUsedEl.textContent = requestsUsed;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: text }],
        max_tokens: 500
      })
    });

    if (response.status === 401) {
      addMessage('❌ Ошибка: Неверный API-ключ', 'bot');
      return;
    }

    const data = await response.json();
    addMessage(data.choices[0].message.content, 'bot');
  } catch (error) {
    addMessage('🌐 Ошибка сети. Проверь интернет.', 'bot');
  }
}

function addMessage(text, sender) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

userInput.addEventListener('input', () => {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
});

// Инициализация
checkAuth();
