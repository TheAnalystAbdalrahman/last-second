type Vec3 = [number, number, number]

export interface STLParseResult {
  volumeCm3: number
  boundingBox: { l: number; w: number; h: number }
}

function signedVolumeOfTriangle(v1: Vec3, v2: Vec3, v3: Vec3): number {
  return (
    (v1[0] * (v2[1] * v3[2] - v3[1] * v2[2]) +
      v2[0] * (v3[1] * v1[2] - v1[1] * v3[2]) +
      v3[0] * (v1[1] * v2[2] - v2[1] * v1[2])) /
    6
  )
}

function updateBounds(
  x: number,
  y: number,
  z: number,
  bounds: {
    minX: number
    maxX: number
    minY: number
    maxY: number
    minZ: number
    maxZ: number
  }
) {
  bounds.minX = Math.min(bounds.minX, x)
  bounds.maxX = Math.max(bounds.maxX, x)
  bounds.minY = Math.min(bounds.minY, y)
  bounds.maxY = Math.max(bounds.maxY, y)
  bounds.minZ = Math.min(bounds.minZ, z)
  bounds.maxZ = Math.max(bounds.maxZ, z)
}

function parseBinarySTL(buffer: ArrayBuffer): STLParseResult {
  const view = new DataView(buffer)
  const triangleCount = view.getUint32(80, true)
  const bounds = {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
    minZ: Infinity,
    maxZ: -Infinity,
  }
  let volume = 0
  let offset = 84

  for (let i = 0; i < triangleCount; i++) {
    offset += 12
    const v1: Vec3 = [view.getFloat32(offset, true), view.getFloat32(offset + 4, true), view.getFloat32(offset + 8, true)]
    offset += 12
    const v2: Vec3 = [view.getFloat32(offset, true), view.getFloat32(offset + 4, true), view.getFloat32(offset + 8, true)]
    offset += 12
    const v3: Vec3 = [view.getFloat32(offset, true), view.getFloat32(offset + 4, true), view.getFloat32(offset + 8, true)]
    offset += 14

    updateBounds(v1[0], v1[1], v1[2], bounds)
    updateBounds(v2[0], v2[1], v2[2], bounds)
    updateBounds(v3[0], v3[1], v3[2], bounds)
    volume += signedVolumeOfTriangle(v1, v2, v3)
  }

  const volumeMm3 = Math.abs(volume)
  return {
    volumeCm3: volumeMm3 / 1000,
    boundingBox: {
      l: bounds.maxX - bounds.minX,
      w: bounds.maxY - bounds.minY,
      h: bounds.maxZ - bounds.minZ,
    },
  }
}

function parseAsciiSTL(text: string): STLParseResult {
  const bounds = {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
    minZ: Infinity,
    maxZ: -Infinity,
  }
  let volume = 0
  const vertexRegex =
    /vertex\s+([-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?)\s+([-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?)\s+([-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?)/g

  const vertices: Vec3[] = []
  let match: RegExpExecArray | null

  while ((match = vertexRegex.exec(text)) !== null) {
    const v: Vec3 = [parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])]
    vertices.push(v)
    updateBounds(v[0], v[1], v[2], bounds)

    if (vertices.length === 3) {
      volume += signedVolumeOfTriangle(vertices[0], vertices[1], vertices[2])
      vertices.length = 0
    }
  }

  const volumeMm3 = Math.abs(volume)
  return {
    volumeCm3: volumeMm3 / 1000,
    boundingBox: {
      l: bounds.maxX - bounds.minX,
      w: bounds.maxY - bounds.minY,
      h: bounds.maxZ - bounds.minZ,
    },
  }
}

function isBinarySTL(buffer: ArrayBuffer): boolean {
  const view = new DataView(buffer)
  if (buffer.byteLength < 84) return false

  const header = new TextDecoder().decode(new Uint8Array(buffer, 0, 80))
  if (header.trimStart().toLowerCase().startsWith('solid')) {
    const tail = new TextDecoder().decode(new Uint8Array(buffer)).slice(-80).toLowerCase()
    if (tail.includes('endsolid')) return false
  }

  const triangleCount = view.getUint32(80, true)
  const expectedSize = 84 + triangleCount * 50
  return expectedSize === buffer.byteLength
}

export async function parseSTLFile(file: File): Promise<STLParseResult> {
  const buffer = await file.arrayBuffer()

  if (isBinarySTL(buffer)) {
    return parseBinarySTL(buffer)
  }

  const text = new TextDecoder().decode(buffer)
  return parseAsciiSTL(text)
}
