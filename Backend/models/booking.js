// models/booking.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import Client from "./client.js";
import ParkingSlot from "./parkingSlot.js";

const Booking = sequelize.define(
    "Booking",
    {
        booking_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        parking_slot_id: {
            type: DataTypes.INTEGER,
            references: {
                model: ParkingSlot,
                key: "slot_id",
            },
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Client,
                key: "client_id",
            },
            allowNull: false,
        },
        startTime: { type: DataTypes.DATE, allowNull: false },
        endTime: { type: DataTypes.DATE, allowNull: false },
        totalAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
        status: {
            type: DataTypes.ENUM("Pending", "Confirmed", "Completed", "Cancelled"),
            defaultValue: "Pending",
        },
        paymentStatus: {
            type: DataTypes.ENUM("Pending", "Paid", "Failed"),
            defaultValue: "Pending",
        },
        paymentId: { type: DataTypes.STRING, allowNull: true },
        qrCode: { type: DataTypes.TEXT, allowNull: true },
        vehicleNumber: { type: DataTypes.STRING, allowNull: false },
    },
    {
        tableName: "bookings",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

Booking.belongsTo(ParkingSlot, { foreignKey: "parking_slot_id", as: "parkingSlot" });
Booking.belongsTo(Client, { foreignKey: "user_id", as: "user" });

export default Booking;
