// chrome-extension/content.js
console.log("🔌 StudyBuddy injector loaded");

// 1) Insert the StudyBuddy link into Canvas nav
function injectLink() {
  if (document.getElementById("global_nav_studybuddy")) return;
  const ul = document.querySelector(".ic-app-header__menu-list");
  if (!ul) return;

  const li = document.createElement("li");
  li.id = "global_nav_studybuddy";
  li.setAttribute("role","none");
  li.innerHTML = `
    <a role="menuitem" class="ic-app-header__menu-list-link" href="#">
      <span class="menu-item__icon">
        <img src="${chrome.runtime.getURL("studybuddy-icon.svg")}"
             width="24" height="24" alt="StudyBuddy">
      </span>
      <span class="menu-item__text">StudyBuddy</span>
    </a>`;

  // 2) On click → open room-booking.html in a fresh tab
  li.querySelector("a").addEventListener("click", e => {
    e.preventDefault();
    window.open(
      chrome.runtime.getURL("views/room-booking/roombooking.html"),
      "_blank"
    );
  });

  ul.appendChild(li);
  console.log("✅ StudyBuddy link injected");
}

// Watch for Canvas’s nav to appear (SPA) and inject once
new MutationObserver(injectLink)
  .observe(document.documentElement, { childList: true, subtree: true });
injectLink();
