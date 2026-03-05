let currentPage = 1;
let currentSearch = '';
let currentSearchBy = 'id';

async function loadCustomers() {
    let url = '/api/customers?page=' + currentPage + '&limit=10';
    if (currentSearch) {
        url += '&q=' + encodeURIComponent(currentSearch) + '&by=' + currentSearchBy;
    }
    
    const res = await get(url);
    const tbody = document.getElementById('customerTable');
    tbody.innerHTML = (res.data || []).map(c => `
        <tr>
            <td>${c.customer_id}</td>
            <td>${c.first_name} ${c.last_name}</td>
            <td>${c.email || '-'}</td>
            <td>${c.rental_count || 0}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewCustomer(${c.customer_id})">View</button>
                <button class="btn btn-sm btn-warning" onclick="editCustomer(${c.customer_id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${c.customer_id})">Delete</button>
            </td>
        </tr>
    `).join('');

    const pag = document.getElementById('pagination');
    let html = '';
    if (currentPage > 1) {
        html += '<li class="page-item"><a class="page-link" href="#" onclick="goPage(' + (currentPage - 1) + '); return false;">Prev</a></li>';
    }
    html += '<li class="page-item"><span class="page-link">' + currentPage + ' / ' + (res.pages || 1) + '</span></li>';
    if (currentPage < (res.pages || 1)) {
        html += '<li class="page-item"><a class="page-link" href="#" onclick="goPage(' + (currentPage + 1) + '); return false;">Next</a></li>';
    }
    pag.innerHTML = html;
}

function goPage(p) {
    currentPage = p;
    loadCustomers();
    return false;
}

function searchCustomers() {
    currentSearch = document.getElementById('searchInput').value.trim();
    currentSearchBy = document.getElementById('searchBy').value;
    currentPage = 1;
    loadCustomers();
}

document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchCustomers();
    }
});

async function viewCustomer(id) {
    const customer = await get('/api/customers/' + id);
    
    let rentalsHtml = '';
    if (customer.rentals && customer.rentals.length > 0) {
        rentalsHtml = `
            <h6 class="mt-4">Rental History</h6>
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Film</th>
                        <th>Rented</th>
                        <th>Returned</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${customer.rentals.map(r => `
                        <tr>
                            <td><a href="films.html?id=${r.film_id}">${r.title}</a></td>
                            <td>${new Date(r.rental_date).toLocaleDateString()}</td>
                            <td>${r.return_date ? new Date(r.return_date).toLocaleDateString() : '<span class="badge bg-warning">Not Returned</span>'}</td>
                            <td>
                                ${!r.return_date ? `<button class="btn btn-sm btn-success" onclick="returnRental(${r.rental_id}, ${id})">Return</button>` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        rentalsHtml = '<p class="text-muted mt-4">No rental history</p>';
    }
    
    document.getElementById('customerModalBody').innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <p><strong>Customer ID:</strong> ${customer.customer_id}</p>
                <p><strong>Name:</strong> ${customer.first_name} ${customer.last_name}</p>
                <p><strong>Email:</strong> ${customer.email || '-'}</p>
            </div>
            <div class="col-md-6">
                <p><strong>Phone:</strong> ${customer.phone || '-'}</p>
                <p><strong>Address:</strong> ${customer.address || '-'}</p>
                <p><strong>City:</strong> ${customer.city || '-'}, ${customer.country || '-'}</p>
            </div>
        </div>
        ${rentalsHtml}
    `;
    
    new bootstrap.Modal(document.getElementById('customerModal')).show();
}

async function returnRental(rentalId, customerId) {
    const res = await put('/api/rentals/' + rentalId + '/return', {});
    if (res.ok) {
        alert('Rental returned successfully!');
        viewCustomer(customerId);
    } else {
        alert('Error: ' + (res.error || 'Failed to return rental'));
    }
}

function showAddCustomerModal() {
    document.getElementById('customerFormTitle').textContent = 'Add Customer';
    document.getElementById('editCustomerId').value = '';
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('address').value = '';
    new bootstrap.Modal(document.getElementById('customerFormModal')).show();
}

async function editCustomer(id) {
    const customer = await get('/api/customers/' + id);
    
    document.getElementById('customerFormTitle').textContent = 'Edit Customer';
    document.getElementById('editCustomerId').value = id;
    document.getElementById('firstName').value = customer.first_name || '';
    document.getElementById('lastName').value = customer.last_name || '';
    document.getElementById('email').value = customer.email || '';
    document.getElementById('phone').value = customer.phone || '';
    document.getElementById('address').value = customer.address || '';
    
    new bootstrap.Modal(document.getElementById('customerFormModal')).show();
}

async function saveCustomer() {
    const id = document.getElementById('editCustomerId').value;
    const data = {
        first_name: document.getElementById('firstName').value.trim(),
        last_name: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim()
    };
    
    if (!data.first_name || !data.last_name) {
        alert('First name and last name are required');
        return;
    }
    
    let res;
    if (id) {
        res = await put('/api/customers/' + id, data);
    } else {
        res = await post('/api/customers', data);
    }
    
    if (res.ok || res.customer_id) {
        bootstrap.Modal.getInstance(document.getElementById('customerFormModal')).hide();
        loadCustomers();
        alert(id ? 'Customer updated successfully!' : 'Customer added successfully!');
    } else {
        alert('Error: ' + (res.error || 'Failed to save customer'));
    }
}

function deleteCustomer(id) {
    document.getElementById('deleteCustomerId').value = id;
    new bootstrap.Modal(document.getElementById('deleteModal')).show();
}

async function confirmDelete() {
    const id = document.getElementById('deleteCustomerId').value;
    const res = await del('/api/customers/' + id);
    
    if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
        loadCustomers();
        alert('Customer deleted successfully!');
    } else {
        alert('Error: ' + (res.error || 'Failed to delete customer'));
    }
}

loadCustomers();
