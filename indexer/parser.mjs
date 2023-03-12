import fs from "fs";
import path from "path";

import TreeSitter from "tree-sitter";
import Python from "tree-sitter-python";
import { TextBuffer } from "superstring";

const LanguageInfos = [
  {
    language: Python,
    extensions: [".py"],
    nodeTypes: ["function_definition", "class_definition"],
    maxLevel: 3,
    minLoc: 4,
  },
];

export async function parseFile(file) {
  const ext = path.extname(file);
  const langInfo = LanguageInfos.find((x) => x.extensions.includes(ext));
  if (!langInfo) {
    return [];
  }

  const parser = new TreeSitter();
  parser.setLanguage(langInfo.language);

  const code = fs.readFileSync(file, "utf-8");
  const tree = parser.parse(code);

  return await toArray(
    walkTree(new TextBuffer(code), langInfo, 0, tree.rootNode)
  );
}

async function toArray(asyncIterator) {
  const arr = [];
  for await (const i of asyncIterator) arr.push(i);
  return arr;
}

async function* walkTree(code, info, level, node) {
  if (level > info.maxLevel) return;

  if (
    info.nodeTypes.includes(node.type) &&
    node.endPosition.row - node.startPosition.row + 1 >= info.minLoc
  ) {
    yield {
      code: code.getTextInRange({
        start: node.startPosition,
        end: node.endPosition,
      }),
      position: {
        start: node.startPosition,
        end: node.startPosition,
      },
    };
  }

  for (const x of node.children) {
    yield* walkTree(code, info, level + 1, x);
  }
}
