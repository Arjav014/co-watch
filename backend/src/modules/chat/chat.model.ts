import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
    roomId: string;
    userId: string;
    username: string;
    message: string;
    timestamp: Date;
}

const chatMessageSchema = new Schema<IChatMessage>({
    roomId: { type: String, required: true },
    userId: { type: String, required: true },
    username: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
