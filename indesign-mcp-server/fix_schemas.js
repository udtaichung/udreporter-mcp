import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 工具定义文件列表
const toolDefinitionFiles = [
    'toolDefinitionsPage.js',
    'toolDefinitionsContent.js', 
    'toolDefinitionsDocument.js',
    'toolDefinitionsExport.js',
    'toolDefinitionsPresentation.js',
    'toolDefinitionsBook.js',
    'toolDefinitionsUtility.js',
    'toolDefinitionsPageItemGroup.js',
    'toolDefinitionsMasterSpread.js',
    'toolDefinitionsSpread.js',
    'toolDefinitionsLayer.js'
];

const typesDir = path.join(__dirname, 'src', 'types');

console.log('开始批量修复JSON Schema...');

toolDefinitionFiles.forEach(filename => {
    const filepath = path.join(typesDir, filename);
    
    if (!fs.existsSync(filepath)) {
        console.log(`跳过不存在的文件: ${filename}`);
        return;
    }
    
    console.log(`处理文件: ${filename}`);
    
    let content = fs.readFileSync(filepath, 'utf8');
    let modifiedCount = 0;
    
    // 匹配inputSchema对象，查找没有additionalProperties的情况
    // 匹配模式：inputSchema: { type: 'object', properties: { ... } }
    const schemaRegex = /(inputSchema:\s*{\s*type:\s*['"]object['"],\s*properties:\s*{[^}]*}(?:\s*,\s*[^}]*)*)\s*}/g;
    
    content = content.replace(schemaRegex, (match) => {
        // 检查是否已经包含additionalProperties
        if (match.includes('additionalProperties')) {
            return match;
        }
        
        // 在右花括号前添加additionalProperties: false
        const modifiedMatch = match.replace(/}\s*}$/, '},\n            additionalProperties: false\n        }');
        modifiedCount++;
        return modifiedMatch;
    });
    
    // 备份原文件
    fs.writeFileSync(filepath + '.backup', fs.readFileSync(filepath));
    
    // 写入修改后的内容
    fs.writeFileSync(filepath, content);
    
    console.log(`  修改了 ${modifiedCount} 个schema`);
});

console.log('批量修复完成！');