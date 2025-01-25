// lib/checklist-parser.js
import fs from 'fs';

export async function getChecklistProgress(filePath) {
  try {
    const fileContent = await readFileContent(filePath);
    const lines = fileContent.split('\n');
    const progress = {
      sections: [],
    };
    let currentSection = null;
    let currentSubsection = null;

    for (const line of lines) {
      const sectionMatch = line.match(/^##\s+(.+)$/);
      const subsectionMatch = line.match(/^###\s+(.+)$/);
      const listItemMatch = line.match(/^\s*-\s+([✅❌⚠️]?)\s+(.+)$/);

      if (sectionMatch) {
        currentSection = {
          title: sectionMatch[1].trim(),
          subsections: [],
        };
        progress.sections.push(currentSection);
        currentSubsection = null;
      } else if (subsectionMatch && currentSection) {
        currentSubsection = {
          title: subsectionMatch[1].trim(),
          items: [],
        };
        currentSection.subsections.push(currentSubsection);
      } else if (listItemMatch && currentSubsection) {
        const statusIndicator = listItemMatch[1].trim();
        const itemDescription = listItemMatch[2].trim();
        let status = 'pending';
        if (statusIndicator === '✅') {
          status = 'completed';
        } else if (statusIndicator === '❌') {
          status = 'not implemented';
        } else if (statusIndicator === '⚠️') {
          status = 'partially implemented';
        }
        currentSubsection.items.push({
          description: itemDescription,
          status: status,
        });
      }
    }
    return progress;
  } catch (error) {
    console.error('Error parsing checklist:', error);
    return { sections: [], error: error.message };
  }
}

async function readFileContent(filePath) {
  const fileContent = await fs.promises.readFile(filePath, 'utf-8');
  return fileContent;
}
