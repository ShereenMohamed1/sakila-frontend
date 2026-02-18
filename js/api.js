var api = 'http://localhost:8000';

function get(path) {
    return fetch(api + path).then(r => r.json());
}

function post(path, body) {
    return fetch(api + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then(r => r.json());
}
