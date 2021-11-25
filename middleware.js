const Castle = require('./models/castle');
const ExpressError = require('./utils/ExpressError');
const { castleSchema } = require('./schemas');

module.exports.isLoggedIn = (req, res, next) => {
  //console.log("req.user: ", req.user); 
  /* when a user is logged in:
  req.user:
  {
    _id: new ObjectId("619cb7cb24524edf8cb26094"),
    email: 'tom@mail.com',
    username: 'tom',
    __v: 0
  } */
  if(!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash('error', "You have to login first.");
    return res.redirect('/login');
  }
  next();
}

module.exports.validateCastle = (req, res, next) => {
  const { error } = castleSchema.validate(req.body);
  if(error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(400, msg);
  } else {
    next();
  }
}

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const castle = await Castle.findById(id);
  if(!castle.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that!');
    return res.redirect(`/castles/${id}`);
  }
  next();
}