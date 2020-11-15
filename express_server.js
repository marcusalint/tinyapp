const express = require("express");
const app = express();
const PORT = 8080;
const bcrypt = require('bcrypt');
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");

app.use(cookieSession({
  name: 'session',
  keys: ["HUHF2FH32FH93FHDOSO"],
  maxAge: 24 * 60 * 60 * 1000 
}));

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended: true}));

// ------------------------ DATABASE -------------------------------->
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID"},
};

let userData = {
};

const users = {
};

// ---------------------------------------------------------------- -->


app.get('/', (req, res) => {
  res.redirect("/urls");
});

app.get("/DeniedAccess", (req, res) => {
  let templateVars = { urls: userData, user_id: req.session["user_id"] };
  res.render("DeniedAccess", templateVars);
});


// ------------------------------------------ LOG IN / LOG OUT ----------------------->

//Get Login Page
app.get("/login", (req,res) => {
  if (req.session["user_id"] === undefined) {
    let templateVars = { user_id: req.session["user_id"] };
    res.render("urls_login", templateVars);
  } else {
    res.redirect(`/urls`);
  }
});


//Post Login
app.post("/login", (req, res) => {
  const emailExists = false;
  const emailAddress = req.body.email;
  if (checkEmailDatabase(emailAddress,emailExists) === false) {
    return res.status(403).send("403 Error: Invalid Email");    
  }
  for (let user in users) {
    if (emailAddress === users[user]["email"]) {
      if (bcrypt.compareSync(req.body.password, users[user]["password"])) {
        req.session.user_id = users[user];
        for (let link in urlDatabase) {
          if (urlDatabase[link]["userID"] === user) {
            userData[link] = {};
            userData[link]["longURL"] = urlDatabase[link]["longURL"];
            userData[link]["userID"] = urlDatabase[link]["userID"];
          }
        }
        res.redirect(`/urls`);
      } else {
        return res.status(403).send("403 Error: Invalid Password");
      }
    }
  }
});


//Post Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});


// ------------------------------------------ URLS -------------------------->



// Route urls endpoint
app.get("/urls", (req, res) => {
  if (req.session.user_id !== undefined) {
    let templateVars = { urls: userData, user_id: req.session["user_id"] };
    res.render("urls_index", templateVars);
  } else {
    res.redirect(`/DeniedAccess`);
    return;
  }
});


// Route To Create New Url
 app.get("/urls/new", (req, res) => {
  if (req.session.user_id !== undefined) {
    let templateVars = { user_id: req.session["user_id"] };
    res.render("urls_new", templateVars);
  } return res.redirect("/login")
});


// Create New Url And Save To Database
app.post("/urls", (req, res) => {
  let fullLink = req.body.longURL;
  for (let url in urlDatabase) {
    const eqArrays = function() {
      let match = true;
      if (userData[url] === undefined || urlDatabase[url] === undefined) {
        return false;
      }
      let one = userData[url]["userID"];
      let two = urlDatabase[url]["userID"];
    
      for (let x = 0; x < one.length; x++) {
        if (one[x] !== two[x]) match = false;
      }
      for (let x = 0; x < two.length; x++) {
        if (one[x] !== two[x]) match = false;
      }
      return match;
    };

    if (urlDatabase[url]["longURL"] === fullLink && eqArrays() === true) {
      res.redirect(`/urls/${url}`);
      return;
    }
  }
  let shortURL = generateRandomString()
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL]["longURL"] = fullLink;
  urlDatabase[shortURL]["userID"] = req.session.user_id.id;
  userData[shortURL] = {};
  userData[shortURL]["longURL"] = fullLink;
  userData[shortURL]["userID"] = req.session.user_id.id;
  res.redirect(`/urls/${shortURL}`);
});


// Shows Long Url of Short Url
app.get("/urls/:shortURL", (req, res) => {

  if (userData[req.params.shortURL] instanceof Object) {
    let templateVars = { shortURL: req.params.shortURL, longURL: userData[req.params.shortURL], user_id: req.session["user_id"] };
    res.render("urls_show", templateVars);
  } else {
    res.redirect(`/DeniedAccess`);
  }
});


// Redirect To Full Url
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.redirect(`/DeniedAccess`);
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});

// ------------------------------------------ MODIFY URLS ----------------------->
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id.id === userData[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    delete userData[req.params.shortURL];
    res.redirect(`/urls`);
  } else {
    res.redirect(`/DeniedAccess`);
  }
});



//when click edit, goes to shortURL site
app.post("/urls/:shortURL/edit", (req, res) => {
  if (req.session.user_id.id === userData[req.params.shortURL].userID) {
    res.redirect(`/urls/${req.params.shortURL}`);
  } else {
    res.redirect(`/access`);
  }
});

//keeps short URL when changing long URL
app.post("/urls/:shortURL/submit", (req, res) => {
  if (req.session.user_id.id === userData[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL]["longURL"] = req.body.longURL;
    userData[req.params.shortURL]["longURL"] = req.body.longURL;
    res.redirect(`/urls`);
  } else {
    res.redirect(`/access`);
  }
});

// //Edit Link
// app.post("/urls/:id", (req, res) => {
//   urlDatabase[req.params.id] = req.body.newURL;
//   res.redirect('/urls');
// });



// ------------------------------------------ REGISTER ----------------------->

// Route To Register Endpoint
app.get("/register", (req, res) => {
  const templateVars = { 
    user_id: req.session['user_id']
   };
  res.render("urls_register", templateVars);
});


// Post Register Form 
app.post("/register", (req, res) => {
  let emailExists = false;
  let emailAddress = req.body.email;

  if ((req.body.email === "") || (req.body.password === "")) {
    res.status(400).send("E-mail or password not valid. Please enter a valid E-mail and password.");
  } else if (checkEmailDatabase(emailAddress, emailExists) === true) {
    res.status(400).send("there is an account already associated with this email")
  } else {
    let newUser = generateRandomString();

    users.newUser = {
      id: newUser,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password,10)
    };
    req.session.user_id = users[newUser];
  };
  res.redirect(`/urls`)
});



// Generate Random String Function
function generateRandomString(length) {
  var string = " ";
  length = 6;
  var charset = "abcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < length; i++ )
        string += charset.charAt(Math.floor(Math.random() * charset.length));

  return string;
};


// Check If Email Already Exists Function
 function checkEmailDatabase(email, exists) {
  let emailExists = false;

  for (let user in users) {
    if (email === users[user]["email"]) {
      emailExists = true;
    }
  }
  return emailExists;;
 }



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});