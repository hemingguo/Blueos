import { Inject, Controller, Get, Query } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ApiService } from '../service/api.service';
@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  apiService: ApiService;

  @Get('/get_user')
  async getUser(@Query('uid') uid) {
    const user = await this.apiService.getUser({ uid });
    return { success: true, message: 'OK', data: user };
  }
}
