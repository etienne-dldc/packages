import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import { format } from 'prettier';
import { prettierConfig } from '../logic/prettierConfig';

/**
 * Save fiel and format with prettier
 */
export async function saveFile(folder: string, path: string, content: string) {
  const filePath = resolve(folder, path);
  const formattedContent = await format(content, { filepath: filePath, ...prettierConfig });
  await writeFile(filePath, formattedContent);
}
