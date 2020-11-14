const express = require("express");
const app = express();
const PORT = 8080;


const cookieParser = require('cookie-parser')
app.use(cookieParser());



app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


const users = {

};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}


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
  return emailExists;
 }


app.get('/', (req, res) => {
  res.redirect("/urls");
});

//Get Login
app.get("/login", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user_id: req.cookies['user_id']
   };
  res.render("urls_login", templateVars);
});


//Post Login
app.post("/login", (req, res) => {
  res.cookie('user_id', req.body.user_id)
  res.redirect('/urls');
})


//Post Logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});



// Route urls endpoint
 app.get('/urls', (req, res) => {
  const templateVars = { 
  urls: urlDatabase,
  user_id: req.cookies['user_id']
  };

  res.render('urls_index', templateVars);
 });


// Route To Create New Url
 app.get("/urls/new", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL,
    longURL:  urlDatabase[req.params.shortURL],
    user_id: req.cookies['user_id']
    };

  res.render("urls_new", templateVars);
});


// Create New Url And Save To Database
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();;
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`)
});


// Shows Long Url of Short Url
 app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL,
     longURL:  urlDatabase[req.params.shortURL],
     user_id: req.cookies['user_id']
     };
  res.render("urls_show", templateVars);
});


// Redirect To Full Url
app.get("/u/:shortURL", (req, res) => { 
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


 // Delete Link
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

//Edit Link
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect('/urls');
});


// Route To Register Endpoint
app.get("/register", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user_id: req.cookies['user_id']
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
      password: req.body.password
    };
  };
  res.cookie('user_id', users.newUser)
  res.redirect(`/urls`)
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});