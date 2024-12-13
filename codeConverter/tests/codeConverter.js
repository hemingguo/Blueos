/**
 * 从 html 代码中抽取 css 和 template
 * @param {string} htmlCode
 * @returns
 */
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
  
  /**
   * 生成script代码
   * @returns {string}
   */
  function createScriptCode() {
    return `
        export default {
          onInit() {
            console.log('onInit')
          }
        }
    `;
  }
  
  /**
   * 将template、css、script聚合成为蓝河ux代码
   * @param {string} template
   * @param {string} css
   * @param {string} script
   * @returns
   */
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
  
/**
 * 替换标签，并添加原始标签名作为 class，如果需要的话
 * @param {string} htmlString
 * @param {string} originalTag
 * @param {string} newTag
 * @param {Set<string>} classSet - 用于收集需要生成 CSS 的类名
 * @returns {string}
 */
function replaceTag(htmlString, originalTag, newTag, classSet) {
  const pattern = new RegExp(
    `<${originalTag}(\\s[^>]*)?>(.*?)<\\/${originalTag}>`,
    "gs"
  );
  return htmlString.replace(pattern, (match, attributes = "", innerHtml) => {
    const hasClass = /\bclass="/.test(attributes); // 检查是否已有 class 属性
    if(hasClass) {
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


/**
 * 根据 classSet 生成对应的基础 CSS 样式
 * @param {Set<string>} classSet
 * @param {Object} baseStyles
 * @returns {Object} - 返回包含样式的对象 { className: "css rules" }
 */
function generateCssForTags(classSet, baseStyles) {
  const cssMap = {};

  classSet.forEach((className) => {
    if (baseStyles[className]) {
      cssMap[className] = baseStyles[className];
    }
  });

  return cssMap;
}

/**
 * 合并原始 CSS 和动态生成的 CSS
 * @param {string} originalCss - 原始的 CSS 代码
 * @param {Object} baseStyles - 基础样式的映射对象
 * @returns {string} - 合并后的 CSS 字符串
 */
function mergeCss(originalCss, baseStyles) {
  const cssRegex = /([a-zA-Z0-9_-]+)\s*{\s*([^}]+)\s*}/g; // 修改为匹配所有选择器，包括非类选择器
  const existingCssMap = {};

  let match;
  // 使用正则表达式逐个匹配所有 CSS 规则
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
  //console.log(existingCssMap);
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
      existingCssMap[className] = { ...baseRules };
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

/**
 * 确保模板内容包裹到一个根<div>，并且根目录只有一个子节点
 * @param {string} templateHtml
 * @returns {string}
 */
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

  
  /**
   * 格式化HTML内容，添加缩进
   * @param {string} htmlString - 要格式化的HTML字符串
   * @param {number} indentLevel - 当前缩进级别
   * @returns {string}
   */
  function formatHtml(htmlString, indentLevel = 0) {
	const lines = [];
	const indent = "  ".repeat(indentLevel); // 两个空格缩进
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
  
  /**
   * 包装并格式化HTML内容，确保根目录只有一个子节点<div>
   * @param {string} templateHtml
   * @returns {string}
   */
  function wrapAndFormatHtml(templateHtml) {
	// 确保根目录只有一个子节点<div>
	const singleRootHtml = ensureSingleRootNode(templateHtml);
	// 格式化为带缩进的HTML
	return formatHtml(singleRootHtml, 0);
  }
  
  
/**
 * 通过 html 生成 blueos 代码
 * @param {string} htmlCode
 * @returns
 */
module.exports.convertToBlueOSCodeFromHtml = (htmlCode) => {
  // 抽取 css 和 template
  let { css, template } = extractCssAndBodyFromHtml(htmlCode);

  // 创建一个 Set 用于收集需要生成 CSS 的类名
  const classSet = new Set();

  // html 的标签转换为蓝河组件，并记录需要的 class
  Object.keys(tagMap).forEach((tag) => {
    template = replaceTag(template, tag, tagMap[tag], classSet);
  });
  template = ensureSingleRootNode(template);
  template = formatHtml(template, 0);

  // 基础样式
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
  

  // 动态生成的 CSS
  const dynamicCssMap = generateCssForTags(classSet, baseStyles);
  //onsole.log(css);
  //console.log(dynamicCssMap);
  // 合并原始 CSS 和动态 CSS
  css = mergeCss(css, dynamicCssMap);
  //console.log(css);

  //css += `\n.root {\n  flex-direction: column;\n}\n`;

  // 创建 JS 代码
  const script = createScriptCode();

  // 将 css、template、js 组装为蓝河代码
  const uxCode = createUxCode(template, css, script);
  return uxCode;
};


  