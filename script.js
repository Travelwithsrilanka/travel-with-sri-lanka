// =========================================================
// TRAVEL WITH SRI LANKA
// MAIN WEBSITE SCRIPT
// Supabase Dynamic Content + Reviews
// =========================================================

import { createClient } from
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


// =========================================================
// SUPABASE
// =========================================================

const SUPABASE_URL =
  "https://vbbmnzqrvoceqbwwwsrc.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_HZ1A8CURkRFs0v21FUT0VA_44dtPzr3";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// =========================================================
// DOM READY
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
    document.querySelector(".menuBtn") ||
    document.querySelector("#menuBtn") ||
    document.querySelector(".hamburger");

  const nav =
    document.querySelector("nav") ||
    document.querySelector(".nav");

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

  const form = document.getElementById("tripForm");

  if (!form) return;

  form.addEventListener("submit", async (e) => {

    e.preventDefault();

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

    const text = `
Hello Travel With Sri Lanka,

Name: ${name}
Country: ${country}
Travel Date: ${date}
Guests: ${guests}

Message:
${message}
    `.trim();

    const whatsappURL =
      `https://wa.me/94758453391?text=${encodeURIComponent(text)}`;

    window.open(whatsappURL, "_blank");

  });

}


// =========================================================
// STAR RATING
// =========================================================

let selectedRating = 5;

function initStarRating() {

  const stars =
    document.querySelectorAll(".star");

  const ratingInput =
    document.getElementById("reviewRating");

  const ratingContainer =
    document.getElementById("starRating");

  if (!stars.length) return;

  stars.forEach((star, index) => {

    const rating = index + 1;

    star.addEventListener("click", () => {

      selectedRating = rating;

      if (ratingInput) {
        ratingInput.value = rating;
      }

      updateStars(rating);

    });

    star.addEventListener("mouseenter", () => {
      updateStars(rating);
    });

  });

  if (ratingContainer) {

    ratingContainer.addEventListener("mouseleave", () => {
      updateStars(selectedRating);
    });

  }

  updateStars(selectedRating);

}


function updateStars(rating) {

  const stars =
    document.querySelectorAll(".star");

  stars.forEach((star, index) => {

    if (index < rating) {
      star.classList.add("active");
      star.textContent = "★";
    } else {
      star.classList.remove("active");
      star.textContent = "☆";
    }

  });

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

    const file = input.files?.[0];

    if (!file) {

      preview.innerHTML = "";
      preview.style.display = "none";

      return;
    }

    const url =
      URL.createObjectURL(file);

    preview.innerHTML = `
      <img
        src="${url}"
        alt="Review photo preview"
        style="
          width:120px;
          height:120px;
          object-fit:cover;
          border-radius:12px;
          margin-top:10px;
        "
      >
    `;

    preview.style.display = "block";

  });

}


// =========================================================
// REVIEW FORM
// =========================================================

function initReviewForm() {

  const form =
    document.getElementById("reviewForm");

  if (!form) return;

  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const submitBtn =
      document.getElementById("reviewSubmit");

    const status =
      document.getElementById("reviewStatus");

    const name =
      document.getElementById("reviewName")?.value.trim() || "";

    const country =
      document.getElementById("reviewCountry")?.value.trim() || "";

    const text =
      document.getElementById("reviewText")?.value.trim() || "";

    const rating =
      Number(
        document.getElementById("reviewRating")?.value ||
        selectedRating ||
        5
      );

    const photoInput =
      document.getElementById("reviewPhoto");

    const photoFile =
      photoInput?.files?.[0] || null;

    if (!name || !text) {

      if (status) {
        status.textContent =
          "Please enter your name and review.";
      }

      return;
    }

    try {

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";
      }

      if (status) {
        status.textContent = "";
      }

      let photoUrl = null;


      // ===================================================
      // UPLOAD REVIEW PHOTO
      // ===================================================

      if (photoFile) {

        const extension =
          photoFile.name
            .split(".")
            .pop()
            .toLowerCase();

        const safeName =
          name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        const filePath =
          `reviews/${safeName}-${Date.now()}.${extension}`;

        const { error: uploadError } =
          await supabase
            .storage
            .from("review-photos")
            .upload(
              filePath,
              photoFile,
              {
                cacheControl: "3600",
                upsert: false
              }
            );

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicData } =
          supabase
            .storage
            .from("review-photos")
            .getPublicUrl(filePath);

        photoUrl =
          publicData?.publicUrl || null;

      }


      // ===================================================
      // INSERT REVIEW
      // ===================================================

      const { error } =
        await supabase
          .from("reviews")
          .insert({
            name,
            country,
            rating,
            review: text,
            photo_url: photoUrl
          });

      if (error) {
        throw error;
      }


      // ===================================================
      // SUCCESS
      // ===================================================

      form.reset();

      selectedRating = 5;

      updateStars(5);

      const preview =
        document.getElementById("photoPreview");

      if (preview) {
        preview.innerHTML = "";
        preview.style.display = "none";
      }

      if (status) {
        status.textContent =
          "Thank you! Your review has been submitted.";
      }

      await loadReviews();

    } catch (error) {

      console.error(
        "Review submission error:",
        error
      );

      if (status) {

        status.textContent =
          error?.message ||
          "Failed to submit review.";

      }

    } finally {

      if (submitBtn) {

        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Review";

      }

    }

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
      "Destinations loading error:",
      error
    );

    return;
  }


  if (!data || !data.length) {

    console.log(
      "No destinations found."
    );

    return;
  }


  console.log(
    "Destinations loaded:",
    data
  );


  data.forEach(destination => {

    updateDestination(destination);

  });

}


// =========================================================
// FIND DESTINATION IMAGE
// =========================================================

function findDestinationImage(slug) {

  const cleanSlug =
    String(slug || "")
      .toLowerCase()
      .trim();

  if (!cleanSlug) return null;


  const images =
    document.querySelectorAll("img");


  for (const img of images) {

    const src =
      String(
        img.getAttribute("src") || ""
      ).toLowerCase();

    const alt =
      String(
        img.getAttribute("alt") || ""
      ).toLowerCase();


    if (
      src.includes(
        `/destinations/${cleanSlug}/`
      )
    ) {
      return img;
    }


    if (
      src.includes(
        `/destinations/${cleanSlug}.`
      )
    ) {
      return img;
    }


    if (
      src.includes(
        `/${cleanSlug}.jpg`
      ) ||
      src.includes(
        `/${cleanSlug}.jpeg`
      ) ||
      src.includes(
        `/${cleanSlug}.png`
      ) ||
      src.includes(
        `/${cleanSlug}.webp`
      )
    ) {
      return img;
    }


    if (
      alt.includes(cleanSlug)
    ) {
      return img;
    }

  }


  return null;
}


// =========================================================
// UPDATE DESTINATION
// =========================================================

function updateDestination(destination) {

  const slug =
    String(destination.slug || "")
      .toLowerCase()
      .trim();


  const image =
    findDestinationImage(slug);


  if (!image) {

    console.warn(
      "Destination image not found:",
      destination
    );

    return;
  }


  // =======================================================
  // PHOTO
  // =======================================================

  if (destination.image_url) {

    image.src =
      destination.image_url;

    image.removeAttribute("srcset");

  }


  // =======================================================
  // FIND CARD
  // =======================================================

  const card =
    image.closest(".card");


  if (!card) {

    console.warn(
      "Destination card not found:",
      destination
    );

    return;
  }


  // =======================================================
  // NAME
  // =======================================================

  const title =
    card.querySelector("h3");


  if (title) {

    title.textContent =
      destination.name || "";

  }


  // =======================================================
  // DESCRIPTION
  // =======================================================

  const description =
    card.querySelector(
      ".cardContent p"
    );


  if (description) {

    description.textContent =
      destination.description || "";

  }


  // =======================================================
  // LINK
  // =======================================================

  const link =
    card.querySelector(".textLink");


  if (link && destination.page_url) {

    link.href =
      destination.page_url;

  }


  console.log(
    "Destination updated:",
    destination.name
  );

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
      "Tours loading error:",
      error
    );

    return;
  }


  if (!data || !data.length) {

    console.log(
      "No tours found."
    );

    return;
  }


  console.log(
    "Tours loaded:",
    data
  );


  data.forEach(tour => {

    updateTour(tour);

  });

}


// =========================================================
// FIND TOUR IMAGE
// =========================================================

function findTourImage(slug) {

  const cleanSlug =
    String(slug || "")
      .toLowerCase()
      .trim();


  if (!cleanSlug) return null;


  const images =
    document.querySelectorAll("img");


  for (const img of images) {

    const src =
      String(
        img.getAttribute("src") || ""
      ).toLowerCase();

    const alt =
      String(
        img.getAttribute("alt") || ""
      ).toLowerCase();


    if (
      src.includes(
        `/tours/${cleanSlug}/`
      )
    ) {
      return img;
    }


    if (
      src.includes(
        `/tours/${cleanSlug}.`
      )
    ) {
      return img;
    }


    if (
      src.includes(
        `/${cleanSlug}.jpg`
      ) ||
      src.includes(
        `/${cleanSlug}.jpeg`
      ) ||
      src.includes(
        `/${cleanSlug}.png`
      ) ||
      src.includes(
        `/${cleanSlug}.webp`
      )
    ) {
      return img;
    }


    if (
      alt.includes(cleanSlug)
    ) {
      return img;
    }

  }


  return null;
}


// =========================================================
// UPDATE TOUR
// =========================================================

function updateTour(tour) {

  const slug =
    String(tour.slug || "")
      .toLowerCase()
      .trim();


  const image =
    findTourImage(slug);


  if (!image) {

    console.warn(
      "Tour image not found:",
      tour
    );

    return;
  }


  // =======================================================
  // PHOTO
  // =======================================================

  if (tour.image_url) {

    image.src =
      tour.image_url;

    image.removeAttribute("srcset");

  }


  // =======================================================
  // FIND TOUR CARD
  // =======================================================

  const card =
    image.closest(".tourCard");


  if (!card) {

    console.warn(
      "Tour card not found:",
      tour
    );

    return;
  }


  // =======================================================
  // TITLE
  // =======================================================

  const title =
    card.querySelector("h3");


  if (title) {

    title.textContent =
      tour.title || "";

  }


  // =======================================================
  // DESCRIPTION
  // =======================================================

  const description =
    card.querySelector(
      ".tourBody p"
    );


  if (description) {

    description.textContent =
      tour.description || "";

  }


  console.log(
    "Tour updated:",
    tour.title
  );

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


  const {
    data,
    error
  } = await supabase
    .from("reviews")
    .select(`
      id,
      name,
      country,
      rating,
      review,
      photo_url,
      created_at
    `)
    .order(
      "created_at",
      {
        ascending: false
      }
    );


  if (error) {

    console.error(
      "Reviews loading error:",
      error
    );

    return;
  }


  container.innerHTML = "";


  if (!data || !data.length) {

    container.innerHTML = `
      <p>
        No reviews yet.
      </p>
    `;

    return;
  }


  data.forEach(review => {

    container.appendChild(
      createReviewCard(review)
    );

  });

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


// =========================================================
// CREATE REVIEW CARD
// =========================================================

function createReviewCard(review) {

  const card =
    document.createElement("div");


  card.className =
    "reviewCard";


  const name =
    escapeHTML(review.name);


  const country =
    escapeHTML(review.country);


  const text =
    escapeHTML(review.review);


  const rating =
    Math.max(
      0,
      Math.min(
        5,
        Number(review.rating || 5)
      )
    );


  let stars = "";

  for (
    let i = 1;
    i <= 5;
    i++
  ) {

    stars +=
      i <= rating
        ? "★"
        : "☆";

  }


  const photo =
    review.photo_url
      ? `
        <img
          src="${escapeHTML(review.photo_url)}"
          alt="${name}"
          style="
            width:70px;
            height:70px;
            object-fit:cover;
            border-radius:50%;
            margin-bottom:12px;
          "
        >
      `
      : "";


  card.innerHTML = `

    <div class="reviewInner">

      ${photo}

      <div class="reviewStars">
        ${stars}
      </div>

      <h4>
        ${name}
      </h4>

      ${
        country
          ? `<small>${country}</small>`
          : ""
      }

      <p>
        ${text}
      </p>

    </div>

  `;


  return card;

}


// =========================================================
// GLOBAL SUPABASE DEBUG
// =========================================================

window.travelWithSriLanka = {

  supabase,

  reloadDestinations:
    loadDestinations,

  reloadTours:
    loadTours,

  reloadReviews:
    loadReviews

};


console.log(
  "Travel With Sri Lanka script loaded successfully."
);
