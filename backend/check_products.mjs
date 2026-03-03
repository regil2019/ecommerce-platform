import db from "./src/config/database.js";
import Product from "./src/models/Product.js";

const products = await Product.findAll({
    attributes: ["id", "name", "stock", "isActive", "price"],
    raw: true,
    limit: 15
});
console.log(JSON.stringify(products, null, 2));
console.log("Total:", products.length);
await db.close();
