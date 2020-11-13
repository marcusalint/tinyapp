const express = require("express");
const app = express();
const PORT = 8080;


const cookieParser = require('cookie-parser')
app.use(cookieParser());



app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const users = { 
  "RandomUser1": {
    id: "MichelleObama", 
    email: "Michelle@gmail.com", 
    password: "Michelle"
  },
 "RandomUser2": {
    id: "JoeShmoe", 
    email: "Joe@gmail.com", 
    password: "Johnny"
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

function generateRandomString(length) {
  var string = " ";
  length = 6;
  var charset = "abcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < length; i++ )
        string += charset.charAt(Math.floor(Math.random() * charset.length));

  return string;

};

// Routing

app.get('/', (req, res) => {
  res.redirect('/urls');
}); 

app.get('/urls', (req, res) => {
  const templateVars = { 
     urls: urlDatabase,
     username: req.cookies['username']

    };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL,
    longURL:  urlDatabase[req.params.shortURL],
    username: req.cookies['username']
    };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();;
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`)
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL,
     longURL:  urlDatabase[req.params.shortURL],
     username: req.cookies['username']
     };
  res.render("urls_show", templateVars);
});

// Get Registration Form
app.get("/register", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies['username']
   };
  res.render("urls_register", templateVars);
});

// Post Registration Form
app.post("/register", (req, res) => {
  let newUser = 
})

// Redirect to long url of shortened url
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

//Login
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});


