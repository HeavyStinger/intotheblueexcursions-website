(function () {
  const form = document.getElementById("contactForm");
  const alertBox = document.getElementById("formAlert");
  const submitBtn = document.getElementById("submitBtn");
  const spinner = document.getElementById("btnSpinner");

  // Fields
  const fullName = document.getElementById("fullName");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const arrival = document.getElementById("arrival");
  const ret = document.getElementById("depart");
  const message = document.getElementById("message");
  const consent = document.getElementById("consent");
  const honeypot = document.getElementById("website");

  // Errors
  const errors = {
    fullName: document.getElementById("error-fullName"),
    email: document.getElementById("error-email"),
    phone: document.getElementById("error-phone"),
    arrival: document.getElementById("error-arrival"),
    return: document.getElementById("error-depart"),
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
  arrival.min = iso(addDays(today, 1));
  ret.min = iso(addDays(today, 2));

  arrival.addEventListener("change", () => {
    if (arrival.value) {
      const d = new Date(arrival.value);
      const minReturn = addDays(d, 1);
      ret.min = iso(minReturn);
      if (ret.value && new Date(ret.value) <= d) {
        ret.value = iso(minReturn);
      }
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
  [fullName, email, phone, arrival, ret, message, consent].forEach((i) => {
    i.addEventListener("input", () => clearError(i));
    i.addEventListener("change", () => clearError(i));
  });

  // Email simple check
  const validEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

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
    if (phone.required && !phone.value.trim()) {
      showError(
        phone,
        "Phone number is required for your selected contact method.",
      );
      valid = false;
    }
    if (!arrival.value) {
      showError(arrival, "Please select your arrivalure date.");
      valid = false;
    }
    if (!ret.value) {
      showError(ret, "Please select your return date.");
      valid = false;
    }
    if (
      arrival.value &&
      ret.value &&
      new Date(ret.value) <= new Date(arrival.value)
    ) {
      showError(ret, "Return date must be after arrivalure date.");
      valid = false;
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
          arrival.min = iso(addDays(new Date(), 1));
          ret.min = iso(addDays(new Date(), 2));

          // Hide alert after a while
          setTimeout(() => alertBox.classList.add("hidden"), 6000);
        }, 1200);
        form.reset();
        // optionalMenuContainer.innerHTML = "";
    } else {
        alert("Something went wrong. Please try again.");
    }
  });
})();
