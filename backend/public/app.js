// API Configuration
const API_BASE_URL = '/api/v1';

// State Management
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const registerScreen = document.getElementById('registerScreen');
const dashboard = document.getElementById('dashboard');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  if (authToken) {
    loadDashboard();
  } else {
    showLogin();
  }

  setupEventListeners();
});

// Event Listeners Setup
function setupEventListeners() {
  // Auth Forms
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('registerForm').addEventListener('submit', handleRegister);
  document.getElementById('showRegister').addEventListener('click', showRegister);
  document.getElementById('showLogin').addEventListener('click', showLogin);
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

  // Navigation
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const view = e.currentTarget.dataset.view;
      switchView(view);
    });
  });

  // Create Buttons
  document.getElementById('createAccountBtn')?.addEventListener('click', () => openCreateModal('account'));
  document.getElementById('createBookmarkBtn')?.addEventListener('click', () => openCreateModal('bookmark'));
  document.getElementById('createPnlBtn')?.addEventListener('click', () => openCreateModal('pnl'));
  document.getElementById('createPlatformBtn')?.addEventListener('click', () => openCreateModal('platform'));
}

// Authentication
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) throw new Error('Login failed');

    const data = await response.json();
    authToken = data.accessToken;
    currentUser = data.user;
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    loadDashboard();
  } catch (error) {
    alert('Login failed. Please check your credentials.');
    console.error(error);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const firstName = document.getElementById('registerFirstName').value;
  const lastName = document.getElementById('registerLastName').value;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName })
    });

    if (!response.ok) throw new Error('Registration failed');

    const data = await response.json();
    authToken = data.accessToken;
    currentUser = data.user;
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    loadDashboard();
  } catch (error) {
    alert('Registration failed. Email may already be in use.');
    console.error(error);
  }
}

function handleLogout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  showLogin();
}

function showLogin() {
  loginScreen.classList.remove('hidden');
  registerScreen.classList.add('hidden');
  dashboard.classList.add('hidden');
}

function showRegister() {
  loginScreen.classList.add('hidden');
  registerScreen.classList.remove('hidden');
  dashboard.classList.add('hidden');
}

// Dashboard
async function loadDashboard() {
  loginScreen.classList.add('hidden');
  registerScreen.classList.add('hidden');
  dashboard.classList.remove('hidden');

  // Load user from storage if not set
  if (!currentUser) {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  // Update user info in sidebar
  if (currentUser) {
    const initials = (currentUser.firstName?.[0] || '') + (currentUser.lastName?.[0] || 'U');
    document.getElementById('userInitials').textContent = initials;
    document.getElementById('userName').textContent = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'User';
    document.getElementById('userEmail').textContent = currentUser.email;
  }

  // Load initial view
  loadOverview();
}

// View Switching
function switchView(viewName) {
  // Update nav buttons
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('active', 'text-emerald-500', 'bg-emerald-500/10');
    btn.classList.add('text-gray-400');
  });

  const activeBtn = document.querySelector(`[data-view="${viewName}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active', 'text-emerald-500', 'bg-emerald-500/10');
    activeBtn.classList.remove('text-gray-400');
  }

  // Hide all views
  document.querySelectorAll('.view-content').forEach(view => {
    view.classList.add('hidden');
  });

  // Show selected view and load data
  switch(viewName) {
    case 'overview':
      document.getElementById('overviewView').classList.remove('hidden');
      loadOverview();
      break;
    case 'accounts':
      document.getElementById('accountsView').classList.remove('hidden');
      loadAccounts();
      break;
    case 'bookmarks':
      document.getElementById('bookmarksView').classList.remove('hidden');
      loadBookmarks();
      break;
    case 'pnl':
      document.getElementById('pnlView').classList.remove('hidden');
      loadPNL();
      break;
    case 'platforms':
      document.getElementById('platformsView').classList.remove('hidden');
      loadPlatforms();
      break;
  }
}

// API Calls
async function apiCall(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      ...options.headers
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleLogout();
      throw new Error('Unauthorized');
    }
    throw new Error('API call failed');
  }

  return response.json();
}

// Load Overview
async function loadOverview() {
  try {
    const [accounts, analytics] = await Promise.all([
      apiCall('/accounts'),
      apiCall('/pnl/analytics').catch(() => ({ summary: { totalPnl: 0, totalRealized: 0, totalUnrealized: 0, winRate: 0 } }))
    ]);

    // Calculate total balance
    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.totalBalance || 0), 0);
    const availableBalance = accounts.reduce((sum, acc) => sum + Number(acc.availableBalance || 0), 0);

    // Render stats
    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = `
      <div class="glass-card rounded-2xl p-6 stat-card">
        <div class="flex items-center justify-between mb-4">
          <p class="text-gray-400 text-sm font-medium">Total Balance</p>
          <div class="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
        <p class="text-3xl font-bold mb-1">$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p class="text-sm text-gray-500">Across ${accounts.length} account${accounts.length !== 1 ? 's' : ''}</p>
      </div>

      <div class="glass-card rounded-2xl p-6 stat-card">
        <div class="flex items-center justify-between mb-4">
          <p class="text-gray-400 text-sm font-medium">Available</p>
          <div class="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
        <p class="text-3xl font-bold mb-1">$${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p class="text-sm text-gray-500">Ready to trade</p>
      </div>

      <div class="glass-card rounded-2xl p-6 stat-card">
        <div class="flex items-center justify-between mb-4">
          <p class="text-gray-400 text-sm font-medium">Total PNL</p>
          <div class="w-10 h-10 rounded-lg bg-${analytics.summary.totalPnl >= 0 ? 'emerald' : 'red'}-500/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-${analytics.summary.totalPnl >= 0 ? 'emerald' : 'red'}-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
        </div>
        <p class="text-3xl font-bold mb-1 ${analytics.summary.totalPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}">
          ${analytics.summary.totalPnl >= 0 ? '+' : ''}$${Number(analytics.summary.totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p class="text-sm text-gray-500">All time</p>
      </div>

      <div class="glass-card rounded-2xl p-6 stat-card">
        <div class="flex items-center justify-between mb-4">
          <p class="text-gray-400 text-sm font-medium">Win Rate</p>
          <div class="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
          </div>
        </div>
        <p class="text-3xl font-bold mb-1">${analytics.summary.winRate || 0}%</p>
        <p class="text-sm text-gray-500">${analytics.summary.totalTrades || 0} total trades</p>
      </div>
    `;

    // Recent activity placeholder
    document.getElementById('recentActivity').innerHTML = `
      <div class="text-center py-12 text-gray-500">
        <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p>No recent activity</p>
      </div>
    `;
  } catch (error) {
    console.error('Failed to load overview:', error);
  }
}

// Load Accounts
async function loadAccounts() {
  try {
    const accounts = await apiCall('/accounts');
    const accountsList = document.getElementById('accountsList');

    if (accounts.length === 0) {
      accountsList.innerHTML = `
        <div class="glass-card rounded-2xl p-12 text-center">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
          </svg>
          <p class="text-gray-400 mb-4">No accounts yet</p>
          <button onclick="openCreateModal('account')" class="btn-primary">Create Your First Account</button>
        </div>
      `;
      return;
    }

    accountsList.innerHTML = accounts.map(account => `
      <div class="glass-card rounded-2xl p-6 hover:border-emerald-500">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-xl font-bold mb-1">${account.name}</h3>
            <span class="status-badge ${account.isActive ? 'status-active' : 'status-inactive'}">
              ${account.type}
            </span>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-emerald-500">$${Number(account.totalBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            <p class="text-sm text-gray-500">Total Balance</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
          <div>
            <p class="text-sm text-gray-400 mb-1">Available</p>
            <p class="font-semibold">$${Number(account.availableBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p class="text-sm text-gray-400 mb-1">Locked</p>
            <p class="font-semibold">$${Number(account.lockedBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div class="mt-4 flex gap-2">
          <button onclick="viewAccountDetails('${account.id}')" class="flex-1 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors text-sm font-medium">
            View Details
          </button>
          <button onclick="deleteAccount('${account.id}')" class="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium">
            Delete
          </button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Failed to load accounts:', error);
  }
}

// Load Bookmarks
async function loadBookmarks() {
  try {
    const bookmarks = await apiCall('/bookmarks');
    const bookmarksList = document.getElementById('bookmarksList');

    if (bookmarks.length === 0) {
      bookmarksList.innerHTML = `
        <div class="glass-card rounded-2xl p-12 text-center col-span-full">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
          </svg>
          <p class="text-gray-400 mb-4">No bookmarks yet</p>
          <button onclick="openCreateModal('bookmark')" class="btn-primary">Add Your First Bookmark</button>
        </div>
      `;
      return;
    }

    bookmarksList.innerHTML = bookmarks.map(bookmark => `
      <div class="glass-card rounded-2xl p-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-xl font-bold mb-1">${bookmark.symbol}</h3>
            <p class="text-sm text-gray-400">${bookmark.name}</p>
          </div>
          <button onclick="deleteBookmark('${bookmark.id}')" class="text-gray-500 hover:text-red-500 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
        ${bookmark.notes ? `<p class="text-sm text-gray-300 mb-4">${bookmark.notes}</p>` : ''}
        ${bookmark.metadata?.tags ? `
          <div class="flex flex-wrap gap-2">
            ${bookmark.metadata.tags.map(tag => `
              <span class="px-3 py-1 bg-cyan-500/20 text-cyan-500 rounded-full text-xs font-medium">${tag}</span>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');
  } catch (error) {
    console.error('Failed to load bookmarks:', error);
  }
}

// Load PNL
async function loadPNL() {
  try {
    const [analytics, records] = await Promise.all([
      apiCall('/pnl/analytics'),
      apiCall('/pnl')
    ]);

    // Render analytics
    const analyticsEl = document.getElementById('pnlAnalytics');
    analyticsEl.innerHTML = `
      <h2 class="text-xl font-bold mb-6">Summary</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <p class="text-sm text-gray-400 mb-2">Total PNL</p>
          <p class="text-2xl font-bold ${analytics.summary.totalPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}">
            ${analytics.summary.totalPnl >= 0 ? '+' : ''}$${Number(analytics.summary.totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-400 mb-2">Realized</p>
          <p class="text-2xl font-bold ${analytics.summary.totalRealized >= 0 ? 'text-emerald-500' : 'text-red-500'}">
            ${analytics.summary.totalRealized >= 0 ? '+' : ''}$${Number(analytics.summary.totalRealized).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-400 mb-2">Unrealized</p>
          <p class="text-2xl font-bold ${analytics.summary.totalUnrealized >= 0 ? 'text-emerald-500' : 'text-red-500'}">
            ${analytics.summary.totalUnrealized >= 0 ? '+' : ''}$${Number(analytics.summary.totalUnrealized).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-400 mb-2">Win Rate</p>
          <p class="text-2xl font-bold">${analytics.summary.winRate || 0}%</p>
          <p class="text-xs text-gray-500 mt-1">${analytics.summary.winningTrades || 0}W / ${analytics.summary.losingTrades || 0}L</p>
        </div>
      </div>
    `;

    // Render records
    const recordsList = document.getElementById('pnlRecordsList');
    if (records.length === 0) {
      recordsList.innerHTML = `
        <div class="text-center py-12 text-gray-500">
          <p>No PNL records yet</p>
        </div>
      `;
      return;
    }

    recordsList.innerHTML = `
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-800">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">Symbol</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-400">Amount</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-400">%</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-400">Date</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${records.map(record => `
              <tr class="table-row">
                <td class="py-4 px-4 font-medium">${record.symbol}</td>
                <td class="py-4 px-4">
                  <span class="status-badge ${record.type === 'realized' ? 'status-active' : 'status-inactive'}">
                    ${record.type}
                  </span>
                </td>
                <td class="py-4 px-4 text-right font-semibold ${Number(record.amount) >= 0 ? 'text-emerald-500' : 'text-red-500'}">
                  ${Number(record.amount) >= 0 ? '+' : ''}$${Number(record.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td class="py-4 px-4 text-right ${Number(record.percentage) >= 0 ? 'text-emerald-500' : 'text-red-500'}">
                  ${record.percentage ? `${Number(record.percentage) >= 0 ? '+' : ''}${Number(record.percentage).toFixed(2)}%` : '-'}
                </td>
                <td class="py-4 px-4 text-right text-sm text-gray-400">
                  ${new Date(record.timestamp).toLocaleDateString()}
                </td>
                <td class="py-4 px-4 text-right">
                  <button onclick="deletePnlRecord('${record.id}')" class="text-red-500 hover:text-red-400 text-sm">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (error) {
    console.error('Failed to load PNL:', error);
  }
}

// Load Platforms
async function loadPlatforms() {
  try {
    const platforms = await apiCall('/platforms');
    const platformsList = document.getElementById('platformsList');

    if (platforms.length === 0) {
      platformsList.innerHTML = `
        <div class="glass-card rounded-2xl p-12 text-center col-span-full">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <p class="text-gray-400 mb-4">No platforms connected</p>
          <button onclick="openCreateModal('platform')" class="btn-primary">Connect Your First Platform</button>
        </div>
      `;
      return;
    }

    platformsList.innerHTML = platforms.map(platform => `
      <div class="glass-card rounded-2xl p-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-xl font-bold mb-1">${platform.name}</h3>
            <p class="text-sm text-gray-400 mb-2">${platform.platform.toUpperCase()}</p>
            <span class="status-badge ${platform.isActive ? 'status-active' : 'status-inactive'}">
              ${platform.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        ${platform.lastSyncedAt ? `
          <p class="text-sm text-gray-500 mb-4">
            Last synced: ${new Date(platform.lastSyncedAt).toLocaleString()}
          </p>
        ` : ''}
        <div class="flex gap-2">
          <button onclick="syncPlatform('${platform.id}')" class="flex-1 px-4 py-2 bg-cyan-500/10 text-cyan-500 rounded-lg hover:bg-cyan-500/20 transition-colors text-sm font-medium">
            Sync Now
          </button>
          <button onclick="deletePlatform('${platform.id}')" class="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium">
            Delete
          </button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Failed to load platforms:', error);
  }
}

// Create Modals
function openCreateModal(type) {
  const modals = {
    account: createAccountModal,
    bookmark: createBookmarkModal,
    pnl: createPnlModal,
    platform: createPlatformModal
  };

  if (modals[type]) {
    modals[type]();
  }
}

function createAccountModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="glass-card rounded-2xl p-8 max-w-md w-full animate-fade-in">
      <h2 class="text-2xl font-bold mb-6">Create Account</h2>
      <form id="createAccountForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">Account Name</label>
          <input type="text" name="name" class="input-luxury w-full" placeholder="Main Account" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">Type</label>
          <select name="type" class="input-luxury w-full" required>
            <option value="spot">Spot</option>
            <option value="futures">Futures</option>
            <option value="margin">Margin</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">Currency (optional)</label>
          <input type="text" name="currency" class="input-luxury w-full" placeholder="USD" />
        </div>
        <div class="flex gap-3 mt-6">
          <button type="submit" class="btn-primary flex-1">Create</button>
          <button type="button" onclick="this.closest('.modal-overlay').remove()" class="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      await apiCall('/accounts', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      modal.remove();
      loadAccounts();
    } catch (error) {
      alert('Failed to create account');
      console.error(error);
    }
  });
}

function createBookmarkModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="glass-card rounded-2xl p-8 max-w-md w-full animate-fade-in">
      <h2 class="text-2xl font-bold mb-6">Add Bookmark</h2>
      <form id="createBookmarkForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">Symbol</label>
          <input type="text" name="symbol" class="input-luxury w-full" placeholder="BTCUSDT" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">Name</label>
          <input type="text" name="name" class="input-luxury w-full" placeholder="Bitcoin" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">Notes (optional)</label>
          <textarea name="notes" class="input-luxury w-full" rows="3" placeholder="Your analysis..."></textarea>
        </div>
        <div class="flex gap-3 mt-6">
          <button type="submit" class="btn-primary flex-1">Add Bookmark</button>
          <button type="button" onclick="this.closest('.modal-overlay').remove()" class="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      await apiCall('/bookmarks', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      modal.remove();
      loadBookmarks();
    } catch (error) {
      alert('Failed to create bookmark');
      console.error(error);
    }
  });
}

function createPnlModal() {
  // First get accounts for the dropdown
  apiCall('/accounts').then(accounts => {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="glass-card rounded-2xl p-8 max-w-md w-full animate-fade-in max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-6">Add PNL Record</h2>
        <form id="createPnlForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-300">Account</label>
            <select name="accountId" class="input-luxury w-full" required>
              <option value="">Select account</option>
              ${accounts.map(acc => `<option value="${acc.id}">${acc.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-300">Symbol</label>
            <input type="text" name="symbol" class="input-luxury w-full" placeholder="BTCUSDT" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-300">Type</label>
            <select name="type" class="input-luxury w-full" required>
              <option value="realized">Realized</option>
              <option value="unrealized">Unrealized</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-300">Amount ($)</label>
            <input type="number" step="0.01" name="amount" class="input-luxury w-full" placeholder="1250.50" required />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-300">Percentage (%)</label>
            <input type="number" step="0.01" name="percentage" class="input-luxury w-full" placeholder="5.2" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-300">Entry Price</label>
            <input type="number" step="0.01" name="entryPrice" class="input-luxury w-full" placeholder="43000" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-300">Exit Price</label>
            <input type="number" step="0.01" name="exitPrice" class="input-luxury w-full" placeholder="45000" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2 text-gray-300">Quantity</label>
            <input type="number" step="0.00000001" name="quantity" class="input-luxury w-full" placeholder="0.5" />
          </div>
          <div class="flex gap-3 mt-6">
            <button type="submit" class="btn-primary flex-1">Add Record</button>
            <button type="button" onclick="this.closest('.modal-overlay').remove()" class="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);

      // Convert numeric fields
      ['amount', 'percentage', 'entryPrice', 'exitPrice', 'quantity'].forEach(field => {
        if (data[field]) data[field] = parseFloat(data[field]);
      });

      try {
        await apiCall('/pnl', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        modal.remove();
        loadPNL();
      } catch (error) {
        alert('Failed to create PNL record');
        console.error(error);
      }
    });
  });
}

function createPlatformModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="glass-card rounded-2xl p-8 max-w-md w-full animate-fade-in">
      <h2 class="text-2xl font-bold mb-6">Connect Platform</h2>
      <form id="createPlatformForm" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">Platform</label>
          <select name="platform" class="input-luxury w-full" required>
            <option value="binance">Binance</option>
            <option value="coinbase">Coinbase</option>
            <option value="kraken">Kraken</option>
            <option value="bybit">Bybit</option>
            <option value="okx">OKX</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">Name</label>
          <input type="text" name="name" class="input-luxury w-full" placeholder="My Binance Account" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">API Key</label>
          <input type="text" name="apiKey" class="input-luxury w-full" placeholder="Your API key" required />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2 text-gray-300">API Secret</label>
          <input type="password" name="apiSecret" class="input-luxury w-full" placeholder="Your API secret" required />
        </div>
        <div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="isTestnet" class="w-4 h-4 rounded border-gray-600 text-emerald-500 focus:ring-emerald-500" />
            <span class="text-sm text-gray-300">Use Testnet</span>
          </label>
        </div>
        <div class="flex gap-3 mt-6">
          <button type="submit" class="btn-primary flex-1">Connect</button>
          <button type="button" onclick="this.closest('.modal-overlay').remove()" class="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.isTestnet = !!data.isTestnet;

    try {
      await apiCall('/platforms', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      modal.remove();
      loadPlatforms();
    } catch (error) {
      alert('Failed to connect platform');
      console.error(error);
    }
  });
}

// Delete Functions
async function deleteAccount(id) {
  if (!confirm('Are you sure you want to delete this account?')) return;

  try {
    await apiCall(`/accounts/${id}`, { method: 'DELETE' });
    loadAccounts();
  } catch (error) {
    alert('Failed to delete account');
    console.error(error);
  }
}

async function deleteBookmark(id) {
  if (!confirm('Are you sure you want to delete this bookmark?')) return;

  try {
    await apiCall(`/bookmarks/${id}`, { method: 'DELETE' });
    loadBookmarks();
  } catch (error) {
    alert('Failed to delete bookmark');
    console.error(error);
  }
}

async function deletePnlRecord(id) {
  if (!confirm('Are you sure you want to delete this PNL record?')) return;

  try {
    await apiCall(`/pnl/${id}`, { method: 'DELETE' });
    loadPNL();
  } catch (error) {
    alert('Failed to delete PNL record');
    console.error(error);
  }
}

async function deletePlatform(id) {
  if (!confirm('Are you sure you want to disconnect this platform?')) return;

  try {
    await apiCall(`/platforms/${id}`, { method: 'DELETE' });
    loadPlatforms();
  } catch (error) {
    alert('Failed to delete platform');
    console.error(error);
  }
}

// Sync Platform
async function syncPlatform(id) {
  try {
    const result = await apiCall(`/platforms/${id}/sync`, { method: 'POST' });
    alert(result.message || 'Sync initiated');
    loadPlatforms();
  } catch (error) {
    alert('Failed to sync platform');
    console.error(error);
  }
}

// View Account Details
function viewAccountDetails(id) {
  alert('Account details view coming soon!');
}
