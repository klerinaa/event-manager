// ==== 1. SESSION & USER DATA INITIALIZATION ==== //
const loggedUser = sessionStorage.getItem('loggedUser');
if (!loggedUser) {
  window.location.href = 'index.html';
}

let users = JSON.parse(localStorage.getItem('users')) || {};
let user = users[loggedUser];


// ==== 2. UTILITY FUNCTIONS ==== //
function saveUsers() {
  users[loggedUser] = user;
  localStorage.setItem('users', JSON.stringify(users));
}


// ==== 3. PROFILE MANAGEMENT ==== //
const profileEmail = document.getElementById('profile-email');
const profileBio = document.getElementById('profile-bio');
const profileMessage = document.getElementById('profile-message');

profileEmail.value = user.email || '';
profileBio.value = user.bio || '';

document.getElementById('profile-form').addEventListener('submit', e => {
  e.preventDefault();
  profileMessage.textContent = '';
  const newEmail = profileEmail.value.trim();
  const newBio = profileBio.value.trim();
  user.email = newEmail;
  user.bio = newBio;
  saveUsers();
  profileMessage.style.color = 'green';
  profileMessage.textContent = 'Profile saved successfully!';
});


// ==== 4. LOGOUT ==== //
document.getElementById('logout-btn').addEventListener('click', () => {
  sessionStorage.removeItem('loggedUser');
  window.location.href = 'index.html';
});


// ==== 5. DOM REFERENCES ==== //
document.getElementById('user-name-display').textContent = loggedUser;

let eventsListEl = document.getElementById('events-list');
let addEventBtn = document.getElementById('add-event-btn');
let eventModal = document.getElementById('event-modal');
let modalTitle = document.getElementById('modal-title');
let eventForm = document.getElementById('event-form');
let cancelEventBtn = document.getElementById('cancel-event-btn');
let eventMessage = document.getElementById('event-message');

let filterType = document.getElementById('filter-type');
let sortEvents = document.getElementById('sort-events');
let searchEvents = document.getElementById('search-events');


// ==== 6. MODAL HANDLING ==== //
function openModal(isEdit = false) {
  eventModal.classList.remove('hidden');
  eventMessage.textContent = '';
  if (!isEdit) {
    modalTitle.textContent = 'Add Event';
    eventForm.reset();
    document.getElementById('event-id').value = '';
  }
}

function closeModal() {
  eventModal.classList.add('hidden');
  eventMessage.textContent = '';
  eventForm.reset();
}

addEventBtn.addEventListener('click', () => openModal(false));
cancelEventBtn.addEventListener('click', closeModal);


// ==== 7. EVENT FORM SUBMISSION (Add/Edit) ==== //
eventForm.addEventListener('submit', e => {
  e.preventDefault();
  eventMessage.textContent = '';

  const id = document.getElementById('event-id').value;
  const title = document.getElementById('event-title').value.trim();
  const description = document.getElementById('event-description').value.trim();
  const date = document.getElementById('event-date').value;
  const type = document.getElementById('event-type').value;
  const recurringVal = document.getElementById('event-recurring').value;

  if (!title || !date || !type) {
    eventMessage.style.color = 'red';
    eventMessage.textContent = 'Please fill in all required fields.';
    return;
  }

  if (!user.events) user.events = [];

  if (id) {
    let ev = user.events.find(ev => ev.id === id);
    if (ev) {
      ev.title = title;
      ev.description = description;
      ev.date = date;
      ev.type = type;
      ev.recurring = recurringVal || 'none';
    }
  } else {
    const newEvent = {
      id: Date.now().toString(),
      title,
      description,
      date,
      type,
      recurring: recurringVal || 'none',
      comments: []
    };
    user.events.push(newEvent);
  }

  saveUsers();
  renderEvents();
  closeModal();
});


// ==== 8. RENDER EVENTS ==== //
function renderEvents() {
  let events = user.events || [];

  // Filter
  const filterVal = filterType.value;
  if (filterVal !== 'all') {
    events = events.filter(e => e.type === filterVal);
  }

  // Search
  const searchVal = searchEvents.value.trim().toLowerCase();
  if (searchVal) {
    events = events.filter(e =>
      e.title.toLowerCase().includes(searchVal) ||
      (e.description && e.description.toLowerCase().includes(searchVal))
    );
  }

  // Sort
  const sortVal = sortEvents.value;
  if (sortVal === 'date-asc') {
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sortVal === 'date-desc') {
    events.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortVal === 'title-asc') {
    events.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortVal === 'title-desc') {
    events.sort((a, b) => b.title.localeCompare(a.title));
  }

  eventsListEl.innerHTML = '';
  if (events.length === 0) {
    eventsListEl.innerHTML = '<p>No events found.</p>';
    return;
  }

  events.forEach(event => {
    const div = document.createElement('div');
    div.classList.add('event');
    div.innerHTML = `
      <div class="details">
        <span class="type type-${event.type}">${event.type}</span>
        <strong>${event.title}</strong> - <em>${new Date(event.date).toLocaleDateString()}</em><br/>
        <small>${event.description || ''}</small><br/>
        <small><em>Recurring: </em>${event.recurring || 'None'}</small>

        <div class="comments-section" data-event-id="${event.id}" style="margin-top:8px;">
          <h4>Comments</h4>
          <div class="comments-list"></div>
          <textarea placeholder="Add comment" rows="2" style="width: 100%;"></textarea>
          <button class="add-comment-btn">Add Comment</button>
        </div>
      </div>
      <div class="actions">
        <button class="edit-btn" data-id="${event.id}">Edit</button>
        <button class="delete-btn" data-id="${event.id}">Delete</button>
      </div>
    `;
    eventsListEl.appendChild(div);

    // Comments
    const commentsDiv = div.querySelector('.comments-list');
    if (event.comments && event.comments.length > 0) {
      event.comments.forEach(cmt => {
        const cmtP = document.createElement('p');
        cmtP.textContent = cmt;
        commentsDiv.appendChild(cmtP);
      });
    }

    // Add Comment
    const addCommentBtn = div.querySelector('.add-comment-btn');
    const commentTextarea = div.querySelector('textarea');

    addCommentBtn.addEventListener('click', () => {
      let commentText = commentTextarea.value.trim();
      if (!commentText) return alert('Comment cannot be empty');
      event.comments = event.comments || [];
      event.comments.push(commentText);
      saveUsers();
      renderEvents();
    });
  });

  // Edit
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.target.dataset.id;
      openModal(true);
      modalTitle.textContent = 'Edit Event';
      const ev = user.events.find(ev => ev.id === id);
      if (ev) {
        document.getElementById('event-id').value = ev.id;
        document.getElementById('event-title').value = ev.title;
        document.getElementById('event-description').value = ev.description;
        document.getElementById('event-date').value = ev.date;
        document.getElementById('event-type').value = ev.type;
        document.getElementById('event-recurring').value = ev.recurring || 'none';
      }
    });
  });

  // Delete
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.target.dataset.id;
      if (confirm('Are you sure you want to delete this event?')) {
        user.events = user.events.filter(ev => ev.id !== id);
        saveUsers();
        renderEvents();
      }
    });
  });
}


// ==== 9. FILTER / SORT / SEARCH ==== //
filterType.addEventListener('change', renderEvents);
sortEvents.addEventListener('change', renderEvents);
searchEvents.addEventListener('input', renderEvents);


// ==== 10. EXPORT / IMPORT ==== //
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importInput = document.getElementById('import-input');

exportBtn?.addEventListener('click', () => {
  if (!user.events || user.events.length === 0) {
    alert('No events to export.');
    return;
  }
  const dataStr = JSON.stringify(user.events, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'events-export.json';
  a.click();
  URL.revokeObjectURL(url);
});

importBtn?.addEventListener('click', () => importInput.click());

importInput?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const importedEvents = JSON.parse(ev.target.result);
      if (Array.isArray(importedEvents)) {
        importedEvents.forEach(impEv => {
          if (!user.events.find(ev => ev.id === impEv.id)) {
            user.events.push(impEv);
          }
        });
        saveUsers();
        renderEvents();
        alert('Events imported successfully!');
      } else {
        alert('Invalid file format');
      }
    } catch {
      alert('Failed to parse JSON');
    }
  };
  reader.readAsText(file);
  importInput.value = '';
});


// ==== 11. INITIAL RENDER ==== //
renderEvents();
