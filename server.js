require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { v4: uuid } = require('uuid');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

let books = [
  { id: uuid(), title: '1984', author: 'George Orwell' },
  { id: uuid(), title: 'Pride and Prejudice', author: 'Jane Austen' },
  { id: uuid(), title: 'The Hobbit', author: 'J.R.R. Tolkien' }
];

app.get('/api/books', (req, res) => {
  res.json(books);
});

app.get('/api/books/:id', (req, res) => {
  const book = _.find(books, { id: req.params.id });
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  res.json(book);
});

app.post('/api/books', (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ message: 'Title and author are required' });
  }
  const book = { id: uuid(), title, author };
  books.push(book);
  res.status(201).json(book);
});

app.delete('/api/books/:id', (req, res) => {
  const initialLength = books.length;
  books = books.filter(book => book.id !== req.params.id);
  if (books.length === initialLength) {
    return res.status(404).json({ message: 'Book not found' });
  }
  res.status(204).send();
});

app.get('/api/secret', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey');
    res.json({ message: 'This is protected data', user: payload });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.get('/api/joke', async (req, res) => {
  try {
    const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch joke', error: err.message });
  }
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
