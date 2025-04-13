// Function to load bill details when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Retrieve bill index from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const billIndex = urlParams.get('index');
    
    // Retrieve bills from local storage
    const savedBills = localStorage.getItem('senateBills');
    const bills = savedBills ? JSON.parse(savedBills) : [];
    
    // Check if a valid bill index exists
    if (billIndex !== null && billIndex >= 0 && billIndex < bills.length) {
        const bill = bills[billIndex];
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        
        // Populate bill details
        document.getElementById('billDetailContent').innerHTML = `
            <section class="bill-details-section">
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
                            <button onclick="editBill(${billIndex})">Edit Bill</button>
                            <button onclick="deleteBill(${billIndex})">Delete Bill</button>
                        </div>
                    </div>
                ` : ''}
            </section>
        `;
    } else {
        // If no valid bill is found, show an error message
        document.getElementById('billDetailContent').innerHTML = `
            <div class="error-message">
                <h2>Bill Not Found</h2>
                <p>The requested bill could not be located. Please return to the bill list.</p>
                <a href="index.html" class="back-to-list-button">Return to Bill List</a>
            </div>
        `;
    }
});

// Add admin edit and delete functionality
function editBill(index) {
    if (localStorage.getItem('isAdmin') !== 'true') {
        alert('You must be logged in as an admin to edit bills.');
        return;
    }

    // Retrieve bills from local storage
    const savedBills = localStorage.getItem('senateBills');
    const bills = savedBills ? JSON.parse(savedBills) : [];
    const bill = bills[index];

    // Replace content with edit form
    document.getElementById('billDetailContent').innerHTML = `
        <div class="bill-edit-form">
            <h1>Edit Senate Bill S ${bill.number}</h1>
            
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
                <button onclick="saveEditedBill(${index})">Save Changes</button>
                <a href="bill-details.html?index=${index}" class="cancel-edit">Cancel</a>
            </div>
        </div>
    `;
}

function saveEditedBill(index) {
    if (localStorage.getItem('isAdmin') !== 'true') {
        alert('You must be logged in as an admin to save bill changes.');
        return;
    }

    // Retrieve bills from local storage
    const savedBills = localStorage.getItem('senateBills');
    const bills = savedBills ? JSON.parse(savedBills) : [];

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

    // Update the specific bill
    bills[index] = {
        ...bills[index],
        number: newNumber,
        title: newTitle,
        status: newStatus,
        introducedDate: newIntroducedDate,
        sponsor: newSponsor,
        fullText: newFullText
    };

    // Save updated bills back to local storage
    localStorage.setItem('senateBills', JSON.stringify(bills));

    // Redirect back to bill details
    window.location.href = `bill-details.html?index=${index}`;
}

function deleteBill(index) {
    if (localStorage.getItem('isAdmin') !== 'true') {
        alert('You must be logged in as an admin to delete bills.');
        return;
    }

    // Retrieve bills from local storage
    const savedBills = localStorage.getItem('senateBills');
    const bills = savedBills ? JSON.parse(savedBills) : [];

    // Remove the specific bill
    bills.splice(index, 1);

    // Save updated bills back to local storage
    localStorage.setItem('senateBills', JSON.stringify(bills));

    // Redirect back to main page
    window.location.href = 'index.html';
}
