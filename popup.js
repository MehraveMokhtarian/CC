document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.querySelector('#key-value-table tbody');
  const addForm = document.getElementById('add-form');
  const keyInput = document.getElementById('key');
  const valueInput = document.getElementById('value');

  function saveKeyValue(key, value) {
    const url = new URL(window.location.href).hostname;
    chrome.storage.local.get([url], (result) => {
      const data = result[url] || {};
      data[key] = value;
      chrome.storage.local.set({ [url]: data }, () => {
        console.log('Data saved');
        displayTable();
      });
    });
  }

  function displayTable() {
    const url = new URL(window.location.href).hostname;
    chrome.storage.local.get([url], (result) => {
      const data = result[url] || {};
      tableBody.innerHTML = '';
      for (const [key, value] of Object.entries(data)) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${key}</td>
          <td>${value}</td>
          <td><button data-key="${key}">Delete</button></td>
        `;
        tableBody.appendChild(row);
      }
    });
  }

  addForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const key = keyInput.value.trim();
    const value = valueInput.value.trim();
    if (key && value) {
      saveKeyValue(key, value);
      keyInput.value = '';
      valueInput.value = '';
    }
  });

  tableBody.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
      const key = event.target.getAttribute('data-key');
      const url = new URL(window.location.href).hostname;
      chrome.storage.local.get([url], (result) => {
        const data = result[url] || {};
        delete data[key];
        chrome.storage.local.set({ [url]: data }, () => {
          console.log('Data deleted');
          displayTable();
        });
      });
    }
  });

  displayTable();
});
