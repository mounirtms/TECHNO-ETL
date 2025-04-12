
<script>
// DataLayer GA4
// Pour avoir des informations complémentaires (variables valeurs etc) contacter ocadoret@clever-age.com
// Ce dataLayer Plan est à intégrer sur l'ensemble des pages ou cela est nécessaire.
// Le signe "|"" signifie "ou"
// Si la variable ne peut pas être alimentée dans le contexte courant, ne pas la mentionner ou mettre *undefined* comme valeur.
// Si la valeur de la variable est entourée d'accolades '{}' il s'agit d'une valeur dynamique
// Si vous voyez "...", cela signifie que nous n'avons pas pu lister toutes les valeurs attendues.
// Pour chacune des variables et des valeurs, respecter la casse des valeurs


// Ce dataLayer doit toujours être le premier dataLayer déclenché
// Ce dataLayer doit être présent sur l'ensemble des pages du site

dataLayer.push({
  event: "dataLayer_ready", // Toujours "dataLayer_ready"
  environment: "prod", // Retourne le nom de l'environnement
  language: "fr", // Retourne la langue du site
  status_code: "200|404|303|500|...", // Retourne le statut HTTP de la page
  user_ID: "1234", // Identifiant unique de l'utilisateur
  full_url: "https://technostationery.com/?srsltid=AfmBOopH-R39rjR-6c3ceuZG6HtHzq4gOh17QAS42AhTfetok8Xv_gLc" // URL complète avec tous les paramètres
});


// Ce dataLayer se déclenche à chaque commande effectuée
dataLayer.push({
  event: "purchase", // Toujours "purchase"
  currency: "DZD", // Devise du panier, toujours DZD
  value: 150, // Prix du panier taxes incluses
  transaction_id: "000005698", // Retourne l'id de transaction
  shipping: 700, // Frais de transport liés à la transaction
  tax: 100, // Taxes liées à la transaction
  items: [
    {
      item_id: "1140651137", // Retourne l'Id unique du produit principal (SKU)
      item_name: "CISEAUX SCOLAIRE 12.7 cm FLEX TECHNO", // Retourne le nom du produit parent
      affiliation: "FournisseurX", // Retourne le nom du fournisseur associé au produit
      coupon: "AVRIL2025", // Nom de code du bon de réduction associé au PANIER
      discount: 100, // Valeur monétaire du bon de réduction associé au produit
      index: 1, // Position du produit dans le listing
      item_brand: "BIC", // Marque du produit
      item_category: "Scolaire", // Catégorie niveau 1
      item_category2: "Colles, adhésifs & accessoires", // Catégorie niveau 2
      item_category3: "Colles liquides", // Catégorie niveau 3
      item_variant: "VIOLET", // Variant du produit
      location_id: "ID_Ouled_Fayet", // ID de l'emplacement physique associé à l'article
      price: 700, // Prix du produit
      quantity: 1 // Quantité d'articles
    },
    {
      item_id: "1140651138", // Retourne l'Id unique du produit principal (SKU)
      item_name: "CAHIER SPIRALE A4 TECHNO", // Retourne le nom du produit parent
      affiliation: "FournisseurY", // Retourne le nom du fournisseur associé au produit
      coupon: "PROMOSTYLO25", // Nom/code du bon de réduction associé au PANIER
      discount: 50, // Valeur monétaire du bon de réduction associé au produit
      index: 2, // Position du produit dans le listing
      item_brand: "Nom de la marque", // Marque du produit, toujours Jeff de Bruges
      item_category: "Scolaire", // Catégorie niveau 1
      item_category2: "Papeterie", // Catégorie niveau 2
      item_category3: "Cahiers", // Catégorie niveau 3
      item_variant: "ROUGE_100PAGES", // Variant du produit
      location_id: "ID_Ouled_Fayet", // ID de l'emplacement physique associé à l'article
      price: 350, // Prix du produit
      quantity: 2 // Quantité d'articles
    }
  ]
});


</script>