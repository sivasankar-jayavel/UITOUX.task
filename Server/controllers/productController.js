const catchAsyncError = require("../middlewares/catchAsyncError");
const Product = require("../models/productModel");
const APIFeatures = require("../utils/apiFeatures");
const ErrorHandler = require("../utils/errorHandler");

//To Get all Products - /api/v1/products
exports.getProducts = async (req, res, next) => {
  const resPerPage = 4;

  let buildQuery = () => {
    return new APIFeatures(Product.find(), req.query).search().filter()
  }

  const filteredProductsCount = await buildQuery().query.countDocuments({});
  const totalProductsCount = await Product.countDocuments({});  //Here we found total products Count
  let productsCount = totalProductsCount;
  
  if(filteredProductsCount !== totalProductsCount){
    productsCount = filteredProductsCount;
  }

  const products = await buildQuery().paginate(resPerPage).query;
  
  // Loader purpose in frontend visualise we are creating setTimeout line it will execute after 3 sec
  // await new Promise(resolve => setTimeout(resolve,3000));
  // return next (new ErrorHandler('Unable to send Products!',400))   //this line only checking for toast error
  res.status(200).json({
    success: true,
    count: productsCount,
    resPerPage,
    products,
  });
};

// Create Product - /api/v1/product/new
exports.newProduct = catchAsyncError(async (req, res, next) => {
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    product,
  });
});

//Get One Product - /api/v1/product/:id
exports.getOneProduct = async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("product not found", 400));
  }
  res.status(201).json({
    success: true,
    product,
  });
};

// Update Product - /api/v1/product/:id
exports.updateProduct = async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404).json({
      success: false,
      message: "Product Not Found",
    });
  }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    product,
  });
};

//  Delete Product - /api/v1/product/:id

exports.deleteProduct = async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404).json({
      success: false,
      message: "Product Not Found",
    });
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product Deleted Successfully..!",
  });
};

// Create Review - api/v1/review
exports.createReview = catchAsyncError(async (req, res, next) => {
  const { productId, rating, comment } = req.body;

  const review = {
    user: req.user.id,
    rating,
    comment,
  };

  const product = await Product.findById(productId);
  // finding user has alraedy review or User review Exists
  const isReviewed = product.reviews.find((review) => {
    return review.user.toString() == req.user.id.toString();
  });

  if (isReviewed) {
    // updating the review
    product.reviews.forEach((review) => {
      if (review.user.toString() == req.user.id.toString()) {
        review.rating = rating;
        review.comment = comment;
      }
    });
  } else {
    // creating the review
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }
// find the avg of the product reviews
  product.ratings =
    product.reviews.reduce((acc, review) => {
      return acc + review.rating;
    }, 0) / product.reviews.length;

  isNaN(product.ratings) ? 0 : product.ratings;

  await product.save({validateBeforeSave:false});

  res.status(200).json({
    message:true
  })

});


// Get Reviews - api/v1/reviews?id={productId}
exports.getReviews = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    res.status(200).json({
      success:true,
      reviews:product.reviews
    })
})


// Delete Review -  api/v1/review
// /api/v1/review/?id=642bdf3491d73dee4bea8e11&productId=641878145b2d4d8d0db4f7b2
exports.deleteReview =  catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  // Filtering the Reviews which Does not match the deleting id
  const reviews = product.reviews.filter(review =>{
   return review._id.toString() !== req.query.id.toString()
  });

  //Update Num of Reviews
  const numOfReviews = reviews.length;

  // Find the avg with the filtered reviews
  let ratings = reviews.reduce((acc, review) => {
    return acc + review.rating;
  }, 0) / product.reviews.length;

   ratings = isNaN(ratings)?0:ratings;

// save the product documents
   await Product.findByIdAndUpdate(req.query.productId,{
    reviews,
    numOfReviews,
    ratings
   })

   res.status(200).json({
    success:true
   })
});