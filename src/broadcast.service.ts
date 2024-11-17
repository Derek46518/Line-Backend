import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
@Injectable()
export class BroadcastService {
    private readonly LINE_BROADCAST_URL = 'https://api.line.me/v2/bot/message/broadcast';
    private readonly ACCESS_TOKEN = process.env.ACCESS_TOKEN;
    private readonly logger = new Logger(BroadcastService.name);
     // 廣播訊息功能
    async broadcastMessage(text: string): Promise<void> {
        try {
            const response = await axios.post(
                this.LINE_BROADCAST_URL,
                {
                messages: [
                    {
                    type: 'text',
                    text: text,
                    },
                ],
                },
                {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.ACCESS_TOKEN}`,
                },
                },
            );

            if (response.status === 200) {
                this.logger.log('Broadcast message sent successfully');
            } else {
                this.logger.error(`Broadcast failed with status ${response.status}`);
            }
        } catch (error) {
            this.logger.error('Error broadcasting message:', error.message);
            throw new Error('Failed to broadcast message');
        }
    }

    // 自動廣播功能（每天中午12點執行）
    @Cron(CronExpression.EVERY_DAY_AT_NOON)
    async handleAutoBroadcast() {
        const text = '親愛的主人早安，今天是一個開心的一天，期待我們在一起的生活喔!';
        this.logger.log('Starting automatic broadcast...');
        await this.broadcastMessage(text);
    }

    // 設置動態計時器
    scheduleMessageAtSpecificTime(date: Date, message: string) {
    const now = new Date();
    const delay = date.getTime() - now.getTime();

    if (delay <= 0) {
      this.logger.warn('The scheduled time has already passed.');
      return;
    }

    this.logger.log(`Message scheduled to be sent at ${date.toISOString()}`);
    setTimeout(async () => {
        await this.broadcastMessage(message);
        this.logger.log(`Message sent at ${new Date().toISOString()}`);
    }, delay);
    }


}