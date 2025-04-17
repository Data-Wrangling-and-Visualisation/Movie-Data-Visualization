import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Text, Html } from '@react-three/drei';
import { useState } from 'react';
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';


function getBarColor(absVal) {
  
    if (absVal < 0.2) return '#e6f2ff'; // очень светлый голубой
    if (absVal < 0.4) return '#b3d9ff'; // светло-голубой
    if (absVal < 0.6) return '#80bfff'; // голубой
    if (absVal < 0.8) return '#4da6ff'; // насыщенный голубой
    return '#0066cc';                   // глубокий синий (максимум)
}

function CorrelationMatrix3D({ keys, matrix }) {
  const [hovered, setHovered] = useState(null);
  const groupRef = useRef();

  const size = keys.length;
  const spacing = 1.5;
  const centerOffset = ((size - 1) * spacing) / 2;

  // Цвета: от светло-синего к насыщенно-синему
  const lowColor = new THREE.Color('#F0FFFF');   // светло-синий
  const highColor = new THREE.Color('#3399ff');  // насыщенный синий

  return (
    <Canvas camera={{ position: [0, size * 2, size * 2], fov: 45 }} >
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 15, 10]} intensity={0.9} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={0}   // минимум — примерно 30° над горизонтом
        maxPolarAngle={Math.PI / 2}
      />
      <group ref={groupRef} position={[-centerOffset, 0, -centerOffset]}>
        {matrix.map((row, i) =>
            row.map((value, j) => {
                const absVal = Math.abs(value);
                const height = absVal * 2 || 0.01;

                const color = getBarColor(absVal);

                return (
                <group key={`${i}-${j}`} onPointerOver={(e) => setHovered({ i, j, value })} onPointerOut={() => setHovered(null)}>
                    <mesh
                    position={[i * spacing, height / 2, j * spacing]}
                    >
                    <boxGeometry args={[1, height, 1]} />
                    <meshPhysicalMaterial
                    color={color}
                    transparent
                    opacity={0.95}
                    
                    />
                    </mesh>

                    {hovered?.i === i && hovered?.j === j && (
                        <Html position={[i * spacing, height + 0.3, j * spacing]}>
                        <div style={{
                            background: 'rgba(255,255,255,0.8)',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            color: '#333',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                        }}>
                            {keys[i]} ↔ {keys[j]}: <strong>{hovered.value.toFixed(2)}</strong>
                        </div>
                        </Html>
                    )}
                </group>
                );
            })
            )}
    

        {keys.map((key, i) => (
        <Text
            key={`x-${key}`}
            rotation={[-Math.PI / 2, 0, -Math.PI / 6]}
            position={[i * spacing, -0.5, spacing*8]}
            fontSize={0.3}
            color="#222"
            anchorX="center"
            anchorY="middle"
        >
            {key}
        </Text>
        ))}

        {keys.map((key, j) => (
        <Text
            key={`z-${key}`}
            rotation={[-Math.PI / 2, 0, -Math.PI / 6]}
            position={[-spacing - 0.7, -0.5, j * spacing]}
            fontSize={0.3}
            color="#222"
            anchorX="center"
            anchorY="middle"
        >
            {key}
        </Text>
        ))}
      </group>
    </Canvas>
  );
}

export default CorrelationMatrix3D;
