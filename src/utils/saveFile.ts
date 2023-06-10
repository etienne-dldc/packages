import { writeFile } from "fs/promises";
import { resolve } from "path";
import { format } from "prettier";

/**
 * Save fiel and format with prettier
 */
export async function saveFile(folder: string, path: string, content: string) {
  const filePath = resolve(folder, path);
  const formattedContent = format(content, { filepath: filePath });
  await writeFile(filePath, formattedContent);
}
