import { Provide } from '@midwayjs/core';
import * as fs from 'fs'; // 导入文件系统模块


// const prompt = `
// 要求:
// 0. 给出纯代码，不要有自然语言，直接写代码
// 1. 设计尺寸为466px
// 2. 使用flex布局
// 3. 单位只能使用px，不能使用百分比, vh等单位
// 4. 页面根标签要用body
// 5. 使用span作为文本标签
// 6. 必须将css写在style标签里面，css 不需要考虑兼容各自浏览器
// 7. 不使用图片资源
// 8.生成的style里面不能出现auto，必须列举出每一条边的长度
// 9.生成的style里面一次只能定义一个类的规则，一个类不能定义多次规则；
//  `
// 	;
// const extractHtmlFromMarkdown = (markdownText: string): string => {
// 	const htmlRegExp = /```html\n([\s\S]+?)\n```/g;

// 	let htmlCode = "";
// 	let match: RegExpExecArray | null;

// 	while ((match = htmlRegExp.exec(markdownText)) !== null) {
// 		htmlCode += match[1] + "\n\n";
// 	}

// 	return htmlCode;
// };


import { IUserOptions } from '../interface';
const OpenAI = require("openai");
require("dotenv").config();
const openai = new OpenAI({
	apiKey: process.env.DASHSCOPE_API_KEY,
	baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});


@Provide()
export class ApiService {
	async getUser(options: IUserOptions) {
		return {
			uid: options.uid,
			username: 'mockedName',
			phone: '12345678901',
			email: 'xxx.xxx@xxx.com',
		};
	}
	async get_html_code(image_url: string) {
		const completion = await openai.chat.completions.create({
			model: "qwen-vl-max",
			messages: [{
				role: "user", content: [
					{ type: "image_url", image_url: { "url": image_url } },
					{
						type: "text", text: "根据网页图片的内容生成对应的html代码,\n\
            0. 给出纯代码，不要有自然语言，直接写代码\n\
            1. 设计尺寸为466px\n\
            2. 使用flex布局\n\
            3. 单位只能使用px,不能使用百分比, vh等单位\n\
            4. 页面根标签要用body\n\
            5. 使用span作为文本标签\n\
            6. 必须将css写在style标签里面,css 不需要考虑兼容各自浏览器\n\
            7. 不使用图片资源\n\
            8.生成的style里面不能出现auto,必须列举出每一条边的长度\n\
            9.生成的style里面一次只能定义一个类的规则,一个类不能定义多次规则;" }
				]
			}]
		});

		const testHtmlCode = completion.choices[0].message.content;
		const htmlCode = testHtmlCode.replace(/^```html\n/, '').replace(/\n```$/, '');

		// 从 html 代码中抽取 css 和 template
		function extractCssAndBodyFromHtml(htmlCode) {
			const cssRegex = /<style(?:\s+type="text\/css")?>([\s\S]+?)<\/style>/g;
			const bodyRegExp = /<body>([\s\S]+?)<\/body>/; // 匹配body标签中的HTML代码

			let cssCode = "";
			let bodyHtml = "";

			let match;
			while ((match = cssRegex.exec(htmlCode)) !== null) {
				cssCode += match[1];
			}

			const bodyMatch = htmlCode.match(bodyRegExp);
			if (bodyMatch) {
				bodyHtml = bodyMatch[1];
			}

			return { css: cssCode, template: bodyHtml };
		}

		// 创建 script 代码
		function createScriptCode() {
			return `
          export default {
            onInit() {
              console.log('onInit')
            }
          }
      `;
		}

		// 将 template、css、script 聚合成为蓝河 ux 代码
		function createUxCode(template, css, script) {
			return `
      <template>
        ${template.trim()}
      </template>
      <script>
        ${script.trim()}
      </script>
      <style>
        ${css.trim()}
      </style>
      `.trim(); // 最后再移除整个模板字符串两端的多余换行
		}

		// 替换标签，并添加原始标签名作为 class
		function replaceTag(htmlString, originalTag, newTag, classSet) {
			const pattern = new RegExp(
				`<${originalTag}(\\s[^>]*)?>(.*?)<\\/${originalTag}>`,
				"gs"
			);
			return htmlString.replace(pattern, (match, attributes = "", innerHtml) => {
				const hasClass = /\bclass="/.test(attributes); // 检查是否已有 class 属性
				if (hasClass) {
					classSet.add(originalTag); // 记录到 classSet 中
				}
				if (!hasClass) {
					// 如果没有 class，添加 class="${originalTag}"
					classSet.add(originalTag); // 记录到 classSet 中
					return `<${newTag} class="${originalTag}"${attributes}>${innerHtml}</${newTag}>`;
				}
				// 如果有 class，保留原 attributes
				return `<${newTag}${attributes}>${innerHtml}</${newTag}>`;
			});
		}

		// 根据 classSet 生成对应的基础 CSS 样式
		function generateCssForTags(classSet, baseStyles) {
			const cssMap = {};

			classSet.forEach((className) => {
				if (baseStyles[className]) {
					cssMap[className] = baseStyles[className];
				}
			});

			return cssMap;
		}

		// 合并原始 CSS 和动态生成的 CSS
		function mergeCss(originalCss, baseStyles) {
			const cssRegex = /([a-zA-Z0-9_-]+)\s*{\s*([^}]+)\s*}/g; // 修改为匹配所有选择器，包括非类选择器
			const existingCssMap = {};

			let match;
			while ((match = cssRegex.exec(originalCss)) !== null) {
				const className = match[1]; // 选择器名称
				const rules = match[2] // 规则部分
					.trim()
					.split(";")
					.filter(Boolean) // 去除空规则
					.reduce((acc, rule) => {
						const [property, value] = rule.split(":").map((s) => s.trim()); // 将每条规则拆成属性和值
						acc[property] = value; // 存储到字典中
						return acc;
					}, {});

				existingCssMap[className] = rules; // 将解析出的规则存入 existingCssMap
			}

			// 合并 baseStyles 到 existingCssMap
			Object.entries(baseStyles).forEach(([className, baseRules]) => {
				if (existingCssMap[className]) {
					// 源 CSS 中已有该类，添加基础样式中不存在的属性
					Object.entries(baseRules).forEach(([property, value]) => {
						if (!existingCssMap[className][property]) {
							existingCssMap[className][property] = value;
						}
					});
				} else {
					// 源 CSS 中没有该类，直接添加基础样式
					existingCssMap[className] = { ...(baseRules as { [key: string]: string }) };
				}
			});

			// 重新生成 CSS 字符串
			return Object.entries(existingCssMap)
				.map(
					([className, rules]) =>
						`.${className} {\n  ${Object.entries(rules)
							.map(([property, value]) => `${property}: ${value};`)
							.join("\n  ")}\n}`
				)
				.join("\n");
		}

		const tagMap = {
			h1: "text",
			h2: "text",
			h3: "text",
			h4: "text",
			h5: "text",
			h6: "text",
			p: "text",
			span: "text",
			button: "text",
			header: "div",
			main: "div",
			section: "div",
			footer: "div",
		};

		// 确保模板内容包裹到一个根<div>，并且根目录只有一个子节点
		function ensureSingleRootNode(templateHtml) {
			const cleanedHtml = templateHtml.trim();

			// 使用正则判断顶级节点
			const rootTagRegex = /<([a-zA-Z0-9]+)[^>]*>.*?<\/\1>/gs;
			const rootMatches = [...cleanedHtml.matchAll(rootTagRegex)];

			if (rootMatches.length === 1 && rootMatches[0][0].startsWith('<div class="root"')) {
				// 已经是单一的根<div class="root">，无需处理
				return cleanedHtml;
			}

			// 包裹到新的根<div class="root">中
			return `<div class="body">\n${cleanedHtml}\n</div>`;
		}


		// 格式化HTML内容，添加缩进
		function formatHtml(htmlString, indentLevel = 0) {
			const lines = [];
			//const indent = "  ".repeat(indentLevel); // 两个空格缩进
			const tagRegex = /(<\/?[^>]+>)/g;

			htmlString.split(tagRegex).forEach((part) => {
				const trimmed = part.trim();
				if (trimmed) {
					if (trimmed.startsWith("</")) {
						// 结束标签减少缩进
						indentLevel--;
					}
					lines.push(`${"  ".repeat(indentLevel)}${trimmed}`);
					if (trimmed.startsWith("<") && !trimmed.startsWith("</") && !trimmed.endsWith("/>")) {
						// 起始标签增加缩进
						indentLevel++;
					}
				}
			});

			return lines.join("\n");
		}

		// 包装并格式化HTML内容，确保根目录只有一个子节点<div>
		function wrapAndFormatHtml(templateHtml) {
			// 确保根目录只有一个子节点<div>
			const singleRootHtml = ensureSingleRootNode(templateHtml);
			return formatHtml(singleRootHtml, 1);
		}

		// 1. 从 HTML 代码中提取 CSS 和模板部分
		const { css, template } = extractCssAndBodyFromHtml(htmlCode);

		// 2. 生成动态的基础 CSS 样式
		const classSet = new Set();
		let updatedTemplate = template;

		Object.entries(tagMap).forEach(([originalTag, newTag]) => {
			updatedTemplate = replaceTag(updatedTemplate, originalTag, newTag, classSet);
		});


		// 3. 生成 CSS 样式
		const baseStyles = {
			h1: {
				"font-size": "50px",
				color: "#0000ff",
				"font-weight": "bold",
				"margin-bottom": "20px",
			},
			h2: {
				"font-size": "40px",
				color: "#333",
				"font-weight": "bold",
				"margin-bottom": "15px",
			},
			p: {
				"font-size": "16px",
				color: "#666",
				"margin-bottom": "10px",
			},
			button: {
				width: "100px",
				padding: "10px 20px",
				"text-align": "center"
			},
		};

		const generatedCss = generateCssForTags(classSet, baseStyles);

		// 4. 合并原始 CSS 和动态生成的 CSS
		const finalCss = mergeCss(css, generatedCss);

		//const catCss = finalCss + `\n.root {\n  flex-direction: column;\n}\n`;
		// 5. 拼接最终的蓝河 UX 代码
		const script = createScriptCode();
		const uxCode = createUxCode(wrapAndFormatHtml(updatedTemplate), finalCss, script);


		// 保存 uxCode 到文件
		const filePath = 'C:/Users/25774/Desktop/BlueOS/000039-ZheGeXuQiuZuoBuLiao/frontend/myfrontend/src/pages/UxcodePre/index.ux';
		fs.writeFileSync(filePath, uxCode, 'utf-8');
		console.log('uxCode has been saved to:', filePath);

		return uxCode;
	}
}
