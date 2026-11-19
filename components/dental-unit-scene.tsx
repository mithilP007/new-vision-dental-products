'use client'

import { Suspense, useRef, useState, useEffect, useMemo, useCallback } from 'react'
import * as THREE from 'three'
import { Canvas, useThree, useLoader } from '@react-three/fiber'
import { Environment, OrbitControls, ContactShadows } from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * Shared loader configuration that registers a parser plugin.
 * The plugin overrides GLTFParser.textureLoader with THREE.TextureLoader.
 * This completely avoids ImageBitmapLoader's fetch(blobUrl) failure on blob URLs in Chromium.
 */
const forceTextureLoaderPlugin = (parser: any) => ({
  name: 'force-texture-loader',
  beforeRoot() {
    const textureLoader = new THREE.TextureLoader(parser.options.manager)
    textureLoader.setCrossOrigin(parser.options.crossOrigin)
    textureLoader.setRequestHeader(parser.options.requestHeader)
    parser.textureLoader = textureLoader
    return null
  }
})

const configureLoader = (loader: GLTFLoader) => {
  loader.register(forceTextureLoaderPlugin)
}

/**
 * Loads the original dental chair GLB model, preserves its embedded PBR
 * materials/textures, and positions it so it stands upright with its base
 * on the stage floor (y = 0) and is centered horizontally in world coordinates.
 */
function DentalChairModel({ onLoaded }: { onLoaded?: (height: number, center: THREE.Vector3) => void }) {
  const groupRef = useRef<THREE.Group>(null!)

  const gltf = useLoader(GLTFLoader, '/modelchair.glb', configureLoader)

  // Compute placement once after the model loads
  const placementData = useMemo(() => {
    const sceneToUse = gltf.scene

    // Update world matrices to get accurate bounds
    sceneToUse.updateMatrixWorld(true)

    const bounds = new THREE.Box3().setFromObject(sceneToUse)
    const center = bounds.getCenter(new THREE.Vector3())
    const size = bounds.getSize(new THREE.Vector3())

    // Calculate offsets to centre horizontally/depth and sit on floor
    const offsetX = -center.x
    const offsetZ = -center.z
    const offsetY = -bounds.min.y // Shift so bottom of model = y=0

    return { offsetX, offsetY, offsetZ, height: size.y, center, bounds, size }
  }, [gltf.scene])

  useEffect(() => {
    if (placementData && onLoaded) {
      // Report the model height and centre so the camera can frame it
      const verticalCenter = new THREE.Vector3(
        0,
        placementData.height / 2,
        0
      )
      onLoaded(placementData.height, verticalCenter)
    }
  }, [placementData, onLoaded])

  // Ensure original materials are preserved with correct color space and shadows
  useEffect(() => {
    gltf.scene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        child.castShadow = true
        child.receiveShadow = true

        const mat = child.material as THREE.MeshStandardMaterial

        // Ensure base colour texture uses sRGB
        if (mat.map) {
          mat.map.colorSpace = THREE.SRGBColorSpace
          mat.map.needsUpdate = true
        }
        // Normal map should be linear
        if (mat.normalMap) {
          mat.normalMap.colorSpace = THREE.LinearSRGBColorSpace
          mat.normalMap.needsUpdate = true
        }
        // Metalness/roughness map should be linear
        if (mat.metalnessMap) {
          mat.metalnessMap.colorSpace = THREE.LinearSRGBColorSpace
          mat.metalnessMap.needsUpdate = true
        }
        if (mat.roughnessMap) {
          mat.roughnessMap.colorSpace = THREE.LinearSRGBColorSpace
          mat.roughnessMap.needsUpdate = true
        }

        // Compute vertex normals if missing
        if (!child.geometry.attributes.normal) {
          child.geometry.computeVertexNormals()
        }

        mat.needsUpdate = true
      }
    })
  }, [gltf.scene])

  return (
    <group
      ref={groupRef}
      position={[placementData.offsetX, placementData.offsetY, placementData.offsetZ]}
    >
      <primitive object={gltf.scene} />
    </group>
  )
}

/**
 * Camera controller that dynamically frames the model based on its bounding box.
 * Sets camera distance so the model fills ~70% of vertical space, providing
 * generous top margin for the light attachment and bottom visibility for the base.
 */
function CameraFramer({
  modelHeight,
  modelCenter,
  controlsRef,
}: {
  modelHeight: number
  modelCenter: THREE.Vector3
  controlsRef: React.RefObject<any>
}) {
  const { camera } = useThree()

  useEffect(() => {
    if (modelHeight > 0 && camera instanceof THREE.PerspectiveCamera) {
      const fov = camera.fov * (Math.PI / 180)
      const desiredVerticalFill = 0.70
      const distance = (modelHeight / desiredVerticalFill) / (2 * Math.tan(fov / 2))

      // Professional front three-quarter perspective
      const angle = Math.PI / 6.5
      const elevationFactor = 0.28

      const camX = Math.sin(angle) * distance
      const camY = modelCenter.y + modelHeight * elevationFactor
      const camZ = Math.cos(angle) * distance

      camera.position.set(camX, camY, camZ)
      camera.lookAt(modelCenter)
      camera.updateProjectionMatrix()

      if (controlsRef.current) {
        controlsRef.current.target.copy(modelCenter)
        controlsRef.current.update()
      }
    }
  }, [modelHeight, modelCenter, camera, controlsRef])

  return null
}

/**
 * Subtle loading indicator shown while the GLB is being fetched and parsed.
 */
function LoadingIndicator() {
  return (
    <mesh position={[0, 1.05, 0]}>
      <sphereGeometry args={[0.07, 16, 16]} />
      <meshStandardMaterial
        color="#c8a675"
        emissive="#c8a675"
        emissiveIntensity={0.6}
        transparent
        opacity={0.75}
      />
    </mesh>
  )
}

export default function DentalUnitScene() {
  const [modelHeight, setModelHeight] = useState(0)
  const [modelCenter, setModelCenter] = useState(new THREE.Vector3(0, 1.05, 0))
  const controlsRef = useRef<any>(null)

  const handleModelLoaded = useCallback((height: number, center: THREE.Vector3) => {
    setModelHeight(height)
    setModelCenter(center)
  }, [])

  const minDist = modelHeight > 0 ? modelHeight * 0.9 : 2.5
  const maxDist = modelHeight > 0 ? modelHeight * 3.0 : 8

  return (
    <div className="dental-canvas" aria-label="Interactive 3D rendering of a complete dental unit. Click and drag to rotate; scroll to zoom.">
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, 1.5]}
        camera={{ position: [2.2, 1.6, 4.2], fov: 38 }}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        {/* Balanced studio fill */}
        <ambientLight intensity={0.35} color="#f4f1eb" />

        {/* Main warm key light from upper right */}
        <directionalLight
          position={[4, 6, 5]}
          intensity={2.2}
          color="#fffaf0"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0005}
        />

        {/* Cooler soft fill from left */}
        <directionalLight
          position={[-3, 4, 3]}
          intensity={1.1}
          color="#e8edf2"
        />

        {/* Warm rim light from rear-right */}
        <pointLight
          position={[2, 3, -3.5]}
          intensity={1.4}
          color="#f8e2b5"
          distance={10}
          decay={2}
        />

        {/* Ground bounce light */}
        <hemisphereLight
          args={['#f4f1ea', '#1c1b18', 0.45]}
        />

        {/* Studio environment for realistic PBR reflections */}
        <Environment preset="studio" />

        {/* Presentation stage platform */}
        <group position={[0, 0, 0]}>
          {/* Main stage platform disc (top at y = 0.0) */}
          <mesh position={[0, -0.04, 0]} receiveShadow>
            <cylinderGeometry args={[1.7, 1.7, 0.08, 64]} />
            <meshStandardMaterial color="#1a1917" roughness={0.88} metalness={0.2} />
          </mesh>

          {/* Champagne gold accent rim at base of platform */}
          <mesh position={[0, -0.08, 0]}>
            <cylinderGeometry args={[1.75, 1.75, 0.02, 64]} />
            <meshStandardMaterial color="#c8a675" roughness={0.3} metalness={0.85} />
          </mesh>

          {/* Realistic contact ambient occlusion shadow on the stage */}
          <ContactShadows
            position={[0, 0.002, 0]}
            opacity={0.6}
            scale={3.6}
            blur={1.8}
            far={2.5}
          />

          {/* The dental chair model */}
          <Suspense fallback={<LoadingIndicator />}>
            <DentalChairModel onLoaded={handleModelLoaded} />
          </Suspense>
        </group>

        {/* Dynamic camera framing based on actual model bounds */}
        {modelHeight > 0 && (
          <CameraFramer
            modelHeight={modelHeight}
            modelCenter={modelCenter}
            controlsRef={controlsRef}
          />
        )}

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableZoom={false}
          target={[modelCenter.x, modelCenter.y, modelCenter.z]}
          autoRotate
          autoRotateSpeed={0.5}
          minDistance={minDist}
          maxDistance={maxDist}
          minPolarAngle={0.35}
          maxPolarAngle={Math.PI / 2.05}
          enableDamping
          dampingFactor={0.055}
        />
      </Canvas>
      <div className="camera-indicator" aria-hidden="true"><span className="camera-icon">◉</span><span>3D / LIVE</span><i /><span>360°</span></div>
      <div className="interactive-caption"><span className="orbit-icon">↻</span><span>Interactive 3D View <b>•</b> Click &amp; drag to rotate</span></div>
    </div>
  )
}

export { DentalUnitScene }

// Preload the model in browser only
if (typeof window !== 'undefined') {
  useLoader.preload(GLTFLoader, '/modelchair.glb', configureLoader)
}
