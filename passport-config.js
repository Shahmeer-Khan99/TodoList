var LocalStrategy = require("passport-local").Strategy
var bcrypt        = require("bcrypt");

function initialize(passport , model) {
    const authenticateUser = async (email , password , done) => {
        // console.log(password);
        const dbdata = await model.find({email : email});
        const user = dbdata[0];
        if( user == null) {
            return done(null , false , {message : 'No user with that email is found'})
        } 
        try {
            if(await bcrypt.compare(password , user.password)){
                return done(null, user)
            } else {
                return done(null ,false , {message : "Password Incorrect"} )
            }

        } catch(e) {
            return done(e)
        }
    }

    

    passport.use(new LocalStrategy({usernameField : 'email'} , authenticateUser))
    passport.serializeUser((user , done) => done(null , user._id));
    passport.deserializeUser(async (id , done) => {
        const test = await model.find({_id : id})
        const res  = test[0]
        return done(null , res);
    });


}

module.exports = initialize
