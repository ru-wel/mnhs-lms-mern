import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db_config.js';

const Module = sequelize.define('modules', {
    MID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    grlvl: { type: DataTypes.INTEGER, allowNull: false },
    strand: { type: DataTypes.STRING, allowNull: false },
    type: { type:DataTypes.STRING, allowNull: false },
    subject: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    file_name: { type: DataTypes.STRING, allowNull: true },
    file_data: { type: DataTypes.BLOB('long'), allowNull: true },
    upload_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW }, 
    uploader: { type: DataTypes.STRING, allowNull: false },
    progress: { type: DataTypes.STRING, allowNull: false, defaultValue: "Incomplete" }
    }, {
        timestamps: false
});

export default Module;