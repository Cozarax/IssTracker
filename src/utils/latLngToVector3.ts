import { Vector3, Spherical } from 'three';

const latLngToVector3 = ({ lat, lng }: { lat: number; lng: number }, radius: number) => {
      const phi = Math.PI * (0.5 - lat / 180);
      const theta = Math.PI * (lng / 180);
      return new Vector3().setFromSpherical(new Spherical(radius, phi, theta));
    };
export default latLngToVector3;