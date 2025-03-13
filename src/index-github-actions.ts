// github actions entrypoint

import crypto from 'node:crypto';
import { loginPayload, DailyTask } from './service.js';
import { serverChan } from './serverChan.js'; // 假设 serverChan 函数在 serverChan.js 中

async function handler(event: Event) {
    const userPayload: loginPayload = {
        account_name: process.env.ACCOUNT_NAME as string,
        passwd: crypto.createHash('md5').update(process.env.PASSWORD as string).digest('hex'),
    };

    try {
        // 执行每日任务
        await DailyTask(userPayload);

        // 任务成功，发送成功通知
        const sendkey = process.env.SERVERCHAN_SENDKEY as string; // 从环境变量获取 sendkey
        const title = '每日任务完成';
        const content = '所有每日任务已成功执行。';
        await serverChan(sendkey, title, content);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Success' }),
        };
    } catch (error) {
        // 任务失败，发送失败通知
        const sendkey = process.env.SERVERCHAN_SENDKEY as string; // 从环境变量获取 sendkey
        const title = '每日任务失败';
        const content = `任务执行失败，错误信息：${error instanceof Error ? error.message : '未知错误'}`;
        await serverChan(sendkey, title, content);

        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed', error: error instanceof Error ? error.message : '未知错误' }),
        };
    }
}

await handler({} as Event);
