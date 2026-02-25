(function () {
  const form = document.getElementById("contactForm");
  const alertBox = document.getElementById("formAlert");
  const submitBtn = document.getElementById("submitBtn");
  const spinner = document.getElementById("btnSpinner");

  // Fields
  const fullName = document.getElementById("fullName");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const date = document.getElementById("date");
  const tourType = document.getElementById("tourType");
  const tourSelect = document.getElementById("tour");
  const message = document.getElementById("message");
  const consent = document.getElementById("consent");
  const honeypot = document.getElementById("website");

  // Errors
  const errors = {
    fullName: document.getElementById("error-fullName"),
    email: document.getElementById("error-email"),
    phone: document.getElementById("error-phone"),
    date: document.getElementById("error-date"),
    tourType: document.getElementById("error-tourType"),
    contactPref: document.getElementById("error-contactPref"),
    message: document.getElementById("error-message"),
    consent: document.getElementById("error-consent"),
  };

  // Date constraints
  const today = new Date();
  const iso = (d) => d.toISOString().split("T")[0];
  const addDays = (d, days) => {
    const c = new Date(d);
    c.setDate(c.getDate() + days);
    return c;
  };
  date.min = iso(addDays(today, 1));

  date.addEventListener("change", () => {
    if (date.value) {
      const d = new Date(date.value);
    }
  });

  // Travellers steppers
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
  const adults = document.getElementById("adults");
  const children = document.getElementById("children");
  const step = (input, delta, min, max) => {
    input.value = clamp(parseInt(input.value || "0", 10) + delta, min, max);
  };
  document
    .querySelector(".adult-minus")
    .addEventListener("click", () => step(adults, -1, 1, 20));
  document
    .querySelector(".adult-plus")
    .addEventListener("click", () => step(adults, +1, 1, 20));
  document
    .querySelector(".child-minus")
    .addEventListener("click", () => step(children, -1, 0, 20));
  document
    .querySelector(".child-plus")
    .addEventListener("click", () => step(children, +1, 0, 20));

  // Preferred contact: if phone/whatsapp -> phone required
  const contactRadios = Array.from(
    document.querySelectorAll('input[name="contactPref"]'),
  );
  const setPhoneRequirement = () => {
    const pref = contactRadios.find((r) => r.checked)?.value || "email";
    const needPhone = pref === "phone" || pref === "whatsapp";
    phone.required = needPhone;
    if (!needPhone) {
      clearError("phone");
      phone.classList.remove("ring-1", "ring-rose-500", "border-rose-500");
      phone.removeAttribute("aria-invalid");
    }
  };
  contactRadios.forEach((r) =>
    r.addEventListener("change", setPhoneRequirement),
  );
  setPhoneRequirement();

  // Error helpers
  function showError(field, msg) {
    const el = errors[field.id] || errors[field];
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("hidden");
    field.classList.add("ring-1", "ring-rose-500", "border-rose-500");
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", el.id);
  }
  function clearError(field) {
    const id = typeof field === "string" ? field : field.id;
    const el = errors[id];
    if (el) {
      el.textContent = "";
      el.classList.add("hidden");
    }
    const input =
      typeof field === "string" ? document.getElementById(field) : field;
    if (input) {
      input.classList.remove("ring-1", "ring-rose-500", "border-rose-500");
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
    }
  }
  [fullName, email, phone, date, tourType, message, consent].forEach((i) => {
    i.addEventListener("input", () => clearError(i));
    i.addEventListener("change", () => clearError(i));
  });

  // Email simple check
  const validEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  // Validate Tour Type
  const availableTours = ["Scenic Flights", "Snorkeling / Scuba Diving", "Catamaran Tours"];

  // ! Handle tour based on tour type
  const scenicFlightTours = ["Scenic Airplane flight", "Scenic Helicopter flight"];
  const scubaorSnorkelTours = ["Full Day Snorkeling Tour", "Full Day Scuba Diving"];
  const catamaranTours = ["Catamaran Cruises"];

  const handleTourDropdown = () => {
    // Handle tour options based on tour type selection
    const selectedTour = tourType.value;

    let options = [];
    if (selectedTour === "Scenic Flights") {
      options = scenicFlightTours;
    }
    else if (selectedTour === "Snorkeling / Scuba Diving") {
      options = scubaorSnorkelTours;
    }
    else if (selectedTour === "Catamaran Tours") {
      options = catamaranTours;
    }
    tourSelect.innerHTML = options.map(o => `<option value="${o}">${o}</option>`).join("");
  };

  // Tour type and tour handler
  document.addEventListener("DOMContentLoaded", () => {
    // If Url Params exist, preselect tour type and tour
    const urlParams = new URLSearchParams(document.location.search);
    const serviceType = urlParams.get("servicetype");
    const service = urlParams.get("service");

    if (serviceType) {
      if (availableTours.includes(serviceType)) {
        tourType.value = serviceType;
      }
    }

    let currentTours;
    // Determine what tour is selected
    if (tourType.value == availableTours[0]) {
      currentTours = scenicFlightTours;
    }
    else if (tourType.value == availableTours[1]) {
      currentTours = scubaorSnorkelTours;
    }
    else if (tourType.value == availableTours[2]) {
      currentTours = catamaranTours;
    }

    handleTourDropdown();

    if (service) {
      if (currentTours.includes(service)) {
        tourSelect.value = service;
      }
    }
  });

  tourType.addEventListener("change", handleTourDropdown);

  // Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (honeypot.value) return; // bot

    let valid = true;
    // Required checks
    if (!fullName.value.trim()) {
      showError(fullName, "Please enter your full name.");
      valid = false;
    }
    if (!email.value.trim() || !validEmail(email.value.trim())) {
      showError(email, "Enter a valid email address.");
      valid = false;
    }
    if (!phone.value.trim() || phone.value === "") {
      console.log("Phone is required");
      showError(
        phone,
        "Phone number is required for your selected contact method."
      );
      valid = false;
    }

    // Validate Date
	const selectedDate = new Date(date.value);
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate());

	if (!date.value || selectedDate < tomorrow) {
		showError(date, "Please select a valid date.");
    	valid = false;
	}

    // Tour Type
    const validTourType = (val) => availableTours.includes(val);
    if (!validTourType(tourType.value)) {
      showError(tourType, "Please select a valid tour type.");
      return;
    }
    if (!message.value.trim()) {
      showError(message, "Please tell us a bit about your trip.");
      valid = false;
    }
    if (!consent.checked) {
      showError(consent, "You must agree before submitting.");
      valid = false;
    }

    // Contact preference error (unlikely needed, but handled)
    const pref = contactRadios.find((r) => r.checked);
    if (!pref) {
      errors.contactPref.textContent = "Please select a contact method.";
      errors.contactPref.classList.remove("hidden");
      valid = false;
    } else {
      errors.contactPref.classList.add("hidden");
    }

    if (!valid) return;

    // Simulate submission
    spinner.classList.remove("hidden");
    submitBtn.disabled = true;
    submitBtn.classList.add("opacity-80", "cursor-not-allowed");

    // captcha front end validation
    const hCaptcha = form.querySelector('textarea[name=h-captcha-response]').value;

    if (!hCaptcha) {
        window.alert("Please fill out captcha field");
		spinner.classList.add("hidden");
		submitBtn.disabled = false;
		submitBtn.classList.remove("opacity-80", "cursor-not-allowed");
        return;
    }

    const formData = new FormData(form);

    const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
    });

    const result = await response.json();

    if (result.success) {
        // Success
        setTimeout(() => {
          spinner.classList.add("hidden");
          submitBtn.disabled = false;
          submitBtn.classList.remove("opacity-80", "cursor-not-allowed");

          alertBox.classList.remove("hidden");

          // Reset form (except newsletter)
          form.reset();
          setPhoneRequirement();
          adults.value = 2;
          children.value = 0;

          // Reset date mins again after reset (some browsers clear)
          date.min = iso(addDays(new Date(), 1));
          ret.min = iso(addDays(new Date(), 2));

          // Hide alert after a while
          setTimeout(() => alertBox.classList.add("hidden"), 6000);
        }, 1200);
        form.reset();
        // optionalMenuContainer.innerHTML = "";
    } else {
		alert("Something went wrong. Please try again.");
		spinner.classList.add("hidden");
		submitBtn.disabled = false;
		submitBtn.classList.remove("opacity-80", "cursor-not-allowed");
    }
  });
})();
