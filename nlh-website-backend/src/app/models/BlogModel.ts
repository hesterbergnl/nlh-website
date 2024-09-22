import sequelize from "../../utils/sequelize";
import { DataTypes, Model } from 'sequelize';
import { BlogAttributes } from "../../utils/types";

interface BlogInstance extends Model<BlogAttributes, BlogAttributes>, BlogAttributes {}

const Blog = sequelize.define<BlogInstance>('blog', {
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
});

export default Blog;