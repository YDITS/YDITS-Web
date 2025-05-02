# Firebase App Creator

## Overview

**Firebase App Creator** is a library of Firebase App Creation Framework for JavaScript.

## Usage

This library need [app-creator](../app-creator/) library.

1. Import

```js
import { FirebaseApp } from "@/firebase-app-creator/app.js";
import { Service } from "@/app-creator/service.js";
```

2. Use

A sample code:
```js
// Create a Service (Use Service class @/app-creator/service.js)
class MyService extends Service { }


// Create a Firebase App
class MyApp extends FirebaseApp {
    constructor() {
        super({
            name: "My Firebase Application",
            description: "The my firebase application.",
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
