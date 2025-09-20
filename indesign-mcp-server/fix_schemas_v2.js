import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

console.log('开始第二轮批量修复JSON Schema...');

toolDefinitionFiles.forEach(filename => {
    const filepath = path.join(typesDir, filename);
    
    if (!fs.existsSync(filepath)) {
        console.log(`跳过不存在的文件: ${filename}`);
        return;
    }
    
    console.log(`处理文件: ${filename}`);
    
    let content = fs.readFileSync(filepath, 'utf8');
    let modifiedCount = 0;
    
    // 更复杂的匹配模式 - 匹配整个 inputSchema 对象
    const inputSchemaRegex = /(inputSchema:\s*{\s*[\s\S]*?})(?=,?\s*},)/g;
    
    const matches = [...content.matchAll(inputSchemaRegex)];
    
    matches.forEach(match => {
        const schemaBlock = match[1];
        
        // 检查是否是object类型且包含properties
        if (schemaBlock.includes("type: 'object'") && schemaBlock.includes('properties:')) {
            // 检查是否已经有additionalProperties
            if (!schemaBlock.includes('additionalProperties')) {
                // 找到最后一个花括号前插入additionalProperties
                let modifiedSchema = schemaBlock;
                
                // 如果有required字段，在required后插入
                if (schemaBlock.includes('required:')) {
                    modifiedSchema = schemaBlock.replace(
                        /(required:\s*\[[^\]]*\]\s*,?)/,
                        '$1,\\n            additionalProperties: false'
                    );
                } else {
                    // 否则在properties后插入
                    // 查找properties块的结束位置
                    const propertiesEndRegex = /(properties:\s*{[\s\S]*?}\s*,?)/;
                    if (propertiesEndRegex.test(schemaBlock)) {
                        modifiedSchema = schemaBlock.replace(
                            propertiesEndRegex,
                            '$1,\\n            additionalProperties: false'
                        );
                    } else {
                        // 最后的备选方案：在最后的花括号前插入
                        modifiedSchema = schemaBlock.replace(
                            /(\s*)}/,
                            ',\\n            additionalProperties: false\\n$1}'
                        );
                    }
                }
                
                // 替换内容中的原始schema
                content = content.replace(schemaBlock, modifiedSchema);
                modifiedCount++;
            }
        }
    });
    
    if (modifiedCount > 0) {
        // 写入修改后的内容
        fs.writeFileSync(filepath, content);
        console.log(`  修改了 ${modifiedCount} 个schema`);
    } else {
        console.log(`  没有需要修改的schema`);
    }
});

console.log('第二轮批量修复完成！');