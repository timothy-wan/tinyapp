const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080
const morgan = require('morgan');
const helpers = require('./functions');

const urlDatabase = {
  'b2xVn2': {longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID'},
  '9sm5xK': {longURL: 'http://www.google.com', userID: 'userRandomID'}
};

const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: '1'
  },
 'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: '2'
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
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get('/urls', (req, res) => {
  let currentUser = req.cookies['user_id'];
  let userURLs = helpers.urlsForUser(urlDatabase, currentUser);
  let templateVars = {
    user: users[currentUser],
    urls: userURLs };
  res.render('urls_index', templateVars);
});

app.post('/urls/new', (req, res) => {
  if(req.cookies['user_id']) {
    if(req.body.longURL) {
      let newShortURL = helpers.generateStr();
      if(urlDatabase[newShortURL]) {
        newShortURL = helpers.generateStr();
      } else {
        urlDatabase[newShortURL] = { longURL: req.body.longURL
          , userID: req.cookies['user_id']}
      }
      res.redirect(`/urls/${newShortURL}`);
    } else {
      let currentUser = req.cookies['user_id'];
      let templateVars = {
        user: users[currentUser],
        urls: urlDatabase };
      res.render("urls_new", templateVars);
    }
  } else {
    res.status(403).send('Please register or login before trying to add a new URL');
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
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if(urlDatabase[req.params.shortURL === req.cookies['user_id']]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.status(403).send("You do not own this shortURL");
  }
});

app.get('/urls/new', (req, res) => {
  if(req.cookies['user_id']) {
    let currentUser = req.cookies['user_id'];
    let templateVars = {
      user: users[currentUser],
      urls: urlDatabase };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }

});

app.get('/urls/:shortURL', (req, res) => {
  if(urlDatabase[req.params.shortURL]) {
    console.log(urlDatabase);
    let currentUser = req.cookies['user_id'];
    let templateVars = {
      user: users[currentUser],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      userID: urlDatabase[req.params.shortURL].userID };
    res.render("urls_show", templateVars);
  } else {
    res.render("urls_not_found");
  }

});

app.post('/urls/:shortURL', (req, res) => {
  if(req.params.shortURL) {
    let currentUser = req.cookies['user_id'];
    console.log(urlDatabase[req.params.shortURL].userID);
    if(currentUser === urlDatabase[req.params.shortURL].userID) {
      urlDatabase[req.params.shortURL].longURL = req.body.longURL;
      let templateVars = {
        user: users[currentUser],
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL].longURL,
        userID: urlDatabase[req.params.shortURL].userID };
      res.render("urls_show", templateVars);
    } else {
      res.status(403).send('You are not the owner of the short URL');
    }
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