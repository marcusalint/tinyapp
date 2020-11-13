const express = require("express");
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


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

console.log(generateRandomString(6))

app.get('/', (req, res) => {
  res.send('hello');
}); 

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
})

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });

 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

 app.get('/urls', (req, res) => {
   const templateVars = { urls: urlDatabase};
   res.render('urls_index', templateVars);
 });

 app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();;
  let longURL = req.body.longURL
  urlDatabase[shortURL] = longURL
  res.redirect(`/urls/${shortURL}`)

});

 app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL:  urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/u/:shortURL", (req, res) => {
  
});

 // Delete Link
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
})

//Edit Link
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newURL;
  res.redirect('/urls');
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});


