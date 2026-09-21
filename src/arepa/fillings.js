export const fillings = {
  reinaPepiada: {
    label: "Reina Pepiada",
    desc: "Pollo guisado y aguacate cremoso",
    ingredients: ["chicken", "avocado"],
  },
  pelua: {
    label: "Pelúa",
    desc: "Carne mechada con queso amarillo derretido",
    ingredients: ["beef", "quesoAmarillo"],
  },
  domino: {
    label: "Dominó",
    desc: "Caraotas negras con queso blanco fresco",
    ingredients: ["frijoles", "quesoBlanco"],
  },
  perico: {
    label: "Perico",
    desc: "Huevos revueltos con tomate y cebolla",
    ingredients: ["huevo", "tomate", "cebolla"],
  },
  carneMechada: {
    label: "Carne Mechada",
    desc: "Carne mechada jugosa con queso blanco",
    ingredients: ["beef", "quesoBlanco"],
  },
};

// Each ingredient enters with its own personality instead of a single shared animation.
export const ingredientAnim = {
  chicken: "slide-right",
  avocado: "pop-slide",
  beef: "slide-left",
  quesoAmarillo: "fall",
  quesoBlanco: "fall",
  frijoles: "rise",
  huevo: "bounce",
  tomate: "pop",
  cebolla: "pop-soft",
};

export const ingredientElementIds = {
  chicken: "ingChicken",
  avocado: "ingAvocado",
  beef: "ingBeef",
  quesoAmarillo: "ingQuesoAmarillo",
  quesoBlanco: "ingQuesoBlanco",
  frijoles: "ingFrijoles",
  huevo: "ingHuevo",
  tomate: "ingTomate",
  cebolla: "ingCebolla",
};

export const allIngredientKeys = Object.keys(ingredientElementIds);
