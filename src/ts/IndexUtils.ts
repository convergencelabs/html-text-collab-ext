export class IndexUtils {
  public static transformIndexOnInsert(index: number, insertIndex: number, value: string): number {
    if (insertIndex <= index) {
      return index + value.length;
    }
    return index;
  }

  public static transformIndexOnDelete(index: number, deleteIndex: number, length: number): number {
    if (index > deleteIndex) {
      return index - Math.min(index - deleteIndex, length);
    }
    return index;
  }
}