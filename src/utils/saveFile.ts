import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import { format, resolveConfig } from 'prettier';

/**
 * Save fiel and format with prettier
 */
export async function saveFile(folder: string, path: string, content: string) {
  const filePath = resolve(folder, path);
  const config = await resolveConfig(filePath);
  const formattedContent = await format(content, { filepath: filePath, ...config });
  await writeFile(filePath, formattedContent);
}
