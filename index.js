if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

var express        = require("express");
var mongoose       = require("mongoose");
var methodOverride = require("method-override");
var path           = require("path");
var bcrypt         = require("bcrypt");
var passport       = require("passport");
var flash          = require("express-flash");
var session        = require("express-session");
var cookieParser   = require("cookie-parser");
const MongoStore  = require('connect-mongo');




const app = express()
app.use(express.urlencoded({ extended: false }))
app.set('views', path.join(__dirname, '/views'));
app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine" , "ejs");
app.use(methodOverride('_method'));


var dbURL = process.env.DB_URL || 'mongodb://localhost:27017/Todo';



mongoose.connect(dbURL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => {
        console.log("CONNECTED!");
    })
    .catch((err) => {
        console.log("OH NO ERROR", err);
    })




const dbSchema = new mongoose.Schema({
    username : String,
    email    : String,
    password : String,
    items : { type : Array , "default" : [] }
})


const Todo = mongoose.model('Todo' , dbSchema);

// const todo = new Todo({username : 'Shah' , email : 'Shah@shah.com' ,  password : '$2a$10$mKF0peVm4XlWykudqICpoeKZHQ5v1GqBFJl1lnOm6d724mt4wZPra' , items : ["Pick Eggs" , "Run"]})
// todo.save();
const initializePassport = require("./passport-config")
initializePassport(
    passport,
    Todo
);


app.use(cookieParser())
app.use(flash())

var store = MongoStore.create({
    mongoUrl : dbURL,
    secret : 'anything',
    touchAfter : 24 * 60 * 60
})


app.use(session({
    store,
    secret : 'anything',
    resave : false,
    saveUninitialized : false

}))


app.use(passport.initialize());
app.use(passport.session());




app.get("/list" , checkAuthenticated,  (req, res) => {
    // console.log(req.user);
    res.render("index.ejs" , {todos : req.user})
})


app.post("/list/:id"  ,  async (req, res) => {
    const {id} = req.params;
    // console.log(id);
    const {ran} = req.body;
    // console.log(ran);
    await Todo.findOneAndUpdate({_id : id} , {$push : {items : ran}}, {new: true, upsert: true });
    res.redirect("/list");
})


app.delete("/list/:id/:name"  ,  async (req , res) => {
    const {id , name} = req.params;
    await Todo.findOneAndUpdate({_id : id} , {$pull : {items : name}});
    res.redirect("/list");
})


app.get("/login" , checkNotAuthenticated,  (req , res)=> {
    res.render("login.ejs");
})

app.post("/login" , checkNotAuthenticated,   passport.authenticate('local' , {
    successRedirect : "/list",
    failureRedirect : "/login",
    failureFlash : true
}))

app.get("/register" , checkNotAuthenticated,  (req , res)=> {
    res.render("register.ejs");
})

app.post("/register" , checkNotAuthenticated,  async (req , res)=> {
    try{
        const {name , email , password} = req.body;
        var hashedPassword = await bcrypt.hash(password , 10);
        // console.log({name , email , hashedPassword});
        await Todo.insertMany({username : name , email : email , password : hashedPassword , items : []});
        res.redirect("/login");
    } catch {
        res.redirect("/register")
    }
})

app.delete("/logout" , (req , res)=> {
    req.logOut();
    res.redirect("/login");
})

app.get("/" , (req , res)=>{
    res.render("home.ejs");
})


function checkAuthenticated(req , res , next){
    if(req.isAuthenticated()){
        next()
    } else {

        return res.redirect('/login');
    }
}

function checkNotAuthenticated(req , res , next){
    if(req.isAuthenticated()){
        return res.redirect('/list')
    } else {

        next()
    }
}



port = process.env.PORT || 3000;

app.listen(port , () => {
    console.log(`Starting Server at ${port}...`);
})