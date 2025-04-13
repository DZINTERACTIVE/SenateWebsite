const API_BASE_URL = 'https://api.congress.gov/v3/bill';
const API_KEY = 'YOUR_CONGRESS_API_KEY'; // Replace with actual API key

// Use localStorage for persistent bill storage
function saveBillsToLocalStorage(bills) {
    localStorage.setItem('senateBills', JSON.stringify(bills));
}

function getBillsFromLocalStorage() {
    const savedBills = localStorage.getItem('senateBills');
    return savedBills ? JSON.parse(savedBills) : [];
}

// Global variable to store current bills
let currentBills = getBillsFromLocalStorage();

// Modified to automatically load bills from local storage on page load
document.addEventListener('DOMContentLoaded', () => {
    // Render bills from local storage
    renderBillList(currentBills);
});

// Authentication
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'ADMIN' && password === 'SECSENATE') {
        // Store admin login state
        localStorage.setItem('isAdmin', 'true');
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'flex';
        
        // Re-render bill list to show admin controls
        renderBillList(currentBills);
    } else {
        alert('Invalid credentials');
    }
}

function logout() {
    // Clear admin login state
    localStorage.removeItem('isAdmin');
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
    
    // Re-render bill list without admin controls
    renderBillList(currentBills);
}

// Modify renderBillList to check admin status
function renderBillList(bills) {
    const billList = document.getElementById('billList');
    const resultCount = document.getElementById('resultCount');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    currentBills = bills; // Store bills globally
    saveBillsToLocalStorage(bills); // Save to local storage

    if (bills && bills.length > 0) {
        billList.innerHTML = bills.map((bill, index) => `
            <div class="bill-card" data-bill-index="${index}">
                <h3 onclick="openBillDetails(${index})">S ${bill.number}: ${bill.title}</h3>
                <div class="bill-details">
                    <p><strong>Current Status:</strong> ${bill.status || 'Pending'}</p>
                    <p><strong>Introduced:</strong> ${bill.introducedDate || 'Not available'}</p>
                    <p><strong>Sponsor:</strong> ${bill.sponsor || 'Not specified'}</p>
                    ${isAdmin ? `
                        <div class="bill-actions">
                            <button onclick="editBill(${index})">Edit</button>
                            <button onclick="deleteBill(${index})">Delete</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
        resultCount.textContent = `${bills.length} bills found`;
    } else {
        billList.innerHTML = `<p>No Senate bills found matching your search criteria.</p>`;
        resultCount.textContent = '0 bills found';
    }
}

// Modify edit and delete functions to only work for admin
function editBill(index) {
    // Check if user is admin
    if (localStorage.getItem('isAdmin') !== 'true') {
        alert('You must be logged in as an admin to edit bills.');
        return;
    }

    const bill = currentBills[index];
    const billList = document.getElementById('billList');
    
    // Replace bill card with a comprehensive edit form
    const billCards = billList.getElementsByClassName('bill-card');
    const cardToEdit = billCards[index];
    
    cardToEdit.innerHTML = `
        <div class="bill-edit-form">
            <div class="edit-form-grid">
                <label>Bill Number:</label>
                <input type="text" id="editBillNumber" value="${bill.number}" placeholder="Bill Number">
                
                <label>Bill Title:</label>
                <input type="text" id="editBillTitle" value="${bill.title}" placeholder="Bill Title">
                
                <label>Status:</label>
                <select id="editBillStatus">
                    <option value="introduced" ${bill.status === 'introduced' ? 'selected' : ''}>Introduced</option>
                    <option value="committee" ${bill.status === 'committee' ? 'selected' : ''}>In Committee</option>
                    <option value="floor" ${bill.status === 'floor' ? 'selected' : ''}>On Senate Floor</option>
                    <option value="passed" ${bill.status === 'passed' ? 'selected' : ''}>Passed</option>
                    <option value="enacted" ${bill.status === 'enacted' ? 'selected' : ''}>Enacted</option>
                </select>
                
                <label>Introduced Date:</label>
                <input type="date" id="editIntroducedDate" value="${bill.introducedDate || new Date().toISOString().split('T')[0]}">
                
                <label>Sponsor:</label>
                <input type="text" id="editSponsor" value="${bill.sponsor || ''}" placeholder="Sponsor Name">
            </div>
            
            <label>Full Bill Text:</label>
            <textarea id="editBillFullText" rows="10" placeholder="Full bill text">${bill.fullText || ''}</textarea>
            
            <div class="bill-actions">
                <button onclick="saveEditedBill(${index})">Save Changes</button>
                <button onclick="cancelEdit(${index})">Cancel</button>
            </div>
        </div>
    `;
}

function deleteBill(index) {
    // Check if user is admin
    if (localStorage.getItem('isAdmin') !== 'true') {
        alert('You must be logged in as an admin to delete bills.');
        return;
    }

    // Remove the bill from currentBills array
    currentBills.splice(index, 1);
    
    // Re-render the bill list and save to local storage
    renderBillList(currentBills);
    closeBillDetailPage();
}

function addNewBill() {
    if (localStorage.getItem('isAdmin') !== 'true') {
        alert('You must be logged in as an admin to add new bills.');
        return;
    }

    const billNumber = document.getElementById('newBillNumber').value;
    const billTitle = document.getElementById('newBillTitle').value;
    const billStatus = document.getElementById('newBillStatus').value;

    if (!billNumber || !billTitle) {
        alert('Please fill in all bill details');
        return;
    }

    const newBill = {
        type: 'S',
        number: billNumber,
        title: billTitle,
        status: billStatus,
        introducedDate: new Date().toISOString().split('T')[0],
        fullText: ''
    };

    // Add to the beginning of currentBills
    currentBills.unshift(newBill);

    // Re-render the bill list
    renderBillList(currentBills);

    // Clear input fields
    document.getElementById('newBillNumber').value = '';
    document.getElementById('newBillTitle').value = '';
}

// Ensure edit/save functions respect admin status
function saveEditedBill(index) {
    // Check if user is admin
    if (localStorage.getItem('isAdmin') !== 'true') {
        alert('You must be logged in as an admin to save bill changes.');
        return;
    }

    // Rest of the existing save logic remains the same
    const newNumber = document.getElementById('editBillNumber').value;
    const newTitle = document.getElementById('editBillTitle').value;
    const newStatus = document.getElementById('editBillStatus').value;
    const newIntroducedDate = document.getElementById('editIntroducedDate').value;
    const newSponsor = document.getElementById('editSponsor').value;
    const newFullText = document.getElementById('editBillFullText').value;

    // Validate required fields
    if (!newNumber || !newTitle) {
        alert('Bill Number and Title are required');
        return;
    }

    // Update the bill in the currentBills array with all new details
    currentBills[index] = {
        ...currentBills[index],
        number: newNumber,
        title: newTitle,
        status: newStatus,
        introducedDate: newIntroducedDate,
        sponsor: newSponsor,
        fullText: newFullText
    };

    // Re-render the bill list
    renderBillList(currentBills);
}

function cancelEdit(index) {
    // Re-render the bill list to restore original view
    renderBillList(currentBills);
}

function openBillDetails(index) {
    const bill = currentBills[index];
    const billDetailPage = document.getElementById('billDetailPage');
    const billDetailContent = document.getElementById('billDetailContent');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    billDetailContent.innerHTML = `
        <div class="bill-header">
            <div class="bill-header-top">
                <div class="bill-number">S. ${bill.number}</div>
                <div class="bill-congress">118th Congress</div>
            </div>
            <h1 class="bill-title">${bill.title}</h1>
        </div>

        <div class="bill-metadata">
            <div class="bill-status-section">
                <h2>Bill Status</h2>
                <div class="status-details">
                    <p><strong>Current Status:</strong> ${bill.status || 'Pending'}</p>
                    <p><strong>Introduced:</strong> ${bill.introducedDate || 'Not available'}</p>
                    <p><strong>Sponsor:</strong> ${bill.sponsor || 'Not specified'}</p>
                </div>
            </div>

            <div class="bill-overview-section">
                <h2>Bill Overview</h2>
                <div class="overview-details">
                    <p>This bill was introduced in the ${new Date().getFullYear()} session of the United States Senate.</p>
                    <p>It is currently in the ${bill.status === 'introduced' ? 'introduction' : 
                        bill.status === 'committee' ? 'committee review' : 
                        bill.status === 'floor' ? 'floor debate' : 
                        bill.status === 'passed' ? 'passed' : 
                        bill.status === 'enacted' ? 'enacted' : 'pending'} stage.</p>
                </div>
            </div>
        </div>

        <div class="bill-text-section">
            <h2>Full Bill Text</h2>
            <div class="bill-text-container">
                <textarea id="billFullText" readonly>${bill.fullText || 'Full bill text not available'}</textarea>
            </div>
        </div>
        
        ${isAdmin ? `
            <div class="bill-actions-section">
                <h2>Administrative Actions</h2>
                <div class="bill-detail-actions">
                    <button onclick="editBillFromDetailPage(${index})">Edit Bill</button>
                    <button onclick="deleteBill(${index})">Delete Bill</button>
                </div>
            </div>
        ` : ''}
    `;
    
    billDetailPage.style.display = 'block';
}

function editBillFromDetailPage(index) {
    if (localStorage.getItem('isAdmin') !== 'true') {
        alert('You must be logged in as an admin to edit bills.');
        return;
    }

    const bill = currentBills[index];
    const billDetailContent = document.getElementById('billDetailContent');
    
    billDetailContent.innerHTML = `
        <div class="bill-detail-header">
            <h1>Edit Senate Bill S ${bill.number}</h1>
        </div>
        
        <div class="bill-edit-form">
            <div class="edit-form-grid">
                <label>Bill Number:</label>
                <input type="text" id="editBillNumber" value="${bill.number}" placeholder="Bill Number">
                
                <label>Bill Title:</label>
                <input type="text" id="editBillTitle" value="${bill.title}" placeholder="Bill Title">
                
                <label>Status:</label>
                <select id="editBillStatus">
                    <option value="introduced" ${bill.status === 'introduced' ? 'selected' : ''}>Introduced</option>
                    <option value="committee" ${bill.status === 'committee' ? 'selected' : ''}>In Committee</option>
                    <option value="floor" ${bill.status === 'floor' ? 'selected' : ''}>On Senate Floor</option>
                    <option value="passed" ${bill.status === 'passed' ? 'selected' : ''}>Passed</option>
                    <option value="enacted" ${bill.status === 'enacted' ? 'selected' : ''}>Enacted</option>
                </select>
                
                <label>Introduced Date:</label>
                <input type="date" id="editIntroducedDate" value="${bill.introducedDate || new Date().toISOString().split('T')[0]}">
                
                <label>Sponsor:</label>
                <input type="text" id="editSponsor" value="${bill.sponsor || ''}" placeholder="Sponsor Name">
            </div>
            
            <label>Full Bill Text:</label>
            <textarea id="editBillFullText" rows="15" placeholder="Full bill text">${bill.fullText || ''}</textarea>
            
            <div class="bill-detail-actions">
                <button onclick="saveEditedBillFromDetailPage(${index})">Save Changes</button>
                <button onclick="openBillDetails(${index})">Cancel</button>
            </div>
        </div>
    `;
}

function saveEditedBillFromDetailPage(index) {
    if (localStorage.getItem('isAdmin') !== 'true') {
        alert('You must be logged in as an admin to save bill changes.');
        return;
    }

    const newNumber = document.getElementById('editBillNumber').value;
    const newTitle = document.getElementById('editBillTitle').value;
    const newStatus = document.getElementById('editBillStatus').value;
    const newIntroducedDate = document.getElementById('editIntroducedDate').value;
    const newSponsor = document.getElementById('editSponsor').value;
    const newFullText = document.getElementById('editBillFullText').value;

    if (!newNumber || !newTitle) {
        alert('Bill Number and Title are required');
        return;
    }

    currentBills[index] = {
        ...currentBills[index],
        number: newNumber,
        title: newTitle,
        status: newStatus,
        introducedDate: newIntroducedDate,
        sponsor: newSponsor,
        fullText: newFullText
    };

    renderBillList(currentBills);
    openBillDetails(index);
}

function closeBillDetailPage() {
    document.getElementById('billDetailPage').style.display = 'none';
}

// On page load, check and adjust UI based on admin status
document.addEventListener('DOMContentLoaded', () => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (isAdmin) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'flex';
    } else {
        document.getElementById('loginSection').style.display = 'flex';
        document.getElementById('adminPanel').style.display = 'none';
    }
});
