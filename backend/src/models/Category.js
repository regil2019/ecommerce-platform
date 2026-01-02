import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Category = db.define("Category", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: "categories",
  timestamps: true,
});

export default Category;
