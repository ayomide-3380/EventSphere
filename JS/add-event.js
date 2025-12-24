// // Navbar update for add-event.html
// const currentUser = await Auth.getCurrentUser();

// if (currentUser) {
//   document.getElementById("welcome-message").textContent = `Welcome, ${currentUser.username}!`;
//   document.getElementById("welcome-message").style.display = "inline";
//   document.getElementById("add-event-link").style.display = "inline";
//   document.getElementById("logout-link").style.display = "inline";
//   document.getElementById("login-link").style.display = "none";
//   document.getElementById("register-link").style.display = "none";

//   document.getElementById("logout-link").addEventListener("click", async (e) => {
//     e.preventDefault();
//     await Auth.logout();
//     window.location.href = "login.html";
//   });
// } else {
//   // Not logged in — redirect
//   alert("You must be logged in to create an event!");
//   window.location.href = "login.html";
// }

// /JS/add-event.js - Final version with clear success/failure feedback

document.addEventListener("DOMContentLoaded", async () => {
  // Login check + navbar update
  const currentUser = await Auth.getCurrentUser();
  if (!currentUser) {
    alert("You must be logged in to create an event!");
    window.location.href = "login.html";
    return;
  }

  // Navbar update
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

  const form = document.getElementById("add-event-form");
  const successMessage = document.getElementById("successMessage");
  const imageInput = document.getElementById("event-image");
  const imagePreview = document.getElementById("imagePreview");
  const cancelBtn = document.getElementById("cancelBtn");

  // Image preview
  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image too large! Max 5MB.");
        imageInput.value = "";
        imagePreview.innerHTML = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 300px; border-radius: 8px; margin-top: 10px;">`;
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.innerHTML = "";
    }
  });

  cancelBtn.addEventListener("click", () => {
    if (confirm("Cancel event creation?")) {
      window.location.href = "events.html";
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("event-title").value.trim();
    const date = document.getElementById("event-date").value;
    const location = document.getElementById("event-location").value.trim();
    const host = document.getElementById("event-host").value.trim() || currentUser.username;
    const description = document.getElementById("event-description").value.trim();

    if (!title || !date || !location) {
      alert("Title, Date, and Location are required!");
      return;
    }

    let imageUrl = "img/default-event.jpg";

    // Upload image
    if (imageInput.files && imageInput.files[0]) {
      const file = imageInput.files[0];
      const fileName = Date.now() + "_" + file.name.replace(/\s+/g, "_");
      const storageRef = firebase.storage().ref("event-images/" + fileName);

      try {
        const snapshot = await storageRef.put(file);
        imageUrl = await snapshot.ref.getDownloadURL();
      } catch (error) {
        console.error("Image upload failed:", error);
        alert("Image upload failed. Using default image. Error: " + error.message);
        // Continue anyway
      }
    }

    // Create event
    try {
      await firebase.firestore().collection("events").add({
        title,
        date: new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        time: "",
        location,
        host,
        description: description || "No description provided.",
        image: imageUrl,
        createdBy: currentUser.username,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        joinedUsers: []
      });

      // SUCCESS
      form.reset();
      imagePreview.innerHTML = "";
      form.style.display = "none";
      successMessage.style.display = "block";
      console.log("Event created successfully!");
    } catch (error) {
      console.error("Event creation failed:", error);
      alert("Failed to create event: " + error.message);
    }
  });
});