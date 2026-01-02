import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ShoppingCart, ArrowLeft } from 'lucide-react';

export default function OrderCancel() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="flex items-center justify-center mb-6">
          <XCircle size={64} className="text-red-500" />
        </div>

        <h1 className="text-2xl font-bold mb-4 text-gray-900">
          Pagamento Cancelado
        </h1>

        <p className="mb-6 text-gray-600 leading-relaxed">
          O pagamento foi cancelado ou não foi concluído. Não se preocupe, nenhum valor foi cobrado do seu cartão.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            💡 <strong>Dica:</strong> Você pode tentar novamente quando estiver pronto ou salvar os itens para mais tarde.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/cart"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
          >
            <ShoppingCart size={18} className="mr-2" />
            Voltar ao Carrinho
          </Link>

          <Link
            to="/"
            className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center justify-center"
          >
            <ArrowLeft size={18} className="mr-2" />
            Continuar Comprando
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Se teve algum problema durante o pagamento, você pode tentar novamente ou entrar em contato conosco.
          </p>
        </div>
      </div>
    </div>
  );
}
