// chrome-extension/content.js
console.log("🔌 StudyBuddy injector loaded");

/*───────────────── inject Canvas-CSS once ─────────────────*/
let cssDone = false;
function ensureCSS() {
  if (cssDone) return;
  const link = document.createElement("link");
  link.rel  = "stylesheet";
  link.href = chrome.runtime.getURL("Canvas-CSS.css");
  document.head.appendChild(link);
  cssDone = true;
}

/*───────────────── inject nav link + behavior ────────────────*/
function addNavItem() {
  // only once
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
  ul.appendChild(li);

  li.querySelector("a").addEventListener("click", e => {
    e.preventDefault();
    // 1) inject the triangle menu
    ensureCSS();
    fetch(chrome.runtime.getURL("Canvas-Layout.html"))
      .then(r => r.text())
      .then(html => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const panel = doc.querySelector(".canvas-main");
        if (!panel) throw new Error("Missing .canvas-main in Canvas-Layout.html");

        const ws = document.querySelector(".ic-app-main") ||
                   document.querySelector("main")         ||
                   document.querySelector("#content")     ||
                   document.body;
        ws.innerHTML = "";
        ws.appendChild(panel.cloneNode(true));

        // 2) hook our three circles by ID
        document.getElementById("btn-study-group")
                .addEventListener("click", () => console.log("🔍 Study Group"));

        document.getElementById("btn-room-booking")
                .addEventListener("click", () => {
                  // **Open standalone booking page in new tab**
                  window.open(
                    chrome.runtime.getURL("views/room-booking/roombooking.html"),
                    "_blank"
                  );
                });

        document.getElementById("btn-chat")
                .addEventListener("click", () => console.log("💬 Chat"));
      })
      .catch(err => console.error(err));
  });

  console.log("✅ StudyBuddy nav link injected");
}

// watch for Canvas’s SPA rerender
new MutationObserver(addNavItem)
  .observe(document.documentElement, {childList:true, subtree:true});
addNavItem();
