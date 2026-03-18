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
    <div className="mb-10 p-6 bg-card border border-border/50 rounded-2xl shadow-sm backdrop-blur-sm">
      <h3 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
         <span className="w-1.5 h-6 bg-primary rounded-full" />
         Categorias
      </h3>
      <div className="flex gap-3 flex-wrap">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.name)}
            className="px-5 py-2.5 bg-secondary/50 border-2 border-transparent text-muted-foreground rounded-xl text-sm font-semibold hover:bg-secondary hover:text-foreground transition-all duration-300"
          >
            {category.name}
          </button>
        ))}
        <button
          onClick={() => onSelectCategory(null)}
          className="px-5 py-2.5 bg-transparent border-2 border-border text-muted-foreground rounded-xl text-sm font-semibold hover:bg-secondary transition-all"
        >
          Todas
        </button>
      </div>
    </div>
  );
}
