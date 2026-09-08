import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

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

let destinations = [];
let tours = [];
let currentGalleryId = null;
let currentLocationId = null;

/* =========================================
INIT
========================================= */

document.addEventListener("DOMContentLoaded", async () => {
const { data } = await supabase.auth.getSession();

if (!data.session) {
window.location.href = "admin.html";
return;
}

createDashboard();
setupEvents();

await Promise.all([
loadDestinations(),
loadTours(),
loadReviews()
]);

await loadGallery();
await loadLocations();
});

/* =========================================
DASHBOARD UI
========================================= */

function createDashboard() {

document.body.innerHTML = `




TRAVEL WITH SRI LANKA


Website Content Management




href="index.html"
target="_blank"
class="adminBtn secondary"
>
View Website


id="logoutBtn"
class="adminBtn danger"
>
Logout














Destinations

Manage destination pages.




class="adminBtn primary"
id="addDestinationBtn"
>
+ Add Destination



id="destinationsAdminGrid"
class="adminGrid"
>
Loading destinations...










Tours

Manage your tour packages.




class="adminBtn primary"
id="addTourBtn"
>
+ Add Tour



id="toursAdminGrid"
class="adminGrid"
>
Loading tours...










Tour Gallery


Add and manage photos for each tour.




class="adminBtn primary"
id="addGalleryBtn"
>
+ Add Gallery Photo



id="galleryAdminGrid"
class="adminGrid"
>
Loading gallery...










Destination Locations


Manage up to 10 locations for every destination.




class="adminBtn primary"
id="addLocationBtn"
>
+ Add Location



id="locationsAdminGrid"
class="adminGrid"
>
Loading locations...










Reviews

Customer reviews submitted through the website.




class="adminBtn secondary"
id="refreshReviewsBtn"
>
Refresh



id="reviewsAdminGrid"
class="adminGrid"
>
Loading reviews...








id="contentModal"
class="adminModal"
>




Add Content


class="modalClose"
data-close="contentModal"
>
×





type="hidden"
id="contentId"
>

type="hidden"
id="contentType"
>

Name / Title

id="contentName"
required
>

Slug

id="contentSlug"
required
>

Description

id="contentDescription"
rows="5"
>

Page URL

id="contentPageUrl"
placeholder="ella.html"
>

Sort Order

id="contentSortOrder"
type="number"
value="0"
>

Cover Image

id="contentImage"
type="file"
accept="image/jpeg,image/png,image/webp,image/gif"
>





type="button"
class="adminBtn secondary"
data-close="contentModal"
>
Cancel


type="submit"
class="adminBtn primary"
>
Save











id="galleryModal"
class="adminModal"
>






Add Gallery Photo



class="modalClose"
data-close="galleryModal"
>
×






type="hidden"
id="galleryId"
>

Tour

id="galleryTour"
required
>

Photo Title

id="galleryTitle"
placeholder="Ella Mountain Tour"
>

Caption

id="galleryCaption"
rows="4"
placeholder="Beautiful view of Ella..."
>

Sort Order

id="gallerySortOrder"
type="number"
value="0"
>

Photo

id="galleryImage"
type="file"
accept="image/jpeg,image/png,image/webp,image/gif"
>





type="button"
class="adminBtn secondary"
data-close="galleryModal"
>
Cancel


type="submit"
class="adminBtn primary"
>
Save Photo











id="locationModal"
class="adminModal"
>






Add Destination Location



class="modalClose"
data-close="locationModal"
>
×






type="hidden"
id="locationId"
>

Destination

id="locationDestination"
required
>

Location Number

id="locationNumber"
required
>
${Array.from({length: 10}, (_, i) =>
`${String(i + 1).padStart(2, "0")}`
).join("")}


Location Name

id="locationName"
required
placeholder="Ella Rock"
>

Description

id="locationDescription"
rows="5"
placeholder="Discover the breathtaking..."
>

Photo

id="locationImage"
type="file"
accept="image/jpeg,image/png,image/webp,image/gif"
>





type="button"
class="adminBtn secondary"
data-close="locationModal"
>
Cancel


type="submit"
class="adminBtn primary"
>
Save Location












`;
}

/* =========================================
EVENTS
========================================= */

function setupEvents() {

document
.getElementById("addDestinationBtn")
.addEventListener("click", () =>
openAddModal("destination")
);

document
.getElementById("addTourBtn")
.addEventListener("click", () =>
openAddModal("tour")
);

document
.getElementById("addGalleryBtn")
.addEventListener("click", openGalleryAdd);

document
.getElementById("addLocationBtn")
.addEventListener("click", openLocationAdd);

document
.getElementById("contentForm")
.addEventListener("submit", saveContent);

document
.getElementById("galleryForm")
.addEventListener("submit", saveGallery);

document
.getElementById("locationForm")
.addEventListener("submit", saveLocation);

document
.getElementById("refreshReviewsBtn")
.addEventListener("click", loadReviews);

document
.getElementById("logoutBtn")
.addEventListener("click", logout);

document.querySelectorAll("[data-close]").forEach(btn => {

btn.addEventListener("click", () => {

document
.getElementById(btn.dataset.close)
.classList.remove("show");

});

});

}

/* =========================================
DESTINATIONS
========================================= */

async function loadDestinations() {

const grid =
document.getElementById("destinationsAdminGrid");

const { data, error } = await supabase
.from("destinations")
.select("*")
.order("sort_order", { ascending: true });

if (error) {

grid.innerHTML =
`
Could not load destinations.

`;

console.error(error);
return;

}

destinations = data || [];

grid.innerHTML =
destinations.map(destination => `



${
destination.image_url
?
` src="${escapeAttribute(destination.image_url)}"
alt="${escapeAttribute(destination.name)}"
>`
:
`

No image
`
}




${escapeHTML(destination.name)}



Slug: ${escapeHTML(destination.slug || "")}



${escapeHTML(
destination.description || ""
)}





class="adminBtn secondary small"
onclick="window.editContent(
'${destination.id}',
'destination'
)"
>
Edit


class="adminBtn primary small"
onclick="window.manageDestinationLocations(
'${destination.id}'
)"
>
Locations


class="adminBtn danger small"
onclick="window.deleteContent(
'${destination.id}',
'destination'
)"
>
Delete








`).join("");

}

/* =========================================
TOURS
========================================= */

async function loadTours() {

const grid =
document.getElementById("toursAdminGrid");

const { data, error } = await supabase
.from("tours")
.select("*")
.order("sort_order", { ascending: true });

if (error) {

grid.innerHTML =
`
Could not load tours.

`;

console.error(error);
return;

}

tours = data || [];

grid.innerHTML =
tours.map(tour => `



${
tour.image_url
?
` src="${escapeAttribute(tour.image_url)}"
alt="${escapeAttribute(tour.title)}"
>`
:
`

No image
`
}




${escapeHTML(tour.title)}



Slug: ${escapeHTML(tour.slug || "")}



${escapeHTML(
tour.description || ""
)}





class="adminBtn secondary small"
onclick="window.editContent(
'${tour.id}',
'tour'
)"
>
Edit


class="adminBtn primary small"
onclick="window.manageTourGallery(
'${tour.id}'
)"
>
Gallery


class="adminBtn danger small"
onclick="window.deleteContent(
'${tour.id}',
'tour'
)"
>
Delete








`).join("");

}

/* =========================================
CONTENT MODAL
========================================= */

function openAddModal(type) {

document.getElementById("contentForm").reset();

document.getElementById("contentId").value = "";
document.getElementById("contentType").value = type;

document.getElementById("contentModalTitle").textContent =
type === "destination"
? "Add Destination"
: "Add Tour";

document.getElementById("contentCurrentImage").innerHTML = "";

document
.getElementById("contentModal")
.classList.add("show");

}

async function editContent(id, type) {

const table =
type === "destination"
? "destinations"
: "tours";

const { data, error } = await supabase
.from(table)
.select("*")
.eq("id", id)
.single();

if (error) {

showMessage(error.message);
return;

}

document.getElementById("contentId").value =
data.id;

document.getElementById("contentType").value =
type;

document.getElementById("contentName").value =
type === "tour"
? data.title || ""
: data.name || "";

document.getElementById("contentSlug").value =
data.slug || "";

document.getElementById("contentDescription").value =
data.description || "";

document.getElementById("contentPageUrl").value =
data.page_url || "";

document.getElementById("contentSortOrder").value =
data.sort_order || 0;

document.getElementById("contentModalTitle").textContent =
type === "tour"
? "Edit Tour"
: "Edit Destination";

document.getElementById("contentCurrentImage").innerHTML =
data.image_url
?
`

Current image:




`
:
"";

document
.getElementById("contentModal")
.classList.add("show");

}

async function saveContent(event) {

event.preventDefault();

const id =
document.getElementById("contentId").value;

const type =
document.getElementById("contentType").value;

const name =
document.getElementById("contentName").value.trim();

let slug =
document.getElementById("contentSlug").value.trim();

const description =
document
.getElementById("contentDescription")
.value
.trim();

const pageUrl =
document
.getElementById("contentPageUrl")
.value
.trim();

const sortOrder =
Number(
document.getElementById("contentSortOrder").value
) || 0;

const file =
document.getElementById("contentImage").files[0];

slug = createSafeSlug(slug || name);

const table =
type === "destination"
? "destinations"
: "tours";

let existing = null;

if (id) {

const result = await supabase
.from(table)
.select("*")
.eq("id", id)
.single();

existing = result.data;

}

let imageUrl =
existing?.image_url || null;

if (file) {

const result =
await uploadImage(
file,
type,
slug
);

if (!result) return;

imageUrl = result.url;

}

const payload =
type === "destination"
?
{
name,
slug,
description,
image_url: imageUrl,
page_url: pageUrl,
sort_order: sortOrder
}
:
{
title: name,
slug,
description,
image_url: imageUrl,
page_url: pageUrl,
sort_order: sortOrder
};

let result;

if (id) {

result = await supabase
.from(table)
.update(payload)
.eq("id", id);

} else {

result = await supabase
.from(table)
.insert(payload);

}

if (result.error) {

showMessage(result.error.message);
return;

}

closeModal("contentModal");

showMessage("Content saved successfully.");

if (type === "destination") {
await loadDestinations();
await loadLocations();
} else {
await loadTours();
await loadGallery();
}

}

/* =========================================
GALLERY
========================================= */

async function loadGallery() {

const grid =
document.getElementById("galleryAdminGrid");

const { data, error } = await supabase
.from("tour_gallery")
.select(`
*,
tours (
id,
title,
slug
)
`)
.order("sort_order", { ascending: true });

if (error) {

grid.innerHTML =
`
Could not load gallery.

`;

console.error(error);
return;

}

if (!data?.length) {

grid.innerHTML =
`
No gallery photos yet.

`;

return;

}

grid.innerHTML =
data.map(photo => `



${
photo.image_url
?
` src="${escapeAttribute(photo.image_url)}"
alt="${escapeAttribute(photo.title || "")}"
>`
:
""
}




${escapeHTML(photo.title || "Gallery Photo")}




Tour:
${escapeHTML(
photo.tours?.title || "Unknown"
)}




Order:
${photo.sort_order}




${escapeHTML(photo.caption || "")}





class="adminBtn secondary small"
onclick="window.editGallery(
'${photo.id}'
)"
>
Edit


class="adminBtn danger small"
onclick="window.deleteGallery(
'${photo.id}'
)"
>
Delete








`).join("");

}

function populateGalleryTours(selectedId = "") {

const select =
document.getElementById("galleryTour");

select.innerHTML =
tours.map(tour => `

value="${tour.id}"
${tour.id === selectedId ? "selected" : ""}
>
${escapeHTML(tour.title)}


`).join("");

}

function openGalleryAdd() {

currentGalleryId = null;

document.getElementById("galleryForm").reset();

document.getElementById("galleryId").value = "";

document.getElementById("galleryModalTitle").textContent =
"Add Gallery Photo";

document.getElementById("galleryCurrentImage").innerHTML =
"";

populateGalleryTours();

document
.getElementById("galleryModal")
.classList.add("show");

}

async function editGallery(id) {

const { data, error } = await supabase
.from("tour_gallery")
.select("*")
.eq("id", id)
.single();

if (error) {

showMessage(error.message);
return;

}

currentGalleryId = id;

document.getElementById("galleryId").value =
id;

populateGalleryTours(data.tour_id);

document.getElementById("galleryTitle").value =
data.title || "";

document.getElementById("galleryCaption").value =
data.caption || "";

document.getElementById("gallerySortOrder").value =
data.sort_order || 0;

document.getElementById("galleryModalTitle").textContent =
"Edit Gallery Photo";

document.getElementById("galleryCurrentImage").innerHTML =
data.image_url
?
`

Current photo:




`
:
"";

document
.getElementById("galleryModal")
.classList.add("show");

}

async function saveGallery(event) {

event.preventDefault();

const id =
document.getElementById("galleryId").value;

const tourId =
document.getElementById("galleryTour").value;

const title =
document.getElementById("galleryTitle").value.trim();

const caption =
document.getElementById("galleryCaption").value.trim();

const sortOrder =
Number(
document.getElementById("gallerySortOrder").value
) || 0;

const file =
document.getElementById("galleryImage").files[0];

let existing = null;

if (id) {

const result = await supabase
.from("tour_gallery")
.select("*")
.eq("id", id)
.single();

existing = result.data;

}

let imagePath =
existing?.image_path || null;

let imageUrl =
existing?.image_url || null;

if (file) {

const tour =
tours.find(t => t.id === tourId);

const slug =
createSafeSlug(
tour?.slug || tour?.title || "tour"
);

const uploaded =
await uploadGalleryImage(
file,
slug
);

if (!uploaded) return;

imagePath = uploaded.path;
imageUrl = uploaded.url;

if (
existing?.image_path &&
existing.image_path !== imagePath
) {

await deleteStorageFile(
existing.image_path
);

}

}

if (!imageUrl) {

showMessage(
"Please select a gallery photo."
);

return;

}

const payload = {
tour_id: tourId,
title,
caption,
image_path: imagePath,
image_url: imageUrl,
sort_order: sortOrder,
updated_at: new Date().toISOString()
};

let result;

if (id) {

result = await supabase
.from("tour_gallery")
.update(payload)
.eq("id", id);

} else {

result = await supabase
.from("tour_gallery")
.insert(payload);

}

if (result.error) {

showMessage(result.error.message);
return;

}

closeModal("galleryModal");

showMessage("Gallery photo saved.");

await loadGallery();

}

async function deleteGallery(id) {

if (
!confirm(
"Delete this gallery photo?"
)
) return;

const { data, error } = await supabase
.from("tour_gallery")
.select("image_path")
.eq("id", id)
.single();

if (error) {

showMessage(error.message);
return;

}

const result = await supabase
.from("tour_gallery")
.delete()
.eq("id", id);

if (result.error) {

showMessage(result.error.message);
return;

}

if (data?.image_path) {

await deleteStorageFile(
data.image_path
);

}

showMessage("Gallery photo deleted.");

await loadGallery();

}

/* =========================================
DESTINATION LOCATIONS
========================================= */

async function loadLocations() {

const grid =
document.getElementById("locationsAdminGrid");

const { data, error } = await supabase
.from("destination_locations")
.select(`
*,
destinations (
id,
name,
slug
)
`)
.order("location_number", {
ascending: true
});

if (error) {

grid.innerHTML =
`
Could not load locations.

`;

console.error(error);
return;

}

if (!data?.length) {

grid.innerHTML =
`
No destination locations added yet.

`;

return;

}

grid.innerHTML =
data.map(location => `



${
location.image_url
?
` src="${escapeAttribute(location.image_url)}"
alt="${escapeAttribute(location.name)}"
>`
:
`

No image
`
}




${
String(
location.location_number
).padStart(2, "0")
}
•
${escapeHTML(
location.destinations?.name || ""
)}



${escapeHTML(location.name)}



${escapeHTML(
location.description || ""
)}





class="adminBtn secondary small"
onclick="window.editLocation(
'${location.id}'
)"
>
Edit


class="adminBtn danger small"
onclick="window.deleteLocation(
'${location.id}'
)"
>
Delete








`).join("");

}

function populateLocationDestinations(
selectedId = ""
) {

const select =
document.getElementById(
"locationDestination"
);

select.innerHTML =
destinations.map(destination => `

value="${destination.id}"
${destination.id === selectedId
? "selected"
: ""}
>
${escapeHTML(destination.name)}


`).join("");

}

function openLocationAdd() {

currentLocationId = null;

document.getElementById("locationForm").reset();

document.getElementById("locationId").value = "";

document.getElementById("locationModalTitle").textContent =
"Add Destination Location";

document.getElementById("locationCurrentImage").innerHTML =
"";

populateLocationDestinations();

document
.getElementById("locationModal")
.classList.add("show");

}

async function editLocation(id) {

const { data, error } = await supabase
.from("destination_locations")
.select("*")
.eq("id", id)
.single();

if (error) {

showMessage(error.message);
return;

}

currentLocationId = id;

document.getElementById("locationId").value =
id;

populateLocationDestinations(
data.destination_id
);

document.getElementById("locationNumber").value =
data.location_number;

document.getElementById("locationName").value =
data.name || "";

document.getElementById("locationDescription").value =
data.description || "";

document.getElementById("locationModalTitle").textContent =
"Edit Destination Location";

document.getElementById("locationCurrentImage").innerHTML =
data.image_url
?
`

Current photo:




`
:
"";

document
.getElementById("locationModal")
.classList.add("show");

}

async function saveLocation(event) {

event.preventDefault();

const id =
document.getElementById("locationId").value;

const destinationId =
document.getElementById(
"locationDestination"
).value;

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

const file =
document.getElementById(
"locationImage"
).files[0];

let existing = null;

if (id) {

const result = await supabase
.from("destination_locations")
.select("*")
.eq("id", id)
.single();

existing = result.data;

}

let imagePath =
existing?.image_path || null;

let imageUrl =
existing?.image_url || null;

if (file) {

const destination =
destinations.find(
d => d.id === destinationId
);

const slug =
createSafeSlug(
destination?.slug ||
destination?.name ||
"destination"
);

const uploaded =
await uploadLocationImage(
file,
slug,
locationNumber
);

if (!uploaded) return;

imagePath = uploaded.path;
imageUrl = uploaded.url;

if (
existing?.image_path &&
existing.image_path !== imagePath
) {

await deleteStorageFile(
existing.image_path
);

}

}

const payload = {
destination_id: destinationId,
location_number: locationNumber,
name,
description,
image_path: imagePath,
image_url: imageUrl,
sort_order: locationNumber,
updated_at: new Date().toISOString()
};

let result;

if (id) {

result = await supabase
.from("destination_locations")
.update(payload)
.eq("id", id);

} else {

result = await supabase
.from("destination_locations")
.insert(payload);

}

if (result.error) {

showMessage(result.error.message);
return;

}

closeModal("locationModal");

showMessage("Destination location saved.");

await loadLocations();

}

async function deleteLocation(id) {

if (
!confirm(
"Delete this destination location?"
)
) return;

const { data, error } = await supabase
.from("destination_locations")
.select("image_path")
.eq("id", id)
.single();

if (error) {

showMessage(error.message);
return;

}

const result = await supabase
.from("destination_locations")
.delete()
.eq("id", id);

if (result.error) {

showMessage(result.error.message);
return;

}

if (data?.image_path) {

await deleteStorageFile(
data.image_path
);

}

showMessage("Location deleted.");

await loadLocations();

}

/* =========================================
REVIEWS
========================================= */

async function loadReviews() {

const grid =
document.getElementById("reviewsAdminGrid");

if (!grid) return;

const { data, error } = await supabase
.from("reviews")
.select(`
id,
name,
country,
rating,
review,
photo_path
`)
.order("id", {
ascending: false
});

if (error) {

grid.innerHTML =
`
Could not load reviews.

`;

console.error(error);
return;

}

if (!data?.length) {

grid.innerHTML =
`
No reviews yet.

`;

return;

}

grid.innerHTML =
data.map(review => {

let photo = "";

if (review.photo_path) {

photo =
supabase
.storage
.from("review-photos")
.getPublicUrl(
review.photo_path
)
.data
.publicUrl;

}

return `



${
photo
?
` src="${escapeAttribute(photo)}"
alt="${escapeAttribute(review.name)}"
>`
:
""
}




${escapeHTML(review.name)}



${escapeHTML(review.country || "")}



${"★".repeat(
Math.max(
0,
Math.min(
5,
Number(review.rating) || 0
)
)
)}



${escapeHTML(review.review || "")}





class="adminBtn danger small"
onclick="window.deleteReview(
'${review.id}'
)"
>
Delete








`;

}).join("");

}

async function deleteReview(id) {

if (
!confirm("Delete this review?")
) return;

const result =
await supabase
.from("reviews")
.delete()
.eq("id", id);

if (result.error) {

showMessage(
result.error.message
);

return;

}

showMessage("Review deleted.");

await loadReviews();

}

/* =========================================
STORAGE UPLOADS
========================================= */

async function uploadImage(
file,
type,
slug
) {

if (!validateImage(file)) {
return null;
}

const extension =
getSafeExtension(file.name);

const filename =
`${Date.now()}-${crypto.randomUUID()}.${extension}`;

const folder =
type === "destination"
? "destinations"
: "tours";

const path =
`${folder}/${slug}/${filename}`;

const { error } =
await supabase
.storage
.from("site-images")
.upload(
path,
file,
{
cacheControl: "3600",
upsert: false
}
);

if (error) {

showMessage(error.message);
return null;

}

const publicUrl =
supabase
.storage
.from("site-images")
.getPublicUrl(path)
.data
.publicUrl;

return {
path,
url: publicUrl
};

}

async function uploadGalleryImage(
file,
slug
) {

if (!validateImage(file)) {
return null;
}

const extension =
getSafeExtension(file.name);

const filename =
`${Date.now()}-${crypto.randomUUID()}.${extension}`;

const path =
`gallery/${slug}/${filename}`;

const { error } =
await supabase
.storage
.from("site-images")
.upload(
path,
file,
{
cacheControl: "3600",
upsert: false
}
);

if (error) {

showMessage(error.message);
return null;

}

const publicUrl =
supabase
.storage
.from("site-images")
.getPublicUrl(path)
.data
.publicUrl;

return {
path,
url: publicUrl
};

}

async function uploadLocationImage(
file,
slug,
number
) {

if (!validateImage(file)) {
return null;
}

const extension =
getSafeExtension(file.name);

const filename =
`${String(number).padStart(2, "0")}-${Date.now()}-${crypto.randomUUID()}.${extension}`;

const path =
`locations/${slug}/${filename}`;

const { error } =
await supabase
.storage
.from("site-images")
.upload(
path,
file,
{
cacheControl: "3600",
upsert: false
}
);

if (error) {

showMessage(error.message);
return null;

}

const publicUrl =
supabase
.storage
.from("site-images")
.getPublicUrl(path)
.data
.publicUrl;

return {
path,
url: publicUrl
};

}

async function deleteStorageFile(path) {

if (!path) return;

const { error } =
await supabase
.storage
.from("site-images")
.remove([path]);

if (error) {
console.warn(
"Storage delete failed:",
error
);
}

}

/* =========================================
DELETE DESTINATION / TOUR
========================================= */

async function deleteContent(
id,
type
) {

const label =
type === "destination"
? "destination"
: "tour";

if (
!confirm(
`Delete this ${label}?`
)
) return;

const table =
type === "destination"
? "destinations"
: "tours";

const { data } =
await supabase
.from(table)
.select("image_url")
.eq("id", id)
.single();

const result =
await supabase
.from(table)
.delete()
.eq("id", id);

if (result.error) {

showMessage(
result.error.message
);

return;

}

showMessage(
`${label} deleted.`
);

if (type === "destination") {
await loadDestinations();
await loadLocations();
} else {
await loadTours();
await loadGallery();
}

}

/* =========================================
HELPERS
========================================= */

function validateImage(file) {

if (!file) return false;

const allowed = [
"image/jpeg",
"image/png",
"image/webp",
"image/gif"
];

if (!allowed.includes(file.type)) {

showMessage(
"Only JPG, PNG, WEBP and GIF images are allowed."
);

return false;

}

if (
file.size >
5 * 1024 * 1024
) {

showMessage(
"Maximum image size is 5 MB."
);

return false;

}

return true;

}

function getSafeExtension(filename) {

const parts =
filename
.split(".")
.pop()
.toLowerCase();

return [
"jpg",
"jpeg",
"png",
"webp",
"gif"
].includes(parts)
? parts
: "jpg";

}

function createSafeSlug(value) {

return String(value || "")
.toLowerCase()
.trim()
.replace(/[^a-z0-9]+/g, "-")
.replace(/^-+|-+$/g, "");

}

function escapeHTML(value) {

return String(value ?? "")
.replace(/&/g, "&")
.replace(/ .replace(/>/g, ">")
.replace(/"/g, """)
.replace(/'/g, "'");

}

function escapeAttribute(value) {

return escapeHTML(value);

}

function showMessage(message) {

const box =
document.getElementById(
"adminMessage"
);

if (!box) return;

box.innerHTML =
`

${escapeHTML(message)}
`;

setTimeout(() => {

box.innerHTML = "";

}, 4000);

}

function closeModal(id) {

document
.getElementById(id)
.classList.remove("show");

}

/* =========================================
QUICK MANAGERS
========================================= */

function manageTourGallery(id) {

openGalleryAdd();

document.getElementById("galleryTour").value =
id;

}

function manageDestinationLocations(id) {

openLocationAdd();

document.getElementById(
"locationDestination"
).value = id;

}

/* =========================================
LOGOUT
========================================= */

async function logout() {

await supabase.auth.signOut();

window.location.href =
"admin.html";

}

/* =========================================
GLOBAL FUNCTIONS
========================================= */

window.editContent = editContent;
window.deleteContent = deleteContent;

window.editGallery = editGallery;
window.deleteGallery = deleteGallery;

window.editLocation = editLocation;
window.deleteLocation = deleteLocation;

window.deleteReview = deleteReview;

window.manageTourGallery =
manageTourGallery;

window.manageDestinationLocations =
manageDestinationLocations;
