# Molly Hole: fresh rebuild plan (mockups only)
Hard rule: nothing that slows the game, lowers the frame rate or looks poor. Steady 60fps on iPad, crisp at all times.
The mockups are drawn by real Canvas2D code (mockups/m.html), using the same primitives the game will use.

## Architecture for 60fps
- One full-screen 2D canvas. Backing store = CSS size × min(devicePixelRatio, 2), fixed at load. No dynamic resolution, so it never goes blurry.
- Every object type (buildings, cars, bus, people, trees, bins, benches, hole skins) is prerendered once at load to an offscreen canvas at 2× scale. Each frame is just drawImage calls at integer pixel positions.
- Static town (ground, roads, markings) is baked into one cached layer and redrawn only when the camera moves (one drawImage per frame).
- Object pools: entities, YIPPEE text and coin pop-ups live in preallocated arrays. Nothing allocated per frame, so there are no GC hitches.
- Simple game loop: fixed-step update, rAF render, spatial grid for "is it smaller than the hole" checks. Town is about 2 screens, roughly 150 objects at most.
- Falling in = scale + rotate a cached sprite, clipped to the hole ellipse. Text is prerendered into sprites too.

## Dropped (and why)
- Dynamic resolution scaling: causes blur and resize hitches.
- Depth/haze/fog overlays: full-screen alpha fills use a lot of fill-rate and look muddy.
- Particles: lots of small draws and allocations, plus visual clutter.
- Drop shadows / shadowBlur: very slow in Canvas2D. Outlines give the same depth for free.
- Gradients: per-draw cost, and they look soft. Solid fills only.
- Big sprawling city / high-rises / skyscraper: too many objects. Replaced by a small contained town.
- Animals that flee, traffic lights, weather and extra effects: clutter and extra update cost. They can come back later only if they're cheap.
- Extra HUD (timers, counters, minimap): clutter, and Molly can't read them.

## Kept (why it's fast and crisp)
- Drag-the-hole joystick control: input only, no extra cost.
- Hole (dark purple, white rim): 3 ellipse fills. Prerendered per skin, sharp at 2× DPR.
- Chunky flat buildings with bold outlines: one cached sprite each, so drawing is a single blit.
- Cars and buses driving straight along the roads: linear motion on fixed lanes, one sprite each.
- People shouting YIPPEE!: text sprite from a pool, simple scale-up and fade, max 3 on screen at once.
- Coins, skins, start map: static screens that cost almost nothing to draw. All unlocks are earned (no IAP, ads, tracking or accounts).
- HUD: size badge, growth bar and pause button only. Cached, redrawn only when they change.
