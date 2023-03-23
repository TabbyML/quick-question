import TreeSitter, { SyntaxNode } from "tree-sitter";
import TreeSitterPython from "tree-sitter-python";
import TreeSitterTypescript from "tree-sitter-typescript";
import TreeSitterJava from "tree-sitter-java";
import TreeSitterKotlin from "tree-sitter-kotlin";
import { Location, Chunk, CodeParser } from "./parser";

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
  ): AsyncIterable<{
    start: { index: number; location: Location };
    end: { index: number; location: Location };
  }> {
    if (level > this.maxLevel) return;
    const nodeTypes = nodes.map((node) => node.type);
    let index = 0;
    while (index < nodeTypes.length) {
      const matched = this.match(nodeTypes.slice(index));
      if (matched) {
        const startNode = nodes[index];
        const endNode = nodes[index + matched.length - 1];
        const result = {
          start: {
            index: startNode.startIndex,
            location: startNode.startPosition,
          },
          end: {
            index: endNode.endIndex,
            location: endNode.endPosition,
          },
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
    const ranges = this.traverse([tree.rootNode], 0);
    const result: Array<Chunk> = [];
    for await (const range of ranges) {
      if (range.end.location.row - range.start.location.row + 1 < this.minLoc) {
        continue;
      }
      result.push({
        language: this.languageName,
        code: code.slice(range.start.index, range.end.index),
        range: { start: range.start.location, end: range.end.location },
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

export class JavaParser extends TreeSitterParser {
  language = TreeSitterJava;
}

export class KotlinParser extends TreeSitterParser {
  language = TreeSitterKotlin;
}
