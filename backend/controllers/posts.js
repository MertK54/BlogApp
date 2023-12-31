const Post = require("../models/post");

exports.postPost = (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + "/images/" + req.file.filename,
        creator: req.userData.userId
    });
    post.save().then(createdPost => {
        res.status(201).json({
        message: "Post added successfully",
        post: {
            ...createdPost,
            id: createdPost._id
        }
        });
    })
    .catch(error =>{
        res.status(500).json({
            message:" Creating a post failed! "
        })
        })
    }       

    exports.postPut = (req, res, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
        const url = req.protocol + "://" + req.get("host");
        imagePath = url + "/images/" + req.file.filename
    }
    const post = new Post({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content,
        imagePath: imagePath,
        creator: req.userData.userId
    });
    console.log(post);
    Post.updateOne({ _id: req.params.id, creator:req.userData.userId }, post)
    .then(result => {
      console.log(result);
      console.log("modified Count ",result.modifiedCount);
        if(result.modifiedCount >= 0 )//değiştirilme işlemi
        {
        res.status(200).json({ message: "Update successful!" });
        }
        else
        {
        res.status(401).json({ message: "Not authorized!" });
        }
    })
    .catch(error =>{
        res.status(500).json({
        message:"Couldn't update post!"
        })
    })
    }

exports.postGet = (req, res, next) => {
    const pageSize = +req.query.pagesize;// metin olarak geliyor başına + koyunca sayı oluyor
    const currentPage = +req.query.page;
    const postQuery = Post.find();
    let fetchedPosts;
    if(pageSize && currentPage)
    {
      postQuery
        .skip(pageSize * (currentPage -1))
        .limit(pageSize)
    }
    postQuery.then(documents => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then(count=>{
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: fetchedPosts,
        maxPosts : count,
      });
      })
      .catch(error =>{
        res.status(500).json({
          message:"Fetching posts failed!"
        })
      })
  }
  exports.postGetted = (req, res, next) => {
    Post.findById(req.params.id).then(post => {
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({ message: "Post not found!" });
      }
    })
    .catch(error =>{
        res.status(500).json({
          message:"Fetching post failed! "
        })
      })
  }

  exports.postDelete = (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator:req.userData.userId })
  .then(result => {
    console.log(result);
    if(result.deletedCount > 0)// silme işlemi
      res.status(200).json({ message: "Deletion succesful!" });
    else{
      res.status(401).json({ message: "Not authorized!" }); 
    }
  })
  .catch(error =>{
    res.status(500).json({
      message:"Deleting post failed! "
    });
  });
}