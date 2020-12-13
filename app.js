const express=require('express');
const mongoose=require("mongoose");
const path= require("path");
const queryString = require('query-string');
const bodyparser=require('body-parser');
const user=require('./modal/user');
const cors = require("cors");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const session = require("express-session");
const methodOverride=require("method-override");
const app=express();
mongoose.set('useUnifiedTopology',true);
mongoose.set('useFindAndModify',false);
app.set('view engine','ejs');
const url=process.env.DATABASEURL||"mongodb://localhost:27017/travelBlogs";
mongoose.connect(url,{
    useNewUrlParser:true,
    useCreateIndex:true
});

app.use(
    cors({
      origin: "http://localhost:3000", // <-- location of the react app were connecting to
      credentials: true,
    })
  );
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'travelblog/build')));
app.use(express.json());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
//auth work
app.use(
    cors({
      origin: "http://localhost:3000", // <-- location of the react app were connecting to
      credentials: true,
    })
  );
  app.use(
    session({
      secret: "secretcode",
      resave: true,
      saveUninitialized: true,
    })
  );
 app.use(cookieParser("secretcode"));
app.use(passport.initialize());
app.use(passport.session());
require("./passportconfig")(passport)

const blogschema=new mongoose.Schema({
           name:String,
           email:String,
           place:String,
           place1:String,
           place2:String,
           place3:String,
           img1:String,
           img2:String,
           img3:String,
           img4:String,
           img5:String,
           v1:String,
           v2:String,
           v3:String,
           v4:String,
           v5:String,
           upl1:String,
           upl2:String,
           upl3:String
});
const blogsdata=mongoose.model('blogsdata',blogschema);
const Mysideblogschema=new mongoose.Schema({
           name:String,
           email:String,
           place:String,
           place1:String,
           place2:String,
           place3:String,
           img1:String,
           img2:String,
           img3:String,
           img4:String,
           img5:String,
           v1:String,
           v2:String,
           v3:String,
           v4:String,
           v5:String,
           upl1:String,
           upl2:String,
           upl3:String
});
const Mysideblogsdata=mongoose.model('Mysideblogsdata',Mysideblogschema);


/*blog.create({
    name:"henry",
    lastname:"walitz"
},function(err,blog){
    if(err){
        console.log('error');
    }else{
        console.log(blog);
    }
});*/
app.get('/',function(req,res){
    res.send('home')
})
app.get('/ho',function(req,res){
    const blogs=[
        {name:"shimla"},
        {name:"darjeeling"},
        {name:"gahlot"}
    ]
    res.json(blogs);
})

app.post('/blog',function(req,res){
    const blog=JSON.parse(JSON.stringify(req.body));
    console.log(blog);
    blogsdata.create(blog,function(err,BLOG){
        if(err){
            console.log("error");
        }else{
            console.log(BLOG);
        }
    })
})
//taking login data and we are gonna check for user data before rendering
app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) throw err;
      if (!user) res.send("wrong inputs!!");
      else {
        req.logIn(user, (err) => {
          if (err) throw err;
          res.send("Successfully Authenticated");
          console.log(req.user);
        });
      }
    })(req, res, next);
  });
//taking registration user data from react app 
app.post("/register", (req, res) => {
    const blog=JSON.parse(JSON.stringify(req.body));
    user.findOne({ username: req.body.username }, async (err, doc) => {
      if (err) throw err;
      if (doc) res.send("User Already Exists");
      if (!doc) {
        const hashedPassword = await bcrypt.hash(req.body.password,10);
        const newUser = new user({
          username:req.body.username,
          password:hashedPassword
        });
        await newUser.save();
        res.send("User Created");
    }});
  });

  

//adding middleware for user login and sending response of data on success!! 

app.post('/Mysideaddingblog',function(req,res){
    const blog=JSON.parse(JSON.stringify(req.body));
    console.log(blog);
    Mysideblogsdata.create(blog,function(err,BLOG){
        if(err){
            console.log("error");
        }else{
            console.log(BLOG);
        }
    })
})
app.get('/Mysideadding',function(req,res){
    Mysideblogsdata.find({},function(err,blogdata){
        if(err){
            console.log("error");
        }else{
           res.json(blogdata);         
        }
    });
})
app.get('/blogdata', function(req,res){
    Mysideblogsdata.find({},async function(err,blogdata){
        if(err){
            console.log("error");
        }else{
           res.render('blogdata',{data:blogdata});         
        }
    });
})

app.get('/edittingblog/:id',function(req,res){
          Mysideblogsdata.findById(req.params.id,function(err,blog){
              if(err){
                  console.log("error");
              }else{
                res.render("show",{data:blog});
              }   
          })
          
    });
app.get('/edittingblog/:id/edit',function(req,res){
          Mysideblogsdata.findById(req.params.id,function(err,blog){
              if(err){
                  console.log("eor");
              }else{
                res.render("blogeditdata",{data:blog});
              }   
          })
          
    });
app.put('/edittingblog/:id',function(req,res){
          Mysideblogsdata.findByIdAndUpdate(req.params.id,req.body.data,function(err,updatedblog){
              if(err){
                 res.redirect("/blogdata");
              }else{
                  console.log("added");
                 res.redirect("/blogdata");
              }   
          })
          
    });
app.delete('/edittingblog/:id',function(req,res){
          Mysideblogsdata.findByIdAndDelete(req.params.id,function(err){
              if(err){
                  console.log("error");
                 res.redirect("/blogdata");
              }else{
                  console.log("deleted!");
                 res.redirect("/blogdata");
              }   
          })
          
    });

app.get("/user", (req, res) => {
    res.send(req.user); // The req.user stores the entire user that has been authenticated inside of it.
  });
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname+'/travelblog/build/index.html'));
  });
  //----------
const port=process.env.PORT||5000;
app.listen(port,function(){
console.log("connected with server 5000");    
})
