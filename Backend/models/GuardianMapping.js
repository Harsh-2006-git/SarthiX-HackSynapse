import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Client from './client.js';

const GuardianMapping = sequelize.define('GuardianMapping', {
    mapping_id: {
        type: DataTypes.INTEGER,
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
    guardian_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Client,
            key: 'client_id'
        },
        onDelete: 'CASCADE'
    },
    is_approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'guardian_mappings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'guardian_id']
        }
    ]
});

// Associations
GuardianMapping.belongsTo(Client, { foreignKey: 'user_id', as: 'user' });
GuardianMapping.belongsTo(Client, { foreignKey: 'guardian_id', as: 'guardian' });
Client.hasMany(GuardianMapping, { foreignKey: 'user_id', as: 'guardians' });
Client.hasMany(GuardianMapping, { foreignKey: 'guardian_id', as: 'protégés' });

export default GuardianMapping;
