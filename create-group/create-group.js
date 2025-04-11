document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.group-form');
  
    form.addEventListener('submit', (e) => {
      e.preventDefault();
  
      const className = document.getElementById('class-name').value.trim();
      const groupName = document.getElementById('group-name').value.trim();
  
      if (!className || !groupName) return;
  
      const newGroup = { className, groupName };
  
      const groups = JSON.parse(localStorage.getItem('groups')) || [];
      groups.push(newGroup);
      localStorage.setItem('groups', JSON.stringify(groups));
  
      window.location.href = 'group-home.html';
    });
  });
  