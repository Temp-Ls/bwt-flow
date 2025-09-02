/**
 * Burrows-Wheeler Transform (BWT) Implementation
 * Core algorithms for text compression pipeline
 */

export interface TransformResult {
  transformed: string;
  primaryIndex: number;
  metadata?: any;
}

export interface CompressionStep {
  name: string;
  input: string;
  output: string;
  ratio?: number;
  metadata?: any;
}

/**
 * Performs the Burrows-Wheeler Transform on input text
 * @param text Input text to transform
 * @returns Object containing transformed text and primary index
 */
export function burrowsWheelerTransform(text: string): TransformResult {
  if (!text) return { transformed: '', primaryIndex: 0 };
  
  // Add end-of-string marker
  const textWithMarker = text + '$';
  const n = textWithMarker.length;
  
  // Generate all rotations
  const rotations: Array<{ rotation: string; index: number }> = [];
  for (let i = 0; i < n; i++) {
    rotations.push({
      rotation: textWithMarker.slice(i) + textWithMarker.slice(0, i),
      index: i
    });
  }
  
  // Sort rotations lexicographically
  rotations.sort((a, b) => a.rotation.localeCompare(b.rotation));
  
  // Extract last column and find primary index
  let transformed = '';
  let primaryIndex = 0;
  
  for (let i = 0; i < rotations.length; i++) {
    const rotation = rotations[i].rotation;
    transformed += rotation[rotation.length - 1];
    
    if (rotations[i].index === 0) {
      primaryIndex = i;
    }
  }
  
  return {
    transformed: transformed.slice(0, -1), // Remove the marker
    primaryIndex,
    metadata: {
      originalLength: text.length,
      rotations: rotations.length
    }
  };
}

/**
 * Performs the inverse Burrows-Wheeler Transform
 * @param transformed The BWT transformed text
 * @param primaryIndex The primary index from the forward transform
 * @returns The original text
 */
export function inverseBurrowsWheelerTransform(
  transformed: string, 
  primaryIndex: number
): string {
  if (!transformed) return '';
  
  const textWithMarker = transformed + '$';
  const n = textWithMarker.length;
  
  // Create the transformation table
  const table: string[][] = Array(n).fill(null).map(() => []);
  
  // Fill the table column by column
  for (let col = 0; col < n; col++) {
    // Add the transformed string as a column
    for (let row = 0; row < n; row++) {
      table[row].unshift(textWithMarker[row]);
    }
    
    // Sort the rows
    table.sort((a, b) => a.join('').localeCompare(b.join('')));
  }
  
  // Extract the original string from the primary index row
  const originalWithMarker = table[primaryIndex].join('');
  return originalWithMarker.slice(0, -1); // Remove the marker
}

/**
 * Move-to-Front Transform
 * @param text Input text to transform
 * @returns Transformed indices and alphabet
 */
export function moveToFrontTransform(text: string): TransformResult {
  if (!text) return { transformed: '', primaryIndex: 0 };
  
  // Initialize alphabet (assuming ASCII printable characters)
  const alphabet = Array.from(new Set(text)).sort();
  const indices: number[] = [];
  
  for (const char of text) {
    const index = alphabet.indexOf(char);
    indices.push(index);
    
    // Move character to front
    alphabet.splice(index, 1);
    alphabet.unshift(char);
  }
  
  return {
    transformed: indices.join(','),
    primaryIndex: 0,
    metadata: {
      alphabet: Array.from(new Set(text)).sort(),
      averageIndex: indices.reduce((a, b) => a + b, 0) / indices.length
    }
  };
}

/**
 * Inverse Move-to-Front Transform
 * @param indices Comma-separated indices
 * @param originalAlphabet Original alphabet
 * @returns Reconstructed text
 */
export function inverseMoveToFrontTransform(
  indices: string, 
  originalAlphabet: string[]
): string {
  if (!indices) return '';
  
  const indexArray = indices.split(',').map(Number);
  const alphabet = [...originalAlphabet];
  let result = '';
  
  for (const index of indexArray) {
    const char = alphabet[index];
    result += char;
    
    // Move character to front
    alphabet.splice(index, 1);
    alphabet.unshift(char);
  }
  
  return result;
}

/**
 * Run-Length Encoding
 * @param text Input text to encode
 * @returns RLE encoded string
 */
export function runLengthEncode(text: string): TransformResult {
  if (!text) return { transformed: '', primaryIndex: 0 };
  
  let encoded = '';
  let count = 1;
  let currentChar = text[0];
  
  for (let i = 1; i < text.length; i++) {
    if (text[i] === currentChar) {
      count++;
    } else {
      encoded += count > 1 ? `${count}${currentChar}` : currentChar;
      currentChar = text[i];
      count = 1;
    }
  }
  
  // Handle the last run
  encoded += count > 1 ? `${count}${currentChar}` : currentChar;
  
  const compressionRatio = text.length / encoded.length;
  
  return {
    transformed: encoded,
    primaryIndex: 0,
    metadata: {
      originalLength: text.length,
      encodedLength: encoded.length,
      compressionRatio
    }
  };
}

/**
 * Run-Length Decoding
 * @param encoded RLE encoded string
 * @returns Decoded string
 */
export function runLengthDecode(encoded: string): string {
  if (!encoded) return '';
  
  let decoded = '';
  let i = 0;
  
  while (i < encoded.length) {
    if (i + 1 < encoded.length && /\d/.test(encoded[i])) {
      // Extract the count
      let countStr = '';
      while (i < encoded.length && /\d/.test(encoded[i])) {
        countStr += encoded[i];
        i++;
      }
      
      const count = parseInt(countStr);
      const char = encoded[i];
      decoded += char.repeat(count);
      i++;
    } else {
      decoded += encoded[i];
      i++;
    }
  }
  
  return decoded;
}

/**
 * Complete BWT compression pipeline
 * @param text Input text to compress
 * @returns Array of compression steps with metadata
 */
export function compressText(text: string): CompressionStep[] {
  const steps: CompressionStep[] = [];
  
  // Step 1: Original text
  steps.push({
    name: 'Original',
    input: text,
    output: text,
    ratio: 1.0
  });
  
  // Step 2: Burrows-Wheeler Transform
  const bwtResult = burrowsWheelerTransform(text);
  steps.push({
    name: 'BWT',
    input: text,
    output: bwtResult.transformed,
    ratio: text.length / bwtResult.transformed.length,
    metadata: { primaryIndex: bwtResult.primaryIndex, ...bwtResult.metadata }
  });
  
  // Step 3: Move-to-Front Transform
  const mtfResult = moveToFrontTransform(bwtResult.transformed);
  steps.push({
    name: 'MTF',
    input: bwtResult.transformed,
    output: mtfResult.transformed,
    ratio: bwtResult.transformed.length / mtfResult.transformed.length,
    metadata: mtfResult.metadata
  });
  
  // Step 4: Run-Length Encoding
  const rleResult = runLengthEncode(mtfResult.transformed);
  steps.push({
    name: 'RLE',
    input: mtfResult.transformed,
    output: rleResult.transformed,
    ratio: mtfResult.transformed.length / rleResult.transformed.length,
    metadata: rleResult.metadata
  });
  
  return steps;
}

/**
 * Complete BWT decompression pipeline
 * @param compressed Compressed data with metadata
 * @returns Decompressed text
 */
export function decompressText(steps: CompressionStep[]): string {
  if (steps.length < 4) return '';
  
  // Reverse the compression steps
  let current = steps[3].output; // Start with RLE output
  
  // Step 1: RLE decode
  current = runLengthDecode(current);
  
  // Step 2: Inverse MTF
  const mtfMetadata = steps[2].metadata;
  if (mtfMetadata?.alphabet) {
    current = inverseMoveToFrontTransform(current, mtfMetadata.alphabet);
  }
  
  // Step 3: Inverse BWT
  const bwtMetadata = steps[1].metadata;
  if (bwtMetadata?.primaryIndex !== undefined) {
    current = inverseBurrowsWheelerTransform(current, bwtMetadata.primaryIndex);
  }
  
  return current;
}