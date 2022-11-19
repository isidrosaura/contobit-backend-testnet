const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

const User = require('../models/user')

passport.use(new localStrategy({
usernameField: 'NOMBREUSUARIO',
passwordField: 'PASSWORDUSUARIO'
}, async (NOMBREUSUARIO, PASSWORDUSUARIO, done) => {
    // Match Email's user
    const user = await User.findOne({NOMBREUSUARIO})
    if (!user) {
        return done(null, false, { message: 'Not User Found'});  
    } else {
       // Match Password's user
       const match = await user.mathPassword(PASSWORDUSUARIO)
       if (match) {
           return done(null, user);
       } else {
           return done(null, false, { message: 'Incorrect Password'})
       }
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    User.findById(id, (err,user) => {
        done(err, user)
    })
});