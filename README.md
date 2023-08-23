# sketch-mosaic

This is a tiny garden, shared and realtime, and can be found at [garden-party-ten.vercel.app](https://garden-party-ten.vercel.app).

- Hit "Get a seed" to roll a random nut, sprout, or fern.
- Tap on an empty tile to plant it.

The seed will grow into a plant, then maybe logs, and maybe something else will come along. Eventually it will disappear.

The garden is shared between everyone who visits the page.

![image](/assets/garden.png)

## Experimental!

This app was created during [Matt](https://interconnected.org)'s summer 2023 residency. The purpose is to experiment with multiplayer interactions, and simultaneously see what PartyKit can do. It's called a sketch because it's lightweight and quick, and because we learn something in making it.

## What you'll find here

This app is based on Next.js and PartyKit.

This is an experiment into using:

- [Yjs](https://yjs.dev) to share state -- it's a decent demo of how to do that without re-creating the whole ydoc at every render of the component
- and updating a Yjs document (the garden) from the party server.

This also uses the `onAlarm` feature of the party server to iterate the garden every 1500ms.

i.e. can we have autonomous behaviour away from any of the clients?

The answer: kinda.

The garden ticks along so long as at least one client has the garden open (the websocket keeps the server running). Which is neat! It saves running this shared behaviour on one of the clients! And it's probably better than a long-running server process that could get out of control. But still some work to do.

## To run locally

- Check out the repo.
- Copy `.env.example` into place as `.env.local`
- Run the party server: `npx partykit dev`
- Run the Nextjs app: `npm run dev`
- Visit [http://localhost:3000](http://localhost:3000) in your browser.
