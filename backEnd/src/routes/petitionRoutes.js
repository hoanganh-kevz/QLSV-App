const express = require('express');
const router = express.Router();
const petitionController = require('../controllers/petitionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(authorize('admin', 'teacher'), petitionController.getAll)
  .post(authorize('student'), petitionController.createPetition);

router.get('/my-petitions', authorize('student'), petitionController.getMyPetitions);
router.put('/:id/status', authorize('admin', 'teacher'), petitionController.updateStatus);

router.route('/:id')
  .put(authorize('student'), petitionController.updatePetition)
  .delete(authorize('student'), petitionController.deletePetition);

module.exports = router;
