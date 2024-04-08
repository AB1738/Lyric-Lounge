const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  albumId: { type: String, required: true }, // ID of the album from the API
  rating: { type: Number, required: true }, // Rating given by the user
  comment: { type: String, required: true }, // User's comment/review
  author:{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'User'
},
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;