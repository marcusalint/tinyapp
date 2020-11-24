const express = require("express");
const app = express();
const PORT = 3000;
const bcrypt = require('bcrypt');
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const { checkEmailDatabase, generateRandomString, getUserByEmail, urlsForUser } = require('./helpers.js');


app.use(cookieSession({
  name: 'session',
  keys: ["238012HCASD09123"],
  maxAge: 24 * 60 * 60 * 1000 
}));

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended: true}));

// ------------------------ DATABASE -------------------------------->
const urlDatabase = {};

const users = {
};

// ---------------------------------------------------------------- -->


app.get('/', (req, res) => {
  res.redirect("/urls");
});

app.get("/deniedAccess", (req, res) => {
  const templateVars = { urls: urlDatabase, user_id: req.session["user_id"] };
  res.render("DeniedAccess", templateVars);
});


// ------------------------------------------ LOG IN / LOG OUT ----------------------->

// GET LOGIN PAGE
app.get("/login", (req,res) => {
  if (req.session["user_id"] === undefined) {
    const templateVars = { user_id: req.session["user_id"] };
    res.render("urls_login", templateVars);
  } else {
    res.redirect(`/urls`);
  }
});


//POST LOGIN
app.post("/login", (req, res) => {

  const email = req.body.email;
  if (checkEmailDatabase(email, users) === false) {
    return res.status(403).send("403 Error: Invalid Email");    
  }
  for (let user in users) {
    if (email === users[user]["email"]) {
      if (bcrypt.compareSync(req.body.password, users[user]["password"])) {
        req.session.user_id = users[user];
      } else {
        return res.status(403).send("403 Error: Invalid Password");
      }
    }
  }
});


//POST LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});


// ------------------------------------------ ROUTING -------------------------->



// GETS URLS PAGE
app.get("/urls", (req, res) => {
  if (req.session.user_id !== undefined) {
    const templateVars = { urls: urlDatabase, user_id: req.session["user_id"] };
    res.render("urls_index", templateVars);
  } else {
    res.redirect(`/DeniedAccess`);
    return;
  }
});


// Route To Create New Url
 app.get("/urls/new", (req, res) => {
  if (req.session.user_id !== undefined) {
    const templateVars = { user_id: req.session["user_id"] };
    res.render("urls_new", templateVars);
  } return res.redirect("/login")
});

app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user_id: req.session["user_id"] };
    res.render("urls_show", templateVars);
  } else {
    res.redirect(`/DeniedAccess`);
  }
});


// REDIRECTS TO LONG URL
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.redirect(`/DeniedAccess`);
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});


// Create New Url And Save To Database
app.post("/urls", (req, res) => {
  let fullLink = req.body.longURL;
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL]["longURL"] = fullLink;
  urlDatabase[shortURL]["userID"] = req.session.user_id.id;
  res.redirect(`/urls/${shortURL}`);
});



// ------------------------------------------ MODIFY URLS ----------------------->
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id.id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  } else {
    res.redirect(`/DeniedAccess`);
  }
});




//Edit Link
app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.id)) {
    res.status(401).send("You do not have authorization to edit this short URL.");
  } else {
    urlDatabase[req.params.id].longURL = req.body.newURL;
    
    res.redirect('/urls');
  }
});



// ------------------------------------------ REGISTER ----------------------->

// Route To Register Endpoint
app.get("/register", (req, res) => {
  const templateVars = { 
    user_id: req.session['user_id']
   };
  res.render("urls_register", templateVars);
});


// Post Register Form 
// On successful registration users are redirected to urls page containing their shortend URLS
app.post("/register", (req, res) => {
  let emailAddress = req.body.email;

  if ((req.body.email === "") || (req.body.password === "")) {
    res.status(400).send("E-mail or password not valid. Please enter a valid E-mail and password.");
  } else if (checkEmailDatabase(emailAddress,  users) === true) {
    res.status(400).send("there is an account already associated with this email")
  } else {
    let newUser = generateRandomString();

    users[newUser] = {
      id: newUser,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password,10)
    };
    req.session.user_id = users[newUser];
  };
  res.redirect(`/urls`)
});








// -------------------------------------------------------------------------------->
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});
