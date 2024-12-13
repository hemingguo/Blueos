import { Get, Controller, Post, Body, Inject } from '@midwayjs/core';
import { OSS_Service } from '../service/oss.service';
import { ApiService } from '../service/api.service';
@Controller('/upload')
export class OSSController {

	@Inject()
	ossService: OSS_Service;

	@Inject()
	apiService: ApiService;

	public uploadedUrl: string = "";

	@Get('/home')
	async home(): Promise<string> {
		return 'Hello OSS!';
	}

	@Post('/')
	async upload(@Body() body: { base64: string; filename: string }) {
		const { base64, filename } = body;

		if (!base64 || !filename) {
			return {
				success: false,
				message: 'Missing required parameters: base64 or filename',
			};
		}

		try {
			console.log('开始处理上传请求...');
			const result = await this.ossService.uploadBase64(base64, filename);
			console.log('上传结果:', result);
			this.uploadedUrl = result.url;
			// return {
			// 	success: true,
			// 	url: result.url,
			// };
			if (this.uploadedUrl == "") {
				console.log("No URL available");
				return {
					success: false,
					message: 'No URL available',
				};
			}
			try {
				// 调用处理函数并获取返回值
				const processedText = await this.apiService.get_html_code(this.uploadedUrl);
				console.log("html: ", processedText);
				// 返回处理后的文本
				return {
					success: true,
					message: 'Processed successfully',
					data: processedText,
				};
			} catch (error) {
				console.error('Error processing URL:', error);
				return {
					success: false,
					message: 'Error processing the URL',
				};
			}
		} catch (error) {
			console.error('上传失败:', error);
			return {
				success: false,
				message: `Upload failed: ${error.message}`,
			};
		}
	}

	// @Get('/')
	// async get_html(): Promise<any> {
	// 	if (this.uploadedUrl == "") {
	// 		console.log("No URL available");
	// 		return {
	// 			success: false,
	// 			message: 'No URL available',
	// 		};
	// 	}
	// 	try {
	// 		// 调用处理函数并获取返回值
	// 		const processedText = this.apiService.get_html_code(this.uploadedUrl);

	// 		// 返回处理后的文本
	// 		return {
	// 			success: true,
	// 			message: 'Processed successfully',
	// 			data: processedText,
	// 		};
	// 	} catch (error) {
	// 		console.error('Error processing URL:', error);
	// 		return {
	// 			success: false,
	// 			message: 'Error processing the URL',
	// 		};
	// 	}
	// }

}