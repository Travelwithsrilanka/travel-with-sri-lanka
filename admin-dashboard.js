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
  SUPABASE_PUBLISHABLE_KEY
);


/* =========================================================
   CONFIG
========================================================= */

const SITE_IMAGES_BUCKET = "site-images";
const TOUR_GALLERY_BUCKET = "tour-gallery";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
];


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
   HELPERS
========================================================= */

function $(id) {
  return document.getElementById(id);
}


function escapeHtml(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function createRandomId() {
  if (
    typeof crypto !== "undefined" &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return Math.random()
    .toString(36)
    .substring(2, 12);
}


function getFileExtension(filename) {
  const name = String(filename || "");
  const parts = name.split(".");

  if (parts.length < 2) {
    return "jpg";
  }

  return parts
    .pop()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "") || "jpg";
}


function showLoading(message = "Loading...") {
  const loading = $("loading");

  if (!loading) {
    return;
  }

  loading.textContent = message;
  loading.style.display = "flex";
}


function hideLoading() {
  const loading = $("loading");

  if (!loading) {
    return;
  }

  loading.style.display = "none";
}


function showToast(message, type = "success") {
  let toast = $("adminToast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "adminToast";

    toast.style.position = "fixed";
    toast.style.right = "20px";
    toast.style.bottom = "20px";
    toast.style.zIndex = "999999";
    toast.style.padding = "14px 18px";
    toast.style.borderRadius = "12px";
    toast.style.color = "#fff";
    toast.style.fontWeight = "600";
    toast.style.maxWidth = "380px";
    toast.style.boxShadow =
      "0 10px 30px rgba(0,0,0,.2)";

    document.body.appendChild(toast);
  }

  toast.textContent = message;

  toast.style.background =
    type === "error"
      ? "#dc2626"
      : type === "warning"
        ? "#d97706"
        : "#16a34a";

  toast.style.display = "block";

  clearTimeout(toast._timer);

  toast._timer = setTimeout(() => {
    toast.style.display = "none";
  }, 3500);
}


function showError(error) {
  console.error(error);

  const message =
    error?.message ||
    error?.error_description ||
    String(error) ||
    "Something went wrong.";

  showToast(message, "error");
}


function formatDate(value) {
  if (!value) {
    return "";
  }

  try {
    return new Date(value).toLocaleDateString(
      "en-GB",
      {
        year: "numeric",
        month: "short",
        day: "numeric"
      }
    );
  } catch {
    return String(value);
  }
}


/* =========================================================
   IMAGE HELPERS
========================================================= */

function validateImageFile(file) {
  if (!file) {
    return;
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(
      `"${file.name}" is larger than 5 MB.`
    );
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(
      "Only JPG, PNG, WEBP or GIF images are allowed."
    );
  }
}


async function uploadSiteImage(
  file,
  folder,
  recordId
) {
  if (!file) {
    return {
      path: null,
      url: null
    };
  }

  validateImageFile(file);

  const extension =
    getFileExtension(file.name);

  const uniqueName =
    `${Date.now()}-${createRandomId()}.${extension}`;

  const path =
    `${folder}/${recordId}/${uniqueName}`;

  const {
    error
  } = await supabase
    .storage
    .from(SITE_IMAGES_BUCKET)
    .upload(
      path,
      file,
      {
        cacheControl: "3600",
        upsert: false,
        contentType:
          file.type || "image/jpeg"
      }
    );

  if (error) {
    throw error;
  }

  const {
    data
  } = supabase
    .storage
    .from(SITE_IMAGES_BUCKET)
    .getPublicUrl(path);

  return {
    path,
    url: data?.publicUrl || null
  };
}


async function uploadTourGalleryImage(
  file,
  tourId
) {
  if (!file) {
    throw new Error(
      "Please select an image."
    );
  }

  validateImageFile(file);

  const extension =
    getFileExtension(file.name);

  const uniqueName =
    `${Date.now()}-${createRandomId()}.${extension}`;

  const path =
    `tours/${tourId}/${uniqueName}`;

  const {
    error
  } = await supabase
    .storage
    .from(TOUR_GALLERY_BUCKET)
    .upload(
      path,
      file,
      {
        cacheControl: "3600",
        upsert: false,
        contentType:
          file.type || "image/jpeg"
      }
    );

  if (error) {
    throw error;
  }

  const {
    data
  } = supabase
    .storage
    .from(TOUR_GALLERY_BUCKET)
    .getPublicUrl(path);

  return {
    path,
    url: data?.publicUrl || null
  };
}


async function deleteStorageFile(
  bucket,
  path
) {
  if (!path) {
    return;
  }

  const {
    error
  } = await supabase
    .storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.warn(
      "Storage delete warning:",
      error
    );
  }
}


/* =========================================================
   AUTH
========================================================= */

async function checkAuth() {
  try {
    const {
      data,
      error
    } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    if (data?.session) {
      showDashboard();
      return;
    }

    showLogin();
  } catch (error) {
    showError(error);
    showLogin();
  }
}


function showLogin() {
  const login = $("loginScreen");
  const dashboard = $("dashboardScreen");

  if (login) {
    login.style.display = "flex";
  }

  if (dashboard) {
    dashboard.style.display = "none";
  }
}


function showDashboard() {
  const login = $("loginScreen");
  const dashboard = $("dashboardScreen");

  if (login) {
    login.style.display = "none";
  }

  if (dashboard) {
    dashboard.style.display = "block";
  }

  hideLoading();

  loadDashboard();
}


async function handleLogin(event) {
  event.preventDefault();

  const email =
    $("loginEmail")?.value?.trim();

  const password =
    $("loginPassword")?.value;

  if (!email || !password) {
    showToast(
      "Please enter email and password.",
      "warning"
    );

    return;
  }

  try {
    showLoading("Signing in...");

    const {
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    showToast(
      "Login successful."
    );

    showDashboard();

  } catch (error) {
    showError(error);
  } finally {
    hideLoading();
  }
}


async function logout() {
  try {
    await supabase.auth.signOut();

    showToast(
      "Logged out."
    );

    showLogin();

  } catch (error) {
    showError(error);
  }
}


/* =========================================================
   NAVIGATION
========================================================= */

function showSection(section) {
  currentSection = section;

  document
    .querySelectorAll("[data-section]")
    .forEach((element) => {
      element.classList.toggle(
        "active",
        element.dataset.section === section
      );
    });

  document
    .querySelectorAll(".admin-section")
    .forEach((element) => {
      element.style.display =
        element.id === `${section}Section`
          ? "block"
          : "none";
    });

  if (section === "dashboard") {
    loadDashboardStats();
  }

  if (section === "destinations") {
    loadDestinations();
  }

  if (section === "tours") {
    loadTours();
  }

  if (section === "locations") {
    loadLocationDestinations();
  }

  if (section === "reviews") {
    loadReviews();
  }
}


/* =========================================================
   DASHBOARD
========================================================= */

async function loadDashboard() {
  await loadDashboardStats();

  if (
    currentSection &&
    currentSection !== "dashboard"
  ) {
    showSection(currentSection);
  } else {
    showSection("dashboard");
  }
}


async function loadDashboardStats() {
  try {
    const [
      destinations,
      tours,
      reviews
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
        .from("reviews")
        .select("id", {
          count: "exact",
          head: true
        })
    ]);

    if ($("destinationCount")) {
      $("destinationCount").textContent =
        destinations.count || 0;
    }

    if ($("tourCount")) {
      $("tourCount").textContent =
        tours.count || 0;
    }

    if ($("reviewCount")) {
      $("reviewCount").textContent =
        reviews.count || 0;
    }

  } catch (error) {
    console.error(
      "Dashboard stats error:",
      error
    );
  }
}


/* =========================================================
   DESTINATIONS
========================================================= */

async function loadDestinations() {
  const container =
    $("destinationsList") ||
    $("destinationsContainer") ||
    $("adminDestinations");

  if (!container) {
    return;
  }

  container.innerHTML =
    `<div class="admin-loading">Loading destinations...</div>`;

  try {
    const {
      data,
      error
    } = await supabase
      .from("destinations")
      .select("*")
      .order("created_at", {
        ascending: false
      });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      container.innerHTML =
        `<div class="admin-empty">
          No destinations found.
        </div>`;

      return;
    }

    container.innerHTML =
      data
        .map(createDestinationAdminCard)
        .join("");

  } catch (error) {
    container.innerHTML =
      `<div class="admin-error">
        ${escapeHtml(error.message)}
      </div>`;

    showError(error);
  }
}


function createDestinationAdminCard(
  destination
) {
  const image =
    destination.image_url ||
    "https://via.placeholder.com/800x500?text=Destination";

  return `
    <div class="admin-card">

      <img
        class="admin-card-image"
        src="${escapeHtml(image)}"
        alt="${escapeHtml(destination.name)}"
      >

      <div class="admin-card-content">

        <h3>
          ${escapeHtml(destination.name || "Unnamed")}
        </h3>

        ${
          destination.description
            ? `<p>${escapeHtml(destination.description)}</p>`
            : ""
        }

        <div class="admin-card-actions">

          <button
            type="button"
            class="btn btn-primary"
            onclick="editDestinationById('${destination.id}')"
          >
            Edit
          </button>

          <button
            type="button"
            class="btn btn-danger"
            onclick="deleteDestinationById('${destination.id}')"
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  `;
}


function openDestinationModal(
  destination = null
) {
  editingDestinationId =
    destination?.id || null;

  const modal =
    $("destinationModal");

  const form =
    $("destinationForm");

  if (!modal || !form) {
    return;
  }

  form.reset();

  if ($("destinationName")) {
    $("destinationName").value =
      destination?.name || "";
  }

  if ($("destinationDescription")) {
    $("destinationDescription").value =
      destination?.description || "";
  }

  /*
    page_url is NOT an image URL.
    Keep it because it can be used as the
    destination page link.
  */
  if ($("destinationPageUrl")) {
    $("destinationPageUrl").value =
      destination?.page_url || "";
  }

  const currentImage =
    $("destinationCurrentImage");

  if (currentImage) {
    if (destination?.image_url) {
      currentImage.src =
        destination.image_url;

      currentImage.style.display =
        "block";
    } else {
      currentImage.style.display =
        "none";
    }
  }

  modal.style.display = "flex";
}


function closeDestinationModal() {
  const modal =
    $("destinationModal");

  if (modal) {
    modal.style.display = "none";
  }

  editingDestinationId = null;
}


async function editDestinationById(id) {
  try {
    const {
      data,
      error
    } = await supabase
      .from("destinations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    openDestinationModal(data);

  } catch (error) {
    showError(error);
  }
}


async function saveDestination(event) {
  event.preventDefault();

  const name =
    $("destinationName")?.value?.trim();

  const description =
    $("destinationDescription")?.value?.trim();

  const pageUrl =
    $("destinationPageUrl")?.value?.trim();

  const file =
    $("destinationImageFile")?.files?.[0] ||
    null;

  if (!name) {
    showToast(
      "Destination name is required.",
      "warning"
    );

    return;
  }

  try {
    showLoading(
      editingDestinationId
        ? "Updating destination..."
        : "Creating destination..."
    );

    let destinationId =
      editingDestinationId;

    let oldImagePath = null;

    if (editingDestinationId) {

      const {
        data: existing,
        error: existingError
      } = await supabase
        .from("destinations")
        .select("id,image_path,image_url")
        .eq("id", editingDestinationId)
        .single();

      if (existingError) {
        throw existingError;
      }

      oldImagePath =
        existing?.image_path || null;

      const {
        error
      } = await supabase
        .from("destinations")
        .update({
          name,
          description,
          page_url: pageUrl || null
        })
        .eq("id", editingDestinationId);

      if (error) {
        throw error;
      }

    } else {

      const {
        data,
        error
      } = await supabase
        .from("destinations")
        .insert({
          name,
          description,
          page_url: pageUrl || null
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      destinationId =
        data.id;
    }

    /*
      Upload image only if a new file
      was selected.
    */
    if (file) {

      const uploaded =
        await uploadSiteImage(
          file,
          "destinations",
          destinationId
        );

      const {
        error
      } = await supabase
        .from("destinations")
        .update({
          image_path:
            uploaded.path,

          image_url:
            uploaded.url
        })
        .eq("id", destinationId);

      if (error) {

        await deleteStorageFile(
          SITE_IMAGES_BUCKET,
          uploaded.path
        );

        throw error;
      }

      /*
        Delete old image only after
        DB update succeeded.
      */
      if (
        oldImagePath &&
        oldImagePath !== uploaded.path
      ) {
        await deleteStorageFile(
          SITE_IMAGES_BUCKET,
          oldImagePath
        );
      }
    }

    closeDestinationModal();

    await loadDestinations();
    await loadDashboardStats();

    showToast(
      editingDestinationId
        ? "Destination updated successfully."
        : "Destination created successfully."
    );

  } catch (error) {
    showError(error);
  } finally {
    hideLoading();
  }
}


async function deleteDestinationById(id) {
  if (
    !confirm(
      "Delete this destination?"
    )
  ) {
    return;
  }

  try {
    showLoading(
      "Deleting destination..."
    );

    const {
      data: destination,
      error: fetchError
    } = await supabase
      .from("destinations")
      .select("id,image_path")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    /*
      Delete storage image first.
    */
    if (destination?.image_path) {
      await deleteStorageFile(
        SITE_IMAGES_BUCKET,
        destination.image_path
      );
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

    await loadDestinations();
    await loadDashboardStats();

    showToast(
      "Destination deleted."
    );

  } catch (error) {
    showError(error);
  } finally {
    hideLoading();
  }
}


/* =========================================================
   TOURS
========================================================= */

async function loadTours() {
  const container =
    $("toursList") ||
    $("toursContainer") ||
    $("adminTours");

  if (!container) {
    return;
  }

  container.innerHTML =
    `<div class="admin-loading">Loading tours...</div>`;

  try {
    const {
      data,
      error
    } = await supabase
      .from("tours")
      .select("*")
      .order("created_at", {
        ascending: false
      });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      container.innerHTML =
        `<div class="admin-empty">
          No tours found.
        </div>`;

      return;
    }

    container.innerHTML =
      data
        .map(createTourAdminCard)
        .join("");

  } catch (error) {
    container.innerHTML =
      `<div class="admin-error">
        ${escapeHtml(error.message)}
      </div>`;

    showError(error);
  }
}


function createTourAdminCard(
  tour
) {
  const image =
    tour.image_url ||
    "https://via.placeholder.com/800x500?text=Tour";

  return `
    <div class="admin-card">

      <img
        class="admin-card-image"
        src="${escapeHtml(image)}"
        alt="${escapeHtml(tour.title || tour.name || "Tour")}"
      >

      <div class="admin-card-content">

        <h3>
          ${escapeHtml(
            tour.title ||
            tour.name ||
            "Unnamed Tour"
          )}
        </h3>

        ${
          tour.description
            ? `<p>${escapeHtml(tour.description)}</p>`
            : ""
        }

        <div class="admin-card-actions">

          <button
            type="button"
            class="btn btn-primary"
            onclick="editTourById('${tour.id}')"
          >
            Edit
          </button>

          <button
            type="button"
            class="btn btn-secondary"
            onclick="openTourGallery('${tour.id}', '${escapeHtml(
              tour.title || tour.name || "Tour"
            )}')"
          >
            📷 Gallery
          </button>

          <button
            type="button"
            class="btn btn-danger"
            onclick="deleteTourById('${tour.id}')"
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  `;
}


function openTourModal(
  tour = null
) {
  editingTourId =
    tour?.id || null;

  const modal =
    $("tourModal");

  const form =
    $("tourForm");

  if (!modal || !form) {
    return;
  }

  form.reset();

  if ($("tourTitle")) {
    $("tourTitle").value =
      tour?.title ||
      tour?.name ||
      "";
  }

  if ($("tourName")) {
    $("tourName").value =
      tour?.name || "";
  }

  if ($("tourDescription")) {
    $("tourDescription").value =
      tour?.description || "";
  }

  if ($("tourPrice")) {
    $("tourPrice").value =
      tour?.price ?? "";
  }

  if ($("tourDuration")) {
    $("tourDuration").value =
      tour?.duration || "";
  }

  if ($("tourPageUrl")) {
    $("tourPageUrl").value =
      tour?.page_url || "";
  }

  const currentImage =
    $("tourCurrentImage");

  if (currentImage) {
    if (tour?.image_url) {
      currentImage.src =
        tour.image_url;

      currentImage.style.display =
        "block";
    } else {
      currentImage.style.display =
        "none";
    }
  }

  modal.style.display = "flex";
}


function closeTourModal() {
  const modal =
    $("tourModal");

  if (modal) {
    modal.style.display = "none";
  }

  editingTourId = null;
}


async function editTourById(id) {
  try {
    const {
      data,
      error
    } = await supabase
      .from("tours")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    openTourModal(data);

  } catch (error) {
    showError(error);
  }
}


async function saveTour(event) {
  event.preventDefault();

  const title =
    $("tourTitle")?.value?.trim();

  const name =
    $("tourName")?.value?.trim();

  const description =
    $("tourDescription")?.value?.trim();

  const priceValue =
    $("tourPrice")?.value?.trim();

  const duration =
    $("tourDuration")?.value?.trim();

  const pageUrl =
    $("tourPageUrl")?.value?.trim();

  const file =
    $("tourImageFile")?.files?.[0] ||
    null;

  const finalTitle =
    title || name;

  if (!finalTitle) {
    showToast(
      "Tour title/name is required.",
      "warning"
    );

    return;
  }

  try {
    showLoading(
      editingTourId
        ? "Updating tour..."
        : "Creating tour..."
    );

    let tourId =
      editingTourId;

    let oldImagePath = null;

    if (editingTourId) {

      const {
        data: existing,
        error: existingError
      } = await supabase
        .from("tours")
        .select("id,image_path,image_url")
        .eq("id", editingTourId)
        .single();

      if (existingError) {
        throw existingError;
      }

      oldImagePath =
        existing?.image_path || null;

      const updateData = {
        description,
        page_url:
          pageUrl || null
      };

      /*
        Support both schemas:
        title OR name.
      */
      const {
        data: columns,
        error: columnsError
      } = await supabase
        .from("tours")
        .select("*")
        .eq("id", editingTourId)
        .single();

      if (columnsError) {
        throw columnsError;
      }

      if (
        Object.prototype.hasOwnProperty.call(
          columns,
          "title"
        )
      ) {
        updateData.title =
          finalTitle;
      }

      if (
        Object.prototype.hasOwnProperty.call(
          columns,
          "name"
        )
      ) {
        updateData.name =
          name || finalTitle;
      }

      if (
        Object.prototype.hasOwnProperty.call(
          columns,
          "price"
        )
      ) {
        updateData.price =
          priceValue === ""
            ? null
            : Number(priceValue);
      }

      if (
        Object.prototype.hasOwnProperty.call(
          columns,
          "duration"
        )
      ) {
        updateData.duration =
          duration || null;
      }

      const {
        error
      } = await supabase
        .from("tours")
        .update(updateData)
        .eq("id", editingTourId);

      if (error) {
        throw error;
      }

    } else {

      const insertData = {
        description,
        page_url:
          pageUrl || null
      };

      /*
        Use title if table has title.
        Use name if table has name.
      */

      let {
        data: columns,
        error: columnsError
      } = await supabase
        .from("tours")
        .select("*")
        .limit(1);

      if (columnsError) {
        throw columnsError;
      }

      const sample =
        columns?.[0] || {};

      if (
        Object.prototype.hasOwnProperty.call(
          sample,
          "title"
        )
      ) {
        insertData.title =
          finalTitle;
      }

      if (
        Object.prototype.hasOwnProperty.call(
          sample,
          "name"
        )
      ) {
        insertData.name =
          name || finalTitle;
      }

      if (
        Object.prototype.hasOwnProperty.call(
          sample,
          "price"
        )
      ) {
        insertData.price =
          priceValue === ""
            ? null
            : Number(priceValue);
      }

      if (
        Object.prototype.hasOwnProperty.call(
          sample,
          "duration"
        )
      ) {
        insertData.duration =
          duration || null;
      }

      /*
        If table is empty, default to title.
      */
      if (
        Object.keys(sample).length === 0
      ) {
        insertData.title =
          finalTitle;
      }

      const {
        data,
        error
      } = await supabase
        .from("tours")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      tourId =
        data.id;
    }

    /*
      Upload main tour image.
    */
    if (file) {

      const uploaded =
        await uploadSiteImage(
          file,
          "tours",
          tourId
        );

      const {
        error
      } = await supabase
        .from("tours")
        .update({
          image_path:
            uploaded.path,

          image_url:
            uploaded.url
        })
        .eq("id", tourId);

      if (error) {

        await deleteStorageFile(
          SITE_IMAGES_BUCKET,
          uploaded.path
        );

        throw error;
      }

      if (
        oldImagePath &&
        oldImagePath !== uploaded.path
      ) {
        await deleteStorageFile(
          SITE_IMAGES_BUCKET,
          oldImagePath
        );
      }
    }

    closeTourModal();

    await loadTours();
    await loadDashboardStats();

    showToast(
      editingTourId
        ? "Tour updated successfully."
        : "Tour created successfully."
    );

  } catch (error) {
    showError(error);
  } finally {
    hideLoading();
  }
}


async function deleteTourById(id) {
  if (
    !confirm(
      "Delete this tour and its gallery?"
    )
  ) {
    return;
  }

  try {
    showLoading(
      "Deleting tour..."
    );

    const {
      data: tour,
      error: fetchError
    } = await supabase
      .from("tours")
      .select("id,image_path")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    /*
      Delete main image.
    */
    if (tour?.image_path) {
      await deleteStorageFile(
        SITE_IMAGES_BUCKET,
        tour.image_path
      );
    }

    /*
      Delete gallery DB rows and storage files.
    */
    const {
      data: gallery,
      error: galleryFetchError
    } = await supabase
      .from("tour_gallery")
      .select("id,image_path")
      .eq("tour_id", id);

    if (
      galleryFetchError
    ) {
      console.warn(
        "Gallery fetch warning:",
        galleryFetchError
      );
    }

    if (gallery?.length) {

      const paths =
        gallery
          .map(item => item.image_path)
          .filter(Boolean);

      if (paths.length) {
        await supabase
          .storage
          .from(TOUR_GALLERY_BUCKET)
          .remove(paths);
      }

      await supabase
        .from("tour_gallery")
        .delete()
        .eq("tour_id", id);
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

    await loadTours();
    await loadDashboardStats();

    showToast(
      "Tour deleted."
    );

  } catch (error) {
    showError(error);
  } finally {
    hideLoading();
  }
}


/* =========================================================
   DESTINATION LOCATIONS
========================================================= */

async function loadLocationDestinations() {
  const select =
    $("locationDestinationSelect");

  if (!select) {
    return;
  }

  try {
    const {
      data,
      error
    } = await supabase
      .from("destinations")
      .select("id,name")
      .order("name");

    if (error) {
      throw error;
    }

    select.innerHTML =
      `<option value="">Select destination</option>`;

    (data || [])
      .forEach(destination => {

        const option =
          document.createElement("option");

        option.value =
          destination.id;

        option.textContent =
          destination.name;

        select.appendChild(option);
      });

  } catch (error) {
    showError(error);
  }
}


async function loadLocations(
  destinationId =
    currentLocationDestinationId
) {
  const container =
    $("locationsList") ||
    $("locationsContainer") ||
    $("adminLocations");

  if (!container) {
    return;
  }

  if (!destinationId) {
    container.innerHTML =
      `<div class="admin-empty">
        Select a destination.
      </div>`;

    return;
  }

  currentLocationDestinationId =
    destinationId;

  container.innerHTML =
    `<div class="admin-loading">Loading locations...</div>`;

  try {
    const {
      data,
      error
    } = await supabase
      .from("destination_locations")
      .select("*")
      .eq(
        "destination_id",
        destinationId
      )
      .order("created_at", {
        ascending: false
      });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      container.innerHTML =
        `<div class="admin-empty">
          No locations found.
        </div>`;

      return;
    }

    container.innerHTML =
      data
        .map(createLocationAdminCard)
        .join("");

  } catch (error) {
    container.innerHTML =
      `<div class="admin-error">
        ${escapeHtml(error.message)}
      </div>`;

    showError(error);
  }
}


function createLocationAdminCard(
  location
) {
  const image =
    location.image_url ||
    "https://via.placeholder.com/800x500?text=Location";

  return `
    <div class="admin-card">

      <img
        class="admin-card-image"
        src="${escapeHtml(image)}"
        alt="${escapeHtml(location.name || "Location")}"
      >

      <div class="admin-card-content">

        <h3>
          ${escapeHtml(
            location.name ||
            "Unnamed Location"
          )}
        </h3>

        ${
          location.description
            ? `<p>${escapeHtml(location.description)}</p>`
            : ""
        }

        <div class="admin-card-actions">

          <button
            type="button"
            class="btn btn-primary"
            onclick="editLocationById('${location.id}')"
          >
            Edit
          </button>

          <button
            type="button"
            class="btn btn-danger"
            onclick="deleteLocationById('${location.id}')"
          >
            Delete
          </button>

        </div>

      </div>

    </div>
  `;
}


function openLocationModal(
  location = null
) {
  editingLocationId =
    location?.id || null;

  const modal =
    $("locationModal");

  const form =
    $("locationForm");

  if (!modal || !form) {
    return;
  }

  form.reset();

  if ($("locationName")) {
    $("locationName").value =
      location?.name || "";
  }

  if ($("locationDescription")) {
    $("locationDescription").value =
      location?.description || "";
  }

  if ($("locationDestinationSelect")) {
    $("locationDestinationSelect").value =
      location?.destination_id ||
      currentLocationDestinationId ||
      "";
  }

  const currentImage =
    $("locationCurrentImage");

  if (currentImage) {
    if (location?.image_url) {
      currentImage.src =
        location.image_url;

      currentImage.style.display =
        "block";
    } else {
      currentImage.style.display =
        "none";
    }
  }

  modal.style.display = "flex";
}


function closeLocationModal() {
  const modal =
    $("locationModal");

  if (modal) {
    modal.style.display = "none";
  }

  editingLocationId = null;
}


async function editLocationById(id) {
  try {
    const {
      data,
      error
    } = await supabase
      .from("destination_locations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    currentLocationDestinationId =
      data.destination_id;

    openLocationModal(data);

  } catch (error) {
    showError(error);
  }
}


async function saveLocation(event) {
  event.preventDefault();

  const name =
    $("locationName")?.value?.trim();

  const description =
    $("locationDescription")?.value?.trim();

  const destinationId =
    $("locationDestinationSelect")?.value ||
    currentLocationDestinationId ||
    null;

  const file =
    $("locationImageFile")?.files?.[0] ||
    null;

  if (!name) {
    showToast(
      "Location name is required.",
      "warning"
    );

    return;
  }

  if (!destinationId) {
    showToast(
      "Please select a destination.",
      "warning"
    );

    return;
  }

  try {
    showLoading(
      editingLocationId
        ? "Updating location..."
        : "Creating location..."
    );

    let locationId =
      editingLocationId;

    let oldImagePath = null;

    if (editingLocationId) {

      const {
        data: existing,
        error: existingError
      } = await supabase
        .from("destination_locations")
        .select("id,image_path,image_url")
        .eq("id", editingLocationId)
        .single();

      if (existingError) {
        throw existingError;
      }

      oldImagePath =
        existing?.image_path || null;

      const {
        error
      } = await supabase
        .from("destination_locations")
        .update({
          destination_id:
            destinationId,

          name,

          description
        })
        .eq("id", editingLocationId);

      if (error) {
        throw error;
      }

    } else {

      const {
        data,
        error
      } = await supabase
        .from("destination_locations")
        .insert({
          destination_id:
            destinationId,

          name,

          description
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      locationId =
        data.id;
    }

    /*
      Upload location image.
    */
    if (file) {

      const uploaded =
        await uploadSiteImage(
          file,
          "locations",
          locationId
        );

      const {
        error
      } = await supabase
        .from("destination_locations")
        .update({
          image_path:
            uploaded.path,

          image_url:
            uploaded.url
        })
        .eq("id", locationId);

      if (error) {

        await deleteStorageFile(
          SITE_IMAGES_BUCKET,
          uploaded.path
        );

        throw error;
      }

      if (
        oldImagePath &&
        oldImagePath !== uploaded.path
      ) {
        await deleteStorageFile(
          SITE_IMAGES_BUCKET,
          oldImagePath
        );
      }
    }

    closeLocationModal();

    await loadLocations(
      destinationId
    );

    showToast(
      editingLocationId
        ? "Location updated successfully."
        : "Location created successfully."
    );

  } catch (error) {
    showError(error);
  } finally {
    hideLoading();
  }
}


async function deleteLocationById(id) {
  if (
    !confirm(
      "Delete this location?"
    )
  ) {
    return;
  }

  try {
    showLoading(
      "Deleting location..."
    );

    const {
      data: location,
      error: fetchError
    } = await supabase
      .from("destination_locations")
      .select(
        "id,destination_id,image_path"
      )
      .eq("id", id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (location?.image_path) {
      await deleteStorageFile(
        SITE_IMAGES_BUCKET,
        location.image_path
      );
    }

    const {
      error
    } = await supabase
      .from("destination_locations")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    await loadLocations(
      location.destination_id
    );

    showToast(
      "Location deleted."
    );

  } catch (error) {
    showError(error);
  } finally {
    hideLoading();
  }
}


/* =========================================================
   TOUR GALLERY
========================================================= */

async function openTourGallery(
  tourId,
  tourTitle = "Tour Gallery"
) {
  currentGalleryTourId =
    tourId;

  currentGalleryTourTitle =
    tourTitle;

  const modal =
    $("tourGalleryModal");

  if (!modal) {
    return;
  }

  if ($("tourGalleryTitle")) {
    $("tourGalleryTitle").textContent =
      tourTitle;
  }

  if ($("tourGalleryLoading")) {
    $("tourGalleryLoading").style.display =
      "block";
  }

  if ($("tourGalleryEmpty")) {
    $("tourGalleryEmpty").style.display =
      "none";
  }

  if ($("tourGalleryGrid")) {
    $("tourGalleryGrid").innerHTML =
      "";
  }

  modal.style.display =
    "flex";

  await loadTourGallery(tourId);
}


function closeTourGallery() {
  const modal =
    $("tourGalleryModal");

  if (modal) {
    modal.style.display =
      "none";
  }

  currentGalleryTourId = null;
}


async function loadTourGallery(
  tourId
) {
  try {
    const {
      data,
      error
    } = await supabase
      .from("tour_gallery")
      .select("*")
      .eq("tour_id", tourId)
      .order("sort_order", {
        ascending: true
      })
      .order("created_at", {
        ascending: true
      });

    if (error) {
      throw error;
    }

    const loading =
      $("tourGalleryLoading");

    if (loading) {
      loading.style.display =
        "none";
    }

    const grid =
      $("tourGalleryGrid");

    const empty =
      $("tourGalleryEmpty");

    if (!grid) {
      return;
    }

    if (!data || data.length === 0) {

      grid.innerHTML = "";

      if (empty) {
        empty.style.display =
          "block";
      }

      return;
    }

    if (empty) {
      empty.style.display =
        "none";
    }

    grid.innerHTML =
      data
        .map(createGalleryAdminCard)
        .join("");

  } catch (error) {

    if ($("tourGalleryLoading")) {
      $("tourGalleryLoading").style.display =
        "none";
    }

    showError(error);
  }
}


function createGalleryAdminCard(
  image
) {
  let imageUrl =
    image.image_url || "";

  if (
    !imageUrl &&
    image.image_path
  ) {
    const {
      data
    } = supabase
      .storage
      .from(TOUR_GALLERY_BUCKET)
      .getPublicUrl(
        image.image_path
      );

    imageUrl =
      data?.publicUrl || "";
  }

  return `
    <div class="gallery-admin-item">

      <img
        src="${escapeHtml(imageUrl)}"
        alt="Tour gallery image"
      >

      <button
        type="button"
        class="gallery-delete-btn"
        onclick="deleteTourGalleryImage('${image.id}', '${escapeHtml(
          image.image_path || ""
        )}')"
      >
        Delete
      </button>

    </div>
  `;
}


async function handleTourGalleryUpload(
  event
) {
  event.preventDefault();

  if (!currentGalleryTourId) {
    showToast(
      "No tour selected.",
      "warning"
    );

    return;
  }

  const file =
    $("tourGalleryFile")?.files?.[0];

  if (!file) {
    showToast(
      "Please select an image.",
      "warning"
    );

    return;
  }

  try {
    showLoading(
      "Uploading gallery image..."
    );

    const uploaded =
      await uploadTourGalleryImage(
        file,
        currentGalleryTourId
      );

    const {
      data: existing
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

    const lastSortOrder =
      existing?.[0]?.sort_order ?? -1;

    const {
      error
    } = await supabase
      .from("tour_gallery")
      .insert({
        tour_id:
          currentGalleryTourId,

        image_path:
          uploaded.path,

        image_url:
          uploaded.url,

        sort_order:
          Number(lastSortOrder) + 1
      });

    if (error) {

      await deleteStorageFile(
        TOUR_GALLERY_BUCKET,
        uploaded.path
      );

      throw error;
    }

    const form =
      $("tourGalleryForm");

    if (form) {
      form.reset();
    }

    await loadTourGallery(
      currentGalleryTourId
    );

    showToast(
      "Gallery image uploaded."
    );

  } catch (error) {
    showError(error);
  } finally {
    hideLoading();
  }
}


async function deleteTourGalleryImage(
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
    showLoading(
      "Deleting gallery image..."
    );

    if (imagePath) {
      await deleteStorageFile(
        TOUR_GALLERY_BUCKET,
        imagePath
      );
    }

    const {
      error
    } = await supabase
      .from("tour_gallery")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    await loadTourGallery(
      currentGalleryTourId
    );

    showToast(
      "Gallery image deleted."
    );

  } catch (error) {
    showError(error);
  } finally {
    hideLoading();
  }
}


/* =========================================================
   REVIEWS
========================================================= */

async function loadReviews() {
  const container =
    $("reviewsList") ||
    $("reviewsContainer") ||
    $("adminReviews");

  if (!container) {
    return;
  }

  container.innerHTML =
    `<div class="admin-loading">Loading reviews...</div>`;

  try {
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
      throw error;
    }

    if (!data || data.length === 0) {
      container.innerHTML =
        `<div class="admin-empty">
          No reviews found.
        </div>`;

      return;
    }

    container.innerHTML =
      data
        .map(createReviewAdminCard)
        .join("");

  } catch (error) {
    container.innerHTML =
      `<div class="admin-error">
        ${escapeHtml(error.message)}
      </div>`;

    showError(error);
  }
}


function createReviewAdminCard(
  review
) {
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

  return `
    <div class="admin-review-card">

      <div class="review-admin-header">

        <strong>
          ${escapeHtml(
            review.name ||
            "Anonymous"
          )}
        </strong>

        <span>
          ${stars}
        </span>

      </div>

      <p>
        ${escapeHtml(
          review.comment ||
          review.message ||
          ""
        )}
      </p>

      <small>
        ${formatDate(review.created_at)}
      </small>

      <div class="admin-card-actions">

        <button
          type="button"
          class="btn btn-danger"
          onclick="deleteReviewById('${review.id}')"
        >
          Delete
        </button>

      </div>

    </div>
  `;
}


async function deleteReviewById(id) {
  if (
    !confirm(
      "Delete this review?"
    )
  ) {
    return;
  }

  try {
    showLoading(
      "Deleting review..."
    );

    const {
      error
    } = await supabase
      .from("reviews")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    await loadReviews();
    await loadDashboardStats();

    showToast(
      "Review deleted."
    );

  } catch (error) {
    showError(error);
  } finally {
    hideLoading();
  }
}


/* =========================================================
   MODAL CLOSE HANDLERS
========================================================= */

function setupModalCloseHandlers() {

  document
    .querySelectorAll(".modal-close")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const modal =
            button.closest(".modal");

          if (modal) {
            modal.style.display =
              "none";
          }

        }
      );

    });


  document
    .querySelectorAll(".modal")
    .forEach(modal => {

      modal.addEventListener(
        "click",
        event => {

          if (
            event.target === modal
          ) {
            modal.style.display =
              "none";
          }

        }
      );

    });
}


/* =========================================================
   FILE INPUT PREVIEW
========================================================= */

function setupImagePreview(
  inputId,
  previewId
) {
  const input =
    $(inputId);

  const preview =
    $(previewId);

  if (!input || !preview) {
    return;
  }

  input.addEventListener(
    "change",
    () => {

      const file =
        input.files?.[0];

      if (!file) {
        return;
      }

      try {
        validateImageFile(file);
      } catch (error) {
        showError(error);
        input.value = "";
        return;
      }

      const reader =
        new FileReader();

      reader.onload = () => {

        preview.src =
          reader.result;

        preview.style.display =
          "block";
      };

      reader.readAsDataURL(file);
    }
  );
}


/* =========================================================
   FORM HELPERS
========================================================= */

function setupForms() {

  const loginForm =
    $("loginForm");

  if (loginForm) {
    loginForm.addEventListener(
      "submit",
      handleLogin
    );
  }


  const destinationForm =
    $("destinationForm");

  if (destinationForm) {
    destinationForm.addEventListener(
      "submit",
      saveDestination
    );
  }


  const tourForm =
    $("tourForm");

  if (tourForm) {
    tourForm.addEventListener(
      "submit",
      saveTour
    );
  }


  const locationForm =
    $("locationForm");

  if (locationForm) {
    locationForm.addEventListener(
      "submit",
      saveLocation
    );
  }


  const galleryForm =
    $("tourGalleryForm");

  if (galleryForm) {
    galleryForm.addEventListener(
      "submit",
      handleTourGalleryUpload
    );
  }


  const destinationSelect =
    $("locationDestinationSelect");

  if (destinationSelect) {
    destinationSelect.addEventListener(
      "change",
      () => {
        currentLocationDestinationId =
          destinationSelect.value || null;

        loadLocations(
          currentLocationDestinationId
        );
      }
    );
  }
}


/* =========================================================
   IMAGE PREVIEWS
========================================================= */

function setupImagePreviews() {

  setupImagePreview(
    "destinationImageFile",
    "destinationCurrentImage"
  );

  setupImagePreview(
    "tourImageFile",
    "tourCurrentImage"
  );

  setupImagePreview(
    "locationImageFile",
    "locationCurrentImage"
  );
}


/* =========================================================
   NAVIGATION EVENTS
========================================================= */

function setupNavigation() {

  document
    .querySelectorAll("[data-section]")
    .forEach(element => {

      element.addEventListener(
        "click",
        event => {

          event.preventDefault();

          showSection(
            element.dataset.section
          );

        }
      );

    });


  const logoutButton =
    $("logoutButton");

  if (logoutButton) {
    logoutButton.addEventListener(
      "click",
      logout
    );
  }


  const logoutBtn =
    $("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener(
      "click",
      logout
    );
  }


  const addDestinationButton =
    $("addDestinationBtn");

  if (addDestinationButton) {
    addDestinationButton.addEventListener(
      "click",
      () => openDestinationModal()
    );
  }


  const addTourButton =
    $("addTourBtn");

  if (addTourButton) {
    addTourButton.addEventListener(
      "click",
      () => openTourModal()
    );
  }


  const addLocationButton =
    $("addLocationBtn");

  if (addLocationButton) {
    addLocationButton.addEventListener(
      "click",
      () => openLocationModal()
    );
  }
}


/* =========================================================
   ADMIN CSS
========================================================= */

function injectAdminStyles() {

  if ($("adminInjectedStyles")) {
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "adminInjectedStyles";

  style.textContent = `

    .admin-card {
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow:
        0 5px 25px rgba(0,0,0,.08);
      margin-bottom: 20px;
    }

    .admin-card-image {
      width: 100%;
      height: 220px;
      object-fit: cover;
      display: block;
    }

    .admin-card-content {
      padding: 18px;
    }

    .admin-card-content h3 {
      margin: 0 0 10px;
    }

    .admin-card-content p {
      color: #666;
      line-height: 1.6;
    }

    .admin-card-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 15px;
    }

    .btn {
      border: 0;
      border-radius: 9px;
      padding: 10px 15px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-primary {
      background: #111827;
      color: #fff;
    }

    .btn-secondary {
      background: #2563eb;
      color: #fff;
    }

    .btn-danger {
      background: #dc2626;
      color: #fff;
    }

    .admin-loading,
    .admin-empty,
    .admin-error {
      padding: 30px;
      text-align: center;
    }

    .admin-error {
      color: #dc2626;
    }

    .admin-review-card {
      background: #fff;
      padding: 20px;
      border-radius: 15px;
      margin-bottom: 15px;
      box-shadow:
        0 5px 20px rgba(0,0,0,.06);
    }

    .review-admin-header {
      display: flex;
      justify-content: space-between;
      gap: 15px;
      margin-bottom: 10px;
    }

    .gallery-admin-item {
      position: relative;
      border-radius: 14px;
      overflow: hidden;
      background: #eee;
    }

    .gallery-admin-item img {
      width: 100%;
      height: 220px;
      object-fit: cover;
      display: block;
    }

    .gallery-delete-btn {
      position: absolute;
      right: 10px;
      bottom: 10px;
      border: 0;
      background: #dc2626;
      color: #fff;
      padding: 8px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .image-upload-help {
      display: block;
      margin-top: 6px;
      color: #6b7280;
      font-size: 13px;
    }

    .current-image-preview {
      width: 100%;
      max-width: 420px;
      max-height: 240px;
      object-fit: cover;
      border-radius: 12px;
      margin-top: 12px;
      display: none;
    }

    input[type="file"] {
      cursor: pointer;
    }

  `;

  document.head.appendChild(style);
}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.openDestinationModal =
  openDestinationModal;

window.closeDestinationModal =
  closeDestinationModal;

window.editDestinationById =
  editDestinationById;

window.deleteDestinationById =
  deleteDestinationById;

window.openTourModal =
  openTourModal;

window.closeTourModal =
  closeTourModal;

window.editTourById =
  editTourById;

window.deleteTourById =
  deleteTourById;

window.openLocationModal =
  openLocationModal;

window.closeLocationModal =
  closeLocationModal;

window.editLocationById =
  editLocationById;

window.deleteLocationById =
  deleteLocationById;

window.openTourGallery =
  openTourGallery;

window.closeTourGallery =
  closeTourGallery;

window.deleteTourGalleryImage =
  deleteTourGalleryImage;

window.loadLocations =
  loadLocations;

window.showSection =
  showSection;

window.logout =
  logout;


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    try {

      injectAdminStyles();

      setupForms();

      setupNavigation();

      setupModalCloseHandlers();

      setupImagePreviews();

      await checkAuth();

    } catch (error) {

      console.error(
        "Admin initialization error:",
        error
      );

      showError(error);

    }

  }
);


/* =========================================================
   AUTH STATE
========================================================= */

supabase.auth.onAuthStateChange(
  (event, session) => {

    if (event === "SIGNED_IN" && session) {
      showDashboard();
    }

    if (event === "SIGNED_OUT") {
      showLogin();
    }

  }
);
