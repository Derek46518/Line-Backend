import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { LineBotService } from './line-bot.service'; // 假設你的 AppService 在相同的目錄
import { Request, Response } from 'express'; // 引入 Express 的 Response 型別
import { WebhookEvent } from '@line/bot-sdk';

@Controller('line')
export class AppController {
    constructor(private readonly lineBotService: LineBotService) {}
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
    
}
