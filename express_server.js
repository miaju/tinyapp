const express = require("express");
const morgan = require("morgan");
const cookieParser = require('cookie-parser');
const res = require("express/lib/response");
const app = express();
const PORT = 8080; // default port 8080

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// set ejs as view engine
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = {

};

const generateRandomString = function() {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor((chars.length * Math.random()))];
  }

  return result;
};


app.get("/", (req, res) => {
  res.send("Hello! This is a placeholder");
});


// redirects to long url that has id of id
app.get("/u/:id", (req, res) => {
  res.redirect(urlDatabase[req.params.id]);
});


app.get("/urls", (req, res) => {

  const templateVars = {
    urls: urlDatabase,
    user: userDatabase[req.cookies["user_id"]]
  };

  res.render("urls_index", templateVars);
});

// adds submitted url to urlDatabase with id randomly generated alphanumeric string
app.post("/urls", (req, res) => {

  const short = generateRandomString();
  urlDatabase[short] = req.body.longURL;
  res.redirect(`/urls/${short}`); // redirect to /urls/:id
});

app.get("/urls/new", (req, res) => {

  const templateVars = {
    user: userDatabase[req.cookies["user_id"]],
  };

  res.render("urls_new", templateVars);
});


app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: userDatabase[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

// adds the id and url to the urlDatabase and redirects back to /urls
app.post("/urls/:id", (req, res) => {
  const { longURL } = req.body;
  urlDatabase[req.params.id] = longURL;
  res.redirect("/urls");
});

//removes id from urlDatabase and redirects back to /urls
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//changes the url assigned to the id to submitted url
app.post("/urls/:id/edit", (req, res) => {

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: userDatabase[req.cookies["user_id"]]
  };

  res.render("urls_edit", templateVars);

});

//sets submitted username as the username cookie and redirects back to /urls
app.post("/login", (req, res) => {
  const { username } = req.body;
  res.cookie("username", username);
  res.redirect("/urls");
});

//clears the username cookie and redirects back to /urls
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: userDatabase[req.cookies["user_id"]]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const {email, password} = req.body;
  const id = generateRandomString();

  if (!email || !password) {
    return res.status(400).send("Email or password cannot be blank");
  }

  userDatabase[id] = {
    id,
    email,
    password
  };
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
