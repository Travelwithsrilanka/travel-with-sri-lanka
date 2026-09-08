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
   GLOBAL STATE
========================================================= */

let currentSection = "dashboard";

let editingDestinationId = null;
let editingTourId = null;
let editingLocationId = null;

let currentLocationDestinationId = null;


/* =========================================================
   SECURITY HELPERS
========================================================= */

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {
  return escapeHTML(value);
}


function safeImageUrl(value) {
  const fallback =
    "https://via.placeholder.com/800x500?text=No+Image";

  if (!value) {
    return fallback;
  }

  const url = String(value).trim();

  if (!url) {
    return fallback;
  }

  if (
    url.startsWith("https://") ||
    url.startsWith("http://") ||
    url.startsWith("/") ||
    url.startsWith("./") ||
    url.startsWith("../") ||
    url.startsWith("images/")
  ) {
    return url;
  }

  return fallback;
}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  initAdminDashboard
);


async function initAdminDashboard() {

  try {

    const {
      data: {
        session
      }
    } = await supabase.auth.getSession();


    if (!session) {

      window.location.href =
        "admin.html";

      return;
    }


    createDashboard();

    await loadDashboard();


    supabase.auth.onAuthStateChange(
      async (_event, session) => {

        if (!session) {

          window.location.href =
            "admin.html";

        }

      }
    );


  } catch (error) {

    console.error(
      "Admin initialization error:",
      error
    );

    showFatalError(error);

  }

}


/* =========================================================
   FATAL ERROR
========================================================= */

function showFatalError(error) {

  const loading =
    document.getElementById("loading");

  const message =
    error?.message ||
    "Unknown error";


  if (loading) {

    loading.innerHTML = `
      <div style="
        max-width:600px;
        padding:30px;
        text-align:center;
        font-family:Arial,Helvetica,sans-serif;
      ">

        <h2 style="
          margin-bottom:15px;
          color:#b42318;
        ">
          Admin Panel Error
        </h2>

        <p style="
          line-height:1.7;
          color:#555;
        ">
          ${escapeHTML(message)}
        </p>

        <button
          onclick="location.reload()"
          style="
            margin-top:20px;
            padding:12px 20px;
            border:0;
            border-radius:8px;
            background:#176b4d;
            color:#fff;
            cursor:pointer;
          "
        >
          Reload
        </button>

      </div>
    `;

    return;
  }


  document.body.innerHTML = `
    <div style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:30px;
      font-family:Arial,Helvetica,sans-serif;
      background:#f4f7f5;
    ">

      <div style="
        max-width:600px;
        background:#fff;
        padding:35px;
        border-radius:14px;
        text-align:center;
      ">

        <h2 style="color:#b42318;">
          Admin Panel Error
        </h2>

        <p style="color:#555;">
          ${escapeHTML(message)}
        </p>

        <button
          onclick="location.reload()"
          style="
            padding:12px 20px;
            border:0;
            border-radius:8px;
            background:#176b4d;
            color:#fff;
            cursor:pointer;
          "
        >
          Reload
        </button>

      </div>

    </div>
  `;

}


/* =========================================================
   DASHBOARD UI
========================================================= */

function createDashboard() {

  const loading =
    document.getElementById("loading");


  if (!loading) {
    return;
  }


  loading.outerHTML = `

    <div
      id="adminApp"
      style="
        min-height:100vh;
        background:#f4f7f5;
        font-family:Arial,Helvetica,sans-serif;
        color:#17221d;
      "
    >

      <!-- HEADER -->

      <header
        style="
          background:#10251d;
          color:#fff;
          padding:18px 24px;
          position:sticky;
          top:0;
          z-index:1000;
          box-shadow:0 5px 20px rgba(0,0,0,.12);
        "
      >

        <div
          style="
            max-width:1400px;
            margin:auto;
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:20px;
          "
        >

          <div>

            <div
              style="
                font-size:13px;
                letter-spacing:2px;
                opacity:.8;
              "
            >
              TRAVEL WITH
            </div>

            <div
              style="
                font-size:22px;
                font-weight:700;
              "
            >
              SRI LANKA
              <span
                style="
                  color:#c9a85b;
                "
              >
                ADMIN
              </span>
            </div>

          </div>


          <div
            style="
              display:flex;
              align-items:center;
              gap:10px;
            "
          >

            <span
              id="adminEmailDisplay"
              style="
                font-size:13px;
                opacity:.8;
              "
            ></span>

            <button
              id="logoutBtn"
              type="button"
              style="
                border:1px solid rgba(255,255,255,.25);
                background:transparent;
                color:#fff;
                padding:9px 14px;
                border-radius:7px;
                cursor:pointer;
              "
            >
              Logout
            </button>

          </div>

        </div>

      </header>


      <!-- BODY -->

      <div
        style="
          max-width:1400px;
          margin:auto;
          padding:24px;
          display:grid;
          grid-template-columns:220px minmax(0,1fr);
          gap:24px;
        "
      >

        <!-- SIDEBAR -->

        <aside
          style="
            background:#fff;
            border:1px solid #e4e3db;
            border-radius:12px;
            padding:14px;
            height:max-content;
          "
        >

          <button
            class="admin-nav-btn"
            data-section="dashboard"
            type="button"
          >
            Dashboard
          </button>

          <button
            class="admin-nav-btn"
            data-section="destinations"
            type="button"
          >
            Destinations
          </button>

          <button
            class="admin-nav-btn"
            data-section="tours"
            type="button"
          >
            Tours
          </button>

          <button
            class="admin-nav-btn"
            data-section="locations"
            type="button"
          >
            Destination Locations
          </button>

          <button
            class="admin-nav-btn"
            data-section="reviews"
            type="button"
          >
            Reviews
          </button>

        </aside>


        <!-- CONTENT -->

        <main>

          <div
            id="adminMessage"
            style="
              display:none;
              margin-bottom:18px;
              padding:13px 16px;
              border-radius:8px;
              font-size:14px;
            "
          ></div>


          <!-- DASHBOARD -->

          <section
            id="section-dashboard"
            class="admin-section"
          >

            <div
              style="
                background:#fff;
                border:1px solid #e4e3db;
                border-radius:12px;
                padding:25px;
              "
            >

              <h1
                style="
                  margin:0 0 8px;
                  font-size:28px;
                "
              >
                Dashboard
              </h1>

              <p
                style="
                  margin:0;
                  color:#69736e;
                "
              >
                Manage Travel With Sri Lanka website content.
              </p>

            </div>


            <div
              id="statsGrid"
              style="
                display:grid;
                grid-template-columns:
                  repeat(4,minmax(0,1fr));
                gap:16px;
                margin-top:20px;
              "
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
                  Manage tour packages.
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
                  Manage places displayed inside destinations.
                </p>

              </div>

            </div>


            <div
              id="locationDestinationSelector"
              style="margin-bottom:20px;"
            ></div>


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
                  View and manage customer reviews.
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

    </div>


    <!-- CONTENT MODAL -->

    <div
      id="contentModal"
      class="admin-modal"
      style="display:none;"
    >

      <div class="admin-modal-box">

        <div class="admin-modal-header">

          <h3 id="contentModalTitle">
            Add Destination
          </h3>

          <button
            type="button"
            class="admin-close-btn"
            data-close-modal="contentModal"
          >
            ×
          </button>

        </div>


        <form id="contentForm">

          <input
            type="hidden"
            id="contentType"
          >

          <label>
            Name / Title
            <input
              id="contentName"
              required
            >
          </label>


          <label>
            Slug
            <input
              id="contentSlug"
              required
            >
          </label>


          <label>
            Description
            <textarea
              id="contentDescription"
              rows="5"
            ></textarea>
          </label>


          <label>
            Image URL
            <input
              id="contentImageUrl"
              type="url"
              placeholder="https://..."
            >
          </label>


          <label>
            Page URL
            <input
              id="contentPageUrl"
              type="text"
              placeholder="ella.html"
            >
          </label>


          <label>
            Sort Order
            <input
              id="contentSortOrder"
              type="number"
              value="0"
            >
          </label>


          <div
            id="contentCurrentImage"
            style="
              margin-top:10px;
            "
          ></div>


          <div class="admin-modal-actions">

            <button
              type="button"
              class="admin-secondary-btn"
              data-close-modal="contentModal"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="admin-primary-btn"
              id="contentSaveBtn"
            >
              Save
            </button>

          </div>

        </form>

      </div>

    </div>


    <!-- LOCATION MODAL -->

    <div
      id="locationModal"
      class="admin-modal"
      style="display:none;"
    >

      <div class="admin-modal-box">

        <div class="admin-modal-header">

          <h3 id="locationModalTitle">
            Add Location
          </h3>

          <button
            type="button"
            class="admin-close-btn"
            data-close-modal="locationModal"
          >
            ×
          </button>

        </div>


        <form id="locationForm">

          <input
            type="hidden"
            id="locationId"
          >


          <label>
            Location Name
            <input
              id="locationName"
              required
            >
          </label>


          <label>
            Description
            <textarea
              id="locationDescription"
              rows="5"
            ></textarea>
          </label>


          <label>
            Location Number
            <input
              id="locationNumber"
              type="number"
              min="1"
              value="1"
            >
          </label>


          <label>
            Image URL
            <input
              id="locationImageUrl"
              type="url"
              placeholder="https://..."
            >
          </label>


          <label>
            Image Path
            <input
              id="locationImagePath"
              type="text"
              placeholder="images/destinations/ella/..."
            >
          </label>


          <label>
            Sort Order
            <input
              id="locationSortOrder"
              type="number"
              value="0"
            >
          </label>


          <div
            id="locationCurrentImage"
          ></div>


          <div class="admin-modal-actions">

            <button
              type="button"
              class="admin-secondary-btn"
              data-close-modal="locationModal"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="admin-primary-btn"
            >
              Save
            </button>

          </div>

        </form>

      </div>

    </div>


    <style>

      .admin-nav-btn {
        display:block;
        width:100%;
        text-align:left;
        padding:12px 13px;
        margin-bottom:5px;
        border:0;
        background:transparent;
        border-radius:7px;
        cursor:pointer;
        color:#17221d;
      }

      .admin-nav-btn:hover,
      .admin-nav-btn.active {
        background:#edf4ef;
        color:#176b4d;
        font-weight:700;
      }

      .admin-section-header {
        background:#fff;
        border:1px solid #e4e3db;
        border-radius:12px;
        padding:20px;
        margin-bottom:18px;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:20px;
      }

      .admin-section-header h2 {
        margin:0 0 5px;
      }

      .admin-section-header p {
        margin:0;
        color:#69736e;
      }

      .admin-primary-btn,
      .admin-secondary-btn,
      .admin-danger-btn {
        border:0;
        border-radius:7px;
        padding:10px 15px;
        cursor:pointer;
        font-weight:600;
      }

      .admin-primary-btn {
        background:#176b4d;
        color:#fff;
      }

      .admin-primary-btn:hover {
        background:#12583f;
      }

      .admin-secondary-btn {
        background:#eef2ef;
        color:#17221d;
      }

      .admin-danger-btn {
        background:#b42318;
        color:#fff;
      }

      .admin-card-list {
        display:grid;
        gap:15px;
      }

      .admin-item-card {
        background:#fff;
        border:1px solid #e4e3db;
        border-radius:12px;
        padding:18px;
        display:flex;
        gap:18px;
        align-items:flex-start;
      }

      .admin-item-image {
        width:150px;
        height:100px;
        object-fit:cover;
        border-radius:8px;
        background:#eef2ef;
        flex:none;
      }

      .admin-item-content {
        flex:1;
        min-width:0;
      }

      .admin-item-content h3 {
        margin:0 0 7px;
      }

      .admin-item-content p {
        margin:0 0 10px;
        color:#69736e;
        line-height:1.6;
      }

      .admin-item-meta {
        font-size:13px;
        color:#69736e;
      }

      .admin-item-actions {
        display:flex;
        gap:7px;
        flex-wrap:wrap;
      }

      .admin-modal {
        position:fixed;
        inset:0;
        z-index:2000;
        background:rgba(0,0,0,.55);
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
        overflow:auto;
      }

      .admin-modal-box {
        width:min(650px,100%);
        max-height:90vh;
        overflow:auto;
        background:#fff;
        border-radius:12px;
        padding:22px;
      }

      .admin-modal-header {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:20px;
        margin-bottom:20px;
      }

      .admin-modal-header h3 {
        margin:0;
      }

      .admin-close-btn {
        border:0;
        background:transparent;
        font-size:28px;
        cursor:pointer;
        color:#69736e;
      }

      .admin-modal-box label {
        display:block;
        margin-bottom:15px;
        font-size:14px;
        font-weight:600;
      }

      .admin-modal-box input,
      .admin-modal-box textarea,
      .admin-modal-box select {
        display:block;
        width:100%;
        box-sizing:border-box;
        margin-top:7px;
        padding:11px 12px;
        border:1px solid #d9ddd9;
        border-radius:7px;
        font:inherit;
        background:#fff;
      }

      .admin-modal-box textarea {
        resize:vertical;
      }

      .admin-modal-actions {
        display:flex;
        justify-content:flex-end;
        gap:8px;
        margin-top:20px;
      }

      .admin-stats-card {
        background:#fff;
        border:1px solid #e4e3db;
        border-radius:12px;
        padding:20px;
      }

      .admin-stats-number {
        font-size:32px;
        font-weight:700;
        color:#176b4d;
        margin-bottom:5px;
      }

      .admin-stats-label {
        color:#69736e;
        font-size:14px;
      }

      .admin-stars {
        color:#c9a85b;
        letter-spacing:2px;
      }

      .admin-review-photo {
        width:90px;
        height:90px;
        object-fit:cover;
        border-radius:8px;
      }

      @media(max-width:900px) {

        .adminApp > div {
          grid-template-columns:1fr !important;
        }

        .admin-nav-btn {
          display:inline-block;
          width:auto;
          margin-right:5px;
        }

      }

      @media(max-width:600px) {

        .admin-item-card {
          flex-direction:column;
        }

        .admin-item-image {
          width:100%;
          height:180px;
        }

        #statsGrid {
          grid-template-columns:
            repeat(2,minmax(0,1fr)) !important;
        }

        .admin-section-header {
          flex-direction:column;
          align-items:flex-start;
        }

      }

    </style>
  `;


  setupDashboardEvents();

}


/* =========================================================
   EVENTS
========================================================= */

function setupDashboardEvents() {

  document
    .querySelectorAll(".admin-nav-btn")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          showSection(
            button.dataset.section
          );

        }
      );

    });


  document
    .getElementById("logoutBtn")
    ?.addEventListener(
      "click",
      logout
    );


  document
    .getElementById("addDestinationBtn")
    ?.addEventListener(
      "click",
      () => openContentModal("destination")
    );


  document
    .getElementById("addTourBtn")
    ?.addEventListener(
      "click",
      () => openContentModal("tour")
    );


  document
    .getElementById("contentForm")
    ?.addEventListener(
      "submit",
      saveContent
    );


  document
    .getElementById("locationForm")
    ?.addEventListener(
      "submit",
      saveLocation
    );


  document
    .querySelectorAll("[data-close-modal]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          closeModal(
            button.dataset.closeModal
          );

        }
      );

    });

}


/* =========================================================
   SHOW SECTION
========================================================= */

async function showSection(section) {

  currentSection = section;


  document
    .querySelectorAll(".admin-section")
    .forEach(element => {

      element.style.display =
        "none";

    });


  const target =
    document.getElementById(
      `section-${section}`
    );


  if (target) {
    target.style.display = "block";
  }


  document
    .querySelectorAll(".admin-nav-btn")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.section === section
      );

    });


  if (section === "dashboard") {
    await loadDashboard();
  }

  if (section === "destinations") {
    await loadDestinations();
  }

  if (section === "tours") {
    await loadTours();
  }

  if (section === "locations") {
    await loadLocationSection();
  }

  if (section === "reviews") {
    await loadReviews();
  }

}


/* =========================================================
   LOAD DASHBOARD
========================================================= */

async function loadDashboard() {

  try {

    const [
      destinations,
      tours,
      locations,
      reviews
    ] = await Promise.all([

      countRows("destinations"),

      countRows("tours"),

      countRows("destination_locations"),

      countRows("reviews")

    ]);


    const container =
      document.getElementById(
        "statsGrid"
      );


    if (!container) {
      return;
    }


    container.innerHTML = `

      ${createStatCard(
        destinations,
        "Destinations"
      )}

      ${createStatCard(
        tours,
        "Tours"
      )}

      ${createStatCard(
        locations,
        "Locations"
      )}

      ${createStatCard(
        reviews,
        "Reviews"
      )}

    `;


    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();


    const emailDisplay =
      document.getElementById(
        "adminEmailDisplay"
      );


    if (emailDisplay) {
      emailDisplay.textContent =
        user?.email || "";
    }


  } catch (error) {

    console.error(
      "Dashboard loading error:",
      error
    );

    showMessage(
      error.message,
      "error"
    );

  }

}


async function countRows(table) {

  const {
    count,
    error
  } = await supabase
    .from(table)
    .select("*", {
      count: "exact",
      head: true
    });


  if (error) {
    throw error;
  }


  return count || 0;

}


function createStatCard(number, label) {

  return `

    <div class="admin-stats-card">

      <div class="admin-stats-number">
        ${escapeHTML(number)}
      </div>

      <div class="admin-stats-label">
        ${escapeHTML(label)}
      </div>

    </div>

  `;

}


/* =========================================================
   DESTINATIONS
========================================================= */

async function loadDestinations() {

  const container =
    document.getElementById(
      "destinationsList"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    loadingHTML();


  try {

    const {
      data,
      error
    } = await supabase
      .from("destinations")
      .select(
        "id,slug,name,description,image_url,page_url,sort_order,created_at,updated_at"
      )
      .order(
        "sort_order",
        {
          ascending: true,
          nullsFirst: false
        }
      )
      .order(
        "name",
        {
          ascending: true
        }
      );


    if (error) {
      throw error;
    }


    if (!data || data.length === 0) {

      container.innerHTML =
        emptyHTML(
          "No destinations found."
        );

      return;
    }


    container.innerHTML =
      data
        .map(createDestinationCard)
        .join("");


    bindDestinationActions();

  } catch (error) {

    console.error(
      "Destination loading error:",
      error
    );


    container.innerHTML =
      errorHTML(error.message);

  }

}


function createDestinationCard(destination) {

  const image =
    safeImageUrl(
      destination.image_url
    );


  return `

    <article class="admin-item-card">

      <img
        class="admin-item-image"
        src="${escapeAttribute(image)}"
        alt="${escapeAttribute(destination.name)}"
        loading="lazy"
        onerror="this.onerror=null;this.src='https://via.placeholder.com/800x500?text=No+Image';"
      >


      <div class="admin-item-content">

        <h3>
          ${escapeHTML(destination.name)}
        </h3>

        <p>
          ${escapeHTML(
            destination.description ||
            "No description."
          )}
        </p>

        <div class="admin-item-meta">

          Slug:
          <strong>
            ${escapeHTML(destination.slug)}
          </strong>

          ${destination.page_url
            ? ` · Page:
              ${escapeHTML(destination.page_url)}`
            : ""
          }

        </div>

        <div
          class="admin-item-actions"
          style="margin-top:12px;"
        >

          <button
            class="admin-secondary-btn"
            type="button"
            data-edit-destination="${escapeAttribute(destination.id)}"
          >
            Edit
          </button>

          <button
            class="admin-secondary-btn"
            type="button"
            data-location-destination="${escapeAttribute(destination.id)}"
          >
            Locations
          </button>

          <button
            class="admin-danger-btn"
            type="button"
            data-delete-destination="${escapeAttribute(destination.id)}"
          >
            Delete
          </button>

        </div>

      </div>

    </article>

  `;

}


function bindDestinationActions() {

  document
    .querySelectorAll(
      "[data-edit-destination]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          openContentModal(
            "destination",
            Number(
              button.dataset.editDestination
            )
          );

        }
      );

    });


  document
    .querySelectorAll(
      "[data-delete-destination]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          deleteDestination(
            Number(
              button.dataset.deleteDestination
            )
          );

        }
      );

    });


  document
    .querySelectorAll(
      "[data-location-destination]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        async () => {

          currentLocationDestinationId =
            Number(
              button.dataset.locationDestination
            );

          await showSection(
            "locations"
          );

          await selectLocationDestination(
            currentLocationDestinationId
          );

        }
      );

    });

}


/* =========================================================
   TOURS
========================================================= */

async function loadTours() {

  const container =
    document.getElementById(
      "toursList"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    loadingHTML();


  try {

    const {
      data,
      error
    } = await supabase
      .from("tours")
      .select(
        "id,slug,title,description,image_url,page_url,sort_order,created_at,updated_at"
      )
      .order(
        "sort_order",
        {
          ascending: true,
          nullsFirst: false
        }
      )
      .order(
        "title",
        {
          ascending: true
        }
      );


    if (error) {
      throw error;
    }


    if (!data || data.length === 0) {

      container.innerHTML =
        emptyHTML(
          "No tours found."
        );

      return;
    }


    container.innerHTML =
      data
        .map(createTourCard)
        .join("");


    bindTourActions();

  } catch (error) {

    console.error(
      "Tour loading error:",
      error
    );


    container.innerHTML =
      errorHTML(error.message);

  }

}


function createTourCard(tour) {

  const image =
    safeImageUrl(
      tour.image_url
    );


  return `

    <article class="admin-item-card">

      <img
        class="admin-item-image"
        src="${escapeAttribute(image)}"
        alt="${escapeAttribute(tour.title)}"
        loading="lazy"
        onerror="this.onerror=null;this.src='https://via.placeholder.com/800x500?text=No+Image';"
      >


      <div class="admin-item-content">

        <h3>
          ${escapeHTML(tour.title)}
        </h3>

        <p>
          ${escapeHTML(
            tour.description ||
            "No description."
          )}
        </p>

        <div class="admin-item-meta">

          Slug:
          <strong>
            ${escapeHTML(tour.slug)}
          </strong>

          ${tour.page_url
            ? ` · Page:
              ${escapeHTML(tour.page_url)}`
            : ""
          }

        </div>

        <div
          class="admin-item-actions"
          style="margin-top:12px;"
        >

          <button
            class="admin-secondary-btn"
            type="button"
            data-edit-tour="${escapeAttribute(tour.id)}"
          >
            Edit
          </button>

          <button
            class="admin-danger-btn"
            type="button"
            data-delete-tour="${escapeAttribute(tour.id)}"
          >
            Delete
          </button>

        </div>

      </div>

    </article>

  `;

}


function bindTourActions() {

  document
    .querySelectorAll(
      "[data-edit-tour]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          openContentModal(
            "tour",
            Number(
              button.dataset.editTour
            )
          );

        }
      );

    });


  document
    .querySelectorAll(
      "[data-delete-tour]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          deleteTour(
            Number(
              button.dataset.deleteTour
            )
          );

        }
      );

    });

}


/* =========================================================
   CONTENT MODAL
========================================================= */

async function openContentModal(
  type,
  id = null
) {

  const modal =
    document.getElementById(
      "contentModal"
    );


  if (!modal) {
    return;
  }


  editingDestinationId =
    null;

  editingTourId =
    null;


  document
    .getElementById("contentType")
    .value = type;


  const title =
    document.getElementById(
      "contentModalTitle"
    );


  const name =
    document.getElementById(
      "contentName"
    );

  const slug =
    document.getElementById(
      "contentSlug"
    );

  const description =
    document.getElementById(
      "contentDescription"
    );

  const imageUrl =
    document.getElementById(
      "contentImageUrl"
    );

  const pageUrl =
    document.getElementById(
      "contentPageUrl"
    );

  const sortOrder =
    document.getElementById(
      "contentSortOrder"
    );

  const currentImage =
    document.getElementById(
      "contentCurrentImage"
    );


  name.value = "";
  slug.value = "";
  description.value = "";
  imageUrl.value = "";
  pageUrl.value = "";
  sortOrder.value = "0";
  currentImage.innerHTML = "";


  if (type === "destination") {

    title.textContent =
      id
        ? "Edit Destination"
        : "Add Destination";

  } else {

    title.textContent =
      id
        ? "Edit Tour"
        : "Add Tour";

  }


  if (id) {

    try {

      const table =
        type === "destination"
          ? "destinations"
          : "tours";


      const {
        data,
        error
      } = await supabase
        .from(table)
        .select("*")
        .eq("id", id)
        .single();


      if (error) {
        throw error;
      }


      if (type === "destination") {
        editingDestinationId = id;
      } else {
        editingTourId = id;
      }


      name.value =
        type === "destination"
          ? data.name || ""
          : data.title || "";


      slug.value =
        data.slug || "";


      description.value =
        data.description || "";


      imageUrl.value =
        data.image_url || "";


      pageUrl.value =
        data.page_url || "";


      sortOrder.value =
        data.sort_order ?? 0;


      if (data.image_url) {

        currentImage.innerHTML = `

          <img
            src="${escapeAttribute(
              safeImageUrl(data.image_url)
            )}"
            alt="Current image"
            style="
              width:150px;
              height:100px;
              object-fit:cover;
              border-radius:8px;
            "
          >

        `;

      }

    } catch (error) {

      showMessage(
        error.message,
        "error"
      );

      return;

    }

  }


  modal.style.display =
    "flex";

}


/* =========================================================
   SAVE DESTINATION / TOUR
========================================================= */

async function saveContent(event) {

  event.preventDefault();


  const type =
    document.getElementById(
      "contentType"
    ).value;


  const name =
    document.getElementById(
      "contentName"
    ).value.trim();


  const slug =
    document.getElementById(
      "contentSlug"
    ).value.trim();


  const description =
    document.getElementById(
      "contentDescription"
    ).value.trim();


  const imageUrl =
    document.getElementById(
      "contentImageUrl"
    ).value.trim();


  const pageUrl =
    document.getElementById(
      "contentPageUrl"
    ).value.trim();


  const sortOrder =
    Number(
      document.getElementById(
        "contentSortOrder"
      ).value
    ) || 0;


  if (!name || !slug) {

    showMessage(
      "Name and slug are required.",
      "error"
    );

    return;
  }


  const button =
    document.getElementById(
      "contentSaveBtn"
    );


  if (button) {
    button.disabled = true;
    button.textContent = "Saving...";
  }


  try {

    const table =
      type === "destination"
        ? "destinations"
        : "tours";


    let payload;


    if (type === "destination") {

      payload = {
        name,
        slug,
        description: description || null,
        image_url: imageUrl || null,
        page_url: pageUrl || null,
        sort_order: sortOrder
      };

    } else {

      payload = {
        title: name,
        slug,
        description: description || null,
        image_url: imageUrl || null,
        page_url: pageUrl || null,
        sort_order: sortOrder
      };

    }


    const editingId =
      type === "destination"
        ? editingDestinationId
        : editingTourId;


    let result;


    if (editingId) {

      result =
        await supabase
          .from(table)
          .update(payload)
          .eq("id", editingId);

    } else {

      result =
        await supabase
          .from(table)
          .insert(payload);

    }


    if (result.error) {
      throw result.error;
    }


    closeModal(
      "contentModal"
    );


    showMessage(
      type === "destination"
        ? "Destination saved successfully."
        : "Tour saved successfully.",
      "success"
    );


    if (type === "destination") {
      await loadDestinations();
    } else {
      await loadTours();
    }


  } catch (error) {

    console.error(
      "Save content error:",
      error
    );


    showMessage(
      error.message,
      "error"
    );

  } finally {

    if (button) {
      button.disabled = false;
      button.textContent = "Save";
    }

  }

}


/* =========================================================
   DELETE DESTINATION
========================================================= */

async function deleteDestination(id) {

  if (!confirm(
    "Delete this destination? Related locations may also need to be removed."
  )) {
    return;
  }


  try {

    const {
      error: locationError
    } = await supabase
      .from("destination_locations")
      .delete()
      .eq("destination_id", id);


    if (locationError) {
      throw locationError;
    }


    const {
      error
    } = await supabase
      .from("destinations")
      .delete()
      .eq("id", id);


    if (error) {
      throw error;
    }


    showMessage(
      "Destination deleted successfully.",
      "success"
    );


    await loadDestinations();


  } catch (error) {

    console.error(
      "Delete destination error:",
      error
    );


    showMessage(
      error.message,
      "error"
    );

  }

}


/* =========================================================
   DELETE TOUR
========================================================= */

async function deleteTour(id) {

  if (!confirm(
    "Delete this tour?"
  )) {
    return;
  }


  try {

    const {
      error
    } = await supabase
      .from("tours")
      .delete()
      .eq("id", id);


    if (error) {
      throw error;
    }


    showMessage(
      "Tour deleted successfully.",
      "success"
    );


    await loadTours();


  } catch (error) {

    console.error(
      "Delete tour error:",
      error
    );


    showMessage(
      error.message,
      "error"
    );

  }

}


/* =========================================================
   LOCATION SECTION
========================================================= */

async function loadLocationSection() {

  const selector =
    document.getElementById(
      "locationDestinationSelector"
    );


  if (!selector) {
    return;
  }


  try {

    const {
      data,
      error
    } = await supabase
      .from("destinations")
      .select(
        "id,name,slug"
      )
      .order(
        "sort_order",
        {
          ascending: true,
          nullsFirst: false
        }
      )
      .order(
        "name",
        {
          ascending: true
        }
      );


    if (error) {
      throw error;
    }


    selector.innerHTML = `

      <div
        style="
          background:#fff;
          border:1px solid #e4e3db;
          border-radius:12px;
          padding:18px;
        "
      >

        <label
          style="
            display:block;
            font-weight:600;
            font-size:14px;
          "
        >

          Select Destination

          <select
            id="locationDestinationSelect"
            style="
              display:block;
              width:100%;
              max-width:500px;
              margin-top:8px;
              padding:11px;
              border:1px solid #d9ddd9;
              border-radius:7px;
              background:#fff;
            "
          >

            <option value="">
              Select a destination
            </option>

            ${(data || [])
              .map(
                destination => `
                  <option
                    value="${escapeAttribute(destination.id)}"
                  >
                    ${escapeHTML(
                      destination.name
                    )}
                  </option>
                `
              )
              .join("")}

          </select>

        </label>


        <button
          id="addLocationBtn"
          class="admin-primary-btn"
          type="button"
          style="margin-top:12px;"
        >
          + Add Location
        </button>

      </div>

    `;


    const select =
      document.getElementById(
        "locationDestinationSelect"
      );


    if (currentLocationDestinationId) {

      select.value =
        String(
          currentLocationDestinationId
        );

      await selectLocationDestination(
        currentLocationDestinationId
      );

    }


    select.addEventListener(
      "change",
      async () => {

        const id =
          Number(
            select.value
          );


        currentLocationDestinationId =
          id || null;


        await selectLocationDestination(
          id
        );

      }
    );


    document
      .getElementById(
        "addLocationBtn"
      )
      ?.addEventListener(
        "click",
        () => {

          if (!currentLocationDestinationId) {

            showMessage(
              "Select a destination first.",
              "error"
            );

            return;
          }


          openLocationModal(
            currentLocationDestinationId
          );

        }
      );


  } catch (error) {

    selector.innerHTML =
      errorHTML(
        error.message
      );

  }

}


/* =========================================================
   SELECT LOCATION DESTINATION
========================================================= */

async function selectLocationDestination(
  destinationId
) {

  const container =
    document.getElementById(
      "locationsList"
    );


  if (!container) {
    return;
  }


  if (!destinationId) {

    container.innerHTML =
      emptyHTML(
        "Select a destination to view its locations."
      );

    return;
  }


  container.innerHTML =
    loadingHTML();


  try {

    const {
      data,
      error
    } = await supabase
      .from("destination_locations")
      .select(
        "id,destination_id,location_number,name,description,image_path,image_url,sort_order,created_at,updated_at"
      )
      .eq(
        "destination_id",
        destinationId
      )
      .order(
        "location_number",
        {
          ascending: true,
          nullsFirst: false
        }
      )
      .order(
        "sort_order",
        {
          ascending: true,
          nullsFirst: false
        }
      );


    if (error) {
      throw error;
    }


    if (!data || data.length === 0) {

      container.innerHTML =
        emptyHTML(
          "No locations found for this destination."
        );

      return;
    }


    container.innerHTML =
      data
        .map(createLocationCard)
        .join("");


    bindLocationActions();

  } catch (error) {

    container.innerHTML =
      errorHTML(
        error.message
      );

  }

}


/* =========================================================
   LOCATION CARD
========================================================= */

function createLocationCard(location) {

  const image =
    safeImageUrl(
      location.image_url ||
      location.image_path
    );


  return `

    <article class="admin-item-card">

      <img
        class="admin-item-image"
        src="${escapeAttribute(image)}"
        alt="${escapeAttribute(location.name)}"
        loading="lazy"
        onerror="this.onerror=null;this.src='https://via.placeholder.com/800x500?text=No+Image';"
      >


      <div class="admin-item-content">

        <h3>
          ${escapeHTML(location.name)}
        </h3>

        <p>
          ${escapeHTML(
            location.description ||
            "No description."
          )}
        </p>

        <div class="admin-item-meta">

          Location number:
          <strong>
            ${escapeHTML(
              location.location_number ?? ""
            )}
          </strong>

          ${
            location.image_path
              ? ` · Image path:
                ${escapeHTML(
                  location.image_path
                )}`
              : ""
          }

        </div>


        <div
          class="admin-item-actions"
          style="margin-top:12px;"
        >

          <button
            class="admin-secondary-btn"
            type="button"
            data-edit-location="${escapeAttribute(location.id)}"
          >
            Edit
          </button>

          <button
            class="admin-danger-btn"
            type="button"
            data-delete-location="${escapeAttribute(location.id)}"
          >
            Delete
          </button>

        </div>

      </div>

    </article>

  `;

}


function bindLocationActions() {

  document
    .querySelectorAll(
      "[data-edit-location]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          openLocationModal(
            currentLocationDestinationId,
            Number(
              button.dataset.editLocation
            )
          );

        }
      );

    });


  document
    .querySelectorAll(
      "[data-delete-location]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          deleteLocation(
            Number(
              button.dataset.deleteLocation
            )
          );

        }
      );

    });

}


/* =========================================================
   LOCATION MODAL
========================================================= */

async function openLocationModal(
  destinationId,
  locationId = null
) {

  const modal =
    document.getElementById(
      "locationModal"
    );


  if (!modal) {
    return;
  }


  editingLocationId =
    locationId;


  currentLocationDestinationId =
    destinationId;


  document
    .getElementById("locationModalTitle")
    .textContent =
      locationId
        ? "Edit Location"
        : "Add Location";


  document
    .getElementById("locationId")
    .value =
      locationId || "";


  document
    .getElementById("locationName")
    .value = "";


  document
    .getElementById("locationDescription")
    .value = "";


  document
    .getElementById("locationNumber")
    .value = "1";


  document
    .getElementById("locationImageUrl")
    .value = "";


  document
    .getElementById("locationImagePath")
    .value = "";


  document
    .getElementById("locationSortOrder")
    .value = "0";


  document
    .getElementById("locationCurrentImage")
    .innerHTML = "";


  if (locationId) {

    try {

      const {
        data,
        error
      } = await supabase
        .from("destination_locations")
        .select("*")
        .eq("id", locationId)
        .single();


      if (error) {
        throw error;
      }


      document
        .getElementById("locationName")
        .value =
          data.name || "";


      document
        .getElementById("locationDescription")
        .value =
          data.description || "";


      document
        .getElementById("locationNumber")
        .value =
          data.location_number ?? 1;


      document
        .getElementById("locationImageUrl")
        .value =
          data.image_url || "";


      document
        .getElementById("locationImagePath")
        .value =
          data.image_path || "";


      document
        .getElementById("locationSortOrder")
        .value =
          data.sort_order ?? 0;


      const image =
        data.image_url ||
        data.image_path;


      if (image) {

        document
          .getElementById(
            "locationCurrentImage"
          )
          .innerHTML = `

            <img
              src="${escapeAttribute(
                safeImageUrl(image)
              )}"
              alt="Current location image"
              style="
                width:150px;
                height:100px;
                object-fit:cover;
                border-radius:8px;
              "
            >

          `;

      }

    } catch (error) {

      showMessage(
        error.message,
        "error"
      );

      return;

    }

  }


  modal.style.display =
    "flex";

}


/* =========================================================
   SAVE LOCATION
========================================================= */

async function saveLocation(event) {

  event.preventDefault();


  if (!currentLocationDestinationId) {

    showMessage(
      "Please select a destination.",
      "error"
    );

    return;
  }


  const name =
    document
      .getElementById(
        "locationName"
      )
      .value
      .trim();


  const description =
    document
      .getElementById(
        "locationDescription"
      )
      .value
      .trim();


  const locationNumber =
    Number(
      document
        .getElementById(
          "locationNumber"
        )
        .value
    ) || 1;


  const imageUrl =
    document
      .getElementById(
        "locationImageUrl"
      )
      .value
      .trim();


  const imagePath =
    document
      .getElementById(
        "locationImagePath"
      )
      .value
      .trim();


  const sortOrder =
    Number(
      document
        .getElementById(
          "locationSortOrder"
        )
        .value
    ) || 0;


  if (!name) {

    showMessage(
      "Location name is required.",
      "error"
    );

    return;
  }


  try {

    const payload = {

      destination_id:
        currentLocationDestinationId,

      location_number:
        locationNumber,

      name,

      description:
        description || null,

      image_path:
        imagePath || null,

      image_url:
        imageUrl || null,

      sort_order:
        sortOrder

    };


    let result;


    if (editingLocationId) {

      result =
        await supabase
          .from("destination_locations")
          .update(payload)
          .eq(
            "id",
            editingLocationId
          );

    } else {

      result =
        await supabase
          .from("destination_locations")
          .insert(payload);

    }


    if (result.error) {
      throw result.error;
    }


    closeModal(
      "locationModal"
    );


    showMessage(
      "Location saved successfully.",
      "success"
    );


    await selectLocationDestination(
      currentLocationDestinationId
    );


  } catch (error) {

    console.error(
      "Save location error:",
      error
    );


    showMessage(
      error.message,
      "error"
    );

  }

}


/* =========================================================
   DELETE LOCATION
========================================================= */

async function deleteLocation(id) {

  if (!confirm(
    "Delete this location?"
  )) {
    return;
  }


  try {

    const {
      error
    } = await supabase
      .from("destination_locations")
      .delete()
      .eq("id", id);


    if (error) {
      throw error;
    }


    showMessage(
      "Location deleted successfully.",
      "success"
    );


    await selectLocationDestination(
      currentLocationDestinationId
    );


  } catch (error) {

    console.error(
      "Delete location error:",
      error
    );


    showMessage(
      error.message,
      "error"
    );

  }

}


/* =========================================================
   REVIEWS
========================================================= */

async function loadReviews() {

  const container =
    document.getElementById(
      "reviewsList"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    loadingHTML();


  try {

    const {
      data,
      error
    } = await supabase
      .from("reviews")
      .select(
        "id,name,country,rating,review,photo_url,photo_path,created_at"
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );


    if (error) {
      throw error;
    }


    if (!data || data.length === 0) {

      container.innerHTML =
        emptyHTML(
          "No reviews found."
        );

      return;
    }


    container.innerHTML =
      data
        .map(createReviewCard)
        .join("");


    bindReviewActions();

  } catch (error) {

    console.error(
      "Review loading error:",
      error
    );


    container.innerHTML =
      errorHTML(
        error.message
      );

  }

}


/* =========================================================
   REVIEW CARD
========================================================= */

function createReviewCard(review) {

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


  const date =
    review.created_at
      ? new Date(
          review.created_at
        ).toLocaleString()
      : "";


  return `

    <article class="admin-item-card">

      ${
        review.photo_url
          ? `
            <img
              class="admin-review-photo"
              src="${escapeAttribute(
                safeImageUrl(
                  review.photo_url
                )
              )}"
              alt="${escapeAttribute(
                review.name
              )}"
              loading="lazy"
            >
          `
          : ""
      }


      <div class="admin-item-content">

        <h3>
          ${escapeHTML(
            review.name ||
            "Anonymous"
          )}
        </h3>


        <div
          style="
            margin-bottom:8px;
          "
        >

          <span class="admin-stars">
            ${escapeHTML(stars)}
          </span>

          <span
            style="
              color:#69736e;
              font-size:13px;
            "
          >
            ${escapeHTML(
              review.rating ?? ""
            )}/5
          </span>

        </div>


        <div
          style="
            color:#69736e;
            font-size:13px;
            margin-bottom:10px;
          "
        >
          ${escapeHTML(
            review.country || ""
          )}

          ${
            date
              ? ` · ${escapeHTML(date)}`
              : ""
          }
        </div>


        <p>
          ${escapeHTML(
            review.review
          )}
        </p>


        <div class="admin-item-actions">

          <button
            class="admin-danger-btn"
            type="button"
            data-delete-review="${escapeAttribute(review.id)}"
          >
            Delete Review
          </button>

        </div>

      </div>

    </article>

  `;

}


function bindReviewActions() {

  document
    .querySelectorAll(
      "[data-delete-review]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          deleteReview(
            button.dataset.deleteReview
          );

        }
      );

    });

}


/* =========================================================
   DELETE REVIEW
========================================================= */

async function deleteReview(id) {

  if (!confirm(
    "Delete this review?"
  )) {
    return;
  }


  try {

    /*
     * Get photo path before deleting
     * the database row.
     */

    const {
      data: review,
      error: fetchError
    } = await supabase
      .from("reviews")
      .select(
        "photo_path"
      )
      .eq("id", id)
      .maybeSingle();


    if (fetchError) {
      throw fetchError;
    }


    /*
     * Delete database record.
     */

    const {
      error
    } = await supabase
      .from("reviews")
      .delete()
      .eq("id", id);


    if (error) {
      throw error;
    }


    /*
     * Try deleting storage file if
     * a photo path exists.
     *
     * If storage deletion is blocked by
     * policy, the review itself is still
     * deleted.
     */

    if (review?.photo_path) {

      const {
        error: storageError
      } = await supabase
        .storage
        .from("review-photos")
        .remove([
          review.photo_path
        ]);


      if (storageError) {

        console.warn(
          "Storage photo deletion failed:",
          storageError
        );

      }

    }


    showMessage(
      "Review deleted successfully.",
      "success"
    );


    await loadReviews();


  } catch (error) {

    console.error(
      "Delete review error:",
      error
    );


    showMessage(
      error.message,
      "error"
    );

  }

}


/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

  try {

    const {
      error
    } = await supabase.auth.signOut();


    if (error) {
      throw error;
    }


    window.location.href =
      "admin.html";


  } catch (error) {

    showMessage(
      error.message,
      "error"
    );

  }

}


/* =========================================================
   MODAL
========================================================= */

function closeModal(id) {

  const modal =
    document.getElementById(id);


  if (modal) {

    modal.style.display =
      "none";

  }

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
  message,
  type = "success"
) {

  const element =
    document.getElementById(
      "adminMessage"
    );


  if (!element) {
    return;
  }


  element.style.display =
    "block";


  element.textContent =
    message;


  if (type === "error") {

    element.style.background =
      "#fdecec";

    element.style.color =
      "#b42318";

    element.style.border =
      "1px solid #f5c2c0";

  } else {

    element.style.background =
      "#edf7f0";

    element.style.color =
      "#176b4d";

    element.style.border =
      "1px solid #c9e4d2";

  }


  clearTimeout(
    showMessage.timer
  );


  showMessage.timer =
    setTimeout(
      () => {

        element.style.display =
          "none";

      },
      5000
    );

}


/* =========================================================
   UI HELPERS
========================================================= */

function loadingHTML() {

  return `

    <div
      style="
        background:#fff;
        border:1px solid #e4e3db;
        border-radius:12px;
        padding:35px;
        text-align:center;
        color:#69736e;
      "
    >
      Loading...
    </div>

  `;

}


function emptyHTML(message) {

  return `

    <div
      style="
        background:#fff;
        border:1px solid #e4e3db;
        border-radius:12px;
        padding:35px;
        text-align:center;
        color:#69736e;
      "
    >
      ${escapeHTML(message)}
    </div>

  `;

}


function errorHTML(message) {

  return `

    <div
      style="
        background:#fff;
        border:1px solid #f0c7c5;
        border-radius:12px;
        padding:25px;
        color:#b42318;
      "
    >

      <strong>
        Error
      </strong>

      <p>
        ${escapeHTML(message)}
      </p>

    </div>

  `;

}
