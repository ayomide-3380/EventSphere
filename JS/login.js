// /JS/login.js - Firebase version with admin redirect

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const btn = document.getElementById("login-btn");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      alert("Both fields are required");
      return;
    }

    const user = await Auth.login(email, password);

    if (user) {
      alert("Login successful!");

      // Redirect admin to dashboard
      if (email === "alaoayomide700@gmail.com") {
        window.location.href = "admin_dashboard.html";
      } else {
        window.location.href = "events.html"; // or "index.html"
      }
    }
  });

  if (btn) {
    btn.addEventListener("click", () => {
      if (form.checkValidity()) {
        form.requestSubmit();
      } else {
        form.reportValidity();
      }
    });
  }
});