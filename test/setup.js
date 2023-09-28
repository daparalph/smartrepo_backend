const mongoose = require('mongoose');

// Set up database connection
before(async function () {
  this.timeout(10000);

  // Connect to your MongoDB database
  await mongoose.connect('mongodb+srv://admin:AkinPopular@smartonline.a8qjsv8.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Close the database connection after all tests
after(async function () {
  await mongoose.connection.close();
});
