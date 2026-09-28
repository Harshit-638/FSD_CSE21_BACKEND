// ==========================================================================
// ABES Engineering College - Campus Help Desk
// Client-side Application Script (Vanilla JS, Fetch API, Modern ES6+)
// ==========================================================================

// Global state
let allRequests = [];
let pendingDeleteId = null;

// DOM Element Selectors
const requestForm = document.getElementById('requestForm');
const requestIdInput = document.getElementById('requestId');
const studentNameInput = document.getElementById('studentName');
const emailInput = document.getElementById('email');
const categorySelect = document.getElementById('category');
const prioritySelect = document.getElementById('priority');
const problemDescInput = document.getElementById('problemDescription');

const formSection = document.getElementById('formSection');
const formHeading = document.getElementById('formHeading');
const formDescription = document.getElementById('formDescription');
const submitBtnText = document.getElementById('submitBtnText');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const editingBadge = document.getElementById('editingBadge');
const editingIdText = document.getElementById('editingIdText');

const requestsList = document.getElementById('requestsList');
const loadingSpinner = document.getElementById('loadingSpinner');
const emptyState = document.getElementById('emptyState');

const searchInput = document.getElementById('searchInput');
const filterCategory = document.getElementById('filterCategory');
const filterPriority = document.getElementById('filterPriority');

const statTotal = document.getElementById('statTotal');
const statHigh = document.getElementById('statHigh');
const statMedium = document.getElementById('statMedium');
const statLow = document.getElementById('statLow');
const headerTotalCount = document.getElementById('headerTotalCount');

const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const themeLabel = document.getElementById('themeLabel');

const confirmModal = document.getElementById('confirmModal');
const confirmModalText = document.getElementById('confirmModalText');
const confirmCancelBtn = document.getElementById('confirmCancelBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

const toastContainer = document.getElementById('toastContainer');

// Error message elements
const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const categoryError = document.getElementById('categoryError');
const priorityError = document.getElementById('priorityError');
const descriptionError = document.getElementById('descriptionError');

// ==========================================================================
// Toast Notifications
// ==========================================================================
const showToast = (message, type = 'success') => {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
};

// ==========================================================================
// Theme Management (Dark & Light Mode with LocalStorage persistence)
// ==========================================================================
const sunSvg = `
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
`;

const moonSvg = `
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
`;

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('campus_help_desk_theme', theme);

  if (theme === 'light') {
    themeIcon.innerHTML = moonSvg;
    themeLabel.textContent = 'Dark';
  } else {
    themeIcon.innerHTML = sunSvg;
    themeLabel.textContent = 'Light';
  }
};

const initTheme = () => {
  const savedTheme = localStorage.getItem('campus_help_desk_theme') || 'dark';
  applyTheme(savedTheme);
};

themeToggleBtn.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const targetTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(targetTheme);
});

// ==========================================================================
// Statistics Calculation (Derived dynamically from requests)
// ==========================================================================
const updateStatistics = (requests) => {
  const total = requests.length;
  const high = requests.filter((r) => r.priority === 'High').length;
  const medium = requests.filter((r) => r.priority === 'Medium').length;
  const low = requests.filter((r) => r.priority === 'Low').length;

  statTotal.textContent = total;
  statHigh.textContent = high;
  statMedium.textContent = medium;
  statLow.textContent = low;
  headerTotalCount.textContent = total;
};

// ==========================================================================
// Form Validation Helpers
// ==========================================================================
const clearErrors = () => {
  nameError.textContent = '';
  emailError.textContent = '';
  categoryError.textContent = '';
  priorityError.textContent = '';
  descriptionError.textContent = '';

  studentNameInput.classList.remove('input-error');
  emailInput.classList.remove('input-error');
  categorySelect.classList.remove('input-error');
  prioritySelect.classList.remove('input-error');
  problemDescInput.classList.remove('input-error');
};

const validateForm = () => {
  clearErrors();
  let isValid = true;

  // Student Name
  if (!studentNameInput.value.trim()) {
    nameError.textContent = 'Student name is required.';
    studentNameInput.classList.add('input-error');
    isValid = false;
  }

  // Email
  const emailVal = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailVal) {
    emailError.textContent = 'Email address is required.';
    emailInput.classList.add('input-error');
    isValid = false;
  } else if (!emailRegex.test(emailVal)) {
    emailError.textContent = 'Please enter a valid email address.';
    emailInput.classList.add('input-error');
    isValid = false;
  }

  // Category
  if (!categorySelect.value) {
    categoryError.textContent = 'Please select a category.';
    categorySelect.classList.add('input-error');
    isValid = false;
  }

  // Priority
  if (!prioritySelect.value) {
    priorityError.textContent = 'Please select a priority.';
    prioritySelect.classList.add('input-error');
    isValid = false;
  }

  // Problem Description
  if (!problemDescInput.value.trim()) {
    descriptionError.textContent = 'Problem description is required.';
    problemDescInput.classList.add('input-error');
    isValid = false;
  } else if (problemDescInput.value.trim().length < 10) {
    descriptionError.textContent = 'Description should be at least 10 characters long.';
    problemDescInput.classList.add('input-error');
    isValid = false;
  }

  return isValid;
};

// ==========================================================================
// Rendering Requests Cards
// ==========================================================================
const getPriorityBadgeClass = (priority) => {
  switch (priority) {
    case 'High':
      return 'badge-priority-high';
    case 'Medium':
      return 'badge-priority-medium';
    case 'Low':
    default:
      return 'badge-priority-low';
  }
};

const renderRequests = () => {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const catFilter = filterCategory.value;
  const prioFilter = filterPriority.value;

  const filtered = allRequests.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchTerm) ||
      r.id.toLowerCase().includes(searchTerm) ||
      r.problemDescription.toLowerCase().includes(searchTerm) ||
      r.email.toLowerCase().includes(searchTerm);

    const matchesCat = catFilter === 'ALL' || r.category === catFilter;
    const matchesPrio = prioFilter === 'ALL' || r.priority === prioFilter;

    return matchesSearch && matchesCat && matchesPrio;
  });

  requestsList.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  filtered.forEach((request) => {
    const card = document.createElement('article');
    card.className = 'request-card';
    card.dataset.id = request.id;

    const priorityClass = getPriorityBadgeClass(request.priority);

    card.innerHTML = `
      <div class="card-top">
        <span class="card-id-tag">#${escapeHtml(request.id)}</span>
        <div class="card-badges">
          <span class="badge badge-category">${escapeHtml(request.category)}</span>
          <span class="badge ${priorityClass}">
            <span class="badge-dot"></span>
            ${escapeHtml(request.priority)}
          </span>
        </div>
      </div>

      <div class="card-student-meta">
        <h3 class="student-name-text">${escapeHtml(request.studentName)}</h3>
        <div class="student-email-row">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <span>${escapeHtml(request.email)}</span>
        </div>
      </div>

      <div class="card-desc-box">
        <p class="card-description">${escapeHtml(request.problemDescription)}</p>
      </div>

      <div class="card-bottom">
        <div class="card-date">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>${escapeHtml(request.createdAt || 'Recently')}</span>
        </div>

        <div class="card-actions">
          <button type="button" class="btn-card-action btn-edit" data-id="${escapeHtml(request.id)}" title="Edit Request">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </button>
          <button type="button" class="btn-card-action btn-delete" data-id="${escapeHtml(request.id)}" title="Delete Request">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Delete
          </button>
        </div>
      </div>
    `;

    requestsList.appendChild(card);
  });
};

// Simple HTML escaping helper for XSS safety
const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// ==========================================================================
// CRUD API Operations using JavaScript fetch()
// ==========================================================================

// 1. GET /api/requests - Load all requests
const loadRequests = async () => {
  loadingSpinner.hidden = false;
  try {
    const response = await fetch('/api/requests');
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    const data = await response.json();
    allRequests = data;
    renderRequests();
    updateStatistics(allRequests);
  } catch (error) {
    console.error('Failed to load campus requests:', error);
    showToast('Failed to load campus requests. Please refresh.', 'error');
  } finally {
    loadingSpinner.hidden = true;
  }
};

// 2. GET /api/requests/:id - Load single request for editing
const loadRequestForEdit = async (id) => {
  try {
    const response = await fetch(`/api/requests/${encodeURIComponent(id)}`);
    if (!response.ok) {
      throw new Error('Request not found');
    }
    const request = await response.json();

    // Populate form fields
    requestIdInput.value = request.id;
    studentNameInput.value = request.studentName;
    emailInput.value = request.email;
    categorySelect.value = request.category;
    prioritySelect.value = request.priority;
    problemDescInput.value = request.problemDescription;

    // Switch UI into Edit mode
    formHeading.textContent = 'EDIT CAMPUS REQUEST';
    formDescription.textContent = 'Update the details of your submitted grievance ticket.';
    submitBtnText.textContent = 'Update Request';
    cancelEditBtn.hidden = false;
    editingBadge.hidden = false;
    editingIdText.textContent = `#${request.id}`;

    clearErrors();

    // Smoothly scroll user up to the form
    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    studentNameInput.focus();
  } catch (error) {
    console.error('Error fetching request for edit:', error);
    showToast('Failed to load request for editing.', 'error');
  }
};

// Reset form back to Create mode
const resetFormMode = () => {
  requestForm.reset();
  requestIdInput.value = '';
  formHeading.textContent = 'SUBMIT NEW REQUEST';
  formDescription.textContent = 'Provide details below to raise a campus grievance or service request.';
  submitBtnText.textContent = 'Submit Request';
  cancelEditBtn.hidden = true;
  editingBadge.hidden = true;
  clearErrors();
};

// 3. POST /api/requests and 4. PUT /api/requests/:id
const handleFormSubmit = async (event) => {
  event.preventDefault();

  if (!validateForm()) {
    showToast('Please fix the highlighted form errors.', 'error');
    return;
  }

  const editId = requestIdInput.value.trim();
  const payload = {
    studentName: studentNameInput.value.trim(),
    email: emailInput.value.trim(),
    category: categorySelect.value,
    priority: prioritySelect.value,
    problemDescription: problemDescInput.value.trim()
  };

  try {
    let response;

    if (editId) {
      // UPDATE: PUT /api/requests/:id
      response = await fetch(`/api/requests/${encodeURIComponent(editId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to update request');
      }

      showToast(`Request #${editId} updated successfully!`, 'success');
    } else {
      // CREATE: POST /api/requests
      response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to create request');
      }

      const created = await response.json();
      showToast(`New request #${created.id} submitted successfully!`, 'success');
    }

    resetFormMode();
    await loadRequests();
  } catch (error) {
    console.error('Submission error:', error);
    showToast('An error occurred while saving the request.', 'error');
  }
};

// 5. DELETE /api/requests/:id - Delete an existing request
const confirmDeleteRequest = (id) => {
  pendingDeleteId = id;
  confirmModalText.textContent = `Are you sure you want to permanently delete ticket #${id}?`;
  confirmModal.hidden = false;
};

const executeDelete = async () => {
  if (!pendingDeleteId) return;

  const id = pendingDeleteId;
  confirmModal.hidden = true;
  pendingDeleteId = null;

  try {
    const response = await fetch(`/api/requests/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete request');
    }

    showToast(`Request #${id} deleted successfully.`, 'success');

    // If currently editing this same request, cancel edit mode
    if (requestIdInput.value === id) {
      resetFormMode();
    }

    await loadRequests();
  } catch (error) {
    console.error('Delete error:', error);
    showToast('Failed to delete campus request.', 'error');
  }
};

// ==========================================================================
// Event Listeners
// ==========================================================================

// Form Submission
requestForm.addEventListener('submit', handleFormSubmit);

// Cancel Edit Button
cancelEditBtn.addEventListener('click', resetFormMode);

// Delegation for Card Edit and Delete buttons
requestsList.addEventListener('click', (event) => {
  const editBtn = event.target.closest('.btn-edit');
  if (editBtn) {
    const id = editBtn.dataset.id;
    loadRequestForEdit(id);
    return;
  }

  const deleteBtn = event.target.closest('.btn-delete');
  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    confirmDeleteRequest(id);
    return;
  }
});

// Modal Actions
confirmCancelBtn.addEventListener('click', () => {
  confirmModal.hidden = true;
  pendingDeleteId = null;
});

confirmDeleteBtn.addEventListener('click', executeDelete);

// Close modal on backdrop click
confirmModal.addEventListener('click', (e) => {
  if (e.target === confirmModal) {
    confirmModal.hidden = true;
    pendingDeleteId = null;
  }
});

// Search and Filter Listeners
searchInput.addEventListener('input', renderRequests);
filterCategory.addEventListener('change', renderRequests);
filterPriority.addEventListener('change', renderRequests);

// Real-time error clearance on input
studentNameInput.addEventListener('input', () => {
  if (studentNameInput.value.trim()) {
    nameError.textContent = '';
    studentNameInput.classList.remove('input-error');
  }
});

emailInput.addEventListener('input', () => {
  if (emailInput.value.trim()) {
    emailError.textContent = '';
    emailInput.classList.remove('input-error');
  }
});

categorySelect.addEventListener('change', () => {
  if (categorySelect.value) {
    categoryError.textContent = '';
    categorySelect.classList.remove('input-error');
  }
});

prioritySelect.addEventListener('change', () => {
  if (prioritySelect.value) {
    priorityError.textContent = '';
    prioritySelect.classList.remove('input-error');
  }
});

problemDescInput.addEventListener('input', () => {
  if (problemDescInput.value.trim().length >= 10) {
    descriptionError.textContent = '';
    problemDescInput.classList.remove('input-error');
  }
});

// ==========================================================================
// Initialization on Page Load
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadRequests();
});
