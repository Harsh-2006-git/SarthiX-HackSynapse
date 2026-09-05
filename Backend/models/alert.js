import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import Client from "./client.js";

const Alert = sequelize.define(
  "Alert",
  {
    alert_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM("info", "warning", "critical"),
      defaultValue: "info",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Client,
        key: "client_id",
      },
    },
  },
  {
    tableName: "alerts",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Client.hasMany(Alert, { foreignKey: "created_by" });
Alert.belongsTo(Client, { foreignKey: "created_by" });

export default Alert;
