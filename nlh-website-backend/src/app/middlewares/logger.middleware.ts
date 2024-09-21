/**
 * Logs an info message to the console, unless the current environment is set to `test`.
 * @param {...*} params The parameters to pass to `console.log()`.
 */
const info = (...params: string[]) => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(...params)
    }
}

/**
 * Logs an error message to the console, unless the current environment is set to `test`.
 * @param {...*} params The parameters to pass to `console.error()`.
 */
const error = (...params: string[]) => {
    if (process.env.NODE_ENV !== 'test') {
        console.error(...params)
    }
}

export default {
    info, error
}