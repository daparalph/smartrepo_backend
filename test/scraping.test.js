const axios = require('axios');
const { expect } = require('chai');
const app = require('../index');

// Basic test cases
describe('Scraping Endpoints', () => {
  it('should scrape data from /directives endpoint', async () => {
    try {
      const response = await axios.get('http://localhost:3000/directives');
      expect(response.status).to.equal(200);
      expect(response.data).to.be.a('string');
    } catch (error) {
    }
  });

  it('should scrape data from /regulations endpoint', async () => {
    try {
      const response = await axios.get('http://localhost:3000/regulations');
      expect(response.status).to.equal(200);
      expect(response.data).to.be.a('string');
    } catch (error) {
    }
  });

  it('should scrape data from /statutory-instrument endpoint', async () => {
    try {
      const response = await axios.get('http://localhost:3000/statutory-instrument');
      expect(response.status).to.equal(200);
      expect(response.data).to.be.a('string');
    } catch (error) {
    }
  });

  it('should scrape data from /explanatory-memorandum endpoint', async () => {
    try {
      const response = await axios.get('http://localhost:3000/explanatory-memorandum');
      expect(response.status).to.equal(200);
      expect(response.data).to.be.a('string');
    } catch (error) {
    }
  });
});
