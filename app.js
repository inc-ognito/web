const express     = require("express"),
    flash       = require("connect-flash"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    User        = require("./models/User"),
    Comment        = require("./models/Comment"),
    Rating=require("./models/Rating"),
    cookieParser = require('cookie-parser'),
    multer = require('multer');
    const fileFilter=(req,file,cb)=>{
    if(file.mimetype==='image/jpeg'||file.mimetype==='image/png')
     {
        cb(null,true); 
    }
    else{
        cb(null,false);
    }
};
const storages= multer.diskStorage({
    destination: function(req,file,cb) {
        cb(null,'public/uploads');
    },
    filename:function(req,file,cb) {
         cb(null, new Date().toISOString().replace(/:/g, '-')+ file.originalname)
    }
});
var upload= multer(
    {storage:storages,
       limits: {
            fileSize:1024*1024 *15
        },
        fileFilter:fileFilter
    });
    var options = { server: { socketOptions: { keepAlive: 1 } } };
var gmailNode = require('gmail-node');
var clientSecret = {installed:{
    client_id:"133586172988-mluc0qbict30ok3rmrrdbla1mv9df433.apps.googleusercontent.com",
    project_id:"inc-ognito",
    auth_uri:"https://accounts.google.com/o/oauth2/auth",
    token_uri:"https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url:"https://www.googleapis.com/oauth2/v1/certs",
    client_secret:"__DNkR9rqfgeB3sZz-NH8fW7",
    redirect_uris:["urn:ietf:wg:oauth:2.0:oob","http://localhost"]}};
    gmailNode.init(clientSecret, './token.json', function(err,data){ });
     const connectionString="mongodb://incog:sgnChL3jbnH2z4C@ds259144.mlab.com:59144/anonymous";
    mongoose.connect(connectionString,{useNewUrlParser:true});
    // Connected handler
mongoose.connection.on('connected', function (err) {
  console.log("Connected to DB using chain: " + connectionString);
});

// Error handler
mongoose.connection.on('error', function (err) {
  console.log(err);
});

// Reconnect when closed
mongoose.connection.on('disconnected', function () {
   console.log("connection disconnected");

});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(require("express-session")({
    secret: "Made by Anmol Duggal",
    resave: false,
    saveUninitialized: false
}));
app.use(function(req, res, next){ res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'); next(); });
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(cookieParser());
app.use(function(req, res, next){
    if(req.user){
   res.locals.currentUser = {fname:req.user.firstname,sname:req.user.secondname,roll:req.user.username,img:req.user.img };
   }res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});
app.post("/uploadimage",isLoggedIn,upload.single('file'),function(req,res){
    User.findByIdAndUpdate(req.user._id,{img:req.file.filename},{new:true},function(err,model){
        if(err){
            req.flash("error","Upload Failed");
            res.redirect("/home");
        }
        else{
            req.flash("success","Image Uploaded Successfully");
            res.redirect("/home");
        }
    });
});
app.get("/",isnotLoggedIn,(req,res)=>{
	res.redirect("login");
});
app.post("/login",isnotLoggedIn,passport.authenticate("local", 
    {
        successRedirect: "/home",
        failureRedirect: "/login",
        failureFlash: true,
        successFlash: 'Welcome!',
        session:true
    }), function(req, res){
	console.log("logging");
});
app.get("/login",isnotLoggedIn,(req,res)=>{
	res.render("login");
});
/*app.get("/:id",isLoggedIn,(req,res)=>{
	res.send("req.params.id");
});*/
app.get("/home",isLoggedIn,(req,res)=>{
   User.findById(req.user._id).populate('comments','commentdata commentdata',null,{sort:{'commentdate':-1}}).populate('ratings','rating').exec(function(err,founduser){
	     if(err){
        console.log(err);
        req.flash("error","Server Problem !!! Please retry later");
        res.redirect("/home");
        }
        else{
            let avgrate=0;
              founduser.ratings.forEach((rate)=>{
                avgrate+=rate.rating;
              });
              avgrate=avgrate/founduser.ratings.length;
        res.render("profile",{user:{
                  img:founduser.img,
                  comments:founduser.comments,
                  username:founduser.username,
                  firstname:founduser.firstname,
                  secondname:founduser.secondname,
                  roll:founduser.roll,
                  avgrating:avgrate,
                  totalrating:founduser.ratings.length
                 }});
      }
});
 });
app.get("/search",isLoggedIn,function(req,res){
 if (req.query.search) {
       const regex = new RegExp(escapeRegex(req.query.search), 'gi');
     var query=User.find({$or:[{roll:regex},{firstname:regex},{secondname:regex}]}).select(' firstname secondname img username ');
     query.exec(function(err,foundusers){
           if(err) {
               console.log(err);
           } else {
            if(foundusers.length!=0){
                         foundusers = foundusers.filter(function( obj ) {
                            return obj._id.toString()!==req.user._id.toString(); 
                           });
                         res.setHeader('Content-Type', 'application/json');
                           res.send(JSON.stringify( {users:foundusers,heading:"Found"}));
            }
            else{
                 res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({users:foundusers,heading:"Not Found"}));
            }
           }
       }); 
    }
});
app.post("/signup",isnotLoggedIn,function(req,res){
    let rand=Math.floor((Math.random() * 10000));
    if(rand<1000){
	   rand =1000+rand;
    }

    var newUser = new User({
        username: req.body.username,
        firstname:req.body.firstname,
        secondname:req.body.secondname,
        roll:req.body.username,
        verifycode:{code:rand}
        });
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            req.flash("error","Emailid,RollNo or Regno is already registered");
            res.redirect("/login");
        }
        else{
           let host=req.get('host');
            let link="http://"+req.get('host')+"/verify/"+req.body.username;
            var emailMessage ={
            to : req.body.username+"@kiit.ac.in",
            subject : "Please confirm your Email account",
            message : "Hello,<br>Welcome to Incog<br>Your Verification Code is<br><h2><strong>"+rand +"</strong></h2><br><a href='"+link+"'>Verification Page</a>" 
  			  }
         gmailNode.sendHTML(emailMessage, function (err, data){
            if(err){
                console.log(err);
                req.flash("error","Contact Support ");
                res.redirect("/login");
            }
            req.flash("success","You are signed up. A Verification Email has been sent to you! ");
            res.redirect("/login");
            });
        }});
});
app.get("/user/:id",isLoggedIn,function(req,res){

      if(req.params.id!=req.user.username ){
        User.findOne({username:req.params.id}).populate('comments','commentdata commentdata ',null,{sort:{'commentdate':-1}}).populate('ratings','rating _creator').exec(function(err,founduser){
            if(err){
                req.flash("error","User Not Found");
                res.redirect("/home");
            }
            else{
              let avgrate=0,found=0;
              founduser.ratings.forEach((rate)=>{
                avgrate+=rate.rating;
                if(rate._creator && rate._creator.toString()==req.user._id.toString()){
                  found=rate.rating;
                }
              });
              avgrate=avgrate/founduser.ratings.length;
                if(founduser.isVerified){
                res.render("friend",{profile:{
                  img:founduser.img,
                  comments:founduser.comments,
                  username:founduser.username,
                  firstname:founduser.firstname,
                  secondname:founduser.secondname,
                  roll:founduser.roll,
                  avgrating:avgrate,
                  totalrating:founduser.ratings.length,
                  yourrating:found
                }});
            }
            else{
                req.flash("error","User Not Found");
                res.redirect("/home");                
            }}
        });
        }
else{
        res.redirect("/home");
    }
});
app.get("/logout",isLoggedIn,function(req,res){
    req.logout();
    req.session.passport.user = null
    req.flash("success","You have been successfully Logout");
     res.redirect("/login");
});
app.get('/send/rating/:id/:rate',isLoggedIn,function(req,res){
   let userid=req.params.id;
   let rate=req.params.rate;
   let  found=0,foundid=null;

      let url="/user/"+userid;;
        if(req.user.username==req.params.id){
        req.flash("error","Oops You can't Rate yourself!!!");
        res.redirect("/");
    }
    else{
       User.findOne({username:userid}).populate('ratings').exec((err,founduser)=>{
          if(err){
           req.flash("error","Something Went Wrong Please Retry!!!");
             res.redirect(url);
           }
           else{
                founduser.ratings.forEach((foundrate)=>{
                  if(foundrate._creator && foundrate._creator.toString()==req.user._id.toString()){
                    console.log(foundrate);
                    found=1;
                    Rating.findByIdAndUpdate(foundrate._id,{rating:rate},(err)=>{
                        if(err){
                    req.flash("error","Something Went Wrong Please Retry!!!");
                    res.redirect(url);
                  }
                  else{
                    console.log("saving");
                     req.flash("success","Rated Successfully");
                     res.redirect(url);
                  }
              });
                  }
                });
              
         if(found!=1){
        console.log("entering");
         var newRating=new Rating({
            _creator : req.user._id,
            rating:rate
         });
          newRating.save((err,rating)=>{
            if(err){
             req.flash("error","Something Went Wrong Please Retry!!!");
             res.redirect(url);
              }
             else{
               User.findOneAndUpdate({username:userid},{$push:{'ratings':rating._id}},(err,data)=>{
                if(err){
                 req.flash("error","Something Went Wrong Please Retryyy!!!");
                  res.redirect(url);
                  }
                else{
                  req.flash("success","Rated Successfully");
                  res.redirect(url);
                 }
                });
              }
                console.log("url"+url);
            
          });
        }
            }
        });
      
      }
});
app.post('/send/message/:id',isLoggedIn,function(req,res){
   var userid=req.params.id
      let url="/user/"+userid;;
    if(req.user.username==req.params.id){
   console.log("if");

        req.flash("error","Oops You can't text yourself!!!");
        res.redirect("/");
    }
    else{
   console.log("else");

         var newComment=new Comment({
            _creator : req.user._id,
            commentdata:req.body.message
         });
    newComment.save((err,comment)=>{
        if(err){
             req.flash("error","Something Went Wrong Please Retry!!!");
             res.redirect(url);

        }
        else{
        User.findOneAndUpdate({username:userid},{$push:{'comments':comment._id}},(err,data)=>{
            if(err){
            req.flash("error","Something Went Wrong Please Retryyy!!!");
             res.redirect(url);
            }
            else{
                console.log(data);
                req.flash("success","Message Sent Successfully");
             res.redirect(url);

            }
           });
    }
                console.log("url"+url);
            
    });
        }
});
app.get('/verify/:id',isnotLoggedIn,function(req,res){
    res.render("verify",{id:req.params.id});
});
app.post('/verify/:id',isnotLoggedIn,function(req,res){
  User.findOne({username:req.params.id},function(err,found){
    if(err){
        console.log(err);
        req.flash("error","Please Signup First");
        res.redirect("/login");
    }
    else{
      if(found!=null&&found.isVerified==false){
        if(req.body.verify==found.verifycode.code){
           User.findOneAndUpdate({username:req.params.id},{$set:{isVerified:true},$unset:{verifycode:1}},function(err,founduser){
            if(err)
            {
                console.log(err);
                req.flash("error","Roll Number "+founduser.username+" verification failed");
            }
            else{
                req.flash("success","Roll Number "+founduser.username+" has been Successfully verified");
                res.redirect("/login");
            }           
        });}
        else{
            console.log(err);
              req.flash("error","Wrong code");
              let redirection="/verify/"+req.params.id;
              res.redirect(redirection);
       } }
        else{
            req.flash("error","Your Account is already verified Please login");
            res.redirect("/login");
        }
    }
  });
    });
app.listen("3000",()=>{
	console.log("Server Started");
});
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
if(req.user.isVerified==true) {
        return next();
    }
    else{
        req.logout();
        req.session.passport.user = null;
        req.flash("error","Please verify acc first");
        res.redirect("/login");
    }
}
    else{
    req.flash("error","Please Login First");
    res.redirect("/login");
}}
function isnotLoggedIn(req, res, next){
    if(req.user && req.isAuthenticated())
    {
        res.redirect("/home");
    }
    else{
             return next();
    }
}
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}