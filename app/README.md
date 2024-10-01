# ZKvot App

This app implements the first layer of the ZKvot Protocol, the Voting Layer, where all votes are created. The app is responsible for ensuring anonymity. To achieve full privacy, ZKvot uses client-side computation: if information never leaves the client side (e.g., the browser), there is no risk of losing privacy. Each vote is created as a zero-knowledge proof (ZKP) on the voter's personal device and then submitted to the Communication Layer. Additionally, the app allows users to create elections, with a built-in guide to assist them.

To fully utilize the computer's resources without the limitations of a browser while generating ZKP, a desktop app is preferred over a web app. However, to maintain the web app experience and allow the use of wallet extensions, the desktop app runs on a local port and can be interacted with via a browser.

See _Voting Layer_ and _Communication Layer_ sections in [full draft article of ZKvot]().
