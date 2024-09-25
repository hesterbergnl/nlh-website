import sequelize from "../../utils/sequelize";
import { DataTypes, Model } from 'sequelize';

class Blog extends Model {
    public id!: number;
    public title!: string;
    public description!: string;
    public content!: string;
    public published!: boolean;
    public publishedAt!: Date;
    public category!: string;
    public createdById!: number;
}

Blog.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false
        },
        published: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        publishedAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false
        },
        createdById: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: 'Blog',
        tableName: 'blogs',
        timestamps: true,
    }
);

export default Blog;