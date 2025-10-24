/* eslint-disable */
import fs from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const actionsDir = join(__dirname, '../src/actions');
const helpFile = join(__dirname, '../companion/HELP.md');
// console.log('Scanning directory:', actionsDir);
// console.log('Output file:', helpFile);

function extractActions(fileContent, fileName) {
  const results = [];
  const lines = fileContent.split(/\r?\n/);
  let name = null;
  let description = null;
  for (const line of lines) {
    const nameMatch = line.match(/name\s*:\s*['"]([^'"]+)['"]/);
    if (nameMatch) {
      name = nameMatch[1];
    }
    const descMatch = line.match(/description\s*:\s*['"]([^'"]+)['"]/);
    if (descMatch) {
      description = descMatch[1];
    }
    if (name && description) {
      results.push({ name, description, category: fileName });
      // console.log(`Found action in ${fileName}: name='${name}', description='${description}'`);
      name = null;
      description = null;
    }
  }
  return results;
}

const allActions = [];
fs.readdirSync(actionsDir).forEach(file => {
  if (file.endsWith('.ts')) {
    // console.log('Reading file:', file);
    const content = fs.readFileSync(join(actionsDir, file), 'utf8');
    allActions.push(...extractActions(content, file));
  }
});

const categoryLookup = {
  'auxes.ts': 'Aux',
  'bus.ts': 'Bus',
  'cards.ts': 'Cards',
  'channel.ts': 'Channel',
  'common.ts': 'Common',
  'config.ts': 'Configuration',
  'control.ts': 'Control',
  'io.ts': 'IO',
  'main.ts': 'Main',
  'matrix.ts': 'Matrix',
  'other.ts': 'Other',
  'usbplayer.ts': 'USB Player',
};

// Add category to each action
allActions.forEach(action => {
  action.category = categoryLookup[action.category] || action.category.replace('.ts', '');
});

// Sort actions by category then name
const sortedActions = allActions.sort((a, b) => {
  if (a.category === b.category) {
    return a.name.localeCompare(b.name);
  }
  return a.category.localeCompare(b.category);
});

let table = '| Category | Name | Description |\n';
table += '|----------|------|-------------|\n';
sortedActions.forEach(action => {
  table += `| ${action.category} | ${action.name} | ${action.description} |\n`;
});

let helpContent = fs.readFileSync(helpFile, 'utf8');
const supportedActionsHeader = '## Supported Actions';
const headerIndex = helpContent.indexOf(supportedActionsHeader);
if (headerIndex !== -1) {
  // Find the next heading after '### Supported Actions'
  const afterHeader = helpContent.slice(headerIndex + supportedActionsHeader.length);
  const nextHeadingMatch = afterHeader.match(/\n#+\s.*/);
  let before = helpContent.slice(0, headerIndex + supportedActionsHeader.length);
  let after = '';
  if (nextHeadingMatch) {
    after = afterHeader.slice(nextHeadingMatch.index);
  }
  helpContent = before + '\n' + table + '\n' + after;
} else {
  // If no header, append at the end
  helpContent += '\n\n' + supportedActionsHeader + '\n' + table + '\n';
}

// console.log(`Writing ${allActions.length} actions to`, helpFile);
fs.writeFileSync(helpFile, helpContent);
