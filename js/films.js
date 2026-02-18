let currentFilmId = null;
let filmPage = 1;
let filmTotalPages = 1;
let inSearch = false;
const filmModal = new bootstrap.Modal(document.getElementById('filmModal'));

async function loadCustomers() {
    const res = await get('/api/customers?limit=500');
    const sel = document.getElementById('rentCustomer');
    sel.innerHTML = '<option value="">--</option>' +
        (res.data || []).map(c => `<option value="${c.customer_id}">${c.first_name} ${c.last_name}</option>`).join('');
}

function renderFilms(films) {
    const el = document.getElementById('filmResults');
    const data = Array.isArray(films) ? films : (films.data || []);
    if (!data.length) {
        el.innerHTML = '<p class="text-muted">No results</p>';
        return;
    }
    el.innerHTML = data.map(f => `
        <div class="col-md-4">
            <div class="card" onclick="showFilm(${f.film_id})">
                <div class="card-body">
                    <h6 class="card-title">${f.title}</h6>
                    <small class="text-muted">${f.rating || ''} · $${f.rental_rate || ''}</small>
                </div>
            </div>
        </div>
    `).join('');
}

function renderPagination() {
    const pag = document.getElementById('filmPagination');
    if (inSearch) {
        pag.innerHTML = '';
        return;
    }
    let html = '';
    if (filmPage > 1) {
        html += '<li class="page-item"><a class="page-link" href="#" onclick="goFilmPage(' + (filmPage - 1) + '); return false;">Prev</a></li>';
    }
    html += '<li class="page-item"><span class="page-link">' + filmPage + ' / ' + filmTotalPages + '</span></li>';
    if (filmPage < filmTotalPages) {
        html += '<li class="page-item"><a class="page-link" href="#" onclick="goFilmPage(' + (filmPage + 1) + '); return false;">Next</a></li>';
    }
    pag.innerHTML = html;
}

async function loadFilms() {
    inSearch = false;
    const res = await get('/api/films?page=' + filmPage + '&limit=12');
    filmTotalPages = res.pages || 1;
    renderFilms(res);
    renderPagination();
}

function goFilmPage(p) {
    filmPage = p;
    loadFilms();
}

async function search() {
    const q = document.getElementById('searchInput').value.trim();
    const by = document.getElementById('searchBy').value;
    if (!q) {
        filmPage = 1;
        loadFilms();
        return;
    }
    inSearch = true;
    const films = await get('/api/films?q=' + encodeURIComponent(q) + '&by=' + by);
    renderFilms(films);
    renderPagination();
}

async function showFilm(id) {
    currentFilmId = id;
    const f = await get('/api/films/' + id);
    if (f.error) return;
    document.getElementById('filmModalTitle').textContent = f.title;
    const actors = (f.actors || []).map(a => a.first_name + ' ' + a.last_name).join(', ');
    const cats = (f.categories || []).map(c => c.name).join(', ');
    document.getElementById('filmModalBody').innerHTML = `
        <p>${f.description || ''}</p>
        <p>Year: ${f.release_year || '-'} · Rating: ${f.rating || '-'} · $${f.rental_rate || ''}</p>
        <p>Actors: ${actors || '-'}</p>
        <p>Categories: ${cats || '-'}</p>
    `;
    filmModal.show();
}

async function doRent() {
    const customerId = document.getElementById('rentCustomer').value;
    if (!customerId || !currentFilmId) return;
    const res = await post('/api/rentals', { film_id: currentFilmId, customer_id: parseInt(customerId) });
    if (res.error) {
        alert(res.error);
    } else {
        alert('Rented');
        filmModal.hide();
    }
}

document.getElementById('searchInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') search();
});

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('id')) {
    loadFilms().then(() => showFilm(parseInt(urlParams.get('id'))));
} else {
    loadFilms();
}

loadCustomers();
