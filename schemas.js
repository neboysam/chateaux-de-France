const Joi = require('joi');

module.exports.castleSchema = Joi.object({
  castle: Joi.object({
    title: Joi.string().required(),
    location: Joi.string().required(),
    image: Joi.string().required(),
    price: Joi.number().required().min(0),
    description: Joi.string().required()
  }).required() 
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required()
  }).required()
});