import sequelize from "../../utils/sequelize";
import { DataTypes, Model } from 'sequelize';

class User extends Model {
    public id!: number;
    public username!: string;
    public name!: string;
    public email!: string;
    public password!: string;
    public createdById!: number;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdById: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: false,
    }
);

export default User;