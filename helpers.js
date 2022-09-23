//------------------------------------------------- HELPER FUNCTIONS

//generates a random string made of lower or uppercase letters or digits 0-9 of given length
const generateRandomString = function(length) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor((chars.length * Math.random()))];
  }

  return result;
};


// finds user in userDatabase if user has matching email to the given email
// returns the user object if user is found
// returns null if user is not found
const findUserByEmail = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }

  return null;
};

//finds urls that have been made by the user with the given id
// returns object with the urls
const urlsForUser = function(id, database) {
  let urls = {};

  for (const url in database) {
    if (database[url].userId === id) {
      urls[url] = database[url];
    }
  }

  return urls;
};


module.exports = {
  generateRandomString,
  findUserByEmail,
  urlsForUser
};