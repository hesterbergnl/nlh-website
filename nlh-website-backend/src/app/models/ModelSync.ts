import Blog from './BlogModel';
import User from './UserModel';
import sequelize from '../../utils/sequelize';

User.hasMany(Blog)
Blog.hasOne(User)
sequelize.sync( { alter: true } )


export { Blog, User }