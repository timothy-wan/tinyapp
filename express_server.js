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
  let templateVars = {
    username: req.cookies['username'],
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
    let templateVars = { username: req.cookies['username']}
    res.render("urls_new", templateVars);
  }
});

app.get('/register', (req, res) => {
  let templateVars = { username: req.cookies['username']};
  res.render('urls_registration', templateVars);
});

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})

app.get('/urls/new', (req, res) => {
  let templateVars = { username: req.cookies['username']};
  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  if(urlDatabase[req.params.shortURL]) {
    let templateVars = { username: req.cookies['username'], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
  } else {
    res.render("urls_not_found");
  }

});

app.post('/urls/:shortURL', (req, res) => {
  if(req.params.shortURL) {
    urlDatabase[req.params.shortURL] = req.body.longURL;
    let templateVars = { username: req.cookies['username'], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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