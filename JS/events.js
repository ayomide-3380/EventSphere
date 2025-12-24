// event.js - Full Firestore version with Join/Leave toggle

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("eventContainer");
  const searchInput = document.getElementById("search-input");

  if (!container) {
    console.error("eventContainer not found");
    return;
  }

  async function renderEvents(eventsToShow) {
    if (eventsToShow.length === 0) {
      container.innerHTML = "<p style='text-align: center; color: #ccc;'>No events found.</p>";
      return;
    }

    const currentUser = await Auth.getCurrentUser();
    const currentUsername = currentUser ? currentUser.username : null;

    container.innerHTML = eventsToShow.map(event => {
      const imageUrl = event.image || "img/default-event.jpg";
      const isJoined = currentUsername && event.joinedUsers?.includes(currentUsername);
      const joinBtnText = isJoined ? "Leave Event" : "Join Event";
      const joinBtnClass = isJoined ? "btn-secondary" : "btn-primary";

      return `
        <div class="cards">
          <div class="card-header" style="background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${imageUrl}') no-repeat center center / cover;">
            <h3 class="event-title">${event.title}</h3>
          </div>
          <div class="card-body">
            <div class="event-date">
              <i class="fa-regular fa-calendar"></i>
              <span>${event.date || "Date not specified"}</span>
            </div>
            <div class="event-location">
              <i class="fas fa-location-dot"></i>
              <span>${event.location}</span>
            </div>
            <div class="event-host">
              <i class="fas fa-users"></i>
              <span>Hosted by ${event.host || "Unknown"}</span>
            </div>
            <p class="event-description">${event.description || "No description available."}</p>
            <div class="card-actions">
              <a href="event-detail.html?id=${event.id}" class="btn btn-secondary">View Details</a>
              <button onclick="toggleJoin('${event.id}', '${currentUsername || ""}', this)" class="btn ${joinBtnClass}">
                ${joinBtnText}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  async function loadEvents(searchTerm = "") {
    container.innerHTML = "<p style='text-align: center; color: #ccc;'>Loading events...</p>";

    try {
      let query = firebase.firestore().collection("events").orderBy("createdAt", "desc");
      const snapshot = await query.get();
      let events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        events = events.filter(event =>
          (event.title || "").toLowerCase().includes(term) ||
          (event.location || "").toLowerCase().includes(term) ||
          (event.host || "").toLowerCase().includes(term) ||
          (event.description || "").toLowerCase().includes(term)
        );
      }

      renderEvents(events);
    } catch (error) {
      console.error("Error loading events:", error);
      container.innerHTML = "<p style='text-align: center; color: #f00;'>Error loading events.</p>";
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      loadEvents(e.target.value);
    });
  }

  loadEvents();
});

// ===============================================
// GLOBAL FUNCTIONS - Place these at the END of the file
// ===============================================

window.toggleJoin = async function(eventId, username, button) {
  if (!username || username === "null") {
    alert("Please login to join events!");
    window.location.href = "login.html";
    return;
  }

  const isJoined = button.textContent.includes("Leave") || button.textContent.includes("Joined");

  if (isJoined) {
    await leaveEvent(eventId, username, button);
  } else {
    await joinEvent(eventId, username, button);
  }
};

async function joinEvent(eventId, username, button) {
  try {
    const eventRef = firebase.firestore().collection("events").doc(eventId);
    await firebase.firestore().runTransaction(async (transaction) => {
      const doc = await transaction.get(eventRef);
      if (!doc.exists) throw "Event not found";

      let joinedUsers = doc.data().joinedUsers || [];
      if (!joinedUsers.includes(username)) {
        joinedUsers.push(username);
        transaction.update(eventRef, { joinedUsers });
      }
    });

    alert("Successfully joined the event!");
    button.textContent = "Leave Event";
    button.classList.remove("btn-primary");
    button.classList.add("btn-secondary");
  } catch (error) {
    console.error("Join error:", error);
    alert("Failed to join event.");
  }
}

async function leaveEvent(eventId, username, button) {
  if (!confirm("Are you sure you want to leave this event?")) return;

  try {
    const eventRef = firebase.firestore().collection("events").doc(eventId);
    await firebase.firestore().runTransaction(async (transaction) => {
      const doc = await transaction.get(eventRef);
      if (!doc.exists) throw "Event not found";

      let joinedUsers = doc.data().joinedUsers || [];
      joinedUsers = joinedUsers.filter(u => u !== username);
      transaction.update(eventRef, { joinedUsers });
    });

    alert("You have left the event.");
    button.textContent = "Join Event";
    button.classList.remove("btn-secondary");
    button.classList.add("btn-primary");
  } catch (error) {
    console.error("Leave error:", error);
    alert("Failed to leave event.");
  }
}