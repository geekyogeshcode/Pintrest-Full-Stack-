var express = require('express');
var router = express.Router();
const userModel=require("./users");
const postModel=require('./post')
const passport = require('passport');
const localStrategy=require('passport-local')
passport.use(new localStrategy(userModel.authenticate()))
const upload=require('./multer')


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/profile',isLoggedIn,async(req,res) =>{
  const user= 
      await userModel
        .findOne({username:req.session.passport.user})
        .populate('posts')

  res.render("profile",{user})
})

router.post("/fileupload",isLoggedIn,upload.single('image'),async(req,res,next) =>{
  if(!req.file){
    return res.redirect('/profile')
  }
    
  const user= await userModel.findOne({username:req.session.passport.user})
  user.boards.push(req.file.filename)
  await user.save()
  res.redirect("/profile")
})



router.post("/dpupload",isLoggedIn,upload.single("dp"),async(req,res,next) =>{
  if(!req.file){
    return res.redirect('/profile')
  }

  const user = await userModel.findOne({ username: req.session.passport.user });
  user.profileimage = req.file.filename;
  await user.save()
  res.redirect("/profile")

  // console.log(user);
  // console.log(req.file.filename);
})

router.post('/createpost',isLoggedIn,upload.single("postimage"),async(req,res) =>{
  const user=await userModel.findOne({username:req.session.passport.user})

  const post=await postModel.create({
    user:user._id,
    title:req.body.title,
    description:req.body.description ,
    image:req.file.filename
  })
  user.posts.push(post._id)
  await user.save()
  res.redirect("/profile")
})

router.get("/show/posts",isLoggedIn,async(req,res) =>{
  const user=await userModel.findOne({username:req.session.passport.user}).populate('posts')
  res.render('show',{user}) 
})

router.get('/feed',isLoggedIn,async(req,res) =>{

  const user=await userModel.findOne({username:req.session.passport.user})
  const posts=await postModel.find().populate('user')

  res.render('feed',{user,posts})
  // // const user=await userModel.findOne({username:req.session.passport.user}).populate('posts')
  // // let posts=await postModel.find().populate('user')

  // // res.render('feed',{user,posts})
  // let user=await userModel.find().populate('posts')
  // let post=await userModel.find().populate('posts')
  // // console.log(user);
})

router.get('/register',(req,res) =>{
  res.render('register')
})

router.post('/register',async (req,res,next) =>{
  const{fullname,username,email,password}=req.body

  const userdata=new userModel({
      fullname:fullname,
      username:username,
      email:email,
      // password:password
  })

  userModel.register(userdata,req.body.password)
    .then(function() {
      passport.authenticate('local')(req,res,function(){
        res.redirect('/profile')
      })
    })
})


router.post('/login',passport.authenticate('local',{
  successRedirect:"/profile",
  failureRedirect:"/"
}),(req,res) =>{ })


router.get("/logout",(req,res,next) =>{
  req.logout((err) =>{
    if(err) {return next(err);}
    res.redirect("/")
  })
})

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect("/")
}

module.exports = router;
