const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');

chai.use(chaiHttp);
const expect = chai.expect;

describe('API Integration Tests', () => {
  it('should return a 200 status code for a valid GET request', (done) => {
    chai
      .request(app)
      .get('/directives')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should return HTML response for a valid GET request', (done) => {
    chai
      .request(app)
      .get('/directives')
      .end((err, res) => {
        expect(res).to.have.header('content-type', 'text/html; charset=utf-8');
        done();
      });
  });

  it('should return a 200 status code for a valid GET request', (done) => {
    chai
      .request(app)
      .get('/regulations')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should return HTML response for a valid GET request', (done) => {
    chai
      .request(app)
      .get('/regulations')
      .end((err, res) => {
        expect(res).to.have.header('content-type', 'text/html; charset=utf-8');
        done();
      });
  });

  it('should return a 200 status code for a valid GET request', (done) => {
    chai
      .request(app)
      .get('/statutory-instrument')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should return HTML response for a valid GET request', (done) => {
    chai
      .request(app)
      .get('/statutory-instrument')
      .end((err, res) => {
        expect(res).to.have.header('content-type', 'text/html; charset=utf-8');
        done();
      });
  });

  it('should return a 200 status code for a valid GET request', (done) => {
    chai
      .request(app)
      .get('/explanatory-memorandum')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should return HTML response for a valid GET request', (done) => {
    chai
      .request(app)
      .get('/explanatory-memorandum')
      .end((err, res) => {
        expect(res).to.have.header('content-type', 'text/html; charset=utf-8');
        done();
      });
  });
});
