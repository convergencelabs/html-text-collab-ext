import {ISelectionRow} from "./ISelectionRow";
import {ICaretCoordinates} from "./ICaretCoordinates";

// @ts-ignore
import getCaretCoordinates from "textarea-caret";


/*
 * Computes the dimensions of the text selection.  Each line in the textarea has its own
 * selection dimensions, which are intended to be used to render a div with the specified
 * position, dimensions and background color.
 *
 * This has only been tested on a textarea, but should be able to be adapted to be used
 * in other HTML form elements.
 *
 * TODO unit test, this is pretty brittle
 */
export class SelectionComputer {

  public static calculateSelection(element: HTMLTextAreaElement, start: number, end: number): ISelectionRow[] {
    const computer = new SelectionComputer(element, start, end);
    return computer.selectionRows;
  }

  // The calculated styles for each row.
  private readonly selectionRows: ISelectionRow[];

  private readonly startCoordinates: ICaretCoordinates;
  private readonly endCoordinates: ICaretCoordinates;
  private readonly lineHeight: number;
  private readonly elementPaddingLeft: number;
  private readonly elementPaddingRight: number;
  private readonly elementPaddingX: number;

  private constructor(
    private element: HTMLTextAreaElement,
    private start: number,
    private end: number) {

    this.startCoordinates = getCaretCoordinates(element, start);
    this.endCoordinates = getCaretCoordinates(element, end);
    this.lineHeight = this.startCoordinates.height;
    this.elementPaddingLeft = parseFloat(element.style.paddingLeft) || 0;
    this.elementPaddingRight = parseFloat(element.style.paddingRight) || 0;
    this.elementPaddingX = this.elementPaddingLeft + this.elementPaddingRight;

    this.selectionRows = [];

    // Figure out whether this selection spans more than one "row", as determined by
    // the presence of a newline character. The computation of single line selections
    // is slightly different than for multiple line selections.
    const selectedText = element.value.substr(start, end - start);
    if (selectedText.indexOf('\n') < 0) {
      this.appendSingleLineSelection(this.startCoordinates, this.endCoordinates);
    } else {
      this.buildMultiRowSelection();
    }
  }

  private appendSingleLineSelection(startCoordinates: ICaretCoordinates, endCoordinates: ICaretCoordinates) {
    this.selectionRows.push(...this.buildSingleLineSelection(startCoordinates, endCoordinates));
  }

  private buildSingleLineSelection(startCoordinates: ICaretCoordinates, endCoordinates: ICaretCoordinates): ISelectionRow[] {
    // does this line wrap? If not, we can just calculate the row selection based on
    // the provided coordinates.
    if (startCoordinates.top === endCoordinates.top) {
      return [{
        width: endCoordinates.left - startCoordinates.left,
        top: startCoordinates.top,
        left: startCoordinates.left,
        height: this.lineHeight
      }];
    } else {
      return this.buildWrappedLineSelections(startCoordinates, endCoordinates);
    }
  }

  /**
   * Wrapped lines have a more complex computation since we have to create multiple
   * rows.
   *
   * @param startCoordinates
   * @param endCoordinates
   */
  private buildWrappedLineSelections(startCoordinates: ICaretCoordinates, endCoordinates: ICaretCoordinates): ISelectionRow[] {
    const rows: ISelectionRow[] = [];
    // the first line just goes the full width of the textarea
    rows.push({
      width: this.element.scrollWidth - this.elementPaddingRight - startCoordinates.left,
      top: startCoordinates.top,
      left: startCoordinates.left,
      height: this.lineHeight
    });

    // If the selection contains one or more rows that span the entire textarea,
    // calculate a single selection element, which may actually span multiple rows,
    // but fills the width of the textarea.
    if (endCoordinates.top > startCoordinates.top + this.lineHeight) {
      rows.push({
        width: this.element.scrollWidth - this.elementPaddingX,
        left: this.elementPaddingLeft,
        top: startCoordinates.top + this.lineHeight,
        height: endCoordinates.top - startCoordinates.top - this.lineHeight
      });
    }

    // The last line starts at the left edge of the textarea and doesn't span the
    // entire width of the textarea
    rows.push({
      width: endCoordinates.left - this.elementPaddingLeft,
      top: endCoordinates.top,
      left: this.elementPaddingLeft,
      height: this.lineHeight
    });
    return rows;
  }

  private buildMultiRowSelection() {
    let currentCoordinates = this.startCoordinates;
    let currentIndex = +this.start;

    // build one or more selection elements for each row (as determined by newline
    // characters)
    while (currentCoordinates.top < this.endCoordinates.top) {
      const nextLineBreakPosition = this.element.value.indexOf('\n', currentIndex);
      let endOfLinePosition = this.element.value.length;
      if (nextLineBreakPosition >= 0) {
        endOfLinePosition = nextLineBreakPosition;
      }
      if (endOfLinePosition > this.end) {
        endOfLinePosition = this.end;
      }
      const endOfLineCoordinates = getCaretCoordinates(this.element, endOfLinePosition);
      // console.log('target of line position', endOfLinePosition, 'coords', endOfLineCoordinates);

      // This "single line" may actually wrap multiple lines of the textarea
      this.appendSingleLineSelection(currentCoordinates, endOfLineCoordinates);

      currentIndex = endOfLinePosition + 1;
      currentCoordinates = getCaretCoordinates(this.element, currentIndex);
    }
    if (currentIndex < this.end) {
      const lastLine = {
        width: this.endCoordinates.left - currentCoordinates.left,
        top: currentCoordinates.top,
        left: currentCoordinates.left,
        height: this.lineHeight
      };
      this.selectionRows.push(lastLine);
    }
  }
}
