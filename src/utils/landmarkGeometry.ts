export function calculateDistance3D(landmark1, landmark2) {
  return Math.sqrt(
    Math.pow(landmark1.x - landmark2.x, 2) +
    Math.pow(landmark1.y - landmark2.y, 2) +
    Math.pow(landmark1.z - landmark2.z, 2)
  );
}

export function calculateHorizontalDistance(landmark1, landmark2) {
  return Math.sqrt(
    Math.pow(landmark1.x - landmark2.x, 2) +
    Math.pow(landmark1.z - landmark2.z, 2)
  );
}

export function calculateAngleBetweenPoints(pivot, point1, point2) {
  // Calculate vectors
  const vector1 = {
    x: point1.x - pivot.x,
    y: point1.y - pivot.y,
    z: point1.z - pivot.z
  };
  
  const vector2 = {
    x: point2.x - pivot.x,
    y: point2.y - pivot.y,
    z: point2.z - pivot.z
  };
  
  const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y + vector1.z * vector2.z;
  
  const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y + vector1.z * vector1.z);
  const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y + vector2.z * vector2.z);
  

  if (magnitude1==0 || magnitude2==0){
    return 0
  }

  return Math.acos(dotProduct / (magnitude1 * magnitude2));
}
