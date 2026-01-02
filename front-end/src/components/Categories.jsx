import React from "react";

const categories = [
  { id: 1, name: "Eletrônicos" },
  { id: 2, name: "Roupas" },
  { id: 3, name: "Calçados" },
  { id: 4, name: "Livros" },
];

export default function Categories({ onSelectCategory, selectedCategory }) {
  return (
    <div className="mb-8 p-4 bg-gray-100 rounded">
      <h3 className="text-xl font-semibold mb-4">Categorias</h3>
      <div className="flex space-x-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.name)}
            className={`relative px-4 py-2 rounded text-white hover:bg-blue-600 ${
              selectedCategory === category.name ? "bg-blue-700" : "bg-blue-500"
            }`}
          >
            {category.name}
            {/* Right side highlight on mobile only */}
            {selectedCategory === category.name && (
              <span className="absolute top-0 right-0 h-full w-1 bg-yellow-400 md:hidden rounded-l"></span>
            )}
          </button>
        ))}
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-4 py-2 rounded hover:bg-gray-400 ${
            selectedCategory === null
              ? "bg-gray-400 text-gray-900"
              : "bg-gray-300 text-gray-700"
          }`}
        >
          Todas
        </button>
      </div>
    </div>
  );
}
