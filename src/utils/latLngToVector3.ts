import * as THREE from 'three';

const latLngToVector3 = ({ lat, lng }: { lat: number; lng: number }, radius: number) => {
      const phi = Math.PI * (0.5 - lat / 180);
      const theta = Math.PI * (lng / 180);
      return new THREE.Vector3().setFromSpherical(new THREE.Spherical(radius, phi, theta));
    };
export default latLngToVector3;