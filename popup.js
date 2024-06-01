document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.querySelector('#key-value-table tbody');
  const keyInput = document.getElementById('new-key');
  const valueInput = document.getElementById('new-value');
  let currentUrl = '';

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
          <td><span class="delete-button" data-key="${key}">Delete</span></td>
        `;
        tableBody.appendChild(row);
      }
      // Add the input row at the end
      const inputRow = document.createElement('tr');
      inputRow.className = 'input-row';
      inputRow.innerHTML = `
        <td><input type="text" id="new-key" placeholder="Key" required></td>
        <td><input type="text" id="new-value" placeholder="Value" required></td>
        <td></td>
      `;
      tableBody.appendChild(inputRow);
    });
  }

  function addRow() {
    const key = keyInput.value.trim();
    const value = valueInput.value.trim();
    if (key && value) {
      saveKeyValue(key, value);
      keyInput.value = '';
      valueInput.value = '';
      keyInput.focus();
    }
  }

  tableBody.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-button')) {
      const key = event.target.getAttribute('data-key');
      chrome.storage.local.get([currentUrl], (result) => {
        const data = result[currentUrl] || {};
        delete data[key];
        chrome.storage.local.set({ [currentUrl]: data }, () => {
          console.log('Data deleted');
          displayTable();
        });
      });
    } else if (event.target.closest('.input-row')) {
      addRow();
    }
  });

  tableBody.addEventListener('keypress', (event) => {
    if (event.target.closest('.input-row') && event.key === 'Enter') {
      addRow();
    }
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    currentUrl = new URL(tabs[0].url).hostname;
    displayTable();
  });
});
