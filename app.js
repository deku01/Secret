//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

const port = 3000;

console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

//MongoDB Connection
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
  //useFindAndModify: false,
  //useCreateIndex: true
});

//Mongoose Scehma
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Give a email']
  },
  password: {
    type: String,
    required: [true, 'Set a password']
  }
});

userSchema.plugin(encrypt, { secret: process.env.SECRET, excludeFromEncryption: ['email'] });
// exclude email from encryption,

/*************
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });
//encrypt only password
*************/

const User = new mongoose.model("User", userSchema);

app.get('/', (req,res) => {
  res.render("home");
})

app.get('/login', (req,res) => {
  res.render("login");
})

app.get('/register', (req,res) => {
  res.render("register");
})

app.post('/register', (req,res) => {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
  newUser.save((err) => {
    if(!err){
      res.render("secrets");
    } else {
      console.log(err);
    }
  });
});

app.post('/login', (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, (err,foundUser) => {
    if(!err){
      if(foundUser) {
        if(foundUser.password === password){
          res.render("secrets");
        }
      }
    } else {
      console.log(err);
    }
  })

});


app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
})
