const express = require("express");
const PostController = require("../controllers/posts");
const checkAuth = require("../middleware/check-auth");
const extractFile = require("../middleware/file");
const router = express.Router();

router.post("",checkAuth,extractFile,PostController.postPost);

router.put("/:id",checkAuth,extractFile,PostController.postPut);

router.get("", PostController.postGet);

router.get("/:id", PostController.postGetted);

router.delete("/:id", checkAuth ,PostController.postDelete);

module.exports = router;
