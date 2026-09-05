// controllers/parkingController.js
import ParkingSlot from "../models/parkingSlot.js";
import { Op } from "sequelize";

export const createParkingSlot = async (req, res) => {
    try {
        const {
            title,
            description,
            parkingType,
            totalSlots,
            pricePerHour,
            pricePerDay,
            pricePerMonth,
            address,
            latitude,
            longitude,
            startTime,
            endTime,
        } = req.body;

        const owner_id = req.user.client_id;
        const images = req.files ? req.files.map((file) => file.path.replace(/\\/g, "/")) : [];

        const newSlot = await ParkingSlot.create({
            owner_id,
            title,
            description,
            parkingType,
            totalSlots,
            pricePerHour,
            pricePerDay,
            pricePerMonth,
            address,
            latitude,
            longitude,
            images,
            startTime,
            endTime,
            isApproved: true, // Auto-approved for now as per user request
        });

        res.status(201).json({ message: "Parking slot listed successfully and is now live!", data: newSlot });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllParkingSlots = async (req, res) => {
    try {
        const { type, minPrice, maxPrice, lat, lng, radius } = req.query;
        let where = { isActive: true, isApproved: true };

        if (type) where.parkingType = type;
        if (minPrice || maxPrice) {
            where.pricePerHour = {
                [Op.between]: [minPrice || 0, maxPrice || 1000000],
            };
        }

        // Radius search logic can be implemented here if needed, or left to frontend/client-side filter
        // For now, simple list
        const slots = await ParkingSlot.findAll({ where });
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyParkingSlots = async (req, res) => {
    try {
        const owner_id = req.user.client_id;
        const slots = await ParkingSlot.findAll({ where: { owner_id } });
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getParkingSlotById = async (req, res) => {
    try {
        const slot = await ParkingSlot.findByPk(req.params.id);
        if (!slot) return res.status(404).json({ message: "Parking slot not found" });
        res.json(slot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateParkingSlot = async (req, res) => {
    try {
        const slot = await ParkingSlot.findByPk(req.params.id);
        if (!slot) return res.status(404).json({ message: "Parking slot not found" });

        if (slot.owner_id !== req.user.client_id) {
            return res.status(403).json({ message: "Not authorized to update this slot" });
        }

        const updateData = { ...req.body };
        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map((file) => file.path.replace(/\\/g, "/"));
        }

        await slot.update(updateData);
        res.json({ message: "Parking slot updated successfully", data: slot });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteParkingSlot = async (req, res) => {
    try {
        const slot = await ParkingSlot.findByPk(req.params.id);
        if (!slot) return res.status(404).json({ message: "Parking slot not found" });

        if (slot.owner_id !== req.user.client_id) {
            return res.status(403).json({ message: "Not authorized to delete this slot" });
        }

        await slot.destroy();
        res.json({ message: "Parking slot deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleActivity = async (req, res) => {
    try {
        const slot = await ParkingSlot.findByPk(req.params.id);
        if (!slot) return res.status(404).json({ message: "Parking slot not found" });

        if (slot.owner_id !== req.user.client_id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        slot.isActive = !slot.isActive;
        await slot.save();
        res.json({ message: `Parking slot is now ${slot.isActive ? "active" : "inactive"}`, data: slot });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
