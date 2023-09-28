// Declaration of variables and dependencies
require('dotenv').config(); // Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
const express = require('express');
const mongoose = require('mongoose');
const auth = require('./auth');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const Schema = mongoose.Schema;

// Create the Express application
const app = express();
const port = process.env.PORT || 3000;

// To ensure that server communictes with the client using JSON protocol (content/type: application/json)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// To secure the server from unauthorized access
app.use(cors({
  origin: 'https://smart-transport-frontend.vercel.app',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));


// Connect to database
mongoose.connect('mongodb+srv://admin:AkinPopular@smartonline.a8qjsv8.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

// Define User Schema and Model
const User = mongoose.model('User', 
  new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  })
);

// Handle Signup logic endpoint
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (user) {
    return res.status(400).json({ error: 'User already exists' });
  }

// Salting and hashing the password for security
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });
    await user.save();
    res.status(200).json({ message: 'User created successfully' });
    // res.redirect('/login');
  } catch (error) {
    res.status(500).json({ error: 'An error occurred. Not sure what the problem is.' });
  }
});

// Handle Login logic endpoint
app.post('/login', async (req, res, next) => {
  const { identifier, password } = req.body;
  User.findOne({ $or: [{ username: identifier }, { email: identifier }] })
  .then(user => {
    bcrypt.compare(password, user.password)
    .then(isMatch => {
      if (!isMatch) {
        return res.status(401).json({ error: 'Incorrect password' });
      }
      const token = jwt.sign(
        { userId: user._id,
          username: user.username,
        },
        "RANDOM-TOKEN",
        { expiresIn: "24h" }
      );
      res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
      res.status(200).json({ message: 'Login successful', token });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: 'An error occurred' });
    });
  })
});

// Get users
app.get('/user/profile', (req, res) => {
  // Assuming user data is available in the request object
  const { username } = req.user;

  res.json({ username });
});


// Handle Logout functionality
app.get("/log-out", (req, res) => {
  req.logout();
  res.clearCookie("token");
  res.json({ message: "You are now logged out" });
  // res.redirect("/");
});

const repoData = [];

// Scraping the web for legal documents/directives
app.get('/directives', async (req, res) => {
  try {
    const url = 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32010L0040';
    const response = await axios.get(url);

    if (response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html);

      // CSS Selectors to select specific contents
      const titles = $('p#title');
      const contents = $('div.tabContent div');

      repoData.push({ title: $(titles).text().trim(), content: contents.html() });

      const directiveHTML = `
      <h3 className="title_dir">${$(titles).text().trim()}</h3>
      <div>${contents.html()}</div>
    `;

      res.status(200).send(directiveHTML);
    } else {
      res.status(response.status).json({ error: `Request failed with status code ${response.status}` });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Scraping the web for relevant regulations
app.get('/regulations', async (req, res) => {
  try {
    const url = 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02016R0679-20160504';
    const response = await axios.get(url);

    if (response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html);

      const titles = $('p#title');
      const contents = $('div.tabContent div');

      repoData.push({ title: $(titles).text().trim(), content: contents.html() });

      const directiveHTML = `
      <h1>${$(titles).text().trim()}</h1>
      <div>${contents.html()}</div>
    `;

      res.status(200).send(directiveHTML);
    } else {
      res.status(response.status).json({ error: `Request failed with status code ${response.status}` });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Scraping the web for relevant statutory instruments
app.get('/statutory-instrument', async (req, res) => {
  try {
    const url = 'https://www.gov.uk/eu-withdrawal-act-2018-statutory-instruments/the-intelligent-transport-systems-eu-exit-regulations-2018';
    const response = await axios.get(url);

    if (response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html);
  
      const link = $('#attachment_20dfd6c0-add2-4afb-8147-1c5cbe5180fd > a');

      $(link).find('p, h1, h2, h3').remove();

      repoData.push({ title: $(link).text().trim(), content: '' });

      const directiveHTML = `
      <a href="${$(link).attr('href')}" class="link-ext">View content</a>
    `;

      res.status(200).send(directiveHTML);
    } else {
      res.status(response.status).json({ error: `Request failed with status code ${response.status}` });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Scraping the web for relevant explanatory memorandum
app.get('/explanatory-memorandum', async (req, res) => {
  try {
    const url = 'https://www.gov.uk/eu-withdrawal-act-2018-statutory-instruments/the-intelligent-transport-systems-eu-exit-regulations-2018';
    const response = await axios.get(url);
    if (response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html);
      const title = $('h1.gem-c-title__text');
      const info = $('p.gem-c-lead-paragraph');
      const link = $('#attachment_a500ac1e-20cc-43e5-92b2-1867e4734ae3 > a');

      repoData.push({ title: $(title).text().trim(), content: info.html() });
      
      const directiveHTML = `
        <a href="${$(link).attr('href')}" class="link-ext">View content</a>
    `;

      res.status(200).send(directiveHTML);
    } else {
      res.status(response.status).json({ error: `Request failed with status code ${response.status}` });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Scraping the web after server startup and store it in repoData
const scrapeData = async () => {
  try {
    // Scraping the web for legal documents/directives
    const directivesResponse = await axios.get('https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32010L0040');
    if (directivesResponse.status === 200) {
      const directivesHTML = directivesResponse.data;
      const $ = cheerio.load(directivesHTML);
      const titles = $('p#title');
      const contents = $('div.tabContent div');
      repoData.push({ title: $(titles).text().trim(), content: contents.html() });
    }

    // Scraping the web for relevant regulations
    const regulationsResponse = await axios.get('https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02016R0679-20160504');
    if (regulationsResponse.status === 200) {
      const regulationsHTML = regulationsResponse.data;
      const $ = cheerio.load(regulationsHTML);
      const titles = $('p#title');
      const contents = $('div.tabContent div');
      repoData.push({ title: $(titles).text().trim(), content: contents.html() });
    }

    // Scraping the web for relevant statutory instruments
    const statutoryInstrumentResponse = await axios.get('https://www.gov.uk/eu-withdrawal-act-2018-statutory-instruments/the-intelligent-transport-systems-eu-exit-regulations-2018');
    if (statutoryInstrumentResponse.status === 200) {
      const statutoryInstrumentHTML = statutoryInstrumentResponse.data;
      const $ = cheerio.load(statutoryInstrumentHTML);
      const link = $('#attachment_20dfd6c0-add2-4afb-8147-1c5cbe5180fd > a');
      $(link).find('p, h1, h2, h3').remove();
      repoData.push({ title: $(link).text().trim(), content: '' });
    }

    // Scraping the web for relevant explanatory memorandum
    const explanatoryMemorandumResponse = await axios.get('https://www.gov.uk/eu-withdrawal-act-2018-statutory-instruments/the-intelligent-transport-systems-eu-exit-regulations-2018');
    if (explanatoryMemorandumResponse.status === 200) {
      const explanatoryMemorandumHTML = explanatoryMemorandumResponse.data;
      const $ = cheerio.load(explanatoryMemorandumHTML);
      const title = $('h1.gem-c-title__text');
      const info = $('p.gem-c-lead-paragraph');
      const link = $('#attachment_a500ac1e-20cc-43e5-92b2-1867e4734ae3 > a');
      repoData.push({ title: $(title).text().trim(), content: info.html() });
    }
  } catch (error) {
    console.error('Scraping error:', error);
  }
}

// Call the scrapeData function to scrape data during server startup
scrapeData();

// Implement search functionality within scraped data
app.post('/search', async (req, res) => {
  const { query } = req.body;

  // Search through the combined scraped data
  const searchResults = repoData.filter((data) => {
    if (data.title && data.title.includes(query)) {
      return true;
    }
    if (data.content && data.content.includes(query)) {
      return true;
    }
    return false;
  });

  // Send the search results to the frontend
  res.json({ results: searchResults });
});

// Implement search functionality
app.post('/search', async (req, res) => {
  const { query } = req.body;

  // Search through the combined scraped data
  const searchResults = repoData.filter((data) => {
    if (data.title && data.title.includes(query)) {
      return true;
    }
    if (data.content && data.content.includes(query)) {
      return true;
    }
    return false;
  });

  // Send the search results to the frontend
  res.json({ results: searchResults });
});

app.listen(port, () => console.log(`Server is running on port ${port}`));

module.exports = app;
