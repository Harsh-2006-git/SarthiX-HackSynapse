import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Client from './client.js';

const SOSAlert = sequelize.define('SOSAlert', {
    sos_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Client,
            key: 'client_id'
        }
    },
    lat: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false
    },
    lng: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'dispatched', 'resolved'),
        defaultValue: 'active'
    },
    nearby_data: {
        type: DataTypes.JSON, // Stores nearby services for static record
        allowNull: true
    }
}, {
    tableName: 'sos_alerts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

SOSAlert.belongsTo(Client, { foreignKey: 'client_id' });

export default SOSAlert;
