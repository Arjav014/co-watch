import { Router } from 'express';
import { createRoom, joinRoom, getRoom, leaveRoom, listRooms, updatePlayback } from './room.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/create', createRoom);
router.post('/join', joinRoom);
router.post('/leave', leaveRoom);
router.get('/discover', listRooms);
router.get('/', listRooms);
router.patch('/:roomId/playback', updatePlayback);
router.get('/:roomId', getRoom);

export default router;
