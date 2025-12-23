export class ConcurrencyExecutor<T, R = any> {
  constructor(
    private readonly maxConcurrent: number,
    private readonly logger?: any,
  ) {}

  async run(
    items: T[],
    executor: (item: T) => Promise<R | null>,
  ): Promise<(R | null)[]> {
    const results: (R | null)[] = []
    let currentIndex = 0

    const executeNext = async (): Promise<void> => {
      while (currentIndex < items.length) {
        const index = currentIndex
        currentIndex++

        try {
          const result = await executor(items[index])
          results[index] = result
        } catch (error) {
          if (this.logger) {
            this.logger.error?.({
              msg: `Error processing item ${index}:`,
              error,
            })
          }
          results[index] = null
        }
      }
    }

    const workers = Array.from({ length: Math.max(1, this.maxConcurrent) }).map(
      () => executeNext(),
    )
    await Promise.all(workers)
    return results
  }
}
