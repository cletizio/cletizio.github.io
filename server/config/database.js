const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB conection string
const mongoURI = process.env.MONGO_URI;

//Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('MongoDB connected...'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

module.exports = mongoose;