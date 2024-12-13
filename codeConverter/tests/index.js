const fs = require('fs'); // 引入文件系统模块
const converter = require('./codeConverter'); // 请确保路径正确

// 读取 'test.html' 文件中的 HTML 内容
const inputFileName = 'test.html';
fs.readFile(inputFileName, 'utf8', (err, testHtml) => {
  if (err) {
    console.error('Error reading the HTML file:', err);
    return;
  }

  // 调用转换函数
  const uxCode = converter.convertToBlueOSCodeFromHtml(testHtml);

  // 输出结果到控制台
  // console.log('Converted UX Code:');
  console.log(uxCode);

  // 写入到 'test.ux' 文件
  const outputFileName = 'test.ux';
  fs.writeFile(outputFileName, uxCode, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to file:', err);
    } else {
      // console.log(`Converted UX code has been saved to ${outputFileName}`);
    }
  });
});




// const file = require('@system.file');
// const converter = require('./codeConverter'); // 请确保路径正确

// /**
//  * 将HTML文件转换为UX文件并写入
//  * @param {string} htmlFilePath - HTML文件的路径
//  * @param {string} uxFilePath - UX文件的目标路径
//  */
// function convertHtmlToUxAndWrite(htmlFilePath, uxFilePath) {

//   function defaultCallback(error) {
//     if (error) {
//       console.error('Operation failed:', error.message || error);
//     } else {
//       console.log('Operation completed successfully.');
//     }
//   }

//   file.readText({
//     uri: htmlFilePath,
//     success: function(data) {
//       console.log('text: ' + data.text);
//       try {
//         const uxCode = converter.convertToBlueOSCodeFromHtml(data.text);
//         file.writeText({
//           uri: uxFilePath,
//           text: uxCode,
//           success: function() {
//             console.log('Write success');
//             defaultCallback(null); // 操作成功
//           },
//           fail: function(data, code) {
//             console.error(`Write failed, code = ${code}, data = ${JSON.stringify(data)}`);
//             defaultCallback(new Error(`Write failed, code: ${code}`));
//           }
//         });
//       } catch (err) {
//         console.error('Conversion error:', err.message);
//         defaultCallback(err); // 转换失败
//       }
//     },
//     fail: function(data, code) {
//       console.error(`Read failed, code = ${code}, data = ${JSON.stringify(data)}`);
//       defaultCallback(new Error(`Read failed, code: ${code}`));
//     }
//   });
// }

// // 使用示例
// //在传递路径时，确保路径完整：const inputFileName = 'internal://files/test.html';file模块好像不能相对路径
// const inputFileName = 'internal://files/test.html';
// const outputFileName = 'internal://files/test.ux';
// convertHtmlToUxAndWrite(inputFileName, outputFileName);