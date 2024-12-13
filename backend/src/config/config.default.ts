import { MidwayConfig } from '@midwayjs/core';

export default {
	// use for cookie sign key, should change to your own and keep security
	keys: '*',
	koa: {
		port: 7001,
	},
	oss: {
		client: {
			region: '*', // 替换为你的OSS区域
			accessKeyId: '*', // 替换为你的AccessKeyId
			accessKeySecret: '*', // 替换为你的AccessKeySecret
			bucket: '*', // 替换为你的Bucket名称
			endpoint: '*',
			timeout: '60s',
		},
	},
	cors: {
		origin: '*',  // 来源
		credentials: true,
	},
	controller: {
		directories: ['src/controller'],
	},
} as MidwayConfig;
