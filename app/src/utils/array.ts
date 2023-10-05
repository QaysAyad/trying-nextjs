export const mapAsync = async <T, Y>(
    items: readonly T[],
    transformer: (x: T, i: number, arr: readonly T[]) => Promise<Y>
): Promise<Y[]> => await Promise.all(items.map(transformer));