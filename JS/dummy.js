// /JS/dummy.js - Seed dummy events to Firestore (run once)

document.addEventListener("DOMContentLoaded", async () => {
  if (!firebase) {
    console.log("Firebase not loaded yet");
    return;
  }

  const eventsCollection = firebase.firestore().collection("events");

  // Check if events already exist
  const snapshot = await eventsCollection.limit(1).get();
  if (!snapshot.empty) {
    console.log("Dummy events already seeded in Firestore");
    return;
  }

  console.log("Seeding dummy events to Firestore...");

  const dummyEvents = [
    {
      title: "Tech Summit 2025",
      date: "March 15, 2025 at 9:00 AM",
      time: "9:00 AM",
      location: "San Francisco Convention Center",
      host: "TechCorp Inc.",
      description: "Join us for the biggest tech conference of the year featuring industry leaders and innovative workshops.",
      image: "img/tech-summit-_mLoSSnA.jpeg",
      createdBy: "System",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      joinedUsers: []
    },
    {
      title: "Summer Music Festival",
      date: "June 20, 2025 at 2:00 PM",
      time: "2:00 PM",
      location: "Golden Gate Park",
      host: "SF Music Events",
      description: "A day of live music, food trucks, and fun activities for the whole family.",
      image: "img/music-festival-rjj8OIn4.jpeg",
      createdBy: "System",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      joinedUsers: []
    },
    {
      title: "Startup Networking Mixer",
      date: "June 20, 2025 at 2:00 PM",
      time: "2:00 PM",
      location: "Golden Gate Park",
      host: "SF Music Events",
      description: "A day of live music, food trucks, and fun activities for the whole family.",
      image: "img/networking-km5RcWVi.jpeg",
      createdBy: "System",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      joinedUsers: []
    },
    {
      title: "Yoga in the Park",
      date: "Every Saturday at 8:00 AM",
      time: "8:00 AM",
      location: "Central Park",
      host: "Wellness Group",
      description: "Free outdoor yoga sessions for all skill levels. Bring your mat and join our community!",
      image: "img/yoga-BtrFk1KC.jpeg",
      createdBy: "System",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      joinedUsers: []
    },
    {
      title: "Food & Wine Tasting",
      date: "May 10, 2025 at 7:00 PM",
      time: "7:00 PM",
      location: "Napa Valley Vineyards",
      host: "Culinary Experiences",
      description: "Experience an evening of fine wines paired with gourmet cuisine from local chefs.",
      image: "img/wine-tasting-C3ILvhKT.jpeg",
      createdBy: "System",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      joinedUsers: []
    },
    {
      title: "Photography Workshop",
      date: "April 18, 2025 at 10:00 AM",
      time: "10:00 AM",
      location: "Art District Studio",
      host: "Photos Masters",
      description: "Learn professional photography techniques from award-winning photographers.",
      image: "img/photography-CPWo3ij1.jpeg",
      createdBy: "System",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      joinedUsers: []
    },
    {
      title: "Marathon Training Group",
      date: "Every Sunday at 7:00 AM",
      time: "7:00 AM",
      location: "Water Front Trail",
      host: "Running Club",
      description: "Join our marathon training group for weekly long runs and coaching sessions.",
      image: "img/marathon.jpeg",
      createdBy: "System",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      joinedUsers: []
    },
    {
      title: "Book Club Monthly Meetup",
      date: "First Thursday at 7:30 PM",
      time: "7:30 PM",
      location: "Downtown Library",
      host: "Book Lovers Society",
      description: "Monthly book discussions, author talks, and literary events for book enthusiasts.",
      image: "img/book-club.jpeg",
      createdBy: "System",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      joinedUsers: []
    },
    {
      title: "Coding Bootcamp Workshop",
      date: "April 22, 2025 at 1:00 PM",
      time: "1:00 PM",
      location: "Tech Learning Center",
      host: "Code Academy",
      description: "Intensive hands-on coding workshop covering web development fundamentals.",
      image: "img/coding.jpeg",
      createdBy: "System",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      joinedUsers: []
    }
  ];

  // Add each event to Firestore
  for (const event of dummyEvents) {
    try {
      await eventsCollection.add(event);
      console.log("Added:", event.title);
    } catch (error) {
      console.error("Error adding event:", error);
    }
  }

  console.log("Dummy events seeded to Firestore!");
});