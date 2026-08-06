export class ZipWriter {
  private files: { name: string; content: string }[] = [];

  addFile(name: string, content: string) {
    this.files.push({ name, content });
  }

  generateBlob(): Blob {
    const buffers: Uint8Array[] = [];
    let currentOffset = 0;
    const fileRecords: any[] = [];

    const textEncoder = new TextEncoder();

    for (const file of this.files) {
      const nameBytes = textEncoder.encode(file.name);
      const contentBytes = textEncoder.encode(file.content);
      const date = new Date();
      
      // DOS time/date format
      const dosTime = ((date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1)) & 0xFFFF;
      const dosDate = (((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()) & 0xFFFF;

      // Local file header (30 bytes + name length)
      const localHeader = new Uint8Array(30 + nameBytes.length);
      const view = new DataView(localHeader.buffer);

      view.setUint32(0, 0x04034b50, true); // Signature
      view.setUint16(4, 10, true);         // Version needed to extract
      view.setUint16(6, 0, true);          // General purpose bit flag
      view.setUint16(8, 0, true);          // Compression method (0 = Store)
      view.setUint16(10, dosTime, true);   // Last mod file time
      view.setUint16(12, dosDate, true);   // Last mod file date

      // Calculate CRC32 of content
      const crc = this.crc32(contentBytes);
      view.setUint32(14, crc, true);       // CRC-32
      view.setUint32(18, contentBytes.length, true); // Compressed size
      view.setUint32(22, contentBytes.length, true); // Uncompressed size
      view.setUint16(26, nameBytes.length, true);    // File name length
      view.setUint16(28, 0, true);         // Extra field length

      localHeader.set(nameBytes, 30);

      buffers.push(localHeader);
      buffers.push(contentBytes);

      fileRecords.push({
        nameBytes,
        size: contentBytes.length,
        crc,
        offset: currentOffset,
        dosTime,
        dosDate
      });

      currentOffset += localHeader.length + contentBytes.length;
    }

    // Write Central Directory Records
    const cdOffset = currentOffset;
    let cdSize = 0;

    for (const record of fileRecords) {
      const cdRecord = new Uint8Array(46 + record.nameBytes.length);
      const view = new DataView(cdRecord.buffer);

      view.setUint32(0, 0x02014b50, true); // Signature
      view.setUint16(4, 20, true);         // Version made by
      view.setUint16(6, 10, true);         // Version needed to extract
      view.setUint16(8, 0, true);          // General purpose bit flag
      view.setUint16(10, 0, true);         // Compression method (0 = Store)
      view.setUint16(12, record.dosTime, true);  // Last mod file time
      view.setUint16(14, record.dosDate, true);  // Last mod file date
      view.setUint32(16, record.crc, true);      // CRC-32
      view.setUint32(20, record.size, true);     // Compressed size
      view.setUint32(24, record.size, true);     // Uncompressed size
      view.setUint16(28, record.nameBytes.length, true); // File name length
      view.setUint16(30, 0, true);         // Extra field length
      view.setUint16(32, 0, true);         // File comment length
      view.setUint16(34, 0, true);         // Disk number start
      view.setUint16(36, 0, true);         // Internal file attributes
      view.setUint32(38, 0, true);         // External file attributes
      view.setUint32(42, record.offset, true);   // Relative offset of local header

      cdRecord.set(record.nameBytes, 46);
      buffers.push(cdRecord);
      cdSize += cdRecord.length;
    }

    // Write End of Central Directory Record (22 bytes)
    const eocd = new Uint8Array(22);
    const view = new DataView(eocd.buffer);

    view.setUint32(0, 0x06054b50, true); // Signature
    view.setUint16(4, 0, true);          // Number of this disk
    view.setUint16(6, 0, true);          // Disk where central directory starts
    view.setUint16(8, this.files.length, true); // Number of central directory records on this disk
    view.setUint16(10, this.files.length, true); // Total number of central directory records
    view.setUint32(12, cdSize, true);    // Size of central directory
    view.setUint32(16, cdOffset, true);  // Offset of central directory
    view.setUint16(20, 0, true);         // Comment length

    buffers.push(eocd);

    // Concatenate all buffers into a single Blob
    return new Blob(buffers as BlobPart[], { type: 'application/zip' });
  }

  private crc32(bytes: Uint8Array): number {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) {
      let b = bytes[i];
      c ^= b;
      for (let j = 0; j < 8; j++) {
        if (c & 1) {
          c = (c >>> 1) ^ 0xEDB88320;
        } else {
          c = c >>> 1;
        }
      }
    }
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
}
