const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080
const morgan = require('morgan');
const helpers = require('./functions');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
 'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/urls', (req, res) => {
  let currentUser = req.cookies['user_id'];
  let templateVars = {
    user: users[currentUser],
    urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.post('/urls/new', (req, res) => {
  if(req.body.longURL) {
    let newShortURL = helpers.generateStr();
    if(urlDatabase[newShortURL]) {
      newShortURL = helpers.generateStr();
    } else {
      urlDatabase[newShortURL] = req.body.longURL;
    }
    res.redirect(`/urls/${newShortURL}`);
  } else {
    let currentUser = req.cookies['user_id'];
    let templateVars = {
      user: users[currentUser],
      urls: urlDatabase };
    res.render("urls_new", templateVars);
  }
});

app.get('/register', (req, res) => {
  let currentUser = req.cookies['user_id'];
  let templateVars = {
    user: users[currentUser],
    urls: urlDatabase };
  res.render('urls_registration', templateVars);
});

app.post('/register', (req, res) => {
  let newId = helpers.generateStr();
  let newEmail = req.body.email;
  let newPassword = req.body.password;
  if(!newEmail || !newPassword || helpers.emailCheck(users, newEmail)) {
    res.sendStatus(400);
  } else {
    if(users[newId]) {
      newId = helpers.generateStr();
    } else {
      users[newId] = {
        id: newId,
        email: newEmail,
        password: newPassword

      }
      res.cookie('user_id', newId);
    }
  }
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  let currentUser = req.cookies['user_id'];
  let templateVars = {
    user: users[currentUser],
    urls: urlDatabase };
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  let loginEmail = req.body.email;
  let loginPassword = req.body.password;
  let userID = helpers.getUserID(users, loginEmail);
  if(!userID) {
    res.status(403).send('This account does not exist!');
  } else if (users[userID].password !== loginPassword) {
    res.status(403).send('You have entered the wrong password');
  } else {
    res.cookie('user_id', userID);
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  console.log()
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})

app.get('/urls/new', (req, res) => {
  let currentUser = req.cookies['user_id'];
  let templateVars = {
    user: users[currentUser],
    urls: urlDatabase };
  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  if(urlDatabase[req.params.shortURL]) {
    let currentUser = req.cookies['user_id'];
    let templateVars = {
      user: users[currentUser],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
  } else {
    res.render("urls_not_found");
  }

});

app.post('/urls/:shortURL', (req, res) => {
  if(req.params.shortURL) {
    let currentUser = req.cookies['user_id'];
    let templateVars = {
      user: users[currentUser],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
  } else {
    res.render("urls_not_found");
  }
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT,'0.0.0.0', () => {
  console.log(`Tinyapp server listening on port ${PORT}!`);
});