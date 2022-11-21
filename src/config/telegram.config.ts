import { ITelegram } from '../telegram/interfaces/telegram.interface';

export const getTelegramConfig = (): ITelegram => ({
	chatId: '',
	token: '',
});