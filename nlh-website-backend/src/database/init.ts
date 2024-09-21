import sequelize from './sequelize';
import Blog from './app/models/BlogModel';

const init = async () => {
    try {
        await sequelize.authenticate();
        await Blog.sync();
        console.log('Connection to the database has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

export default init;