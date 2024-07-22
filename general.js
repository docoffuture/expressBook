//GENERAL.JS 20240720

const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (isValid(username)) {
        return res.status(400).json({ message: "Username already exists" });
    }
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});


const axios = require('axios');

// Get the list of books available in the shop using Axios
public_users.get('/', async function (req, res) {
    try {
        const response = await axios.get('http://localhost:5000/');
        res.json(response.data);
    } catch (error) {
        res.status(500).send("Error fetching books");
    }
});


// Get the book list available in the shop
public_users.get('/', function (req, res) {
    res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN using Axios
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        res.json(response.data);
    } catch (error) {
        res.status(404).send("Book not found");
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).json(books[isbn]);
});

// Get book details based on author using Axios
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        res.json(response.data);
    } catch (error) {
        res.status(404).send("No books found by this author");
    }
});


// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const results = Object.values(books).filter(book => book.author === author);
    if (results.length === 0) {
        return res.status(404).json({ message: "No books found by this author" });
    }
    return res.status(200).json(results);
});

// Get book details based on title using Axios
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const response = await axios.get(`http://localhost:5000/title/${title}`);
        res.json(response.data);
    } catch (error) {
        res.status(404).send("No books found with this title");
    }
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const results = Object.values(books).filter(book => book.title === title);
    if (results.length === 0) {
        return res.status(404).json({ message: "No books found with this title" });
    }
    return res.status(200).json(results);
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;

