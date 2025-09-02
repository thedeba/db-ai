import mongoose, { Schema, Document } from "mongoose";

interface IChatMessage {
  content: string;
  isUser: boolean;
}

export interface IChatLog extends Document {
  user: string; // user id or email
  title: string;
  messages: IChatMessage[];
  createdAt: Date;
}

const ChatLogSchema = new Schema<IChatLog>({
  user: { type: String, required: true },
  title: { type: String, required: true },
  messages: [
    {
      content: { type: String, required: true },
      isUser: { type: Boolean, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const ChatLog = mongoose.models.ChatLog || mongoose.model<IChatLog>("ChatLog", ChatLogSchema);
export default ChatLog;
