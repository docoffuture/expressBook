const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    //write code to check is the username is valid
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username, password) => { //returns boolean
    //write code to check if username and password match the one we have in records.
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

const doesExist = (username) => {
    //write code to check if the username exists in the users array
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    return userswithsamename.length > 0;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    // Extract username and password from request body
    const { username, password } = req.body;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: username
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token in response
        return res.status(200).json({
            message: "User successfully logged in",
            accessToken: accessToken
        });
    } else {
        return res.status(401).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    // Extract ISBN parameter from request URL
    const isbn = req.params.isbn;
    const review = req.body.review; // Extract review from request body
    const username = req.session.authorization.username; // Extract username from session

    // Check if the book exists
    if (books[isbn]) { // Check if the book exists in the 'books' object
        if (review) { // Check if review is provided
            books[isbn].reviews[username] = review; // Add or update the review
            res.send(`Review for book with ISBN ${isbn} updated successfully.`);
        } else {
            // Respond if review is not provided
            res.status(400).send("Review content is required!");
        }
    } else {
        // Respond if book with specified ISBN is not found
        res.status(404).send("Unable to find book with the specified ISBN!");
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    // Extract ISBN parameter from request URL
    const isbn = req.params.isbn;
    const username = req.session.authorization.username; // Extract username from session

    // Check if the book exists
    if (books[isbn]) {
        // Check if the review exists for the current user
        if (books[isbn].reviews[username]) {
            // Delete the review
            delete books[isbn].reviews[username];
            // Send response confirming deletion of review
            res.send(`Review for book with ISBN ${isbn} deleted.`);
        } else {
            // Respond if review not found for the current user
            res.status(404).send("Review not found for the current user.");
        }
    } else {
        // Respond if book with specified ISBN is not found
        res.status(404).send("Book not found.");
    }
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.doesExist = doesExist;
module.exports.users = users;
