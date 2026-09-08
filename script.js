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
   STATE
========================================================= */

let currentRating = 0;

let currentReviewPhotoFile = null;

let currentPublicGalleryTourId = null;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initMobileMenu();

    initHeader();

    initTripForm();

    initStarRating();

    initReviewPhotoPreview();

    initReviewForm();

    initRevealAnimations();

    initTourGallery();

    loadDestinations();

    loadTours();

    loadReviews();

  }
);


/* =========================================================
   MOBILE MENU
========================================================= */

function initMobileMenu() {

  const menuButton =
    document.querySelector(
      ".menuToggle"
    );

  const nav =
    document.querySelector(
      ".mainNav"
    );


  if (!menuButton || !nav) {
    return;
  }


  menuButton.addEventListener(
    "click",
    () => {

      nav.classList.toggle(
        "open"
      );

      menuButton.classList.toggle(
        "active"
      );

    }
  );


  nav.querySelectorAll("a").forEach(
    (link) => {

      link.addEventListener(
        "click",
        () => {

          nav.classList.remove(
            "open"
          );

          menuButton.classList.remove(
            "active"
          );

        }
      );

    }
  );

}


/* =========================================================
   HEADER
========================================================= */

function initHeader() {

  const header =
    document.querySelector(
      "header"
    );


  if (!header) {
    return;
  }


  function updateHeader() {

    if (
      window.scrollY > 30
    ) {

      header.classList.add(
        "scrolled"
      );

    } else {

      header.classList.remove(
        "scrolled"
      );

    }

  }


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
    document.getElementById(
      "tripForm"
    );


  if (!form) {
    return;
  }


  form.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();


      const formData =
        new FormData(form);


      const name =
        formData.get("name") ||
        formData.get("fullName") ||
        "";


      const email =
        formData.get("email") ||
        "";


      const destination =
        formData.get("destination") ||
        "";


      const travelers =
        formData.get("travelers") ||
        formData.get("guests") ||
        "";


      const startDate =
        formData.get("startDate") ||
        formData.get("date") ||
        "";


      const duration =
        formData.get("duration") ||
        "";


      const budget =
        formData.get("budget") ||
        "";


      const interests =
        formData.get("interests") ||
        formData.get("message") ||
        "";


      let message =
        "Hello Travel With Sri Lanka!%0A%0A";


      message +=
        "*Trip Planning Request*%0A%0A";


      if (name) {

        message +=
          "*Name:* " +
          encodeURIComponent(name) +
          "%0A";

      }


      if (email) {

        message +=
          "*Email:* " +
          encodeURIComponent(email) +
          "%0A";

      }


      if (destination) {

        message +=
          "*Destination:* " +
          encodeURIComponent(destination) +
          "%0A";

      }


      if (travelers) {

        message +=
          "*Travelers:* " +
          encodeURIComponent(travelers) +
          "%0A";

      }


      if (startDate) {

        message +=
          "*Start Date:* " +
          encodeURIComponent(startDate) +
          "%0A";

      }


      if (duration) {

        message +=
          "*Duration:* " +
          encodeURIComponent(duration) +
          "%0A";

      }


      if (budget) {

        message +=
          "*Budget:* " +
          encodeURIComponent(budget) +
          "%0A";

      }


      if (interests) {

        message +=
          "*Interests / Requirements:*%0A" +
          encodeURIComponent(interests) +
          "%0A";

      }


      const whatsappNumber =
        "94758453391";


      const whatsappUrl =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        message;


      window.open(
        whatsappUrl,
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

  const stars =
    document.querySelectorAll(
      "[data-rating]"
    );


  if (!stars.length) {
    return;
  }


  stars.forEach(
    (star) => {

      star.addEventListener(
        "click",
        () => {

          const rating =
            Number(
              star.dataset.rating
            );


          currentRating =
            rating;


          updateStarRating(
            rating
          );

        }
      );


      star.addEventListener(
        "mouseenter",
        () => {

          const rating =
            Number(
              star.dataset.rating
            );


          updateStarRating(
            rating
          );

        }
      );

    }
  );


  const container =
    stars[0].parentElement;


  container?.addEventListener(
    "mouseleave",
    () => {

      updateStarRating(
        currentRating
      );

    }
  );

}


/* =========================================================
   UPDATE STAR RATING
========================================================= */

function updateStarRating(
  rating
) {

  document
    .querySelectorAll(
      "[data-rating]"
    )
    .forEach(
      (star) => {

        const starRating =
          Number(
            star.dataset.rating
          );


        if (
          starRating <= rating
        ) {

          star.classList.add(
            "active"
          );

        } else {

          star.classList.remove(
            "active"
          );

        }

      }
    );

}


/* =========================================================
   REVIEW PHOTO PREVIEW
========================================================= */

function initReviewPhotoPreview() {

  const input =
    document.getElementById(
      "reviewPhoto"
    );


  const preview =
    document.getElementById(
      "reviewPhotoPreview"
    );


  if (!input) {
    return;
  }


  input.addEventListener(
    "change",
    () => {

      const file =
        input.files?.[0];


      currentReviewPhotoFile =
        file || null;


      if (!file) {

        if (preview) {
          preview.innerHTML = "";
        }

        return;

      }


      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        input.value = "";

        currentReviewPhotoFile =
          null;

        if (preview) {
          preview.innerHTML = "";
        }

        alert(
          "Please select an image file."
        );

        return;

      }


      if (
        file.size >
        5 * 1024 * 1024
      ) {

        input.value = "";

        currentReviewPhotoFile =
          null;

        if (preview) {
          preview.innerHTML = "";
        }

        alert(
          "Image must be smaller than 5MB."
        );

        return;

      }


      if (preview) {

        const objectUrl =
          URL.createObjectURL(
            file
          );


        preview.innerHTML = `

          <div class="review-photo-preview-inner">

            <img
              src="${escapeAttribute(objectUrl)}"
              alt="Review photo preview"
            />

            <button
              type="button"
              id="removeReviewPhoto"
            >
              Remove
            </button>

          </div>

        `;


        document
          .getElementById(
            "removeReviewPhoto"
          )
          ?.addEventListener(
            "click",
            () => {

              input.value = "";

              currentReviewPhotoFile =
                null;

              preview.innerHTML = "";

              URL.revokeObjectURL(
                objectUrl
              );

            }
          );

      }

    }
  );

}


/* =========================================================
   REVIEW FORM
========================================================= */

function initReviewForm() {

  const form =
    document.getElementById(
      "reviewForm"
    );


  if (!form) {
    return;
  }


  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const submitButton =
        form.querySelector(
          'button[type="submit"]'
        );


      const formData =
        new FormData(form);


      const name =
        String(
          formData.get("name") ||
          ""
        ).trim();


      const country =
        String(
          formData.get("country") ||
          ""
        ).trim();


      const review =
        String(
          formData.get("review") ||
          formData.get("message") ||
          ""
        ).trim();


      if (!name) {

        alert(
          "Please enter your name."
        );

        return;

      }


      if (!country) {

        alert(
          "Please enter your country."
        );

        return;

      }


      if (!currentRating) {

        alert(
          "Please select a rating."
        );

        return;

      }


      if (!review) {

        alert(
          "Please write your review."
        );

        return;

      }


      if (submitButton) {

        submitButton.disabled =
          true;

        submitButton.dataset.originalText =
          submitButton.textContent;

        submitButton.textContent =
          "Submitting...";

      }


      let photoUrl =
        null;


      let photoPath =
        null;


      try {

        /*
          Upload review photo
        */

        if (
          currentReviewPhotoFile
        ) {

          const file =
            currentReviewPhotoFile;


          const extension =
            getFileExtension(
              file.name
            );


          const randomId =
            generateRandomId();


          photoPath =
            `reviews/${Date.now()}-${randomId}.${extension}`;


          const {
            error:
            uploadError
          } =
            await supabase
              .storage
              .from("review-photos")
              .upload(
                photoPath,
                file,
                {
                  cacheControl:
                    "3600",
                  upsert: false,
                  contentType:
                    file.type
                }
              );


          if (uploadError) {
            throw uploadError;
          }


          const {
            data:
            publicData
          } =
            supabase
              .storage
              .from("review-photos")
              .getPublicUrl(
                photoPath
              );


          photoUrl =
            publicData?.publicUrl ||
            null;

        }


        /*
          Insert review
        */

        const {
          error
        } =
          await supabase
            .from("reviews")
            .insert({
              name,
              country,
              rating:
                currentRating,
              review,
              photo_url:
                photoUrl,
              photo_path:
                photoPath
            });


        if (error) {

          /*
            If DB insert fails,
            remove uploaded photo.
          */

          if (photoPath) {

            await supabase
              .storage
              .from("review-photos")
              .remove([
                photoPath
              ]);

          }


          throw error;

        }


        alert(
          "Thank you! Your review has been submitted."
        );


        form.reset();


        currentRating =
          0;


        currentReviewPhotoFile =
          null;


        updateStarRating(
          0
        );


        const preview =
          document.getElementById(
            "reviewPhotoPreview"
          );


        if (preview) {
          preview.innerHTML = "";
        }


        await loadReviews();


      } catch (error) {

        console.error(
          "Review submission error:",
          error
        );


        alert(
          getReadableError(
            error,
            "Unable to submit your review. Please try again."
          )
        );

      } finally {

        if (submitButton) {

          submitButton.disabled =
            false;

          submitButton.textContent =
            submitButton.dataset.originalText ||
            "Submit Review";

        }

      }

    }
  );

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


  container.innerHTML =
    `
      <div class="loading-state">
        Loading destinations...
      </div>
    `;


  try {

    const {
      data,
      error
    } =
      await supabase
        .from("destinations")
        .select(`
          id,
          slug,
          name,
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
      throw error;
    }


    if (
      !data ||
      data.length === 0
    ) {

      container.innerHTML =
        `
          <div class="empty-state">
            No destinations available yet.
          </div>
        `;

      return;

    }


    container.innerHTML =
      data
        .map(
          createDestinationCard
        )
        .join("");


  } catch (error) {

    console.error(
      "Destination loading error:",
      error
    );


    container.innerHTML =
      `
        <div class="error-state">
          Unable to load destinations.
        </div>
      `;

  }

}


/* =========================================================
   CREATE DESTINATION CARD
========================================================= */

function createDestinationCard(
  destination
) {

  const image =
    destination.image_url ||
    "https://placehold.co/800x600?text=Destination";


  const name =
    destination.name ||
    "Sri Lanka Destination";


  const description =
    destination.description ||
    "";


  const pageUrl =
    safePageUrl(
      destination.page_url
    );


  return `

    <article class="destinationCard">

      <div class="destinationCardImageWrap">

        <img
          class="destinationCardImage"
          src="${escapeAttribute(image)}"
          alt="${escapeAttribute(name)}"
          loading="lazy"
        />

      </div>


      <div class="destinationCardBody">

        <h3>
          ${escapeHTML(name)}
        </h3>


        ${
          description
            ? `
              <p>
                ${escapeHTML(
                  truncate(
                    description,
                    150
                  )
                )}
              </p>
            `
            : ""
        }


        ${
          pageUrl
            ? `
              <a
                href="${escapeAttribute(pageUrl)}"
                class="destinationExploreButton"
              >
                Explore
                <span>→</span>
              </a>
            `
            : ""
        }

      </div>

    </article>

  `;

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


  container.innerHTML =
    `
      <div class="loading-state">
        Loading journeys...
      </div>
    `;


  try {

    /*
      Load tours
    */

    const {
      data: tours,
      error: toursError
    } =
      await supabase
        .from("tours")
        .select(`
          id,
          slug,
          title,
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


    if (toursError) {
      throw toursError;
    }


    if (
      !tours ||
      tours.length === 0
    ) {

      container.innerHTML =
        `
          <div class="empty-state">
            No tours available yet.
          </div>
        `;

      return;

    }


    /*
      Load ALL gallery records
      in one query.

      This avoids making
      a separate request for
      every tour.
    */

    let galleryRows = [];


    const {
      data:
      galleryData,
      error:
      galleryError
    } =
      await supabase
        .from("tour_gallery")
        .select(`
          id,
          tour_id,
          image_path,
          image_url,
          sort_order,
          created_at
        `)
        .order(
          "sort_order",
          {
            ascending: true
          }
        )
        .order(
          "created_at",
          {
            ascending: true
          }
        );


    /*
      If gallery table doesn't exist yet,
      tours should still load.
    */

    if (galleryError) {

      console.warn(
        "Tour gallery loading warning:",
        galleryError
      );

    } else {

      galleryRows =
        galleryData || [];

    }


    /*
      Group gallery records
      by tour ID.
    */

    const galleryMap =
      new Map();


    galleryRows.forEach(
      (image) => {

        const tourId =
          Number(
            image.tour_id
          );


        if (
          !galleryMap.has(
            tourId
          )
        ) {

          galleryMap.set(
            tourId,
            []
          );

        }


        galleryMap
          .get(tourId)
          .push(image);

      }
    );


    /*
      Add gallery information
      to each tour.
    */

    const toursWithGallery =
      tours.map(
        (tour) => ({

          ...tour,

          gallery:
            galleryMap.get(
              Number(tour.id)
            ) || []

        })
      );


    container.innerHTML =
      toursWithGallery
        .map(
          createTourCard
        )
        .join("");


  } catch (error) {

    console.error(
      "Tour loading error:",
      error
    );


    container.innerHTML =
      `
        <div class="error-state">
          Unable to load tours.
        </div>
      `;

  }

}


/* =========================================================
   CREATE TOUR CARD
========================================================= */

function createTourCard(
  tour
) {

  const image =
    tour.image_url ||
    "https://placehold.co/800x600?text=Tour";


  const title =
    tour.title ||
    "Sri Lanka Tour";


  const description =
    tour.description ||
    "";


  const pageUrl =
    safePageUrl(
      tour.page_url
    );


  const gallery =
    Array.isArray(
      tour.gallery
    )
      ? tour.gallery
      : [];


  const galleryCount =
    gallery.length;


  return `

    <article class="tourCard">

      <div class="tourCardImageWrap">

        <img
          class="tourCardImage"
          src="${escapeAttribute(image)}"
          alt="${escapeAttribute(title)}"
          loading="lazy"
        />

      </div>


      <div class="tourCardBody">

        <h3 class="tourCardTitle">
          ${escapeHTML(title)}
        </h3>


        ${
          description
            ? `
              <p class="tourCardDescription">
                ${escapeHTML(
                  truncate(
                    description,
                    180
                  )
                )}
              </p>
            `
            : ""
        }


        <div class="tourCardActions">

          ${
            galleryCount > 0
              ? `
                <button
                  type="button"
                  class="tourGalleryButton"
                  data-tour-gallery="${Number(tour.id)}"
                  data-tour-title="${escapeAttribute(title)}"
                >
                  📷 View Gallery
                  <span class="tour-gallery-count">
                    ${galleryCount}
                  </span>
                </button>
              `
              : ""
          }


          ${
            pageUrl
              ? `
                <a
                  class="tourExploreButton"
                  href="${escapeAttribute(pageUrl)}"
                >
                  Explore Journey
                  <span>→</span>
                </a>
              `
              : ""
          }

        </div>

      </div>

    </article>

  `;

}


/* =========================================================
   TOUR GALLERY INITIALIZATION
========================================================= */

function initTourGallery() {

  const modal =
    document.getElementById(
      "tourGalleryModal"
    );


  if (!modal) {
    return;
  }


  const closeButton =
    document.getElementById(
      "tourGalleryClose"
    );


  const overlay =
    modal.querySelector(
      ".tour-gallery-overlay"
    );


  /*
    Event delegation because
    tour cards are dynamically created.
  */

  document.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          "[data-tour-gallery]"
        );


      if (!button) {
        return;
      }


      const tourId =
        Number(
          button.dataset.tourGallery
        );


      const tourTitle =
        button.dataset.tourTitle ||
        "Tour Gallery";


      if (!tourId) {
        return;
      }


      openPublicTourGallery(
        tourId,
        tourTitle
      );

    }
  );


  closeButton?.addEventListener(
    "click",
    closePublicTourGallery
  );


  overlay?.addEventListener(
    "click",
    closePublicTourGallery
  );


  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Escape"
      ) {

        const lightbox =
          document.getElementById(
            "tourGalleryLightbox"
          );


        if (
          lightbox?.classList.contains(
            "active"
          )
        ) {

          closeGalleryLightbox();

          return;

        }


        if (
          modal.classList.contains(
            "active"
          )
        ) {

          closePublicTourGallery();

        }

      }

    }
  );

}


/* =========================================================
   OPEN TOUR GALLERY
========================================================= */

async function openPublicTourGallery(
  tourId,
  tourTitle
) {

  const modal =
    document.getElementById(
      "tourGalleryModal"
    );


  const title =
    document.getElementById(
      "tourGalleryTitle"
    );


  const loading =
    document.getElementById(
      "tourGalleryLoading"
    );


  const empty =
    document.getElementById(
      "tourGalleryEmpty"
    );


  const grid =
    document.getElementById(
      "tourGalleryGrid"
    );


  if (
    !modal ||
    !grid
  ) {
    return;
  }


  currentPublicGalleryTourId =
    Number(tourId);


  if (title) {

    title.textContent =
      tourTitle ||
      "Tour Gallery";

  }


  if (loading) {

    loading.style.display =
      "block";

  }


  if (empty) {

    empty.style.display =
      "none";

  }


  grid.innerHTML =
    "";


  modal.classList.add(
    "active"
  );


  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.classList.add(
    "tour-gallery-open"
  );


  try {

    const {
      data,
      error
    } =
      await supabase
        .from("tour_gallery")
        .select(`
          id,
          tour_id,
          image_path,
          image_url,
          sort_order,
          created_at
        `)
        .eq(
          "tour_id",
          currentPublicGalleryTourId
        )
        .order(
          "sort_order",
          {
            ascending: true
          }
        )
        .order(
          "created_at",
          {
            ascending: true
          }
        );


    if (error) {
      throw error;
    }


    if (loading) {

      loading.style.display =
        "none";

    }


    if (
      !data ||
      data.length === 0
    ) {

      if (empty) {

        empty.style.display =
          "block";

      }

      return;

    }


    grid.innerHTML =
      data
        .map(
          createPublicGalleryImage
        )
        .join("");


    initPublicGalleryLightbox();


  } catch (error) {

    console.error(
      "Tour gallery error:",
      error
    );


    if (loading) {

      loading.style.display =
        "none";

    }


    if (empty) {

      empty.style.display =
        "block";


      empty.innerHTML = `

        <div class="tour-gallery-empty-icon">
          ⚠️
        </div>

        <h3>
          Gallery could not be loaded
        </h3>

        <p>
          Please try again later.
        </p>

      `;

    }

  }

}


/* =========================================================
   CREATE GALLERY IMAGE
========================================================= */

function createPublicGalleryImage(
  image,
  index
) {

  let imageUrl =
    image.image_url;


  /*
    If image_url is empty,
    get public Storage URL.
  */

  if (
    !imageUrl &&
    image.image_path
  ) {

    const {
      data
    } =
      supabase
        .storage
        .from("tour-gallery")
        .getPublicUrl(
          image.image_path
        );


    imageUrl =
      data?.publicUrl ||
      "";

  }


  if (!imageUrl) {
    return "";
  }


  return `

    <button
      type="button"
      class="tour-gallery-item"
      data-gallery-image="${escapeAttribute(imageUrl)}"
      data-gallery-index="${index}"
      aria-label="Open gallery image ${index + 1}"
    >

      <img
        src="${escapeAttribute(imageUrl)}"
        alt="Tour gallery image ${index + 1}"
        loading="lazy"
      />


      <span class="tour-gallery-image-number">
        ${index + 1}
      </span>


      <span class="tour-gallery-zoom">
        +
      </span>

    </button>

  `;

}


/* =========================================================
   GALLERY LIGHTBOX INITIALIZATION
========================================================= */

function initPublicGalleryLightbox() {

  document
    .querySelectorAll(
      "[data-gallery-image]"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            const imageUrl =
              button.dataset.galleryImage;


            if (!imageUrl) {
              return;
            }


            openGalleryLightbox(
              imageUrl
            );

          }
        );

      }
    );

}


/* =========================================================
   OPEN LIGHTBOX
========================================================= */

function openGalleryLightbox(
  imageUrl
) {

  let lightbox =
    document.getElementById(
      "tourGalleryLightbox"
    );


  if (!lightbox) {

    lightbox =
      document.createElement(
        "div"
      );


    lightbox.id =
      "tourGalleryLightbox";


    lightbox.className =
      "tour-gallery-lightbox";


    lightbox.innerHTML = `

      <div
        class="tour-gallery-lightbox-overlay"
      ></div>


      <button
        type="button"
        class="tour-gallery-lightbox-close"
        aria-label="Close image"
      >
        ×
      </button>


      <div
        class="tour-gallery-lightbox-content"
      >

        <img
          id="tourGalleryLightboxImage"
          src=""
          alt="Tour gallery"
        />

      </div>

    `;


    document.body.appendChild(
      lightbox
    );


    lightbox
      .querySelector(
        ".tour-gallery-lightbox-overlay"
      )
      ?.addEventListener(
        "click",
        closeGalleryLightbox
      );


    lightbox
      .querySelector(
        ".tour-gallery-lightbox-close"
      )
      ?.addEventListener(
        "click",
        closeGalleryLightbox
      );

  }


  const image =
    document.getElementById(
      "tourGalleryLightboxImage"
    );


  if (image) {

    image.src =
      imageUrl;

  }


  lightbox.classList.add(
    "active"
  );


  document.body.classList.add(
    "tour-lightbox-open"
  );

}


/* =========================================================
   CLOSE LIGHTBOX
========================================================= */

function closeGalleryLightbox() {

  const lightbox =
    document.getElementById(
      "tourGalleryLightbox"
    );


  if (!lightbox) {
    return;
  }


  lightbox.classList.remove(
    "active"
  );


  document.body.classList.remove(
    "tour-lightbox-open"
  );

}


/* =========================================================
   CLOSE TOUR GALLERY
========================================================= */

function closePublicTourGallery() {

  const modal =
    document.getElementById(
      "tourGalleryModal"
    );


  if (!modal) {
    return;
  }


  modal.classList.remove(
    "active"
  );


  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.classList.remove(
    "tour-gallery-open"
  );


  currentPublicGalleryTourId =
    null;

}


/* =========================================================
   REVEAL ANIMATIONS
========================================================= */

function initRevealAnimations() {

  const elements =
    document.querySelectorAll(
      ".reveal, .fade-up, .animate"
    );


  if (
    !elements.length
  ) {
    return;
  }


  if (
    !("IntersectionObserver" in window)
  ) {

    elements.forEach(
      (element) => {

        element.classList.add(
          "visible"
        );

      }
    );

    return;

  }


  const observer =
    new IntersectionObserver(
      (
        entries,
        observerInstance
      ) => {

        entries.forEach(
          (entry) => {

            if (
              entry.isIntersecting
            ) {

              entry.target.classList.add(
                "visible"
              );


              observerInstance.unobserve(
                entry.target
              );

            }

          }
        );

      },
      {
        threshold: 0.12
      }
    );


  elements.forEach(
    (element) => {

      observer.observe(
        element
      );

    }
  );

}


/* =========================================================
   SAFE PAGE URL
========================================================= */

function safePageUrl(
  url
) {

  if (!url) {
    return "";
  }


  const value =
    String(url).trim();


  if (!value) {
    return "";
  }


  /*
    Allow normal relative URLs
    and HTTPS URLs.
  */

  if (
    value.startsWith("/")
    ||
    value.startsWith("./")
    ||
    value.startsWith("../")
    ||
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
      parsed.protocol ===
        "https:" ||
      parsed.protocol ===
        "http:"
    ) {

      return parsed.href;

    }

  } catch {
    return "";
  }


  return "";

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
  value
) {

  return String(
    value ?? ""
  )
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


/* =========================================================
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttribute(
  value
) {

  return escapeHTML(
    value
  );

}


/* =========================================================
   TRUNCATE
========================================================= */

function truncate(
  text,
  maxLength
) {

  const value =
    String(
      text ?? ""
    ).trim();


  if (
    value.length <=
    maxLength
  ) {

    return value;

  }


  return (
    value
      .slice(
        0,
        maxLength
      )
      .trimEnd() +
    "..."
  );

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


  container.innerHTML =
    `
      <div class="loading-state">
        Loading reviews...
      </div>
    `;


  try {

    const {
      data,
      error
    } =
      await supabase
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
      throw error;
    }


    if (
      !data ||
      data.length === 0
    ) {

      container.innerHTML =
        `
          <div class="empty-state">
            Be the first to share your experience.
          </div>
        `;

      return;

    }


    container.innerHTML =
      data
        .map(
          createReviewCard
        )
        .join("");


  } catch (error) {

    console.error(
      "Review loading error:",
      error
    );


    container.innerHTML =
      `
        <div class="error-state">
          Unable to load reviews.
        </div>
      `;

  }

}


/* =========================================================
   CREATE REVIEW CARD
========================================================= */

function createReviewCard(
  review
) {

  const name =
    review.name ||
    "Traveler";


  const country =
    review.country ||
    "";


  const text =
    review.review ||
    "";


  const rating =
    Math.min(
      5,
      Math.max(
        0,
        Number(
          review.rating
        ) || 0
      )
    );


  const stars =
    "★".repeat(
      rating
    ) +
    "☆".repeat(
      5 - rating
    );


  const photo =
    review.photo_url ||
    "";


  const date =
    review.created_at
      ? formatReviewDate(
          review.created_at
        )
      : "";


  return `

    <article class="reviewCard">

      ${
        photo
          ? `
            <div class="reviewCardPhoto">

              <img
                src="${escapeAttribute(photo)}"
                alt="${escapeAttribute(name)}"
                loading="lazy"
              />

            </div>
          `
          : ""
      }


      <div class="reviewCardBody">

        <div class="reviewRating">
          ${stars}
        </div>


        <p class="reviewText">
          “${escapeHTML(text)}”
        </p>


        <div class="reviewAuthor">

          <strong>
            ${escapeHTML(name)}
          </strong>


          ${
            country
              ? `
                <span>
                  ${escapeHTML(country)}
                </span>
              `
              : ""
          }


          ${
            date
              ? `
                <small>
                  ${escapeHTML(date)}
                </small>
              `
              : ""
          }

        </div>

      </div>

    </article>

  `;

}


/* =========================================================
   FORMAT REVIEW DATE
========================================================= */

function formatReviewDate(
  dateValue
) {

  try {

    const date =
      new Date(
        dateValue
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "";

    }


    return date.toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric"
      }
    );

  } catch {
    return "";
  }

}


/* =========================================================
   FILE EXTENSION
========================================================= */

function getFileExtension(
  fileName
) {

  const parts =
    String(
      fileName
    )
      .toLowerCase()
      .split(".");


  const extension =
    parts.length > 1
      ? parts.pop()
      : "jpg";


  const allowed = [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif"
  ];


  return allowed.includes(
    extension
  )
    ? extension
    : "jpg";

}


/* =========================================================
   RANDOM ID
========================================================= */

function generateRandomId() {

  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {

    return crypto.randomUUID();

  }


  return (
    Date.now().toString(36) +
    "-" +
    Math.random()
      .toString(36)
      .slice(2)
  );

}


/* =========================================================
   READABLE SUPABASE ERROR
========================================================= */

function getReadableError(
  error,
  fallback
) {

  if (!error) {
    return fallback;
  }


  if (
    error.message
  ) {

    return error.message;

  }


  if (
    error.error_description
  ) {

    return error.error_description;

  }


  return fallback;

}
