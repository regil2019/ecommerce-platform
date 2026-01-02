// src/validators/productValidators.js
import { body } from 'express-validator';

export const productValidators = [
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('O nome deve ter pelo menos 3 caracteres'),
  
  body('price')
    .isFloat({ gt: 0 })
    .withMessage('O preço deve ser maior que zero'),
  
  body('stock')
    .isInt({ min: 0 })
    .withMessage('O estoque deve ser um número inteiro positivo'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('A descrição não pode exceder 1000 caracteres'),
  
  body('categoryId')
    .optional()
    .isInt()
    .withMessage('ID de categoria inválido'),
];
