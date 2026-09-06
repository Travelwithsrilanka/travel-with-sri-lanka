import {
  createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
  "https://vbbmnzqrvoceqbwwwsrc.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_HZ1A8CURkRFs0v21FUT0VA_44dtPzr3";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);


/* =========================================================
   PAGE READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  document.documentElement.classList.add("js-ready");

  initMobileMenu();
  initHeader();
  initTripForm();
  initStarRating();
  initReviewPhotoPreview();
  initReviewForm();
  initRevealAnimations();

  loadDestinations();
  loadTours();
  loadReviews();

});


/* =========================================================
   MOBILE MENU
========================================================= */

function initMobileMenu() {

  const menuBtn =
    document.getElementById("menuBtn");

  const nav =
    document.getElementById("mainNav");

  if (!menuBtn || !nav) {
    return;
  }

  menuBtn.addEventListener("click", () => {

    const isOpen =
      nav.classList.toggle("open");

    menuBtn.classList.toggle(
      "open",
      isOpen
    );

    menuBtn.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    document.body.classList.toggle(
      "menuOpen",
      isOpen
    );

  });


  nav.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {

      nav.classList.remove("open");
      menuBtn.classList.remove("open");

      menuBtn.setAttribute(
        "aria-expanded",
        "false"
      );

      document.body.classList.remove(
        "menuOpen"
      );

    });

  });

}


/* =========================================================
   HEADER
========================================================= */

function initHeader() {

  const header =
    document.getElementById("siteHeader");

  if (!header) {
    return;
  }

  const updateHeader = () => {

    header.classList.toggle(
      "scrolled",
      window.scrollY > 30
    );

  };

  updateHeader();

  window.addEventListener(
    "scroll",
    updateHeader,
    {
      passive: true
    }
  );

}


/* =========================================================
   TRIP PLANNER
========================================================= */

function initTripForm() {

  const form =
    document.getElementById("tripForm");

  if (!form) {
    return;
  }

  form.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const name =
        document.getElementById("name")
          ?.value.trim() || "";

      const country =
        document.getElementById("country")
          ?.value.trim() || "";

      const date =
        document.getElementById("date")
          ?.value || "";

      const guests =
        document.getElementById("guests")
          ?.value || "";

      const message =
        document.getElementById("message")
          ?.value.trim() || "";


      const whatsappMessage =
`Hello Travel With Sri Lanka!

Name: ${name}
Country: ${country}
Travel Date: ${date || "Not specified"}
Guests: ${guests || "Not specified"}

Trip Details:
${message || "Not specified"}`;


      const whatsappURL =
        "https://wa.me/94758453391?text=" +
        encodeURIComponent(whatsappMessage);


      window.open(
        whatsappURL,
        "_blank",
        "noopener,noreferrer"
      );

    }
  );

}


/* =========================================================
   STAR RATING
========================================================= */

function initStarRating() {

  const wrapper =
    document.getElementById("starRating");

  const ratingInput =
    document.getElementById("reviewRating");

  const label =
    document.getElementById("ratingLabel");

  if (!wrapper || !ratingInput) {
    return;
  }

  const stars =
    wrapper.querySelectorAll(
      "[data-rating]"
    );


  const labels = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent"
  };


  function updateStars(rating) {

    stars.forEach(star => {

      const value =
        Number(star.dataset.rating);

      star.classList.toggle(
        "active",
        value <= rating
      );

    });

    if (label) {
      label.textContent =
        labels[rating] || "Excellent";
    }

  }


  stars.forEach(star => {

    star.addEventListener(
      "click",
      () => {

        const rating =
          Number(star.dataset.rating);

        ratingInput.value =
          rating;

        updateStars(rating);

      }
    );

  });


  updateStars(
    Number(ratingInput.value) || 5
  );

}


/* =========================================================
   REVIEW PHOTO PREVIEW
========================================================= */

function initReviewPhotoPreview() {

  const input =
    document.getElementById("reviewPhoto");

  const preview =
    document.getElementById("photoPreview");

  if (!input || !preview) {
    return;
  }

  input.addEventListener(
    "change",
    () => {

      preview.innerHTML = "";
      preview.style.display = "none";

      const file =
        input.files?.[0];

      if (!file) {
        return;
      }

      if (!file.type.startsWith("image/")) {
        input.value = "";
        return;
      }

      const image =
        document.createElement("img");

      image.src =
        URL.createObjectURL(file);

      image.alt =
        "Travel photo preview";

      preview.appendChild(image);

      preview.style.display =
        "block";

    }
  );

}


/* =========================================================
   REVIEW FORM
========================================================= */

function initReviewForm() {

  const form =
    document.getElementById("reviewForm");

  if (!form) {
    return;
  }

  form.addEventListener(
    "submit",
    submitReview
  );

}


/* =========================================================
   SUBMIT REVIEW
========================================================= */

async function submitReview(event) {

  event.preventDefault();

  const form =
    event.currentTarget;

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


  if (
    !name ||
    !country ||
    !reviewText
  ) {

    setReviewStatus(
      "Please complete all required fields.",
      "error"
    );

    return;
  }


  if (
    rating < 1 ||
    rating > 5
  ) {

    setReviewStatus(
      "Please select a rating from 1 to 5 stars.",
      "error"
    );

    return;
  }


  if (name.length > 80) {

    setReviewStatus(
      "Name is too long.",
      "error"
    );

    return;
  }


  if (country.length > 80) {

    setReviewStatus(
      "Country name is too long.",
      "error"
    );

    return;
  }


  if (reviewText.length > 1000) {

    setReviewStatus(
      "Review is too long.",
      "error"
    );

    return;
  }


  if (file) {

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif"
    ];

    if (!allowedTypes.includes(file.type)) {

      setReviewStatus(
        "Please upload JPG, PNG, WEBP or GIF.",
        "error"
      );

      return;
    }


    if (file.size > 5 * 1024 * 1024) {

      setReviewStatus(
        "Photo must be smaller than 5 MB.",
        "error"
      );

      return;
    }

  }


  if (submitButton) {

    submitButton.disabled = true;
    submitButton.textContent =
      "Submitting...";

  }


  setReviewStatus(
    "Sending your review...",
    "loading"
  );


  try {

    let photoPath = null;


    /* =====================================================
       PHOTO UPLOAD
    ===================================================== */

    if (file) {

      const extension =
        getSafeExtension(file.name);


      const safeName =
        createSafeFileName(name);


      const filePath =
        `${safeName || "traveler"}-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${extension}`;


      const {
        error: uploadError
      } = await supabase
        .storage
        .from("review-photos")
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type
          }
        );


      if (uploadError) {
        throw uploadError;
      }


      photoPath =
        filePath;

    }


    /* =====================================================
       DATABASE INSERT
       IMPORTANT:
       Actual table columns:
       id, name, country, rating, review, photo_path
    ===================================================== */

    const {
      error: insertError
    } = await supabase
      .from("reviews")
      .insert({
        name,
        country,
        rating,
        review: reviewText,
        photo_path: photoPath
      });


    if (insertError) {
      throw insertError;
    }


    setReviewStatus(
      "Thank you! Your review has been submitted successfully.",
      "success"
    );


    form.reset();


    const ratingInput =
      document.getElementById(
        "reviewRating"
      );

    if (ratingInput) {
      ratingInput.value = "5";
    }


    const preview =
      document.getElementById(
        "photoPreview"
      );

    if (preview) {
      preview.innerHTML = "";
      preview.style.display = "none";
    }


    initStarRating();


    await loadReviews();


  } catch (error) {

    console.error(
      "Review submission error:",
      error
    );


    setReviewStatus(
      getReadableSupabaseError(error),
      "error"
    );


  } finally {

    if (submitButton) {

      submitButton.disabled = false;
      submitButton.textContent =
        "Submit Review";

    }

  }

}


/* =========================================================
   REVIEW STATUS
========================================================= */

function setReviewStatus(
  message,
  type
) {

  const status =
    document.getElementById(
      "reviewStatus"
    );

  if (!status) {
    return;
  }

  status.textContent =
    message;

  status.className =
    `reviewStatus ${type}`;

}


/* =========================================================
   LOAD DESTINATIONS
========================================================= */

async function loadDestinations() {

  const container =
    document.getElementById(
      "destinationsGrid"
    );

  if (!container) {
    return;
  }


  try {

    const {
      data,
      error
    } = await supabase
      .from("destinations")
      .select(
        "id,name,slug,description,image_url,page_url,sort_order"
      )
      .order(
        "sort_order",
        {
          ascending: true
        }
      );


    if (error) {
      throw error;
    }


    if (!data || data.length === 0) {

      container.innerHTML = `
        <div class="noReviews">
          <strong>No destinations available.</strong>
        </div>
      `;

      return;
    }


    container.innerHTML = "";


    data.forEach(
      destination => {

        container.appendChild(
          createDestinationCard(
            destination
          )
        );

      }
    );


  } catch (error) {

    console.error(
      "Destinations error:",
      error
    );


    container.innerHTML = `
      <div class="noReviews">
        <strong>Unable to load destinations.</strong>
        <span>Please try again later.</span>
      </div>
    `;

  }

}


/* =========================================================
   DESTINATION CARD
========================================================= */

function createDestinationCard(
  destination
) {

  const card =
    document.createElement(
      "article"
    );

  card.className =
    "card";


  const photo =
    document.createElement(
      "div"
    );

  photo.className =
    "photo";


  const image =
    document.createElement(
      "img"
    );

  image.src =
    destination.image_url ||
    "images/hero.jpg";

  image.alt =
    `${destination.name || "Sri Lanka"} Sri Lanka`;

  image.loading =
    "lazy";


  image.addEventListener(
    "error",
    () => {

      if (
        image.src !==
        new URL(
          "images/hero.jpg",
          window.location.href
        ).href
      ) {

        image.src =
          "images/hero.jpg";

      }

    }
  );


  photo.appendChild(image);


  const content =
    document.createElement(
      "div"
    );

  content.className =
    "cardContent";


  const title =
    document.createElement(
      "h3"
    );

  title.textContent =
    destination.name || "";


  const description =
    document.createElement(
      "p"
    );

  description.textContent =
    destination.description || "";


  const link =
    document.createElement(
      "a"
    );

  link.className =
    "textLink";

  link.textContent =
    "Discover →";

  link.href =
    safePageUrl(
      destination.page_url,
      "#destinations"
    );


  content.appendChild(title);
  content.appendChild(description);
  content.appendChild(link);

  card.appendChild(photo);
  card.appendChild(content);


  return card;

}


/* =========================================================
   LOAD TOURS
========================================================= */

async function loadTours() {

  const container =
    document.getElementById(
      "toursGrid"
    );

  if (!container) {
    return;
  }


  try {

    const {
      data,
      error
    } = await supabase
      .from("tours")
      .select(
        "id,title,slug,description,image_url,page_url,sort_order"
      )
      .order(
        "sort_order",
        {
          ascending: true
        }
      );


    if (error) {
      throw error;
    }


    if (!data || data.length === 0) {

      container.innerHTML = `
        <div class="loadingCard darkLoading">
          <strong>No tours available.</strong>
        </div>
      `;

      return;
    }


    container.innerHTML = "";


    data.forEach(
      tour => {

        container.appendChild(
          createTourCard(tour)
        );

      }
    );


  } catch (error) {

    console.error(
      "Tours error:",
      error
    );


    container.innerHTML = `
      <div class="loadingCard darkLoading">
        <strong>Unable to load tours.</strong>
      </div>
    `;

  }

}


/* =========================================================
   TOUR CARD
========================================================= */

function createTourCard(tour) {

  const card =
    document.createElement(
      "article"
    );

  card.className =
    "tourCard";


  const picture =
    document.createElement(
      "div"
    );

  picture.className =
    "tourPic";


  const image =
    document.createElement(
      "img"
    );

  image.src =
    tour.image_url ||
    "images/hero.jpg";

  image.alt =
    `${tour.title || "Sri Lanka Tour"} Sri Lanka`;

  image.loading =
    "lazy";


  image.addEventListener(
    "error",
    () => {

      image.src =
        "images/hero.jpg";

    }
  );


  picture.appendChild(image);


  const body =
    document.createElement(
      "div"
    );

  body.className =
    "tourBody";


  const title =
    document.createElement(
      "h3"
    );

  title.textContent =
    tour.title || "";


  const description =
    document.createElement(
      "p"
    );

  description.textContent =
    tour.description || "";


  const link =
    document.createElement(
      "a"
    );

  link.className =
    "textLink";

  link.textContent =
    "Plan This Tour →";

  link.href =
    safePageUrl(
      tour.page_url,
      "#planner"
    );


  body.appendChild(title);
  body.appendChild(description);
  body.appendChild(link);

  card.appendChild(picture);
  card.appendChild(body);


  return card;

}


/* =========================================================
   LOAD REVIEWS
========================================================= */

async function loadReviews() {

  const container =
    document.getElementById(
      "reviewsContainer"
    );

  if (!container) {
    return;
  }


  container.innerHTML = `
    <div class="loadingCard">
      <div class="loadingSpinner"></div>
      <p>Loading traveler reviews...</p>
    </div>
  `;


  try {

    /*
      IMPORTANT:
      There is NO created_at column.
      Therefore no order("created_at") is used.
    */

    const {
      data,
      error
    } = await supabase
      .from("reviews")
      .select(
        "id,name,country,rating,review,photo_path"
      );


    console.log(
      "Reviews response:",
      data,
      error
    );


    if (error) {
      throw error;
    }


    if (!data || data.length === 0) {

      container.innerHTML = `
        <div class="noReviews">
          <strong>No reviews yet.</strong>
          <span>Be the first traveler to share your experience.</span>
        </div>
      `;

      return;
    }


    container.innerHTML = "";


    data.forEach(
      review => {

        container.appendChild(
          createReviewCard(review)
        );

      }
    );


  } catch (error) {

    console.error(
      "Reviews loading error:",
      error
    );


    container.innerHTML = `
      <div class="noReviews">
        <strong>Unable to load reviews.</strong>
        <span>Please try again later.</span>
      </div>
    `;

  }

}


/* =========================================================
   REVIEW CARD
========================================================= */

function createReviewCard(
  review
) {

  const card =
    document.createElement(
      "article"
    );

  card.className =
    "reviewCard";


  const rating =
    Math.max(
      1,
      Math.min(
        5,
        Number(review.rating) || 5
      )
    );


  const content =
    document.createElement(
      "div"
    );


  if (review.photo_path) {

    const photoUrl =
      getReviewPhotoUrl(
        review.photo_path
      );


    if (photoUrl) {

      const image =
        document.createElement(
          "img"
        );

      image.className =
        "reviewPhoto";

      image.src =
        photoUrl;

      image.alt =
        "Traveler review photo";

      image.loading =
        "lazy";


      image.addEventListener(
        "error",
        () => {

          image.remove();

        }
      );


      card.appendChild(image);

    }

  }


  content.className =
    "reviewContent";


  const stars =
    document.createElement(
      "div"
    );

  stars.className =
    "reviewStars";


  const activeStars =
    document.createElement(
      "span"
    );

  activeStars.className =
    "activeStars";

  activeStars.textContent =
    "★".repeat(rating);


  const emptyStars =
    document.createElement(
      "span"
    );

  emptyStars.className =
    "emptyStars";

  emptyStars.textContent =
    "☆".repeat(5 - rating);


  stars.appendChild(
    activeStars
  );

  stars.appendChild(
    emptyStars
  );


  const text =
    document.createElement(
      "p"
    );

  text.className =
    "reviewText";

  text.textContent =
    review.review || "";


  const author =
    document.createElement(
      "div"
    );

  author.className =
    "reviewAuthor";


  const name =
    document.createElement(
      "strong"
    );

  name.textContent =
    review.name || "Traveler";


  const country =
    document.createElement(
      "span"
    );

  country.className =
    "reviewCountry";

  country.textContent =
    review.country || "";


  author.appendChild(name);
  author.appendChild(country);


  content.appendChild(stars);
  content.appendChild(text);
  content.appendChild(author);

  card.appendChild(content);


  return card;

}


/* =========================================================
   REVIEW PHOTO URL
========================================================= */

function getReviewPhotoUrl(
  path
) {

  if (!path) {
    return null;
  }


  const {
    data
  } = supabase
    .storage
    .from("review-photos")
    .getPublicUrl(path);


  return data?.publicUrl || null;

}


/* =========================================================
   SAFE PAGE URL
========================================================= */

function safePageUrl(
  url,
  fallback
) {

  if (!url) {
    return fallback;
  }


  const value =
    String(url).trim();


  if (
    value.startsWith("./") ||
    value.startsWith("../") ||
    value.startsWith("/") ||
    value.startsWith("#")
  ) {
    return value;
  }


  try {

    const parsed =
      new URL(
        value,
        window.location.href
      );


    if (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:"
    ) {

      return value;

    }

  } catch {
    return fallback;
  }


  return fallback;

}


/* =========================================================
   HELPERS
========================================================= */

function createSafeFileName(
  name
) {

  return String(name)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

}


function getSafeExtension(
  filename
) {

  const extension =
    String(filename)
      .split(".")
      .pop()
      .toLowerCase();


  const allowed = [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif"
  ];


  return allowed.includes(extension)
    ? extension
    : "jpg";

}


function getReadableSupabaseError(
  error
) {

  const message =
    error?.message ||
    "Something went wrong.";


  if (
    message.toLowerCase().includes(
      "row-level security"
    )
  ) {

    return "Review could not be submitted because database permissions need to be checked.";

  }


  if (
    message.toLowerCase().includes(
      "bucket"
    )
  ) {

    return "Review photo upload failed. Please try again without a photo.";

  }


  return message;

}


/* =========================================================
   REVEAL ANIMATIONS
========================================================= */

function initRevealAnimations() {

  const elements =
    document.querySelectorAll(
      ".reveal"
    );


  if (
    !elements.length ||
    !("IntersectionObserver" in window)
  ) {

    elements.forEach(
      element =>
        element.classList.add(
          "visible"
        )
    );

    return;
  }


  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(
          entry => {

            if (entry.isIntersecting) {

              entry.target.classList.add(
                "visible"
              );

              observer.unobserve(
                entry.target
              );

            }

          }
        );

      },
      {
        threshold: .08
      }
    );


  elements.forEach(
    element =>
      observer.observe(element)
  );

}
