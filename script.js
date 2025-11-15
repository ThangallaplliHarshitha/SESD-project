let books = JSON.parse(localStorage.getItem("books") || "[]");

const $ = id => document.getElementById(id);

function render() {
    const list = $("bookList");
    list.innerHTML = "";

    let filtered = books;

    const q = $("q").value.toLowerCase();
    if (q) {
        filtered = filtered.filter(b =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q)
        );
    }

    const cat = $("filterCat").value;
    if (cat) {
        filtered = filtered.filter(b => b.category === cat);
    }

    const sortBy = $("sortBy").value;
    if (sortBy === "title") filtered.sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === "borrowed") filtered.sort((a, b) => b.borrowed - a.borrowed);

    filtered.forEach(book => {
        const div = document.createElement("div");
        div.className = "book";

        div.innerHTML = `
            <div>
                <div class="book-title">${book.title}</div>
                <div>${book.author} • ${book.category} • ${book.year}</div>
                <div>Available: ${book.copies - book.borrowed}</div>
                <div>Borrowed: ${book.borrowed}</div>
            </div>

            <div>
                <button onclick="borrow('${book.id}')">Borrow</button>
                <button onclick="returnBook('${book.id}')">Return</button>
                <button onclick="editBook('${book.id}')">Edit</button>
                <button onclick="deleteBook('${book.id}')" class="secondary">Delete</button>
            </div>
        `;

        list.appendChild(div);
    });

    updateStats();
}

function updateStats() {
    $("totalTitles").innerText = books.length;
    $("totalCopies").innerText = books.reduce((s, b) => s + b.copies, 0);
    $("totalBorrowed").innerText = books.reduce((s, b) => s + b.borrowed, 0);
}

$("bookForm").addEventListener("submit", e => {
    e.preventDefault();

    const id = $("bookId").value;

    const data = {
        id: id || Date.now().toString(),
        title: $("title").value,
        author: $("author").value,
        category: $("category").value,
        copies: parseInt($("copies").value),
        year: $("year").value,
        description: $("description").value,
        borrowed: id ? books.find(b => b.id === id).borrowed : 0
    };

    if (id) {
        const index = books.findIndex(b => b.id === id);
        books[index] = data;
    } else {
        books.push(data);
    }

    localStorage.setItem("books", JSON.stringify(books));
    $("bookForm").reset();
    $("bookId").value = "";
    render();
});

function borrow(id) {
    const b = books.find(x => x.id === id);
    if (b && b.copies > b.borrowed) {
        b.borrowed++;
        localStorage.setItem("books", JSON.stringify(books));
        render();
    }
}

function returnBook(id) {
    const b = books.find(x => x.id === id);
    if (b && b.borrowed > 0) {
        b.borrowed--;
        localStorage.setItem("books", JSON.stringify(books));
        render();
    }
}

function editBook(id) {
    const b = books.find(x => x.id === id);
    $("bookId").value = b.id;
    $("title").value = b.title;
    $("author").value = b.author;
    $("category").value = b.category;
    $("copies").value = b.copies;
    $("year").value = b.year;
    $("description").value = b.description;
}

function deleteBook(id) {
    books = books.filter(b => b.id !== id);
    localStorage.setItem("books", JSON.stringify(books));
    render();
}

$("clearBtn").addEventListener("click", () => {
    $("bookForm").reset();
    $("bookId").value = "";
});

["q", "filterCat", "sortBy"].forEach(i =>
    $(i).addEventListener("input", render)
);

render();
