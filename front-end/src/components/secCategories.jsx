import React, { useEffect, useState } from "react";
import { fetchCategories } from "../services/categoryApi";

export default function SecCategories({ onSelectCategory }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories()
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error("Failed to fetch categories:", error);
      });
  }, []);

  return (
    <div className="mb-8 p-4 bg-gray-100 rounded">
      <h3 className="text-xl font-semibold mb-4">Categorias</h3>
      <div className="flex space-x-4 flex-wrap">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.name)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {category.name}
          </button>
        ))}
        <button
          onClick={() => onSelectCategory(null)}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          Todas
        </button>
      </div>
    </div>
  );
}
