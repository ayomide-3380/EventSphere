// /JS/auth.js

const Auth = {
  async register(username, email, password) {
    try {
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await firebase.firestore().collection("users").doc(user.uid).set({
        username,
        email,
        isAdmin: email === "alaoayomide700@gmail.com",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      alert("Registration successful!");
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed: " + error.message);
      return false;
    }
  },

  async login(email, password) {
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      const docSnap = await firebase.firestore().collection("users").doc(user.uid).get();

      if (docSnap.exists) {
        const userData = docSnap.data();

        if (email === "alaoayomide700@gmail.com" && !userData.isAdmin) {
          await firebase.firestore().collection("users").doc(user.uid).update({ isAdmin: true });
          userData.isAdmin = true;
        }

        return { uid: user.uid, ...userData };
      }
      return null;
    } catch (error) {
      console.error("Login error:", error);
      if (error.code === "auth/invalid-login-credentials" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
        alert("Invalid email or password. Please try again.");
      } else {
        alert("Login failed: " + error.message);
      }
      return null;
    }
  },

  async logout() {
    try {
      await firebase.auth().signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  getCurrentUser() {
    return new Promise((resolve) => {
      const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
        unsubscribe();
        if (user) {
          const docSnap = await firebase.firestore().collection("users").doc(user.uid).get();
          if (docSnap.exists) {
            resolve({ uid: user.uid, ...docSnap.data() });
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  },

  isLoggedIn() {
    return firebase.auth().currentUser !== null;
  },

  async isAdmin() {
    const user = await this.getCurrentUser();
    return user && user.isAdmin === true;
  }
};

// navbar.js

document.addEventListener("DOMContentLoaded", async () => {
  const welcomeMessage = document.getElementById("welcome-message");
  const addEventLink = document.getElementById("add-event-link");
  const logoutLink = document.getElementById("logout-link");
  const loginLink = document.getElementById("login-link");
  const registerLink = document.getElementById("register-link");

  const currentUser = await Auth.getCurrentUser();

  if (currentUser) {
    welcomeMessage.textContent = `Welcome, ${currentUser.username || "User"}!`;
    welcomeMessage.style.display = "inline";
    addEventLink.style.display = "inline";
    logoutLink.style.display = "inline";
    loginLink.style.display = "none";
    registerLink.style.display = "none";

    logoutLink.addEventListener("click", async (e) => {
      e.preventDefault();
      await Auth.logout();
      window.location.reload();  // Refresh to update navbar
    });
  } else {
    welcomeMessage.style.display = "none";
    addEventLink.style.display = "none";
    logoutLink.style.display = "none";
    loginLink.style.display = "inline";
    registerLink.style.display = "inline";
  }
});