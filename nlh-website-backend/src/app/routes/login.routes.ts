import { Router} from 'express';
import { loginHandler } from '../controllers/LoginController';
import { validateLoginEntry } from '../../utils/validation';

const loginRouter = Router();

loginRouter.post('/', validateLoginEntry, loginHandler);

export default loginRouter;