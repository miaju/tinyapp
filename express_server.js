const express = require("express");
const morgan = require("morgan");
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080

// ----------------------- APP.USE (MIDDLEWARE):

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --------------------------------

// set ejs as view engine
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = {};

//------------------------------------------------- HELPER FUNCTIONS

//generates a random string made of lower or uppercase letters or digits 0-9
const generateRandomString = function() {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor((chars.length * Math.random()))];
  }

  return result;
};


// finds user in userDatabase if user has matching email to the given email
// returns the user object if user is found
// returns null if user is not found
const findUserByEmail = function(email) {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user];
    }
  }

  return null;
};


//--------------------------------------- APP.GET :

app.get("/", (req, res) => {
  res.send("Hello! This is a placeholder for a home page!");
});

app.get("/urls", (req, res) => {

  const templateVars = {
    urls: urlDatabase,
    user: userDatabase[req.cookies["user_id"]]
  };

  res.render("urls_index", templateVars);

});

// redirects to long url that has id of id
app.get("/u/:id", (req, res) => {
  res.redirect(urlDatabase[req.params.id]);
});


app.get("/urls/new", (req, res) => {

  const templateVars = {
    user: userDatabase[req.cookies["user_id"]],
  };
  
  if (!templateVars.user) {
    res.redirect("/login");

  } else {
    res.render("urls_new", templateVars);

  }

  
});

app.get("/urls/:id", (req, res) => {

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: userDatabase[req.cookies["user_id"]]
  };

  res.render("urls_show", templateVars);
});

app.get("/:id/edit", (req, res) => {

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: userDatabase[req.cookies["user_id"]]
  };

  res.render("urls_edit", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: userDatabase[req.cookies["user_id"]]
  };

  if (templateVars.user) {
    res.redirect("/urls");

  } else {
    res.render("login", templateVars);

  }

  
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: userDatabase[req.cookies["user_id"]]
  };

  if (templateVars.user) {
    res.redirect("/urls");
    
  } else {
    res.render("register", templateVars);

  }

  
});

//--------------------------------------------- APP.POST:


// adds submitted url to urlDatabase with id randomly generated alphanumeric string
app.post("/urls", (req, res) => {

  const short = generateRandomString();
  urlDatabase[short] = req.body.longURL;
  res.redirect(`/urls/${short}`); // redirect to /urls/:id
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
  const { email, password } = req.body;

  if ((!findUserByEmail(email)) || (findUserByEmail(email).password !== password)) {
    return res.status(403).send("Invalid credentials");
  }

  const userId = findUserByEmail(email).id;

  res.cookie("user_id", userId);
  res.redirect("/urls");
});

//clears the username cookie and redirects back to /urls
app.post("/logout", (req, res) => {

  res.clearCookie("user_id");
  res.redirect("/urls");

});


// takes given email and password and creates a user in userDatabase and redirects to /urls
// if email or password fields left blank, sends status 400
// if user with the given email exists, sends status 400
app.post("/register", (req, res) => {
  const {email, password} = req.body;
  const id = generateRandomString();

  if (!email || !password) {
    return res.status(400).send("Email or password cannot be blank");
  }
  if (findUserByEmail(email)) {
    return res.status(400).send("User with that email already exists");
  }

  userDatabase[id] = {
    id,
    email,
    password
  };

  res.cookie("user_id", id);
  res.redirect("/urls");
});

// -------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
