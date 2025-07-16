"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, ContactShadows, useGLTF, useTexture, Html } from "@react-three/drei"
import { Suspense, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as THREE from "three"
import { TEXTURE_LIBRARY, getTextureById, getTextureMaps, getWoodTextures, getMetalTextures } from "@/lib/textures"

// Loading fallback component
function LoadingFallback() {
  return (
    <Html center>
      <div className="text-white bg-black bg-opacity-50 px-4 py-2 rounded">Loading 3D Model...</div>
    </Html>
  )
}

// Generic StairModule component with better error handling
function StairModule({
  url,
  textureId,
  position = [0, 0, 0],
  ...rest
}: {
  url: string
  textureId: string
  position?: [number, number, number]
  [key: string]: any
}) {
  const { scene } = useGLTF(url)
  const textureSet = getTextureById(textureId)
  const textureMaps = useTexture(getTextureMaps(textureSet))

  const [appliedTextures, setAppliedTextures] = useState(false)

  useEffect(() => {
    if (scene && textureMaps && textureSet && !appliedTextures) {
      scene.traverse((obj) => {
        if (obj.isMesh && obj.material) {
          if (obj.material.isMeshStandardMaterial || obj.material.type === "MeshStandardMaterial") {
            Object.assign(obj.material, textureMaps)
            Object.assign(obj.material, textureSet.materialProps)
            obj.material.needsUpdate = true
          } else {
            const newMaterial = new THREE.MeshStandardMaterial()
            Object.assign(newMaterial, textureMaps)
            Object.assign(newMaterial, textureSet.materialProps)
            obj.material = newMaterial
          }
        }
      })
      setAppliedTextures(true)
    }
  }, [scene, textureMaps, textureSet, appliedTextures])

  if (!textureSet) {
    console.warn(`Texture set not found: ${textureId}`)
    return <primitive object={scene.clone()} position={position} {...rest} />
  }

  return <primitive object={scene.clone()} position={position} {...rest} />
}

// Individual GLTF components using the new texture system
function TestStairBase({
  position = [0, 0, 0],
  textureId = "dark-cherry-wood",
}: {
  position?: [number, number, number]
  textureId?: string
}) {
  return (
    <StairModule
      url="/models/limon_central/limon_central_droit_droit_base.glb"
      textureId={textureId}
      position={position}
    />
  )
}

function TestStairStep({
  position = [0, 0, 0],
  textureId = "dark-cherry-wood",
}: {
  position?: [number, number, number]
  textureId?: string
}) {
  return (
    <StairModule
      url="/models/limon_central/limon_central_droit_droit_step.glb"
      textureId={textureId}
      position={position}
    />
  )
}

function TestStairStep1({
  position = [0, 0, 0],
  textureId = "painted-metal",
}: {
  position?: [number, number, number]
  textureId?: string
}) {
  return (
    <StairModule
      url="/models/limon_central/limon_central_droit_droit_step1.glb"
      textureId={textureId}
      position={position}
    />
  )
}

function TestStairTop({
  position = [0, 0, 0],
  textureId = "dark-cherry-wood",
}: {
  position?: [number, number, number]
  textureId?: string
}) {
  return (
    <StairModule
      url="/models/limon_central/limon_central_droit_droit_top.glb"
      textureId={textureId}
      position={position}
    />
  )
}

// Texture test component - fixed to avoid conditional useTexture calls
function TextureTest() {
  // Load all textures at once to avoid conditional hooks
  const allTextures = useTexture({
    // Wood textures
    darkCherryDiffuse: "/textures/wood/dark-cherrywood-diffuse.jpg",
    darkCherryNormal: "/textures/wood/dark-cherrywood-normal.jpg",
    darkCherryAO: "/textures/wood/dark-cherrywood-ao.jpg",
    // Metal textures
    metalDiffuse: "/textures/metal/painted_metal_diffuse.jpg",
    metalNormal: "/textures/metal/painted_metal_normal_opengl.jpg",
    metalSpecular: "/textures/metal/painted_metal_specular.jpg",
  })

  const woodTextures = getWoodTextures()
  const metalTextures = getMetalTextures()

  return (
    <group>
      {/* Wood material samples */}
      {woodTextures.map((texture, index) => (
        <group key={texture.id}>
          <mesh position={[-3 + index * 2, 1, 0]}>
            <boxGeometry args={[1, 1, 0.1]} />
            <meshStandardMaterial
              map={allTextures.darkCherryDiffuse}
              normalMap={allTextures.darkCherryNormal}
              aoMap={allTextures.darkCherryAO}
              {...texture.materialProps}
            />
          </mesh>
          <Html position={[-3 + index * 2, 0.3, 0]} center>
            <div className="text-white bg-black bg-opacity-50 px-2 py-1 rounded text-xs">{texture.name}</div>
          </Html>
        </group>
      ))}

      {/* Metal material samples */}
      {metalTextures.map((texture, index) => (
        <group key={texture.id}>
          <mesh position={[-3 + index * 2, -1, 0]}>
            <boxGeometry args={[1, 1, 0.1]} />
            <meshStandardMaterial
              map={allTextures.metalDiffuse}
              normalMap={allTextures.metalNormal}
              metalnessMap={allTextures.metalSpecular}
              {...texture.materialProps}
            />
          </mesh>
          <Html position={[-3 + index * 2, -1.7, 0]} center>
            <div className="text-white bg-black bg-opacity-50 px-2 py-1 rounded text-xs">{texture.name}</div>
          </Html>
        </group>
      ))}
    </group>
  )
}

// Complete stair assembly with texture support
function CompleteStair({
  positions,
  arraySize,
  stepSpacing,
  step1Spacing,
  componentTextures,
  scale = 1,
}: {
  positions: { [key: string]: [number, number, number] }
  arraySize: number
  stepSpacing: [number, number, number]
  step1Spacing: [number, number, number]
  componentTextures: { [key: string]: string }
  scale?: number
}) {
  return (
    <group scale={[scale, scale, scale]}>
      {/* Base - single instance with texture */}
      <TestStairBase position={positions.base} textureId={componentTextures.base} />

      {/* Step array with texture */}
      {Array.from({ length: arraySize }).map((_, i) => (
        <TestStairStep
          key={`step-${i}`}
          position={[
            positions.step[0] + stepSpacing[0] * i,
            positions.step[1] + stepSpacing[1] * i,
            positions.step[2] + stepSpacing[2] * i,
          ]}
          textureId={componentTextures.step}
        />
      ))}

      {/* Step1 array with texture */}
      {Array.from({ length: arraySize + 1 }).map((_, i) => (
        <TestStairStep1
          key={`step1-${i}`}
          position={[
            positions.step1[0] + step1Spacing[0] * i,
            positions.step1[1] + step1Spacing[1] * i,
            positions.step1[2] + step1Spacing[2] * i,
          ]}
          textureId={componentTextures.step1}
        />
      ))}

      {/* Top with texture */}
      <TestStairTop
        position={[
          positions.top[0] + stepSpacing[0] * (arraySize - 1),
          positions.top[1] + stepSpacing[1] * (arraySize - 1),
          positions.top[2] + stepSpacing[2] * (arraySize - 1),
        ]}
        textureId={componentTextures.top}
      />
    </group>
  )
}

export default function GLTFTestPage() {
  const [selectedModel, setSelectedModel] = useState<string>("complete")
  const [showTextures, setShowTextures] = useState(false)

  // Array settings with optimal values
  const [arraySize, setArraySize] = useState([8])
  const [stepSpacing, setStepSpacing] = useState([-10.133, 6.941, 0.0] as [number, number, number])
  const [step1Spacing, setStep1Spacing] = useState([-10.133, 6.941, 0.3] as [number, number, number])

  const [globalScale, setGlobalScale] = useState([0.01])

  // Texture selection state using new texture IDs
  const [componentTextures, setComponentTextures] = useState({
    base: "dark-cherry-wood",
    step: "dark-cherry-wood",
    step1: "painted-metal",
    top: "dark-cherry-wood",
  })

  // Position states for each component
  const [positions, setPositions] = useState({
    base: [0, 0, 0] as [number, number, number],
    step1: [0, 0, 0] as [number, number, number],
    step: [0, 0, 0] as [number, number, number],
    top: [0, 0, 0] as [number, number, number],
  })

  const updatePosition = (component: string, axis: "x" | "y" | "z", value: number) => {
    setPositions((prev) => {
      const newPos = [...prev[component as keyof typeof prev]] as [number, number, number]
      const axisIndex = axis === "x" ? 0 : axis === "y" ? 1 : 2
      newPos[axisIndex] = value
      return {
        ...prev,
        [component]: newPos,
      }
    })
  }

  const updateSpacing = (type: "step" | "step1", axis: "x" | "y" | "z", value: number) => {
    const axisIndex = axis === "x" ? 0 : axis === "y" ? 1 : 2
    if (type === "step") {
      const newSpacing = [...stepSpacing] as [number, number, number]
      newSpacing[axisIndex] = value
      setStepSpacing(newSpacing)
    } else {
      const newSpacing = [...step1Spacing] as [number, number, number]
      newSpacing[axisIndex] = value
      setStep1Spacing(newSpacing)
    }
  }

  const updateSpacingFromInput = (type: "step" | "step1", axis: "x" | "y" | "z", value: string) => {
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue)) {
      updateSpacing(type, axis, numValue)
    }
  }

  const updatePositionFromInput = (component: string, axis: "x" | "y" | "z", value: string) => {
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue)) {
      updatePosition(component, axis, numValue)
    }
  }

  const updateComponentTexture = (component: string, textureId: string) => {
    setComponentTextures((prev) => ({
      ...prev,
      [component]: textureId,
    }))
  }

  const renderSelectedModel = () => {
    const scale = globalScale[0]

    if (showTextures) {
      return <TextureTest />
    }

    switch (selectedModel) {
      case "base":
        return (
          <group scale={[scale, scale, scale]}>
            <TestStairBase position={positions.base} textureId={componentTextures.base} />
          </group>
        )
      case "step":
        return (
          <group scale={[scale, scale, scale]}>
            <TestStairStep position={positions.step} textureId={componentTextures.step} />
          </group>
        )
      case "step1":
        return (
          <group scale={[scale, scale, scale]}>
            <TestStairStep1 position={positions.step1} textureId={componentTextures.step1} />
          </group>
        )
      case "top":
        return (
          <group scale={[scale, scale, scale]}>
            <TestStairTop position={positions.top} textureId={componentTextures.top} />
          </group>
        )
      case "complete":
        return (
          <CompleteStair
            positions={positions}
            arraySize={arraySize[0]}
            stepSpacing={stepSpacing}
            step1Spacing={step1Spacing}
            componentTextures={componentTextures}
            scale={scale}
          />
        )
      default:
        return (
          <CompleteStair
            positions={positions}
            arraySize={arraySize[0]}
            stepSpacing={stepSpacing}
            step1Spacing={step1Spacing}
            componentTextures={componentTextures}
            scale={scale}
          />
        )
    }
  }

  const copyDataToClipboard = () => {
    const data = {
      positions,
      arraySize: arraySize[0],
      stepSpacing,
      step1Spacing,
      componentTextures,
      availableTextures: TEXTURE_LIBRARY,
      globalScale: globalScale[0],
    }
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    console.log("Configuration copied to clipboard:", data)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700">
      {/* Header */}
      <header className="border-b border-slate-600 bg-slate-800/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
              <span className="text-xl font-semibold text-white">GLTF Model Test</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => (window.location.href = "/")}
              className="text-white border-white hover:bg-white hover:text-slate-800"
            >
              Back to Main
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-5 gap-8 h-[calc(100vh-120px)]">
          {/* Larger 3D Viewer */}
          <div className="lg:col-span-4 flex flex-col">
            <Card className="flex-1 overflow-hidden border-slate-600 bg-slate-800">
              <div className="h-full">
                <Canvas camera={{ position: [8, 6, 8], fov: 50 }}>
                  <Suspense fallback={<LoadingFallback />}>
                    {/* Enhanced lighting for better texture visibility */}
                    <ambientLight intensity={0.3} />
                    <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
                    <pointLight position={[-10, -10, -10]} intensity={0.3} />
                    <spotLight position={[0, 10, 0]} intensity={0.5} angle={0.3} />

                    {/* Larger grid helper for reference */}
                    <gridHelper args={[50, 50]} />

                    {/* Model */}
                    {renderSelectedModel()}

                    {/* Shadows and environment */}
                    <ContactShadows position={[0, -0.1, 0]} opacity={0.3} scale={25} blur={2} />
                    <Environment preset="warehouse" />

                    {/* Controls with much larger zoom range */}
                    <OrbitControls
                      enablePan={true}
                      minDistance={1}
                      maxDistance={100}
                      minPolarAngle={0}
                      maxPolarAngle={Math.PI / 2}
                    />
                  </Suspense>
                </Canvas>
              </div>
            </Card>

            {/* Configuration Data */}
            <Card className="mt-4 border-slate-600 bg-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex justify-between items-center">
                  Configuration Data
                  <Button size="sm" onClick={copyDataToClipboard} className="bg-blue-600 hover:bg-blue-700">
                    Copy Config
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <strong>Array Size:</strong> {arraySize[0]} steps
                  </div>
                  <div>
                    <strong>Global Scale:</strong> {globalScale[0].toFixed(3)} ({(1 / globalScale[0]).toFixed(0)}:1)
                  </div>
                  <div>
                    <strong>Step1 Count:</strong> {arraySize[0] + 1} (includes top)
                  </div>
                  <div>
                    <strong>Step Spacing:</strong> [{stepSpacing.map((v) => v.toFixed(3)).join(", ")}]
                  </div>
                  <div>
                    <strong>Step1 Spacing:</strong> [{step1Spacing.map((v) => v.toFixed(3)).join(", ")}]
                  </div>
                  <div className="col-span-2">
                    <strong>Textures:</strong> Base: {getTextureById(componentTextures.base)?.name}, Step:{" "}
                    {getTextureById(componentTextures.step)?.name}, Step1:{" "}
                    {getTextureById(componentTextures.step1)?.name}, Top: {getTextureById(componentTextures.top)?.name}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Compact Scrollable Controls */}
          <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            {/* Model Selection */}
            <Card className="border-slate-600 bg-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">Model Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={showTextures ? "default" : "outline"}
                  size="sm"
                  className={`w-full justify-start text-xs ${
                    showTextures ? "bg-purple-500 text-white" : "text-white border-slate-500 hover:bg-slate-700"
                  }`}
                  onClick={() => setShowTextures(!showTextures)}
                >
                  Texture Library
                </Button>

                {[
                  { id: "base", name: "Base Only", color: "bg-red-500" },
                  { id: "step", name: "Step Only", color: "bg-orange-500" },
                  { id: "step1", name: "Step1 Only", color: "bg-yellow-500" },
                  { id: "top", name: "Top Only", color: "bg-green-500" },
                  { id: "complete", name: "Complete Array", color: "bg-blue-500" },
                ].map((model) => (
                  <Button
                    key={model.id}
                    variant={selectedModel === model.id && !showTextures ? "default" : "outline"}
                    size="sm"
                    className={`w-full justify-start text-xs ${
                      selectedModel === model.id && !showTextures
                        ? `${model.color} text-white`
                        : "text-white border-slate-500 hover:bg-slate-700"
                    }`}
                    onClick={() => {
                      setSelectedModel(model.id)
                      setShowTextures(false)
                    }}
                  >
                    <div className={`w-2 h-2 rounded-full ${model.color} mr-2`}></div>
                    {model.name}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Scale Control */}
            <Card className="border-slate-600 bg-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">Global Scale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs">Scale: {globalScale[0].toFixed(3)}</Label>
                  <Slider
                    value={globalScale}
                    onValueChange={setGlobalScale}
                    min={0.001}
                    max={1}
                    step={0.001}
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs text-white border-slate-500 hover:bg-slate-700 bg-transparent"
                      onClick={() => setGlobalScale([0.01])}
                    >
                      1:100
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs text-white border-slate-500 hover:bg-slate-700 bg-transparent"
                      onClick={() => setGlobalScale([0.1])}
                    >
                      1:10
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs text-white border-slate-500 hover:bg-slate-700 bg-transparent"
                      onClick={() => setGlobalScale([1])}
                    >
                      1:1
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Texture Controls */}
            <Card className="border-slate-600 bg-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">Component Textures</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(componentTextures).map(([component, textureId]) => (
                  <div key={component} className="space-y-1">
                    <Label className="text-slate-300 text-xs capitalize">{component}</Label>
                    <Select value={textureId} onValueChange={(value) => updateComponentTexture(component, value)}>
                      <SelectTrigger className="h-8 text-xs bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <div className="px-2 py-1 text-xs text-slate-400 font-medium">Wood Textures</div>
                        {getWoodTextures().map((texture) => (
                          <SelectItem key={texture.id} value={texture.id} className="text-white hover:bg-slate-600">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded bg-amber-600"></div>
                              {texture.name}
                            </div>
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1 text-xs text-slate-400 font-medium border-t border-slate-600 mt-1">
                          Metal Textures
                        </div>
                        {getMetalTextures().map((texture) => (
                          <SelectItem key={texture.id} value={texture.id} className="text-white hover:bg-slate-600">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded bg-gray-400"></div>
                              {texture.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Array Controls */}
            <Card className="border-slate-600 bg-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">Array Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Array Size */}
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs">Array Size: {arraySize[0]}</Label>
                  <Slider value={arraySize} onValueChange={setArraySize} min={1} max={30} step={1} className="w-full" />
                </div>

                {/* Step Spacing with Input Fields */}
                <div className="space-y-3">
                  <Label className="text-slate-300 text-xs font-medium">Step Spacing</Label>
                  {(["x", "y", "z"] as const).map((axis, index) => (
                    <div key={axis} className="space-y-1">
                      <Label className="text-slate-400 text-xs">
                        {axis.toUpperCase()}: {stepSpacing[index].toFixed(3)}
                      </Label>
                      <div className="flex gap-2">
                        <Slider
                          value={[stepSpacing[index]]}
                          onValueChange={([value]) => updateSpacing("step", axis, value)}
                          min={-10}
                          max={10}
                          step={0.001}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={stepSpacing[index].toFixed(3)}
                          onChange={(e) => updateSpacingFromInput("step", axis, e.target.value)}
                          className="w-16 h-6 text-xs bg-slate-700 border-slate-600 text-white"
                          step="0.001"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Step1 Spacing with Input Fields */}
                <div className="space-y-3">
                  <Label className="text-slate-300 text-xs font-medium">Step1 Spacing</Label>
                  {(["x", "y", "z"] as const).map((axis, index) => (
                    <div key={axis} className="space-y-1">
                      <Label className="text-slate-400 text-xs">
                        {axis.toUpperCase()}: {step1Spacing[index].toFixed(3)}
                      </Label>
                      <div className="flex gap-2">
                        <Slider
                          value={[step1Spacing[index]]}
                          onValueChange={([value]) => updateSpacing("step1", axis, value)}
                          min={-10}
                          max={10}
                          step={0.001}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={step1Spacing[index].toFixed(3)}
                          onChange={(e) => updateSpacingFromInput("step1", axis, e.target.value)}
                          className="w-16 h-6 text-xs bg-slate-700 border-slate-600 text-white"
                          step="0.001"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Position Controls with Input Fields */}
            <Card className="border-slate-600 bg-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">Base Positions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(positions).map(([component, [x, y, z]]) => (
                  <div key={component} className="space-y-2">
                    <h4 className="text-white text-xs font-medium capitalize">{component}</h4>
                    {(["x", "y", "z"] as const).map((axis, index) => (
                      <div key={axis} className="space-y-1">
                        <Label className="text-slate-400 text-xs">
                          {axis.toUpperCase()}: {[x, y, z][index].toFixed(3)}
                        </Label>
                        <div className="flex gap-2">
                          <Slider
                            value={[[x, y, z][index]]}
                            onValueChange={([value]) => updatePosition(component, axis, value)}
                            min={-10}
                            max={10}
                            step={0.001}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={[x, y, z][index].toFixed(3)}
                            onChange={(e) => updatePositionFromInput(component, axis, e.target.value)}
                            className="w-16 h-6 text-xs bg-slate-700 border-slate-600 text-white"
                            step="0.001"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Reset Controls */}
            <Card className="border-slate-600 bg-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">Reset</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs text-white border-slate-500 hover:bg-slate-700 bg-transparent"
                  onClick={() => {
                    setPositions({
                      base: [0, 0, 0],
                      step1: [0, 0, 0],
                      step: [0, 0, 0],
                      top: [0, 0, 0],
                    })
                    setStepSpacing([-10.133, 6.941, 0.0])
                    setStep1Spacing([-10.133, 6.941, 0.3])
                    setArraySize([8])
                    setGlobalScale([0.01])
                    setComponentTextures({
                      base: "dark-cherry-wood",
                      step: "dark-cherry-wood",
                      step1: "painted-metal",
                      top: "dark-cherry-wood",
                    })
                  }}
                >
                  Reset All
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
