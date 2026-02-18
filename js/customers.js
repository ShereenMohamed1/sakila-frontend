let currentPage = 1;

async function loadCustomers() {
    const res = await get('/api/customers?page=' + currentPage + '&limit=10');
    const tbody = document.getElementById('customerTable');
    tbody.innerHTML = (res.data || []).map(c => `
        <tr>
            <td>${c.customer_id}</td>
            <td>${c.first_name} ${c.last_name}</td>
            <td>${c.email || '-'}</td>
            <td>${c.rental_count || 0}</td>
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

loadCustomers();
