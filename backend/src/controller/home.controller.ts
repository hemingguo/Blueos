import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {
	@Get('/home')
	async home(): Promise<string> {
		return 'Hello Midwayjs!';
	}

}
