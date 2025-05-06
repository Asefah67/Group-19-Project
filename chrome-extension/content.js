// content.js


console.log("🔌 StudyBuddy injector loaded");

// 1) Inject our “StudyBuddy” nav link if it isn’t already there
(function injectNavLink() {
  if (document.getElementById("global_nav_studybuddy")) return;
  const ul = document.querySelector(".ic-app-header__menu-list");
  if (!ul) return;

  const li = document.createElement("li");
  li.id = "global_nav_studybuddy";
  li.setAttribute("role", "none");
  li.innerHTML = `
    <a role="menuitem" class="ic-app-header__menu-list-link" href="#">
      <span class="menu-item__icon">
        <img
          src="${chrome.runtime.getURL("studybuddy-icon.svg")}"
          alt="StudyBuddy"
          width="24"
          height="24"
        >
      </span>
      <span class="menu-item__text">StudyBuddy</span>
    </a>
  `;
  ul.appendChild(li);

  // bind click
  li.querySelector("a").addEventListener("click", e => {
    e.preventDefault();
    loadStudyBuddyLayout().catch(err => console.error(err));
  });

  console.log("✅ StudyBuddy nav link injected");
})();

let cssInjected = false;

/**
 * Swap Canvas’s main workspace to show our triangle menu.
 */
async function loadStudyBuddyLayout() {
  // inject CSS once
  if (!cssInjected) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL("Canvas-CSS.css");
    document.head.appendChild(link);
    cssInjected = true;
  }

  // fetch & parse our layout snippet
  const resp = await fetch(chrome.runtime.getURL("Canvas-Layout.html"));
  if (!resp.ok) throw new Error("Failed to load Canvas-Layout.html");
  const text = await resp.text();
  const doc = new DOMParser().parseFromString(text, "text/html");
  const newPanel = doc.querySelector(".canvas-main");
  if (!newPanel) throw new Error(".canvas-main not found");

  // find the Canvas workspace container
  const workspace =
    document.querySelector(".ic-app-main") ||
    document.querySelector("main") ||
    document.querySelector("#content") ||
    document.body;

  // clear & inject our layout
  workspace.innerHTML = "";
  workspace.appendChild(newPanel.cloneNode(true));
  console.log("🔄 StudyBuddy layout injected");

  // Wire up only the Room Booking button:
  workspace.querySelector("#btn-room-booking")
    ?.addEventListener("click", () => {
      injectIframe("https://www.library.umass.edu/spaces-reservations/");
    });
}

/**
 * Clears the workspace and injects an <iframe> at full size.
 * @param {string} srcURL
 */
function injectIframe(srcURL) {
  const workspace =
    document.querySelector(".ic-app-main") ||
    document.querySelector("main") ||
    document.querySelector("#content") ||
    document.body;

  workspace.innerHTML = "";

  const iframe = document.createElement("iframe");
  iframe.src = srcURL;
  iframe.style.width  = "100%";
  iframe.style.height = "100vh";
  iframe.style.border = "none";

  // <-- add a sandbox so LibCal’s JS can’t poke the parent
  iframe.sandbox = [
    "allow-scripts",       // let LibCal JS run
    "allow-forms",         // let you submit the booking form
    "allow-same-origin"    // necessary if LibCal runs code relative to its own cookies
  ].join(" ");

  workspace.appendChild(iframe);
  console.log(`🌐 Injected sandboxed iframe: ${srcURL}`);
}
