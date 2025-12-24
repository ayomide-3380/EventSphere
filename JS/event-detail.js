// /JS/event-detail.js - Firestore version with Join/Leave toggle

document.addEventListener("DOMContentLoaded", async () => {
  // Navbar update
  const currentUser = await Auth.getCurrentUser();

  if (currentUser) {
    document.getElementById("welcome-message").textContent = `Welcome, ${currentUser.username}!`;
    document.getElementById("welcome-message").style.display = "inline";
    document.getElementById("add-event-link").style.display = "inline";
    document.getElementById("logout-link").style.display = "inline";
    document.getElementById("login-link").style.display = "none";
    document.getElementById("register-link").style.display = "none";

    document.getElementById("logout-link").addEventListener("click", async (e) => {
      e.preventDefault();
      await Auth.logout();
      window.location.href = "login.html";
    });
  }

  // Event details
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("id");

  if (!eventId) {
    alert("No event ID provided!");
    window.location.href = "events.html";
    return;
  }

  try {
    const docSnap = await firebase.firestore().collection("events").doc(eventId).get();

    if (!docSnap.exists) {
      alert("Event not found!");
      window.location.href = "events.html";
      return;
    }

    const event = docSnap.data();
    event.id = docSnap.id;

    // Populate fields
    document.getElementById("event-title").textContent = event.title;
    document.getElementById("event-description").textContent = event.description || "No description available.";

    const eventImage = document.getElementById("event-image");
    eventImage.src = event.image || "img/default-event.jpg";
    eventImage.alt = event.title;

    document.getElementById("event-date").textContent = event.date || "Date not specified";
    document.getElementById("event-time").textContent = event.time || "Time not specified";
    document.getElementById("event-location").textContent = event.location || "Location not specified";
    document.getElementById("event-host").textContent = event.host || "Unknown Host";

    const joinedUsers = event.joinedUsers || [];
    document.getElementById("attendees-current").textContent = joinedUsers.length;
    document.getElementById("attendees-max").textContent = "Unlimited";

    const fillBar = document.querySelector(".attendance-fill");
    if (fillBar) {
      fillBar.style.width = `${Math.min((joinedUsers.length / 500) * 100, 100)}%`;
    }

    // Join/Leave Button
    const joinBtn = document.getElementById("join-btn");

    if (!currentUser) {
      joinBtn.textContent = "Login to Join";
      joinBtn.disabled = true;
      joinBtn.onclick = () => window.location.href = "login.html";
    } else {
      const username = currentUser.username;
      const isJoined = joinedUsers.includes(username);

      if (isJoined) {
        joinBtn.textContent = "Leave Event";
        joinBtn.classList.remove("btn-primary");
        joinBtn.classList.add("btn-secondary");
        joinBtn.onclick = () => leaveEvent(eventId, username, joinBtn);
      } else {
        joinBtn.textContent = "Join Event";
        joinBtn.classList.add("btn-primary");
        joinBtn.classList.remove("btn-secondary");
        joinBtn.onclick = () => joinEvent(eventId, username, joinBtn);
      }
    }

    // Share Button
    document.getElementById("share-btn").onclick = () => {
      if (navigator.share) {
        navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href
        }).catch(() => alert("Sharing failed"));
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    };

  } catch (error) {
    console.error("Error loading event:", error);
    alert("Failed to load event details.");
  }
});

// Join event
async function joinEvent(eventId, username, button) {
  try {
    const eventRef = firebase.firestore().collection("events").doc(eventId);
    await firebase.firestore().runTransaction(async (transaction) => {
      const doc = await transaction.get(eventRef);
      if (!doc.exists) throw "Event not found";

      const joinedUsers = doc.data().joinedUsers || [];
      if (!joinedUsers.includes(username)) {
        joinedUsers.push(username);
        transaction.update(eventRef, { joinedUsers });
      }
    });

    alert("Successfully joined the event!");
    button.textContent = "Leave Event";
    button.classList.remove("btn-primary");
    button.classList.add("btn-secondary");
    button.onclick = () => leaveEvent(eventId, username, button);

    const count = parseInt(document.getElementById("attendees-current").textContent);
    document.getElementById("attendees-current").textContent = count + 1;
  } catch (error) {
    alert("Failed to join event.");
  }
}

// Leave event
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
    button.onclick = () => joinEvent(eventId, username, button);

    const count = parseInt(document.getElementById("attendees-current").textContent);
    document.getElementById("attendees-current").textContent = count - 1;
  } catch (error) {
    alert("Failed to leave event.");
  }
}