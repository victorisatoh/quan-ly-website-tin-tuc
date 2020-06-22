const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const passport = require("passport");
const auth = require("../config/auth");
const methodOverride = require('method-override');

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send(users);
});

/* --- Manage authentication --- */
// Show login page
router.get("/login", auth.checkAlreadyLoggedIn, usersController.showLoginPage);

router.post("/login", auth.checkAlreadyLoggedIn, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
  })
);

// Show register page
router.get("/register", auth.checkAlreadyLoggedIn, usersController.showRegisterPage);

// Register a new account
router.post("/register", auth.checkAlreadyLoggedIn, usersController.registerNewUser
);

// Logout
router.delete("/logout", usersController.logout);

// Show forget password pagee
router.get("/forgot-password", auth.checkAlreadyLoggedIn, usersController.showForgotPwPage);

/* --- Manage articles --- */
// GET articles listing
router.get(
  "/articles",
  auth.ensureAuthenticated,
  usersController.showAllArticles
);

// GET new article page (R)
router.get(
  "/articles/new",
  auth.ensureAuthenticated,
  usersController.showNewArticlePage
);

// GET article by slug (R)
router.get(
  "/articles/:slug",
  auth.ensureAuthenticated,
  usersController.getArticle
);

// POST new article form (C)
router.post("/articles", auth.ensureAuthenticated, usersController.addArticle);
// router.post("/articles", usersController.saveArticleAndRedirect('new'));

// DELETE a article (D)
router.delete(
  "/articles/:id",
  auth.ensureAuthenticated,
  usersController.deleteArticle
);

router.get(
  "/articles/edit/:id",
  auth.ensureAuthenticated,
  usersController.showEditArticlePage
);

router.put(
  "/articles/:id",
  auth.ensureAuthenticated,
  usersController.editArticle
);
// router.put("/articles/:id", usersController.saveArticleAndRedirect('edit'));

/* Manage authentication */

/* Manage categories */

// GET categories listing
router.get(
  "/categories",
  auth.ensureAuthenticated,
  usersController.showAllCategories
);

// GET new category page (R)
router.get(
  "/categories/new",
  auth.ensureAuthenticated,
  usersController.showNewCategoryPage
);

// GET category by slug (R)
router.get("/categories/:categorySlug", auth.ensureAuthenticated, usersController.getCategoryByCategorySlug);

// POST new category form (C)
router.post("/categories", auth.ensureAuthenticated, usersController.addCategory);

// DELETE a category (D)
router.delete("/categories/:id", auth.ensureAuthenticated, usersController.deleteCategory);

router.get("/categories/edit/:id", auth.ensureAuthenticated, usersController.showEditCategoryPage);

router.put("/categories/:id", auth.ensureAuthenticated, usersController.editCategory);
// router.put("/articles/:id", usersController.saveArticleAndRedirect('edit'));

module.exports = router;
