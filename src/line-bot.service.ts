import { Injectable } from '@nestjs/common';
import { Client, MiddlewareConfig, WebhookEvent } from '@line/bot-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class LineBotService {
  private client: Client;

  constructor() {
    this.client = new Client({
      channelAccessToken: process.env.ACCESS_TOKEN,
      channelSecret: process.env.CHANNEL_SECRET,
    });
  }

  // 傳送訊息給特定使用者
  async pushMessage(userId: string, message: string): Promise<void> {
    await this.client.pushMessage(userId, {
      type: 'text',
      text: message,
    });
  }

  // 回覆訊息
  async replyMessage(replyToken: string, message: string): Promise<void> {
    await this.client.replyMessage(replyToken, {
      type: 'text',
      text: message,
    });
  }

  // 處理 Webhook 事件
  handleEvent(event: WebhookEvent): Promise<void> {
    if (event.type === 'message' && event.message.type === 'text') {
      const replyToken = event.replyToken;
      const userMessage = event.message.text;
      return this.replyMessage(replyToken, `你剛才說: ${userMessage}`);
    }
    return Promise.resolve();
  }
}
