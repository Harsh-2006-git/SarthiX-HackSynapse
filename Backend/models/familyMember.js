// models/familyMember.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import Client from "./client.js";

const FamilyMember = sequelize.define(
    "FamilyMember",
    {
        member_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        client_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Client,
                key: "client_id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        name: { type: DataTypes.STRING, allowNull: false },
        relationship: { type: DataTypes.STRING, allowNull: false },
        unique_code: { type: DataTypes.STRING, allowNull: false, unique: true },
        qr_image: { type: DataTypes.TEXT, allowNull: true },
    },
    {
        tableName: "family_members",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

// Association
FamilyMember.belongsTo(Client, { foreignKey: "client_id", as: "client" });
Client.hasMany(FamilyMember, { foreignKey: "client_id", as: "familyMembers" });

export default FamilyMember;
