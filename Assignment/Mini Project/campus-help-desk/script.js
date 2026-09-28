// ABES Engineering College - Campus Help Desk
// Client-Side Controller (Vanilla JS, Arrow Functions & fetch API)

const API_BASE = '/api/requests';
const THEME_STORAGE_KEY = 'abes_campus_theme';

// In-memory state cache
let allRequests = [];
let pendingDeleteId = null;

// DOM Element References
const requestForm = document.getElementById('requestForm');
const editIdInput = document.getElementById('editId');
const studentNameInput = document.getElementById('studentName');
const emailInput = document.getElementById('email');
const categoryInput = document.getElementById('category');
const priorityInput = document.getElementById('priority');
const descriptionInput = document.getElementById('description');

const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');
const cancelBtn = document.getElementById('cancelBtn');

const formHeading = document.getElementById('formHeading');
const formSub = document.getElementById('formSub');
const formStatusBadge = document.getElementById('formStatusBadge');
const formPanel = document.getElementById('formPanel');

const requestsList = document.getElementById('requestsList');
const headerCount = document.getElementById('headerCount');
const statTotal = document.getElementById('statTotal');
const statHigh = document.getElementById('statHigh');
const statMed = document.getElementById('statMed');
const statLow = document.getElementById('statLow');
const listBadge = document.getElementById('listBadge');

const searchInput = document.getElementById('searchInput');
const filterCategory = document.getElementById('filterCategory');
const filterPriority = document.getElementById('filterPriority');

// Modal Elements
const confirmModal = document.getElementById('confirmModal');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalConfirmBtn = document.getElementById('modalConfirmBtn');
const modalDescription = document.getElementById('modalDescription');

// Theme Switcher Elements
const themeToggleBtn = document.getElementById('themeToggleBtn');
const iconSun = themeToggleBtn.querySelector('.icon-sun');
const iconMoon = themeToggleBtn.querySelector('.icon-moon');

// ==========================================
// Theme Controller (Dark / Light Mode)
// ==========================================
const initTheme = () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
  applyTheme(savedTheme);
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);

  if (theme === 'light') {
    iconSun.classList.add('hidden');
    iconMoon.classList.remove('hidden');
  } else {
    iconSun.classList.remove('hidden');
    iconMoon.classList.add('hidden');
  }
};

const toggleTheme = () => {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
};

// ==========================================
// Event Listeners Initialization
// ==========================================
const setupEventListeners = () => {
  themeToggleBtn.addEventListener('click', toggleTheme);

  searchInput.addEventListener('input', () => applyFilters());
  filterCategory.addEventListener('change', () => applyFilters());
  filterPriority.addEventListener('change', () => applyFilters());

  modalCancelBtn.addEventListener('click', () => closeConfirmModal());
  modalConfirmBtn.addEventListener('click', () => handleModalConfirmDelete());

  // Close modal on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !confirmModal.classList.contains('hidden')) {
      closeConfirmModal();
    }
  });
};

// ==========================================
// 1. GET ALL: Load Requests from API
// ==========================================
const fetchRequests = async () => {
  renderLoadingSkeleton();

  try {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error('Could not retrieve campus requests');

    allRequests = await response.json();
    updateStatistics(allRequests);
    applyFilters();
  } catch (error) {
    console.error('Fetch error:', error);
    showToast(error.message || 'Error connecting to server', 'error');
    requestsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">!</div>
        <strong>Connection Error</strong>
        <p>Could not load help desk records. Please verify the Node.js server is running.</p>
      </div>
    `;
  }
};

// ==========================================
// Compute 4 Dashboard Overview Cards
// ==========================================
const updateStatistics = (data) => {
  const total = data.length;

  let highCount = 0;
  let medCount = 0;
  let lowCount = 0;

  data.forEach((item) => {
    const p = normalizePriority(item.priority);
    if (p === 'High') highCount++;
    else if (p === 'Low') lowCount++;
    else medCount++;
  });

  statTotal.textContent = total;
  statHigh.textContent = highCount;
  statMed.textContent = medCount;
  statLow.textContent = lowCount;
  headerCount.textContent = total;
};

// Normalize priority strings for backward-compatibility
const normalizePriority = (pri) => {
  if (!pri) return 'Medium';
  const p = pri.toLowerCase().trim();
  if (p === 'high' || p === 'urgent' || p === 'immediate') return 'High';
  if (p === 'low') return 'Low';
  return 'Medium'; // Default/Normal
};

// ==========================================
// Client-Side Search & Filter Handler
// ==========================================
const applyFilters = () => {
  const query = searchInput.value.toLowerCase().trim();
  const selectedCat = filterCategory.value;
  const selectedPri = filterPriority.value;

  const filtered = allRequests.filter((item) => {
    const textMatch = !query ||
      item.studentName.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.id.includes(query);

    const catMatch = selectedCat === 'ALL' || item.category === selectedCat;

    let priMatch = true;
    if (selectedPri !== 'ALL') {
      const normalized = normalizePriority(item.priority);
      priMatch = normalized.toLowerCase() === selectedPri.toLowerCase();
    }

    return textMatch && catMatch && priMatch;
  });

  listBadge.textContent = `${filtered.length} ${filtered.length === 1 ? 'ticket' : 'tickets'}`;
  renderRequests(filtered);
};

// ==========================================
// Render Cards to the DOM
// ==========================================
const renderRequests = (items) => {
  if (!items || items.length === 0) {
    requestsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        </div>
        <strong>No Campus Requests Found</strong>
        <p>No tickets match your query. Use the form above to log a new ticket or adjust your filters.</p>
      </div>
    `;
    return;
  }

  requestsList.innerHTML = items
    .map((item) => {
      const normalizedPri = normalizePriority(item.priority);
      const cardPriorityClass = `priority-${normalizedPri.toLowerCase().slice(0, 3)}-card`;
      const badgePriorityClass = `priority-${normalizedPri.toLowerCase().slice(0, 3)}-badge`;
      const initials = getInitials(item.studentName);

      return `
        <article class="ticket-card ${cardPriorityClass}" id="ticket-${item.id}">
          <div class="ticket-top">
            <div class="student-info-group">
              <div class="student-avatar">${escapeHtml(initials)}</div>
              <div class="student-meta">
                <div class="student-name-row">
                  <h3>${escapeHtml(item.studentName)}</h3>
                  <span class="ticket-id-tag">#REQ-${item.id}</span>
                </div>
                <span class="student-email">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  ${escapeHtml(item.email)}
                </span>
              </div>
            </div>

            <div class="ticket-badges-group">
              <span class="pill-badge category-pill">${escapeHtml(item.category)}</span>
              <span class="pill-badge ${badgePriorityClass}">
                &bull; ${escapeHtml(normalizedPri)} Priority
              </span>
            </div>
          </div>

          <div class="ticket-body">${escapeHtml(item.description)}</div>

          <div class="ticket-footer">
            <span class="ticket-timestamp">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Logged: ${escapeHtml(item.date || 'Recent')}
            </span>

            <div class="ticket-actions">
              <button class="btn btn-outline-edit" onclick="loadRequestForEdit('${item.id}')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
              </button>
              <button class="btn btn-danger" onclick="promptDeleteRequest('${item.id}', '${escapeHtml(item.studentName)}')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Resolve
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
};

// ==========================================
// 2. CREATE or UPDATE on Form Submit
// ==========================================
requestForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = editIdInput.value;
  const payload = {
    studentName: studentNameInput.value.trim(),
    email: emailInput.value.trim(),
    category: categoryInput.value,
    priority: priorityInput.value,
    description: descriptionInput.value.trim()
  };

  // Prevent double submissions: disable button and trigger spinner
  setButtonLoading(true, id ? 'Updating Request...' : 'Submitting Request...');

  try {
    if (id) {
      // PUT /api/requests/:id
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to update request');
      }

      showToast(`Request #REQ-${id} updated successfully!`, 'success');
    } else {
      // POST /api/requests
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to submit request');
      }

      const created = await response.json();
      showToast(`New ticket #REQ-${created.id} registered!`, 'success');
    }

    resetForm();
    await fetchRequests();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setButtonLoading(false);
  }
});

// ==========================================
// 3. GET SINGLE: Fetch and populate Edit Form
// ==========================================
const loadRequestForEdit = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) throw new Error('Could not load ticket details');

    const item = await response.json();

    // Populate inputs
    editIdInput.value = item.id;
    studentNameInput.value = item.studentName;
    emailInput.value = item.email;
    categoryInput.value = item.category;
    priorityInput.value = normalizePriority(item.priority);
    descriptionInput.value = item.description;

    // Switch UI into Edit mode
    formHeading.textContent = `Update Ticket #REQ-${item.id}`;
    formSub.textContent = `Modifying request submitted by ${item.studentName}. Click Save Changes below.`;
    formStatusBadge.innerHTML = `<span class="pulse-dot"></span><span>Editing #${item.id}</span>`;
    formStatusBadge.className = 'mode-badge mode-edit';
    btnText.textContent = 'Save Changes';
    cancelBtn.classList.remove('hidden');

    // Scroll smoothly to the form panel
    formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    studentNameInput.focus();
  } catch (error) {
    showToast(error.message, 'error');
  }
};

// ==========================================
// 4. CANCEL EDIT: Restore original form state
// ==========================================
cancelBtn.addEventListener('click', () => {
  resetForm();
  showToast('Edit mode cancelled', 'info');
});

const resetForm = () => {
  requestForm.reset();
  editIdInput.value = '';
  formHeading.textContent = 'Submit New Request';
  formSub.textContent = 'Fill out the details below to log a campus assistance ticket.';
  formStatusBadge.innerHTML = `<span class="pulse-dot"></span><span>New Ticket</span>`;
  formStatusBadge.className = 'mode-badge mode-new';
  btnText.textContent = 'Submit Request';
  cancelBtn.classList.add('hidden');
};

// ==========================================
// 5. DELETE: Prompt and remove request by ID
// ==========================================
const promptDeleteRequest = (id, studentName) => {
  pendingDeleteId = id;
  modalDescription.textContent = `Are you sure you want to resolve and remove ticket #REQ-${id} (${studentName})?`;
  confirmModal.classList.remove('hidden');
};

const closeConfirmModal = () => {
  pendingDeleteId = null;
  confirmModal.classList.add('hidden');
};

const handleModalConfirmDelete = async () => {
  if (!pendingDeleteId) return;
  const idToDelete = pendingDeleteId;
  closeConfirmModal();

  try {
    const response = await fetch(`${API_BASE}/${idToDelete}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to resolve request');
    }

    showToast(`Ticket #REQ-${idToDelete} resolved and removed!`, 'success');

    // If currently editing the ticket being deleted, reset form
    if (editIdInput.value === idToDelete) {
      resetForm();
    }

    await fetchRequests();
  } catch (error) {
    showToast(error.message, 'error');
  }
};

// ==========================================
// UX Helpers: Loading Spinner & Skeletons
// ==========================================
const setButtonLoading = (isLoading, customText = '') => {
  if (isLoading) {
    submitBtn.disabled = true;
    btnSpinner.classList.remove('hidden');
    btnText.textContent = customText || 'Processing...';
  } else {
    submitBtn.disabled = false;
    btnSpinner.classList.add('hidden');
    btnText.textContent = editIdInput.value ? 'Save Changes' : 'Submit Request';
  }
};

const renderLoadingSkeleton = () => {
  requestsList.innerHTML = `
    <div class="skeleton-card">
      <div class="skeleton-line" style="width: 35%;"></div>
      <div class="skeleton-line" style="width: 80%;"></div>
      <div class="skeleton-line" style="width: 60%;"></div>
    </div>
    <div class="skeleton-card">
      <div class="skeleton-line" style="width: 40%;"></div>
      <div class="skeleton-line" style="width: 75%;"></div>
      <div class="skeleton-line" style="width: 50%;"></div>
    </div>
  `;
};

// ==========================================
// Toast Notification Manager
// ==========================================
const showToast = (message, type = 'info') => {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconSvg = type === 'success'
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : type === 'error'
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

  toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
};

// Helper: Extract Initials for Avatar
const getInitials = (name) => {
  if (!name) return 'ST';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Helper: Escape HTML to prevent XSS
const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// ==========================================
// Bootstrap on DOM Ready
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupEventListeners();
  fetchRequests();
});
