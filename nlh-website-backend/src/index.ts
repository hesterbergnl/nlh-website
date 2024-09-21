import app from './app';
import config from './config/config';
import logger from './app/middlewares/logger.middleware';

app.listen(config.PORT, () => {
    logger.info(`Server running on  on port ${config.PORT}`);
});