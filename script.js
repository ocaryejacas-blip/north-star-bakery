/* =========================================================
   North Star Bakery — Touchstone 4 JavaScript
   Feature 1: "My Favorites" tracker (products.html)
   Feature 2: Contact form validation (contact.html)
   Feature 3: localStorage for favorites + contact info prefill
   ========================================================= */

/* ---------- Shared storage keys ---------- */
const FAVORITES_KEY = "nsb_favorites";
const CONTACT_INFO_KEY = "nsb_contact_info";

/* =========================================================
   FAVORITES FEATURE
   Data structure: an array of favorite objects
   e.g. [{ id: "sourdough", name: "Classic Sourdough", price: "$7–$9" }]
   ========================================================= */

// Read the favorites array out of localStorage (or start empty)
function getFavorites() {
  const stored = localStorage.getItem(FAVORITES_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Save the favorites array back to localStorage
function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

// Add or remove one product from the favorites array
function toggleFavorite(product) {
  const favorites = getFavorites();
  const existingIndex = favorites.findIndex((item) => item.id === product.id);

  if (existingIndex === -1) {
    favorites.push(product);
  } else {
    favorites.splice(existingIndex, 1);
  }

  saveFavorites(favorites);
  renderFavorites();
  updateFavButtonStates();
  updateFavCountBadge();
}

// Remove a single favorite from the list (used by the "Remove" link)
function removeFavorite(productId) {
  const favorites = getFavorites().filter((item) => item.id !== productId);
  saveFavorites(favorites);
  renderFavorites();
  updateFavButtonStates();
  updateFavCountBadge();
}

// Clear every saved favorite
function clearFavorites() {
  saveFavorites([]);
  renderFavorites();
  updateFavButtonStates();
  updateFavCountBadge();
}

// Rebuild the "My Favorites" list on products.html from the stored array
function renderFavorites() {
  const list = document.getElementById("favorites-list");
  if (!list) return; // this section only exists on products.html

  const favorites = getFavorites();
  list.innerHTML = "";

  if (favorites.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.id = "no-favorites-message";
    emptyItem.textContent = "You haven't added any favorites yet.";
    list.appendChild(emptyItem);
    return;
  }

  favorites.forEach((item) => {
    const listItem = document.createElement("li");

    const label = document.createElement("span");
    label.textContent = `${item.name} (${item.price})`;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-fav-btn";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => removeFavorite(item.id));

    listItem.appendChild(label);
    listItem.appendChild(removeBtn);
    list.appendChild(listItem);
  });
}

// Update every "Add to Favorites" button on the page to reflect saved state
function updateFavButtonStates() {
  const favorites = getFavorites();
  const favButtons = document.querySelectorAll(".fav-btn");

  favButtons.forEach((button) => {
    const isFav = favorites.some((item) => item.id === button.dataset.id);
    button.classList.toggle("is-fav", isFav);
    button.innerHTML = isFav ? "&#9733; Remove from Favorites" : "&#9734; Add to Favorites";
  });
}

// Update the small favorites count shown in the nav bar on every page
function updateFavCountBadge() {
  const badge = document.getElementById("nav-fav-count");
  if (!badge) return;
  badge.textContent = getFavorites().length;
}

// Wire up click events for every favorite button on the page
function initFavoritesFeature() {
  const favButtons = document.querySelectorAll(".fav-btn");

  favButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const product = {
        id: button.dataset.id,
        name: button.dataset.name,
        price: button.dataset.price,
      };
      toggleFavorite(product);
    });
  });

  const clearBtn = document.getElementById("clear-favorites-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearFavorites);
  }

  renderFavorites();
  updateFavButtonStates();
  updateFavCountBadge();
}

/* =========================================================
   CONTACT FORM VALIDATION + PREFILL
   Data structure: an object mapping each field id to its
   validator function, and an object mapping field ids to
   their error-message text.
   ========================================================= */

const fieldValidators = {
  name: validateName,
  email: validateEmail,
  "request-type": validateRequestType,
  "pickup-date": validatePickupDate,
  "item-details": validateItemDetails,
};

function validateName() {
  const field = document.getElementById("name");
  const value = field.value.trim();

  if (value.length === 0) {
    return "Please enter your full name.";
  }
  if (value.length < 2) {
    return "Name must be at least 2 characters long.";
  }
  return "";
}

function validateEmail() {
  const field = document.getElementById("email");
  const value = field.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (value.length === 0) {
    return "Please enter your email address.";
  }
  if (!emailPattern.test(value)) {
    return "Please enter a valid email address (example: name@example.com).";
  }
  return "";
}

function validateRequestType() {
  const field = document.getElementById("request-type");
  if (field.value === "") {
    return "Please choose a request type.";
  }
  return "";
}

// Custom rule: a pickup date is only required for pre-orders, and it
// can't be in the past.
function validatePickupDate() {
  const requestType = document.getElementById("request-type").value;
  const dateField = document.getElementById("pickup-date");
  const value = dateField.value;

  if (requestType === "preorder") {
    if (value === "") {
      return "Please choose a pickup date for your pre-order.";
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosenDate = new Date(value + "T00:00:00");

    if (chosenDate < today) {
      return "Pickup date can't be in the past.";
    }
  }
  return "";
}

function validateItemDetails() {
  const field = document.getElementById("item-details");
  const value = field.value.trim();

  if (value.length === 0) {
    return "Please tell us what you'd like to order or ask about.";
  }
  if (value.length < 5) {
    return "Please add a few more details (at least 5 characters).";
  }
  return "";
}

// Show an error message under a field and mark the field as invalid
function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorSpan = document.getElementById(`${fieldId}-error`);

  field.classList.add("invalid");
  if (errorSpan) {
    errorSpan.textContent = message;
  }
}

// Clear a field's error message and invalid styling
function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  const errorSpan = document.getElementById(`${fieldId}-error`);

  field.classList.remove("invalid");
  if (errorSpan) {
    errorSpan.textContent = "";
  }
}

// Run every validator; returns true only if the whole form is valid
function validateForm() {
  let isFormValid = true;

  Object.keys(fieldValidators).forEach((fieldId) => {
    const validatorFunction = fieldValidators[fieldId];
    const errorMessage = validatorFunction();

    if (errorMessage) {
      showError(fieldId, errorMessage);
      isFormValid = false;
    } else {
      clearError(fieldId);
    }
  });

  return isFormValid;
}

// Save name + email so the form can be pre-filled on a future visit
function saveContactInfo(name, email) {
  localStorage.setItem(CONTACT_INFO_KEY, JSON.stringify({ name, email }));
}

// Pre-fill name + email from localStorage, if we have them saved
function prefillContactInfo() {
  const stored = localStorage.getItem(CONTACT_INFO_KEY);
  if (!stored) return;

  const contactInfo = JSON.parse(stored);
  const nameField = document.getElementById("name");
  const emailField = document.getElementById("email");

  if (nameField && contactInfo.name) nameField.value = contactInfo.name;
  if (emailField && contactInfo.email) emailField.value = contactInfo.email;
}

function handleContactFormSubmit(event) {
  event.preventDefault();

  const isValid = validateForm();
  const successMessage = document.getElementById("form-success-message");

  if (!isValid) {
    successMessage.hidden = true;
    return;
  }

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  saveContactInfo(name, email);

  successMessage.hidden = false;
  successMessage.textContent = `Thanks, ${name}! Your request has been received — we'll reply at ${email} soon.`;
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return; // only exists on contact.html

  prefillContactInfo();
  form.addEventListener("submit", handleContactFormSubmit);

  // Re-validate a field as soon as the user fixes it and moves on
  Object.keys(fieldValidators).forEach((fieldId) => {
    const field = document.getElementById(fieldId);
    field.addEventListener("blur", () => {
      const errorMessage = fieldValidators[fieldId]();
      if (errorMessage) {
        showError(fieldId, errorMessage);
      } else {
        clearError(fieldId);
      }
    });
  });
}

/* =========================================================
   RUN ON EVERY PAGE LOAD
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  initFavoritesFeature();
  initContactForm();
  updateFavCountBadge();
});
