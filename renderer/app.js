const { ipcRenderer } = require("electron");
const items = require('./items');

// Dom Nodes
let showModal = document.getElementById('show-modal');
let closeModal = document.getElementById('close-modal');
let modal = document.getElementById('modal');
let addItem = document.getElementById('add-item');
let itemUrl = document.getElementById('url');
let search = document.getElementById('search');

// Open modal from menu
ipcRenderer.on('menu-show-modal', () => {
    showModal.click();
});

// Open selected item from menu
ipcRenderer.on('menu-open-item', () => {
    items.open();
});

// Delete selected item from menu
ipcRenderer.on('menu-delete-item', () => {
    let selectedItem = items.getSelectedItem();
    items.delete(selectedItem.index);
});

// Open item in native browser from menu
ipcRenderer.on('menu-open-item-native', () => {
    items.openNative();
});

// Focus the search input from the menu
ipcRenderer.on('menu-focus-search', () => {
    search.focus();
});

// Filter items with search
search.addEventListener('keyup', e => {
    // Loops items
    Array.from(document.getElementsByClassName('read-item')).forEach(item => {

        // Hide items that don't match search value
        let hasMatch = item.innerText.toLowerCase().includes(search.value);
        item.style.display = hasMatch ? 'flex' : 'none';
    })
})

// Navigate item selection with up/down arrows
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        items.changeSelection(e.key);
    }
})

// Disable and Enable modal buttons
const toggleModalButtons = () => {

    // Check state of buttons
    if (addItem.disabled === true) {
        itemUrl.disabled = false;
        addItem.disabled = false;
        addItem.style.opacity = 1;
        addItem.innerText = 'Add Item';
        closeModal.style.display = 'inline';
    } else {
        itemUrl.disabled = true;
        addItem.disabled = true;
        addItem.style.opacity = 0.5;
        addItem.innerText = 'Adding...';
        closeModal.style.display = 'none';
    }
}

// Show modal
showModal.addEventListener('click', e => {
    modal.style.display = 'flex';
    itemUrl.focus();
});

// Close modal
closeModal.addEventListener('click', e => {
    modal.style.display = 'none';
});

// Handle new item modal
addItem.addEventListener('click', e => {
    
    // Check a url exists
    if (itemUrl.value) {
       
        // Send new item url to main process
        ipcRenderer.send('new-item', itemUrl.value);

        // Disabled buttons
        toggleModalButtons();
    }
});

// Listen for new item from main process 
ipcRenderer.on('new-item-success', (e, newItem) => {
    
    // Add new item to "items"
    items.addItem(newItem, true);

    // Enable buttons
    toggleModalButtons();

    // Hide modal and clear value
    modal.style.display = 'none';
    itemUrl.value = '';
})

// Listen for keyboard submit
itemUrl.addEventListener('keyup', e => {
    if (e.key === 'Enter') {
        addItem.click();
    }
});