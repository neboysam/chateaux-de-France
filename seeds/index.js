const mongoose = require('mongoose');
const Castle = require('../models/castle');
const cities = require('./cities');
const { titles, places, images } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/castles', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log("Database connected.");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Castle.deleteMany({});
  for(let i = 0; i < 15; i++ ) {
    const random471 = Math.floor(Math.random() * 471);
    const price = Math.floor(Math.random() * 20) + 10;
    const castle = new Castle({
      title: `${sample(titles)}, ${sample(places)}`,
      location: `${cities[random471].city}, ${cities[random471].admin_name}`, // the same as `${sample(cities).city}, ${sample(cities).admin_name}`
      image: `${sample(images)}`,
      price,
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!'
    });
    await castle.save();
  }
}

seedDB().then(() => {
  db.close();
});