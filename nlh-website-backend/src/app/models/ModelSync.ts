import Blog from './BlogModel';
import User from './UserModel';
import sequelize from '../../utils/sequelize';

User.hasMany(Blog)
Blog.belongsTo(User, { foreignKey: 'createdById' })
User.hasOne(User)

sequelize.sync( { alter: true } )


export { Blog, User }