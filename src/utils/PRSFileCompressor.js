/**
 * Symbol Art Editor
 * 
 * @author malulleybovo (since 2021)
 * @license GNU General Public License v3.0
 *
 * @licstart  The following is the entire license notice for the
 *  JavaScript code in this page.
 *
 * Copyright (C) 2021  Arthur Malulley B. de O.
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */

class PRSFileCompressor {

    /**
     * Decompresses PRS-compressed data. Algorithm based on LZ77 with 
     * run-length encoding emulation and extended matches.
     * @param {ArrayBuffer} fileDataArrayBuffer PRS-compressed file data.
     * @return {ArrayBuffer} Decompressed file data.
     */
    static decompressFileData({ fileDataArrayBuffer }) {
        let readCursor = new Cursor(fileDataArrayBuffer);
        let writeCursor = new Cursor();
        // Run until algorithm hits the break condition
        while (true) {
            let flag = readCursor.readBit();
            if (flag) {
                // literal byte
                writeCursor.writeUint8(readCursor.readUint8());
                continue;
            }
            let offset = 0;
            let size = 0;
            let isLongCopy = false;
            flag = readCursor.readBit();
            if (flag) {
                isLongCopy = true;
                // long copy or eof
                offset = readCursor.readUint16(true);
                // Check if finished decompressing
                if (offset === 0) {
                    break;
                }
                size = offset & 7;
                offset = (offset >> 3) | -0x2000;
                if (size === 0) {
                    let num3 = readCursor.readUint8();
                    size = num3 + 10;
                } else {
                    size += 2;
                }
            } else {
                // short copy
                flag = readCursor.readBit() ? 1 : 0;
                size = readCursor.readBit() ? 1 : 0;
                size = (size | (flag << 1)) + 2;
                offset = readCursor.readInt8() | -0x100;
            }
            // do the actual copy
            for (let i = 0; i < size; i++) {
                if (offset > 0) {
                    throw new Error(`offset > 0 (${offset}) (isLongCopy === ${isLongCopy})`);
                }
                writeCursor.seek(offset);
                let newByte = writeCursor.readUint8();
                writeCursor.seek(-1);
                writeCursor.seek(-offset);
                writeCursor.writeUint8(newByte);
            }
        }
        return writeCursor.buffer.slice(0, writeCursor.pos);
    }

}
