import {
  Color,
  InstancedMesh,
  Object3D,
  SphereGeometry,
  MeshStandardMaterial,
  Mesh
} from 'three';
import { GraphCanvas } from '../../src';
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Instances, Instance } from '@react-three/drei';
import { Perf } from 'r3f-perf';

export default {
  title: 'Demos/Performance',
  component: GraphCanvas
};

const DreiSpheres = ({ nodeCount }: { nodeCount: number }) => {
  const spheres = useMemo(() => {
    const sphereArray: any[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const cubeRoot = Math.cbrt(nodeCount);
      const x = (i % cubeRoot) - cubeRoot / 2;
      const y = (Math.floor(i / cubeRoot) % cubeRoot) - cubeRoot / 2;
      const z = Math.floor(i / (cubeRoot * cubeRoot)) - cubeRoot / 2;

      const position = [x * 2.2, y * 2.2, z * 2.2];
      const scale = 0.4 + Math.random() * 0.4;
      const color = new Color().setHSL(Math.random(), 0.7, 0.6);

      sphereArray.push({
        position,
        scale,
        color: color.getHex()
      });
    }

    return sphereArray;
  }, [nodeCount]);

  return (
    <>
      {spheres.map((sphere, index) => (
        <mesh key={index} position={sphere.position} scale={sphere.scale}>
          <sphereGeometry attach="geometry" args={[0.7, 25, 25]} />
          <meshStandardMaterial color={sphere.color} />
        </mesh>
        // <Text
        //   position={[
        //     sphere.position[0],
        //     sphere.position[1] + 0.5,
        //     sphere.position[2],
        //   ]}
        //   fontSize={0.3}
        //   color="white"
        //   anchorX="center"
        //   anchorY="middle"
        //   outlineWidth={0.02}
        //   outlineColor="black"
        // >
        //   {index}
        // </Text>
      ))}
    </>
  );
};

const R3FSpheres = ({ nodeCount }: { nodeCount: number }) => {
  const { scene } = useThree();

  useEffect(() => {
    const spheres: Mesh[] = [];
    const geometry = new SphereGeometry(0.7, 25, 25);

    for (let i = 0; i < nodeCount; i++) {
      const cubeRoot = Math.cbrt(nodeCount);
      const x = (i % cubeRoot) - cubeRoot / 2;
      const y = (Math.floor(i / cubeRoot) % cubeRoot) - cubeRoot / 2;
      const z = Math.floor(i / (cubeRoot * cubeRoot)) - cubeRoot / 2;

      const position = [x * 2.2, y * 2.2, z * 2.2];
      const scale = 0.4 + Math.random() * 0.4;
      const color = new Color().setHSL(Math.random(), 0.7, 0.6);

      const material = new MeshStandardMaterial({ color });
      const mesh = new Mesh(geometry, material);

      mesh.position.set(position[0], position[1], position[2]);
      mesh.scale.setScalar(scale);

      scene.add(mesh);
      spheres.push(mesh);
    }

    return () => {
      spheres.forEach(sphere => {
        scene.remove(sphere);
        if (Array.isArray(sphere.material)) {
          sphere.material.forEach(mat => mat.dispose());
        } else {
          sphere.material.dispose();
        }
      });
      geometry.dispose();
    };
  }, [scene, nodeCount]);

  return null;
};

const DreiInstancesSpheres = ({ nodeCount }: { nodeCount: number }) => {
  const sphereData = useMemo(() => {
    const data: any[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const cubeRoot = Math.cbrt(nodeCount);
      const x = (i % cubeRoot) - cubeRoot / 2;
      const y = (Math.floor(i / cubeRoot) % cubeRoot) - cubeRoot / 2;
      const z = Math.floor(i / (cubeRoot * cubeRoot)) - cubeRoot / 2;

      const position = [x * 2.2, y * 2.2, z * 2.2];
      const scale = 0.4 + Math.random() * 0.4;
      const color = new Color().setHSL(Math.random(), 0.7, 0.6);

      data.push({
        position,
        scale,
        color
      });
    }

    return data;
  }, [nodeCount]);

  return (
    <Instances limit={nodeCount}>
      <sphereGeometry args={[0.7, 25, 25]} />
      <meshStandardMaterial />
      {sphereData.map((sphere, i) => (
        <Instance
          key={i}
          position={sphere.position}
          scale={sphere.scale}
          color={sphere.color}
        />
      ))}
    </Instances>
  );
};

const InstancedMeshSpheres = ({ nodeCount }: { nodeCount: number }) => {
  const meshRef = useRef<InstancedMesh>(null);
  const tempObject = useMemo(() => new Object3D(), []);

  const sphereData = useMemo(() => {
    const data: any[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const cubeRoot = Math.cbrt(nodeCount);
      const x = (i % cubeRoot) - cubeRoot / 2;
      const y = (Math.floor(i / cubeRoot) % cubeRoot) - cubeRoot / 2;
      const z = Math.floor(i / (cubeRoot * cubeRoot)) - cubeRoot / 2;

      const position = [x * 2.2, y * 2.2, z * 2.2];
      const scale = 0.4 + Math.random() * 0.4;
      const color = new Color().setHSL(Math.random(), 0.7, 0.6);

      data.push({
        position,
        scale,
        color
      });
    }

    return data;
  }, [nodeCount]);

  useEffect(() => {
    if (meshRef.current) {
      sphereData.forEach((sphere, i) => {
        tempObject.position.set(
          sphere.position[0],
          sphere.position[1],
          sphere.position[2]
        );
        tempObject.scale.setScalar(sphere.scale);
        tempObject.updateMatrix();
        meshRef.current!.setMatrixAt(i, tempObject.matrix);
        meshRef.current!.setColorAt(i, sphere.color);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true;
      }
    }
  }, [sphereData, tempObject]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, nodeCount]}>
      <sphereGeometry args={[0.7, 25, 25]} />
      <meshStandardMaterial />
    </instancedMesh>
  );
};

type RenderMode = 'drei' | 'drei-instances' | 'instanced' | 'native';

const SphereRenderer = ({
  mode,
  nodeCount
}: {
  mode: RenderMode;
  nodeCount: number;
}) => {
  switch (mode) {
    case 'drei':
      return <DreiSpheres nodeCount={nodeCount} />;
    case 'drei-instances':
      return <DreiInstancesSpheres nodeCount={nodeCount} />;
    case 'instanced':
      return <InstancedMeshSpheres nodeCount={nodeCount} />;
    case 'native':
      return <R3FSpheres nodeCount={nodeCount} />;
    default:
      return null;
  }
};

export const Compare = () => {
  const [renderMode, setRenderMode] = useState<RenderMode>('drei');
  const [nodeCount, setNodeCount] = useState(20000);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '10px',
          borderRadius: '5px',
          color: 'white'
        }}
      >
        <div style={{ marginBottom: '10px' }}>
          <div>
            Node Count: <b>{nodeCount.toLocaleString()}</b>
          </div>
          <input
            type="range"
            min="5000"
            max="50000"
            step="5000"
            value={nodeCount}
            onChange={e => setNodeCount(parseInt(e.target.value))}
            style={{ width: '200px', marginTop: '5px' }}
          />
        </div>
        <div>Rendering Mode:</div>
        <label style={{ display: 'block', margin: '5px 0' }}>
          <input
            type="radio"
            name="renderMode"
            value="drei"
            checked={renderMode === 'drei'}
            onChange={e => setRenderMode(e.target.value as RenderMode)}
            style={{ marginRight: '5px' }}
          />
          Drei Individual Meshes
        </label>

        <label style={{ display: 'block', margin: '5px 0' }}>
          <input
            type="radio"
            name="renderMode"
            value="native"
            checked={renderMode === 'native'}
            onChange={e => setRenderMode(e.target.value as RenderMode)}
            style={{ marginRight: '5px' }}
          />
          R3F Individual Meshes
        </label>
        <label style={{ display: 'block', margin: '5px 0' }}>
          ------ Instances ------
        </label>
        <label style={{ display: 'block', margin: '5px 0' }}>
          <input
            type="radio"
            name="renderMode"
            value="drei-instances"
            checked={renderMode === 'drei-instances'}
            onChange={e => setRenderMode(e.target.value as RenderMode)}
            style={{ marginRight: '5px' }}
          />
          Drei Instances
        </label>
        <label style={{ display: 'block', margin: '5px 0' }}>
          <input
            type="radio"
            name="renderMode"
            value="instanced"
            checked={renderMode === 'instanced'}
            onChange={e => setRenderMode(e.target.value as RenderMode)}
            style={{ marginRight: '5px' }}
          />
          R3F InstancedMesh
        </label>
      </div>

      <Canvas
        camera={{
          position: [0, 0, 70],
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#222222']} />
        <ambientLight intensity={0.2} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        <SphereRenderer mode={renderMode} nodeCount={nodeCount} />

        <OrbitControls
          enableDamping={true}
          dampingFactor={0.05}
          enableZoom={true}
          enablePan={false}
          minDistance={10}
          maxDistance={150}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
        />
        <Perf position="top-right" />
      </Canvas>
    </div>
  );
};
