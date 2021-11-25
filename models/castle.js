const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const castleSchema = new Schema({
  title: String,
  location: String,
  image: String,
  price: Number,
  description: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ]
});

/* reviews is an array of ids. Example:
reviews: [
  new ObjectId("61978061405ea4ea28fc6119"),
  new ObjectId("61978063405ea4ea28fc6120"),
  new ObjectId("61978064405ea4ea28fc6126")
] */

castleSchema.post('findOneAndDelete', async function (doc) {
  //console.log(doc); //doc is document which has been deleted, i.e. a castle
  if(doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews
      }
    })
  }
});

const Castle = mongoose.model('Castle', castleSchema);

module.exports = Castle;