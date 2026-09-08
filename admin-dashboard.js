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

let destinations = [];
let tours = [];

let currentGalleryId = null;
let currentLocationId = null;

/* =========================================================
GLOBAL ERROR HANDLERS
========================================================= */

window.addEventListener("error", function (event) {

console.error(
"Global JavaScript Error:",
event.error || event.message
);

});

window.addEventListener(
"unhandledrejection",
function (event) {

console.error(
"Unhandled Promise Error:",
event.reason
);

}
);

/* =========================================================
INIT
========================================================= */

document.addEventListener(
"DOMContentLoaded",
async function () {

try {

console.log(
"================================="
);

console.log(
"ADMIN PANEL STARTING..."
);

console.log(
"================================="
);

const {
data,
error
} = await supabase.auth.getSession();

if (error) {

console.error(
"Supabase Auth Error:",
error
);

showFatalError(
error.message
);

return;

}

if (
!data ||
!data.session
) {

console.log(
"No active session. Redirecting..."
);

window.location.href =
"admin.html";

return;

}

console.log(
"Authenticated successfully."
);

createDashboard();

setupEvents();

/*
Load basic content first.
*/

await Promise.all([
loadDestinations(),
loadTours(),
loadReviews()
]);

/*
Then load related content.
*/

await loadGallery();

await loadLocations();

console.log(
"================================="
);

console.log(
"ADMIN PANEL LOADED SUCCESSFULLY"
);

console.log(
"================================="
);

} catch (error) {

console.error(
"ADMIN PANEL FATAL ERROR:",
error
);

showFatalError(
error &&
(
error.stack ||
error.message
)
? (
error.stack ||
error.message
)
: String(error)
);

}

}
);

/* =========================================================
FATAL ERROR SCREEN
========================================================= */

function showFatalError(message) {

document.body.innerHTML = `






⚠️



Admin Panel Error



The admin panel could not be loaded.



${escapeHTML(message)}




onclick="location.reload()"
style="
border:0;
padding:12px 18px;
border-radius:9px;
background:#c9a85b;
color:#10251d;
font-weight:700;
cursor:pointer;
"
>
Reload


href="admin.html"
style="
display:inline-block;
padding:12px 18px;
border-radius:9px;
background:#eef0eb;
color:#10251d;
text-decoration:none;
font-weight:700;
"
>
Back to Login








`;

}

/* =========================================================
DASHBOARD UI
========================================================= */

function createDashboard() {

document.body.innerHTML = `










TRAVEL WITH SRI LANKA



Website Content Management






href="index.html"
target="_blank"
rel="noopener"
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
placeholder="ella"
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

${Array.from(
{ length: 10 },
function (_, i) {

const number =
i + 1;

return `
${String(number).padStart(2, "0")}
`;

}
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

/* =========================================================
EVENTS
========================================================= */

function setupEvents() {

const addDestinationBtn =
document.getElementById(
"addDestinationBtn"
);

const addTourBtn =
document.getElementById(
"addTourBtn"
);

const addGalleryBtn =
document.getElementById(
"addGalleryBtn"
);

const addLocationBtn =
document.getElementById(
"addLocationBtn"
);

const contentForm =
document.getElementById(
"contentForm"
);

const galleryForm =
document.getElementById(
"galleryForm"
);

const locationForm =
document.getElementById(
"locationForm"
);

const refreshReviewsBtn =
document.getElementById(
"refreshReviewsBtn"
);

const logoutBtn =
document.getElementById(
"logoutBtn"
);

if (addDestinationBtn) {

addDestinationBtn.addEventListener(
"click",
function () {

openAddModal(
"destination"
);

}
);

}

if (addTourBtn) {

addTourBtn.addEventListener(
"click",
function () {

openAddModal(
"tour"
);

}
);

}

if (addGalleryBtn) {

addGalleryBtn.addEventListener(
"click",
openGalleryAdd
);

}

if (addLocationBtn) {

addLocationBtn.addEventListener(
"click",
openLocationAdd
);

}

if (contentForm) {

contentForm.addEventListener(
"submit",
saveContent
);

}

if (galleryForm) {

galleryForm.addEventListener(
"submit",
saveGallery
);

}

if (locationForm) {

locationForm.addEventListener(
"submit",
saveLocation
);

}

if (refreshReviewsBtn) {

refreshReviewsBtn.addEventListener(
"click",
loadReviews
);

}

if (logoutBtn) {

logoutBtn.addEventListener(
"click",
logout
);

}

document
.querySelectorAll(
"[data-close]"
)
.forEach(function (btn) {

btn.addEventListener(
"click",
function () {

closeModal(
btn.dataset.close
);

}
);

});

/*
Close modal when clicking outside.
*/

document
.querySelectorAll(
".adminModal"
)
.forEach(function (modal) {

modal.addEventListener(
"click",
function (event) {

if (
event.target === modal
) {

modal.classList.remove(
"show"
);

}

}
);

});

}

/* =========================================================
DESTINATIONS
========================================================= */

async function loadDestinations() {

const grid =
document.getElementById(
"destinationsAdminGrid"
);

if (!grid) return;

grid.innerHTML =
"Loading destinations...";

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
ascending: true
}
);

if (error) {

console.error(
"Destinations error:",
error
);

grid.innerHTML = `

Could not load destinations.


${escapeHTML(error.message)}


`;

return;

}

destinations =
data || [];

if (!destinations.length) {

grid.innerHTML = `

No destinations yet.

`;

return;

}

grid.innerHTML =
destinations
.map(function (destination) {

return `



${
destination.image_url

?

`
src="${escapeAttribute(
destination.image_url
)}"
alt="${escapeAttribute(
destination.name
)}"
>
`

:

`

No image

`
}




${escapeHTML(
destination.name
)}




Slug:
${escapeHTML(
destination.slug || ""
)}




${escapeHTML(
destination.description || ""
)}





class="adminBtn secondary small"
onclick="window.editContent(
'${escapeAttribute(
destination.id
)}',
'destination'
)"
>
Edit


class="adminBtn primary small"
onclick="window.manageDestinationLocations(
'${escapeAttribute(
destination.id
)}'
)"
>
Locations


class="adminBtn danger small"
onclick="window.deleteContent(
'${escapeAttribute(
destination.id
)}',
'destination'
)"
>
Delete








`;

})
.join("");

} catch (error) {

console.error(
"loadDestinations fatal:",
error
);

grid.innerHTML = `

Error loading destinations.

`;

}

}

/* =========================================================
TOURS
========================================================= */

async function loadTours() {

const grid =
document.getElementById(
"toursAdminGrid"
);

if (!grid) return;

grid.innerHTML =
"Loading tours...";

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
ascending: true
}
);

if (error) {

console.error(
"Tours error:",
error
);

grid.innerHTML = `

Could not load tours.


${escapeHTML(error.message)}


`;

return;

}

tours =
data || [];

if (!tours.length) {

grid.innerHTML = `

No tours yet.

`;

return;

}

grid.innerHTML =
tours
.map(function (tour) {

return `



${
tour.image_url

?

`
src="${escapeAttribute(
tour.image_url
)}"
alt="${escapeAttribute(
tour.title
)}"
>
`

:

`

No image

`
}




${escapeHTML(
tour.title
)}




Slug:
${escapeHTML(
tour.slug || ""
)}




${escapeHTML(
tour.description || ""
)}





class="adminBtn secondary small"
onclick="window.editContent(
'${escapeAttribute(
tour.id
)}',
'tour'
)"
>
Edit


class="adminBtn primary small"
onclick="window.manageTourGallery(
'${escapeAttribute(
tour.id
)}'
)"
>
Gallery


class="adminBtn danger small"
onclick="window.deleteContent(
'${escapeAttribute(
tour.id
)}',
'tour'
)"
>
Delete








`;

})
.join("");

} catch (error) {

console.error(
"loadTours fatal:",
error
);

grid.innerHTML = `

Error loading tours.

`;

}

}

/* =========================================================
CONTENT MODAL
========================================================= */

function openAddModal(type) {

const form =
document.getElementById(
"contentForm"
);

form.reset();

document.getElementById(
"contentId"
).value = "";

document.getElementById(
"contentType"
).value = type;

document.getElementById(
"contentModalTitle"
).textContent =
type === "destination"
? "Add Destination"
: "Add Tour";

document.getElementById(
"contentCurrentImage"
).innerHTML = "";

document
.getElementById(
"contentModal"
)
.classList.add("show");

}

/* =========================================================
EDIT CONTENT
========================================================= */

async function editContent(
id,
type
) {

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

showMessage(
error.message,
true
);

return;

}

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
type === "tour"
? data.title || ""
: data.name || "";

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
data.sort_order || 0;

document.getElementById(
"contentModalTitle"
).textContent =
type === "tour"
? "Edit Tour"
: "Edit Destination";

document.getElementById(
"contentCurrentImage"
).innerHTML =
data.image_url

?

`



Current image:



src="${escapeAttribute(
data.image_url
)}"
alt=""
>


`

:

"";

document
.getElementById(
"contentModal"
)
.classList.add("show");

}

/* =========================================================
SAVE CONTENT
========================================================= */

async function saveContent(event) {

event.preventDefault();

const id =
document.getElementById(
"contentId"
).value;

const type =
document.getElementById(
"contentType"
).value;

const name =
document.getElementById(
"contentName"
).value
.trim();

let slug =
document.getElementById(
"contentSlug"
).value
.trim();

const description =
document.getElementById(
"contentDescription"
).value
.trim();

const pageUrl =
document.getElementById(
"contentPageUrl"
).value
.trim();

const sortOrder =
Number(
document.getElementById(
"contentSortOrder"
).value
) || 0;

const file =
document.getElementById(
"contentImage"
).files[0];

slug =
createSafeSlug(
slug || name
);

const table =
type === "destination"
? "destinations"
: "tours";

let existing = null;

if (id) {

const result =
await supabase
.from(table)
.select("*")
.eq("id", id)
.single();

if (result.error) {

showMessage(
result.error.message,
true
);

return;

}

existing =
result.data;

}

let imageUrl =
existing?.image_url ||
null;

if (file) {

const result =
await uploadImage(
file,
type,
slug
);

if (!result) return;

imageUrl =
result.url;

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

result =
await supabase
.from(table)
.update(payload)
.eq("id", id);

} else {

result =
await supabase
.from(table)
.insert(payload);

}

if (result.error) {

showMessage(
result.error.message,
true
);

return;

}

closeModal(
"contentModal"
);

showMessage(
"Content saved successfully."
);

if (
type === "destination"
) {

await loadDestinations();

await loadLocations();

} else {

await loadTours();

await loadGallery();

}

}

/* =========================================================
GALLERY
========================================================= */

async function loadGallery() {

const grid =
document.getElementById(
"galleryAdminGrid"
);

if (!grid) return;

grid.innerHTML =
"Loading gallery...";

try {

const {
data,
error
} = await supabase
.from("tour_gallery")
.select(`
*,
tours (
id,
title,
slug
)
`)
.order(
"sort_order",
{
ascending: true
}
);

if (error) {

console.error(
"Gallery error:",
error
);

grid.innerHTML = `

Could not load gallery.


${escapeHTML(
error.message
)}


`;

return;

}

if (!data || !data.length) {

grid.innerHTML = `

No gallery photos yet.

`;

return;

}

grid.innerHTML =
data
.map(function (photo) {

return `



${
photo.image_url

?

`
src="${escapeAttribute(
photo.image_url
)}"
alt="${escapeAttribute(
photo.title || ""
)}"
>
`

:

`

No image

`
}




${escapeHTML(
photo.title ||
"Gallery Photo"
)}




Tour:
${escapeHTML(
photo.tours?.title ||
"Unknown"
)}




Order:
${escapeHTML(
photo.sort_order
)}




${escapeHTML(
photo.caption || ""
)}





class="adminBtn secondary small"
onclick="window.editGallery(
'${escapeAttribute(
photo.id
)}'
)"
>
Edit


class="adminBtn danger small"
onclick="window.deleteGallery(
'${escapeAttribute(
photo.id
)}'
)"
>
Delete








`;

})
.join("");

} catch (error) {

console.error(
"loadGallery fatal:",
error
);

grid.innerHTML = `

Error loading gallery.

`;

}

}

/* =========================================================
GALLERY TOURS
========================================================= */

function populateGalleryTours(
selectedId = ""
) {

const select =
document.getElementById(
"galleryTour"
);

if (!select) return;

if (!tours.length) {

select.innerHTML = `
No tours available
`;

return;

}

select.innerHTML =
tours
.map(function (tour) {

return `

value="${escapeAttribute(
tour.id
)}"
${
String(tour.id) ===
String(selectedId)
? "selected"
: ""
}
>
${escapeHTML(
tour.title
)}


`;

})
.join("");

}

/* =========================================================
ADD GALLERY
========================================================= */

function openGalleryAdd() {

currentGalleryId =
null;

document.getElementById(
"galleryForm"
).reset();

document.getElementById(
"galleryId"
).value = "";

document.getElementById(
"galleryModalTitle"
).textContent =
"Add Gallery Photo";

document.getElementById(
"galleryCurrentImage"
).innerHTML = "";

populateGalleryTours();

document
.getElementById(
"galleryModal"
)
.classList.add("show");

}

/* =========================================================
EDIT GALLERY
========================================================= */

async function editGallery(id) {

const {
data,
error
} = await supabase
.from("tour_gallery")
.select("*")
.eq("id", id)
.single();

if (error) {

showMessage(
error.message,
true
);

return;

}

currentGalleryId =
id;

document.getElementById(
"galleryId"
).value =
id;

populateGalleryTours(
data.tour_id
);

document.getElementById(
"galleryTitle"
).value =
data.title || "";

document.getElementById(
"galleryCaption"
).value =
data.caption || "";

document.getElementById(
"gallerySortOrder"
).value =
data.sort_order || 0;

document.getElementById(
"galleryModalTitle"
).textContent =
"Edit Gallery Photo";

document.getElementById(
"galleryCurrentImage"
).innerHTML =
data.image_url

?

`



Current photo:



src="${escapeAttribute(
data.image_url
)}"
alt=""
>


`

:

"";

document
.getElementById(
"galleryModal"
)
.classList.add("show");

}

/* =========================================================
SAVE GALLERY
========================================================= */

async function saveGallery(event) {

event.preventDefault();

const id =
document.getElementById(
"galleryId"
).value;

const tourId =
document.getElementById(
"galleryTour"
).value;

const title =
document.getElementById(
"galleryTitle"
).value
.trim();

const caption =
document.getElementById(
"galleryCaption"
).value
.trim();

const sortOrder =
Number(
document.getElementById(
"gallerySortOrder"
).value
) || 0;

const file =
document.getElementById(
"galleryImage"
).files[0];

if (!tourId) {

showMessage(
"Please select a tour.",
true
);

return;

}

let existing = null;

if (id) {

const result =
await supabase
.from("tour_gallery")
.select("*")
.eq("id", id)
.single();

if (result.error) {

showMessage(
result.error.message,
true
);

return;

}

existing =
result.data;

}

let imagePath =
existing?.image_path ||
null;

let imageUrl =
existing?.image_url ||
null;

if (file) {

const tour =
tours.find(
function (t) {

return String(t.id) ===
String(tourId);

}
);

const slug =
createSafeSlug(
tour?.slug ||
tour?.title ||
"tour"
);

const uploaded =
await uploadGalleryImage(
file,
slug
);

if (!uploaded) return;

imagePath =
uploaded.path;

imageUrl =
uploaded.url;

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
"Please select a gallery photo.",
true
);

return;

}

const payload = {

tour_id:
tourId,

title:
title,

caption:
caption,

image_path:
imagePath,

image_url:
imageUrl,

sort_order:
sortOrder,

updated_at:
new Date().toISOString()

};

let result;

if (id) {

result =
await supabase
.from("tour_gallery")
.update(payload)
.eq("id", id);

} else {

result =
await supabase
.from("tour_gallery")
.insert(payload);

}

if (result.error) {

showMessage(
result.error.message,
true
);

return;

}

closeModal(
"galleryModal"
);

showMessage(
"Gallery photo saved."
);

await loadGallery();

}

/* =========================================================
DELETE GALLERY
========================================================= */

async function deleteGallery(id) {

if (
!confirm(
"Delete this gallery photo?"
)
) {

return;

}

const {
data,
error
} = await supabase
.from("tour_gallery")
.select("image_path")
.eq("id", id)
.single();

if (error) {

showMessage(
error.message,
true
);

return;

}

const result =
await supabase
.from("tour_gallery")
.delete()
.eq("id", id);

if (result.error) {

showMessage(
result.error.message,
true
);

return;

}

if (data?.image_path) {

await deleteStorageFile(
data.image_path
);

}

showMessage(
"Gallery photo deleted."
);

await loadGallery();

}

/* =========================================================
DESTINATION LOCATIONS
========================================================= */

async function loadLocations() {

const grid =
document.getElementById(
"locationsAdminGrid"
);

if (!grid) return;

grid.innerHTML =
"Loading locations...";

try {

const {
data,
error
} = await supabase
.from("destination_locations")
.select(`
*,
destinations (
id,
name,
slug
)
`)
.order(
"location_number",
{
ascending: true
}
);

if (error) {

console.error(
"Locations error:",
error
);

grid.innerHTML = `

Could not load locations.


${escapeHTML(
error.message
)}


`;

return;

}

if (!data || !data.length) {

grid.innerHTML = `

No destination locations added yet.

`;

return;

}

grid.innerHTML =
data
.map(function (location) {

const number =
String(
location.location_number
).padStart(2, "0");

return `



${
location.image_url

?

`
src="${escapeAttribute(
location.image_url
)}"
alt="${escapeAttribute(
location.name
)}"
>
`

:

`

No image

`
}





${number}

•

${escapeHTML(
location
.destinations
?.name || ""
)}




${escapeHTML(
location.name
)}



${escapeHTML(
location.description ||
""
)}





class="adminBtn secondary small"
onclick="window.editLocation(
'${escapeAttribute(
location.id
)}'
)"
>
Edit


class="adminBtn danger small"
onclick="window.deleteLocation(
'${escapeAttribute(
location.id
)}'
)"
>
Delete








`;

})
.join("");

} catch (error) {

console.error(
"loadLocations fatal:",
error
);

grid.innerHTML = `

Error loading locations.

`;

}

}

/* =========================================================
LOCATION DESTINATIONS
========================================================= */

function populateLocationDestinations(
selectedId = ""
) {

const select =
document.getElementById(
"locationDestination"
);

if (!select) return;

if (!destinations.length) {

select.innerHTML = `
No destinations available
`;

return;

}

select.innerHTML =
destinations
.map(function (destination) {

return `

value="${escapeAttribute(
destination.id
)}"
${
String(destination.id) ===
String(selectedId)
? "selected"
: ""
}
>
${escapeHTML(
destination.name
)}


`;

})
.join("");

}

/* =========================================================
ADD LOCATION
========================================================= */

function openLocationAdd() {

currentLocationId =
null;

document.getElementById(
"locationForm"
).reset();

document.getElementById(
"locationId"
).value = "";

document.getElementById(
"locationModalTitle"
).textContent =
"Add Destination Location";

document.getElementById(
"locationCurrentImage"
).innerHTML = "";

populateLocationDestinations();

document
.getElementById(
"locationModal"
)
.classList.add("show");

}

/* =========================================================
EDIT LOCATION
========================================================= */

async function editLocation(id) {

const {
data,
error
} = await supabase
.from("destination_locations")
.select("*")
.eq("id", id)
.single();

if (error) {

showMessage(
error.message,
true
);

return;

}

currentLocationId =
id;

document.getElementById(
"locationId"
).value =
id;

populateLocationDestinations(
data.destination_id
);

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
"locationModalTitle"
).textContent =
"Edit Destination Location";

document.getElementById(
"locationCurrentImage"
).innerHTML =
data.image_url

?

`



Current photo:



src="${escapeAttribute(
data.image_url
)}"
alt=""
>


`

:

"";

document
.getElementById(
"locationModal"
)
.classList.add("show");

}

/* =========================================================
SAVE LOCATION
========================================================= */

async function saveLocation(event) {

event.preventDefault();

const id =
document.getElementById(
"locationId"
).value;

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
).value
.trim();

const description =
document.getElementById(
"locationDescription"
).value
.trim();

const file =
document.getElementById(
"locationImage"
).files[0];

if (!destinationId) {

showMessage(
"Please select a destination.",
true
);

return;

}

let existing = null;

if (id) {

const result =
await supabase
.from("destination_locations")
.select("*")
.eq("id", id)
.single();

if (result.error) {

showMessage(
result.error.message,
true
);

return;

}

existing =
result.data;

}

let imagePath =
existing?.image_path ||
null;

let imageUrl =
existing?.image_url ||
null;

if (file) {

const destination =
destinations.find(
function (d) {

return String(d.id) ===
String(destinationId);

}
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

imagePath =
uploaded.path;

imageUrl =
uploaded.url;

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

destination_id:
destinationId,

location_number:
locationNumber,

name:
name,

description:
description,

image_path:
imagePath,

image_url:
imageUrl,

sort_order:
locationNumber,

updated_at:
new Date().toISOString()

};

let result;

if (id) {

result =
await supabase
.from("destination_locations")
.update(payload)
.eq("id", id);

} else {

result =
await supabase
.from("destination_locations")
.insert(payload);

}

if (result.error) {

showMessage(
result.error.message,
true
);

return;

}

closeModal(
"locationModal"
);

showMessage(
"Destination location saved."
);

await loadLocations();

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
data,
error
} = await supabase
.from("destination_locations")
.select("image_path")
.eq("id", id)
.single();

if (error) {

showMessage(
error.message,
true
);

return;

}

const result =
await supabase
.from("destination_locations")
.delete()
.eq("id", id);

if (result.error) {

showMessage(
result.error.message,
true
);

return;

}

if (data?.image_path) {

await deleteStorageFile(
data.image_path
);

}

showMessage(
"Location deleted."
);

await loadLocations();

}

/* =========================================================
REVIEWS
========================================================= */

async function loadReviews() {

const grid =
document.getElementById(
"reviewsAdminGrid"
);

if (!grid) return;

grid.innerHTML =
"Loading reviews...";

try {

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
photo_path
`)
.order(
"id",
{
ascending: false
}
);

if (error) {

console.error(
"Reviews error:",
error
);

grid.innerHTML = `

Could not load reviews.


${escapeHTML(
error.message
)}


`;

return;

}

if (!data || !data.length) {

grid.innerHTML = `

No reviews yet.

`;

return;

}

grid.innerHTML =
data
.map(function (review) {

let photo = "";

if (
review.photo_path
) {

const result =
supabase
.storage
.from(
"review-photos"
)
.getPublicUrl(
review.photo_path
);

photo =
result
?.data
?.publicUrl ||
"";

}

const rating =
Math.max(
0,
Math.min(
5,
Number(
review.rating
) || 0
)
);

return `



${
photo

?

`
src="${escapeAttribute(
photo
)}"
alt="${escapeAttribute(
review.name
)}"
>
`

:

""
}




${escapeHTML(
review.name
)}



${escapeHTML(
review.country ||
""
)}




${"★".repeat(
rating
)}




${escapeHTML(
review.review ||
""
)}





class="adminBtn danger small"
onclick="window.deleteReview(
'${escapeAttribute(
review.id
)}'
)"
>
Delete








`;

})
.join("");

} catch (error) {

console.error(
"loadReviews fatal:",
error
);

grid.innerHTML = `

Error loading reviews.

`;

}

}

/* =========================================================
DELETE REVIEW
========================================================= */

async function deleteReview(id) {

if (
!confirm(
"Delete this review?"
)
) {

return;

}

const result =
await supabase
.from("reviews")
.delete()
.eq("id", id);

if (result.error) {

showMessage(
result.error.message,
true
);

return;

}

showMessage(
"Review deleted."
);

await loadReviews();

}

/* =========================================================
STORAGE - GENERAL IMAGE
========================================================= */

async function uploadImage(
file,
type,
slug
) {

if (
!validateImage(file)
) {

return null;

}

const extension =
getSafeExtension(
file.name
);

const filename =
`${Date.now()}-${getRandomId()}.${extension}`;

const folder =
type === "destination"
? "destinations"
: "tours";

const path =
`${folder}/${slug}/${filename}`;

const {
error
} = await supabase
.storage
.from("site-images")
.upload(
path,
file,
{
cacheControl:
"3600",

upsert:
false
}
);

if (error) {

showMessage(
error.message,
true
);

return null;

}

const publicUrl =
supabase
.storage
.from("site-images")
.getPublicUrl(
path
)
.data
.publicUrl;

return {

path:
path,

url:
publicUrl

};

}

/* =========================================================
STORAGE - GALLERY
========================================================= */

async function uploadGalleryImage(
file,
slug
) {

if (
!validateImage(file)
) {

return null;

}

const extension =
getSafeExtension(
file.name
);

const filename =
`${Date.now()}-${getRandomId()}.${extension}`;

const path =
`gallery/${slug}/${filename}`;

const {
error
} = await supabase
.storage
.from("site-images")
.upload(
path,
file,
{
cacheControl:
"3600",

upsert:
false
}
);

if (error) {

showMessage(
error.message,
true
);

return null;

}

const publicUrl =
supabase
.storage
.from("site-images")
.getPublicUrl(
path
)
.data
.publicUrl;

return {

path:
path,

url:
publicUrl

};

}

/* =========================================================
STORAGE - LOCATION
========================================================= */

async function uploadLocationImage(
file,
slug,
number
) {

if (
!validateImage(file)
) {

return null;

}

const extension =
getSafeExtension(
file.name
);

const filename =
`${String(number).padStart(2, "0")}-${Date.now()}-${getRandomId()}.${extension}`;

const path =
`locations/${slug}/${filename}`;

const {
error
} = await supabase
.storage
.from("site-images")
.upload(
path,
file,
{
cacheControl:
"3600",

upsert:
false
}
);

if (error) {

showMessage(
error.message,
true
);

return null;

}

const publicUrl =
supabase
.storage
.from("site-images")
.getPublicUrl(
path
)
.data
.publicUrl;

return {

path:
path,

url:
publicUrl

};

}

/* =========================================================
STORAGE DELETE
========================================================= */

async function deleteStorageFile(
path
) {

if (!path) return;

const {
error
} = await supabase
.storage
.from("site-images")
.remove([
path
]);

if (error) {

console.warn(
"Storage delete failed:",
error
);

}

}

/* =========================================================
DELETE DESTINATION / TOUR
========================================================= */

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
) {

return;

}

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

showMessage(
error.message,
true
);

return;

}

const result =
await supabase
.from(table)
.delete()
.eq("id", id);

if (result.error) {

showMessage(
result.error.message,
true
);

return;

}

/*
Try to delete cover image.
*/

if (
data?.image_path
) {

await deleteStorageFile(
data.image_path
);

}

showMessage(
`${label} deleted.`
);

if (
type === "destination"
) {

await loadDestinations();

await loadLocations();

} else {

await loadTours();

await loadGallery();

}

}

/* =========================================================
IMAGE VALIDATION
========================================================= */

function validateImage(
file
) {

if (!file) {

showMessage(
"Please select an image.",
true
);

return false;

}

const allowed = [

"image/jpeg",

"image/png",

"image/webp",

"image/gif"

];

if (
!allowed.includes(
file.type
)
) {

showMessage(
"Only JPG, PNG, WEBP and GIF images are allowed.",
true
);

return false;

}

if (
file.size >
5 * 1024 * 1024
) {

showMessage(
"Maximum image size is 5 MB.",
true
);

return false;

}

return true;

}

/* =========================================================
FILE EXTENSION
========================================================= */

function getSafeExtension(
filename
) {

const name =
String(
filename || ""
)
.toLowerCase();

const lastDot =
name.lastIndexOf(".");

if (
lastDot === -1
) {

return "jpg";

}

const extension =
name.substring(
lastDot + 1
);

const allowed = [

"jpg",

"jpeg",

"png",

"webp",

"gif"

];

if (
allowed.includes(
extension
)
) {

return extension;

}

return "jpg";

}

/* =========================================================
SAFE SLUG
========================================================= */

function createSafeSlug(
value
) {

let text =
String(
value || ""
)
.toLowerCase()
.trim();

/*
Do NOT use the problematic
regular expression here.
*/

let result = "";

for (
let i = 0;
i < text.length;
i++
) {

const char =
text[i];

const code =
text.charCodeAt(i);

const isLetter =
code >= 97 &&
code <= 122;

const isNumber =
code >= 48 &&
code <= 57;

if (
isLetter ||
isNumber
) {

result += char;

} else {

/*
Convert spaces/symbols
to hyphens.
*/

if (
!result.endsWith("-")
) {

result += "-";

}

}

}

/*
Remove leading hyphens.
*/

while (
result.startsWith("-")
) {

result =
result.substring(1);

}

/*
Remove trailing hyphens.
*/

while (
result.endsWith("-")
) {

result =
result.substring(
0,
result.length - 1
);

}

return result;

}

/* =========================================================
RANDOM ID
========================================================= */

function getRandomId() {

try {

if (
window.crypto &&
typeof window.crypto.randomUUID ===
"function"
) {

return window.crypto.randomUUID();

}

} catch (error) {

console.warn(
"randomUUID unavailable:",
error
);

}

return (
Date.now().toString(36) +
"-" +
Math.random()
.toString(36)
.substring(2)
);

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
.replaceAll(
"&",
"&"
)
.replaceAll(
"<",
"<"
)
.replaceAll(
">",
">"
)
.replaceAll(
'"',
"""
)
.replaceAll(
"'",
"'"
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
MESSAGE
========================================================= */

function showMessage(
message,
isError = false
) {

const box =
document.getElementById(
"adminMessage"
);

if (!box) {

console.log(
message
);

return;

}

box.innerHTML = `

class="message ${
isError
? "error"
: ""
}"
>
${escapeHTML(message)}


`;

setTimeout(
function () {

if (box) {

box.innerHTML =
"";

}

},
5000
);

}

/* =========================================================
CLOSE MODAL
========================================================= */

function closeModal(
id
) {

const modal =
document.getElementById(
id
);

if (modal) {

modal.classList.remove(
"show"
);

}

}

/* =========================================================
QUICK MANAGER - TOUR GALLERY
========================================================= */

function manageTourGallery(
id
) {

openGalleryAdd();

const select =
document.getElementById(
"galleryTour"
);

if (select) {

select.value =
String(id);

}

}

/* =========================================================
QUICK MANAGER - DESTINATION LOCATIONS
========================================================= */

function manageDestinationLocations(
id
) {

openLocationAdd();

const select =
document.getElementById(
"locationDestination"
);

if (select) {

select.value =
String(id);

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

console.error(
"Logout error:",
error
);

}

} catch (error) {

console.error(
"Logout exception:",
error
);

}

window.location.href =
"admin.html";

}

/* =========================================================
GLOBAL FUNCTIONS
========================================================= */

window.editContent =
editContent;

window.deleteContent =
deleteContent;

window.editGallery =
editGallery;

window.deleteGallery =
deleteGallery;

window.editLocation =
editLocation;

window.deleteLocation =
deleteLocation;

window.deleteReview =
deleteReview;

window.manageTourGallery =
manageTourGallery;

window.manageDestinationLocations =
manageDestinationLocations;

/* =========================================================
END
========================================================= */

console.log(
"admin-dashboard.js loaded."
);
