import { Sequelize } from 'sequelize';
import config from '../config/config'

// TODO: update the POSTGRES_URL type in the type declaration file
const sequelize: Sequelize = new Sequelize(config.POSTGRES_URI as string, {
    dialect: 'postgres',
});

export default sequelize;