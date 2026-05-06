type AsyncFn<T> = () => Promise<T>;

export const safeServiceCall = async <T>(
    fn: AsyncFn<T>,
    fallback: T,
    context: string,
): Promise<T> => {
    try {
        return await fn();
    } catch (error) {
        console.error(context, error);
        return fallback;
    }
};

export const safeServiceMutation = async <T>(
    fn: AsyncFn<T>,
    context: string,
): Promise<T> => {
    try {
        return await fn();
    } catch (error) {
        console.error(context, error);
        throw error;
    }
};
