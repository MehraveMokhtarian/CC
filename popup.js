document.getElementById('key').addEventListener('focus', function() {
  document.getElementById('add-form').classList.add('focus');
});

document.getElementById('key').addEventListener('blur', function() {
  document.getElementById('add-form').classList.remove('focus');
});

document.getElementById('value').addEventListener('focus', function() {
  document.getElementById('add-form').classList.add('focus');
});

document.getElementById('value').addEventListener('blur', function() {
  document.getElementById('add-form').classList.remove('focus');
});


document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.querySelector('#key-value-table tbody');
  const addForm = document.getElementById('add-form');
  const keyInput = document.getElementById('key');
  const valueInput = document.getElementById('value');

  function saveKeyValue(key, value) {
    if (!currentUrl) return;
    chrome.storage.local.get([currentUrl], (result) => {
      const data = result[currentUrl] || {};
      data[key] = value;
      chrome.storage.local.set({ [currentUrl]: data }, () => {
        console.log('Data saved');
        displayTable();
      });
    });
  }

  function displayTable() {
    if (!currentUrl) return;
    chrome.storage.local.get([currentUrl], (result) => {
      const data = result[currentUrl] || {};
      tableBody.innerHTML = '';
      for (const [key, value] of Object.entries(data)) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${key}</td>
          <td>${value}</td>
          <td><button class="delete-btn" data-key="${key}"></button></td>
        `;
        row.querySelector('.delete-btn').addEventListener('click', () => {
          deleteRow(key);
        });
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
    if (event.target.classList.contains('delete-btn')) {
      const key = event.target.getAttribute('data-key');
      const url = window.location.href;
      chrome.storage.local.get([currentUrl], (result) => {
        const data = result[currentUrl] || {};
        delete data[key];
        chrome.storage.local.set({ [currentUrl]: data }, () => {
          console.log('Data deleted');
          displayTable(currentUrl);
        });
      });
    }
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    currentUrl = new URL(tabs[0].url).hostname;
    displayTable();
  });
});
