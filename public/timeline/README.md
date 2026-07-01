# /public/timeline — image folders for "The Journey" section

One folder per timeline card so media never gets mixed up. The folder name
matches the card's `id` in `lib/data/timeline.ts`.

| Folder            | Card (`id`)     |
| ----------------- | --------------- |
| `teknofest/`      | `teknofest`     |
| `smarthome/`      | `smarthome`     |
| `deneyap/`        | `deneyap`       |
| `tofd/`           | `tofd`          |
| `little-crusoe/`  | `little-crusoe` |
| `nft/`            | `nft`           |
| `tog/`            | `tog`           |

## How to add images to a card

1. Drop your files into the card's folder, e.g.
   `public/timeline/little-crusoe/1.png`, `2.png`, `3.png`.
2. Reference them in `lib/data/timeline.ts` from `/timeline/...` (the `/public`
   prefix is dropped in URLs):

   ```ts
   photos: [
     "/timeline/little-crusoe/1.png",
     "/timeline/little-crusoe/2.png",
     "/timeline/little-crusoe/3.png",
   ],
   ```

`photos` render as the draggable stack beside the card. For an image *inside*
the card, use the `media` field instead (same path convention).
