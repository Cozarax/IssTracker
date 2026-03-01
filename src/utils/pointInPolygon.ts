// Ray-casting point-in-polygon for GeoJSON geometries.
// GeoJSON coordinate order: [lng, lat]

function pointInRing(lat: number, lng: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]; // [lng, lat]
    const [xj, yj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}

function pointInPolygon(lat: number, lng: number, rings: number[][][]): boolean {
  // First ring = outer boundary, rest = holes
  if (!pointInRing(lat, lng, rings[0])) return false;
  for (let h = 1; h < rings.length; h++) {
    if (pointInRing(lat, lng, rings[h])) return false;
  }
  return true;
}

export function pointInGeoJSON(
  lat: number,
  lng: number,
  geometry: { type: string; coordinates: unknown }
): boolean {
  if (geometry.type === 'Polygon') {
    return pointInPolygon(lat, lng, geometry.coordinates as number[][][]);
  }
  if (geometry.type === 'MultiPolygon') {
    return (geometry.coordinates as number[][][][]).some(poly =>
      pointInPolygon(lat, lng, poly)
    );
  }
  return false;
}
