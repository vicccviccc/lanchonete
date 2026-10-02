'use strict';

const SITE_CONFIG = Object.freeze({
  whatsapp: '558491217386',
  whatsappDisplay: '+55 84 9121-7386',
  mapsUrl: 'https://maps.app.goo.gl/Zz4Qt9jeWU53BLaF8',
  hours: 'Seg, ter e qui–dom · 18h às 00h · quarta fechado'
});

const EXTRA_OPTIONS = Object.freeze([
  { id: 'ovo-extra', name: 'Ovo', price: 3 },
  { id: 'hamburguer-extra', name: 'Carne de hambúrguer', price: 3 }
]);

const MENU = Object.freeze([
  {
    category: 'Hambúrgueres',
    products: [
      { id: 'x-baiano', name: 'X-Baiano', price: 14, ingredients: ['Pão','Hambúrguer','Ovo','Queijo','Presunto','Tomate','Alface','Milho','Ervilha','Batata palha'], customizable: true },
      { id: 'x-frango', name: 'X-Frango', price: 19, ingredients: ['Pão','Hambúrguer','Frango','Ovo','Queijo','Presunto','Tomate','Alface','Milho','Ervilha','Batata palha'], customizable: true },
      { id: 'x-calabresa', name: 'X-Calabresa', price: 19, ingredients: ['Pão','Hambúrguer','Calabresa','Ovo','Queijo','Presunto','Tomate','Alface','Milho','Ervilha','Batata palha'], customizable: true },
      { id: 'x-bacon', name: 'X-Bacon', price: 19, ingredients: ['Pão','Hambúrguer','Bacon','Ovo','Queijo','Presunto','Tomate','Alface','Milho','Ervilha','Batata palha'], customizable: true },
      { id: 'x-tudo', name: 'X-Tudo', price: 22, ingredients: ['Pão','Hambúrguer','Frango','Calabresa','Bacon','Ovo','Queijo','Presunto','Tomate','Alface','Milho','Ervilha','Batata palha'], customizable: true }
    ]
  },
  {
    category: 'Lanches especiais',
    products: [
      { id: 'baiano-kids', name: 'Baiano Kids', price: 9, ingredients: ['Carne','Queijo','Presunto','Batata palha'], customizable: true },
      { id: 'misto', name: 'Misto', price: 9, ingredients: ['Queijo','Presunto'], customizable: true }
    ]
  },
  {
    category: 'Batata frita',
    products: [
      { id: 'batata-p', name: 'Batata frita P', price: 15, ingredients: [], customizable: false },
      { id: 'batata-g', name: 'Batata frita G', price: 20, ingredients: [], customizable: false }
    ]
  },
  {
    category: 'Bebidas',
    products: [
      { id: 'agua-500', name: 'Água mineral 500ml', price: 3, ingredients: [], customizable: false },
      { id: 'agua-gas-500', name: 'Água mineral c/ gás 500ml', price: 4, ingredients: [], customizable: false },
      { id: 'refri-200', name: 'Refrigerante 200ml', price: 3, ingredients: [], customizable: false },
      { id: 'refri-ks-200', name: 'Refrigerante KS 200ml', price: 4, ingredients: [], customizable: false },
      { id: 'refri-ks-290', name: 'Refrigerante KS 290ml', price: 5, ingredients: [], customizable: false },
      { id: 'refri-lata-350', name: 'Refrigerante lata 350ml', price: 6, ingredients: [], customizable: false },
      { id: 'refri-600', name: 'Refrigerante 600ml', price: 7, ingredients: [], customizable: false },
      { id: 'coca-1l', name: 'Coca-Cola 1L', price: 9, ingredients: [], customizable: false },
      { id: 'pepsi-guarana-1l', name: 'Pepsi ou Guaraná 1L', price: 7, ingredients: [], customizable: false },
      { id: 'refri-2l', name: 'Refrigerante 2L', price: 16, ingredients: [], customizable: false },
      { id: 'suco-extra', name: 'Suco extra', price: 3, ingredients: [], customizable: false }
    ]
  },
  {
    category: 'Sobremesas',
    products: [
      { id: 'sobremesa-dia', name: 'Sobremesas do dia', price: null, ingredients: [], customizable: false, availabilityOnly: true }
    ]
  }
]);

function allProducts() {
  return MENU.flatMap(group => group.products.map(product => ({ ...product, category: group.category })));
}

function productById(id) {
  return allProducts().find(product => product.id === id) || null;
}
