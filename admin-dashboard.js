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

window.location.replace("admin.html");

return false;
}

return true;
}

/* =========================================================
START ADMIN
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
loadTours(),
loadReviews()
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










TWS




Travel With Sri Lanka



Website Content Management








href="index.html"
target="_blank"
class="viewBtn"
>
View Website ↗


id="logoutBtn"
class="logoutBtn"
>
Logout






id="message"
class="message"
>











WEBSITE CONTENT



Destinations



Manage destinations and main destination photos.





id="addDestinationBtn"
class="primaryBtn"
>
+ Add Destination




id="destinationsList"
class="contentGrid"
>

Loading destinations...














DESTINATION CONTENT



📍 Destination Locations



Manage up to 10 famous locations for every destination.










Select Destination


id="locationDestinationSelect"
>
Select a destination...




id="locationsList"
class="locationAdminGrid"
>

Select a destination to manage its 10 locations.














WEBSITE CONTENT



Tours



Add, edit, delete and update tour information.





id="addTourBtn"
class="primaryBtn"
>
+ Add Tour




id="toursList"
class="contentGrid"
>

Loading tours...














TOUR MEDIA



📸 Tour Gallery



Upload and manage photos for each tour.










Select Tour


id="galleryTourSelect"
>
Select a tour...




class="galleryUploadBox"
>




Add Tour Photos



JPG, PNG, WEBP or GIF • Maximum 5 MB each





id="addGalleryPhotoBtn"
class="primaryBtn"
disabled
>
+ Add Photo




id="tourGalleryList"
class="galleryAdminGrid"
>

Select a tour to manage its gallery.














CUSTOMER CONTENT



Traveler Reviews



Customer reviews submitted from the website.





id="refreshReviewsBtn"
class="secondaryBtn"
>
↻ Refresh




id="reviewsList"
class="reviewAdminGrid"
>

Loading reviews...







id="contentModal"
class="modal"
>



id="closeModal"
class="closeBtn"
type="button"
>
×



CONTENT EDITOR



Add Content




type="hidden"
id="contentId"
>

type="hidden"
id="contentType"
>


Name / Title


type="text"
id="contentName"
required
maxlength="150"
>


Slug


type="text"
id="contentSlug"
required
maxlength="100"
placeholder="ella"
>


Description


id="contentDescription"
rows="5"
maxlength="1000"
>


Page URL


type="text"
id="contentPageUrl"
placeholder="ella.html"
>


Current Image


id="currentImage"
class="currentImage"
>

No image selected.




Upload New Image


type="file"
id="contentImage"
accept="image/jpeg,image/png,image/webp,image/gif"
>


Maximum size: 5 MB



Sort Order


type="number"
id="contentSortOrder"
value="1"
min="0"
max="999"
>

type="submit"
class="saveBtn"
>
Save Changes










id="locationModal"
class="modal"
>



id="closeLocationModal"
class="closeBtn"
type="button"
>
×



DESTINATION LOCATION



Location 01




type="hidden"
id="locationId"
>

type="hidden"
id="locationDestinationId"
>

type="hidden"
id="locationNumber"
>


Location Number


type="text"
id="locationNumberDisplay"
disabled
>


Location Name


type="text"
id="locationName"
maxlength="150"
required
>


Description


id="locationDescription"
rows="5"
maxlength="1000"
>


Current Photo


id="locationCurrentImage"
class="currentImage"
>

No image uploaded.




Upload / Replace Photo


type="file"
id="locationImage"
accept="image/jpeg,image/png,image/webp,image/gif"
>


Maximum size: 5 MB



Sort Order


type="number"
id="locationSortOrder"
min="1"
max="10"
>

type="submit"
class="saveBtn"
>
Save Location










id="galleryModal"
class="modal"
>



id="closeGalleryModal"
class="closeBtn"
type="button"
>
×



TOUR GALLERY



Add Tour Photo




type="hidden"
id="galleryTourId"
>


Photo Title / Caption


type="text"
id="galleryTitle"
maxlength="150"
placeholder="Ella Mountain Experience"
>


Select Photo


type="file"
id="galleryImage"
accept="image/jpeg,image/png,image/webp,image/gif"
required
>


Maximum size: 5 MB



Sort Order


type="number"
id="gallerySortOrder"
min="0"
max="999"
value="1"
>

type="submit"
class="saveBtn"
>
Upload Photo











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
"
Loading destinations...

";

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
"
No destinations found.

";

return;
}

container.innerHTML = "";

populateDestinationSelector(data);

data.forEach(
destination => {

container.appendChild(
createContentCard(
destination,
"destination"
)
);

}
);

} catch (error) {

console.error(error);

container.innerHTML = `

Failed to load destinations.



${escapeHTML(error.message)}

`;
}
}

/* =========================================================
DESTINATION SELECTOR
========================================================= */

function populateDestinationSelector(
destinations
) {

const select =
document.getElementById(
"locationDestinationSelect"
);

if (!select) {
return;
}

const current =
select.value;

select.innerHTML = `
Select a destination...
`;

destinations.forEach(
destination => {

const option =
document.createElement(
"option"
);

option.value =
destination.id;

option.textContent =
destination.name || "Destination";

select.appendChild(option);

}
);

if (current) {
select.value = current;
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
"
Loading tours...

";

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
"
No tours found.

";

populateTourSelector([]);

return;
}

container.innerHTML = "";

populateTourSelector(data);

data.forEach(
tour => {

container.appendChild(
createContentCard(
tour,
"tour"
)
);

}
);

} catch (error) {

console.error(error);

container.innerHTML = `

Failed to load tours.



${escapeHTML(error.message)}

`;
}
}

/* =========================================================
TOUR SELECTOR
========================================================= */

function populateTourSelector(
tours
) {

const select =
document.getElementById(
"galleryTourSelect"
);

if (!select) {
return;
}

const current =
select.value;

select.innerHTML = `
Select a tour...
`;

tours.forEach(
tour => {

const option =
document.createElement(
"option"
);

option.value =
tour.id;

option.textContent =
tour.title || "Tour";

select.appendChild(option);

}
);

if (current) {
select.value = current;
}

updateGalleryButton();
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
? ` src="${escapeAttribute(item.image_url)}"
class="contentImage"
alt="${escapeAttribute(
type === "tour"
? item.title || "Tour"
: item.name || "Destination"
)}"
>`
: `
`;

const title =
type === "tour"
? item.title
: item.name;

card.innerHTML = `

${image}




${escapeHTML(title || "")}



/${escapeHTML(item.slug || "")}



${escapeHTML(
item.description || ""
)}





class="editBtn"
data-id="${escapeAttribute(item.id)}"
data-type="${type}"
>
Edit


class="deleteBtn"
data-id="${escapeAttribute(item.id)}"
data-type="${type}"
>
Delete





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
"
Loading reviews...

";

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
"
No reviews found.

";

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

Failed to load reviews.



${escapeHTML(error.message)}

`;
}
}

/* =========================================================
REVIEW CARD
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




${"★".repeat(rating)}
${"☆".repeat(5-rating)}



${escapeHTML(review.review || "")}






${escapeHTML(
review.name || "Traveler"
)}



${escapeHTML(
review.country || ""
)}





`;

return card;
}

/* =========================================================
LOCATION LOADING
========================================================= */

async function loadLocations(
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

container.innerHTML = `

Select a destination to manage its 10 locations.

`;

return;
}

container.innerHTML =
"
Loading locations...

";

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
.order(
"location_number",
{
ascending:true
}
);

if (error) {
throw error;
}

const locations =
Array.isArray(data)
? data
: [];

const byNumber =
new Map(
locations.map(
location => [
Number(location.location_number),
location
]
)
);

container.innerHTML = "";

for (
let number = 1;
number <= 10;
number++
) {

const location =
byNumber.get(number) || {
id:null,
destination_id:destinationId,
location_number:number,
name:"",
description:"",
image_path:"",
image_url:"",
sort_order:number
};

container.appendChild(
createLocationAdminCard(
location
)
);

}

} catch (error) {

console.error(
"Location loading error:",
error
);

container.innerHTML = `

Failed to load locations.



${escapeHTML(error.message)}

`;
}
}

/* =========================================================
LOCATION CARD
========================================================= */

function createLocationAdminCard(
location
) {

const card =
document.createElement(
"article"
);

card.className =
"locationAdminCard";

const number =
Number(
location.location_number
) || 1;

const imageHTML =
location.image_url
? `
class="locationAdminImage"
src="${escapeAttribute(location.image_url)}"
alt="${escapeAttribute(
location.name ||
`Location ${number}`
)}"
>
`
: `

`;

const name =
location.name ||
`Location ${String(number).padStart(2,"0")}`;

card.innerHTML = `

${imageHTML}




LOCATION ${String(number).padStart(2,"0")}



${escapeHTML(name)}



${escapeHTML(
location.description ||
"No description added yet."
)}





class="locationEdit"
data-location-id="${escapeAttribute(
location.id || ""
)}"
data-destination-id="${escapeAttribute(
location.destination_id
)}"
data-location-number="${number}"
>
${location.id ? "Edit" : "Add"}


class="locationDelete"
data-location-id="${escapeAttribute(
location.id || ""
)}"
data-image-path="${escapeAttribute(
location.image_path || ""
)}"
${location.id ? "" : "disabled"}
>
Delete





`;

return card;
}

/* =========================================================
OPEN LOCATION MODAL
========================================================= */

async function openLocationModal(
locationId,
destinationId,
locationNumber
) {

let data = null;

if (locationId) {

const {
data: row,
error
} = await supabase
.from("destination_locations")
.select("*")
.eq("id", locationId)
.single();

if (error) {

alert(
"Failed to load location:\n\n" +
error.message
);

return;
}

data = row;
}

const number =
Number(locationNumber) || 1;

document.getElementById(
"locationModal"
).style.display = "block";

document.getElementById(
"locationModalTitle"
).textContent =
`Location ${String(number).padStart(2,"0")}`;

document.getElementById(
"locationId"
).value =
data?.id || "";

document.getElementById(
"locationDestinationId"
).value =
destinationId;

document.getElementById(
"locationNumber"
).value =
number;

document.getElementById(
"locationNumberDisplay"
).value =
`Location ${String(number).padStart(2,"0")}`;

document.getElementById(
"locationName"
).value =
data?.name || "";

document.getElementById(
"locationDescription"
).value =
data?.description || "";

document.getElementById(
"locationSortOrder"
).value =
data?.sort_order ?? number;

document.getElementById(
"locationImage"
).value = "";

const currentImage =
document.getElementById(
"locationCurrentImage"
);

if (data?.image_url) {

currentImage.innerHTML = `
src="${escapeAttribute(data.image_url)}"
alt="Current location image"
>
`;

} else {

currentImage.innerHTML =
"
No image uploaded.

";
}
}

/* =========================================================
SAVE LOCATION
========================================================= */

async function saveLocation(
event
) {

event.preventDefault();

const id =
document.getElementById(
"locationId"
).value.trim();

const destinationId =
document.getElementById(
"locationDestinationId"
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

const sortOrder =
Number(
document.getElementById(
"locationSortOrder"
).value
) || locationNumber;

const file =
document.getElementById(
"locationImage"
).files?.[0] || null;

const button =
document.querySelector(
"#locationForm .saveBtn"
);

if (
!destinationId ||
!locationNumber ||
!name
) {

alert(
"Destination, location number and name are required."
);

return;
}

button.disabled = true;
button.textContent =
"Saving...";

try {

let imagePath = null;
let imageUrl = null;

if (file) {

const uploaded =
await uploadManagedImage(
file,
"location",
destinationId,
locationNumber
);

imagePath =
uploaded.path;

imageUrl =
uploaded.url;
}

const payload = {

destination_id:
destinationId,

location_number:
locationNumber,

name,

description,

sort_order:
sortOrder

};

if (imagePath && imageUrl) {

payload.image_path =
imagePath;

payload.image_url =
imageUrl;
}

let result;

if (id) {

result =
await supabase
.from(
"destination_locations"
)
.update(payload)
.eq(
"id",
id
);

} else {

result =
await supabase
.from(
"destination_locations"
)
.insert(payload);
}

if (result.error) {
throw result.error;
}

showMessage(
id
? "Location updated successfully."
: "Location added successfully."
);

closeLocationModal();

await loadLocations(
destinationId
);

} catch (error) {

console.error(
"Save location error:",
error
);

alert(
"Location save failed:\n\n" +
error.message
);

} finally {

button.disabled = false;
button.textContent =
"Save Location";
}
}

/* =========================================================
DELETE LOCATION
========================================================= */

async function deleteLocation(
id,
imagePath,
destinationId
) {

if (!id) {
return;
}

const confirmed =
confirm(
"Delete this location and its photo?"
);

if (!confirmed) {
return;
}

try {

const {
error
} = await supabase
.from(
"destination_locations"
)
.delete()
.eq(
"id",
id
);

if (error) {
throw error;
}

if (imagePath) {

await supabase
.storage
.from("site-images")
.remove([
imagePath
]);

}

showMessage(
"Location deleted successfully."
);

await loadLocations(
destinationId
);

} catch (error) {

console.error(
"Delete location error:",
error
);

alert(
"Location delete failed:\n\n" +
error.message
);
}
}

/* =========================================================
TOUR GALLERY LOADING
========================================================= */

async function loadTourGallery(
tourId
) {

const container =
document.getElementById(
"tourGalleryList"
);

if (!container) {
return;
}

if (!tourId) {

container.innerHTML = `

Select a tour to manage its gallery.

`;

return;
}

container.innerHTML =
"
Loading gallery...

";

try {

const {
data,
error
} = await supabase
.from("tour_gallery")
.select("*")
.eq(
"tour_id",
tourId
)
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

container.innerHTML = `

No gallery photos yet.



Click "Add Photo" to upload the first photo.

`;

return;
}

container.innerHTML = "";

data.forEach(
photo => {

container.appendChild(
createGalleryCard(
photo
)
);

}
);

} catch (error) {

console.error(
"Gallery loading error:",
error
);

container.innerHTML = `

Failed to load gallery.



${escapeHTML(error.message)}

`;
}
}

/* =========================================================
GALLERY CARD
========================================================= */

function createGalleryCard(
photo
) {

const card =
document.createElement(
"article"
);

card.className =
"galleryAdminCard";

card.innerHTML = `

src="${escapeAttribute(photo.image_url)}"
alt="${escapeAttribute(
photo.title || "Tour Gallery"
)}"
>




${escapeHTML(
photo.title ||
"Tour Photo"
)}



Sort Order:
${escapeHTML(
photo.sort_order ?? 0
)}



class="galleryDeleteBtn"
data-gallery-id="${escapeAttribute(
photo.id
)}"
data-image-path="${escapeAttribute(
photo.image_path || ""
)}"
data-tour-id="${escapeAttribute(
photo.tour_id
)}"
>
Delete Photo



`;

return card;
}

/* =========================================================
GALLERY BUTTON
========================================================= */

function updateGalleryButton() {

const select =
document.getElementById(
"galleryTourSelect"
);

const button =
document.getElementById(
"addGalleryPhotoBtn"
);

if (!select || !button) {
return;
}

button.disabled =
!select.value;
}

/* =========================================================
OPEN GALLERY MODAL
========================================================= */

function openGalleryModal() {

const select =
document.getElementById(
"galleryTourSelect"
);

if (!select?.value) {

alert(
"Please select a tour first."
);

return;
}

document.getElementById(
"galleryModal"
).style.display =
"block";

document.getElementById(
"galleryTourId"
).value =
select.value;

document.getElementById(
"galleryTitle"
).value = "";

document.getElementById(
"galleryImage"
).value = "";

document.getElementById(
"gallerySortOrder"
).value = "1";
}

/* =========================================================
SAVE GALLERY PHOTO
========================================================= */

async function saveGalleryPhoto(
event
) {

event.preventDefault();

const tourId =
document.getElementById(
"galleryTourId"
).value;

const title =
document.getElementById(
"galleryTitle"
).value.trim();

const sortOrder =
Number(
document.getElementById(
"gallerySortOrder"
).value
) || 0;

const file =
document.getElementById(
"galleryImage"
).files?.[0] || null;

const button =
document.querySelector(
"#galleryForm .saveBtn"
);

if (!tourId || !file) {

alert(
"Please select a tour and photo."
);

return;
}

button.disabled = true;
button.textContent =
"Uploading...";

try {

const uploaded =
await uploadManagedImage(
file,
"gallery",
tourId,
Date.now()
);

const {
error
} = await supabase
.from("tour_gallery")
.insert({

tour_id:
tourId,

title:
title || null,

image_path:
uploaded.path,

image_url:
uploaded.url,

sort_order:
sortOrder

});

if (error) {
throw error;
}

showMessage(
"Tour gallery photo uploaded successfully."
);

closeGalleryModal();

await loadTourGallery(
tourId
);

} catch (error) {

console.error(
"Gallery upload error:",
error
);

alert(
"Gallery upload failed:\n\n" +
error.message
);

} finally {

button.disabled = false;
button.textContent =
"Upload Photo";
}
}

/* =========================================================
DELETE GALLERY PHOTO
========================================================= */

async function deleteGalleryPhoto(
id,
imagePath,
tourId
) {

if (!id) {
return;
}

const confirmed =
confirm(
"Delete this gallery photo?"
);

if (!confirmed) {
return;
}

try {

const {
error
} = await supabase
.from("tour_gallery")
.delete()
.eq(
"id",
id
);

if (error) {
throw error;
}

if (imagePath) {

await supabase
.storage
.from("site-images")
.remove([
imagePath
]);

}

showMessage(
"Gallery photo deleted successfully."
);

await loadTourGallery(
tourId
);

} catch (error) {

console.error(
"Gallery delete error:",
error
);

alert(
"Gallery delete failed:\n\n" +
error.message
);
}
}

/* =========================================================
MANAGED IMAGE UPLOAD
========================================================= */

async function uploadManagedImage(
file,
type,
parentId,
number
) {

validateImageFile(file);

const extension =
getSafeExtension(
file.name
);

const random =
Math.random()
.toString(36)
.slice(2,8);

let folder;

if (type === "location") {

folder =
`destinations/${parentId}/locations/${String(number).padStart(2,"0")}`;

} else {

folder =
`tours/${parentId}/gallery`;
}

const fileName =
`${Date.now()}-${random}.${extension}`;

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

if (!data?.publicUrl) {

throw new Error(
"Could not create public image URL."
);
}

return {
path:filePath,
url:data.publicUrl
};
}

/* =========================================================
IMAGE VALIDATION
========================================================= */

function validateImageFile(
file
) {

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
}

/* =========================================================
ADD CONTENT MODAL
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
"
No image selected.

";
}

/* =========================================================
EDIT CONTENT MODAL
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
src="${escapeAttribute(data.image_url)}"
alt="Current image"
>
`;

} else {

currentImage.innerHTML =
"
No image uploaded.

";
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
"#contentForm .saveBtn"
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
page_url:
pageUrl || null,
sort_order:
sortOrder
}
: {
title:name,
slug,
description,
page_url:
pageUrl || null,
sort_order:
sortOrder
};

if (imageUrl) {

dataToSave.image_url =
imageUrl;
}

if (id) {

const {
error
} = await supabase
.from(table)
.update(dataToSave)
.eq(
"id",
id
);

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
EXISTING MAIN IMAGE UPLOAD
========================================================= */

async function uploadImage(
file,
type,
slug
) {

validateImageFile(file);

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
DELETE CONTENT
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
.eq(
"id",
id
);

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
CLOSE MODALS
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

function closeLocationModal() {

const modal =
document.getElementById(
"locationModal"
);

if (modal) {
modal.style.display =
"none";
}
}

function closeGalleryModal() {

const modal =
document.getElementById(
"galleryModal"
);

if (modal) {
modal.style.display =
"none";
}
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
"closeLocationModal"
)
?.addEventListener(
"click",
closeLocationModal
);

document
.getElementById(
"closeGalleryModal"
)
?.addEventListener(
"click",
closeGalleryModal
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
"locationForm"
)
?.addEventListener(
"submit",
saveLocation
);

document
.getElementById(
"galleryForm"
)
?.addEventListener(
"submit",
saveGalleryPhoto
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

document
.getElementById(
"locationDestinationSelect"
)
?.addEventListener(
"change",
event => {

loadLocations(
event.target.value
);

}
);

document
.getElementById(
"galleryTourSelect"
)
?.addEventListener(
"change",
event => {

updateGalleryButton();

loadTourGallery(
event.target.value
);

}
);

document
.getElementById(
"addGalleryPhotoBtn"
)
?.addEventListener(
"click",
openGalleryModal
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

const locationEdit =
event.target.closest(
".locationEdit"
);

const locationDelete =
event.target.closest(
".locationDelete"
);

const galleryDelete =
event.target.closest(
".galleryDeleteBtn"
);

if (edit) {

openEditModal(
edit.dataset.id,
edit.dataset.type
);

return;
}

if (del) {

deleteContent(
del.dataset.id,
del.dataset.type
);

return;
}

if (locationEdit) {

openLocationModal(
locationEdit.dataset.locationId,
locationEdit.dataset.destinationId,
locationEdit.dataset.locationNumber
);

return;
}

if (
locationDelete &&
!locationDelete.disabled
) {

deleteLocation(
locationDelete.dataset.locationId,
locationDelete.dataset.imagePath,
document.getElementById(
"locationDestinationSelect"
).value
);

return;
}

if (galleryDelete) {

deleteGalleryPhoto(
galleryDelete.dataset.galleryId,
galleryDelete.dataset.imagePath,
galleryDelete.dataset.tourId
);

}

}
);

window.addEventListener(
"click",
event => {

const contentModal =
document.getElementById(
"contentModal"
);

const locationModal =
document.getElementById(
"locationModal"
);

const galleryModal =
document.getElementById(
"galleryModal"
);

if (
event.target ===
contentModal
) {

closeModal();
}

if (
event.target ===
locationModal
) {

closeLocationModal();
}

if (
event.target ===
galleryModal
) {

closeGalleryModal();
}

}
);

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






Admin Panel Error



${escapeHTML(message)}



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
.replace(
/[^a-z0-9]+/g,
"-"
)
.replace(
/^-+|-+$/g,
""
)
.slice(
0,
80
);
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
"&"
)
.replace(
/ "<"
)
.replace(
/>/g,
">"
)
.replace(
/"/g,
"""
)
.replace(
/'/g,
"'"
);
}

function escapeAttribute(
value
) {

return escapeHTML(value);
}
