const getUserByEmail = function(email, userDatabase) {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user].id;
    }
  }
};


// Generate Random String Function
function generateRandomString(length) {
  let string = "";
  length = 6;
  const charset = "abcdefghijklmnopqrstuvwxyz0123456789";

  for( let i=0; i < length; i++ )
        string += charset.charAt(Math.floor(Math.random() * charset.length));

  return string;
}


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

 // GET URLS FOR USER
 const urlsForUser = function(id, urlDatabase) {
  const userUrls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
}

module.exports = {
  getUserByEmail,
  urlsForUser,
  checkEmailDatabase,
  generateRandomString
}