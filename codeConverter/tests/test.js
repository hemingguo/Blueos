// 测试用的输入数据：baseStyles 和 existingCssMap
const baseStyles = {
    h1: {
      "font-size": "50px",
      color: "#0000ff",  // 注意这里使用的是蓝色的十六进制值
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
      padding: "10px 20px",
      "text-align": "center",
      cursor: "pointer",
    },
  };
  
  const existingCssMap = {
    h1: {
      color: "blue",  // 源 CSS 中 h1 的 color 是 blue
    },
    button: {
      padding: "8px 16px",  // 源 CSS 中 button 有 padding，但没有 "text-align"
    },
  };
  
  // 合并函数
  Object.entries(baseStyles).forEach(([className, baseRules]) => {
    if (existingCssMap[className]) {
      // 源 CSS 中已有该类，添加基础样式中不存在的属性
      console.log(`Processing class: ${className} - found in both source and baseStyles.`);
      Object.entries(baseRules).forEach(([property, value]) => {
        if (!existingCssMap[className][property]) {
          console.log(`Adding property ${property}: ${value} to ${className}`);
          existingCssMap[className][property] = value;
        } else {
          console.log(`Property ${property} already exists in ${className}, skipping.`);
        }
      });
    } else {
      // 源 CSS 中没有该类，直接添加基础样式
      console.log(`Class ${className} not found in source CSS, adding from baseStyles.`);
      existingCssMap[className] = { ...baseRules };
    }
  });
  
  // 输出合并后的 CSS
  console.log("\nFinal merged CSS:");
  console.log(existingCssMap);
  