import { OSSService } from '@midwayjs/oss';
import { Provide, Inject } from '@midwayjs/core';

import { join } from 'path';

import * as fs from 'fs/promises';

@Provide()
export class OSS_Service {
	@Inject()
	ossService: OSSService;

	async uploadBase64(base64: string, filename: string) {
		try {
			// 解码 Base64 数据为 Buffer
			const fileBuffer = Buffer.from(base64, 'base64');

			// 生成本地文件路径
			const localFilePath = join(__dirname, '../uploads', filename);
			console.log("本地文件路径:", localFilePath);

			// 将 Buffer 保存为本地文件
			console.log("开始保存到本地...");
			await fs.writeFile(localFilePath, fileBuffer); // 直接使用 promises API
			console.log("文件成功保存到本地");

			// 上传文件到 OSS
			console.log("开始上传到 OSS...");
			const ossPath = `/uploads/${new Date().toISOString().split('T')[0]}/${filename}`;
			const result = await this.ossService.put(ossPath, localFilePath);
			console.log("OSS 上传结果:", result);

			// 删除本地文件（如果需要）
			console.log("开始删除本地文件...");
			await fs.unlink(localFilePath);
			console.log("本地文件删除成功");

			return {
				success: true,
				url: result.url,
			};
		} catch (error) {
			console.error("文件上传失败:", error);
			throw new Error('文件上传失败');
		}
	}
}
