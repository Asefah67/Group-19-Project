console.log("StudyBuddy content script loaded!");

function injectStudyBuddyLink() {
  // If it's already injected, skip
  if (document.getElementById('global_nav_studybuddy_link')) return;

  // Target the <ul> that holds the nav items
  const navList = document.querySelector('.ic-app-header__menu-list');
  if (!navList) return;

  // Create <li>
  const customMenuItem = document.createElement('li');
  customMenuItem.id = 'global_nav_studybuddy_link';
  customMenuItem.setAttribute('role', 'none');

  // Create <a> link
  const customLink = document.createElement('a');
  customLink.setAttribute('role', 'menuitem');
  customLink.classList.add('ic-app-header__menu-list-link');
  customLink.href = '#';

  // Create icon wrapper
  const iconWrapper = document.createElement('span');
  iconWrapper.classList.add('menu-item__icon');

  // Create <img> with the SVG icon
  const iconImg = document.createElement('img');
  iconImg.src = chrome.runtime.getURL('studybuddy-icon.svg');
  iconImg.alt = 'StudyBuddy Icon';
  // Force consistent sizing
  iconImg.style.width = '24px';
  iconImg.style.height = '24px';

  // Put <img> inside the wrapper
  iconWrapper.appendChild(iconImg);

  // Create text wrapper
  const textWrapper = document.createElement('span');
  textWrapper.classList.add('menu-item__text');
  textWrapper.textContent = 'StudyBuddy';

  // Append icon + text to <a>
  customLink.appendChild(iconWrapper);
  customLink.appendChild(textWrapper);

  // Optional click
  customLink.addEventListener('click', (e) => {
    e.preventDefault();
    alert("You clicked StudyBuddy!");
  });

  // Append <a> to <li>, then <li> to nav <ul>
  customMenuItem.appendChild(customLink);
  navList.appendChild(customMenuItem);

  console.log("StudyBuddy menu item injected with SVG!");
}

// Observe DOM changes so we can insert ASAP
const observer = new MutationObserver(() => {
  injectStudyBuddyLink();
});
observer.observe(document.documentElement, { childList: true, subtree: true });

// Try once immediately
injectStudyBuddyLink();
