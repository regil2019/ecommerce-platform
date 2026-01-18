// src/validators/productValidators.js
import { body } from 'express-validator'

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

  // Mantém a coluna não nula e garante que venha algo minimamente preenchido
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('A descrição é obrigatória e não pode exceder 1000 caracteres'),

  body('categoryId')
    .optional()
    .isInt()
    .withMessage('ID de categoria inválido'),

  // Garante alinhamento com o modelo (min > 0, padrão 1.0 se não enviado)
  body('weight')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('O peso deve ser um número maior que zero'),

  // Opcional, mas se vier, precisa ser array de strings/URLs
  body('images')
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) return true
      if (typeof value === 'string') return true
      return false
    })
    .withMessage('Imagens deve ser uma string ou array de URLs')
]
