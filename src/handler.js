const { nanoid } = require("nanoid");
const database = require("./database");

const addBookHandler = (request, h) => {
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

  const id = nanoid(16);
  const finished = pageCount === readPage;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  if (readPage > pageCount) {
    const response = h.response({
      status: "fail",
      message: "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
    });
    response.code(400);
    return response;
  }

  if (!name) {
    const response = h.response({
      status: "fail",
      message: "Gagal menambahkan buku. Mohon isi nama buku",
    });
    response.code(400);
    return response;
  }

  database.push(newBook);

  const isSuccess = database.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: "success",
      message: "Buku berhasil ditambahkan",
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }
};

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  const books = database.map(({ id, name, publisher }) => {
    return { id, name, publisher };
  });

  const dataReading = database.filter((i) => i.reading === true).map((i) => ({ name: i.name, publisher: i.publisher }));
  const dataUnReading = database.filter((i) => i.reading === false).map((i) => ({ name: i.name, publisher: i.publisher }));
  const dataFinished = database.filter((i) => i.finished === true).map((i) => ({ name: i.name, publisher: i.publisher }));
  const dataUnFinished = database.map((i) => i.finished === false).map((i) => ({ name: i.name, publisher: i.publisher }));
  const dataByName = database.filter((i) => {
    let bookName = `${i.name}`.toLowerCase();
    let bookNameQuery = `${name}`.toLowerCase();
    return bookName.includes(bookNameQuery);
  });

  if (reading === 1) {
    return {
      status: "success",
      data: { books: dataReading },
    };
  } else if (reading === 0) {
    return {
      status: "success",
      data: { books: dataUnReading },
    };
  }

  if (finished === 1) {
    return {
      status: "success",
      data: { books: dataFinished },
    };
  } else if (finished === 0) {
    return {
      status: "success",
      data: { books: dataUnFinished },
    };
  }
  if (name !== undefined) {
    const response = h.response({
      status: "success",
      data: { books: [dataByName] },
    });
  }
  return {
    status: "success",
    data: { books: books },
  };
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const book = database.filter((n) => n.id == bookId)[0];

  if (book !== undefined) {
    return {
      status: "success",
      data: { book: book },
    };
  }

  const response = h.response({
    status: "fail",
    message: "Buku tidak ditemukan",
  });
  response.code(404);
  return response;
};

const updateBookByIdHAndler = (request, h) => {
  const { bookId } = request.params;
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;
  const updatedAt = new Date().toISOString();

  const index = database.findIndex((book) => book.id === bookId);

  if (!name) {
    const response = h.response({
      status: "fail",
      message: "Gagal memperbarui buku. Mohon isi nama buku",
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: "fail",
      message: "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
    });
    response.code(400);
    return response;
  }

  if (index !== -1) {
    database[index] = { ...database[index], name, year, author, summary, publisher, pageCount, readPage, reading, updatedAt };

    const response = h.response({
      status: "success",
      message: "Buku berhasil diperbarui",
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: "fail",
    message: "Gagal memperbarui buku. Id tidak ditemukan",
  });
  response.code(404);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const index = database.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    database.splice(index, 1);
    const response = h.response({
      status: "success",
      message: "Buku berhasil dihapus",
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: "fail",
    message: "Buku gagal dihapus. Id tidak ditemukan",
  });
  response.code(404);
  return response;
};

module.exports = { addBookHandler, getAllBooksHandler, getBookByIdHandler, updateBookByIdHAndler, deleteBookByIdHandler };
