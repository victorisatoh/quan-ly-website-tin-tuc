const mongoose = require("mongoose"); // import mongoose
let Schema = mongoose.Schema; // use the mongoose schema object
const marked = require("marked");
const slugify = require("slugify");
const createDomPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const dompurify = createDomPurify(new JSDOM().window);

// create Schema
let articleSchema = new Schema({
  author: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  coverImage: {
    type: Buffer,
  },
  coverImageType: {
    type: String,
  },
  category: {
    type: String,
    required: true,
  },
  markdown: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  ctgSlug: {
    type: String,
    require: true,
  },
  sanitizedHTML: {
    type: String,
    required: true,
  },
});

articleSchema.pre("validate", function (next) {
  // create slug from title
  if (this.title) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
    });
  }

  // create slug from category
  if (this.title) {
    this.ctgSlug = slugify(this.category, {
      lower: true,
      strict: true,
    });
  }

  if (this.markdown) {
    this.sanitizedHTML = dompurify.sanitize(marked(this.markdown));
  }

  next();
});

articleSchema.virtual("coverImagePath").get(function () {
  if (this.coverImage != null && this.coverImageType != null) {
    return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString("base64")}`;
  } else {
    return "img/no-preview-available.png";
  }
});

let ArticleModel = mongoose.model("Article", articleSchema, "articles");

// Get all articles
ArticleModel.getAllArticles = () => {
  console.log("... RUN - ArticleModel.getAllArticles()");
  const query = ArticleModel.find().sort({
    createdAt: "desc",
  });

  return query;
};

// Get all articles  belong to a category title
ArticleModel.getAllArticlesByCategoryTitle = (categoryTitle) => {
  console.log(
    "... RUN - ArticleModel.getAllArticlesByCategoryTitle(categoryTitle)"
  );
  const query = ArticleModel.find({ category: categoryTitle }).sort({
    createdAt: "desc",
  });

  return query;
};

// Get all articles  belong to a category slug
// ArticleModel.getAllArticlesByCategorySlug = (categorySlug) => {
//   console.log(
//     "... RUN - ArticleModel.getAllArticlesByCategorySlug(categorySlug)"
//   );
//   const query = ArticleModel.find({ categorySlug: categorySlug }).sort({
//     createdAt: "desc",
//   });

//   return query;
// };

ArticleModel.addArticle = (articleToAdd) => {
  console.log("... RUN - ArticleModel.addArticle()");
  return articleToAdd.save();
};

ArticleModel.getArticle = (articleSlug) => {
  console.log("... RUN - ArticleModel.getArticle()");
  const query = ArticleModel.findOne({ slug: articleSlug });
  return query;
};

ArticleModel.deleteArticle = (articleId) => {
  console.log("... RUN - ArticleModel.deleteArticle()");
  return ArticleModel.findByIdAndDelete(articleId);
};

ArticleModel.getArticleById = (articleId) => {
  console.log("... RUN - ArticleModel.getArticleById()");
  const query = ArticleModel.findById(articleId);
  return query;
};

ArticleModel.editArticle = (articleToEdit) => {};

module.exports = ArticleModel;
