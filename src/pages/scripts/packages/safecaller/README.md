# Safe Caller

## Overview

**Safe Caller** is a JavaScript library of functions for safely invoking any function while ignoring errors.
This is useful when you want to prevent your application from crashing due to unexpected runtime exceptions.

> ⚠️ **Note**: Use this function with caution. Ignoring errors can hide critical issues and should not replace proper error handling.

## Usage

1. Import

```js
import { safecall } from "@/safecall/safecaller.js";
```

2. Use

A sample code:
```js
const url = new URL("http://localhost:3000/");
const response = await safecall(async(url) => {
    const response = await fetch(url);
    const data = await response.json(); // Errors while parsing JSON will be ignored
    return data;
}, url);

console.log(response); // => Object | undefind
```

## License

Licensed under the [MIT License](./LICENSE).

Copyright (C) よね/Yone
