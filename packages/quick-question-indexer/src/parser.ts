import fs from "fs";
import path from "path";
import { Location } from "superstring";
import { PythonParser, TsxParser } from "./treesitter-parser";

export interface Chunk {
  language: string;
  code: string;
  range: {
    start: Location;
    end: Location;
  };
}

export interface CodeParser {
  parse(code: string): Promise<Array<Chunk>>;
}

interface LanguageInfo {
  languageName: string;
  parser: CodeParser;
  extensions: Array<string>;
}

const LanguageInfos: Array<LanguageInfo> = [
  {
    languageName: "python",
    parser: new PythonParser,
    extensions: [".py"],
  },
  {
    languageName: "javascript",
    parser: new TsxParser({ languageName: "javascript" }),
    extensions: [".js", ".jsm", ".cjs", ".mjs"],
  },
  {
    languageName: "typescript",
    parser: new TsxParser({ languageName: "typescript" }),
    extensions: [".ts"],
  },
  {
    languageName: "jsx",
    parser: new TsxParser({ languageName: "jsx" }),
    extensions: [".jsx"],
  },
  {
    languageName: "tsx",
    parser: new TsxParser({ languageName: "tsx" }),
    extensions: [".tsx"],
  },
];

export async function parseFile(file: string): Promise<Chunk[]> {
  const ext = path.extname(file);
  const langInfo = LanguageInfos.find((x) => x.extensions.includes(ext));
  if (!langInfo) {
    return [];
  }

  const code = fs.readFileSync(file, "utf-8");

  return await langInfo.parser.parse(code);
}
