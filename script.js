/* =========================================================
   TRAVEL WITH SRI LANKA
   Main JavaScript + Supabase
   Reviews + Dynamic Destinations + Dynamic Tours
   ========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

import {
  createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


const SUPABASE_URL =
  "https://vbbmnzqrvoceqbwwwsrc.supabase.co";


const SUPABASE_ANON_KEY =
  "sb_publishable_HZ1A8CURkRFs0v21FUT0VA_44dtPzr3";


const supabase =
  createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


/* =========================================================
   START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    initializeMobileMenu();

    initializeTripForm();

    initializeStarRating();

    initializePhotoPreview();

    initializeReviewForm();

    loadDestinations();

    loadTours();

    loadReviews();

  }
);


/* =========================================================
   MOBILE MENU
========================================================= */

function initializeMobileMenu() {

  function toggleMenu() {

    const nav =
      document.getElementById("mainNav");

    if (nav) {

      nav.classList.toggle("open");

    }

  }


  const menuButton =
    document.getElementById("menuBtn");


  if (menuButton) {

    menuButton.addEventListener(
      "click",
      toggleMenu
    );

  }


  document
    .querySelectorAll("#mainNav a")
    .forEach(function (link) {

      link.addEventListener(
        "click",
        function () {

          const nav =
            document.getElementById("mainNav");

          if (nav) {

            nav.classList.remove("open");

          }

        }
      );

    });

}


/* =========================================================
   WHATSAPP TRIP FORM
========================================================= */

function initializeTripForm() {

  const tripForm =
    document.getElementById("tripForm");


  if (!tripForm) {

    return;

  }


  tripForm.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();


      const name =
        document
          .getElementById("name")
          .value
          .trim();


      const country =
        document
          .getElementById("country")
          .value
          .trim();


      const date =
        document
          .getElementById("date")
          .value;


      const guests =
        document
          .getElementById("guests")
          .value;


      const message =
        document
          .getElementById("message")
          .value
          .trim();


      const text =

        "Hello Travel With Sri Lanka!" +
        "\n\n" +

        "I would like to plan a Sri Lanka trip." +
        "\n\n" +

        "Name: " +
        name +
        "\n" +

        "Country: " +
        country +
        "\n" +

        "Travel Date: " +
        (date || "Not specified") +
        "\n" +

        "Guests: " +
        guests +
        "\n\n" +

        "Travel Preferences:" +
        "\n" +

        (message || "Not specified");


      const whatsappURL =

        "https://wa.me/94758453391?text=" +
        encodeURIComponent(text);


      window.open(
        whatsappURL,
        "_blank"
      );

    }
  );

}


/* =========================================================
   STAR RATING
========================================================= */

function initializeStarRating() {

  const stars =
    document.querySelectorAll(
      "#starRating button"
    );


  const ratingInput =
    document.getElementById(
      "reviewRating"
    );


  let selectedRating = 0;


  stars.forEach(function (star) {

    star.addEventListener(
      "click",
      function () {

        selectedRating =
          Number(
            this.dataset.rating
          );


        if (ratingInput) {

          ratingInput.value =
            selectedRating;

        }


        stars.forEach(function (s) {

          const value =
            Number(
              s.dataset.rating
            );


          s.classList.toggle(
            "selected",
            value <= selectedRating
          );

        });

      }
    );

  });

}


/* =========================================================
   PHOTO PREVIEW
========================================================= */

function initializePhotoPreview() {

  const photoInput =
    document.getElementById(
      "reviewPhoto"
    );


  const photoPreview =
    document.getElementById(
      "photoPreview"
    );


  if (!photoInput) {

    return;

  }


  photoInput.addEventListener(
    "change",
    function () {

      if (photoPreview) {

        photoPreview.innerHTML = "";

      }


      const file =
        this.files[0];


      if (!file) {

        return;

      }


      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
      ];


      if (
        !allowedTypes.includes(
          file.type
        )
      ) {

        this.value = "";

        alert(
          "Please select a JPG, PNG or WebP image."
        );

        return;

      }


      if (
        file.size >
        5 * 1024 * 1024
      ) {

        this.value = "";

        alert(
          "Image must be smaller than 5MB."
        );

        return;

      }


      const image =
        document.createElement(
          "img"
        );


      image.src =
        URL.createObjectURL(
          file
        );


      image.className =
        "reviewPreview";


      if (photoPreview) {

        photoPreview.appendChild(
          image
        );

      }

    }
  );

}


/* =========================================================
   LOAD DESTINATIONS FROM SUPABASE
========================================================= */

async function loadDestinations() {

  try {

    const result =
      await supabase
        .from("destinations")
        .select(
          "id, name, slug, image_url"
        )
        .order(
          "sort_order",
          {
            ascending: true
          }
        );


    if (result.error) {

      console.error(
        "Destination loading error:",
        result.error
      );

      return;

    }


    const destinations =
      result.data || [];


    if (
      destinations.length === 0
    ) {

      return;

    }


    destinations.forEach(
      function (destination) {

        updateDestinationImage(
          destination
        );

      }
    );

  }

  catch (error) {

    console.error(
      "Loading destinations failed:",
      error
    );

  }

}


/* =========================================================
   UPDATE DESTINATION IMAGE
========================================================= */

function updateDestinationImage(
  destination
) {

  if (
    !destination ||
    !destination.image_url
  ) {

    return;

  }


  const slug =
    String(
      destination.slug ||
      destination.name ||
      ""
    )
    .toLowerCase()
    .trim();


  if (!slug) {

    return;

  }


  const image =
    findDestinationImage(
      slug
    );


  if (!image) {

    return;

  }


  image.src =
    destination.image_url;


  image.dataset.supabaseImage =
    "true";


  image.removeAttribute(
    "srcset"
  );


  image.onerror =
    function () {

      console.warn(
        "Could not load Supabase image:",
        destination.image_url
      );

    };

}


/* =========================================================
   FIND DESTINATION IMAGE
========================================================= */

function findDestinationImage(
  slug
) {

  const images =
    document.querySelectorAll(
      "#destinations img"
    );


  for (
    const image of images
  ) {

    const src =
      image.getAttribute(
        "src"
      ) || "";


    const alt =
      image.getAttribute(
        "alt"
      ) || "";


    const combined =
      (
        src +
        " " +
        alt
      ).toLowerCase();


    if (
      combined.includes(
        "/" + slug + "/"
      ) ||
      combined.includes(
        slug + ".jpg"
      ) ||
      combined.includes(
        slug + ".jpeg"
      ) ||
      combined.includes(
        slug + ".png"
      ) ||
      combined.includes(
        slug + ".webp"
      ) ||
      alt.toLowerCase().includes(
        slug
      )
    ) {

      return image;

    }

  }


  return null;

}


/* =========================================================
   LOAD TOURS FROM SUPABASE
========================================================= */

async function loadTours() {

  try {

    const result =
      await supabase
        .from("tours")
        .select(
          "id, name, slug, image_url"
        )
        .order(
          "sort_order",
          {
            ascending: true
          }
        );


    if (result.error) {

      console.error(
        "Tour loading error:",
        result.error
      );

      return;

    }


    const tours =
      result.data || [];


    if (
      tours.length === 0
    ) {

      return;

    }


    tours.forEach(
      function (tour) {

        updateTourImage(
          tour
        );

      }
    );

  }

  catch (error) {

    console.error(
      "Loading tours failed:",
      error
    );

  }

}


/* =========================================================
   UPDATE TOUR IMAGE
========================================================= */

function updateTourImage(
  tour
) {

  if (
    !tour ||
    !tour.image_url
  ) {

    return;

  }


  const slug =
    String(
      tour.slug ||
      tour.name ||
      ""
    )
    .toLowerCase()
    .trim();


  if (!slug) {

    return;

  }


  const image =
    findTourImage(
      slug
    );


  if (!image) {

    return;

  }


  image.src =
    tour.image_url;


  image.dataset.supabaseImage =
    "true";


  image.removeAttribute(
    "srcset"
  );


  image.onerror =
    function () {

      console.warn(
        "Could not load Supabase tour image:",
        tour.image_url
      );

    };

}


/* =========================================================
   FIND TOUR IMAGE
========================================================= */

function findTourImage(
  slug
) {

  const images =
    document.querySelectorAll(
      "#tours img"
    );


  for (
    const image of images
  ) {

    const src =
      image.getAttribute(
        "src"
      ) || "";


    const alt =
      image.getAttribute(
        "alt"
      ) || "";


    const combined =
      (
        src +
        " " +
        alt
      ).toLowerCase();


    if (
      combined.includes(
        "/" + slug + "."
      ) ||
      combined.includes(
        "/" + slug + "/"
      ) ||
      alt.toLowerCase().includes(
        slug
      )
    ) {

      return image;

    }

  }


  return null;

}


/* =========================================================
   REVIEW FORM
========================================================= */

function initializeReviewForm() {

  const reviewForm =
    document.getElementById(
      "reviewForm"
    );


  if (!reviewForm) {

    return;

  }


  reviewForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();

      event.stopPropagation();


      const status =
        document.getElementById(
          "reviewStatus"
        );


      const submitButton =
        document.getElementById(
          "reviewSubmit"
        );


      const nameInput =
        document.getElementById(
          "reviewName"
        );


      const countryInput =
        document.getElementById(
          "reviewCountry"
        );


      const reviewInput =
        document.getElementById(
          "reviewText"
        );


      const ratingInput =
        document.getElementById(
          "reviewRating"
        );


      const photoInput =
        document.getElementById(
          "reviewPhoto"
        );


      const name =
        nameInput
          ? nameInput.value.trim()
          : "";


      const country =
        countryInput
          ? countryInput.value.trim()
          : "";


      const review =
        reviewInput
          ? reviewInput.value.trim()
          : "";


      const rating =
        ratingInput
          ? Number(
              ratingInput.value
            )
          : 0;


      const file =
        photoInput &&
        photoInput.files
          ? photoInput.files[0]
          : null;


      /* =================================================
         VALIDATION
      ================================================= */

      if (
        rating < 1 ||
        rating > 5
      ) {

        if (status) {

          status.textContent =
            "Please select a star rating.";

          status.className =
            "reviewStatus error";

        }

        return;

      }


      if (
        !name ||
        !country ||
        !review
      ) {

        if (status) {

          status.textContent =
            "Please complete all required fields.";

          status.className =
            "reviewStatus error";

        }

        return;

      }


      if (file) {

        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/webp"
        ];


        if (
          !allowedTypes.includes(
            file.type
          )
        ) {

          if (status) {

            status.textContent =
              "Please upload a JPG, PNG or WebP image.";

            status.className =
              "reviewStatus error";

          }

          return;

        }


        if (
          file.size >
          5 * 1024 * 1024
        ) {

          if (status) {

            status.textContent =
              "Photo must be smaller than 5MB.";

            status.className =
              "reviewStatus error";

          }

          return;

        }

      }


      if (submitButton) {

        submitButton.disabled =
          true;

        submitButton.textContent =
          "Posting Review...";

      }


      if (status) {

        status.textContent =
          "Please wait...";

        status.className =
          "reviewStatus";

      }


      try {

        let photoURL =
          null;

        let photoPath =
          null;


        /* =================================================
           UPLOAD REVIEW PHOTO
        ================================================= */

        if (file) {

          const extension =
            file.name
              .split(".")
              .pop()
              .toLowerCase();


          const uniqueName =

            Date.now() +
            "-" +
            Math.random()
              .toString(36)
              .substring(2) +
            "." +
            extension;


          photoPath =
            uniqueName;


          const uploadResult =
            await supabase
              .storage
              .from("review-photos")
              .upload(
                photoPath,
                file,
                {
                  cacheControl: "3600",
                  contentType: file.type,
                  upsert: false
                }
              );


          if (
            uploadResult.error
          ) {

            throw uploadResult.error;

          }


          const publicURLResult =
            supabase
              .storage
              .from("review-photos")
              .getPublicUrl(
                photoPath
              );


          photoURL =
            publicURLResult
              .data
              .publicUrl;

        }


        /* =================================================
           SAVE REVIEW
        ================================================= */

        const insertResult =
          await supabase
            .from("reviews")
            .insert({
              name: name,
              country: country,
              rating: rating,
              review: review,
              photo_url: photoURL
            });


        if (
          insertResult.error
        ) {

          if (photoPath) {

            await supabase
              .storage
              .from("review-photos")
              .remove([
                photoPath
              ]);

          }


          throw insertResult.error;

        }


        /* =================================================
           SUCCESS
        ================================================= */

        if (status) {

          status.textContent =
            "Your review has been posted successfully!";

          status.className =
            "reviewStatus success";

        }


        reviewForm.reset();


        if (ratingInput) {

          ratingInput.value =
            "0";

        }


        document
          .querySelectorAll(
            "#starRating button"
          )
          .forEach(function (star) {

            star.classList.remove(
              "selected"
            );

          });


        const photoPreview =
          document.getElementById(
            "photoPreview"
          );


        if (photoPreview) {

          photoPreview.innerHTML =
            "";

        }


        await loadReviews();

      }


      catch (error) {

        console.error(
          "Review submission error:",
          error
        );


        if (status) {

          status.textContent =
            "Unable to post your review. Please try again.";

          status.className =
            "reviewStatus error";

        }

      }


      finally {

        if (submitButton) {

          submitButton.disabled =
            false;

          submitButton.textContent =
            "Post My Review →";

        }

      }

    }
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
    <div class="reviewsLoading">
      Loading traveller reviews...
    </div>
    `;


  try {

    const result =
      await supabase
        .from("reviews")
        .select(
          "id, name, country, rating, review, photo_url, created_at"
        )
        .order(
          "created_at",
          {
            ascending: false
          }
        );


    if (
      result.error
    ) {

      throw result.error;

    }


    const reviews =
      result.data || [];


    container.innerHTML =
      "";


    if (
      reviews.length === 0
    ) {

      container.innerHTML =
        `
        <div class="noReviews">
          No traveller reviews yet.
          Be the first to share your experience!
        </div>
        `;

      return;

    }


    reviews.forEach(
      function (data) {

        const card =
          createReviewCard(
            data
          );


        container.appendChild(
          card
        );

      }
    );

  }


  catch (error) {

    console.error(
      "Loading reviews failed:",
      error
    );


    container.innerHTML =
      `
      <div class="noReviews">
        Reviews are temporarily unavailable.
      </div>
      `;

  }

}


/* =========================================================
   CREATE REVIEW CARD
========================================================= */

function createReviewCard(
  data
) {

  const article =
    document.createElement(
      "article"
    );


  article.className =
    "reviewCard realReviewCard";


  const rating =
    Math.max(
      1,
      Math.min(
        5,
        Number(data.rating) || 5
      )
    );


  const starsHTML =
    "★".repeat(
      rating
    ) +
    "☆".repeat(
      5 - rating
    );


  const name =
    escapeHTML(
      data.name ||
      "Traveller"
    );


  const country =
    escapeHTML(
      data.country ||
      ""
    );


  const text =
    escapeHTML(
      data.review ||
      ""
    );


  let photoHTML =
    "";


  if (
    data.photo_url
  ) {

    photoHTML = `

      <img
        src="${escapeAttribute(data.photo_url)}"
        class="reviewPhoto"
        alt="Photo shared by ${name}"
        loading="lazy">

    `;

  }


  article.innerHTML = `

    ${photoHTML}

    <div class="rating">
      ${starsHTML}
    </div>

    <p>
      “${text}”
    </p>

    <strong>
      ${name}
    </strong>

    <span class="reviewCountry">
      ${country}
    </span>

  `;


  return article;

}


/* =========================================================
   SECURITY HELPERS
========================================================= */

function escapeHTML(
  value
) {

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


function escapeAttribute(
  value
) {

  return escapeHTML(
    value
  );

}
