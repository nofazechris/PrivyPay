import QRCode from 'qrcode';
import type { ReactElement } from 'react';

/**
 * Real, scannable QR code (§72), rendered in the design's own grid style so it looks identical
 * to the mockup but actually encodes the wallet address. Uses `qrcode` only to compute the
 * module matrix; the cells are drawn as divs, matching the imported design's QR container.
 */
export function addressQr(text: string, cell: number): ReactElement {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
  const size = qr.modules.size;
  const data = qr.modules.data; // 1 = dark module
  const cells: ReactElement[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const on = data[y * size + x] === 1;
      cells.push(<div key={`${x}-${y}`} style={{ background: on ? '#0E1420' : 'transparent' }} />);
    }
  }
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${size}, ${cell}px)`,
        gridTemplateRows: `repeat(${size}, ${cell}px)`,
        gap: '0px',
        padding: '12px',
        background: '#fff',
        border: '1px solid #EDEFF3',
        borderRadius: '12px',
        width: 'fit-content',
      }}
      aria-label="Wallet address QR code"
      role="img"
    >
      {cells}
    </div>
  );
}
