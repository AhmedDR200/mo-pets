const express = require('express');
const {
  createSubCategory,
  getSubCategories,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
} = require('../controllers/subCategory.controller');

const router = express.Router();

router.route('/').get(getSubCategories).post(createSubCategory);

router
  .route('/:id')
  .get(getSubCategory)
  .put(updateSubCategory)
  .delete(deleteSubCategory);

module.exports = router;
