
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

let currentSection = "dashboard";

let editingDestinationId = null;
let editingTourId = null;
let editingLocationId = null;

let currentLocationDestinationId = null;

let currentGalleryTourId = null;
let currentGalleryTourTitle = "";


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initAdmin();
});


/* =========================================================
   INIT
========================================================= */

async function initAdmin() {

  const loading = document.getElementById("loading");

  if (loading) {
    loading.innerHTML = `
      <div style="
        padding:40px;
        text-align:center;
        font-family:Arial,sans-serif;
      ">
        Loading Admin Dashboard...
      </div>

    `;
  }

  try {

    const {
      data: {
        session
      },
      error
    } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    if (!session) {

      showLogin();

      return;
    }


    renderDashboard();

    await loadDashboardData();

  } catch (error) {

    console.error(error);

    showError(
      error?.message ||
      "Unable to load admin dashboard."
    );

  }

}


/* =========================================================
   LOGIN

========================================================= */

function showLogin() {

  const loading =
    document.getElementById("loading");

  if (!loading) {
    return;
  }

  loading.innerHTML = `
    <div style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
      background:#f5f7f6;
      font-family:Arial,sans-serif;
    ">


      <div style="
        width:min(420px,100%);
        background:white;
        padding:30px;
        border-radius:18px;
        box-shadow:0 20px 60px rgba(0,0,0,.12);
      ">

        <h2 style="
          margin:0 0 8px;
          color:#173f2c;
        ">
          Admin Login
        </h2>

        <p style="
          margin:0 0 25px;
          color:#6f7c75;
        ">
          Travel With Sri Lanka

        </p>

        <form id="adminLoginForm">

          <input
            id="adminEmail"
            type="email"
            placeholder="Email"
            required
            style="
              width:100%;
              box-sizing:border-box;
              padding:13px;
              margin-bottom:12px;
              border:1px solid #d8e0db;
              border-radius:9px;
            "
          >

          <input
            id="adminPassword"
            type="password"

            placeholder="Password"
            required
            style="
              width:100%;
              box-sizing:border-box;
              padding:13px;
              margin-bottom:15px;
              border:1px solid #d8e0db;
              border-radius:9px;
            "
          >

          <button
            type="submit"
            style="
              width:100%;
              padding:13px;
              border:0;
              border-radius:9px;
              background:#1e5c3f;
              color:white;
              font-weight:700;

              cursor:pointer;
            "
          >
            Login
          </button>

          <p
            id="loginStatus"
            style="
              margin:14px 0 0;
              text-align:center;
              color:#b33;
            "
          ></p>

        </form>

      </div>

    </div>
  `;

  const form =

    document.getElementById("adminLoginForm");

  form?.addEventListener(
    "submit",
    loginAdmin
  );
}


async function loginAdmin(event) {

  event.preventDefault();

  const email =
    document.getElementById("adminEmail")?.value.trim();

  const password =
    

document.getElementById("adminPassword")?.value;

  const status =
    document.getElementById("loginStatus");

  if (status) {
    status.textContent = "Logging in...";
  }

  try {

    const {
      error
    } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      throw error;
    }

    location.reload();

  } catch (error) {

    console.error(error);

    if (status) {
      status.textContent =
        error?.message ||
        "Login failed.";
    }

  }

}


/* 

=========================================================
   DASHBOARD HTML
========================================================= */

function renderDashboard() {

  const loading =
    document.getElementById("loading");

  if (!loading) {
    return;
  }

  loading.innerHTML = `

    <div class="admin-layout">

      <aside class="admin-sidebar">

        <div class="admin-brand">

          <strong>Travel With</strong>
          <span>Sri Lanka</span>
        </div>


        <nav class="admin-nav">

          <button
            type="button"
            data-section="dashboard"
            class="admin-nav-btn active"
          >
            Dashboard
          </button>

          <button
            type="button"
            data-section="destinations"
            class="admin-nav-btn"
          >
            Destinations
          </button>


          <button
            type="button"
            data-section="tours"
            class="admin-nav-btn"
          >
            Tours
          </button>

          <button
            type="button"
            data-section="locations"
            class="admin-nav-btn"
          >
            Destination Locations
          </button>

          <button
            type="button"
            data-section="reviews"
            class="admin-nav-btn"
          >
            Reviews

          </button>

        </nav>


        <button
          id="logoutBtn"
          class="admin-logout-btn"
          type="button"
        >
          Logout
        </button>

      </aside>


      <main class="admin-main">


        <!-- DASHBOARD -->

        <section

          id="section-dashboard"
          class="admin-section"
        >

          <div class="admin-section-header">

            <div>

              <p class="admin-eyebrow">
                ADMIN PANEL
              </p>

              <h1>
                Dashboard
              </h1>

              <p>
                Manage Travel With Sri Lanka content.
              </p>

            </div>


          </div>


          <div
            class="admin-stats-grid"
            id="adminStats"
          ></div>


        </section>



        <!-- DESTINATIONS -->

        <section
          id="section-destinations"
          class="admin-section"
          style="display:none;"
        >

          <div class="admin-section-header">

            <div>

              <h2>
                Destinations
              </h2>

              <p>
                Manage destination pages.
              </p>

            </div>

            <button
              id="addDestinationBtn"
              class="admin-primary-btn"
              type="button"
            >
              + Add Destination
            </button>

          </div>


          <div
            id="destinationsList"
            class="admin-card-list"
          ></div>

        </section>



        <!-- TOURS -->

        <section
          id="section-tours"
          class="admin-section"
          style="display:none;"
        >

          <div class="admin-section-header">

            <div>

              <h2>
                Tours
              </h2>

              <p>
                Manage tour packages and galleries.
              </p>

            </div>

            <button
              id="addTourBtn"
              class="admin-primary-btn"
              type="button"
            >
              + Add Tour
            </button>

          </div>


          <div
            id="toursList"
            class="admin-card-list"
          ></div>

        </section>



        <!-- LOCATIONS -->

        <section
          id="section-locations"
          class="admin-section"
          style="display:none;"
        >

          <div class="admin-section-header">

            <div>

              <h2>
                Destination Locations
              </h2>

              <p>
                Manage locations inside destinations.
              </p>

            </div>

          </div>


          <div
            id="locationsList"
            class="admin-card-list"
          ></div>

        </section>


        <!-- REVIEWS -->

        <section
          id="section-reviews"
          class="admin-section"
          style="display:none;"
        >

          <div class="admin-section-header">

            <div>

              <h2>
                Reviews
              </h2>

              <p>
                Manage traveler reviews.
              </p>

            </div>


          </div>


          <div
            id="reviewsList"
            class="admin-card-list"
          ></div>

        </section>


      </main>

    </div>


    <!-- ===================================================
         DESTINATION MODAL
    

==================================================== -->

    <div
      id="destinationModal"
      class="admin-modal"
      style="display:none;"
    >

      <div class="admin-modal-overlay"></div>

      <div class="admin-modal-box">

        <button
          type="button"
          class="admin-modal-close"
          data-close-modal="destinationModal"
        >
          ×
        </button>

        <h2 id="destinationModalTitle">

          Add Destination
        </h2>

        <form id="destinationForm">

          <input
            type="hidden"
            id="destinationId"
          >

          <label>
            Name
          </label>

          <input
            id="destinationName"
            type="text"
            required
          >

          <label>
            Slug

          </label>

          <input
            id="destinationSlug"
            type="text"
            required
          >

          <label>
            Description
          </label>

          <textarea
            id="destinationDescription"
            rows="5"
          ></textarea>

          <label>
            Image URL
          </label>

          <input

            id="destinationImageUrl"
            type="url"
          >

          <label>
            Page URL
          </label>

          <input
            id="destinationPageUrl"
            type="text"
          >

          <label>
            Sort Order
          </label>

          <input
            id="destinationSortOrder"
            type="number"
            value="0"
          >


          <button
            class="admin-primary-btn"
            type="submit"
          >
            Save Destination
          </button>

          <p
            id="destinationStatus"
            class="admin-status"
          ></p>

        </form>

      </div>

    </div>



    <!-- 

===================================================
         TOUR MODAL
    ==================================================== -->

    <div
      id="tourModal"
      class="admin-modal"
      style="display:none;"
    >

      <div class="admin-modal-overlay"></div>

      <div class="admin-modal-box">

        <button
          type="button"
          class="admin-modal-close"
          data-close-modal="tourModal"

        >
          ×
        </button>

        <h2 id="tourModalTitle">
          Add Tour
        </h2>

        <form id="tourForm">

          <input
            type="hidden"
            id="tourId"
          >

          <label>
            Title
          </label>

          <input
            id="tourTitle"
            type="text"
            required

          >

          <label>
            Slug
          </label>

          <input
            id="tourSlug"
            type="text"
            required
          >

          <label>
            Description
          </label>

          <textarea
            id="tourDescription"
            rows="5"
          ></textarea>

          <label>

            Main Image URL
          </label>

          <input
            id="tourImageUrl"
            type="url"
          >

          <label>
            Page URL
          </label>

          <input
            id="tourPageUrl"
            type="text"
          >

          <label>
            Sort Order
          </label>

          <input

            id="tourSortOrder"
            type="number"
            value="0"
          >

          <button
            class="admin-primary-btn"
            type="submit"
          >
            Save Tour
          </button>

          <p
            id="tourStatus"
            class="admin-status"
          ></p>

        </form>

      </div>

    </div>




    <!-- ===================================================
         LOCATION MODAL
    ==================================================== -->

    <div
      id="locationModal"
      class="admin-modal"
      style="display:none;"
    >

      <div class="admin-modal-overlay"></div>

      <div class="admin-modal-box">

        <button
          type="button"
          class="admin-modal-close"
          data-close-modal="locationModal"
        >
          ×
        </button>

        <h2>
          Add Location
        </h2>

        <form id="locationForm">

          <input
            type="hidden"
            id="locationId"
          >

          <input
            type="hidden"
            id="locationDestinationId"
          >


          <label>
            Location Name
          </label>

          <input
            id="locationName"
            type="text"
            required
          >

          <label>
            Description
          </label>

          <textarea
            id="locationDescription"
            rows="4"
          ></textarea>

          <label>
            Image Path

          </label>

          <input
            id="locationImagePath"
            type="text"
          >

          <label>
            Image URL
          </label>

          <input
            id="locationImageUrl"
            type="url"
          >

          <label>
            Location Number
          </label>

          <input
            id="locationNumber"

            type="number"
            value="1"
            min="1"
          >

          <label>
            Sort Order
          </label>

          <input
            id="locationSortOrder"
            type="number"
            value="0"
          >

          <button
            class="admin-primary-btn"
            type="submit"
          >
            Save Location
          </button>

          <p
            id="locationStatus"
            class="admin-status"
          ></p>

        </form>

      </div>

    </div>



    <!-- ===================================================
         TOUR GALLERY MODAL
    ==================================================== -->

    <div

      id="galleryModal"
      class="admin-modal"
      style="display:none;"
    >

      <div class="admin-modal-overlay"></div>

      <div
        class="admin-modal-box admin-gallery-modal-box"
      >

        <button
          type="button"
          class="admin-modal-close"
          id="galleryCloseBtn"
        >
          ×
        </button>

        <div class="gallery-modal-header">

          <p class="admin-eyebrow">
            TOUR GALLERY
          </p>

          <h2 id="galleryTourTitle">
            Tour Gallery
          </h2>

        </div>


        <div class="gallery-upload-area">

          <label
            for="galleryFiles"
            class="gallery-file-label"
          >
            Select Photos
          </label>

          <input

            id="galleryFiles"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
          >

          <small>
            JPG, PNG, WEBP or GIF • Maximum 5 MB per image
          </small>


          <button
            type="button"
            id="galleryUploadBtn"
            class="admin-primary-btn"
          >
            Upload Photos
          </button>

          <p
            id="galleryStatus"
            class="admin-status"
          ></p>

        </div>


        <div
          id="galleryGrid"
          class="admin-gallery-grid"
        ></div>

      </div>

    </div>


  `;


  injectAdminStyles();


  initAdminEvents();

}


/* =========================================================
   EVENTS
========================================================= */

function initAdminEvents() {

  document
    .querySelectorAll(".admin-nav-btn")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {


          switchSection(
            button.dataset.section
          );

        }
      );

    });


  document
    .getElementById("logoutBtn")
    ?.addEventListener(
      "click",
      logoutAdmin
    );


  document
    .getElementById("addDestinationBtn")
    ?.addEventListener(

      "click",
      () => openDestinationModal()
    );


  document
    .getElementById("addTourBtn")
    ?.addEventListener(
      "click",
      () => openTourModal()
    );


  document
    .getElementById("destinationForm")
    ?.addEventListener(
      "submit",
      saveDestination
    );


  document

    .getElementById("tourForm")
    ?.addEventListener(
      "submit",
      saveTour
    );


  document
    .getElementById("locationForm")
    ?.addEventListener(
      "submit",
      saveLocation
    );


  document
    .querySelectorAll("[data-close-modal]")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          closeModal(
            button.dataset.closeModal
          );

        }
      );

    });


  document
    .querySelectorAll(".admin-modal-overlay")
    .forEach((overlay) => {

      overlay.addEventListener(
        "click",
        () => {

          const modal =
            overlay.closest(".admin-modal");

          if (modal) {
            modal.style.display = "none";
          }

        }
      );

    });


  document
    .getElementById("galleryCloseBtn")
    ?.addEventListener(
      "click",
      closeGalleryModal
    );


  document
    .getElementById("galleryUploadBtn")
    ?.addEventListener(
      "click",

      uploadGalleryImages
    );


  document
    .getElementById("galleryFiles")
    ?.addEventListener(
      "change",
      previewGalleryFiles
    );


  document.addEventListener(
    "click",
    handleDynamicClicks
  );

}


/* ===================================

======================
   DYNAMIC CLICKS
========================================================= */

function handleDynamicClicks(event) {

  const editDestination =
    event.target.closest(
      "[data-edit-destination]"
    );

  if (editDestination) {

    editDestinationById(
      Number(
        editDestination.dataset.editDestination
      )
    );

    return;

  }


  const deleteDestinationButton =
    event.target.closest(
      "[data-delete-destination]"
    );

  if (deleteDestinationButton) {

    deleteDestination(
      Number(
        deleteDestinationButton.dataset.deleteDestination
      )
    );

    return;
  }


  const editTour =

    event.target.closest(
      "[data-edit-tour]"
    );

  if (editTour) {

    editTourById(
      Number(
        editTour.dataset.editTour
      )
    );

    return;
  }


  const deleteTourButton =
    event.target.closest(
      "[data-delete-tour]"
    );

  if (deleteTourButton) {


    deleteTour(
      Number(
        deleteTourButton.dataset.deleteTour
      )
    );

    return;
  }


  const openGalleryButton =
    event.target.closest(
      "[data-open-gallery]"
    );

  if (openGalleryButton) {

    openGalleryModal(
      Number(
        openGalleryButton.dataset.openGallery

      ),
      openGalleryButton.dataset.tourTitle || "Tour"
    );

    return;
  }


  const addLocationButton =
    event.target.closest(
      "[data-add-location]"
    );

  if (addLocationButton) {

    openLocationModal(
      Number(
        addLocationButton.dataset.addLocation
      )
    );


    return;
  }


  const editLocationButton =
    event.target.closest(
      "[data-edit-location]"
    );

  if (editLocationButton) {

    editLocationById(
      Number(
        editLocationButton.dataset.editLocation
      )
    );

    return;
  }


  const deleteLocationButton =
    event.target.closest(
      "[data-delete-location]"
    );

  if (deleteLocationButton) {

    deleteLocation(
      Number(
        deleteLocationButton.dataset.deleteLocation
      )
    );

    return;
  }


  const deleteReviewButton =
    event.target.closest(

      "[data-delete-review]"
    );

  if (deleteReviewButton) {

    deleteReview(
      deleteReviewButton.dataset.deleteReview
    );

  }


  const deleteGalleryButton =
    event.target.closest(
      "[data-delete-gallery]"
    );

  if (deleteGalleryButton) {

    deleteGalleryImage(
      Number(
        

deleteGalleryButton.dataset.deleteGallery
      )
    );

  }

}


/* =========================================================
   SECTION SWITCH
========================================================= */

function switchSection(section) {

  currentSection = section;


  document

    .querySelectorAll(".admin-section")
    .forEach((element) => {

      element.style.display =
        element.id ===
        `section-${section}`
          ? "block"
          : "none";

    });


  document
    .querySelectorAll(".admin-nav-btn")
    .forEach((button) => {

      button.classList.toggle(
        "active",
        button.dataset.section === section
      );

    });



  if (section === "dashboard") {
    loadDashboardStats();
  }

  if (section === "destinations") {
    loadDestinationsAdmin();
  }

  if (section === "tours") {
    loadToursAdmin();
  }

  if (section === "locations") {
    loadLocationsAdmin();
  }

  if (section === "reviews") {
    loadReviewsAdmin();
  }

}


/* =========================================================
   LOAD ALL
========================================================= */

async function loadDashboardData() {

  await Promise.all([
    loadDashboardStats(),
    loadDestinationsAdmin(),
    loadToursAdmin(),
    loadLocationsAdmin(),
    loadReviewsAdmin()
  ]);

}


/* =========================================================
   DASHBOARD STATS
========================================================= */

async function loadDashboardStats() {

  const container =
    document.getElementById("adminStats");

  if (!container) {
    return;
  }


  const [
    destinations,
    tours,
    locations,

    reviews
  ] =
    await Promise.all([
      countTable("destinations"),
      countTable("tours"),
      countTable("destination_locations"),
      countTable("reviews")
    ]);


  container.innerHTML = `

    <div class="admin-stat-card">
      <strong>${destinations}</strong>
      <span>Destinations</span>
    </div>

    <div class="admin-stat-card">
      <strong>${tours}</strong>
      <span>Tours</span>
    </div>

    <div class="admin-stat-card">
      <strong>${locations}</strong>
      <span>Locations</span>
    </div>

    <div class="admin-stat-card">
      <strong>${reviews}</strong>
      <span>Reviews</span>
    </div>

  `;

}


async function countTable(table) {

  const {
    count,
    error
  } =
    await supabase

      .from(table)
      .select("*", {
        count: "exact",
        head: true
      });


  if (error) {

    console.error(
      `Count ${table}:`,
      error
    );

    return 0;
  }


  return count || 0;

}


/* =========================================================
   DESTINATIONS
========================================================= */

async function loadDestinationsAdmin() {

  const container =
    document.getElementById(
      "destinationsList"
    );

  if (!container) {
    return;
  }


  container.innerHTML =
    loadingHTML("Loading destinations...");



  const {
    data,
    error
  } =
    await supabase
      .from("destinations")
      .select("*")
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

    container.innerHTML =
      errorHTML(error.message);

    return;
  }


  if (!data?.length) {

    container.innerHTML =
      emptyHTML("No destinations yet.");

    return;
  }


  container.innerHTML =
    data.map(
      createDestinationAdminCard
    ).join("");


}


function createDestinationAdminCard(destination) {

  const image =
    destination.image_url ||
    "https://placehold.co/500x300?text=Destination";


  return `

    <article class="admin-content-card">

      <img
        src="${escapeAttribute(image)}"
        alt="${escapeAttribute(destination.name || "")}"
        loading="lazy"

      >

      <div class="admin-content-card-body">

        <h3>
          ${escapeHTML(
            destination.name || "Destination"
          )}
        </h3>

        <p>
          ${escapeHTML(
            truncate(
              destination.description || "",
              150
            )
          )}
        </p>

        <div class="admin-card-actions">

          <button

            type="button"
            class="admin-small-btn"
            data-edit-destination="${Number(destination.id)}"
          >
            Edit
          </button>

          <button
            type="button"
            class="admin-small-btn"
            data-add-location="${Number(destination.id)}"
          >
            Locations
          </button>

          <button
            type="button"
            class="admin-small-btn danger"
            data-delete-destination="${Number(destination.id)}"

          >
            Delete
          </button>

        </div>

      </div>

    </article>

  `;

}


/* =========================================================
   ADD / EDIT DESTINATION
========================================================= */

async function editDestinationById(id) {

  const {
    data,
    error
  } =
    await supabase
      .from("destinations")
      .select("*")
      .eq("id", id)
      .single();


  if (error) {

    alert(error.message);

    return;
  }


  editingDestinationId = id;



  document.getElementById(
    "destinationModalTitle"
  ).textContent = "Edit Destination";


  document.getElementById(
    "destinationId"
  ).value = id;


  document.getElementById(
    "destinationName"
  ).value = data.name || "";


  document.getElementById(
    "destinationSlug"
  ).value = data.slug || "";


  document.getElementById(

    "destinationDescription"
  ).value = data.description || "";


  document.getElementById(
    "destinationImageUrl"
  ).value = data.image_url || "";


  document.getElementById(
    "destinationPageUrl"
  ).value = data.page_url || "";


  document.getElementById(
    "destinationSortOrder"
  ).value = data.sort_order ?? 0;


  openModal("destinationModal");

}



function openDestinationModal() {

  editingDestinationId = null;


  document.getElementById(
    "destinationModalTitle"
  ).textContent = "Add Destination";


  document.getElementById(
    "destinationForm"
  ).reset();


  document.getElementById(
    "destinationId"
  ).value = "";

  openModal("destinationModal");

}


async function saveDestination(event) {

  event.preventDefault();


  const payload = {

    name:
      document.getElementById(
        "destinationName"
      ).value.trim(),

    slug:
      document.getElementById(
        "destinationSlug"
      ).value.trim(),

    description:
      document.getElementById(
        "destinationDescription"
      ).value.trim() || null,

    image_url:
      document.getElementById(
        "destinationImageUrl"
      ).value.trim() || null,

    page_url:
      document.getElementById(
        "destinationPageUrl"
      ).value.trim() || null,

    sort_order:
      Number(
        document.getElementById(
          "destinationSortOrder"
        ).value
      ) || 0

  };


  const status =
    document.getElementById(
      "destinationStatus"
    );


  if (status) {
    status.textContent = "Saving...";
  }


  let error;


  if (editingDestinationId) {

    ({
      error
    } =
      await supabase

        .from("destinations")
        .update(payload)
        .eq(
          "id",
          editingDestinationId
        ));

  } else {

    ({
      error
    } =
      await supabase
        .from("destinations")
        .insert(payload));

  }


  if (error) {

    console.error(error);


    if (status) {
      status.textContent =
        error.message;
    }

    return;
  }


  closeModal("destinationModal");

  await loadDestinationsAdmin();

  await loadDashboardStats();

}


async function deleteDestination(id) {

  const confirmed =

    confirm(
      "Delete this destination? Its locations may also be deleted."
    );


  if (!confirmed) {
    return;
  }


  const {
    error
  } =
    await supabase
      .from("destinations")
      .delete()
      .eq("id", id);


  if (error) {

    alert(error.message);

    return;
  }


  await loadDestinationsAdmin();

  await loadLocationsAdmin();

  await loadDashboardStats();

}


/* =========================================================
   TOURS
========================================================= */

async function loadToursAdmin() {

  const container =
    document.getElementById(
      "toursList"
    );

  if (!container) {
    return;
  }


  container.innerHTML =
    loadingHTML("Loading tours...");


  const {
    data,
    error
  } =
    await supabase
      .from("tours")

      .select("*")
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

    container.innerHTML =
      errorHTML(error.message);

    return;
  }


  if (!data?.length) {

    container.innerHTML =
      emptyHTML("No tours yet.");

    return;
  }


  const tourIds =
    data.map(
      (tour) => Number(tour.id)
    );


  let galleryCounts = {};


  if (tourIds.length) {

    const {

      data: galleryRows
    } =
      await supabase
        .from("tour_gallery")
        .select("tour_id")
        .in(
          "tour_id",
          tourIds
        );


    (galleryRows || [])
      .forEach((row) => {

        const id =
          Number(row.tour_id);

        galleryCounts[id] =
          (galleryCounts[id] || 0) + 1;

      });

  }


  container.innerHTML =
    data.map(
      (tour) =>
        createTourAdminCard(
          tour,
          galleryCounts[
            Number(tour.id)
          ] || 0
        )
    ).join("");

}


function createTourAdminCard(
  tour,
  galleryCount
) {

  const image =
    tour.image_url ||
    "https://placehold.co/500x300?text=Tour";


  return `

    <article class="admin-content-card">

      <img
        src="${escapeAttribute(image)}"
        alt="${escapeAttribute(tour.title || "")}"
        loading="lazy"
      >


      <div class="admin-content-card-body">

        <h3>
          ${escapeHTML(
            tour.title || "Tour"

          )}
        </h3>


        <p>
          ${escapeHTML(
            truncate(
              tour.description || "",
              150
            )
          )}
        </p>


        <div class="admin-gallery-count">
          📷 ${galleryCount} gallery image${galleryCount === 1 ? "" : "s"}
        </div>


        <div class="admin-card-actions">

          <button

            type="button"
            class="admin-small-btn"
            data-edit-tour="${Number(tour.id)}"
          >
            Edit
          </button>


          <button
            type="button"
            class="admin-small-btn gallery-btn"
            data-open-gallery="${Number(tour.id)}"
            data-tour-title="${escapeAttribute(tour.title || "Tour")}"
          >
            📷 Gallery
          </button>


          <button
            type="button"

            class="admin-small-btn danger"
            data-delete-tour="${Number(tour.id)}"
          >
            Delete
          </button>

        </div>

      </div>

    </article>

  `;

}


/* =========================================================
   ADD / EDIT TOUR

========================================================= */

async function editTourById(id) {

  const {
    data,
    error
  } =
    await supabase
      .from("tours")
      .select("*")
      .eq("id", id)
      .single();


  if (error) {

    alert(error.message);

    return;
  }



  editingTourId = id;


  document.getElementById(
    "tourModalTitle"
  ).textContent = "Edit Tour";


  document.getElementById(
    "tourId"
  ).value = id;


  document.getElementById(
    "tourTitle"
  ).value = data.title || "";


  document.getElementById(
    "tourSlug"

  ).value = data.slug || "";


  document.getElementById(
    "tourDescription"
  ).value = data.description || "";


  document.getElementById(
    "tourImageUrl"
  ).value = data.image_url || "";


  document.getElementById(
    "tourPageUrl"
  ).value = data.page_url || "";


  document.getElementById(
    "tourSortOrder"
  ).value = data.sort_order ?? 0;


  openModal("tourModal");

}


function openTourModal() {

  editingTourId = null;


  document.getElementById(
    "tourModalTitle"
  ).textContent = "Add Tour";


  document.getElementById(
    "tourForm"
  ).reset();


  document.getElementById(
    "tourId"

  ).value = "";


  openModal("tourModal");

}


async function saveTour(event) {

  event.preventDefault();


  const payload = {

    title:
      document.getElementById(
        "tourTitle"
      ).value.trim(),

    slug:
      document.getElementById(

        "tourSlug"
      ).value.trim(),

    description:
      document.getElementById(
        "tourDescription"
      ).value.trim() || null,

    image_url:
      document.getElementById(
        "tourImageUrl"
      ).value.trim() || null,

    page_url:
      document.getElementById(
        "tourPageUrl"
      ).value.trim() || null,

    sort_order:
      Number(
        document.getElementById(
          "tourSortOrder"

        ).value
      ) || 0

  };


  const status =
    document.getElementById(
      "tourStatus"
    );


  if (status) {
    status.textContent = "Saving...";
  }


  let error;


  if (editingTourId) {

    ({
      error
    } =
      await supabase
        .from("tours")
        .update(payload)
        .eq(
          "id",
          editingTourId
        ));

  } else {

    ({
      error
    } =
      await supabase
        .from("tours")
        .insert(payload));

  }


  if (error) {

    console.error(error);

    if (status) {
      status.textContent =
        error.message;
    }

    return;
  }


  closeModal("tourModal");

  await loadToursAdmin();

  await loadDashboardStats();

}

async function deleteTour(id) {

  const confirmed =
    confirm(
      "Delete this tour and all its gallery images?"
    );


  if (!confirmed) {
    return;
  }


  const {
    data: galleryRows
  } =
    await supabase
      .from("tour_gallery")
      .select("image_path")
      .eq(
        "tour_id",

        id
      );


  const paths =
    (galleryRows || [])
      .map(
        (row) => row.image_path
      )
      .filter(Boolean);


  if (paths.length) {

    const {
      error: storageError
    } =
      await supabase
        .storage
        .from("tour-gallery")
        .remove(paths);


    if (storageError) {
      console.warn(
        "Gallery storage cleanup failed:",
        storageError
      );
    }

  }


  const {
    error
  } =
    await supabase
      .from("tours")
      .delete()
      .eq(
        "id",
        id
      );


  if (error) {

    alert(error.message);

    return;
  }


  await loadToursAdmin();

  await loadDashboardStats();

}


/* =========================================================
   TOUR GALLERY
========================================================= */


async function openGalleryModal(
  tourId,
  tourTitle
) {

  currentGalleryTourId =
    Number(tourId);

  currentGalleryTourTitle =
    tourTitle || "Tour";


  const title =
    document.getElementById(
      "galleryTourTitle"
    );

  if (title) {
    title.textContent =
      currentGalleryTourTitle;
  }



  const files =
    document.getElementById(
      "galleryFiles"
    );

  if (files) {
    files.value = "";
  }


  const status =
    document.getElementById(
      "galleryStatus"
    );

  if (status) {
    status.textContent = "";
  }


  openModal("galleryModal");



  await loadGalleryImages();

}


async function loadGalleryImages() {

  const grid =
    document.getElementById(
      "galleryGrid"
    );

  if (!grid) {
    return;
  }


  grid.innerHTML =
    loadingHTML(
      "Loading gallery..."

    );


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
        currentGalleryTourId
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

    grid.innerHTML =
      errorHTML(error.message);

    return;
  }

  if (!data?.length) {

    grid.innerHTML =
      emptyHTML(
        "No gallery images yet."
      );

    return;
  }


  grid.innerHTML =
    data
      .map(
        createGalleryAdminCard
      )
      .join("");

}


function createGalleryAdminCard(image) {


  let imageUrl =
    image.image_url || "";


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

      data?.publicUrl || "";

  }


  return `

    <div class="admin-gallery-item">

      <img
        src="${escapeAttribute(imageUrl)}"
        alt="Tour gallery image"
        loading="lazy"
      >

      <div class="admin-gallery-item-footer">

        <span>
          #${Number(image.sort_order || 0)}
        </span>

        <button
          type="button"

          class="admin-small-btn danger"
          data-delete-gallery="${Number(image.id)}"
        >
          Delete
        </button>

      </div>

    </div>

  `;

}


function previewGalleryFiles() {

  const input =
    document.getElementById(
      "galleryFiles"
    );


  const status =
    document.getElementById(
      "galleryStatus"
    );


  if (!input || !status) {
    return;
  }


  const files =
    Array.from(
      input.files || []
    );


  if (!files.length) {

    status.textContent = "";

    return;
  }


  const invalid =
    files.find(
      (file) =>
        file.size > 5 * 1024 * 1024
    );


  if (invalid) {

    status.textContent =
      `File "${invalid.name}" is larger than 5 MB.`;

    return;
  }


  status.textContent =

    `${files.length} image${files.length === 1 ? "" : "s"} selected.`;

}


async function uploadGalleryImages() {

  const input =
    document.getElementById(
      "galleryFiles"
    );

  const status =
    document.getElementById(
      "galleryStatus"
    );

  const uploadButton =
    document.getElementById(
      "galleryUploadBtn"
    );



  if (
    !input ||
    !status ||
    !uploadButton
  ) {
    return;
  }


  const files =
    Array.from(
      input.files || []
    );


  if (!files.length) {

    status.textContent =
      "Please select at least one image.";

    return;

  }


  if (!currentGalleryTourId) {

    status.textContent =
      "Tour not selected.";

    return;
  }


  const invalidFile =
    files.find(
      (file) =>
        file.size >
        5 * 1024 * 1024
    );


  if (invalidFile) {

    status.textContent =
      `"${invalidFile.name}" is larger than 5 MB.`;

    return;
  }


  uploadButton.disabled = true;

  status.textContent =
    "Uploading images...";


  try {

    const {
      data: existingRows,
      error: existingError
    } =
      await supabase
        .from("tour_gallery")

        .select("sort_order")
        .eq(
          "tour_id",
          currentGalleryTourId
        )
        .order(
          "sort_order",
          {
            ascending: false
          }
        )
        .limit(1);


    if (existingError) {
      throw existingError;
    }


    let nextSortOrder =
      Number(
        existingRows?.[0]?.sort_order

      ) + 1;


    if (
      !Number.isFinite(nextSortOrder) ||
      nextSortOrder < 1
    ) {
      nextSortOrder = 1;
    }


    for (
      let index = 0;
      index < files.length;
      index++
    ) {

      const file =
        files[index];


      const extension =

        getFileExtension(file.name);


      const uniqueName =
        `${Date.now()}-${createRandomId()}.${extension}`;


      const path =
        `tours/${currentGalleryTourId}/${uniqueName}`;


      const {
        error: uploadError
      } =
        await supabase
          .storage
          .from("tour-gallery")
          .upload(
            path,
            file,

            {
              cacheControl: "3600",
              upsert: false,
              contentType:
                file.type ||
                "image/jpeg"
            }
          );


      if (uploadError) {
        throw uploadError;
      }


      const {
        data: publicUrlData
      } =
        supabase
          .storage
          .from("tour-gallery")
          .getPublicUrl(path);


      const publicUrl =
        publicUrlData?.publicUrl ||
        null;


      const {
        error: insertError
      } =
        await supabase
          .from("tour_gallery")
          .insert({

            tour_id:
              currentGalleryTourId,

            image_path:
              path,

            image_url:
              publicUrl,

            sort_order:
              nextSortOrder++

          });


      if (insertError) {

        await supabase
          .storage
          .from("tour-gallery")
          .remove([path]);

        throw insertError;
      }

    }


    input.value = "";

    status.textContent =
      "Gallery images uploaded successfully.";


    await loadGalleryImages();

    await loadToursAdmin();


  } catch (error) {

    console.error(error);

    status.textContent =
      error?.message ||
      "Upload failed.";

  } finally {

    uploadButton.disabled = false;

  }


}


async function deleteGalleryImage(id) {

  const confirmed =
    confirm(
      "Delete this gallery image?"
    );


  if (!confirmed) {
    return;
  }


  const {
    data,
    error: fetchError
  } =
    await supabase

      .from("tour_gallery")
      .select(
        "image_path"
      )
      .eq(
        "id",
        id
      )
      .single();


  if (fetchError) {

    alert(fetchError.message);

    return;
  }


  if (
    data?.image_path
  ) {

    const {
      error: storageError
    } =
      await supabase
        .storage
        .from("tour-gallery")
        .remove([
          data.image_path
        ]);


    if (storageError) {

      console.warn(
        "Storage delete failed:",
        storageError
      );

    }

  }


  const {
    error
  } =
    await supabase
      .from("tour_gallery")
      .delete()
      .eq(
        "id",
        id
      );


  if (error) {

    alert(error.message);

    return;
  }


  await loadGalleryImages();


  await loadToursAdmin();

}


/* =========================================================
   LOCATIONS
========================================================= */

async function loadLocationsAdmin() {

  const container =
    document.getElementById(
      "locationsList"
    );

  if (!container) {
    return;

  }


  container.innerHTML =
    loadingHTML(
      "Loading locations..."
    );


  const {
    data: destinations,
    error
  } =
    await supabase
      .from("destinations")
      .select(
        "id,name,slug"
      )
      .order(
        "sort_order",
        {
          ascending: true

        }
      );


  if (error) {

    container.innerHTML =
      errorHTML(error.message);

    return;
  }


  if (!destinations?.length) {

    container.innerHTML =
      emptyHTML(
        "Create a destination first."
      );

    return;
  }



  const html = [];


  for (
    const destination of destinations
  ) {

    const {
      data: locations
    } =
      await supabase
        .from(
          "destination_locations"
        )
        .select("*")
        .eq(
          "destination_id",
          destination.id
        )
        .order(
          "sort_order",

          {
            ascending: true
          }
        );


    html.push(`

      <div class="admin-location-group">

        <div class="admin-location-header">

          <div>

            <h3>
              ${escapeHTML(
                destination.name
              )}
            </h3>

            <small>
              ${locations?.length || 0}

              locations
            </small>

          </div>


          <button
            type="button"
            class="admin-primary-btn"
            data-add-location="${Number(destination.id)}"
          >
            + Add Location
          </button>

        </div>


        <div class="admin-location-list">

          ${
            locations?.length

              ? locations
                  .map(
                    createLocationAdminCard
                  )
                  .join("")
              : emptyHTML(
                  "No locations yet."
                )
          }

        </div>

      </div>

    `);

  }


  container.innerHTML =
    html.join("");

}


function createLocationAdminCard(location) {

  const image =
    location.image_url ||
    "https://placehold.co/300x200?text=Location";


  return `

    <article class="admin-content-card compact">

      <img
        src="${escapeAttribute(image)}"
        alt="${escapeAttribute(location.name || "")}"
        loading="lazy"

      >


      <div class="admin-content-card-body">

        <h3>
          ${escapeHTML(
            location.name || "Location"
          )}
        </h3>


        <p>
          ${escapeHTML(
            truncate(
              location.description || "",
              120
            )
          )}
        </p>


        <div class="admin-card-actions">


          <button
            type="button"
            class="admin-small-btn"
            data-edit-location="${Number(location.id)}"
          >
            Edit
          </button>


          <button
            type="button"
            class="admin-small-btn danger"
            data-delete-location="${Number(location.id)}"
          >
            Delete
          </button>

        </div>

      </div>

    </article>

  `;

}


function openLocationModal(
  destinationId
) {

  editingLocationId = null;

  currentLocationDestinationId =
    Number(destinationId);


  document.getElementById(
    "locationForm"
  ).reset();



  document.getElementById(
    "locationId"
  ).value = "";


  document.getElementById(
    "locationDestinationId"
  ).value =
    currentLocationDestinationId;


  openModal("locationModal");

}


async function editLocationById(id) {

  const {
    data,

    error
  } =
    await supabase
      .from(
        "destination_locations"
      )
      .select("*")
      .eq(
        "id",
        id
      )
      .single();


  if (error) {

    alert(error.message);

    return;
  }

  editingLocationId = id;

  currentLocationDestinationId =
    Number(data.destination_id);


  document.getElementById(
    "locationId"
  ).value = id;


  document.getElementById(
    "locationDestinationId"
  ).value =
    data.destination_id;


  document.getElementById(
    "locationName"
  ).value =
    data.name || "";


  document.getElementById(
    "locationDescription"
  ).value =
    data.description || "";


  document.getElementById(
    "locationImagePath"
  ).value =
    data.image_path || "";


  document.getElementById(
    "locationImageUrl"
  ).value =
    data.image_url || "";


  document.getElementById(
    "locationNumber"
  ).value =
    data.location_number || 1;



  document.getElementById(
    "locationSortOrder"
  ).value =
    data.sort_order ?? 0;


  openModal("locationModal");

}


async function saveLocation(event) {

  event.preventDefault();


  const destinationId =
    Number(
      document.getElementById(
        "locationDestinationId"

      ).value
    );


  const payload = {

    destination_id:
      destinationId,

    location_number:
      Number(
        document.getElementById(
          "locationNumber"
        ).value
      ) || 1,

    name:
      document.getElementById(
        "locationName"
      ).value.trim(),

    description:

      document.getElementById(
        "locationDescription"
      ).value.trim() || null,

    image_path:
      document.getElementById(
        "locationImagePath"
      ).value.trim() || null,

    image_url:
      document.getElementById(
        "locationImageUrl"
      ).value.trim() || null,

    sort_order:
      Number(
        document.getElementById(
          "locationSortOrder"
        ).value
      ) || 0

  };



  const status =
    document.getElementById(
      "locationStatus"
    );


  if (status) {
    status.textContent = "Saving...";
  }


  let error;


  if (editingLocationId) {

    ({
      error
    } =
      await supabase

        .from(
          "destination_locations"
        )
        .update(payload)
        .eq(
          "id",
          editingLocationId
        ));

  } else {

    ({
      error
    } =
      await supabase
        .from(
          "destination_locations"
        )
        .insert(payload));

  }

  if (error) {

    console.error(error);

    if (status) {
      status.textContent =
        error.message;
    }

    return;
  }


  closeModal("locationModal");

  await loadLocationsAdmin();

  await loadDashboardStats();

}

async function deleteLocation(id) {

  const confirmed =
    confirm(
      "Delete this location?"
    );


  if (!confirmed) {
    return;
  }


  const {
    error
  } =
    await supabase
      .from(
        "destination_locations"
      )
      .delete()
      .eq(

        "id",
        id
      );


  if (error) {

    alert(error.message);

    return;
  }


  await loadLocationsAdmin();

  await loadDashboardStats();

}


/* ===================================

======================
   REVIEWS
========================================================= */

async function loadReviewsAdmin() {

  const container =
    document.getElementById(
      "reviewsList"
    );

  if (!container) {
    return;
  }


  container.innerHTML =
    loadingHTML(
      "Loading reviews..."
    );


  const {
    data,
    error
  } =
    await supabase
      .from("reviews")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    container.innerHTML =
      errorHTML(error.message);

    return;

  }


  if (!data?.length) {

    container.innerHTML =
      emptyHTML(
        "No reviews yet."
      );

    return;
  }


  container.innerHTML =
    data
      .map(
        createReviewAdminCard
      )
      .join("");

}


function createReviewAdminCard(review) {

  const rating =
    Math.max(
      0,
      Math.min(
        5,
        Number(review.rating) || 0
      )
    );


  const stars =
    "★".repeat(rating) +
    "☆".repeat(5 - rating);


  return `

    <article class="admin-review-card">

      ${
        review.photo_url
          ? `
            <img
              src="${escapeAttribute(review.photo_url)}"
              alt="${escapeAttribute(review.name || "Traveler")}"
              loading="lazy"
            >
          `
          : ""
      }


      <div>

        <h3>
          ${escapeHTML(
            review.name || "Traveler"
          )}

        </h3>


        <span>
          ${escapeHTML(
            review.country || ""
          )}
        </span>


        <div class="admin-review-stars">
          ${stars}
        </div>


        <p>
          ${escapeHTML(
            review.review || ""
          )}
        </p>

        <button
          type="button"
          class="admin-small-btn danger"
          data-delete-review="${escapeAttribute(review.id)}"
        >
          Delete Review
        </button>

      </div>

    </article>

  `;

}


async function deleteReview(id) {

  const confirmed =
    confirm(

      "Delete this review?"
    );


  if (!confirmed) {
    return;
  }


  const {
    data,
    error: fetchError
  } =
    await supabase
      .from("reviews")
      .select(
        "photo_path"
      )
      .eq(
        "id",
        id
      )
      .single();



  if (
    !fetchError &&
    data?.photo_path
  ) {

    await supabase
      .storage
      .from("review-photos")
      .remove([
        data.photo_path
      ]);

  }


  const {
    error
  } =
    await supabase
      .from("reviews")

      .delete()
      .eq(
        "id",
        id
      );


  if (error) {

    alert(error.message);

    return;
  }


  await loadReviewsAdmin();

  await loadDashboardStats();

}

/* =========================================================
   LOGOUT
========================================================= */

async function logoutAdmin() {

  await supabase.auth.signOut();

  location.reload();

}


/* =========================================================
   MODAL HELPERS
========================================================= */


function openModal(id) {

  const modal =
    document.getElementById(id);

  if (modal) {
    modal.style.display = "flex";
  }

}


function closeModal(id) {

  const modal =
    document.getElementById(id);

  if (modal) {
    modal.style.display = "none";
  }

}


function closeGalleryModal() {

  currentGalleryTourId = null;

  currentGalleryTourTitle = "";

  closeModal("galleryModal");

}


/* =========================================================
   ERROR / LOADING
========================================================= */

function loadingHTML(text) {


  return `

    <div class="admin-message-card">

      <div class="admin-spinner"></div>

      <p>
        ${escapeHTML(text)}
      </p>

    </div>

  `;

}


function errorHTML(text) {

  return `

    <div class="admin-message-card error">


      <strong>
        Error
      </strong>

      <p>
        ${escapeHTML(text)}
      </p>

    </div>

  `;

}


function emptyHTML(text) {

  return `

    <div class="admin-message-card">

      <p>
        ${escapeHTML(text)}
      </p>

    </div>

  `;

}


function showError(message) {

  const loading =
    document.getElementById(
      "loading"
    );

  if (!loading) {
    return;
  }


  loading.innerHTML = `

    <div style="
      padding:40px;
      font-family:Arial,sans-serif;
      color:#b33;
    ">

      <h2>
        Admin Dashboard Error
      </h2>

      <p>
        ${escapeHTML(message)}
      </p>

    </div>

  `;

}



/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {


  return escapeHTML(value);

}


function truncate(
  value,
  length
) {

  const text =
    String(value ?? "");


  if (
    text.length <= length
  ) {
    return text;
  }


  return (

    text.slice(
      0,
      length
    ) + "..."
  );

}


function getFileExtension(
  filename
) {

  const parts =
    String(filename)
      .split(".");


  const extension =
    parts.length > 1
      ? parts.pop()
      : "jpg";



  return extension
    .toLowerCase()
    .replace(
      /[^a-z0-9]/g,
      ""
    ) || "jpg";

}


function createRandomId() {

  if (
    typeof crypto !== "undefined" &&
    crypto.randomUUID
  ) {

    return crypto.randomUUID();

  }



  return (
    Math.random()
      .toString(36)
      .slice(2) +
    Date.now()
  );

}


/* =========================================================
   ADMIN CSS
========================================================= */

function injectAdminStyles() {

  if (

    document.getElementById(
      "adminDashboardStyles"
    )
  ) {
    return;
  }


  const style =
    document.createElement("style");


  style.id =
    "adminDashboardStyles";


  style.textContent = `

    * {
      box-sizing:border-box;
    }


    body {
      margin:0;
      background:#f4f7f5;
      color:#18352a;
      font-family:
        Arial,
        Helvetica,
        sans-serif;
    }


    .admin-layout {
      min-height:100vh;
      display:flex;
    }


    .admin-sidebar {
      position:fixed;
      inset:0 auto 0 0;
      width:250px;

      padding:25px 18px;
      background:#10251d;
      color:white;
      display:flex;
      flex-direction:column;
      z-index:100;
    }


    .admin-brand {
      padding:8px 10px 25px;
      display:flex;
      flex-direction:column;
    }


    .admin-brand strong {
      font-family:Georgia,serif;
      font-size:22px;
    }


    .admin-brand span {

      color:#e6b84c;
      font-family:Georgia,serif;
      font-size:22px;
    }


    .admin-nav {
      display:flex;
      flex-direction:column;
      gap:7px;
    }


    .admin-nav-btn,
    .admin-logout-btn {
      width:100%;
      padding:12px 13px;
      border:0;
      border-radius:9px;
      text-align:left;
      background:transparent;
      color:#dce7e1;

      cursor:pointer;
      font-weight:700;
    }


    .admin-nav-btn:hover,
    .admin-nav-btn.active {
      background:#1e5c3f;
      color:white;
    }


    .admin-logout-btn {
      margin-top:auto;
      background:#3b211e;
      color:#ffd9d4;
    }


    .admin-main {
      width:100%;
      margin-left:250px;

      padding:35px;
    }


    .admin-section {
      max-width:1250px;
      margin:auto;
    }


    .admin-section-header {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:20px;
      margin-bottom:25px;
    }


    .admin-section-header h1,
    .admin-section-header h2 {
      margin:0 0 7px;

      font-family:Georgia,serif;
      color:#173f2c;
    }


    .admin-section-header p {
      margin:0;
      color:#718078;
    }


    .admin-eyebrow {
      margin:0 0 7px;
      color:#b48a27;
      font-size:11px;
      font-weight:800;
      letter-spacing:2px;
    }


    .admin-primary-btn {
      min-height:42px;

      padding:10px 16px;
      border:0;
      border-radius:9px;
      background:#1e5c3f;
      color:white;
      font-weight:700;
      cursor:pointer;
    }


    .admin-primary-btn:hover {
      background:#174b34;
    }


    .admin-primary-btn:disabled {
      opacity:.55;
      cursor:not-allowed;
    }


    .admin-stats-grid {
      display:grid;

      grid-template-columns:
        repeat(4,minmax(0,1fr));
      gap:18px;
    }


    .admin-stat-card {
      background:white;
      border-radius:15px;
      padding:25px;
      box-shadow:
        0 8px 30px rgba(16,37,29,.07);
    }


    .admin-stat-card strong {
      display:block;
      font-size:35px;
      color:#1e5c3f;
    }

    .admin-stat-card span {
      color:#718078;
    }


    .admin-card-list {
      display:grid;
      grid-template-columns:
        repeat(3,minmax(0,1fr));
      gap:18px;
    }


    .admin-content-card {
      overflow:hidden;
      background:white;
      border-radius:15px;
      box-shadow:
        0 8px 30px rgba(16,37,29,.07);
    }

    .admin-content-card > img {
      display:block;
      width:100%;
      height:190px;
      object-fit:cover;
    }


    .admin-content-card-body {
      padding:18px;
    }


    .admin-content-card-body h3 {
      margin:0 0 8px;
      font-family:Georgia,serif;
    }


    .admin-content-card-body p {
      min-height:42px;
      margin:0 0 13px;

      color:#718078;
      line-height:1.6;
    }


    .admin-card-actions {
      display:flex;
      flex-wrap:wrap;
      gap:7px;
    }


    .admin-small-btn {
      min-height:35px;
      padding:8px 11px;
      border:0;
      border-radius:7px;
      background:#e9efeb;
      color:#18352a;
      font-size:12px;
      font-weight:700;
      cursor:pointer;

    }


    .admin-small-btn:hover {
      background:#dce7e1;
    }


    .admin-small-btn.danger {
      background:#f7e5e2;
      color:#a23a2e;
    }


    .admin-small-btn.gallery-btn {
      background:#f1dfac;
      color:#18352a;
    }


    .admin-gallery-count {
      margin-bottom:13px;

      color:#b48a27;
      font-size:12px;
      font-weight:700;
    }


    .admin-message-card {
      grid-column:1/-1;
      padding:35px;
      background:white;
      border-radius:15px;
      text-align:center;
      color:#718078;
    }


    .admin-message-card.error {
      color:#a23a2e;
    }


    .admin-spinner {
      width:30px;

      height:30px;
      margin:0 auto 12px;
      border:3px solid #dce7e1;
      border-top-color:#1e5c3f;
      border-radius:50%;
      animation:adminSpin .8s linear infinite;
    }


    @keyframes adminSpin {
      to {
        transform:rotate(360deg);
      }
    }


    .admin-modal {
      position:fixed;
      inset:0;
      z-index:1000;
      display:flex;
      align-items:center;

      justify-content:center;
      padding:20px;
    }


    .admin-modal-overlay {
      position:absolute;
      inset:0;
      background:rgba(0,0,0,.7);
    }


    .admin-modal-box {
      position:relative;
      z-index:2;
      width:min(620px,100%);
      max-height:90vh;
      overflow-y:auto;
      padding:28px;
      border-radius:17px;
      background:white;
      box-shadow:

        0 25px 80px rgba(0,0,0,.3);
    }


    .admin-modal-box h2 {
      margin:0 0 22px;
      font-family:Georgia,serif;
      color:#173f2c;
    }


    .admin-modal-close {
      position:absolute;
      top:12px;
      right:12px;
      width:38px;
      height:38px;
      border:0;
      border-radius:50%;
      background:#edf1ee;
      color:#173f2c;
      font-size:25px;

      cursor:pointer;
    }


    .admin-modal-box form {
      display:flex;
      flex-direction:column;
      gap:8px;
    }


    .admin-modal-box label {
      margin-top:8px;
      font-size:13px;
      font-weight:700;
    }


    .admin-modal-box input,
    .admin-modal-box textarea {
      width:100%;
      padding:12px;

      border:1px solid #d6dfd9;
      border-radius:8px;
      outline:none;
      font:inherit;
    }


    .admin-modal-box textarea {
      resize:vertical;
    }


    .admin-status {
      min-height:20px;
      margin:5px 0 0;
      color:#718078;
      font-size:13px;
    }


    .gallery-upload-area {
      margin-bottom:25px;

      padding:18px;
      border:1px dashed #c7d5cc;
      border-radius:12px;
      background:#f7faf8;
    }


    .gallery-upload-area input {
      margin:10px 0;
    }


    .gallery-upload-area small {
      display:block;
      margin-bottom:14px;
      color:#718078;
    }


    .admin-gallery-grid {
      display:grid;
      grid-template-columns:
        repeat(3,minmax(0,1fr));

      gap:12px;
    }


    .admin-gallery-item {
      overflow:hidden;
      border:1px solid #e0e7e2;
      border-radius:10px;
      background:#f8faf9;
    }


    .admin-gallery-item img {
      display:block;
      width:100%;
      aspect-ratio:4/3;
      object-fit:cover;
    }


    .admin-gallery-item-footer {
      display:flex;

      align-items:center;
      justify-content:space-between;
      gap:7px;
      padding:8px;
      font-size:11px;
      color:#718078;
    }


    .admin-location-group {
      margin-bottom:25px;
      padding:20px;
      border-radius:15px;
      background:white;
      box-shadow:
        0 8px 30px rgba(16,37,29,.07);
    }


    .admin-location-header {
      display:flex;
      align-items:center;

      justify-content:space-between;
      gap:15px;
      margin-bottom:15px;
    }


    .admin-location-header h3 {
      margin:0 0 5px;
      font-family:Georgia,serif;
    }


    .admin-location-header small {
      color:#718078;
    }


    .admin-location-list {
      display:grid;
      grid-template-columns:
        repeat(3,minmax(0,1fr));
      gap:15px;

    }


    .admin-review-card {
      display:grid;
      grid-template-columns:140px 1fr;
      gap:18px;
      padding:18px;
      background:white;
      border-radius:15px;
      box-shadow:
        0 8px 30px rgba(16,37,29,.07);
    }


    .admin-review-card img {
      width:140px;
      height:140px;
      object-fit:cover;
      border-radius:10px;
    }


    .admin-review-card h3 {
      margin:0 0 4px;
      font-family:Georgia,serif;
    }


    .admin-review-card span {
      color:#718078;
      font-size:13px;
    }


    .admin-review-stars {
      margin:8px 0;
      color:#c39732;
      letter-spacing:2px;
    }


    .admin-review-card p {
      color:#4f5f56;
      line-height:1.65;

    }


    @media(max-width:1000px) {

      .admin-card-list {
        grid-template-columns:
          repeat(2,minmax(0,1fr));
      }

      .admin-location-list {
        grid-template-columns:
          repeat(2,minmax(0,1fr));
      }

      .admin-stats-grid {
        grid-template-columns:
          repeat(2,minmax(0,1fr));
      }

    }


    @media(max-width:700px) {

      .admin-sidebar {
        position:static;
        width:100%;
        min-height:auto;
      }


      .admin-layout {
        display:block;
      }


      .admin-main {
        margin-left:0;
        padding:20px 14px;
      }


      .admin-section-header {

        align-items:flex-start;
        flex-direction:column;
      }


      .admin-card-list,
      .admin-location-list,
      .admin-gallery-grid {
        grid-template-columns:1fr;
      }


      .admin-stats-grid {
        grid-template-columns:1fr 1fr;
      }


      .admin-review-card {
        grid-template-columns:1fr;
      }

      .admin-review-card img {
        width:100%;
        height:220px;
      }

    }


  `;


  document.head.appendChild(style);

}
