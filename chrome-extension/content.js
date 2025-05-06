// content.js
console.log("🔌 StudyBuddy injector loaded");

// 1) Inject our “StudyBuddy” nav link if it isn’t already there
;(function injectNavLink(){
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
             alt="StudyBuddy" width="24" height="24">
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

// 2) On click, fetch & inject our Canvas-Layout.html into Canvas’s main area
async function loadStudyBuddyLayout(){
  // a) fetch the snippet
  const resp = await fetch(chrome.runtime.getURL("Canvas-Layout.html"));
  if (!resp.ok) throw new Error("Failed to load Canvas-Layout.html");
  const text = await resp.text();
  const doc = new DOMParser().parseFromString(text, "text/html");
  const newPanel = doc.querySelector(".canvas-main");
  if (!newPanel) throw new Error("⛔ .canvas-main not found in your snippet");

  // b) inject our CSS exactly once
  if (!cssInjected){
    const link = document.createElement("link");
    link.id = "studybuddy-css";
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL("Canvas-CSS.css");
    document.head.appendChild(link);
    cssInjected = true;
  }

  // c) find Canvas’s workspace
  let workspace =
    document.querySelector(".ic-app-main")     // attempt #1
    || document.querySelector("main")          // #2
    || document.querySelector("#content")      // #3
    || document.body;                          // fallback

  // clear & swap
  workspace.innerHTML = "";
  workspace.appendChild(newPanel.cloneNode(true));
  console.log("🔄 StudyBuddy layout injected");
}
