import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { LineBotService } from './line-bot.service'; // 假設你的 AppService 在相同的目錄
import { Request, Response } from 'express'; // 引入 Express 的 Response 型別
import { WebhookEvent } from '@line/bot-sdk';
import { BroadcastService } from './broadcast.service';
@Controller('line')
export class AppController {
    constructor(
        private readonly lineBotService: LineBotService,
        private readonly broadcastService: BroadcastService,
        ) {}
    
    @Post('webhook')
    async handleWebhook(@Req() req: Request, @Res() res: Response): Promise<void> {
        const events = req.body.events;
        // 確保事件存在
        if (!events || events.length === 0) {
        res.status(200).send('No events');
        return;
        }
        // 處理所有事件
        await Promise.all(events.map((event:WebhookEvent) => this.lineBotService.handleEvent(event)));
        res.status(200).send('OK');
    }



    @Post('push-message')
    async pushMessage(@Req() req: Request, @Res() res: Response): Promise<void> {
        const { message } = req.body;

        if (!message) {
            res.status(400).json({ success: false, message: 'Message is required' });
            return;
        }

        const userId = process.env.USER_ID; // 預設目標使用者
        if (!userId) {
            res.status(500).json({ success: false, message: 'USER_ID is not defined in .env' });
            return;
        }

        try {
            
            await this.lineBotService.pushMessage(userId, message);
            res.status(200).json({ success: true, message: 'Message sent successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    @Post('schedule-message') // 新增動態排程的路由
    async scheduleMessage(@Body() body: { time: string; message: string }, @Res() res: Response): Promise<void> {
        const { time, message } = body;

        if (!time || !message) {
            res.status(400).json({ success: false, message: 'Time and message are required' });
            return;
        }

        const scheduleTime = new Date(time);
        if (isNaN(scheduleTime.getTime())) {
            res.status(400).json({ success: false, message: 'Invalid time format' });
            return;
        }

        const now = new Date();
        if (scheduleTime <= now) {
            res.status(400).json({ success: false, message: 'Scheduled time must be in the future' });
            return;
        }

        try {
            this.broadcastService.scheduleMessageAtSpecificTime(scheduleTime, message);
            res.status(200).json({ success: true, message: `Message scheduled for ${scheduleTime.toISOString()}` });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    @Post('immediate-broadcast')
    async immediateBroadcast(@Body() body: { message: string }, @Res() res: Response): Promise<void> {
        const { message } = body;

        if (!message) {
            res.status(400).json({ success: false, message: 'Message is required' });
            return;
        }

        try {
        // 呼叫廣播服務來立即發送訊息
        await this.broadcastService.broadcastMessage(message);
            res.status(200).json({ success: true, message: 'Broadcast message sent successfully' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}
