document.getElementById("contact-form").addEventListener("submit", function (e) {
  e.preventDefault();
  
  // Form validation could be added here
  
  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    message: document.getElementById("message").value
  };

  // Consider adding loading state
  const submitBtn = document.querySelector(".submit-btn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  fetch("https://script.google.com/macros/library/d/1Qxlb4DHzCgraCmu-pygjiIavAQVnjS7A-hVctA8XDiWkH9Or6fQc_mQM/1", {
    method: "POST",
    body: JSON.stringify(formData),
    headers: {
      "Content-Type": "application/json",
    },
  })
  .then((res) => {
    if (!res.ok) throw new Error("Network response was not ok");
    return res.json();
  })
  .then((response) => {
    alert("Message sent successfully!");
    document.getElementById("contact-form").reset();
  })
  .catch((err) => {
    console.error("Error:", err);
    alert("There was a problem sending your message. Please try again.");
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Message";
  });
});

// Update copyright year automatically
document.getElementById("current-year").textContent = new Date().getFullYear();
