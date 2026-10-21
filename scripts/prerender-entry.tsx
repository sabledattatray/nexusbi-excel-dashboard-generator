import React from 'react';
import { renderToPipeableStream, renderToString } from 'react-dom/server';
import { PassThrough } from 'node:stream';
import App from '../src/App';

export async function renderPage(route: string): Promise<{ html: string }> {
  return new Promise((resolve, reject) => {
    const output = new PassThrough();
    output.on('data', () => {});
    // The warm-up resolves lazy imports; the final pass emits visible content,
    // without streaming replacement scripts or hidden Suspense payloads.
    output.on('end', () => resolve({ html: renderToString(<App initialPath={route} />) }));
    output.on('error', reject);
    const stream = renderToPipeableStream(<App initialPath={route} />, {
      onAllReady() { stream.pipe(output); },
      onShellError: reject,
      onError: reject,
    });
  });
}
