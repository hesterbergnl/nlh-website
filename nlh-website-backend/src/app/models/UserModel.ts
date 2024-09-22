import sequelize from "../../utils/sequelize";
import { DataTypes, Model } from 'sequelize';
import { UserAttributes } from "../../utils/types";

interface UserInstance extends Model<UserAttributes, UserAttributes>, UserAttributes {}

const User = sequelize.define<UserInstance>('user', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createdById: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

export default User;