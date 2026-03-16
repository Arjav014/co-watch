import { Router } from 'express';
import { createRoom, joinRoom, getRoom, leaveRoom, updatePlayback } from './room.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/create', createRoom);
router.post('/join', joinRoom);
router.post('/leave', leaveRoom);
router.patch('/:roomId/playback', updatePlayback);
router.get('/:roomId', getRoom);

export default router;
