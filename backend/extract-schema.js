const fs = require('fs');
const readline = require('readline');

async function extractSchema() {
  const rl = readline.createInterface({
    input: fs.createReadStream('/Users/mohsinabbas/.gemini/antigravity-ide/brain/3cd60746-a8cf-4b22-8600-a911462874dc/.system_generated/logs/transcript.jsonl')
  });

  let schemaContent = '';

  for await (const line of rl) {
    const data = JSON.parse(line);
    if (data.tool_calls) {
      for (const tc of data.tool_calls) {
        if (tc.name === 'write_to_file' && tc.args.TargetFile.includes('schema.prisma')) {
          // Parse the code content
          let content = tc.args.CodeContent;
          if (content.startsWith('"') && content.endsWith('"')) {
            // It might be a JSON-encoded string in the transcript
            try {
              content = JSON.parse(content);
            } catch (e) {
              // ignore
            }
          }
          // Unescape newlines if it has \n as literal
          content = content.replace(/\\n/g, '\n').replace(/\\"/g, '"');
          schemaContent = content;
        }
      }
    }
  }

  if (schemaContent) {
    // If it starts/ends with quotes, strip them
    if (schemaContent.startsWith('"') && schemaContent.endsWith('"')) {
      schemaContent = schemaContent.slice(1, -1);
    }
    // Clean up escaped newlines or formatting
    schemaContent = schemaContent.replace(/\\n/g, '\n').replace(/\\"/g, '"');
    fs.writeFileSync('/Users/mohsinabbas/SmartAiInterviews/backend/prisma/schema.prisma', schemaContent);
    console.log('Successfully wrote schema.prisma!');
  } else {
    console.log('No schema.prisma found in logs.');
  }
}

extractSchema();
