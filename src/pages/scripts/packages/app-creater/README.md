# App Creater

## Overview

**App Creater** is a library of App Creation Framework for JavaScript.

## Usage

1. Import

```js
import { App } from "@/app-creater/app.js";
import { Service } from "@/app-creater/service.js";
```

2. Use

A sample code:
```js
// Create a Service
class MyService extends Service {
    constructor(app) {
        super(app, {
            name: "myservice",
            description: "The my service.",
            version: new Version(1, 0, 0, Version.levels.stable),
            author: "My Name",
            copyright: "Copyright © MyName"
        });
    }

    hello() {
        console.log("Hello App Creater!");
    }
}


// Create a App
class NewApp extends App {
    constructor() {
        super({
            name: "My Application",
            description: "The my application.",
            version: new Version(1, 0, 0, Version.levels.stable),
            author: "My Name",
            copyright: "Copyright © MyName",
        });

        // Register new service
        this.registerService(MyService);

        // Use the service (reference from Service.name)
        this.services.myservice.hello();
    }
}
```

## License

Licensed under the [MIT License](./LICENSE).

Copyright (C) よね/Yone
