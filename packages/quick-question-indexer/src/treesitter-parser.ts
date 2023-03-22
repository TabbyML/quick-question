import TreeSitter, { SyntaxNode } from "tree-sitter";
import TreeSitterPython from "tree-sitter-python";
import TreeSitterTypescript from "tree-sitter-typescript";
import { TextBuffer } from "superstring";
import { Chunk, CodeParser } from "./parser";

interface TreeSitterParserOptions {
  languageName?: string;
  patterns?: Array<Array<string>>;
  maxLevel?: number;
  minLoc?: number;
}

class TreeSitterParser implements CodeParser {
  language: any;
  languageName: string = "";
  patterns = [
    ["comment", "function_declaration"],
    ["function_declaration"],
    ["comment", "class_declaration"],
    ["class_declaration"],
  ];
  maxLevel = 1;
  minLoc = 4;

  constructor(options?: TreeSitterParserOptions) {
    this.languageName = options?.languageName ?? this.languageName;
    this.patterns = options?.patterns ?? this.patterns;
    this.maxLevel = options?.maxLevel ?? this.maxLevel;
    this.minLoc = options?.minLoc ?? this.minLoc;
  }

  match(nodeTypes: string[]): string[] | null {
    for (const pattern of this.patterns) {
      if (
        pattern.length <= nodeTypes.length &&
        pattern.every((type, index) => type === nodeTypes[index])
      ) {
        return pattern;
      }
    }
    return null;
  }

  async *traverse(
    nodes: SyntaxNode[],
    level: number
  ): AsyncIterable<{ start: TreeSitter.Point; end: TreeSitter.Point }> {
    if (level > this.maxLevel) return;
    const nodeTypes = nodes.map((node) => node.type);
    let index = 0;
    while (index < nodeTypes.length) {
      const matched = this.match(nodeTypes.slice(index));
      if (matched) {
        const result = {
          start: nodes[index].startPosition,
          end: nodes[index + matched.length - 1].endPosition,
        };
        yield result;
        index += matched.length;
      } else {
        yield* this.traverse(nodes[index].children, level + 1);
        index += 1;
      }
    }
  }

  async parse(code: string): Promise<Array<Chunk>> {
    const parser = new TreeSitter();
    parser.setLanguage(this.language);
    const tree = parser.parse(code);
    const codeBuffer = new TextBuffer(code);
    const ranges = this.traverse([tree.rootNode], 0);
    const result: Array<Chunk> = [];
    for await (const range of ranges) {
      if (range.end.row - range.start.row + 1 < this.minLoc) continue;
      result.push({
        language: this.languageName,
        code: codeBuffer.getTextInRange(range),
        range,
      });
    }
    return result;
  }
}

export class PythonParser extends TreeSitterParser {
  language = TreeSitterPython;
  languageName = "python";
  patterns = [["function_definition"], ["class_definition"]];
  maxLevel = 3;
  minLoc = 4;
}

export class TsxParser extends TreeSitterParser {
  language = TreeSitterTypescript.tsx;
}
