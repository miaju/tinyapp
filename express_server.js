const express = require("express");
const morgan = require("morgan");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");

const {generateRandomString, findUserByEmail, urlsForUser} = require("./helpers");

const app = express();
const PORT = 8080; // default port 8080

// ----------------------- APP.USE (MIDDLEWARE):

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));

// --------------------------------

// set ejs as view engine
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: "pmade"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: "pmade"
  }
};

const userDatabase = {};



//--------------------------------------- APP.GET :

app.get("/", (req, res) => {
  const templateVars = {
    user: userDatabase[req.session.user_id]
  };

  res.render("home", templateVars);
});

app.get("/urls", (req, res) => {

  const userId = req.session.user_id;

  if (!userDatabase[userId]) {
    return res.status(401).send("Unathorized to view this content, please login.");

  } else {

    const templateVars = {
      urls: urlsForUser(userId, urlDatabase),
      user: userDatabase[userId]
    };
  
    res.render("urls_index", templateVars);

  }

  

});

// redirects to long url that has id of id
app.get("/u/:id", (req, res) => {

  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("URL id not found");

  } else {
    res.redirect(urlDatabase[req.params.id].longURL);
  }
  
});


app.get("/urls/new", (req, res) => {

  const templateVars = {
    user: userDatabase[req.session.user_id],
  };
  
  if (!templateVars.user) {
    res.redirect("/login");

  } else {
    res.render("urls_new", templateVars);

  }

  
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: userDatabase[userId]
  };

  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("URL id not found");
    
  } else if (urlDatabase[req.params.id].userId !== userId) {
    return res.status(401).send("Unathorized to view this content.");

  } else {
    res.render("urls_show", templateVars);

  }

});

app.get("/urls/:id/edit", (req, res) => {

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: userDatabase[req.session.user_id]
  };
  if (urlDatabase[req.params.id].userId !== req.session.user_id) {
    return res.status(401).send("Unathourized to do this action.");

  } else if (!urlDatabase[req.params.id]) {
    return res.status(404).send("URL id not found");
  
  } else {
    res.render("urls_edit", templateVars);

  }
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: userDatabase[req.session.user_id]
  };

  if (templateVars.user) {
    res.redirect("/urls");

  } else {
    res.render("login", templateVars);

  }

  
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: userDatabase[req.session.user_id]
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

  if (!req.session.user_id) {
    return res.status(401).send("Unathourized to do this action, please log in");

  } else {
    const short = generateRandomString(6);
    urlDatabase[short] = {
      longURL: req.body.longURL,
      userId: req.session.user_id
    };
    
    res.redirect(`/urls/${short}`); // redirect to /urls/:id
  }
});


// adds the id and url to the urlDatabase and redirects back to /urls
app.post("/urls/:id", (req, res) => {
  const { longURL } = req.body;

  if (!req.session.user_id) {
    return res.status(401).send("Unathourized to do this action, please log in");

  } else {

    urlDatabase[req.params.id] = {
      longURL,
      userId: req.session.user_id
    };

    res.redirect("/urls");
  }
});


//removes id from urlDatabase and redirects back to /urls
app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id].userId !== req.session.user_id) {
    return res.status(401).send("Unathorized to do this action.");

  } else {

    delete urlDatabase[req.params.id];
    res.redirect("/urls");

  }

});


//changes the url assigned to the id to submitted url
app.post("/urls/:id/edit", (req, res) => {

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: userDatabase[req.session.user_id]
  };
  if (urlDatabase[req.params.id].userId !== req.session.user_id) {
    return res.status(401).send("Unathorized to do this action.");

  } else {
    res.render("urls_edit", templateVars);

  }
 
});


//sets submitted username as the username cookie and redirects back to /urls
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email, userDatabase);

  if ((!user) || (!bcrypt.compare(user.password, password))) {
    return res.status(403).send("Invalid credentials");
  }

  const userId = user.userId;

  req.session.user_id = userId;
  res.redirect("/urls");
});

//clears the username cookie and redirects back to /urls
app.post("/logout", (req, res) => {

  req.session.user_id = null;
  res.redirect("/");

});


// takes given email and password and creates a user in userDatabase and redirects to /urls
// if email or password fields left blank, sends status 400
// if user with the given email exists, sends status 400
app.post("/register", (req, res) => {
  const {email} = req.body;
  const password = bcrypt.hashSync(req.body.password, 10);
  const userId = generateRandomString(6);

  if (!email || !password) {
    return res.status(400).send("Email or password cannot be blank");
  }
  if (findUserByEmail(email, userDatabase)) {
    return res.status(400).send("User with that email already exists");
  }

  userDatabase[userId] = {
    userId,
    email,
    password
  };

  // eslint-disable-next-line camelcase
  res.req.session.user_id = userId;
  res.redirect("/urls");
});

// -------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
