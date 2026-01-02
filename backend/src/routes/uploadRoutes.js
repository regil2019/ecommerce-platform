import express from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import Product from '../models/Product.js';

const router = express.Router();

// Configura o armazenamento direto no Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'products', // pasta no Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const upload = multer({ storage });

// Endpoint de upload
router.post('/:id', upload.single('image'), async (req, res) => {
  try {
  const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produto não encontrado' });

    product.image = req.file.path; // URL do Cloudinary
    await product.save();

    res.json({
      message: 'Imagem enviada com sucesso',
      imageUrl: product.image,
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ message: 'Erro no upload da imagem' });
  }
});

export default router;
