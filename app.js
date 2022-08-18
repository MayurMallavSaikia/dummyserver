const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
app.use(cors());
const bcrypt = require("bcryptjs");


const jwt = require("jsonwebtoken");

const JWT_SECRET =
  "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";

const mongoUrl ='mongodb+srv://mayurDB:Hello123db@cluster0.bgeofph.mongodb.net/MyMovieDB?retryWrites=true&w=majority';

mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((e) => console.log(e));



  require("./model/userDetails");                       // User Model Import
  const User = mongoose.model("users");
  
  require("./model/Favorite")                         // Favorite Model Import
  const Favorite=mongoose.model("favorites");

   require("./model/Like")                            //Like Model Import
   const Like=mongoose.model("likes")

   require("./model/Dislike")                         // Dislike Model Import
   const Dislike=mongoose.model("dislikes")

   require("./model/Comment")                         // Comments Model Import
   const Comment=mongoose.model("comments")

  

  /*
    Register,Login, Logout API calls
  */


app.post("/api/users/register", async (req, res) => {
  const { name, email, password, lastname, role, token } = req.body;

  const encryptedPassword = await bcrypt.hash(password, 10);
  try {
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.json({  success: false });
    }

   


    await User.create({
      name:name,
      email:email,
      password: encryptedPassword,
      lastname:lastname,
      role,
      token:""
    });
    res.send({  success: true });
  } catch (error) {
    res.send({  success: false, error});
  }
});





app.post("/api/users/login", async (req, res) => {
  const { email, password } = req.body;
  const token = jwt.sign({ email: email }, JWT_SECRET);
  
  const user = await User.findOneAndUpdate({ email:email },{token:token});
  

    if (!user) {
      return res.json({ loginSuccess: false,  message: "Auth failed, email not found" });
    }
    if (await bcrypt.compare(password, user.password)) {

   if (res.status(201)) {
        return res.json({  loginSuccess: true, userId: user._id, name:user.name, token:token});
      } else {
        return res.json({ error: "error" });
      }
    }
    res.json({ loginSuccess: false, message: "Wrong password" });


});



app.post("/api/users/logout", async (req, res) => {
  const { userId } = req.body;
  User.findOneAndUpdate({ _id:userId}, { token: ""}, (err, doc) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
        success: true
    });
});



});



/*
    Favorites API calls
  */


  app.post("/api/favorite/favoriteNumber", (req, res) => {

      Favorite.find({ "movieId": req.body.movieId })
          .exec((err, subscribe) => {
              if (err) return res.status(400).send(err)
  
              res.status(200).json({ success: true, subscribeNumber: subscribe.length })
          })
  
  });


  app.post("/api/favorite/favorited", (req, res) => {

    Favorite.find({ "movieId": req.body.movieId, "userFrom": req.body.userFrom })
        .exec((err, subscribe) => {
            if (err) return res.status(400).send(err)

            let result = false;
            if (subscribe.length !== 0) {
                result = true
            }

            res.status(200).json({ success: true, subcribed: result })
        })

});



app.post("/api/favorite/addToFavorite", (req, res) => {

    console.log(req.body)

    const favorite = new Favorite(req.body);

    favorite.save((err, doc) => {
        if (err) return res.json({ success: false, err })
        return res.status(200).json({ success: true })
    })

});


app.post("/api/favorite/removeFromFavorite", (req, res) => {


    Favorite.findOneAndDelete({ movieId: req.body.movieId, userFrom: req.body.userFrom })
        .exec((err, doc) => {
            if (err) return res.status(400).json({ success: false, err });
            res.status(200).json({ success: true, doc })
        })
});


app.post("/api/favorite/getFavoredMovie", (req, res) => {

    //Need to find all of the Users that I am subscribing to From Subscriber Collection 
    Favorite.find({ 'userFrom': req.body.userFrom })
        .exec((err, favorites) => {
            if (err) return res.status(400).send(err);
            return res.status(200).json({ success: true, favorites })
        })
});



/*
    Like and Dislike API calls
  */

    app.post("/api/like/getLikes", (req, res) => {

      let variable = {}
      if (req.body.videoId) {
          variable = { videoId: req.body.videoId }
      } else {
          variable = { commentId: req.body.commentId }
      }
  
      Like.find(variable)
          .exec((err, likes) => {
              if (err) return res.status(400).send(err);
              res.status(200).json({ success: true, likes })
          })
  
  
  })
  
  
  app.post("/api/like/getDislikes", (req, res) => {
  
      let variable = {}
      if (req.body.videoId) {
          variable = { videoId: req.body.videoId }
      } else {
          variable = { commentId: req.body.commentId }
      }
  
      Dislike.find(variable)
          .exec((err, dislikes) => {
              if (err) return res.status(400).send(err);
              res.status(200).json({ success: true, dislikes })
          })
  
  })
  
  
  app.post("/api/like/upLike", (req, res) => {
  
      let variable = {}
      if (req.body.videoId) {
          variable = { videoId: req.body.videoId, userId: req.body.userId }
      } else {
          variable = { commentId: req.body.commentId , userId: req.body.userId }
      }
  
      const like = new Like(variable)
      //save the like information data in MongoDB
      like.save((err, likeResult) => {
          if (err) return res.json({ success: false, err });
          //In case disLike Button is already clicked, we need to decrease the dislike by 1 
          Dislike.findOneAndDelete(variable)
              .exec((err, disLikeResult) => {
                  if (err) return res.status(400).json({ success: false, err });
                  res.status(200).json({ success: true })
              })
      })
  
  })
  
  
  
  
  app.post("/api/like/unLike", (req, res) => {
  
      let variable = {}
      if (req.body.videoId) {
          variable = { videoId: req.body.videoId, userId: req.body.userId }
      } else {
          variable = { commentId: req.body.commentId , userId: req.body.userId }
      }
  
      Like.findOneAndDelete(variable)
          .exec((err, result) => {
              if (err) return res.status(400).json({ success: false, err })
              res.status(200).json({ success: true })
          })
  
  })
  
  
  app.post("/api/like/unDisLike", (req, res) => {
  
      let variable = {}
      if (req.body.videoId) {
          variable = { videoId: req.body.videoId, userId: req.body.userId }
      } else {
          variable = { commentId: req.body.commentId , userId: req.body.userId }
      }
  
      Dislike.findOneAndDelete(variable)
      .exec((err, result) => {
          if (err) return res.status(400).json({ success: false, err })
          res.status(200).json({ success: true })
      })
  
  
  })
  
  
  
  app.post("/api/like/upDisLike", (req, res) => {
  
      let variable = {}
      if (req.body.videoId) {
          variable = { videoId: req.body.videoId, userId: req.body.userId }
      } else {
          variable = { commentId: req.body.commentId , userId: req.body.userId }
      }
  
      const disLike = new Dislike(variable)
      //save the like information data in MongoDB
      disLike.save((err, dislikeResult) => {
          if (err) return res.json({ success: false, err });
          //In case Like Button is already clicked, we need to decrease the like by 1 
          Like.findOneAndDelete(variable)
              .exec((err, likeResult) => {
                  if (err) return res.status(400).json({ success: false, err });
                  res.status(200).json({ success: true })
              })
      })
  
  
  })
  
/*
    Comment API calls
  */


app.post("/api/comment/saveComment",(req, res) => {

      const comment = new Comment(req.body)
  
      comment.save((err, comment) => {
          console.log(err)
          if (err) return res.json({ success: false, err })
  
          Comment.find({ '_id': comment._id })
              .populate('writer')
              .exec((err, result) => {
                  if (err) return res.json({ success: false, err })
                  return res.status(200).json({ success: true, result })
              })
      })
  })
  
  app.post("/api/comment/getComments", (req, res) => {
  
      Comment.find({ "postId": req.body.movieId })
          .populate('writer')
          .exec((err, comments) => {
              if (err) return res.status(400).send(err)
              res.status(200).json({ success: true, comments })
          })
  });
  







const port= process.env.PORT || 5000

app.listen(port, () => {
  console.log("Server Started at port "+port);
});


