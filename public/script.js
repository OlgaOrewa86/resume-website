let menu = document.querySelector("#menu-icon");
let navbar = document.querySelector(".navbar");

// Toggles navbar visibility on menu icon click
menu.onclick = () => {
  menu.classList.toggle("bx-x");
  navbar.classList.toggle("active");
};

window.onscroll = () => {
  menu.classList.remove("bx-x");
  navbar.classList.remove("active");
};

// Initializes animated typing effect for roles
const typed = new Typed(".multiple-text", {
  strings: ["Web Developer", "Backend Developer", "Full-Stack Developer"],
  typeSpeed: 80,
  backSpeed: 80,
  backDelay: 1200,
  loop: true,
});

document.getElementById("download-btn").addEventListener("click", function () {
  const cvPath = "public/assets/Resume_Olga_Nikiforov.pdf";
  window.open(cvPath, "_blank"); // Opens the CV in a new tab
});

// Sets toast color: green for success, red for error
function showToast(message, success = true) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.display = "flex";
  toast.style.backgroundColor = success ? "#28a745" : "#dc3545"; // Green for success, red for errors

  setTimeout(() => {
    toast.style.display = "none";
  }, 3000); // Message disappears after 3 seconds
}

// Ensures all form fields are properly filled before submission
function validateForm() {
  const fullName = document
    .querySelector("input[placeholder='Full Name']")
    .value.trim();
  const email = document.querySelector("input[name='Email']").value.trim();
  const phone = document
    .querySelector("input[placeholder='Phone Number']")
    .value.trim();
  const subject = document
    .querySelector("input[placeholder='Email Subject']")
    .value.trim();
  const message = document.querySelector("textarea").value.trim();

  if (!fullName || !email || !phone || !subject || !message) {
    showToast("❌ All fields must be filled out!", false);
    return false;
  }

  if (!validateEmail(email)) {
    showToast("❌ Invalid email format!", false);
    return false;
  }

  return true;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Sends form data to backend for email processing
document.querySelector("form").addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateForm()) return;

  const form = event.target; // Reference the form element

  const formData = {
    fullName: document.querySelector("input[placeholder='Full Name']").value,
    email: document.querySelector("input[name='Email']").value,
    phone: document.querySelector("input[placeholder='Phone Number']").value,
    subject: document.querySelector("input[placeholder='Email Subject']").value,
    message: document.querySelector("textarea").value,
  };

  try {
    const API_URL = window.location.hostname.includes("localhost")
      ? "http://localhost:5000/send-email"
      : "https://resume-website-ujqy.onrender.com/send-email";

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (response.ok) {
      showToast("✅ Email sent successfully!", true);
      form.reset(); //Clear all fields only if email sends successfully
    } else {
      showToast("❌ Error sending email: " + result.error, false);
    }
  } catch (error) {
    showToast("❌ Unexpected error occurred while sending email.", false);
  }
});
