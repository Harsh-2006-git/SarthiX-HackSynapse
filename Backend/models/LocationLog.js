import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Client from './client.js';

const LocationLog = sequelize.define('LocationLog', {
    log_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Client,
            key: 'client_id'
        },
        onDelete: 'CASCADE'
    },
    lat: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false
    },
    lng: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'location_logs',
    timestamps: false,
    indexes: [
        {
            fields: ['user_id', 'timestamp']
        }
    ]
});

LocationLog.belongsTo(Client, { foreignKey: 'user_id' });
Client.hasMany(LocationLog, { foreignKey: 'user_id' });

export default LocationLog;
