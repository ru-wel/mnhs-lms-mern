import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db_config.js';

const User = sequelize.define('users', {
    UID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    lrn: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    grlvl: { type: DataTypes.INTEGER, allowNull: false },
    strand: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    user_role: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW } 
    }, {
        timestamps: false
});

export default User;