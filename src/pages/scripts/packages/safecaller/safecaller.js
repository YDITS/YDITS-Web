/**
 * エラーを無視して安全に関数を実行する
 * 
 * 注意: 
 * 
 * @param {Function} func
 * @param  {...any} args
 * @returns {Promise<any>}
 */
export async function safecall(func, ...args) {
    if (typeof func !== "function") {
        throw new Error("Invalid function specified.");
    }

    try {
        return await func(...args);
    } catch (error) {
        console.error(error);
    };
}
