// /JS/admin-script.js - Final Firebase version

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Strict Access Control - Only your email
  const currentUser = await Auth.getCurrentUser();

  if (!currentUser || currentUser.email !== "alaoayomide700@gmail.com") {
    alert("Access denied. Admin privileges required.");
    window.location.href = "events.html";
    return;
  }

  console.log("Admin access granted:", currentUser.email);

  // 2. Tab switching
  const tabs = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });

  // 3. Modal handling
  const modal = document.getElementById("deleteModal");
  const closeModal = () => {
    modal.style.display = "none";
  };
  window.closeDeleteModal = closeModal;

  window.onclick = function(event) {
    if (event.target === modal) closeModal();
  };

  // 4. Load Users from Firestore
  async function loadUsers(searchTerm = "") {
    const tbody = document.getElementById("users-table-body");
    tbody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

    try {
      const snapshot = await firebase.firestore().collection("users").get();
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const filtered = users.filter(u =>
        (u.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No users found</td></tr>';
      } else {
        tbody.innerHTML = "";
        filtered.forEach(user => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${user.username || "N/A"}</td>
            <td>${user.email}</td>
            <td>${user.email === "alaoayomide700@gmail.com" ? "Admin" : "User"}</td>
            <td>
              <button class="btn-delete" onclick="deleteUser('${user.id}')">
                <i class="fas fa-trash"></i> Delete
              </button>
            </td>
          `;
          tbody.appendChild(row);
        });
      }

      document.getElementById("total-users").textContent = users.length;
    } catch (error) {
      console.error("Error loading users:", error);
      tbody.innerHTML = '<tr><td colspan="4">Error loading users</td></tr>';
    }
  }

  // 5. Load Activities (Events) from Firestore
  async function loadActivities(searchTerm = "") {
    const tbody = document.getElementById("activities-table-body");
    tbody.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

    try {
      const snapshot = await firebase.firestore().collection("events").get();
      const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const activities = events.map(event => ({
        type: "Event Created",
        description: event.title,
        user: event.createdBy || "System",
        date: event.createdAt ? new Date(event.createdAt.toDate()).toLocaleString() : "Unknown",
        eventId: event.id
      }));

      const filtered = activities.filter(a =>
        a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.user.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No activities found</td></tr>';
      } else {
        tbody.innerHTML = "";
        filtered.forEach(act => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${act.type}</td>
            <td>${act.description}</td>
            <td>${act.user}</td>
            <td>${act.date}</td>
            <td>
              <button class="btn-delete" onclick="deleteActivity('${act.eventId}')">
                <i class="fas fa-trash"></i> Delete Event
              </button>
            </td>
          `;
          tbody.appendChild(row);
        });
      }

      document.getElementById("total-activities").textContent = events.length;
    } catch (error) {
      console.error("Error loading events:", error);
      tbody.innerHTML = '<tr><td colspan="5">Error loading activities</td></tr>';
    }
  }

  // 6. Delete User
  window.deleteUser = async function(userId) {
    document.getElementById("deleteMessage").textContent = "Are you sure you want to delete this user? This cannot be undone.";
    modal.style.display = "block";

    document.getElementById("confirmDeleteBtn").onclick = async () => {
      try {
        await firebase.firestore().collection("users").doc(userId).delete();
        closeDeleteModal();
        loadUsers(document.getElementById("user-search").value);
        alert("User deleted successfully.");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user: " + error.message);
      }
    };
  };

  // 7. Delete Event (Fixed)
  window.deleteActivity = async function(eventId) {
    document.getElementById("deleteMessage").textContent = "Are you sure you want to delete this event? This cannot be undone.";
    modal.style.display = "block";

    document.getElementById("confirmDeleteBtn").onclick = async () => {
      try {
        await firebase.firestore().collection("events").doc(eventId).delete();
        closeDeleteModal();
        loadActivities(document.getElementById("activity-search").value);
        alert("Event deleted successfully.");
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Failed to delete event: " + error.message);
      }
    };
  };

  // 8. Search listeners
  document.getElementById("user-search").addEventListener("input", e => {
    loadUsers(e.target.value);
  });

  document.getElementById("activity-search").addEventListener("input", e => {
    loadActivities(e.target.value);
  });

  window.refreshUsers = () => loadUsers(document.getElementById("user-search").value);
  window.refreshActivities = () => loadActivities(document.getElementById("activity-search").value);

  // Initial load
  loadUsers();
  loadActivities();
});