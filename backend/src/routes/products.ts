import { Router } from 'express';
import {
  getProducts,
  createProduct,
  deleteProduct,
  getProductById,
  getPriceHistory,
} from '../controllers/productController.js';

const router = Router();

router.get('/', getProducts);
router.post('/', createProduct);
router.get('/:id', getProductById);
router.delete('/:id', deleteProduct);
router.get('/:id/history', getPriceHistory);

export default router;
