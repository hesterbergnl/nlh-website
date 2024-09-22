import sequelize from './sequelize';
// import { Blog, User } from '../app/models/ModelSync';

const init = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

export default init;