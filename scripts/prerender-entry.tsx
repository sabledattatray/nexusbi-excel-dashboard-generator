import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { PassThrough } from 'node:stream';
import App from '../src/App';

export async function renderPage(route: string): Promise<{ html: string }> {
  return new Promise((resolve, reject) => {
    const output = new PassThrough();
    const chunks: Buffer[] = [];
    output.on('data', chunk => chunks.push(Buffer.from(chunk)));
    output.on('end', () => resolve({ html: Buffer.concat(chunks).toString('utf8') }));
    output.on('error', reject);
    const stream = renderToPipeableStream(<App initialPath={route} />, {
      onAllReady() { stream.pipe(output); },
      onShellError: reject,
      onError: reject,
    });
  });
}
