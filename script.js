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
    starRating.querySelectorAll(
      "[data-rating]"
    );


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

      ratingInput.value = rating;

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


  data.forEach(destination => {

    updateDestination(
      destination
    );

  });

}


// =========================================================
// UPDATE DESTINATION
// =========================================================

function updateDestination(destination) {

  if (!destination.slug) return;


  const slug =
    String(destination.slug)
      .trim()
      .toLowerCase();


  const card =
    document.querySelector(
      `.card[data-slug="${CSS.escape(slug)}"]`
    );


  if (!card) {

    console.warn(
      "Destination card not found:",
      slug
    );

    return;

  }


  // IMAGE

  const image =
    card.querySelector(
      "[data-dynamic-image]"
    );


  if (image && destination.image_url) {

    image.src =
      destination.image_url;

  }


  // NAME

  const name =
    card.querySelector(
      "[data-dynamic-name]"
    );


  if (name) {

    name.textContent =
      destination.name || "";

  }


  // DESCRIPTION

  const description =
    card.querySelector(
      "[data-dynamic-description]"
    );


  if (description) {

    description.textContent =
      destination.description || "";

  }


  // PAGE URL

  const link =
    card.querySelector(
      "[data-dynamic-link]"
    );


  if (link && destination.page_url) {

    link.href =
      destination.page_url;

  }


  // IMAGE ALT

  if (image && destination.name) {

    image.alt =
      `${destination.name} Sri Lanka`;

  }

}


// =========================================================
// LOAD TOURS
// =========================================================

async function loadTours() {

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


  data.forEach(tour => {

    updateTour(tour);

  });

}


// =========================================================
// UPDATE TOUR
// =========================================================

function updateTour(tour) {

  if (!tour.slug) return;


  const slug =
    String(tour.slug)
      .trim()
      .toLowerCase();


  const card =
    document.querySelector(
      `.tourCard[data-slug="${CSS.escape(slug)}"]`
    );


  if (!card) {

    console.warn(
      "Tour card not found:",
      slug
    );

    return;

  }


  // IMAGE

  const image =
    card.querySelector(
      "[data-dynamic-image]"
    );


  if (image && tour.image_url) {

    image.src =
      tour.image_url;

  }


  // TITLE

  const title =
    card.querySelector(
      "[data-dynamic-name]"
    );


  if (title) {

    title.textContent =
      tour.title || "";

  }


  // DESCRIPTION

  const description =
    card.querySelector(
      "[data-dynamic-description]"
    );


  if (description) {

    description.textContent =
      tour.description || "";

  }


  // PAGE URL

  const link =
    card.querySelector(
      "[data-dynamic-link]"
    );


  if (link && tour.page_url) {

    link.href =
      tour.page_url;

  }


  // IMAGE ALT

  if (image && tour.title) {

    image.alt =
      `${tour.title} Sri Lanka`;

  }

}


// =========================================================
// REVIEW FORM
// =========================================================

function initReviewForm() {

  const form =
    document.getElementById(
      "reviewForm"
    );


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
    document.getElementById(
      "reviewSubmit"
    );

  const status =
    document.getElementById(
      "reviewStatus"
    );


  const name =
    document.getElementById(
      "reviewName"
    )?.value.trim() || "";


  const country =
    document.getElementById(
      "reviewCountry"
    )?.value.trim() || "";


  const rating =
    Number(
      document.getElementById(
        "reviewRating"
      )?.value || 5
    );


  const reviewText =
    document.getElementById(
      "reviewText"
    )?.value.trim() || "";


  const photoInput =
    document.getElementById(
      "reviewPhoto"
    );


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
    document.createElement(
      "article"
    );


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
