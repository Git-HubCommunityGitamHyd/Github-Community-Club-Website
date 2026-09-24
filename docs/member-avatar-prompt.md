# Member avatar prompt

Members of the club do not show their faces on the site. Each member makes an
avatar of themselves with an image generator (ChatGPT, Gemini, Copilot, or
any other) and sends it in. This file is what to give them.

The site crops every avatar to a circle inside a coloured border and shows
them side by side in a grid, so what matters most is that they are all framed
the same way. That is what the fixed part of the prompt does. Everyone fills
in only the "about me" lines.

## Send this to members

> Make your avatar for the GitHub Community members page. Copy the prompt
> below into ChatGPT, Gemini or any image generator, fill in the five lines
> about you, and send back the image. You do not need to upload a photo: a
> description is enough, and it is better for keeping your face private.

```text
Create a square 1:1 cartoon avatar in a flat vector illustration style,
like a modern sticker or a character from an animated series. Bold, clean
dark outlines of even thickness, flat colours with at most one soft shadow
tone, simple rounded shapes, large readable features. No texture, no
gradients, no photorealism.

Framing: head and shoulders only, facing the viewer straight on, centred.
The head fills about the middle 60% of the image with even space on all
sides, so it still works when cropped to a circle and shown small.

Background: one flat solid colour, dark charcoal (#161B22). No scenery, no
pattern, no frame, no border, no text, no letters, no logos, no watermark.

Style: friendly and stylised, a character inspired by the description
below, not a realistic likeness.

About me:
- Hair: [e.g. short curly black hair / long straight hair in a ponytail]
- Glasses or none: [e.g. round black glasses / none]
- Wearing: [e.g. a green hoodie / a denim jacket over a white t-shirt]
- Expression: [e.g. a small smile / focused / laughing]
- One thing that is me: [e.g. headphones round my neck / a coffee mug /
  a tiny octocat pin / a cap]
```

### If the image is not quite right

Reply to the generator in the same chat, one change at a time:

- "Same character, but make the head smaller so there is more space around
  it."
- "Same character, make the background plain solid #161B22 with nothing
  else in it."
- "Same character, facing straight forward instead of to the side."
- "Same character, simpler shapes and thicker outlines."
- "Remove all text from the image."

### 16-bit pixel art instead

For anyone who wants the retro look, swap the first paragraph for this and
keep everything else the same. 16-bit rather than 8-bit: at 8-bit there are
too few pixels for a face to read as a particular person, and at the size
the site shows avatars it turns into a blob.

```text
Create a square 1:1 avatar in detailed 16-bit pixel art, like a character
portrait from a Super Nintendo era RPG. Crisp visible pixels on a clean
grid, a rich but limited palette, dark outlines, soft pixel shading on the
face and hair. No blur, no anti-aliased smoothing, no gradients.
```

Pick one style for the whole club if you can. A grid that mixes cartoons
and pixel art reads as two sets rather than one team, so the cartoon style
is the default and pixel art is the exception.

## Before uploading (for whoever runs the CMS)

- **Format:** square, at least 512 x 512 px. PNG or JPG. If it came back
  slightly wider or taller, crop it square around the face first.
- **Check for text:** generators sometimes add a name or random letters.
  Ask for another one or crop the text out.
- **Upload:** `/admin/members`, then edit the member, then use
  "Avatar and profile border". The preview there shows exactly how it will
  look on the site, border included.
- **Profile border:** pick one of the ring styles in the same block. Giving
  people on the same team different borders makes the grid easier to scan.
- **No avatar yet?** Leave it empty. The site draws a GitHub-style identicon
  from their name until one arrives, so nobody shows up as a blank circle.
