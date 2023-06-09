const express = require ("express");
const { getProducts, newProduct, getOneProduct, updateProduct, deleteProduct, createReview, getReviews, deleteReview } = require("../controllers/productController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/autheticate");
const router = express.Router();

router.route("/products").get(getProducts);
router.route("/product/:id").get(getOneProduct)
                            .put(updateProduct)
                            .delete(deleteProduct);
router.route("/review").put(isAuthenticatedUser,createReview)
                       .delete(deleteReview);
router.route("/reviews").get(getReviews);
// Admin Route
router.route("admin/product/new").post(isAuthenticatedUser, authorizeRoles('admin'), newProduct);

module.exports = router;