const filmModal = new bootstrap.Modal(document.getElementById('filmModal'));
const actorModal = new bootstrap.Modal(document.getElementById('actorModal'));

async function loadTopFilms() {
    const films = await get('/api/films/top-rented');
    const el = document.getElementById('topFilms');
    el.innerHTML = films.map(f => `
        <div class="col-md">
            <div class="card" onclick="showFilm(${f.film_id})">
                <div class="card-body">
                    <h6 class="card-title">${f.title}</h6>
                    <small class="text-muted">${f.category || ''} · ${f.rental_count} rentals</small>
                </div>
            </div>
        </div>
    `).join('');
}

async function showFilm(id) {
    const f = await get('/api/films/' + id);
    if (f.error) return;
    document.getElementById('filmModalTitle').textContent = f.title;
    const actors = (f.actors || []).map(a => a.first_name + ' ' + a.last_name).join(', ');
    const cats = (f.categories || []).map(c => c.name).join(', ');
    document.getElementById('filmModalBody').innerHTML = `
        <p>${f.description || ''}</p>
        <p>Year: ${f.release_year || '-'} · Rating: ${f.rating || '-'}</p>
        <p>Actors: ${actors || '-'}</p>
        <p>Categories: ${cats || '-'}</p>
        <a href="films.html?id=${f.film_id}" class="btn btn-primary btn-sm">View & Rent</a>
    `;
    filmModal.show();
}

async function loadTopActors() {
    const actors = await get('/api/actors/top');
    const el = document.getElementById('topActors');
    el.innerHTML = actors.map(a => `
        <div class="col-md">
            <div class="card" onclick="showActor(${a.actor_id})">
                <div class="card-body">
                    <h6 class="card-title">${a.first_name} ${a.last_name}</h6>
                    <small class="text-muted">${a.rental_count} rentals</small>
                </div>
            </div>
        </div>
    `).join('');
}

async function showActor(id) {
    const a = await get('/api/actors/' + id);
    if (a.error) return;
    document.getElementById('actorModalTitle').textContent = a.first_name + ' ' + a.last_name;
    const films = (a.top_films || []).map(f => `<li>${f.title} (${f.rental_count})</li>`).join('');
    document.getElementById('actorModalBody').innerHTML = `
        <p class="mb-2">top 5 rented</p>
        <ul class="mb-0">${films || '<li>-</li>'}</ul>
    `;
    actorModal.show();
}

loadTopFilms();
loadTopActors();
