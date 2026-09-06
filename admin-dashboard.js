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

const supabase =
  createClient(
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
   START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  startAdmin
);


/* =========================================================
   SESSION
========================================================= */

async function checkSession() {

  const {
    data,
    error
  } = await supabase.auth.getSession();


  if (error) {
    throw error;
  }


  if (!data?.session) {

    window.location.replace(
      "admin.html"
    );

    return false;

  }


  return true;

}


/* =========================================================
   DASHBOARD
========================================================= */

async function startAdmin() {

  try {

    const loggedIn =
      await checkSession();


    if (!loggedIn) {
      return;
    }


    createDashboard();

    setupEvents();

    await Promise.all([
      loadDestinations(),
      loadTours()
    ]);


  } catch (error) {

    console.error(
      "Admin start error:",
      error
    );

    showError(
      error?.message ||
      "Unable to load administrator dashboard."
    );

  }

}


/* =========================================================
   DASHBOARD HTML
========================================================= */

function createDashboard() {

  document.body.innerHTML = `

    <div class="adminWrapper">

      <header class="adminHeader">

        <div class="brand">
          <div class="brandMark">TWS</div>

          <div>
            <h1>Travel With Sri Lanka</h1>
            <p>Website Content Management</p>
          </div>
        </div>

        <div class="headerActions">

          <a
            href="index.html"
            target="_blank"
            class="viewBtn"
          >
            View Website ↗
          </a>

          <button
            id="logoutBtn"
            class="logoutBtn"
          >
            Logout
          </button>

        </div>

      </header>


      <div
        id="message"
        class="message"
      ></div>


      <!-- DESTINATIONS -->

      <section class="adminSection">

        <div class="sectionHeader">

          <div>
            <span class="sectionTag">
              WEBSITE CONTENT
            </span>

            <h2>Destinations</h2>

            <p>
              Add, edit, delete and update destination photos.
            </p>
          </div>

          <button
            id="addDestinationBtn"
            class="primaryBtn"
          >
            + Add Destination
          </button>

        </div>

        <div
          id="destinationsList"
          class="contentGrid"
        >
          <p>Loading destinations...</p>
        </div>

      </section>


      <!-- TOURS -->

      <section class="adminSection">

        <div class="sectionHeader">

          <div>
            <span class="sectionTag">
              WEBSITE CONTENT
            </span>

            <h2>Tours</h2>

            <p>
              Add, edit, delete and update tour information.
            </p>
          </div>

          <button
            id="addTourBtn"
            class="primaryBtn"
          >
            + Add Tour
          </button>

        </div>

        <div
          id="toursList"
          class="contentGrid"
        >
          <p>Loading tours...</p>
        </div>

      </section>


      <!-- REVIEWS -->

      <section class="adminSection">

        <div class="sectionHeader">

          <div>
            <span class="sectionTag">
              CUSTOMER CONTENT
            </span>

            <h2>Traveler Reviews</h2>

            <p>
              Customer reviews submitted from the website.
            </p>
          </div>

          <button
            id="refreshReviewsBtn"
            class="secondaryBtn"
          >
            ↻ Refresh
          </button>

        </div>

        <div
          id="reviewsList"
          class="reviewAdminGrid"
        >
          <p>Loading reviews...</p>
        </div>

      </section>


      <!-- MODAL -->

      <div
        id="contentModal"
        class="modal"
      >

        <div class="modalBox">

          <button
            id="closeModal"
            class="closeBtn"
            type="button"
          >
            ×
          </button>

          <span class="sectionTag">
            CONTENT EDITOR
          </span>

          <h2 id="modalTitle">
            Add Content
          </h2>


          <form id="contentForm">

            <input
              type="hidden"
              id="contentId"
            >

            <input
              type="hidden"
              id="contentType"
            >

            <label for="contentName">
              Name / Title
            </label>

            <input
              type="text"
              id="contentName"
              required
              maxlength="150"
            >


            <label for="contentSlug">
              Slug
            </label>

            <input
              type="text"
              id="contentSlug"
              required
              maxlength="100"
              placeholder="ella"
            >


            <label for="contentDescription">
              Description
            </label>

            <textarea
              id="contentDescription"
              rows="5"
              maxlength="1000"
            ></textarea>


            <label for="contentPageUrl">
              Page URL
            </label>

            <input
              type="text"
              id="contentPageUrl"
              placeholder="ella.html"
            >


            <label>
              Current Image
            </label>

            <div
              id="currentImage"
              class="currentImage"
            >
              <p>No image selected.</p>
            </div>


            <label for="contentImage">
              Upload New Image
            </label>

            <input
              type="file"
              id="contentImage"
              accept="image/jpeg,image/png,image/webp,image/gif"
            >

            <small class="uploadHelp">
              Maximum recommended size: 5 MB
            </small>


            <label for="contentSortOrder">
              Sort Order
            </label>

            <input
              type="number"
              id="contentSortOrder"
              value="1"
              min="0"
              max="999"
            >


            <button
              type="submit"
              class="saveBtn"
            >
              Save Changes
            </button>

          </form>

        </div>

      </div>

    </div>


    <style>

      * {
        box-sizing:border-box;
      }

      body {
        margin:0;
        font-family:
          Arial,
          Helvetica,
          sans-serif;
        background:#f4f7f5;
        color:#17221d;
      }

      button,
      input,
      textarea {
        font:inherit;
      }

      button {
        cursor:pointer;
      }

      .adminWrapper {
        max-width:1250px;
        margin:auto;
        padding:25px 20px 80px;
      }

      .adminHeader {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:20px;
        padding:22px 25px;
        margin-bottom:25px;
        background:#10251d;
        color:white;
        border-radius:16px;
        box-shadow:
          0 15px 45px rgba(16,37,29,.15);
      }

      .brand {
        display:flex;
        align-items:center;
        gap:14px;
      }

      .brandMark {
        width:52px;
        height:52px;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:50%;
        background:#c9a85b;
        color:#10251d;
        font-weight:900;
        font-size:13px;
      }

      .adminHeader h1 {
        margin:0 0 4px;
        font-family:Georgia,serif;
        font-size:22px;
      }

      .adminHeader p {
        margin:0;
        color:#b8c5bd;
        font-size:12px;
      }

      .headerActions {
        display:flex;
        gap:9px;
        align-items:center;
      }

      .viewBtn,
      .logoutBtn {
        padding:10px 15px;
        border-radius:7px;
        font-size:12px;
        font-weight:bold;
      }

      .viewBtn {
        background:#c9a85b;
        color:#10251d;
        text-decoration:none;
      }

      .logoutBtn {
        border:1px solid rgba(255,255,255,.15);
        background:#1c3027;
        color:white;
      }

      .adminSection {
        margin-bottom:28px;
        padding:28px;
        background:white;
        border:1px solid #e0e7e3;
        border-radius:15px;
        box-shadow:
          0 8px 30px rgba(16,37,29,.05);
      }

      .sectionHeader {
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:20px;
        margin-bottom:25px;
      }

      .sectionTag {
        display:block;
        margin-bottom:6px;
        color:#b08c3b;
        font-size:9px;
        font-weight:900;
        letter-spacing:2px;
      }

      .sectionHeader h2 {
        margin:0 0 5px;
        font-family:Georgia,serif;
        font-size:27px;
      }

      .sectionHeader p {
        margin:0;
        color:#718078;
        font-size:12px;
      }

      .primaryBtn,
      .secondaryBtn {
        padding:12px 17px;
        border-radius:7px;
        font-size:12px;
        font-weight:800;
        white-space:nowrap;
      }

      .primaryBtn {
        border:0;
        background:#176b4d;
        color:white;
      }

      .secondaryBtn {
        border:1px solid #d7dfda;
        background:white;
        color:#176b4d;
      }

      .contentGrid {
        display:grid;
        grid-template-columns:
          repeat(auto-fit,minmax(280px,1fr));
        gap:20px;
      }

      .contentCard {
        overflow:hidden;
        border:1px solid #e1e7e3;
        border-radius:11px;
        background:white;
      }

      .contentImage {
        width:100%;
        height:190px;
        display:block;
        object-fit:cover;
        background:#e9eeeb;
      }

      .contentBody {
        padding:18px;
      }

      .contentBody h3 {
        margin:0 0 7px;
        font-family:Georgia,serif;
        font-size:20px;
      }

      .slug {
        color:#9a7740;
        font-size:10px;
        font-weight:bold;
      }

      .contentBody p {
        min-height:60px;
        margin:12px 0;
        color:#68736d;
        font-size:12px;
        line-height:1.7;
      }

      .cardActions {
        display:flex;
        gap:8px;
      }

      .editBtn,
      .deleteBtn {
        flex:1;
        padding:10px;
        border:0;
        border-radius:6px;
        color:white;
        font-size:11px;
        font-weight:bold;
      }

      .editBtn {
        background:#176b4d;
      }

      .deleteBtn {
        background:#b73b31;
      }

      .message {
        display:none;
        margin-bottom:20px;
        padding:13px 16px;
        border-radius:8px;
        background:#e7f5ed;
        color:#176b4d;
        font-size:13px;
        font-weight:bold;
      }

      .reviewAdminGrid {
        display:grid;
        grid-template-columns:
          repeat(auto-fit,minmax(280px,1fr));
        gap:18px;
      }

      .reviewAdminCard {
        overflow:hidden;
        border:1px solid #e1e7e3;
        border-radius:10px;
        background:#fafbf9;
      }

      .reviewAdminPhoto {
        width:100%;
        height:180px;
        object-fit:cover;
      }

      .reviewAdminBody {
        padding:18px;
      }

      .reviewAdminStars {
        margin-bottom:8px;
        color:#c9a85b;
        letter-spacing:2px;
      }

      .reviewAdminText {
        margin:0 0 15px;
        color:#59645e;
        font-size:12px;
        line-height:1.7;
      }

      .reviewAdminAuthor {
        padding-top:12px;
        border-top:1px solid #e2e5e2;
      }

      .reviewAdminAuthor strong {
        display:block;
        font-size:12px;
      }

      .reviewAdminAuthor span {
        color:#89928d;
        font-size:10px;
      }

      .modal {
        display:none;
        position:fixed;
        inset:0;
        z-index:9999;
        padding:20px;
        overflow-y:auto;
        background:rgba(0,0,0,.62);
      }

      .modalBox {
        position:relative;
        width:100%;
        max-width:620px;
        margin:30px auto;
        padding:30px;
        border-radius:15px;
        background:white;
        box-shadow:
          0 30px 80px rgba(0,0,0,.2);
      }

      .closeBtn {
        position:absolute;
        top:12px;
        right:12px;
        width:35px;
        height:35px;
        border:0;
        border-radius:50%;
        background:#eef1ef;
        color:#333;
        font-size:24px;
      }

      .modalBox h2 {
        margin:0 0 25px;
        font-family:Georgia,serif;
      }

      .modalBox label {
        display:block;
        margin:17px 0 7px;
        font-size:12px;
        font-weight:800;
      }

      .modalBox input,
      .modalBox textarea {
        width:100%;
        padding:12px;
        border:1px solid #d8dfdb;
        border-radius:7px;
        outline:none;
      }

      .modalBox input:focus,
      .modalBox textarea:focus {
        border-color:#176b4d;
      }

      .currentImage img {
        width:100%;
        max-height:230px;
        object-fit:cover;
        border-radius:8px;
      }

      .uploadHelp {
        display:block;
        margin-top:5px;
        color:#89928d;
        font-size:10px;
      }

      .saveBtn {
        width:100%;
        margin-top:25px;
        padding:14px;
        border:0;
        border-radius:7px;
        background:#176b4d;
        color:white;
        font-weight:bold;
      }

      .saveBtn:disabled {
        opacity:.6;
      }

      @media(max-width:700px) {

        .adminWrapper {
          padding:12px 10px 50px;
        }

        .adminHeader {
          align-items:stretch;
          flex-direction:column;
        }

        .headerActions {
          width:100%;
        }

        .viewBtn,
        .logoutBtn {
          flex:1;
          text-align:center;
        }

        .sectionHeader {
          align-items:stretch;
          flex-direction:column;
        }

        .primaryBtn,
        .secondaryBtn {
          width:100%;
        }

        .adminSection {
          padding:20px 16px;
        }

      }

    </style>
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
    "<p>Loading destinations...</p>";


  try {

    const {
      data,
      error
    } = await supabase
      .from("destinations")
      .select("*")
      .order(
        "sort_order",
        {
          ascending:true
        }
      );


    if (error) {
      throw error;
    }


    if (!data?.length) {

      container.innerHTML =
        "<p>No destinations found.</p>";

      return;
    }


    container.innerHTML = "";


    data.forEach(
      destination => {

        const card =
          createContentCard(
            destination,
            "destination"
          );

        container.appendChild(card);

      }
    );


  } catch (error) {

    console.error(error);

    container.innerHTML = `
      <p>
        Failed to load destinations.
        <br><br>
        ${escapeHTML(error.message)}
      </p>
    `;

  }

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
    "<p>Loading tours...</p>";


  try {

    const {
      data,
      error
    } = await supabase
      .from("tours")
      .select("*")
      .order(
        "sort_order",
        {
          ascending:true
        }
      );


    if (error) {
      throw error;
    }


    if (!data?.length) {

      container.innerHTML =
        "<p>No tours found.</p>";

      return;
    }


    container.innerHTML = "";


    data.forEach(
      tour => {

        const card =
          createContentCard(
            tour,
            "tour"
          );

        container.appendChild(card);

      }
    );


  } catch (error) {

    console.error(error);

    container.innerHTML = `
      <p>
        Failed to load tours.
        <br><br>
        ${escapeHTML(error.message)}
      </p>
    `;

  }

}


/* =========================================================
   CONTENT CARD
========================================================= */

function createContentCard(
  item,
  type
) {

  const card =
    document.createElement(
      "div"
    );

  card.className =
    "contentCard";


  const image =
    item.image_url
      ? `<img
          src="${escapeAttribute(item.image_url)}"
          class="contentImage"
          alt="${escapeAttribute(
            type === "tour"
              ? item.title || "Tour"
              : item.name || "Destination"
          )}"
        >`
      : `<div class="contentImage"></div>`;


  const title =
    type === "tour"
      ? item.title
      : item.name;


  card.innerHTML = `

    ${image}

    <div class="contentBody">

      <h3>
        ${escapeHTML(title || "")}
      </h3>

      <span class="slug">
        /${escapeHTML(item.slug || "")}
      </span>

      <p>
        ${escapeHTML(
          item.description || ""
        )}
      </p>

      <div class="cardActions">

        <button
          class="editBtn"
          data-id="${escapeAttribute(item.id)}"
          data-type="${type}"
        >
          Edit
        </button>

        <button
          class="deleteBtn"
          data-id="${escapeAttribute(item.id)}"
          data-type="${type}"
        >
          Delete
        </button>

      </div>

    </div>
  `;


  return card;

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
    "<p>Loading reviews...</p>";


  try {

    const {
      data,
      error
    } = await supabase
      .from("reviews")
      .select(
        "id,name,country,rating,review,photo_path"
      );


    if (error) {
      throw error;
    }


    if (!data?.length) {

      container.innerHTML =
        "<p>No reviews found.</p>";

      return;
    }


    container.innerHTML = "";


    data.forEach(
      review => {

        container.appendChild(
          createAdminReviewCard(
            review
          )
        );

      }
    );


  } catch (error) {

    console.error(
      "Review admin error:",
      error
    );


    container.innerHTML = `
      <p>
        Failed to load reviews.
        <br><br>
        ${escapeHTML(error.message)}
      </p>
    `;

  }

}


/* =========================================================
   REVIEW ADMIN CARD
========================================================= */

function createAdminReviewCard(
  review
) {

  const card =
    document.createElement(
      "article"
    );

  card.className =
    "reviewAdminCard";


  let photoHTML = "";


  if (review.photo_path) {

    const {
      data
    } = supabase
      .storage
      .from("review-photos")
      .getPublicUrl(
        review.photo_path
      );


    if (data?.publicUrl) {

      photoHTML = `
        <img
          class="reviewAdminPhoto"
          src="${escapeAttribute(data.publicUrl)}"
          alt="Traveler photo"
        >
      `;

    }

  }


  const rating =
    Math.max(
      1,
      Math.min(
        5,
        Number(review.rating) || 5
      )
    );


  card.innerHTML = `

    ${photoHTML}

    <div class="reviewAdminBody">

      <div class="reviewAdminStars">
        ${"★".repeat(rating)}
        ${"☆".repeat(5 - rating)}
      </div>

      <p class="reviewAdminText">
        ${escapeHTML(review.review || "")}
      </p>

      <div class="reviewAdminAuthor">

        <strong>
          ${escapeHTML(review.name || "Traveler")}
        </strong>

        <span>
          ${escapeHTML(review.country || "")}
        </span>

      </div>

    </div>
  `;


  return card;

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

  document
    .getElementById(
      "closeModal"
    )
    ?.addEventListener(
      "click",
      closeModal
    );


  document
    .getElementById(
      "contentForm"
    )
    ?.addEventListener(
      "submit",
      saveContent
    );


  document
    .getElementById(
      "addDestinationBtn"
    )
    ?.addEventListener(
      "click",
      () =>
        openAddModal(
          "destination"
        )
    );


  document
    .getElementById(
      "addTourBtn"
    )
    ?.addEventListener(
      "click",
      () =>
        openAddModal(
          "tour"
        )
    );


  document
    .getElementById(
      "refreshReviewsBtn"
    )
    ?.addEventListener(
      "click",
      loadReviews
    );


  document
    .getElementById(
      "logoutBtn"
    )
    ?.addEventListener(
      "click",
      logout
    );


  document.addEventListener(
    "click",
    event => {

      const edit =
        event.target.closest(
          ".editBtn"
        );

      const del =
        event.target.closest(
          ".deleteBtn"
        );


      if (edit) {

        openEditModal(
          edit.dataset.id,
          edit.dataset.type
        );

      }


      if (del) {

        deleteContent(
          del.dataset.id,
          del.dataset.type
        );

      }

    }
  );


  window.addEventListener(
    "click",
    event => {

      const modal =
        document.getElementById(
          "contentModal"
        );


      if (
        event.target === modal
      ) {

        closeModal();

      }

    }
  );

}


/* =========================================================
   ADD MODAL
========================================================= */

function openAddModal(
  type
) {

  const modal =
    document.getElementById(
      "contentModal"
    );

  modal.style.display =
    "block";


  document.getElementById(
    "modalTitle"
  ).textContent =
    type === "destination"
      ? "Add Destination"
      : "Add Tour";


  document.getElementById(
    "contentId"
  ).value = "";


  document.getElementById(
    "contentType"
  ).value =
    type;


  document.getElementById(
    "contentName"
  ).value = "";


  document.getElementById(
    "contentSlug"
  ).value = "";


  document.getElementById(
    "contentDescription"
  ).value = "";


  document.getElementById(
    "contentPageUrl"
  ).value = "";


  document.getElementById(
    "contentSortOrder"
  ).value = "1";


  document.getElementById(
    "contentImage"
  ).value = "";


  document.getElementById(
    "currentImage"
  ).innerHTML =
    "<p>No image selected.</p>";

}


/* =========================================================
   EDIT MODAL
========================================================= */

async function openEditModal(
  id,
  type
) {

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


    document.getElementById(
      "contentModal"
    ).style.display =
      "block";


    document.getElementById(
      "modalTitle"
    ).textContent =
      type === "destination"
        ? "Edit Destination"
        : "Edit Tour";


    document.getElementById(
      "contentId"
    ).value =
      data.id;


    document.getElementById(
      "contentType"
    ).value =
      type;


    document.getElementById(
      "contentName"
    ).value =
      type === "destination"
        ? data.name || ""
        : data.title || "";


    document.getElementById(
      "contentSlug"
    ).value =
      data.slug || "";


    document.getElementById(
      "contentDescription"
    ).value =
      data.description || "";


    document.getElementById(
      "contentPageUrl"
    ).value =
      data.page_url || "";


    document.getElementById(
      "contentSortOrder"
    ).value =
      data.sort_order ?? 0;


    document.getElementById(
      "contentImage"
    ).value = "";


    const currentImage =
      document.getElementById(
        "currentImage"
      );


    if (data.image_url) {

      currentImage.innerHTML = `
        <img
          src="${escapeAttribute(data.image_url)}"
          alt="Current image"
        >
      `;

    } else {

      currentImage.innerHTML =
        "<p>No image uploaded.</p>";

    }


  } catch (error) {

    console.error(error);

    alert(
      "Failed to load content:\n\n" +
      error.message
    );

  }

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModal() {

  const modal =
    document.getElementById(
      "contentModal"
    );

  if (modal) {
    modal.style.display =
      "none";
  }

}


/* =========================================================
   UPLOAD IMAGE
========================================================= */

async function uploadImage(
  file,
  type,
  slug
) {

  if (!file) {
    return null;
  }


  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
  ];


  if (
    !allowedTypes.includes(
      file.type
    )
  ) {

    throw new Error(
      "Please upload JPG, PNG, WEBP or GIF images only."
    );

  }


  if (
    file.size >
    5 * 1024 * 1024
  ) {

    throw new Error(
      "Image must be smaller than 5 MB."
    );

  }


  const extension =
    getSafeExtension(
      file.name
    );


  const safeSlug =
    createSafeSlug(
      slug
    );


  const fileName =
    `${safeSlug || type}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2,8)}.${extension}`;


  const folder =
    type === "destination"
      ? `destinations/${safeSlug}`
      : `tours/${safeSlug}`;


  const filePath =
    `${folder}/${fileName}`;


  const {
    error
  } = await supabase
    .storage
    .from("site-images")
    .upload(
      filePath,
      file,
      {
        cacheControl:"3600",
        upsert:false,
        contentType:file.type
      }
    );


  if (error) {
    throw new Error(
      "Image upload failed: " +
      error.message
    );
  }


  const {
    data
  } = supabase
    .storage
    .from("site-images")
    .getPublicUrl(
      filePath
    );


  return data?.publicUrl || null;

}


/* =========================================================
   SAVE CONTENT
========================================================= */

async function saveContent(
  event
) {

  event.preventDefault();


  const id =
    document.getElementById(
      "contentId"
    ).value.trim();


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


  const file =
    document.getElementById(
      "contentImage"
    ).files?.[0] || null;


  const saveBtn =
    document.querySelector(
      ".saveBtn"
    );


  if (!name || !slug) {

    alert(
      "Name and slug are required."
    );

    return;

  }


  saveBtn.disabled = true;
  saveBtn.textContent =
    "Saving...";


  try {

    let imageUrl = null;


    if (file) {

      imageUrl =
        await uploadImage(
          file,
          type,
          slug
        );

    }


    const table =
      type === "destination"
        ? "destinations"
        : "tours";


    const dataToSave =
      type === "destination"
        ? {
            name,
            slug,
            description,
            image_url:
              imageUrl || undefined,
            page_url:
              pageUrl || null,
            sort_order:
              sortOrder
          }
        : {
            title: name,
            slug,
            description,
            image_url:
              imageUrl || undefined,
            page_url:
              pageUrl || null,
            sort_order:
              sortOrder
          };


    if (!imageUrl) {

      delete dataToSave.image_url;

    }


    if (id) {

      const {
        error
      } = await supabase
        .from(table)
        .update(dataToSave)
        .eq("id", id);


      if (error) {
        throw error;
      }


      showMessage(
        "Content updated successfully."
      );


    } else {

      const {
        error
      } = await supabase
        .from(table)
        .insert(dataToSave);


      if (error) {
        throw error;
      }


      showMessage(
        "Content added successfully."
      );

    }


    closeModal();


    await Promise.all([
      loadDestinations(),
      loadTours()
    ]);


  } catch (error) {

    console.error(
      "Save error:",
      error
    );


    alert(
      "Save failed:\n\n" +
      error.message
    );


  } finally {

    saveBtn.disabled = false;
    saveBtn.textContent =
      "Save Changes";

  }

}


/* =========================================================
   DELETE
========================================================= */

async function deleteContent(
  id,
  type
) {

  const confirmed =
    confirm(
      "Are you sure you want to delete this content?"
    );


  if (!confirmed) {
    return;
  }


  try {

    const table =
      type === "destination"
        ? "destinations"
        : "tours";


    const {
      error
    } = await supabase
      .from(table)
      .delete()
      .eq("id", id);


    if (error) {
      throw error;
    }


    showMessage(
      "Content deleted successfully."
    );


    await Promise.all([
      loadDestinations(),
      loadTours()
    ]);


  } catch (error) {

    console.error(
      "Delete error:",
      error
    );


    alert(
      "Delete failed:\n\n" +
      error.message
    );

  }

}


/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

  try {

    await supabase.auth.signOut();

  } finally {

    window.location.replace(
      "admin.html"
    );

  }

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
  text
) {

  const message =
    document.getElementById(
      "message"
    );


  if (!message) {
    return;
  }


  message.textContent =
    text;

  message.style.display =
    "block";


  setTimeout(
    () => {

      message.style.display =
        "none";

    },
    3500
  );

}


/* =========================================================
   ERROR SCREEN
========================================================= */

function showError(
  message
) {

  document.body.innerHTML = `

    <div style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
      background:#f4f7f5;
      font-family:Arial,Helvetica,sans-serif;
    ">

      <div style="
        width:100%;
        max-width:600px;
        padding:30px;
        background:white;
        border-radius:16px;
        box-shadow:0 15px 50px rgba(0,0,0,.1);
      ">

        <h2 style="
          margin-top:0;
          color:#b73b31;
        ">
          Admin Panel Error
        </h2>

        <p style="
          line-height:1.7;
          color:#555;
          word-break:break-word;
        ">
          ${escapeHTML(message)}
        </p>

        <button
          onclick="window.location.href='admin.html'"
          style="
            border:0;
            background:#176b4d;
            color:white;
            padding:12px 20px;
            border-radius:7px;
            cursor:pointer;
          "
        >
          Back to Login
        </button>

      </div>

    </div>
  `;

}


/* =========================================================
   HELPERS
========================================================= */

function createSafeSlug(
  value
) {

  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

}


function getSafeExtension(
  filename
) {

  const ext =
    String(filename)
      .split(".")
      .pop()
      .toLowerCase();


  return [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif"
  ].includes(ext)
    ? ext
    : "jpg";

}


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


function escapeAttribute(
  value
) {

  return escapeHTML(value);

}
