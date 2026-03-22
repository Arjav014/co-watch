import { ChatMessage, IChatMessage } from './chat.model';

export const saveMessage = async (
    roomId: string,
    userId: string,
    username: string,
    message: string
): Promise<IChatMessage> => {
    const newMsg = await ChatMessage.create({
        roomId,
        userId,
        username,
        message,
    });
    return newMsg;
};

export const getMessagesByRoom = async (roomId: string): Promise<IChatMessage[]> => {
    return await ChatMessage.find({ roomId }).sort({ timestamp: 1 });
};

export const deleteMessagesByRoom = async (roomId: string) => {
    await ChatMessage.deleteMany({ roomId });
};
