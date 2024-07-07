// jshint esversion: 6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const Article = require("./models/article");

const app = express();

app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(express.static("public"));

mongoose
  .connect("mongodb://127.0.0.1:27017/wikiDB", { useNewUrlParser: true })
  .then(() => {
    console.log("Connection Successful");
  })
  .catch((err) => {
    console.log("Error: ", err);
  });

//////Requests targetting all the articles/////////////////
app
  .route("/articles")
  .get(async function (req, res, next) {
    try {
      const articles = await Article.find();
      res.send(articles);
    } catch (err) {
      return next(err);
    }
  })
  .post(function (req, res) {
    try {
      const newArticle = new Article({
        title: req.body.title,
        content: req.body.content,
      });
      newArticle.save();
      res.status(200).json({ message: "Successfully saved new article" });
    } catch (err) {
      res.status(500).json({
        message: "Internal server error",
        Info: err,
      });
    }
  })
  .delete(async function (req, res, next) {
    try {
      const deleteArticles = await Article.deleteMany();
      res.status(200).json({ message: "Successfully deleted all articles" });
    } catch (err) {
      res.status(500).json({
        message: "Internal error while deleting articles",
        Info: err,
      });
    }
  });

/////Requests targetting a single article///////

app
  .route("/articles/:articleTitle")
  .get(async function (req, res, next) {
    try {
      const foundArticle = await Article.findOne({
        title: req.params.articleTitle,
      });
      res.send(foundArticle);
    } catch (err) {
      return next(err);
    }
  })
  .put(async function (req, res, next) {
    try {
      await Article.findOneAndUpdate(
        { title: req.params.articleTitle },
        { title: req.body.title, content: req.body.content },
        { overwrite: true }
      );
      res.send("success");
    } catch (err) {
      return next(err);
    }
  })

  .patch(async function (req, res) {
    try {
      await Article.findOneAndUpdate(
        { title: req.params.articleTitle },
        {content: req.body},
      );
      res.send("success");
    } catch (err) {
      return next(err);
    }
  });

app.listen(3000, function (req, res) {
  console.log("Listening on PORT 3000");
});
