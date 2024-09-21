const app = require('./app');
const config = require('./config/config');
const logger = require('./app/middlewares/logger.middleware');

app.listen(config.PORT, () => {
    console.log(`Server running on  on port ${config.PORT}`);
});