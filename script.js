/* =========================================================================
   BizLocate / SiteIQ  —  script.js
   One shared file for every page. Plain, basic JavaScript only:
   variables, functions, default parameters, closures, DOM manipulation,
   event listeners (click / submit / input / scroll), localStorage.
   No frameworks, no build step.
   ========================================================================= */

/* -------------------------------------------------------------------------
   1. STORAGE KEYS
   ------------------------------------------------------------------------- */
const STORAGE_KEYS = {
  USERS: "bizlocate_users",
  CURRENT_USER: "bizlocate_current_user_id",
  LISTINGS: "bizlocate_listings",
  REQUIREMENTS: "bizlocate_requirements",   // object keyed by userId
  WISHLIST: "bizlocate_wishlist",           // object keyed by userId -> array of listing ids
  ENQUIRIES: "bizlocate_enquiries"
};

/* -------------------------------------------------------------------------
   2. GENERIC LOCAL STORAGE HELPERS (closures over window.localStorage)
   ------------------------------------------------------------------------- */

// getData -> reads a key from localStorage and parses it as JSON.
// A default parameter is used so callers don't have to pass a fallback.
function getData(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error("Storage read failed for", key, err);
    return fallback;
  }
}

// setData -> stringifies and writes a value into localStorage.
function setData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error("Storage write failed for", key, err);
    return false;
  }
}

/* -------------------------------------------------------------------------
   3. TOAST NOTIFICATIONS (basic DOM manipulation, no design change)
   ------------------------------------------------------------------------- */
function ensureToastContainer() {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message, type = "success", duration = 2600) {
  const container = ensureToastContainer();
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  // Trigger the CSS transition on the next frame
  setTimeout(() => toast.classList.add("show"), 10);

  // Auto remove after `duration`
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* -------------------------------------------------------------------------
   4. SEED DATA — runs once so the site isn't empty on first load
   ------------------------------------------------------------------------- */
function seedListingsIfEmpty() {
  const existing = getData(STORAGE_KEYS.LISTINGS, null);
  if (existing && existing.length > 0) return; // already seeded

  const seed = [
    {
      id: 1,
      title: "Bhiwandi Logistics Park",
      type: "warehousing",
      location: "Bhiwandi, Maharashtra",
      area: 150000,
      rent: 22,
      power: 500,
      height: "12 Meters",
      docks: "16 (Dock Levelers)",
      flooring: "FM2 (5T/sqm)",
      zoning: "MIDC Approved",
      truckAccess: true,
      grade: "Grade A",
      status: "Available",
      ownerId: "seed-owner-1",
      ownerName: "Industrial Brokers India",
      description: "Strategically located along the Mumbai-Nashik Highway, this Grade A logistics facility offers state-of-the-art infrastructure designed for modern supply chain operations.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBOrj67eFfgCdS7Wp1xFjuXaTrNAn3q7xcfWt2utd99xdigFLhhI-1zAtPjtK001Aw-jkbIYTB6f48pqTmdh7SOwZ0N3wG8EqCzuIvBYY3xVw5yD8lKArEpj2YJyaO_axwQasHQG5tYxCprUY4SifqKRc8KHK6aUYP0XihuQv0PBB066pkAslVSR4goSDMdI7QBsMLykU--k_Qb38NsjoK7w55YurLlccvORjiO-S1XlEp-Wkh248nn"
    },
    {
      id: 2,
      title: "Grade A Logistics Warehouse",
      type: "warehousing",
      location: "Chakan Industrial Area, Pune Phase II",
      area: 120000,
      rent: 22,
      power: 250,
      height: "12m Clear",
      docks: "Dock Levelers",
      flooring: "Fire Sprinklers",
      zoning: "MIDC Approved",
      truckAccess: true,
      grade: "Premium",
      status: "Available",
      ownerId: "seed-owner-1",
      ownerName: "Industrial Brokers India",
      description: "Premium logistics warehouse with dock levelers and fire sprinkler system, located in Pune's Chakan industrial belt.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWu8OhFhuiZxRtL7gffoVh9cbKenir-egradAKnlmK-gdlg2fM662FZS2UurYr5x85FIXIj5bVjM9KQxBfH-om2c--1QK2ZLq5o1jkN7-gKy-vgyAtb6tlSwS3aZb-iBTMJZGrG5feZ2SPH3XIDoy9wwpsyu7Jy7QMOLM5XTD4J5fTqgrN5ZQFzAcTjHMQ4tF6JAOlCRGkPb-CLx9wTLr2JlNiKdTR222kYSB3ShzPJL0t8eMF9vms"
    },
    {
      id: 3,
      title: "Standalone Factory Setup",
      type: "manufacturing",
      location: "Talegaon MIDC, Pune",
      area: 45000,
      rent: 18,
      power: 500,
      height: "10 Ton EOT Crane",
      docks: "2",
      flooring: "Heavy Engineering Grade",
      zoning: "Standalone Factory",
      truckAccess: true,
      grade: "Standard",
      status: "Available",
      ownerId: "seed-owner-2",
      ownerName: "Talegaon Estates",
      description: "Standalone factory unit built for heavy engineering, complete with a 10-ton EOT crane and HT power connection.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAii2LSIWsL4x3aLHG50Q8Br56z0ZixryoF7eIRKfLUwF1atqdcb051a9HpU0jSKUDC8QPsysY9b33Ngdy7N2se2qZFQPCYSN95B2XD7oTR48Xyx0tv0QaOqrqjYdTX89QYj_dBJnYz87A5dHfR2u3s0mH7L8HCOcKgbH2BMoYyRONHhrQxnYNNqK8U_RyFZ9q730AeiMDFHYqBKkRkHnf55KdAxrlnOPH3ACFJS55vMTQLtBODS0ga"
    },
    {
      id: 4,
      title: "Industrial Park Facility",
      type: "manufacturing",
      location: "Gurgaon, Haryana",
      area: 80000,
      rent: 20,
      power: 300,
      height: "10 Meters",
      docks: "6",
      flooring: "Standard RCC",
      zoning: "Private Logistics Park",
      truckAccess: true,
      grade: "Grade A",
      status: "Available",
      ownerId: "seed-owner-2",
      ownerName: "Talegaon Estates",
      description: "Well connected industrial park facility in Gurgaon, suited for auto parts and light manufacturing operations.",
      image: "https://picsum.photos/seed/bizlocate-gurgaon/800/600"
    },
    {
      id: 5,
      title: "Logistics Hub Alpha",
      type: "warehousing",
      location: "Bhiwandi, Maharashtra",
      area: 50000,
      rent: 25,
      power: 200,
      height: "9 Meters",
      docks: "4",
      flooring: "FM2",
      zoning: "MIDC Approved",
      truckAccess: true,
      grade: "Standard",
      status: "Available",
      ownerId: "seed-owner-1",
      ownerName: "Industrial Brokers India",
      description: "Compact and well managed logistics hub, ideal for e-commerce fulfilment operations near Bhiwandi.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsQHyuqAf9T2ELqfaisDfSL9FqiVLPnngHi6mtXrM3B2NoMaXJBG0B2dWIQfw8saw5IxN543miChklbXznBUDmiB0NLWccYubVCnUn2mKx5XhlbYgOP3YdD14d8zy7jXu5yhbfTxCI2jqCXpfhKO3GZf4_LZ_HtBqEurFm1-F2qX1rJElA8RSm5CdN_fFz42bKOtufTfhHvuKg8yNUwHtjgfdxPKWLNCFcaIcQ1MOySIQzKR3UvhRC"
    },
    {
      id: 6,
      title: "Tech Park Facility B",
      type: "rd",
      location: "Whitefield, Bangalore",
      area: 25000,
      rent: 60,
      power: 150,
      height: "6 Meters",
      docks: "1",
      flooring: "Raised Access Flooring",
      zoning: "IT / R&D Park",
      truckAccess: false,
      grade: "Draft",
      status: "Draft",
      ownerId: "seed-owner-2",
      ownerName: "Talegaon Estates",
      description: "Flex R&D space suited for light assembly and technology operations in Whitefield, Bangalore.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCChMvDKe2PznrWEnCRA1tIjWTvp-aWPDA7PCC0O1oE2-z8mzLMH6X66cZKFsfRaprh9JqdbQD6Q4QkcxtWERIcy2rmi63qTy0YSlOckUToEfbmv85d5M8ZipcGQEB0fIOsJY4H0cJNvYL6hb5XqYeo6kyH-bAr4YLLhsaqySuH_gih2w3V9m1Udm4UpT-48hvNZMngUGtKm9lKfBqURYx1k_YboYt-cWPyLqCLTK2RwzPD_D7HZPpz"
    }
  ];

  setData(STORAGE_KEYS.LISTINGS, seed);
}

/* -------------------------------------------------------------------------
   5. AUTH
   ------------------------------------------------------------------------- */
function getUsers() {
  return getData(STORAGE_KEYS.USERS, []);
}

function findUserByEmail(email) {
  const users = getUsers();
  return users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
}

function findUserById(id) {
  const users = getUsers();
  return users.find((u) => String(u.id) === String(id));
}

function getCurrentUser() {
  const id = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!id) return null;
  return findUserById(id) || null;
}

function setCurrentUser(userId) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
}

function logout() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  showToast("Logged out successfully", "info");
  setTimeout(() => { window.location.href = "index.html"; }, 600);
}

// requireLogin -> callback pattern: runs `onSuccess` only if a user is logged in,
// otherwise redirects to login.html. Mirrors the callback function concept.
function requireLogin(onSuccess) {
  const user = getCurrentUser();
  if (!user) {
    showToast("Please login to continue", "error");
    setTimeout(() => { window.location.href = "login.html"; }, 800);
    return;
  }
  onSuccess(user);
}

function handleSignup(event) {
  event.preventDefault();

  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const roleInput = document.querySelector('input[name="role"]:checked');
  const role = roleInput ? roleInput.value : "business";

  if (!name || !email || !password) {
    showToast("Please fill in all fields", "error");
    return;
  }

  if (findUserByEmail(email)) {
    showToast("An account with this email already exists", "error");
    return;
  }

  const users = getUsers();
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password, // demo project only - plain text is fine for local learning use
    role
  };
  users.push(newUser);
  setData(STORAGE_KEYS.USERS, users);
  setCurrentUser(newUser.id);

  showToast("Account created! Redirecting...", "success");

  setTimeout(() => {
    if (role === "owner") {
      window.location.href = "owner-form.html";
    } else {
      window.location.href = "business-form.html";
    }
  }, 900);
}

function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    showToast("Invalid email or password", "error");
    return;
  }

  setCurrentUser(user.id);
  showToast(`Welcome back, ${user.name}!`, "success");

  setTimeout(() => {
    window.location.href = user.role === "owner" ? "profile.html" : "listings.html";
  }, 700);
}

/* -------------------------------------------------------------------------
   6. NAV AUTH UI — every page shares the same header markup:
   #auth-container (Login/Register) is shown when logged out,
   #user-container (Wishlist/Profile/Logout) is shown when logged in.
   ------------------------------------------------------------------------- */
function renderNavAuth() {
  const user = getCurrentUser();
  const authContainer = document.getElementById("auth-container");
  const userContainer = document.getElementById("user-container");

  if (!authContainer || !userContainer) return; // page has no shared navbar

  if (user) {
    authContainer.classList.add("hidden");
    userContainer.classList.remove("hidden");
    userContainer.classList.add("flex");
  } else {
    authContainer.classList.remove("hidden");
    userContainer.classList.add("hidden");
    userContainer.classList.remove("flex");
  }
}

/* -------------------------------------------------------------------------
   7. BUSINESS REQUIREMENTS FORM
   ------------------------------------------------------------------------- */

// getFieldValue -> default parameter usage, small reusable helper
function getFieldValue(id, fallback = "") {
  const el = document.getElementById(id);
  if (!el) return fallback;
  return el.value !== "" ? el.value : fallback;
}

function handleBusinessForm(event) {
  event.preventDefault();

  requireLogin((user) => {
    const truckAccessInput = document.querySelector('input[name="truck_access"]:checked');

    const requirement = {
      business_type: getFieldValue("business_type"),
      sqft: Number(getFieldValue("sqft", 0)),
      power: Number(getFieldValue("power", 0)),
      budget: Number(getFieldValue("budget", 0)),
      location: getFieldValue("location"),
      truckAccess: truckAccessInput ? truckAccessInput.value === "yes" : true,
      savedAt: new Date().toISOString()
    };

    const allRequirements = getData(STORAGE_KEYS.REQUIREMENTS, {});
    allRequirements[user.id] = requirement;
    setData(STORAGE_KEYS.REQUIREMENTS, allRequirements);

    showToast("Requirements saved! Finding matches...", "success");

    // setTimeout simulates a short async step (matches the event-loop /
    // callback queue concept) before moving to the matched listings.
    setTimeout(() => {
      window.location.href = "listings.html";
    }, 900);
  });
}

function getRequirementFor(userId) {
  const all = getData(STORAGE_KEYS.REQUIREMENTS, {});
  return all[userId] || null;
}

/* -------------------------------------------------------------------------
   8. OWNER FORM (List a property)
   ------------------------------------------------------------------------- */
function handleOwnerForm(event) {
  event.preventDefault();

  requireLogin((user) => {
    const truckAccessInput = document.querySelector('input[name="owner_truck_access"]:checked');

    const listing = {
      id: Date.now(),
      title: getFieldValue("owner_title", "Untitled Property"),
      type: getFieldValue("owner_type"),
      location: getFieldValue("owner_location"),
      area: Number(getFieldValue("owner_sqft", 0)),
      rent: Number(getFieldValue("owner_rent", 0)),
      power: Number(getFieldValue("owner_power", 0)),
      height: getFieldValue("owner_height", "-"),
      docks: getFieldValue("owner_docks", "-"),
      flooring: getFieldValue("owner_zoning", "-"),
      zoning: getFieldValue("owner_zoning", "-"),
      truckAccess: truckAccessInput ? truckAccessInput.value === "yes" : false,
      grade: "Standard",
      status: "Available",
      ownerId: user.id,
      ownerName: user.name,
      description: getFieldValue("owner_description", "No description provided."),
      image: getFieldValue("owner_image", "https://picsum.photos/seed/" + Date.now() + "/800/600")
    };

    const listings = getData(STORAGE_KEYS.LISTINGS, []);
    listings.push(listing);
    setData(STORAGE_KEYS.LISTINGS, listings);

    showToast("Property listed successfully!", "success");

    setTimeout(() => {
      window.location.href = "profile.html";
    }, 900);
  });
}

/* -------------------------------------------------------------------------
   9. MATCHING LOGIC
   ------------------------------------------------------------------------- */

// calculateMatch -> weighs 4 simple factors, each worth 25 points.
// Default parameter lets the function be called with just a listing.
function calculateMatch(listing, requirement = null) {
  if (!requirement) return null; // no requirement saved yet -> no score

  let score = 0;

  if (requirement.sqft && listing.area >= requirement.sqft) score += 25;
  else if (!requirement.sqft) score += 25;

  if (requirement.budget && listing.rent <= requirement.budget) score += 25;
  else if (!requirement.budget) score += 25;

  if (requirement.power && listing.power >= requirement.power) score += 25;
  else if (!requirement.power) score += 25;

  if (requirement.location &&
      listing.location.toLowerCase().includes(requirement.location.toLowerCase())) {
    score += 25;
  } else if (!requirement.location) {
    score += 25;
  }

  return score;
}

/* -------------------------------------------------------------------------
   10. WISHLIST
   ------------------------------------------------------------------------- */
function getWishlist(userId) {
  const all = getData(STORAGE_KEYS.WISHLIST, {});
  return all[userId] || [];
}

function isWishlisted(userId, listingId) {
  return getWishlist(userId).includes(listingId);
}

function toggleWishlist(listingId) {
  const user = getCurrentUser();
  if (!user) {
    showToast("Login to save properties to your wishlist", "error");
    setTimeout(() => { window.location.href = "login.html"; }, 800);
    return;
  }

  const all = getData(STORAGE_KEYS.WISHLIST, {});
  const list = all[user.id] || [];
  const index = list.indexOf(listingId);

  if (index === -1) {
    list.push(listingId);
    showToast("Added to wishlist", "success");
  } else {
    list.splice(index, 1);
    showToast("Removed from wishlist", "info");
  }

  all[user.id] = list;
  setData(STORAGE_KEYS.WISHLIST, all);

  // Re-render whichever page called this
  if (document.getElementById("listingsContainer")) renderListings();
  if (document.getElementById("wishlistContainer")) renderWishlist();
}

/* -------------------------------------------------------------------------
   11. ENQUIRIES
   ------------------------------------------------------------------------- */
function submitEnquiry(listingId, message = "") {
  requireLogin((user) => {
    const listings = getData(STORAGE_KEYS.LISTINGS, []);
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) return;

    const finalMessage = message && message.trim() !== ""
      ? message.trim()
      : "Hi, I am interested in this property. Please share more details.";

    const enquiry = {
      id: Date.now(),
      listingId: listing.id,
      listingTitle: listing.title,
      listingLocation: listing.location,
      listingImage: listing.image,
      businessUserId: user.id,
      businessName: user.name,
      ownerId: listing.ownerId,
      message: finalMessage,
      status: "Pending",
      date: new Date().toISOString()
    };

    // Simulated async submission (setTimeout callback), similar to the
    // fetch() pattern in the notes, to give real submission feedback.
    showToast("Sending enquiry...", "info", 1200);
    setTimeout(() => {
      const enquiries = getData(STORAGE_KEYS.ENQUIRIES, []);
      enquiries.push(enquiry);
      setData(STORAGE_KEYS.ENQUIRIES, enquiries);
      showToast("Enquiry sent to the owner!", "success");
    }, 700);
  });
}

function updateEnquiryStatus(enquiryId, newStatus) {
  const enquiries = getData(STORAGE_KEYS.ENQUIRIES, []);
  const enquiry = enquiries.find((e) => e.id === enquiryId);
  if (!enquiry) return;
  enquiry.status = newStatus;
  setData(STORAGE_KEYS.ENQUIRIES, enquiries);
  showToast(`Marked as ${newStatus}`, "success");
  renderEnquiries();
}

/* -------------------------------------------------------------------------
   12. LISTINGS PAGE
   ------------------------------------------------------------------------- */

// buildListingCard -> returns the exact card markup used in the original
// listings.html, just filled in with dynamic data via a template literal.
function buildListingCard(listing, requirement, user) {
  const match = calculateMatch(listing, requirement);
  const matchBadge = match !== null
    ? `<div class="badge badge-match shrink-0">
         <span class="material-symbols-outlined text-[16px]">verified</span> ${match}% Match
       </div>`
    : "";

  const wishlisted = user ? isWishlisted(user.id, listing.id) : false;
  const statusBadgeClass = listing.status === "Available" ? "badge-available" : "badge-draft";

  return `
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row brand-card transition-all duration-200 shadow-sm">
    <div class="w-full md:w-2/5 relative h-64 md:h-auto">
      <img class="w-full h-full object-cover" src="${listing.image}" alt="${listing.title}"/>
      <div class="absolute top-4 left-4 flex gap-2">
        <span class="badge badge-premium">
          <span class="material-symbols-outlined text-[14px]">star</span> ${listing.grade}
        </span>
        <span class="badge ${statusBadgeClass}">${listing.status}</span>
      </div>
      <button class="wishlist-btn ${wishlisted ? "active" : ""} absolute top-4 right-4 bg-white/90 rounded-full w-9 h-9 flex items-center justify-center shadow" onclick="toggleWishlist(${listing.id})" title="Save to wishlist">
        <span class="material-symbols-outlined text-orange-500">favorite</span>
      </button>
    </div>
    <div class="p-6 flex flex-col justify-between flex-grow">
      <div>
        <div class="flex justify-between items-start mb-2 gap-3">
          <h3 class="text-xl font-bold text-gray-900">${listing.title}</h3>
          ${matchBadge}
        </div>
        <p class="text-sm text-gray-500 flex items-center gap-1 mb-4">
          <span class="material-symbols-outlined text-[16px] text-blue-600">location_on</span> ${listing.location}
        </p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div><p class="text-xs uppercase text-gray-400 font-semibold">Rent</p><p class="font-bold text-orange-600">₹ ${listing.rent} /sqft</p></div>
          <div><p class="text-xs uppercase text-gray-400 font-semibold">Area</p><p class="font-bold">${listing.area.toLocaleString("en-IN")} sqft</p></div>
          <div><p class="text-xs uppercase text-gray-400 font-semibold">Height</p><p class="font-bold">${listing.height}</p></div>
          <div><p class="text-xs uppercase text-gray-400 font-semibold">Power</p><p class="font-bold">${listing.power} HP</p></div>
        </div>
        <div class="flex flex-wrap gap-2 mb-6">
          <span class="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100 font-semibold">${listing.zoning}</span>
          ${listing.truckAccess ? '<span class="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100 font-semibold">Truck Access</span>' : ""}
        </div>
      </div>
      <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button class="text-blue-700 font-bold px-4 py-2 border-2 border-blue-700 rounded-lg hover:bg-blue-50 transition-colors" onclick="window.location.href='property-detail.html?id=${listing.id}'">View Details</button>
        <button class="bg-orange-500 text-white font-bold px-6 py-2 rounded-lg hover:bg-orange-600 shadow-sm transition-colors" onclick="submitEnquiry(${listing.id})">Book Viewing</button>
      </div>
    </div>
  </div>`;
}

function getListingFilters() {
  const minPrice = Number(getFieldValue("filterMinPrice", 0)) || 0;
  const maxPrice = Number(getFieldValue("filterMaxPrice", 0)) || Infinity;

  const sqftBoxes = document.querySelectorAll(".filter-sqft:checked");
  const sqftRanges = Array.from(sqftBoxes).map((box) => box.value);

  const power = getFieldValue("filterPower", "any");
  const search = getFieldValue("navSearch", "").toLowerCase();
  const sortBy = getFieldValue("sortSelect", "match");

  return { minPrice, maxPrice, sqftRanges, power, search, sortBy };
}

function listingMatchesFilters(listing, filters) {
  if (listing.rent < filters.minPrice || listing.rent > filters.maxPrice) return false;

  if (filters.sqftRanges.length > 0) {
    const inRange = filters.sqftRanges.some((range) => {
      if (range === "under10k") return listing.area <= 10000;
      if (range === "10to50k") return listing.area > 10000 && listing.area <= 50000;
      if (range === "over50k") return listing.area > 50000;
      return true;
    });
    if (!inRange) return false;
  }

  if (filters.power !== "any") {
    if (filters.power === "under100" && listing.power > 100) return false;
    if (filters.power === "100to500" && (listing.power < 100 || listing.power > 500)) return false;
    if (filters.power === "over500" && listing.power < 500) return false;
  }

  if (filters.search && !(
    listing.title.toLowerCase().includes(filters.search) ||
    listing.location.toLowerCase().includes(filters.search)
  )) return false;

  return true;
}

function renderListings() {
  const container = document.getElementById("listingsContainer");
  if (!container) return;

  const user = getCurrentUser();
  const requirement = user ? getRequirementFor(user.id) : null;
  const listings = getData(STORAGE_KEYS.LISTINGS, []).filter((l) => l.status !== "Draft");
  const filters = getListingFilters();

  let filtered = listings.filter((listing) => listingMatchesFilters(listing, filters));

  filtered.sort((a, b) => {
    if (filters.sortBy === "priceAsc") return a.rent - b.rent;
    if (filters.sortBy === "areaDesc") return b.area - a.area;
    // default: match percentage, high to low
    const scoreA = calculateMatch(a, requirement) || 0;
    const scoreB = calculateMatch(b, requirement) || 0;
    return scoreB - scoreA;
  });

  const countEl = document.getElementById("resultsCount");
  if (countEl) countEl.textContent = `Showing ${filtered.length} matched listing${filtered.length === 1 ? "" : "s"}`;

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state">No properties match your filters yet. Try adjusting them.</div>`;
    return;
  }

  container.innerHTML = filtered.map((listing) => buildListingCard(listing, requirement, user)).join("");
}

function initListingsPage() {
  seedListingsIfEmpty();
  renderListings();

  const filterIds = ["filterMinPrice", "filterMaxPrice", "filterPower", "sortSelect", "navSearch"];
  filterIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", renderListings);
  });

  document.querySelectorAll(".filter-sqft").forEach((box) => {
    box.addEventListener("change", renderListings);
  });

  const clearBtn = document.getElementById("clearFiltersBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      filterIds.forEach((id) => { const el = document.getElementById(id); if (el) el.value = ""; });
      document.querySelectorAll(".filter-sqft").forEach((box) => { box.checked = false; });
      renderListings();
    });
  }
}

/* -------------------------------------------------------------------------
   13. PROPERTY DETAIL PAGE
   ------------------------------------------------------------------------- */
function renderPropertyDetail() {
  const root = document.getElementById("pd-root");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  const listings = getData(STORAGE_KEYS.LISTINGS, []);
  const listing = listings.find((l) => l.id === id) || listings[0];

  if (!listing) {
    root.innerHTML = `<div class="empty-state">Property not found.</div>`;
    return;
  }

  const setText = (elId, value) => {
    const el = document.getElementById(elId);
    if (el) el.textContent = value;
  };

  setText("pd-title", listing.title);
  setText("pd-location", listing.location);
  setText("pd-rent", `₹ ${listing.rent} / sq.ft / month`);
  setText("pd-area", `Built-up Area: ${listing.area.toLocaleString("en-IN")} sq.ft`);
  setText("pd-description", listing.description);
  setText("pd-height", listing.height);
  setText("pd-power", listing.power + " HP");
  setText("pd-docks", listing.docks);
  setText("pd-flooring", listing.flooring);
  setText("pd-owner-name", listing.ownerName);
  setText("pd-owner-initials", listing.ownerName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase());
  setText("pd-status", listing.status);
  const statusEl = document.getElementById("pd-status");
  if (statusEl) {
    statusEl.classList.remove("badge-available", "badge-draft");
    statusEl.classList.add(listing.status === "Available" ? "badge-available" : "badge-draft");
  }
  setText("pd-grade", listing.grade);
  setText("pd-monthly-estimate", `₹ ${(listing.rent * listing.area).toLocaleString("en-IN")}`);

  const mainImg = document.getElementById("pd-main-image");
  if (mainImg) mainImg.src = listing.image;

  const enquireBtn = document.getElementById("pd-enquire-btn");
  if (enquireBtn) {
    enquireBtn.addEventListener("click", () => {
      const message = window.prompt("Add a short message to the owner (optional):", "");
      if (message !== null) submitEnquiry(listing.id, message);
    });
  }

  const wishBtn = document.getElementById("pd-wishlist-btn");
  if (wishBtn) {
    const user = getCurrentUser();
    if (user && isWishlisted(user.id, listing.id)) wishBtn.classList.add("active");
    wishBtn.addEventListener("click", () => {
      toggleWishlist(listing.id);
      wishBtn.classList.toggle("active");
    });
  }
}

/* -------------------------------------------------------------------------
   14. WISHLIST PAGE
   ------------------------------------------------------------------------- */
function renderWishlist() {
  const container = document.getElementById("wishlistContainer");
  if (!container) return;

  requireLogin((user) => {
    const ids = getWishlist(user.id);
    const listings = getData(STORAGE_KEYS.LISTINGS, []);
    const items = listings.filter((l) => ids.includes(l.id));

    if (items.length === 0) {
      container.innerHTML = `<div class="empty-state">You haven't saved any properties yet. Browse <a href="listings.html" class="text-blue-700 font-semibold">listings</a> and tap the heart icon.</div>`;
      return;
    }

    const requirement = getRequirementFor(user.id);
    container.innerHTML = items.map((listing) => buildListingCard(listing, requirement, user)).join("");
  });
}

/* -------------------------------------------------------------------------
   15. PROFILE / DASHBOARD PAGE
   ------------------------------------------------------------------------- */
function buildOwnerListingRow(listing) {
  const statusBadgeClass = listing.status === "Available" ? "badge-available" : "badge-draft";
  return `
  <div class="flex flex-col md:flex-row gap-6 border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
    <div class="w-full md:w-64 h-40 flex-shrink-0 relative overflow-hidden rounded-lg">
      <img alt="${listing.title}" class="w-full h-full object-cover" src="${listing.image}"/>
      <span class="badge ${statusBadgeClass} absolute top-2 right-2">${listing.status}</span>
    </div>
    <div class="flex-grow flex flex-col justify-between">
      <div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">${listing.title}</h3>
        <p class="text-sm text-gray-500 mb-4 flex items-center gap-1">
          <span class="material-symbols-outlined text-[16px] text-blue-600">location_on</span> ${listing.location}
        </p>
        <div class="flex flex-wrap gap-4 mb-4">
          <div class="flex flex-col"><span class="text-xs text-gray-400 font-semibold">Area</span><span class="text-sm font-bold text-gray-900">${listing.area.toLocaleString("en-IN")} sq ft</span></div>
          <div class="flex flex-col"><span class="text-xs text-gray-400 font-semibold">Rate</span><span class="text-sm font-bold text-orange-600">₹${listing.rent} / sq ft / month</span></div>
          <div class="flex flex-col"><span class="text-xs text-gray-400 font-semibold">Type</span><span class="text-sm font-bold text-gray-900">${listing.type}</span></div>
        </div>
      </div>
      <div class="flex gap-3 mt-auto">
        <button class="px-4 py-2 bg-blue-700 text-white rounded-lg font-bold text-sm hover:bg-blue-800 transition-colors shadow-sm" onclick="window.location.href='property-detail.html?id=${listing.id}'">View Details</button>
        <button class="px-4 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-bold text-sm transition-colors" onclick="deleteListing(${listing.id})">Delete</button>
      </div>
    </div>
  </div>`;
}

function deleteListing(listingId) {
  if (!window.confirm("Remove this listing?")) return;
  let listings = getData(STORAGE_KEYS.LISTINGS, []);
  listings = listings.filter((l) => l.id !== listingId);
  setData(STORAGE_KEYS.LISTINGS, listings);
  showToast("Listing removed", "info");
  renderProfile();
}

function renderProfile() {
  const root = document.getElementById("profile-root");
  if (!root) return;

  requireLogin((user) => {
    const setText = (elId, value) => { const el = document.getElementById(elId); if (el) el.textContent = value; };
    setText("profile-name", user.name);
    setText("profile-email", user.email);
    setText("profile-role", user.role === "owner" ? "Property Owner" : "Business");
    setText("profile-avatar", user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase());

    const listings = getData(STORAGE_KEYS.LISTINGS, []);
    const myListings = listings.filter((l) => l.ownerId === user.id);
    const enquiries = getData(STORAGE_KEYS.ENQUIRIES, []);
    const myEnquiries = enquiries.filter((e) => e.ownerId === user.id || e.businessUserId === user.id);
    const wishlist = getWishlist(user.id);

    setText("stat-listings", myListings.length);
    setText("stat-enquiries", myEnquiries.length);
    setText("stat-wishlist", wishlist.length);

    const listingsPanel = document.getElementById("profile-listings-panel");
    if (listingsPanel) {
      listingsPanel.innerHTML = myListings.length
        ? myListings.map(buildOwnerListingRow).join("")
        : `<div class="empty-state">No listings yet. <a href="owner-form.html" class="text-blue-700 font-bold">List a property</a>.</div>`;
    }
  });
}

/* -------------------------------------------------------------------------
   16. ENQUIRIES PAGE
   ------------------------------------------------------------------------- */
function buildEnquiryRow(enquiry, user) {
  const isOwnerView = enquiry.ownerId === user.id;
  const badgeColor = enquiry.status === "Pending" ? "bg-orange-500" :
                      enquiry.status === "Scheduled" ? "bg-green-600" : "bg-blue-700";

  const actions = isOwnerView
    ? `<button class="bg-orange-500 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors" onclick="updateEnquiryStatus(${enquiry.id}, 'Responded')">
         <span class="material-symbols-outlined text-[18px]">chat</span> Mark Responded
       </button>
       <button class="border-2 border-blue-700 text-blue-700 font-bold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors" onclick="updateEnquiryStatus(${enquiry.id}, 'Scheduled')">Schedule Visit</button>`
    : `<button class="border-2 border-blue-700 text-blue-700 font-bold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors" onclick="window.location.href='property-detail.html?id=${enquiry.listingId}'">View Property</button>`;

  return `
  <div class="bg-white border border-gray-200 rounded-lg p-4 md:p-6 flex flex-col lg:flex-row gap-6 hover-elevate" data-status="${enquiry.status}">
    <div class="w-full lg:w-64 h-48 lg:h-auto rounded overflow-hidden flex-shrink-0 relative">
      <img alt="Property" class="w-full h-full object-cover" src="${enquiry.listingImage}"/>
      <div class="absolute top-2 left-2 ${badgeColor} text-white text-xs font-bold px-2 py-1 rounded uppercase">${enquiry.status}</div>
    </div>
    <div class="flex-1 flex flex-col justify-between">
      <div>
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-semibold text-gray-900">${enquiry.listingTitle}</h3>
          <span class="text-sm text-gray-500 flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">calendar_today</span> ${new Date(enquiry.date).toLocaleDateString()}</span>
        </div>
        <div class="bg-blue-50 rounded p-4 mb-4 border border-blue-100">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm">${enquiry.businessName.slice(0,2).toUpperCase()}</div>
            <div><div class="font-semibold text-gray-900">${enquiry.businessName}</div><div class="text-sm text-gray-500">${enquiry.listingLocation}</div></div>
          </div>
          <p class="text-sm text-gray-700 italic">"${enquiry.message}"</p>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-3 mt-4 lg:mt-0 pt-4 border-t border-gray-200">
        ${actions}
      </div>
    </div>
  </div>`;
}

function renderEnquiries(statusFilter = "All") {
  const container = document.getElementById("enquiriesContainer");
  if (!container) return;

  requireLogin((user) => {
    const enquiries = getData(STORAGE_KEYS.ENQUIRIES, []);
    let mine = enquiries.filter((e) => e.ownerId === user.id || e.businessUserId === user.id);

    if (statusFilter !== "All") {
      mine = mine.filter((e) => e.status === statusFilter);
    }

    mine.sort((a, b) => new Date(b.date) - new Date(a.date));

    const countEl = document.getElementById("enquiriesNewCount");
    if (countEl) countEl.textContent = enquiries.filter((e) => e.status === "Pending" && e.ownerId === user.id).length;

    container.innerHTML = mine.length
      ? mine.map((e) => buildEnquiryRow(e, user)).join("")
      : `<div class="empty-state">No enquiries here yet.</div>`;
  });
}

function initEnquiriesPage() {
  renderEnquiries();
  document.querySelectorAll(".enquiry-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".enquiry-tab").forEach((t) => {
        t.classList.remove("text-blue-700", "border-blue-700", "font-semibold");
        t.classList.add("text-gray-500");
      });
      tab.classList.add("text-blue-700", "border-blue-700", "font-semibold");
      tab.classList.remove("text-gray-500");
      renderEnquiries(tab.dataset.status);
    });
  });
}

/* -------------------------------------------------------------------------
   17. SCROLL REVEAL EFFECT (index.html)
   ------------------------------------------------------------------------- */
function initScrollReveal() {
  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length === 0) return;

  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    reveals.forEach((reveal) => {
      const elementTop = reveal.getBoundingClientRect().top;
      if (elementTop < windowHeight - 100) reveal.classList.add("active");
    });
  };

  window.addEventListener("scroll", revealOnScroll);
  revealOnScroll();
}

/* -------------------------------------------------------------------------
   18. INDEX PAGE CTA BUTTONS ("I'm a Business" / "I'm a Property Owner")
   ------------------------------------------------------------------------- */
function initIndexCtas() {
  const bizBtn = document.getElementById("cta-business");
  const ownerBtn = document.getElementById("cta-owner");

  if (bizBtn) bizBtn.addEventListener("click", () => {
    window.location.href = getCurrentUser() ? "business-form.html" : "signup.html";
  });
  if (ownerBtn) ownerBtn.addEventListener("click", () => {
    window.location.href = getCurrentUser() ? "owner-form.html" : "signup.html";
  });
}

/* -------------------------------------------------------------------------
   18b. ACTIVE NAV HIGHLIGHT — same navbar markup on every page,
   so we just mark the link matching the current file as active.
   ------------------------------------------------------------------------- */
function highlightActiveNav() {
  const page = window.location.pathname.split("/").pop() || "index.html";
  const map = {
    "index.html": "index",
    "": "index",
    "business-form.html": "business",
    "owner-form.html": "owner",
    "listings.html": "listings",
    "property-detail.html": "listings"
  };
  const current = map[page];
  if (!current) return;
  document.querySelectorAll(".nav-link[data-nav]").forEach((link) => {
    if (link.dataset.nav === current) link.classList.add("active");
  });
}

/* -------------------------------------------------------------------------
   19. GLOBAL INIT — runs on every page, wires up whatever exists on it
   ------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  seedListingsIfEmpty();
  renderNavAuth();
  highlightActiveNav();
  initScrollReveal();
  initIndexCtas();

  const loginForm = document.getElementById("form-login");
  if (loginForm) loginForm.addEventListener("submit", handleLogin);

  const signupForm = document.getElementById("form-signup");
  if (signupForm) signupForm.addEventListener("submit", handleSignup);

  const businessForm = document.getElementById("business-requirements-form");
  if (businessForm) businessForm.addEventListener("submit", handleBusinessForm);

  const ownerForm = document.getElementById("owner-listing-form");
  if (ownerForm) ownerForm.addEventListener("submit", handleOwnerForm);

  if (document.getElementById("listingsContainer")) initListingsPage();
  if (document.getElementById("pd-root")) renderPropertyDetail();
  if (document.getElementById("wishlistContainer")) renderWishlist();
  if (document.getElementById("profile-root")) renderProfile();
  if (document.getElementById("enquiriesContainer")) initEnquiriesPage();

  const logoutBtnGlobal = document.getElementById("logoutBtn");
  if (logoutBtnGlobal) logoutBtnGlobal.addEventListener("click", logout);

  const sidebarLogoutBtn = document.getElementById("sidebarLogoutBtn");
  if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener("click", logout);
});
