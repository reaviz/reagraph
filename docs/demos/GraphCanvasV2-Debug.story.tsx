import React from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';

export default {
  title: 'Demos/GraphCanvasV2 - Debug',
};

// Test basic instanced mesh rendering
export const BasicInstancedMesh = () => {
  return (
    <div style={{ width: '100%', height: '600px', background: '#000' }}>
      <h3>Basic Instanced Mesh Test</h3>
      <Canvas camera={{ position: [0, 0, 100], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={0.5} />
        
        <InstancedSpheres />
      </Canvas>
    </div>
  );
};

function InstancedSpheres() {
  const count = 100;
  const mesh = React.useRef<THREE.InstancedMesh>(null);
  
  React.useEffect(() => {
    if (!mesh.current) return;
    
    const tempObject = new THREE.Object3D();
    const tempColor = new THREE.Color();
    
    // Set positions and colors
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 50;
      
      tempObject.position.set(x, y, z);
      tempObject.scale.setScalar(Math.random() * 2 + 1);
      tempObject.updateMatrix();
      
      mesh.current.setMatrixAt(i, tempObject.matrix);
      
      tempColor.setHSL(Math.random(), 0.7, 0.5);
      mesh.current.setColorAt(i, tempColor);
    }
    
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) {
      mesh.current.instanceColor.needsUpdate = true;
    }
  }, []);
  
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 16, 12]} />
      <meshPhongMaterial vertexColors />
    </instancedMesh>
  );
}

// Test instanced mesh with our materials
export const InstancedMeshWithOurSetup = () => {
  return (
    <div style={{ width: '100%', height: '600px', background: '#000' }}>
      <h3>Instanced Mesh with Our Material Setup</h3>
      <Canvas camera={{ position: [0, 0, 300], fov: 75 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[100, 100, 100]} intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={0.5} />
        
        <OurInstancedSpheres />
      </Canvas>
    </div>
  );
};

function OurInstancedSpheres() {
  const count = 10;
  const mesh = React.useRef<THREE.InstancedMesh>(null);
  
  React.useEffect(() => {
    if (!mesh.current) return;
    
    const tempMatrix = new THREE.Matrix4();
    const tempColor = new THREE.Color();
    
    // Set positions and colors similar to our node renderer
    for (let i = 0; i < count; i++) {
      const x = (i - 5) * 20;
      const y = 0;
      const z = 0;
      const size = 10;
      
      tempMatrix.makeScale(size, size, size);
      tempMatrix.setPosition(x, y, z);
      
      mesh.current.setMatrixAt(i, tempMatrix);
      
      tempColor.setHex(0xff6b6b);
      mesh.current.setColorAt(i, tempColor);
    }
    
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) {
      mesh.current.instanceColor.needsUpdate = true;
    }
    
    console.log('[Debug] Set up instances:', {
      count,
      mesh: mesh.current,
      hasInstanceMatrix: !!mesh.current.instanceMatrix,
      hasInstanceColor: !!mesh.current.instanceColor
    });
  }, []);
  
  return (
    <instancedMesh 
      ref={mesh} 
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 32, 24]} />
      <meshPhongMaterial 
        color={0xffffff}
        vertexColors
        emissive={0x111111}
        shininess={30}
      />
    </instancedMesh>
  );
}