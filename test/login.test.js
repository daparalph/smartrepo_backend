const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');

chai.use(chaiHttp);

describe('Login Endpoint Unit Tests', () => {
  it('should return a 200 status code and a token for valid credentials', () => {
    chai
      .request(app)
      .post('/login')
      .send({ identifier: 'mindprepopps@gmail.com', password: '123456789' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('token');
      });
  });

  it('should return a 401 status code for incorrect password', () => {
    chai
      .request(app)
      .post('/login')
      .send({ identifier: 'mindprepopps@gmail.com', password: 'incorrectPassword' })
      .end((err, res) => {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property('error', 'Incorrect password');
      });
  });

  it('should return a 500 status code for an internal server error', () => {
    // Simulate an internal server error by sending an invalid request
    chai
      .request(app)
      .post('/login')
      .send({ identifier: 'mindprepopps@gmail.com', password: 'invalidPassword' })
      .end((err, res) => {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property('error', 'An error occurred');
      });
  });
});
