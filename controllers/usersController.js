const ArticleModel = require("./../models/articleModel");
const CategoryModel = require("./../models/categoryModel");
const UserModel = require("../models/userModel");
const imageMimeTypes = ["image/jpeg", "image/jpg", "image/png", "images/gif"];
const bcrypt = require("bcrypt");

usersController = {};

/* --- Manage authentication --- */

// Show login page
usersController.showLoginPage = async (req, res) => {
  try {
    console.log("... RUN - usersController.showLoginPage");
    res.render("authentication/login", {
      layout: "layouts/not-authen-layout",
      title: "Đăng nhập",
    });
  } catch (e) {
    console.log(
      "... Get error when run - usersController.showLoginPage - " + e
    );
  }
};

// Show register page
usersController.showRegisterPage = async (req, res) => {
  try {
    console.log("... RUN - usersController.showRegisterPage");

    res.render("authentication/register", {
      layout: "layouts/not-authen-layout",
      title: "Đăng kí",
    });
  } catch (e) {
    console.log(
      "... Get error when run - usersController.showRegisterPage - " + e
    );
  }
};

// Do register a new account
usersController.registerNewUser = async (req, res) => {
  let { firstName, lastName, email, password, password2, avatar } = req.body;
  let errors = [];

  // check required fields
  if (!firstName || !lastName || !email || !password || !password2) {
    errors.push({ msg: "Please fill all fields" });
    req.flash('warning_msg', 'Please fill all fields');
  }

  // check password match
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
    req.flash('warning_msg', 'Passwords do not match');
  }

  // check pass length
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters" });
    req.flash('warning_msg', 'Password should be at least 6 characters');
  }

  // got errorss
  if (errors.length > 0) {
    console.log("have issues in register info");
    res.render("authentication/register", {
      layout: "layouts/not-authen-layout",
      errors,
      firstName,
      lastName,
      email,
      password,
      password2,
      avatar,
    });
  } else {
    const existUser = await UserModel.getUserByEmail(email);

    if (existUser) {
      //user exists
      errors.push({ msg: "Email is already registered" });
      req.flash('warning_msg', 'Email is already registered');

      res.render("authentication/register", {
        layout: "layouts/not-authen-layout",
        errors,
        firstName,
        lastName,
        email,
        password,
        password2,
        avatar,
      });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      let newUser = new UserModel({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
      });

      saveAvatar(newUser, req.body.avatar);

      try {
        await UserModel.addUser(newUser);
        // await mailer.sendVerificationEmail(newUser);
        console.log("new user\n" + newUser);

        req.flash("success_msg", "You are now registered and can log in");
        res.redirect("/users/login");
      } catch (err) {
        console.log("Error in newUser.save() + ", err);
      }
    }
  }
};

function saveAvatar(user, avatarEncoded) {
  if (!avatarEncoded) {
    return;
  }

  const avatar = JSON.parse(avatarEncoded);
  console.log(
    "imageMimeTypes.includes(cover.type) = " +
      imageMimeTypes.includes(avatar.type)
  );

  if (avatar != null && imageMimeTypes.includes(avatar.type)) {
    user.avatarImage = new Buffer.from(avatar.data, "base64");
    user.avatarImageType = avatar.type;
  }
}

// Show log out page
usersController.logout = async (req, res) => {
  try {
    console.log("... RUN - usersController.logout");
    req.logOut();
    res.redirect('/users/login')
  } catch (e) {
    console.log(
      "... Get error when run - usersController.logout - " + e
    );
  }
};

// Show forgot password page
usersController.showForgotPwPage = async (req, res) => {
  try {
    console.log("... RUN - usersController.showForgotPwPage");
    res.render("authentication/forgot-password", {
      layout: "layouts/not-authen-layout",
      title: "Quên mật khẩu",
    });
  } catch (e) {
    console.log(
      "... Get error when run - usersController.showForgotPwPage - " + e
    );
  }
};

/* --- Manage articles --- */

usersController.showAllArticles = async (req, res, next) => {
  try {
    console.log("... RUN - usersController.showAllArticles");
    const articles = await ArticleModel.getAllArticles();
    res.render("users/articles/articles", {
      title: "Quản lý bài viết",
      articles: articles,
    });
  } catch (e) {
    console.log(
      "... Get error when run - usersController.showAllArticles - " + e
    );
  }
};

usersController.showNewArticlePage = async (req, res, next) => {
  try {
    console.log("... RUN - usersController.showNewArticlePage");
    // get all categories
    const categories = await CategoryModel.getAllCategories();

    res.render("users/articles/new", {
      title: "Tạo bài viết mới",
      article: new ArticleModel(),
      categories: categories,
    });
  } catch (e) {
    console.log(
      "... Get error when run - usersController.showNewArticlePage - " + e
    );
  }
};

usersController.getArticle = async (req, res, next) => {
  try {
    const article = await ArticleModel.getArticle(req.params.slug);
    res.render("users/articles/show", {
      title: "Chi tiết bài viết",
      article: article,
    });
  } catch (e) {
    console.log("... Get error when run - usersController.getArticle - " + e);
    res.redirect("/users/articles");
  }
};

usersController.addArticle = async (req, res, next) => {
  let articleToAdd = new ArticleModel({
    author: `${req.user.lastName} ${req.user.firstName}`,
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    markdown: req.body.markdown,
  });

  saveCover(articleToAdd, req.body.cover);

  try {
    console.log("... RUN - usersController.addArticle");
    articleToAdd = await ArticleModel.addArticle(articleToAdd);
    res.redirect(`/users/articles/${articleToAdd.slug}`);
  } catch (e) {
    console.log("... Get error when run - usersController.addArticle - " + e);
    // get all categories
    const categories = await CategoryModel.getAllCategories();
    res.render("users/articles/new", {
      article: articleToAdd,
      categories: categories,
    });
  }
};

function saveCover(article, coverEncoded) {
  if (!coverEncoded) {
    return;
  }  

  const cover = JSON.parse(coverEncoded); 

  if (cover != null && imageMimeTypes.includes(cover.type)) {
    article.coverImage = new Buffer.from(cover.data, "base64");
    article.coverImageType = cover.type;
  }
}

usersController.deleteArticle = async (req, res, next) => {
  try {
    console.log("... RUN - usersController.deleteArticle");
    await ArticleModel.deleteArticle(req.params.id);
    res.redirect("/users/articles");
  } catch (e) {
    console.log(
      "... Get error when run - usersController.deleteArticle - " + e
    );
  }
};

usersController.showEditArticlePage = async (req, res, next) => {
  try {
    console.log("... RUN - usersController.showEditArticlePage");
    let articleToEdit = await ArticleModel.getArticleById(req.params.id);
    // get all categories
    const categories = await CategoryModel.getAllCategories();
    res.render("users/articles/edit", {
      title: "Chỉnh sửa bài viết",
      article: articleToEdit,
      categories: categories,
    });
  } catch (e) {
    console.log(
      "... Get error when run - usersController.showEditArticlePage - " + e
    );
  }
};

usersController.editArticle = async (req, res, next) => {
  let articleToEdit = new ArticleModel();

  try {
    console.log("... RUN - usersController.editArticle");
    articleToEdit = await ArticleModel.getArticleById(req.params.id);

    articleToEdit.author = `${req.user.lastName} ${req.user.firstName}`;
    articleToEdit.title = req.body.title;
    articleToEdit.description = req.body.description;
    articleToEdit.category = req.body.category;
    articleToEdit.markdown = req.body.markdown;

    saveCover(articleToEdit, req.body.cover);

    await articleToEdit.save();
    res.redirect(`/users/articles/${articleToEdit.slug}`);
  } catch (e) {
    console.log("... Get error when run - usersController.editArticle - " + e);
    // get all categories
    const categories = await CategoryModel.getAllCategories();
    res.render("users/articles/edit", {
      title: "Chỉnh sửa bài viết",
      article: articleToEdit,
      categories: categories,
    });
  }
};

function saveArticleAndRedirect(path) {
  return async (req, res) => {
    let article = req.article;
    article.title = req.body.title;
    article.description = req.body.description;
    article.description = req.body.description;

    try {
      console.log("... RUN - saveArticleAndRedirect");
      article = await article.save();
      res.redirect(`/users/articles/${article.slug}`);
    } catch (e) {
      console.log("... Get error when run - saveArticleAndRedirect - " + e);
      res.render(`users/articles/${path}`, { article: article });
    }
  };
}

/* --- Manage categories --- */
usersController.showAllCategories = async (req, res) => {
  try {
    console.log("... RUN - usersController.showAllCategories");
    const categories = await CategoryModel.getAllCategories();
    res.render("users/categories/categories", {
      title: "Danh sách danh mục",
      categories: categories,
    });
  } catch (e) {}
};

usersController.showNewCategoryPage = (req, res, next) => {
  try {
    console.log("... RUN - usersController.showNewCategoryPage");
    res.render("users/categories/new", {
      title: "Tạo danh mục mới",
      category: new CategoryModel(),
    });
  } catch (e) {
    console.log(
      "... Get error when run - usersController.showNewCategoryPage - " + e
    );
  }
};

usersController.getCategoryByCategorySlug = async (req, res, next) => {
  try {
    console.log("... RUN - usersController.getCategoryByCategorySlug");
    const article = await CategoryModel.getCategoryByCategorySlug(
      req.params.categorySlug
    );
    res.render("users/categories/show", { category: category });
  } catch (e) {
    console.log(
      "... Get error when run - usersController.getCategoryByCategorySlug - " +
        e
    );
    res.redirect("/users/categories");
  }
};

usersController.addCategory = async (req, res, next) => {
  let categoryToAdd = new CategoryModel({
    title: req.body.title,
    description: req.body.description,
  });

  try {
    console.log("... RUN - usersController.addCategory");
    categoryToAdd = await CategoryModel.addCategory(categoryToAdd);
    res.redirect(`/users/categories/${categoryToAdd.categorySlug}`);
  } catch (e) {
    console.log("... Get error when run - usersController.addCategory - " + e);
    res.render("users/categories/new", { category: categoryToAdd });
  }
};

usersController.deleteCategory = async (req, res, next) => {
  try {
    console.log("... RUN - usersController.deleteCategory");
    await CategoryModel.deleteCategory(req.params.id);
    res.redirect("/users/categories");
  } catch (e) {
    console.log(
      "... Get error when run - usersController.deleteCategory - " + e
    );
  }
};

usersController.showEditCategoryPage = async (req, res, next) => {
  try {
    console.log("... RUN - usersController.showEditCategoryPage");
    let categoryToEdit = await CategoryModel.getCategoryById(req.params.id);
    res.render("users/categories/edit", {
      title: "Chỉnh sửa thể loại",
      category: categoryToEdit,
    });
  } catch (e) {
    console.log(
      "... Get error when run - usersController.showEditCategoryPage - " + e
    );
  }
};

usersController.editCategory = async (req, res, next) => {
  try {
    console.log("... RUN - usersController.editCategory");
    let categoryToEdit = await CategoryModel.getCategoryById(req.params.id);
    categoryToEdit.title = req.body.title;
    categoryToEdit.description = req.body.description;

    await categoryToEdit.save();
    res.redirect(`/users/categories/${categoryToEdit.categorySlug}`);
  } catch (e) {
    console.log("... Get error when run - usersController.editCategory - " + e);
    res.render("users/categories/edit", { category: categoryToEdit });
  }
};

module.exports = usersController;
