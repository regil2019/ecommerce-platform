import React from "react";

const categories = [
  { id: 1, name: "Eletrônicos" },
  { id: 2, name: "Roupas" },
  { id: 3, name: "Calçados" },
  { id: 4, name: "Livros" },
];

export default function Categories({ onSelectCategory, selectedCategory }) {
  return (
    <div className="mb-10 p-6 bg-card border border-border/50 rounded-2xl shadow-sm backdrop-blur-sm">
      <h3 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
        <span className="w-1.5 h-6 bg-primary rounded-full" />
        {t('home.categories')}
      </h3>
      <div className="flex gap-3 flex-wrap">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.name)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border-2 ${
              selectedCategory === category.name 
                ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                : "bg-secondary/50 border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {category.name}
          </button>
        ))}
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border-2 ${
            selectedCategory === null
              ? "bg-muted border-muted-foreground/20 text-foreground"
              : "bg-transparent border-border text-muted-foreground hover:bg-secondary"
          }`}
        >
          {t('home.allProducts')}
        </button>
      </div>
    </div>
  );
}
