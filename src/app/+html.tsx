import type { PropsWithChildren } from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#F8FAFC" />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root { height: 100%; }
              html, body { margin: 0; overflow: hidden; }
              #root { display: flex; }
            `,
          }}
        />
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='29' fill='%236FB51E'/%3E%3Ccircle cx='23' cy='21' r='4' fill='%23113E68'/%3E%3Ccircle cx='41' cy='27' r='4' fill='%23113E68'/%3E%3Ccircle cx='29' cy='43' r='4' fill='%23113E68'/%3E%3C/svg%3E"
        />
        <title>Pickleball Club</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
