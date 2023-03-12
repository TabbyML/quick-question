declare module "superstring" {
  export class TextBuffer {
    constructor(content: string);
    getTextInRange({ start: Location, end: Location }): string;
  }

  export interface Location {
    column: number;
    row: number;
  }
}
