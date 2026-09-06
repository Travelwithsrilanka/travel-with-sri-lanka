import {
  createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


// =========================================================
// SUPABASE
// =========================================================

const SUPABASE_URL =
  "https://vbbmnzqrvoceqbwwwsrc.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_HZ1A8CURkRFs0v21FUT0VA_44dtPzr3";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


// =========================================================
// PAGE READY
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

  initMobileMenu();

  initTripForm();

  initStarRating();

  initReviewPhotoPreview();

  initReviewForm();

  loadDestinations();

  loadTours();

  loadReviews();

});


// =========================================================
// MOBILE MENU
// =========================================================

function initMobileMenu() {

  const menuBtn =
    document.getElementById("menuBtn");

  const nav =
    document.querySelector(".mainNav");

  if (!menuBtn || !nav) return;

  menuBtn.addEventListener("click", () => {

    nav.classList.toggle("active");

  });

  nav.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {

      nav.classList.remove("active");

    });

  });

}


// =========================================================
// TRIP PLANNER
// =========================================================

function initTripForm() {

  const form =
    document.getElementById("tripForm");

  if (!form) return;

  form.addEventListener("submit", (event) => {

    event.preventDefault();

    const name =
      document.getElementById("name")?.value.trim() || "";

    const country =
      document.getElementById("country")?.value.trim() || "";

    const date =
      document.getElementById("date")?.value || "";

    const guests =
      document.getElementById("guests")?.value || "";

    const message =
      document.getElementById("message")?.value.trim() || "";

    const whatsappMessage =
      `Hello Travel With Sri Lanka!

Name: ${name}
Country: ${country}
Travel Date: ${date || "Not specified"}
Guests: ${guests || "Not specified"}

Trip Details:
${message}`;

    const whatsappURL =
      `https://wa.me/94758453391?text=${encodeURIComponent(
        whatsappMessage
      )}`;

    window.open(
      whatsappURL,
      "_blank",
      "noopener"
    );

  });

}


// =========================================================
// STAR RATING
// =========================================================

function initStarRating() {

  const starRating =
    document.getElementById("starRating");

  const ratingInput =
    document.getElementById("reviewRating");

  if (!starRating || !ratingInput) return;

  const stars =
    starRating.querySelectorAll("[data-rating]");

  function updateStars(rating) {

    stars.forEach(star => {

      const value =
        Number(star.dataset.rating);

      star.classList.toggle(
        "active",
        value <= rating
      );

    });

  }

  stars.forEach(star => {

    star.addEventListener("click", () => {

      const rating =
        Number(star.dataset.rating);

      ratingInput.value =
        rating;

      updateStars(rating);

    });

  });

  updateStars(
    Number(ratingInput.value) || 5
  );

}


// =========================================================
// REVIEW PHOTO PREVIEW
// =========================================================

function initReviewPhotoPreview() {

  const input =
    document.getElementById("reviewPhoto");

  const preview =
    document.getElementById("photoPreview");

  if (!input || !preview) return;

  input.addEventListener("change", () => {

    preview.innerHTML = "";

    const file =
      input.files?.[0];

    if (!file) return;

    const image =
      document.createElement("img");

    image.src =
      URL.createObjectURL(file);

    image.alt =
      "Review photo preview";

    preview.appendChild(image);

  });

}


// =========================================================
// LOAD DESTINATIONS
// =========================================================

async function loadDestinations() {

  const container =
    document.querySelector(".cardGrid");

  if (!container) return;

  const {
    data,
    error
  } = await supabase
    .from("destinations")
    .select(`
      id,
      name,
      slug,
      description,
      image_url,
      page_url,
      sort_order
    `)
    .order(
      "sort_order",
      {
        ascending: true
      }
    );

  if (error) {

    console.error(
      "Destinations load error:",
      error
    );

    return;

  }

  if (!data) return;

  // Clear old hardcoded destination cards
  container.innerHTML = "";

  // Create cards from Supabase
  data.forEach(destination => {

    container.appendChild(
      createDestinationCard(destination)
    );

  });

}


// =========================================================
// CREATE DESTINATION CARD
// =========================================================

function createDestinationCard(destination) {

  const card =
    document.createElement("article");

  card.className =
    "card";

  card.dataset.slug =
    destination.slug || "";

  const photo =
    document.createElement("div");

  photo.className =
    "photo";

  const image =
    document.createElement("img");

  image.loading =
    "lazy";

  image.alt =
    `${destination.name || "Sri Lanka"} Sri Lanka`;

  image.src =
    destination.image_url ||
    "images/hero.jpg";

  image.dataset.dynamicImage =
    destination.slug || "";

  photo.appendChild(image);


  const content =
    document.createElement("div");

  content.className =
    "cardContent";


  const title =
    document.createElement("h3");

  title.textContent =
    destination.name || "";

  title.dataset.dynamicName =
    destination.slug || "";


  const description =
    document.createElement("p");

  description.textContent =
    destination.description || "";

  description.dataset.dynamicDescription =
    destination.slug || "";


  const link =
    document.createElement("a");

  link.className =
    "textLink";

  link.textContent =
    "Discover →";

  link.dataset.dynamicLink =
    destination.slug || "";

  link.href =
    safePageUrl(
      destination.page_url
    );


  content.appendChild(title);

  content.appendChild(description);

  content.appendChild(link);

  card.appendChild(photo);

  card.appendChild(content);

  return card;

}


// =========================================================
// LOAD TOURS
// =========================================================

async function loadTours() {

  const container =
    document.querySelector(".tourGrid");

  if (!container) return;

  const {
    data,
    error
  } = await supabase
    .from("tours")
    .select(`
      id,
      title,
      slug,
      description,
      image_url,
      page_url,
      sort_order
    `)
    .order(
      "sort_order",
      {
        ascending: true
      }
    );

  if (error) {

    console.error(
      "Tours load error:",
      error
    );

    return;

  }

  if (!data) return;

  // Clear old hardcoded tour cards
  container.innerHTML = "";

  // Create cards from Supabase
  data.forEach(tour => {

    container.appendChild(
      createTourCard(tour)
    );

  });

}


// =========================================================
// CREATE TOUR CARD
// =========================================================

function createTourCard(tour) {

  const card =
    document.createElement("article");

  card.className =
    "tourCard";

  card.dataset.slug =
    tour.slug || "";


  const picture =
    document.createElement("div");

  picture.className =
    "tourPic";


  const image =
    document.createElement("img");

  image.loading =
    "lazy";

  image.alt =
    `${tour.title || "Sri Lanka Tour"} Sri Lanka`;

  image.src =
    tour.image_url ||
    "images/hero.jpg";

  image.dataset.dynamicImage =
    tour.slug || "";


  picture.appendChild(image);


  const body =
    document.createElement("div");

  body.className =
    "tourBody";


  const title =
    document.createElement("h3");

  title.textContent =
    tour.title || "";

  title.dataset.dynamicName =
    tour.slug || "";


  const description =
    document.createElement("p");

  description.textContent =
    tour.description || "";

  description.dataset.dynamicDescription =
    tour.slug || "";


  const link =
    document.createElement("a");

  link.className =
    "textLink";

  link.textContent =
    "Plan This Tour →";

  link.dataset.dynamicLink =
    tour.slug || "";


  if (tour.page_url) {

    link.href =
      safePageUrl(
        tour.page_url
      );

  } else {

    link.href =
      "#planner";

  }


  body.appendChild(title);

  body.appendChild(description);

  body.appendChild(link);


  card.appendChild(picture);

  card.appendChild(body);


  return card;

}


// =========================================================
// SAFE PAGE URL
// =========================================================

function safePageUrl(url) {

  if (!url) {

    return "#";

  }

  const value =
    String(url).trim();


  if (
    value.startsWith("/") ||
    value.startsWith("./") ||
    value.startsWith("../") ||
    value.startsWith("#")
  ) {

    return value;

  }


  try {

    const parsed =
      new URL(
        value,
        window.location.origin
      );


    if (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:"
    ) {

      return value;

    }

  } catch (error) {

    console.warn(
      "Invalid page URL:",
      url
    );

  }


  return "#";

}


// =========================================================
// REVIEW FORM
// =========================================================

function initReviewForm() {

  const form =
    document.getElementById("reviewForm");

  if (!form) return;

  form.addEventListener(
    "submit",
    submitReview
  );

}


// =========================================================
// SUBMIT REVIEW
// =========================================================

async function submitReview(event) {

  event.preventDefault();

  const submitButton =
    document.getElementById("reviewSubmit");

  const status =
    document.getElementById("reviewStatus");


  const name =
    document.getElementById("reviewName")
      ?.value.trim() || "";


  const country =
    document.getElementById("reviewCountry")
      ?.value.trim() || "";


  const rating =
    Number(
      document.getElementById("reviewRating")
        ?.value || 5
    );


  const reviewText =
    document.getElementById("reviewText")
      ?.value.trim() || "";


  const photoInput =
    document.getElementById("reviewPhoto");


  const file =
    photoInput?.files?.[0] || null;


  if (!name || !country || !reviewText) {

    if (status) {

      status.textContent =
        "Please fill all required fields.";

    }

    return;

  }


  if (submitButton) {

    submitButton.disabled =
      true;

    submitButton.textContent =
      "Submitting...";

  }


  if (status) {

    status.textContent =
      "";

  }


  try {

    let photoUrl =
      null;


    // =====================================================
    // UPLOAD REVIEW PHOTO
    // =====================================================

    if (file) {

      const extension =
        file.name
          .split(".")
          .pop()
          .toLowerCase();


      const safeName =
        name
          .toLowerCase()
          .replace(
            /[^a-z0-9]+/g,
            "-"
          )
          .replace(
            /^-+|-+$/g,
            ""
          );


      const filePath =
        `${safeName || "review"}-${Date.now()}.${extension}`;


      const {
        error: uploadError
      } = await supabase
        .storage
        .from("review-photos")
        .upload(
          filePath,
          file,
          {
            upsert: false
          }
        );


      if (uploadError) {

        throw uploadError;

      }


      const {
        data: publicData
      } =
        supabase
          .storage
          .from("review-photos")
          .getPublicUrl(
            filePath
          );


      photoUrl =
        publicData.publicUrl;

    }


    // =====================================================
    // INSERT REVIEW
    // =====================================================

    const {
      error
    } = await supabase
      .from("reviews")
      .insert({

        name,

        country,

        rating,

        review_text: reviewText,

        photo_url: photoUrl

      });


    if (error) {

      throw error;

    }


    if (status) {

      status.textContent =
        "Thank you! Your review has been submitted.";

    }


    event.target.reset();


    const ratingInput =
      document.getElementById(
        "reviewRating"
      );


    if (ratingInput) {

      ratingInput.value =
        5;

    }


    const preview =
      document.getElementById(
        "photoPreview"
      );


    if (preview) {

      preview.innerHTML =
        "";

    }


    initStarRating();

    await loadReviews();

  }

  catch (error) {

    console.error(
      "Review submission error:",
      error
    );


    if (status) {

      status.textContent =
        "Something went wrong. Please try again.";

    }

  }

  finally {

    if (submitButton) {

      submitButton.disabled =
        false;

      submitButton.textContent =
        "Submit Review";

    }

  }

}


// =========================================================
// LOAD REVIEWS
// =========================================================

async function loadReviews() {

  const container =
    document.getElementById(
      "reviewsContainer"
    );

  if (!container) return;


  container.innerHTML =
    `<p class="reviewsLoading">Loading reviews...</p>`;


  const {
    data,
    error
  } = await supabase
    .from("reviews")
    .select("*")
    .order(
      "created_at",
      {
        ascending: false
      }
    );


  if (error) {

    console.error(
      "Reviews load error:",
      error
    );


    container.innerHTML =
      `<p class="noReviews">Unable to load reviews.</p>`;

    return;

  }


  if (!data || data.length === 0) {

    container.innerHTML =
      `<p class="noReviews">No reviews yet.</p>`;

    return;

  }


  container.innerHTML =
    "";


  data.forEach(review => {

    container.appendChild(
      createReviewCard(review)
    );

  });

}


// =========================================================
// CREATE REVIEW CARD
// =========================================================

function createReviewCard(review) {

  const card =
    document.createElement("article");

  card.className =
    "reviewCard";


  const stars =
    "★".repeat(
      Math.max(
        0,
        Math.min(
          5,
          Number(review.rating) || 0
        )
      )
    );


  const safeName =
    escapeHTML(
      review.name || "Traveler"
    );


  const safeCountry =
    escapeHTML(
      review.country || ""
    );


  const safeText =
    escapeHTML(
      review.review_text || ""
    );


  card.innerHTML = `

    ${
      review.photo_url
        ? `
          <img
            class="reviewPhoto"
            src="${escapeAttribute(review.photo_url)}"
            alt="Traveler review photo"
            loading="lazy"
          >
        `
        : ""
    }

    <div>

      <div class="starRating">
        ${stars}
      </div>

      <p>
        ${safeText}
      </p>

      <strong>
        ${safeName}
      </strong>

      <span>
        ${safeCountry}
      </span>

    </div>

  `;


  return card;

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


// =========================================================
// ESCAPE ATTRIBUTE
// =========================================================

function escapeAttribute(value) {

  return escapeHTML(value);

}
