/**
 * Metadata Encoder/Decoder for Contentstack Live Preview
 * 
 * This module encodes source map metadata (data-cslp paths) into string values
 * using invisible unicode characters. The visible text remains unchanged for users,
 * but the metadata can be extracted for live editing functionality.
 * 
 * Encoding Strategy:
 * - Zero Width Space (U+200B): Field separator
 * - Zero Width Non-Joiner (U+200C): 0 bit
 * - Zero Width Joiner (U+200D): 1 bit
 * - Word Joiner (U+2060): Start marker
 * - Invisible Separator (U+2063): End marker
 */

// Unicode characters used for encoding
const CHARS = {
  START: '\u2060',        // Word Joiner - marks start of encoded metadata
  END: '\u2063',          // Invisible Separator - marks end of encoded metadata
  SEPARATOR: '\u200B',    // Zero Width Space - separates fields
  BIT_0: '\u200C',        // Zero Width Non-Joiner - represents binary 0
  BIT_1: '\u200D',        // Zero Width Joiner - represents binary 1
} as const;

/**
 * Encodes a string into binary representation using invisible unicode characters
 */
function encodeStringToBinary(str: string): string {
  let binary = '';
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    const binaryChar = charCode.toString(2).padStart(16, '0');
    
    for (const bit of binaryChar) {
      binary += bit === '1' ? CHARS.BIT_1 : CHARS.BIT_0;
    }
    
    if (i < str.length - 1) {
      binary += CHARS.SEPARATOR;
    }
  }
  return binary;
}

/**
 * Decodes binary representation back to a string
 */
function decodeBinaryToString(binary: string): string {
  const chars = binary.split(CHARS.SEPARATOR);
  let result = '';
  
  for (const char of chars) {
    if (!char) continue;
    
    let charCode = 0;
    for (let i = 0; i < char.length; i++) {
      const bit = char[i];
      if (bit === CHARS.BIT_1) {
        charCode = (charCode << 1) | 1;
      } else if (bit === CHARS.BIT_0) {
        charCode = (charCode << 1) | 0;
      }
    }
    
    if (charCode > 0) {
      result += String.fromCharCode(charCode);
    }
  }
  
  return result;
}

/**
 * Metadata that can be encoded into a string value
 */
export interface EncodedMetadata {
  cslp: string;                    // data-cslp path
  parentField?: string;            // data-cslp-parent-field (for arrays)
}

/**
 * Encodes metadata into a string value using invisible unicode characters.
 * The original string content is preserved and readable, with metadata
 * invisibly appended at the end.
 * 
 * @param originalValue - The original string value
 * @param metadata - Metadata to encode (cslp path and optional parent field)
 * @returns String with invisible metadata encoded at the end
 */
export function encodeMetadataIntoString(
  originalValue: string,
  metadata: EncodedMetadata
): string {
  if (!originalValue || typeof originalValue !== 'string') {
    return originalValue;
  }
  
  // Create metadata payload as JSON
  const metadataJson = JSON.stringify(metadata);
  
  // Encode the JSON into invisible characters
  const encodedMetadata = encodeStringToBinary(metadataJson);
  
  // Append invisible metadata to the original string
  return originalValue + CHARS.START + encodedMetadata + CHARS.END;
}

/**
 * Extracts encoded metadata from a string value
 * 
 * @param value - String value that may contain encoded metadata
 * @returns Object containing the clean string and extracted metadata
 */
export function decodeMetadataFromString(value: any): {
  cleanValue: any;
  metadata: EncodedMetadata | null;
} {
  // Handle non-string values
  if (!value || typeof value !== 'string') {
    return { cleanValue: value, metadata: null };
  }
  
  // Check if string contains encoded metadata
  const startIndex = value.indexOf(CHARS.START);
  const endIndex = value.indexOf(CHARS.END);
  
  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    return { cleanValue: value, metadata: null };
  }
  
  // Extract clean value (without invisible characters)
  const cleanValue = value.substring(0, startIndex);
  
  // Extract encoded metadata
  const encodedMetadata = value.substring(startIndex + 1, endIndex);
  
  try {
    // Decode binary to JSON string
    const metadataJson = decodeBinaryToString(encodedMetadata);
    
    // Parse JSON to get metadata object
    const metadata = JSON.parse(metadataJson) as EncodedMetadata;
    
    return { cleanValue, metadata };
  } catch (error) {
    console.warn('Failed to decode metadata from string:', error);
    return { cleanValue, metadata: null };
  }
}

/**
 * Checks if a string contains encoded metadata
 */
export function hasEncodedMetadata(value: any): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }
  
  return value.includes(CHARS.START) && value.includes(CHARS.END);
}

/**
 * Removes encoded metadata from a string, returning only the clean value
 */
export function stripMetadata(value: any): any {
  const { cleanValue } = decodeMetadataFromString(value);
  return cleanValue;
}

/**
 * Creates data-cslp attributes object from encoded metadata
 * This is useful for spreading onto React elements
 */
export function getDataAttributesFromString(value: any): Record<string, string> | null {
  const { metadata } = decodeMetadataFromString(value);
  
  if (!metadata) {
    return null;
  }
  
  const attributes: Record<string, string> = {
    'data-cslp': metadata.cslp,
  };
  
  if (metadata.parentField) {
    attributes['data-cslp-parent-field'] = metadata.parentField;
  }
  
  return attributes;
}

