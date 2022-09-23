const { expect } = require('chai');

const {findUserByEmail, urlsForUser} = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testUrls = {

  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: "pmade"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: "pmade"
  },
  "b2x123": {
    longURL: "http://www.lighthouselabs.ca",
    userId: "12345"
  },

};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    expect(user.id).to.equal(expectedUserID);
  });

  it('should return null if not valid email', () => {
    const user = findUserByEmail("ran.email@email.com", testUsers);
    expect(user).to.be.null;
  });
});

describe("urlsForUser", () => {
  it('should return object', () => {
    const result = urlsForUser("12345", testUrls);
    expect(result).to.be.an('object');
  });

  it("should return empty object if no urls are found", () => {
    const result = Object.keys(urlsForUser("mia12", testUrls));

    expect(result.length).to.equal(0);
  });

  it('should return object with urls that were made by given user', () => {
    const result = urlsForUser("12345", testUrls);
    const id = Object.keys(result)[0];

    expect(id).to.equal("b2x123");

  });
});