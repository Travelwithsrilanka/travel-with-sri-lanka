
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

document.addEventListener("DOMContentLoaded", initAdminDashboard);


/* 

=========================================================
   INITIALIZE
========================================================= */

async function initAdminDashboard() {

  const loading = document.getElementById("loading");

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
      window.location.href = "admin.html";
      return;
    }

    createDashboard();

    await loadDashboard();

    supabase.auth.onAuthStateChange((event) => {

      if (event === "SIGNED_OUT") {
        window.location.href = "admin.html";
      }

    });

  } catch (error) {


    console.error(error);

    if (loading) {
      loading.innerHTML = `
        <div style="padding:30px;text-align:center;">
          <h2>Admin Panel Error</h2>
          <p>${escapeHTML(getReadableError(error))}</p>
          <button onclick="location.reload()">
            Reload
          </button>
        </div>
      `;
    }

  }

}

/* =========================================================
   CREATE DASHBOARD
========================================================= */

function createDashboard() {

  const loading = document.getElementById("loading");

  if (!loading) {
    return;
  }

  loading.outerHTML = `

    <div class="admin-app">

      <header class="admin-header">

        <div>
          <h1>TRAVEL WITH SRI LANKA ADMIN</h1>
          <p>Website Management Dashboard</p>
        </div>

        <div class="admin-user">

          <span id="adminEmail"></span>

          <button
            id="logoutBtn"
            class="admin-logout-btn"
            type="button"
          >
            Logout
          </button>

        </div>

      </header>



      <div class="admin-layout">

        <aside class="admin-sidebar">

          <button
            class="admin-nav-btn active"
            data-section="dashboard"
            type="button"
          >
            📊 Dashboard
          </button>

          <button
            class="admin-nav-btn"
            data-section="destinations"
            type="button"
          >
            📍 Destinations
          </button>

          <button
            class="admin-nav-btn"
            data-section="tours"
            type="button"
          >
            🧳 Tours
          </button>

          <button
            class="admin-nav-btn"
            data-section="locations"
            type="button"
          >
            📌 Destination Locations
          </button>

          <button
            class="admin-nav-btn"
            data-section="reviews"
            type="button"
          >
            ⭐ Reviews

          </button>

        </aside>


        <main class="admin-main">


          <!-- =================================================
               DASHBOARD
          ================================================== -->

          <section
            id="section-dashboard"
            class="admin-section"
          >

            <div class="admin-section-header">

              <div>
                <h2>Dashboard</h2>
                <p>
                  Manage your Travel With Sri Lanka website.
                </p>
              </div>

            </div>


            <div class="admin-stats-grid">

              <div class="admin-stat-card">
                <span>Destinations</span>
                <strong id="statDestinations">0</strong>
              </div>

              <div class="admin-stat-card">
                <span>Tours</span>
                <strong id="statTours">0</strong>

              </div>

              <div class="admin-stat-card">
                <span>Locations</span>
                <strong id="statLocations">0</strong>
              </div>

              <div class="admin-stat-card">
                <span>Reviews</span>
                <strong id="statReviews">0</strong>
              </div>

              <div class="admin-stat-card">
                <span>Tour Gallery Images</span>
                <strong id="statGallery">0</strong>
              </div>

            </div>



            <div class="admin-dashboard-box">

              <h3>Quick Information</h3>

              <p>
                Use the sidebar to manage destinations,
                tours, destination locations, reviews and
                tour gallery images.
              </p>

            </div>

          </section>



          <!-- ===================================

==============
               DESTINATIONS
          ================================================== -->

          <section
            id="section-destinations"
            class="admin-section"
            style="display:none;"
          >

            <div class="admin-section-header">

              <div>
                <h2>Destinations</h2>
                <p>
                  Manage Sri Lankan destinations.
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



          <!-- =================================================
               TOURS

          ================================================== -->

          <section
            id="section-tours"
            class="admin-section"
            style="display:none;"
          >

            <div class="admin-section-header">

              <div>
                <h2>Tours</h2>
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



          <!-- =================================================
               LOCATIONS
          ===================================

=============== -->

          <section
            id="section-locations"
            class="admin-section"
            style="display:none;"
          >

            <div class="admin-section-header">

              <div>
                <h2>Destination Locations</h2>
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



          <!-- =================================================
               REVIEWS
          ================================================== -->

          <section
            id="section-reviews"
            class="admin-section"
            style="display:none;"
          >

            <div class="admin-section-header">


              <div>
                <h2>Reviews</h2>
                <p>
                  Manage customer reviews.
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



    <!-- =====================================================
         CONTENT MODAL
    ====================================================== -->

    <div
      id="contentModal"
      class="admin-modal"
      style="display:none;"
    >

      <div class="admin-modal-box">

        <div class="admin-modal-header">

          <h2 id="contentModalTitle">
            Add Content
          </h2>

          <button
            class="admin-modal-close"
            id="closeContentModal"
            type="button"
          >
            ×
          </button>

        </div>


        <form id="contentForm">

          <input
            type="hidden"
            id="contentType"
          />

          <div class="admin-form-group">


            <label id="nameLabel">
              Name
            </label>

            <input
              id="contentName"
              type="text"
              required
            />

          </div>


          <div class="admin-form-group">

            <label>
              Slug
            </label>

            <input
              id="contentSlug"

              type="text"
              required
            />

          </div>


          <div class="admin-form-group">

            <label>
              Description
            </label>

            <textarea
              id="contentDescription"
              rows="5"
            ></textarea>

          </div>


          <div class="admin-form-group">


            <label>
              Main Image URL
            </label>

            <input
              id="contentImageUrl"
              type="url"
              placeholder="https://..."
            />

          </div>


          <div class="admin-form-group">

            <label>
              Page URL
            </label>

            <input
              id="contentPageUrl"

              type="text"
              placeholder="tour.html?tour=..."
            />

          </div>


          <div class="admin-form-group">

            <label>
              Sort Order
            </label>

            <input
              id="contentSortOrder"
              type="number"
              value="0"
            />

          </div>

          <div
            id="currentContentImage"
            class="admin-current-image"
          ></div>


          <div class="admin-form-actions">

            <button
              type="button"
              id="cancelContentBtn"
              class="admin-secondary-btn"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="admin-primary-btn"
              id="saveContentBtn"
            >
              Save
            </button>


          </div>

        </form>

      </div>

    </div>



    <!-- =====================================================
         LOCATION MODAL
    ====================================================== -->

    <div
      id="locationModal"
      class="admin-modal"

      style="display:none;"
    >

      <div class="admin-modal-box">

        <div class="admin-modal-header">

          <h2 id="locationModalTitle">
            Add Location
          </h2>

          <button
            id="closeLocationModal"
            class="admin-modal-close"
            type="button"
          >
            ×
          </button>

        </div>

        <form id="locationForm">

          <input
            type="hidden"
            id="locationDestinationId"
          />


          <div class="admin-form-group">

            <label>
              Destination
            </label>

            <select
              id="locationDestinationSelect"
              required
            ></select>

          </div>

          <div class="admin-form-group">

            <label>
              Location Number
            </label>

            <input
              id="locationNumber"
              type="number"
              min="1"
              value="1"
              required
            />

          </div>


          <div class="admin-form-group">

            <label>
              Location Name
            </label>


            <input
              id="locationName"
              type="text"
              required
            />

          </div>


          <div class="admin-form-group">

            <label>
              Description
            </label>

            <textarea
              id="locationDescription"
              rows="4"
            ></textarea>

          </div>



          <div class="admin-form-group">

            <label>
              Image URL
            </label>

            <input
              id="locationImageUrl"
              type="url"
              placeholder="https://..."
            />

          </div>


          <div class="admin-form-group">

            <label>
              Image Path
            </label>

            <input
              id="locationImagePath"
              type="text"
              placeholder="images/destinations/..."
            />

          </div>


          <div class="admin-form-group">

            <label>
              Sort Order
            </label>

            <input
              id="locationSortOrder"
              type="number"
              value="0"
            />

          </div>


          <div class="admin-form-actions">

            <button
              type="button"
              id="cancelLocationBtn"
              class="admin-secondary-btn"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="admin-primary-btn"
              id="saveLocationBtn"
            >
              Save
            </button>

          </div>


        </form>

      </div>

    </div>



    <!-- =====================================================
         TOUR GALLERY MODAL
    ====================================================== -->

    <div
      id="galleryModal"
      class="admin-modal"
      style="display:none;"
    >


      <div class="admin-modal-box admin-gallery-modal-box">

        <div class="admin-modal-header">

          <div>

            <h2>
              Tour Gallery
            </h2>

            <p
              id="galleryTourTitle"
              class="admin-modal-subtitle"
            ></p>

          </div>

          <button
            id="closeGalleryModal"
            class="admin-modal-close"

            type="button"
          >
            ×
          </button>

        </div>


        <div class="gallery-upload-box">

          <label
            for="galleryFileInput"
            class="gallery-upload-label"
          >
            📷 Select Gallery Images
          </label>

          <input
            id="galleryFileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple

          />

          <p>
            You can select multiple images.
            Maximum 5MB per image.
          </p>

          <button
            id="uploadGalleryBtn"
            class="admin-primary-btn"
            type="button"
          >
            Upload Images
          </button>

          <div
            id="galleryUploadStatus"
            class="gallery-upload-status"
          ></div>

        </div>


        <div
          id="galleryPreview"
          class="gallery-admin-grid"
        ></div>

      </div>

    </div>



    <!-- =====================================================
         ADMIN STYLES
    ====================================================== -->

    <style>

      * {
        box-sizing: border-box;
      }


      body {
        margin: 0;
        background: #f5f7f4;
        color: #18352a;
        font-family:
          Arial,
          Helvetica,
          sans-serif;
      }


      .admin-app {
        min-height: 100vh;
      }


      .admin-header {

        min-height: 78px;
        background: #173f2c;
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 16px 28px;
      }


      .admin-header h1 {
        margin: 0;
        font-size: 20px;
        letter-spacing: .5px;
      }


      .admin-header p {
        margin: 5px 0 0;
        opacity: .75;
        font-size: 13px;

      }


      .admin-user {
        display: flex;
        align-items: center;
        gap: 15px;
        font-size: 13px;
      }


      .admin-logout-btn {
        border: 1px solid rgba(255,255,255,.4);
        background: transparent;
        color: white;
        padding: 9px 15px;
        border-radius: 8px;
        cursor: pointer;
      }


      .admin-layout {

        display: flex;
        min-height: calc(100vh - 78px);
      }


      .admin-sidebar {
        width: 240px;
        background: white;
        border-right: 1px solid #e1e8e2;
        padding: 18px 12px;
        flex-shrink: 0;
      }


      .admin-nav-btn {
        display: block;
        width: 100%;
        border: 0;
        background: transparent;
        text-align: left;
        padding: 13px 15px;
        margin-bottom: 5px;
        border-radius: 9px;

        color: #315044;
        cursor: pointer;
        font-size: 14px;
      }


      .admin-nav-btn:hover,
      .admin-nav-btn.active {
        background: #e9f1eb;
        color: #173f2c;
        font-weight: 700;
      }


      .admin-main {
        flex: 1;
        padding: 30px;
        min-width: 0;
      }


      .admin-section-header {

        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        margin-bottom: 25px;
      }


      .admin-section-header h2 {
        margin: 0 0 6px;
        font-size: 27px;
      }


      .admin-section-header p {
        margin: 0;
        color: #718078;
        font-size: 14px;
      }


      .admin-primary-btn,

      .admin-secondary-btn,
      .admin-danger-btn,
      .admin-small-btn {
        border: 0;
        border-radius: 8px;
        padding: 10px 15px;
        cursor: pointer;
        font-weight: 600;
        font-size: 13px;
      }


      .admin-primary-btn {
        background: #1e5c3f;
        color: white;
      }


      .admin-primary-btn:hover {
        background: #174b34;
      }


      .admin-secondary-btn {
        background: #edf1ee;
        color: #30473b;
      }


      .admin-danger-btn {
        background: #c53d3d;
        color: white;
      }


      .admin-small-btn {
        background: #edf1ee;
        color: #264438;
        padding: 8px 11px;
      }


      .admin-card-list {
        display: grid;

        gap: 15px;
      }


      .admin-card {
        background: white;
        border: 1px solid #e1e8e2;
        border-radius: 13px;
        padding: 15px;
        display: flex;
        gap: 18px;
        align-items: center;
      }


      .admin-card-image {
        width: 130px;
        height: 95px;
        object-fit: cover;
        border-radius: 9px;
        background: #edf1ee;
        flex-shrink: 0;

      }


      .admin-card-info {
        flex: 1;
        min-width: 0;
      }


      .admin-card-info h3 {
        margin: 0 0 6px;
        font-size: 18px;
      }


      .admin-card-info p {
        margin: 0 0 7px;
        color: #697870;
        font-size: 13px;
        line-height: 1.5;
      }

      .admin-card-meta {
        color: #87938d;
        font-size: 12px;
      }


      .admin-card-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
      }


      .gallery-btn {
        background: #d7a83c;
        color: #172a20;
      }


      .admin-stats-grid {
        display: grid;
        grid-template-columns:

          repeat(5, minmax(0, 1fr));
        gap: 15px;
      }


      .admin-stat-card {
        background: white;
        border: 1px solid #e1e8e2;
        border-radius: 13px;
        padding: 20px;
      }


      .admin-stat-card span {
        display: block;
        color: #738079;
        font-size: 13px;
        margin-bottom: 8px;
      }


      .admin-stat-card strong {

        font-size: 30px;
        color: #1e5c3f;
      }


      .admin-dashboard-box {
        margin-top: 25px;
        padding: 25px;
        background: white;
        border: 1px solid #e1e8e2;
        border-radius: 13px;
      }


      .admin-dashboard-box h3 {
        margin-top: 0;
      }


      .admin-modal {
        position: fixed;
        inset: 0;

        z-index: 9999;
        background: rgba(10, 25, 18, .68);
        padding: 25px;
        overflow-y: auto;
      }


      .admin-modal-box {
        width: min(700px, 100%);
        margin: 30px auto;
        background: white;
        border-radius: 16px;
        padding: 25px;
      }


      .admin-gallery-modal-box {
        width: min(1000px, 100%);
      }


      .admin-modal-header {

        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 15px;
        margin-bottom: 20px;
      }


      .admin-modal-header h2 {
        margin: 0;
      }


      .admin-modal-subtitle {
        margin: 5px 0 0;
        color: #718078;
        font-size: 13px;
      }


      .admin-modal-close {
        width: 35px;
        height: 35px;

        border: 0;
        border-radius: 8px;
        background: #edf1ee;
        font-size: 25px;
        line-height: 1;
        cursor: pointer;
      }


      .admin-form-group {
        margin-bottom: 17px;
      }


      .admin-form-group label {
        display: block;
        margin-bottom: 7px;
        font-weight: 700;
        font-size: 13px;
      }

      .admin-form-group input,
      .admin-form-group textarea,
      .admin-form-group select {
        width: 100%;
        border: 1px solid #d8e0da;
        border-radius: 8px;
        padding: 11px 12px;
        font: inherit;
        outline: none;
      }


      .admin-form-group input:focus,
      .admin-form-group textarea:focus,
      .admin-form-group select:focus {
        border-color: #1e5c3f;
      }


      .admin-form-actions {
        display: flex;
        justify-content: flex-end;

        gap: 9px;
        margin-top: 22px;
      }


      .admin-current-image {
        margin-top: 10px;
      }


      .admin-current-image img {
        width: 130px;
        height: 90px;
        object-fit: cover;
        border-radius: 8px;
      }


      /* =====================================================
         GALLERY

      ================================================== */


      .gallery-upload-box {
        border: 2px dashed #cbd8ce;
        border-radius: 13px;
        padding: 22px;
        text-align: center;
        margin-bottom: 25px;
        background: #f8faf8;
      }


      .gallery-upload-label {
        display: block;
        font-weight: 700;
        margin-bottom: 12px;
        font-size: 16px;
      }


      #galleryFileInput {
        display: block;
        width: 100%;
        margin-bottom: 10px;
      }


      .gallery-upload-box p {
        margin: 8px 0 15px;
        color: #738079;
        font-size: 12px;
      }


      .gallery-upload-status {
        min-height: 20px;
        margin-top: 12px;
        font-size: 13px;
        font-weight: 600;
      }


      .gallery-admin-grid {
        display: grid;
        grid-template-columns:
          repeat(4, minmax(0, 1fr));
        gap: 15px;
      }


      .gallery-admin-item {
        background: #f7f9f7;
        border: 1px solid #dfe7e1;
        border-radius: 11px;
        overflow: hidden;
      }


      .gallery-admin-image-wrap {
        position: relative;
        aspect-ratio: 4 / 3;
        background: #e9efea;
      }


      .gallery-admin-item img {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }


      .gallery-admin-number {
        position: absolute;
        top: 8px;
        left: 8px;
        background: rgba(0,0,0,.65);
        color: white;
        border-radius: 6px;
        padding: 4px 7px;
        font-size: 11px;
      }


      .gallery-admin-item-bottom {

        padding: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }


      .gallery-admin-item-bottom small {
        color: #718078;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }


      .gallery-delete-btn {
        border: 0;
        background: #c53d3d;
        color: white;
        border-radius: 7px;
        padding: 7px 9px;

        cursor: pointer;
        font-size: 12px;
      }


      .gallery-empty {
        grid-column: 1 / -1;
        text-align: center;
        padding: 45px 20px;
        border: 1px dashed #cbd8ce;
        border-radius: 12px;
        color: #718078;
      }


      .admin-review-card {
        align-items: flex-start;
      }


      .admin-review-rating {
        color: #d7a83c;

        margin-bottom: 5px;
      }


      .admin-review-photo {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 8px;
      }


      @media (max-width: 1100px) {

        .admin-stats-grid {
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
        }

        .gallery-admin-grid {
          grid-template-columns:
            repeat(3, minmax(0, 1fr));

        }

      }


      @media (max-width: 850px) {

        .admin-layout {
          display: block;
        }

        .admin-sidebar {
          width: 100%;
          display: flex;
          overflow-x: auto;
          gap: 5px;
          border-right: 0;
          border-bottom: 1px solid #e1e8e2;
        }

        .admin-nav-btn {
          width: auto;
          min-width: max-content;

          margin: 0;
        }

        .admin-main {
          padding: 20px;
        }

        .admin-header {
          padding: 15px 18px;
        }

        .admin-user span {
          display: none;
        }

      }


      @media (max-width: 650px) {

        .admin-header {
          display: block;

        }

        .admin-user {
          margin-top: 12px;
          justify-content: space-between;
        }

        .admin-section-header {
          align-items: flex-start;
          flex-direction: column;
        }

        .admin-stats-grid {
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
        }

        .admin-card {
          display: block;
        }

        .admin-card-image {

          width: 100%;
          height: 180px;
          margin-bottom: 12px;
        }

        .admin-card-actions {
          margin-top: 12px;
        }

        .gallery-admin-grid {
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
        }

        .admin-modal {
          padding: 10px;
        }

        .admin-modal-box {
          padding: 18px;
          margin: 10px auto;
        }


      }


      @media (max-width: 400px) {

        .admin-stats-grid {
          grid-template-columns: 1fr;
        }

        .gallery-admin-grid {
          grid-template-columns: 1fr;
        }

      }

    </style>
  `;

  setupDashboardEvents();

}



/* =========================================================
   DASHBOARD EVENTS
========================================================= */

function setupDashboardEvents() {

  document.querySelectorAll(".admin-nav-btn").forEach((button) => {

    button.addEventListener("click", () => {

      switchSection(button.dataset.section);

    });

  });


  document
    .getElementById("logoutBtn")
    ?.addEventListener("click", logout);


  document
    .getElementById("addDestinationBtn")
    ?.addEventListener("click", () => {

      openContentModal("destination");

    });


  document
    .getElementById("addTourBtn")
    ?.addEventListener("click", () => {

      openContentModal("tour");

    });


  document
    .getElementById("contentForm")
    ?.addEventListener("submit", saveContent);


  document
    .getElementById("cancelContentBtn")
    ?.addEventListener("click", closeContentModal);


  document
    .getElementById("closeContentModal")
    ?.addEventListener("click", closeContentModal);


  document
    .getElementById("locationForm")
    ?.addEventListener("submit", 

saveLocation);


  document
    .getElementById("cancelLocationBtn")
    ?.addEventListener("click", closeLocationModal);


  document
    .getElementById("closeLocationModal")
    ?.addEventListener("click", closeLocationModal);


  document
    .getElementById("closeGalleryModal")
    ?.addEventListener("click", closeGalleryModal);


  document

    .getElementById("uploadGalleryBtn")
    ?.addEventListener("click", uploadGalleryImages);


  document
    .getElementById("galleryFileInput")
    ?.addEventListener("change", previewSelectedGalleryFiles);


  document
    .getElementById("contentModal")
    ?.addEventListener("click", (event) => {

      if (event.target.id === "contentModal") {
        closeContentModal();
      }

    });

  document
    .getElementById("locationModal")
    ?.addEventListener("click", (event) => {

      if (event.target.id === "locationModal") {
        closeLocationModal();
      }

    });


  document
    .getElementById("galleryModal")
    ?.addEventListener("click", (event) => {

      if (event.target.id === "galleryModal") {
        closeGalleryModal();
      }

    });

}



/* =========================================================
   SWITCH SECTION
========================================================= */

async function switchSection(section) {

  currentSection = section;

  document.querySelectorAll(".admin-section").forEach((item) => {
    item.style.display = "none";
  });


  const target = document.getElementById(
    `section-${section}`
  );


  if (target) {
    target.style.display = "block";
  }


  document.querySelectorAll(".admin-nav-btn").forEach((button) => {

    button.classList.toggle(
      "active",
      button.dataset.section === section
    );

  });


  if (section === "dashboard") {
    await loadDashboard();
  }

  if (section === "destinations") {
    await loadDestinationsAdmin();

  }

  if (section === "tours") {
    await loadToursAdmin();
  }

  if (section === "locations") {
    await loadLocationsAdmin();
  }

  if (section === "reviews") {
    await loadReviewsAdmin();
  }

}


/* =========================================================
   LOAD DASHBOARD
===================================

====================== */

async function loadDashboard() {

  try {

    const sessionResult =
      await supabase.auth.getSession();

    const email =
      sessionResult.data.session?.user?.email || "";

    const emailElement =
      document.getElementById("adminEmail");

    if (emailElement) {
      emailElement.textContent = email;
    }


    const [
      destinationsResult,
      toursResult,
      locationsResult,
      reviewsResult,
      galleryResult
    ] = await Promise.all([

      supabase
        .from("destinations")
        .select("id", {
          count: "exact",
          head: true
        }),

      supabase
        .from("tours")
        .select("id", {
          count: "exact",
          head: true
        }),


      supabase
        .from("destination_locations")
        .select("id", {
          count: "exact",
          head: true
        }),

      supabase
        .from("reviews")
        .select("id", {
          count: "exact",
          head: true
        }),

      supabase
        .from("tour_gallery")
        .select("id", {
          count: "exact",
          head: true
        })

    ]);


    setText(
      "statDestinations",
      destinationsResult.count || 0
    );

    setText(
      "statTours",
      toursResult.count || 0
    );

    setText(
      "statLocations",
      locationsResult.count || 0
    );

    setText(
      "statReviews",
      reviewsResult.count || 0
    );

    setText(
      "statGallery",
      galleryResult.count || 0
    );


    if (currentSection === "dashboard") {
      return;
    }

  } catch (error) {

    console.error("Dashboard error:", error);

  }

}


/* =========================================================

   DESTINATIONS
========================================================= */

async function loadDestinationsAdmin() {

  const container =
    document.getElementById("destinationsList");

  if (!container) return;

  container.innerHTML =
    loadingHTML("Loading destinations...");


  const {
    data,
    error
  } = await supabase
    .from("destinations")

    .select("*")
    .order("sort_order", {
      ascending: true
    })
    .order("created_at", {
      ascending: true
    });


  if (error) {

    container.innerHTML =
      errorHTML(getReadableError(error));

    return;
  }


  if (!data || data.length === 0) {

    container.innerHTML =
      emptyHTML("No destinations found.");


    return;

  }


  container.innerHTML =
    data.map(createDestinationCard).join("");

}


function createDestinationCard(destination) {

  const image =
    destination.image_url ||
    "https://placehold.co/600x400?text=Destination";


  return `


    <div class="admin-card">

      <img
        class="admin-card-image"
        src="${escapeAttribute(image)}"
        alt="${escapeAttribute(destination.name || "")}"
      />

      <div class="admin-card-info">

        <h3>
          ${escapeHTML(destination.name || "Unnamed")}
        </h3>

        <p>
          ${escapeHTML(
            truncate(destination.description || "", 180)
          )}

        </p>

        <div class="admin-card-meta">
          Slug: ${escapeHTML(destination.slug || "-")}
          · Order: ${destination.sort_order ?? 0}
        </div>

      </div>

      <div class="admin-card-actions">

        <button
          class="admin-small-btn"
          data-edit-destination="${destination.id}"
          type="button"
        >
          Edit
        </button>

        <button
          class="admin-small-btn"

          data-location-destination="${destination.id}"
          type="button"
        >
          Locations
        </button>

        <button
          class="admin-danger-btn"
          data-delete-destination="${destination.id}"
          type="button"
        >
          Delete
        </button>

      </div>

    </div>

  `;

}


/* =========================================================
   TOURS
========================================================= */

async function loadToursAdmin() {

  const container =
    document.getElementById("toursList");

  if (!container) return;

  container.innerHTML =
    loadingHTML("Loading tours...");


  const {

    data,
    error
  } = await supabase
    .from("tours")
    .select("*")
    .order("sort_order", {
      ascending: true
    })
    .order("created_at", {
      ascending: true
    });


  if (error) {

    container.innerHTML =
      errorHTML(getReadableError(error));

    return;

  }


  if (!data || data.length === 0) {

    container.innerHTML =
      emptyHTML("No tours found.");

    return;

  }


  container.innerHTML =
    data.map(createTourCard).join("");


  bindTourActions();

}


function createTourCard(tour) {

  const image =
    tour.image_url ||
    "https://placehold.co/600x400?text=Tour";


  return `

    <div class="admin-card">

      <img
        class="admin-card-image"
        src="${escapeAttribute(image)}"
        alt="${escapeAttribute(tour.title || "")}"
      />


      <div class="admin-card-info">

        <h3>
          ${escapeHTML(tour.title || "Unnamed Tour")}
        </h3>


        <p>
          ${escapeHTML(
            truncate(tour.description || "", 180)
          )}
        </p>

        <div class="admin-card-meta">

          Slug:
          ${escapeHTML(tour.slug || "-")}

          · Order:
          ${tour.sort_order ?? 0}

        </div>

      </div>


      <div class="admin-card-actions">

        <button
          class="admin-small-btn"
          data-edit-tour="${tour.id}"
          type="button"
        >
          Edit
        </button>


        <button
          class="admin-small-btn gallery-btn"
          data-open-gallery="${tour.id}"
          data-tour-title="${escapeAttribute(
            tour.title || "Tour"
          )}"
          type="button"
        >
          📷 Gallery
        </button>


        <button

          class="admin-danger-btn"
          data-delete-tour="${tour.id}"
          type="button"
        >
          Delete
        </button>

      </div>

    </div>

  `;

}


function bindTourActions() {

  document
    .querySelectorAll("[data-edit-tour]")
    .forEach((button) => {

      button.addEventListener("click", () => {

        const id =
          Number(button.dataset.editTour);

        openContentModal("tour", id);

      });

    });


  document
    .querySelectorAll("[data-open-gallery]")
    .forEach((button) => {

      button.addEventListener("click", () => {

        const id =
          Number(button.dataset.openGallery);

        const title =

          button.dataset.tourTitle || "Tour";

        openGalleryModal(id, title);

      });

    });


  document
    .querySelectorAll("[data-delete-tour]")
    .forEach((button) => {

      button.addEventListener("click", () => {

        const id =
          Number(button.dataset.deleteTour);

        deleteTour(id);

      });

    });


  document
    .querySelectorAll("[data-edit-destination]")
    .forEach((button) => {

      button.addEventListener("click", () => {

        openContentModal(
          "destination",
         document
  .querySelectorAll("[data-delete-destination]")
  .forEach((button) => {

    button.addEventListener("click", () => {

      deleteDestination(
        Number(button.dataset.deleteDestination)
      );

    });

  });

    });


  document
    .querySelectorAll("[data-location-destination]")
    .forEach((button) => {

      button.addEventListener("click", () => {

        currentLocationDestinationId =
          Number(button.dataset.locationDestination);

        switchSection("locations");

      });

    });

}


/* =========================================================
   CONTENT MODAL
========================================================= */

async function openContentModal(type, id 

= null) {

  editingDestinationId = null;
  editingTourId = null;


  document.getElementById("contentType").value = type;


  if (type === "destination") {

    document.getElementById("contentModalTitle").textContent =
      id ? "Edit Destination" : "Add Destination";

    document.getElementById("nameLabel").textContent =

      "Destination Name";

  } else {

    document.getElementById("contentModalTitle").textContent =
      id ? "Edit Tour" : "Add Tour";

    document.getElementById("nameLabel").textContent =
      "Tour Title";

  }


  clearContentForm();


  if (id) {

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

      alert(getReadableError(error));

      return;

    }



    document.getElementById("contentName").value =
      type === "destination"
        ? data.name || ""
        : data.title || "";


    document.getElementById("contentSlug").value =
      data.slug || "";


    document.getElementById("contentDescription").value =
      data.description || "";

    document.getElementById("contentImageUrl").value =
      data.image_url || "";


    document.getElementById("contentPageUrl").value =
      data.page_url || "";


    document.getElementById("contentSortOrder").value =
      data.sort_order ?? 0;


    if (type === "destination") {
      editingDestinationId = id;
    } else {
      editingTourId = id;

    }


    if (data.image_url) {

      document.getElementById(
        "currentContentImage"
      ).innerHTML = `

        <img
          src="${escapeAttribute(data.image_url)}"
          alt="Current image"
        />

      `;

    }

  }

  document.getElementById(
    "contentModal"
  ).style.display = "block";

}


function clearContentForm() {

  document.getElementById("contentForm").reset();

  document.getElementById("contentSortOrder").value = "0";

  document.getElementById(
    "currentContentImage"
  ).innerHTML = "";

}



/* =========================================================
   SAVE CONTENT
========================================================= */

async function saveContent(event) {

  event.preventDefault();


  const type =
    document.getElementById("contentType").value;


  const name =
    

document.getElementById("contentName").value.trim();


  const slug =
    document.getElementById("contentSlug").value.trim();


  const description =
    document.getElementById("contentDescription").value.trim();


  const imageUrl =
    document.getElementById("contentImageUrl").value.trim();


  const pageUrl =

    document.getElementById("contentPageUrl").value.trim();


  const sortOrder =
    Number(
      document.getElementById("contentSortOrder").value
    ) || 0;


  const button =
    document.getElementById("saveContentBtn");


  button.disabled = true;
  button.textContent = "Saving...";


  try {

    const table =
      type === "destination"
        ? "destinations"
        : "tours";


    const payload =
      type === "destination"
        ? {
            name,
            slug,
            description: description || null,
            image_url: imageUrl || null,
            page_url: pageUrl || null,
            sort_order: sortOrder
          }
        : {
            title: name,
            slug,

            description: description || null,
            image_url: imageUrl || null,
            page_url: pageUrl || null,
            sort_order: sortOrder
          };


    let error;


    if (
      type === "destination" &&
      editingDestinationId
    ) {

      ({
        error
      } = await supabase
        .from(table)
        .update(payload)
        .eq("id", editingDestinationId));

    } else if (
      type === "tour" &&
      editingTourId
    ) {

      ({
        error
      } = await supabase
        .from(table)
        .update(payload)
        .eq("id", editingTourId));

    } else {

      ({
        error
      } = await supabase
        .from(table)
        .insert(payload));

    }


    if (error) {
      throw error;
    }


    closeContentModal();


    if (type === "destination") {

      await loadDestinationsAdmin();

    } else {

      await loadToursAdmin();

    }


    await loadDashboard();


    alert(
      type === "destination"
        ? "Destination saved successfully."
        : "Tour saved successfully."
    );

  } catch (error) {

    console.error(error);

    alert(
      "Save failed:\n\n" +
      getReadableError(error)
    );

  } finally {

    button.disabled = false;
    button.textContent = "Save";

  }

}


/* =========================================================
   DELETE DESTINATION
========================================================= */

async function deleteDestination(id) {

  if (
    !confirm(
      "Delete this destination?\n\n" +
      "Its destination locations may also be deleted " +
      "depending on your database foreign key settings."
    )
  ) {
    return;

  }


  const {
    error
  } = await supabase
    .from("destinations")
    .delete()
    .eq("id", id);


  if (error) {

    alert(
      "Delete failed:\n\n" +
      getReadableError(error)
    );

    return;

  }


  await loadDestinationsAdmin();

  await loadDashboard();

}


/* =========================================================
   DELETE TOUR
========================================================= */

async function deleteTour(id) {

  if (
    !confirm(
      "Delete this tour?\n\n" +
      "All gallery database records belonging to this " +

      "tour will also be deleted."
    )
  ) {
    return;
  }


  try {

    /*
      First get gallery files so we can remove the
      physical Storage objects too.
    */

    const {
      data: galleryRows,
      error: galleryError
    } = await supabase
      .from("tour_gallery")
      .select("id,image_path")
      .eq("tour_id", id);



    if (galleryError) {

      /*
        If the table does not exist yet, this will fail.
        In that situation we stop rather than deleting
        the tour unexpectedly.
      */

      throw galleryError;

    }


    const paths =
      (galleryRows || [])
        .map(item => item.image_path)
        .filter(Boolean);

    if (paths.length > 0) {

      const {
        error: storageError
      } = await supabase
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

    } = await supabase
      .from("tours")
      .delete()
      .eq("id", id);


    if (error) {
      throw error;
    }


    await loadToursAdmin();

    await loadDashboard();


    alert("Tour deleted successfully.");

  } catch (error) {

    console.error(error);

    alert(
      "Delete failed:\n\n" +
      getReadableError(error)
    );

  }

}


/* =========================================================
   LOCATION LIST
========================================================= */

async function loadLocationsAdmin() {

  const container =
    document.getElementById("locationsList");


  if (!container) return;

  container.innerHTML =
    loadingHTML("Loading locations...");


  const {
    data,
    error
  } = await supabase
    .from("destination_locations")
    .select(`
      *,
      destinations (
        id,
        name
      )
    `)
    .order("destination_id", {
      ascending: true
    })

    .order("sort_order", {
      ascending: true
    });


  if (error) {

    container.innerHTML =
      errorHTML(getReadableError(error));

    return;

  }


  if (!data || data.length === 0) {

    container.innerHTML =
      emptyHTML("No destination locations found.");

    return;


  }


  container.innerHTML =
    data.map(createLocationCard).join("");


  bindLocationActions();

}


function createLocationCard(location) {

  const image =
    location.image_url ||
    "https://placehold.co/600x400?text=Location";


  const destinationName =
    location.destinations?.name ||

    "Unknown Destination";


  return `

    <div class="admin-card">

      <img
        class="admin-card-image"
        src="${escapeAttribute(image)}"
        alt="${escapeAttribute(location.name || "")}"
      />


      <div class="admin-card-info">

        <h3>
          ${escapeHTML(location.name || "Unnamed")}
        </h3>

        <p>
          ${escapeHTML(
            truncate(location.description || "", 180)
          )}
        </p>

        <div class="admin-card-meta">

          Destination:
          ${escapeHTML(destinationName)}

          · Location #:
          ${location.location_number ?? "-"}

          · Order:
          ${location.sort_order ?? 0}

        </div>

      </div>


      <div class="admin-card-actions">

        <button
          class="admin-small-btn"
          data-edit-location="${location.id}"
          type="button"
        >
          Edit
        </button>

        <button
          class="admin-danger-btn"
          data-delete-location="${location.id}"
          type="button"
        >
          Delete
        </button>

      </div>

    </div>


  `;

}


function bindLocationActions() {

  document
    .querySelectorAll("[data-edit-location]")
    .forEach((button) => {

      button.addEventListener("click", () => {

        openLocationModal(
          Number(button.dataset.editLocation)
        );

      });

    });


  document
    .querySelectorAll("[data-delete-location]")
    .forEach((button) => {

      button.addEventListener("click", () => {

        deleteLocation(
          Number(button.dataset.deleteLocation)
        );

      });

    });

}


/* =========================================================
   LOCATION MODAL

========================================================= */

async function openLocationModal(id = null) {

  editingLocationId = id;


  document.getElementById(
    "locationModalTitle"
  ).textContent =
    id
      ? "Edit Location"
      : "Add Location";


  await populateDestinationSelect();


  clearLocationForm();


  if (id) {

    const {
      data,
      error
    } = await supabase
      .from("destination_locations")
      .select("*")
      .eq("id", id)
      .single();


    if (error) {

      alert(getReadableError(error));

      return;

    }

    document.getElementById(
      "locationDestinationSelect"
    ).value =
      data.destination_id;


    document.getElementById(
      "locationNumber"
    ).value =
      data.location_number;


    document.getElementById(
      "locationName"
    ).value =
      data.name || "";


    document.getElementById(
      "locationDescription"
    ).value =
      data.description || "";



    document.getElementById(
      "locationImageUrl"
    ).value =
      data.image_url || "";


    document.getElementById(
      "locationImagePath"
    ).value =
      data.image_path || "";


    document.getElementById(
      "locationSortOrder"
    ).value =
      data.sort_order ?? 0;

  }

  document.getElementById(
    "locationModal"
  ).style.display = "block";

}


async function populateDestinationSelect() {

  const select =
    document.getElementById(
      "locationDestinationSelect"
    );


  if (!select) return;


  const {
    data,
    error

  } = await supabase
    .from("destinations")
    .select("id,name")
    .order("sort_order", {
      ascending: true
    });


  if (error) {

    select.innerHTML =
      `<option value="">Unable to load</option>`;

    return;

  }


  select.innerHTML = `
    <option value="">
      Select destination
    </option>

  `;


  (data || []).forEach((destination) => {

    select.insertAdjacentHTML(
      "beforeend",
      `
        <option value="${destination.id}">
          ${escapeHTML(destination.name)}
        </option>
      `
    );

  });


  if (currentLocationDestinationId) {

    select.value =
      currentLocationDestinationId;

  }

}


function clearLocationForm() {

  document
    .getElementById("locationForm")
    .reset();

  document
    .getElementById("locationNumber")
    .value = "1";

  document
    .getElementById("locationSortOrder")
    .value = "0";

}

/* =========================================================
   SAVE LOCATION
========================================================= */

async function saveLocation(event) {

  event.preventDefault();


  const destinationId =
    Number(
      document.getElementById(
        "locationDestinationSelect"
      ).value
    );


  const locationNumber =
    Number(

      document.getElementById(
        "locationNumber"
      ).value
    );


  const name =
    document.getElementById(
      "locationName"
    ).value.trim();


  const description =
    document.getElementById(
      "locationDescription"
    ).value.trim();


  const imageUrl =
    document.getElementById(
      "locationImageUrl"
    ).value.trim();



  const imagePath =
    document.getElementById(
      "locationImagePath"
    ).value.trim();


  const sortOrder =
    Number(
      document.getElementById(
        "locationSortOrder"
      ).value
    ) || 0;


  if (!destinationId) {

    alert("Please select a destination.");

    return;

  }



  const button =
    document.getElementById(
      "saveLocationBtn"
    );


  button.disabled = true;
  button.textContent = "Saving...";


  try {

    const payload = {

      destination_id: destinationId,

      location_number: locationNumber,

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


    let error;


    if (editingLocationId) {

      ({
        error

      } = await supabase
        .from("destination_locations")
        .update(payload)
        .eq("id", editingLocationId));

    } else {

      ({
        error
      } = await supabase
        .from("destination_locations")
        .insert(payload));

    }


    if (error) {
      throw error;
    }


    closeLocationModal();


    await loadLocationsAdmin();

    await loadDashboard();


    alert("Location saved successfully.");

  } catch (error) {

    alert(
      "Save failed:\n\n" +
      getReadableError(error)
    );

  } finally {

    button.disabled = false;
    button.textContent = "Save";

  }

}


/* =========================================================
   DELETE LOCATION
========================================================= */

async function deleteLocation(id) {

  if (
    !confirm(
      "Delete this destination location?"
    )
  ) {
    return;
  }


  const {

    error
  } = await supabase
    .from("destination_locations")
    .delete()
    .eq("id", id);


  if (error) {

    alert(
      "Delete failed:\n\n" +
      getReadableError(error)
    );

    return;

  }


  await loadLocationsAdmin();

  await loadDashboard();

}


/* =========================================================
   REVIEWS
========================================================= */

async function loadReviewsAdmin() {

  const container =
    document.getElementById("reviewsList");

  if (!container) return;

  container.innerHTML =
    loadingHTML("Loading reviews...");


  const {

    data,
    error
  } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", {
      ascending: false
    });


  if (error) {

    container.innerHTML =
      errorHTML(getReadableError(error));

    return;

  }


  if (!data || data.length === 0) {

    container.innerHTML =
      emptyHTML("No reviews found.");

    return;

  }


  container.innerHTML =
    data.map(createReviewCard).join("");


  document
    .querySelectorAll("[data-delete-review]")
    .forEach((button) => {

      button.addEventListener("click", () => {

        deleteReview(
          button.dataset.deleteReview
        );

      });

    });

}


function createReviewCard(review) {

  const stars =
    "★".repeat(
      Math.max(
        0,
        Math.min(5, Number(review.rating) || 0)
      )
    );


  return `

    <div class="admin-card admin-review-

card">

      ${
        review.photo_url
          ? `
            <img
              class="admin-review-photo"
              src="${escapeAttribute(review.photo_url)}"
              alt="${escapeAttribute(review.name || "")}"
            />
          `
          : ""
      }


      <div class="admin-card-info">

        <h3>
          ${escapeHTML(review.name || "Anonymous")}
        </h3>


        <div class="admin-review-rating">
          ${stars}
        </div>

        <p>
          ${escapeHTML(review.review || "")}
        </p>

        <div class="admin-card-meta">

          ${escapeHTML(review.country || "")}

          ·

          ${formatDate(review.created_at)}

        </div>

      </div>

      <div class="admin-card-actions">

        <button
          class="admin-danger-btn"
          data-delete-review="${escapeAttribute(review.id)}"
          type="button"
        >
          Delete
        </button>

      </div>

    </div>

  `;

}


async function deleteReview(id) {

  if (
    !confirm(
      "Delete this review?"
    )
  ) {
    return;
  }


  const {
    data: review
  } = await supabase
    .from("reviews")
    .select("photo_path")
    .eq("id", id)
    .maybeSingle();


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
        "Review photo cleanup failed:",
        storageError
      );

    }

  }


  const {
    error

  } = await supabase
    .from("reviews")
    .delete()
    .eq("id", id);


  if (error) {

    alert(
      "Delete failed:\n\n" +
      getReadableError(error)
    );

    return;

  }


  await loadReviewsAdmin();

  await loadDashboard();

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


  document.getElementById(

    "galleryTourTitle"
  ).textContent =
    currentGalleryTourTitle;


  document.getElementById(
    "galleryModal"
  ).style.display = "block";


  document.getElementById(
    "galleryFileInput"
  ).value = "";


  document.getElementById(
    "galleryUploadStatus"
  ).textContent = "";


  await loadTourGallery();

}


/* =========================================================
   LOAD TOUR GALLERY
========================================================= */

async function loadTourGallery() {

  const container =
    document.getElementById(
      "galleryPreview"
    );


  if (!container || !currentGalleryTourId) {
    return;
  }


  container.innerHTML =
    loadingHTML("Loading gallery...");


  const {
    data,
    error
  } = await supabase
    .from("tour_gallery")
    .select(`
      id,
      tour_id,
      image_path,
      image_url,
      sort_order,
      created_at,
      updated_at
    `)
    .eq(
      "tour_id",
      currentGalleryTourId

    )
    .order("sort_order", {
      ascending: true
    })
    .order("created_at", {
      ascending: true
    });


  if (error) {

    console.error(error);

    container.innerHTML =
      errorHTML(
        getReadableError(error)
      );

    return;

  }


  if (!data || data.length === 0) {

    container.innerHTML = `
      <div class="gallery-empty">

        <div style="font-size:32px;">
          📷
        </div>

        <p>
          No gallery images yet.
        </p>

        <small>
          Select images above and upload them.
        </small>

      </div>
    `;

    return;


  }


  container.innerHTML =
    data.map(
      createGalleryAdminItem
    ).join("");


  bindGalleryDeleteActions();

}


/* =========================================================
   GALLERY ITEM
========================================================= */

function createGalleryAdminItem(
  image,
  index
) {

  const imageUrl =
    image.image_url ||
    getTourGalleryPublicUrl(
      image.image_path
    );


  return `

    <div
      class="gallery-admin-item"
      data-gallery-item="${image.id}"
    >

      <div class="gallery-admin-image-wrap">

        <img

          src="${escapeAttribute(imageUrl)}"
          alt="Tour gallery image ${index + 1}"
          loading="lazy"
        />

        <span class="gallery-admin-number">
          #${index + 1}
        </span>

      </div>


      <div class="gallery-admin-item-bottom">

        <small>
          Order ${image.sort_order ?? index}
        </small>


        <button
          class="gallery-delete-btn"
          data-delete-gallery="${image.id}"

          data-gallery-path="${escapeAttribute(
            image.image_path || ""
          )}"
          type="button"
        >
          Delete
        </button>

      </div>

    </div>

  `;

}


/* =========================================================
   GALLERY DELETE BIND
===================================

====================== */

function bindGalleryDeleteActions() {

  document
    .querySelectorAll("[data-delete-gallery]")
    .forEach((button) => {

      button.addEventListener(
        "click",
        async () => {

          const id =
            Number(
              button.dataset.deleteGallery
            );


          const path =
            button.dataset.galleryPath || "";

          await deleteGalleryImage(
            id,
            path
          );

        }
      );

    });

}


/* =========================================================
   UPLOAD PREVIEW
========================================================= */

function previewSelectedGalleryFiles() {

  const input =

    document.getElementById(
      "galleryFileInput"
    );


  const status =
    document.getElementById(
      "galleryUploadStatus"
    );


  const files =
    Array.from(input.files || []);


  if (!files.length) {

    status.textContent = "";

    return;

  }



  const invalid =
    files.filter(
      file =>
        !isValidGalleryFile(file)
    );


  if (invalid.length) {

    status.textContent =
      `${invalid.length} invalid file(s). ` +
      "Only JPG, PNG, WEBP and GIF up to 5MB are allowed.";

    status.style.color = "#c53d3d";

    return;

  }


  status.textContent =
    `${files.length} image(s) selected. Ready to upload.`;

  status.style.color = "#1e5c3f";

}


/* =========================================================
   VALIDATE GALLERY FILE
========================================================= */

function isValidGalleryFile(file) {

  const allowedTypes = [
    "image/jpeg",
    "image/png",

    "image/webp",
    "image/gif"
  ];


  const maxSize =
    5 * 1024 * 1024;


  return (
    allowedTypes.includes(file.type) &&
    file.size <= maxSize
  );

}


/* =========================================================
   UPLOAD GALLERY IMAGES
===================================

====================== */

async function uploadGalleryImages() {

  if (!currentGalleryTourId) {

    alert("No tour selected.");

    return;

  }


  const input =
    document.getElementById(
      "galleryFileInput"
    );


  const status =
    document.getElementById(
      "galleryUploadStatus"
    );



  const button =
    document.getElementById(
      "uploadGalleryBtn"
    );


  const files =
    Array.from(input.files || []);


  if (!files.length) {

    alert(
      "Please select at least one image."
    );

    return;

  }


  const invalidFiles =
    files.filter(
      file =>
        !isValidGalleryFile(file)
    );


  if (invalidFiles.length > 0) {

    alert(
      "Some files are invalid.\n\n" +
      "Allowed: JPG, PNG, WEBP, GIF\n" +
      "Maximum: 5MB per image."
    );

    return;

  }


  button.disabled = true;


  input.disabled = true;

  status.textContent =
    "Preparing upload...";


  try {

    const {
      data: existingRows,
      error: existingError
    } = await supabase
      .from("tour_gallery")
      .select("sort_order")
      .eq(
        "tour_id",
        currentGalleryTourId
      )
      .order("sort_order", {
        ascending: false
      })

      .limit(1);


    if (existingError) {
      throw existingError;
    }


    let nextSortOrder =
      existingRows?.length
        ? Number(
            existingRows[0].sort_order
          ) + 1
        : 0;


    let uploadedCount = 0;


    for (const file of files) {

      uploadedCount++;



      status.textContent =
        `Uploading ${uploadedCount} of ${files.length}...`;


      const extension =
        getFileExtension(file);


      const randomPart =
        crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()
              .toString(36)
              .slice(2)}`;


      const storagePath =
        `tours/${currentGalleryTourId}/${Date.now()}-${randomPart}.${extension}`;



      /*
        Upload to Supabase Storage
      */

      const {
        error: uploadError
      } = await supabase
        .storage
        .from("tour-gallery")
        .upload(
          storagePath,
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


      const publicUrl =
        getTourGalleryPublicUrl(
          storagePath
        );


      /*
        Insert DB record
      */

      const {
        error: insertError
      } = await supabase
        .from("tour_gallery")
        .insert({
          tour_id:
            currentGalleryTourId,

          image_path:
            storagePath,

          image_url:
            publicUrl,

          sort_order:
            nextSortOrder
        });


      if (insertError) {

        /*
          Important:
          If DB insertion fails after storage upload,
          remove the uploaded Storage file.
        */

        await supabase
          .storage

          .from("tour-gallery")
          .remove([
            storagePath
          ]);


        throw insertError;

      }


      nextSortOrder++;

    }


    status.textContent =
      `${uploadedCount} image(s) uploaded successfully.`;

    status.style.color =
      "#1e5c3f";



    input.value = "";


    await loadTourGallery();

    await loadDashboard();


  } catch (error) {

    console.error(
      "Gallery upload error:",
      error
    );


    status.textContent =
      "Upload failed.";

    status.style.color =

      "#c53d3d";


    alert(
      "Gallery upload failed:\n\n" +
      getReadableError(error)
    );

  } finally {

    button.disabled = false;

    input.disabled = false;

  }

}


/* =========================================================
   DELETE GALLERY IMAGE

========================================================= */

async function deleteGalleryImage(
  id,
  imagePath
) {

  if (
    !confirm(
      "Delete this gallery image?"
    )
  ) {
    return;

  }


  try {

    /*
      Delete database row first.

    */

    const {
      error: dbError
    } = await supabase
      .from("tour_gallery")
      .delete()
      .eq("id", id);


    if (dbError) {
      throw dbError;
    }


    /*
      Delete physical Storage object.
    */

    if (imagePath) {

      const {

        error: storageError
      } = await supabase
        .storage
        .from("tour-gallery")
        .remove([
          imagePath
        ]);


      if (storageError) {

        console.warn(
          "Storage delete failed:",
          storageError
        );

      }

    }


    await loadTourGallery();


    await loadDashboard();


  } catch (error) {

    console.error(error);

    alert(
      "Gallery image delete failed:\n\n" +
      getReadableError(error)
    );

  }

}


/* =========================================================
   GALLERY PUBLIC URL

========================================================= */

function getTourGalleryPublicUrl(
  path
) {

  if (!path) {
    return "";
  }


  const {
    data
  } = supabase
    .storage
    .from("tour-gallery")
    .getPublicUrl(path);


  return data?.publicUrl || "";

}


/* =========================================================
   FILE EXTENSION
========================================================= */

function getFileExtension(file) {

  const originalName =
    file.name || "";


  const parts =
    originalName
      .split(".");


  if (parts.length > 1) {

    return parts
      .pop()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  }


  if (file.type === "image/jpeg") {
    return "jpg";
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  if (file.type === "image/gif") {
    return "gif";

  }


  return "jpg";

}


/* =========================================================
   CLOSE MODALS
========================================================= */

function closeContentModal() {

  document.getElementById(
    "contentModal"
  ).style.display = "none";

  editingDestinationId = null;

  editingTourId = null;

}


function closeLocationModal() {

  document.getElementById(
    "locationModal"
  ).style.display = "none";


  editingLocationId = null;

}


function closeGalleryModal() {

  document.getElementById(

    "galleryModal"
  ).style.display = "none";


  currentGalleryTourId = null;

  currentGalleryTourTitle = "";

}


/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

  const confirmed =
    confirm(

      "Are you sure you want to logout?"
    );


  if (!confirmed) {
    return;
  }


  const {
    error
  } = await supabase.auth.signOut();


  if (error) {

    alert(
      "Logout failed:\n\n" +
      getReadableError(error)
    );

    return;


  }


  window.location.href =
    "admin.html";

}


/* =========================================================
   HELPERS
========================================================= */

function setText(
  id,
  value
) {

  const element =

    document.getElementById(id);


  if (element) {
    element.textContent = String(value);
  }

}


function loadingHTML(
  text = "Loading..."
) {

  return `

    <div
      style="
        padding:35px;
        text-align:center;
        color:#718078;
      "

    >
      ${escapeHTML(text)}
    </div>

  `;

}


function emptyHTML(
  text
) {

  return `

    <div
      style="
        padding:40px;
        text-align:center;
        background:white;
        border:1px dashed #cbd8ce;
        border-radius:12px;

        color:#718078;
      "
    >
      ${escapeHTML(text)}
    </div>

  `;

}


function errorHTML(
  text
) {

  return `

    <div
      style="
        padding:25px;
        text-align:center;
        background:#fff4f4;

        border:1px solid #efcaca;
        border-radius:12px;
        color:#a12e2e;
      "
    >
      ${escapeHTML(text)}
    </div>

  `;

}


function truncate(
  text,
  maxLength = 150
) {

  if (!text) {
    return "";
  }


  if (text.length <= maxLength) {
    return text;
  }


  return (
    text.slice(0, maxLength).trim() +
    "..."
  );

}


function escapeHTML(
  value
) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}


function escapeAttribute(
  value
) {

  return escapeHTML(value);

}


function formatDate(
  value
) {

  if (!value) {
    return "-";
  }


  try {

    return new Date(value)
      .toLocaleDateString(
        undefined,
        {
          year: "numeric",
          month: "short",
          day: "numeric"
        }
      );

  } catch {

    return value;

  }

}

function getReadableError(
  error
) {

  if (!error) {
    return "Unknown error";
  }


  if (
    typeof error === "string"
  ) {
    return error;
  }


  return (
    error.message ||
    error.error_description ||
    error.details ||
    error.hint ||
    "Unknown error"

  );

}
