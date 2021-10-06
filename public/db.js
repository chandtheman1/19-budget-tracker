let db;
// indexedDB
const request = window.indexedDB.open("budget", 1);
// set up a store
request.onupgradeneeded = function (event) {
    db = event.target.result;

    const pendingStore = db.createObjectStore("pending", {
        autoIncrement: true
    });
};


// checks the database if it is online
function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const pendingStore = transaction.objectStore("pending");

    const getAll = pendingStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => response.json())
            .then(() => {
                const transaction = db.transaction(["pending"], "readwrite");
                const pendingStore = transaction.objectStore("pending");
                pendingStore.clear();
            });
        }
    };
}


// save transactions to database if offline
function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const pendingStore = transaction.objectStore("pending");
    pendingStore.add(record);
}

// checks if the database is connected
request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.error(request.errorCode);
}

window.addEventListener('online', checkDatabase);