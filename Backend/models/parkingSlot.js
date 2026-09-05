// models/parkingSlot.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import Client from "./client.js";

const ParkingSlot = sequelize.define(
    "ParkingSlot",
    {
        slot_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        owner_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Client,
                key: "client_id",
            },
            allowNull: false,
        },
        title: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
        parkingType: {
            type: DataTypes.ENUM("Car", "Bike", "Cycle", "Truck"),
            defaultValue: "Car",
        },
        totalSlots: { type: DataTypes.INTEGER, defaultValue: 1 },
        pricePerHour: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
        pricePerDay: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
        pricePerMonth: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
        address: { type: DataTypes.STRING, allowNull: false },
        latitude: { type: DataTypes.DECIMAL(10, 8), allowNull: false },
        longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: false },
        images: {
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
                const value = this.getDataValue("images");
                return value ? JSON.parse(value) : [];
            },
            set(value) {
                this.setDataValue("images", JSON.stringify(value));
            },
        },
        isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
        isApproved: { type: DataTypes.BOOLEAN, defaultValue: false }, // Admin approval
        startTime: { type: DataTypes.TIME, defaultValue: "00:00:00" },
        endTime: { type: DataTypes.TIME, defaultValue: "23:59:59" },
    },
    {
        tableName: "parking_slots",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

ParkingSlot.belongsTo(Client, { foreignKey: "owner_id", as: "owner" });

export default ParkingSlot;
