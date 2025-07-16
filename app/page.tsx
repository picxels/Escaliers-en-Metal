"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, ContactShadows, useGLTF, useTexture } from "@react-three/drei"
import { Suspense, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Download, Share2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import * as THREE from "three"
import { getTextureById, getTextureMaps, getWoodTextures, getMetalTextures } from "@/lib/textures"

// Generic StairModule component for GLTF models with textures
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

  if (!textureSet) {
    console.warn(`Texture set not found: ${textureId}`)
    return <primitive object={scene.clone()} position={position} {...rest} />
  }

  useEffect(() => {
    if (scene && textureMaps && textureSet) {
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
    }
  }, [scene, textureMaps, textureSet])

  return <primitive object={scene.clone()} position={position} {...rest} />
}

// Limon Central stair components
function LimonCentralBase({ textureId = "painted-metal", position = [0, 0, 0] }) {
  return (
    <StairModule
      url="/models/limon_central/limon_central_droit_droit_base.glb"
      textureId={textureId}
      position={position}
    />
  )
}

function LimonCentralStep({ textureId = "painted-metal", position = [0, 0, 0] }) {
  return (
    <StairModule
      url="/models/limon_central/limon_central_droit_droit_step.glb"
      textureId={textureId}
      position={position}
    />
  )
}

function LimonCentralStep1({ textureId = "dark-cherry-wood", position = [0, 0, 0] }) {
  return (
    <StairModule
      url="/models/limon_central/limon_central_droit_droit_step1.glb"
      textureId={textureId}
      position={position}
    />
  )
}

function LimonCentralTop({ textureId = "painted-metal", position = [0, 0, 0] }) {
  return (
    <StairModule
      url="/models/limon_central/limon_central_droit_droit_top.glb"
      textureId={textureId}
      position={position}
    />
  )
}

// Individual GLTF components with fallback-first approach
function StairBase() {
  const { scene } = useGLTF("/models/limon_central/limon_central_droit_droit_base.glb")
  try {
    return <primitive object={scene.clone()} />
  } catch (error) {
    console.warn("Using fallback geometry for stair base:", error)
    return (
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[1.2, 0.2, 0.3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    )
  }
}

function StairStep({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF("/models/limon_central/limon_central_droit_droit_step.glb")
  try {
    return <primitive object={scene.clone()} position={position} />
  } catch (error) {
    console.warn("Using fallback geometry for stair step:", error)
    return (
      <mesh position={position}>
        <boxGeometry args={[1.2, 0.05, 0.3]} />
        <meshStandardMaterial color="#D2B48C" />
      </mesh>
    )
  }
}

function StairStep1({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF("/models/limon_central/limon_central_droit_droit_step1.glb")
  try {
    return <primitive object={scene.clone()} position={position} />
  } catch (error) {
    console.warn("Using fallback geometry for stair step1:", error)
    return (
      <mesh position={position}>
        <boxGeometry args={[1.2, 0.05, 0.3]} />
        <meshStandardMaterial color="#D2B48C" />
      </mesh>
    )
  }
}

function StairTop({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF("/models/limon_central/limon_central_droit_droit_top.glb")
  try {
    return <primitive object={scene.clone()} position={position} />
  } catch (error) {
    console.warn("Using fallback geometry for stair top:", error)
    return (
      <mesh position={position}>
        <boxGeometry args={[1.2, 0.1, 0.3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    )
  }
}

// Temporary modular stair system using basic geometry
function ModularStair({
  steps,
  stepHeight = 0.2,
  stepDepth = 0.3,
}: { steps: number; stepHeight?: number; stepDepth?: number }) {
  return (
    <group>
      {/* Base - using basic geometry */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[1.2, 0.2, 0.4]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Array of steps - using basic geometry */}
      {Array.from({ length: steps }).map((_, i) => {
        const yPos = i * stepHeight
        const zPos = i * stepDepth

        return (
          <group key={`step-${i}`}>
            {/* Step tread */}
            <mesh position={[0, yPos, zPos]}>
              <boxGeometry args={[1.2, 0.05, stepDepth]} />
              <meshStandardMaterial color="#D2B48C" />
            </mesh>

            {/* Step riser */}
            <mesh position={[0, yPos - stepHeight / 2, zPos + stepDepth / 2]}>
              <boxGeometry args={[1.2, stepHeight, 0.05]} />
              <meshStandardMaterial color="#C19A6B" />
            </mesh>

            {/* Central support beam */}
            <mesh position={[0, yPos - 0.08, zPos]}>
              <boxGeometry args={[0.1, 0.15, 0.2]} />
              <meshStandardMaterial color="#2F2F2F" />
            </mesh>
          </group>
        )
      })}

      {/* Top piece */}
      <mesh position={[0, steps * stepHeight + 0.05, steps * stepDepth]}>
        <boxGeometry args={[1.2, 0.1, 0.3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  )
}

// Main stair component with all types
function Stair({
  type,
  material,
  steps,
  width,
  componentTextures,
}: {
  type: string
  material: string
  steps: number
  width: number
  componentTextures?: { [key: string]: string }
}) {
  const stepHeight = 0.2
  const stepDepth = 0.3
  const totalHeight = steps * stepHeight

  // Material colors for fallback basic geometry
  const materialColors = {
    oak: "#D2B48C",
    walnut: "#8B4513",
    maple: "#F5DEB3",
    ebony: "#2F2F2F",
  }

  const woodColor = materialColors[material as keyof typeof materialColors] || "#D2B48C"

  // Default component textures configuration
  const defaultComponentTextures = {
    base: "painted-metal",
    step: "painted-metal",
    step1: "dark-cherry-wood",
    top: "painted-metal",
  }

  const textures = componentTextures || defaultComponentTextures

  // Use modular GLTF system for limon-central type
  if (type === "limon-central") {
    return (
      <group position={[0, -totalHeight / 2, 0]} scale={[1, 1, 1]}>
        <ModularStair steps={steps} stepHeight={stepHeight} stepDepth={stepDepth} />
      </group>
    )
  }

  if (type === "limon-central-droit") {
    const stepSpacing = [-10.133, 6.941, 0.0] as [number, number, number]
    const step1Spacing = [-10.133, 6.941, 0.3] as [number, number, number]
    const modelScale = 0.01 // Scale down the model to 1:100

    return (
      <group position={[0, -totalHeight / 2, 0]} scale={[modelScale, modelScale, modelScale]}>
        <LimonCentralBase textureId={textures.base} position={[0, 0, 0]} />

        {Array.from({ length: steps }).map((_, i) => (
          <LimonCentralStep
            key={`step-${i}`}
            textureId={textures.step}
            position={[stepSpacing[0] * i, stepSpacing[1] * i, stepSpacing[2] * i]}
          />
        ))}

        {Array.from({ length: steps + 1 }).map((_, i) => (
          <LimonCentralStep1
            key={`step1-${i}`}
            textureId={textures.step1}
            position={[step1Spacing[0] * i, step1Spacing[1] * i, step1Spacing[2] * i]}
          />
        ))}

        <LimonCentralTop
          textureId={textures.top}
          position={[stepSpacing[0] * (steps - 1), stepSpacing[1] * (steps - 1), stepSpacing[2] * (steps - 1)]}
        />
      </group>
    )
  }

  // Keep existing basic geometry for other stair types
  return (
    <group position={[0, -totalHeight / 2, 0]}>
      {/* Central spine(s) for floating stairs */}
      {(type === "floating" || type === "double-floating") && (
        <>
          {type === "double-floating" ? (
            // Double parallel spines
            <>
              <mesh
                position={[-0.3, totalHeight / 2.4, 0]}
                rotation={[Math.atan2(totalHeight, steps * stepDepth) + (22.5 * Math.PI) / 180, 0, 0]}
              >
                <boxGeometry
                  args={[0.15, Math.sqrt(totalHeight * totalHeight + steps * stepDepth * (steps * stepDepth)), 0.15]}
                />
                <meshStandardMaterial color="#2F2F2F" />
              </mesh>
              <mesh
                position={[0.3, totalHeight / 2.4, 0]}
                rotation={[Math.atan2(totalHeight, steps * stepDepth) + (22.5 * Math.PI) / 180, 0, 0]}
              >
                <boxGeometry
                  args={[0.15, Math.sqrt(totalHeight * totalHeight + steps * stepDepth * (steps * stepDepth)), 0.15]}
                />
                <meshStandardMaterial color="#2F2F2F" />
              </mesh>
            </>
          ) : (
            // Single central spine
            <mesh
              position={[0, totalHeight / 2.4, 0]}
              rotation={[Math.atan2(totalHeight, steps * stepDepth) + (22.5 * Math.PI) / 180, 0, 0]}
            >
              <boxGeometry
                args={[0.2, Math.sqrt(totalHeight * totalHeight + steps * stepDepth * (steps * stepDepth)), 0.2]}
              />
              <meshStandardMaterial color="#2F2F2F" />
            </mesh>
          )}
        </>
      )}

      {/* Generate basic geometry steps for non-GLTF types */}
      {Array.from({ length: steps }).map((_, i) => (
        <group key={i}>
          <mesh position={[0, i * stepHeight, i * stepDepth - (steps * stepDepth) / 2]}>
            <boxGeometry args={[width, 0.05, stepDepth]} />
            <meshStandardMaterial color={woodColor} />
          </mesh>

          {type === "traditional" && (
            <mesh
              position={[0, i * stepHeight - stepHeight / 2, i * stepDepth - (steps * stepDepth) / 2 + stepDepth / 2]}
            >
              <boxGeometry args={[width, stepHeight, 0.05]} />
              <meshStandardMaterial color={woodColor} />
            </mesh>
          )}

          {(type === "floating" || type === "double-floating") && (
            <>
              {type === "double-floating" ? (
                <>
                  <mesh position={[-0.3, i * stepHeight - 0.08, i * stepDepth - (steps * stepDepth) / 2]}>
                    <boxGeometry args={[0.08, 0.15, 0.15]} />
                    <meshStandardMaterial color="#2F2F2F" />
                  </mesh>
                  <mesh position={[0.3, i * stepHeight - 0.08, i * stepDepth - (steps * stepDepth) / 2]}>
                    <boxGeometry args={[0.08, 0.15, 0.15]} />
                    <meshStandardMaterial color="#2F2F2F" />
                  </mesh>
                </>
              ) : (
                <mesh position={[0, i * stepHeight - 0.08, i * stepDepth - (steps * stepDepth) / 2]}>
                  <boxGeometry args={[0.1, 0.2, 0.2]} />
                  <meshStandardMaterial color="#2F2F2F" />
                </mesh>
              )}
            </>
          )}
        </group>
      ))}

      {type === "traditional" && (
        <>
          <mesh position={[width / 2 + 0.05, totalHeight / 2, (steps * stepDepth) / 4]}>
            <boxGeometry args={[0.05, totalHeight + 0.2, 0.05]} />
            <meshStandardMaterial color={woodColor} />
          </mesh>
          <mesh
            position={[width / 2 + 0.05, totalHeight / 2 + 0.1, (steps * stepDepth) / 4]}
            rotation={[Math.atan2(totalHeight, steps * stepDepth), 0, 0]}
          >
            <boxGeometry
              args={[0.05, 0.05, Math.sqrt(totalHeight * totalHeight + steps * stepDepth * (steps * stepDepth))]}
            />
            <meshStandardMaterial color={woodColor} />
          </mesh>
        </>
      )}
    </group>
  )
}

export default function StairBuilder() {
  const [stairType, setStairType] = useState("floating")
  const [material, setMaterial] = useState("oak")
  const [steps, setSteps] = useState([14])
  const [width, setWidth] = useState([1.2])
  const [componentTextures, setComponentTextures] = useState({
    base: "painted-metal",
    step: "painted-metal",
    step1: "dark-cherry-wood",
    top: "painted-metal",
  })

  const stairTypes = [
    { id: "limon-central-droit", name: "Limon Central - Droit/Straight", price: 6800 },
    { id: "floating", name: "Floating Stairs", price: 4500 },
    { id: "traditional", name: "Traditional Stairs", price: 2800 },
    { id: "spiral", name: "Spiral Stairs", price: 6200 },
    { id: "l-shaped", name: "L-Shaped Stairs", price: 3400 },
    { id: "double-floating", name: "Double Floating Stairs", price: 5200 },
  ]

  const materials = [
    { id: "oak", name: "White Oak", price: 0 },
    { id: "walnut", name: "Black Walnut", price: 800 },
    { id: "maple", name: "Hard Maple", price: 400 },
    { id: "ebony", name: "Ebony", price: 1200 },
  ]

  const currentStairType = stairTypes.find((t) => t.id === stairType)
  const currentMaterial = materials.find((m) => m.id === material)
  const basePrice = (currentStairType?.price || 0) + (currentMaterial?.price || 0)
  const totalPrice = basePrice + (steps[0] - 12) * 150 + (width[0] - 1) * 200

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-stone-800 rounded-lg"></div>
              <span className="text-xl font-semibold text-stone-800">Escaliers en Metal</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-stone-600 hover:text-stone-800 transition-colors">
                Gallery
              </a>
              <a href="#" className="text-stone-600 hover:text-stone-800 transition-colors">
                About
              </a>
              <a href="#" className="text-stone-600 hover:text-stone-800 transition-colors">
                Contact
              </a>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share Design
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 3D Viewer */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] overflow-hidden border-0 shadow-lg">
              <div className="h-full bg-gradient-to-b from-stone-100 to-stone-200">
                <Canvas camera={{ position: [4, 3, 4], fov: 50 }}>
                  <Suspense fallback={null}>
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[10, 10, 5]} intensity={1.2} />
                    <pointLight position={[-10, -10, -10]} intensity={0.3} />
                    <Stair
                      type={stairType}
                      material={material}
                      steps={steps[0]}
                      width={width[0]}
                      componentTextures={componentTextures}
                    />
                    <ContactShadows position={[0, -3, 0]} opacity={0.4} scale={15} blur={2} />
                    <Environment preset="studio" />
                    <OrbitControls
                      enablePan={false}
                      minDistance={3}
                      maxDistance={12}
                      minPolarAngle={0}
                      maxPolarAngle={Math.PI / 2}
                    />
                  </Suspense>
                </Canvas>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-6">
              <Button size="lg" className="flex-1 bg-stone-800 hover:bg-stone-700">
                <Download className="w-4 h-4 mr-2" />
                Download Plans
              </Button>
              <Button size="lg" variant="outline" className="flex-1 bg-transparent">
                Request Quote
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Stair Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-stone-800">Stair Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={stairType} onValueChange={setStairType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stairTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{type.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            ${type.price.toLocaleString()}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Material */}
            <Card>
              <CardHeader>
                <CardTitle className="text-stone-800">Wood Material</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={material} onValueChange={setMaterial}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((mat) => (
                      <SelectItem key={mat.id} value={mat.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{mat.name}</span>
                          {mat.price > 0 && (
                            <Badge variant="secondary" className="ml-2">
                              +${mat.price}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Texture Controls - only show for Limon Central */}
            {stairType === "limon-central-droit" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-stone-800">Component Textures</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(componentTextures).map(([component, textureId]) => (
                    <div key={component} className="space-y-2">
                      <Label className="text-sm font-medium text-stone-600 capitalize">{component}</Label>
                      <Select
                        value={textureId}
                        onValueChange={(value) => setComponentTextures((prev) => ({ ...prev, [component]: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="px-2 py-1 text-xs text-stone-500 font-medium">Wood Textures</div>
                          {getWoodTextures().map((texture) => (
                            <SelectItem key={texture.id} value={texture.id}>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-amber-600"></div>
                                {texture.name}
                              </div>
                            </SelectItem>
                          ))}
                          <div className="px-2 py-1 text-xs text-stone-500 font-medium border-t border-stone-200 mt-1">
                            Metal Textures
                          </div>
                          {getMetalTextures().map((texture) => (
                            <SelectItem key={texture.id} value={texture.id}>
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
            )}

            {/* Dimensions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-stone-800">Dimensions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-stone-600">Number of Steps</label>
                    <span className="text-sm text-stone-800">{steps[0]}</span>
                  </div>
                  <Slider value={steps} onValueChange={setSteps} min={8} max={20} step={1} className="w-full" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-stone-600">Width (meters)</label>
                    <span className="text-sm text-stone-800">{width[0].toFixed(1)}m</span>
                  </div>
                  <Slider value={width} onValueChange={setWidth} min={0.8} max={2.0} step={0.1} className="w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Price Summary */}
            <Card className="border-stone-200 bg-stone-50">
              <CardHeader>
                <CardTitle className="text-stone-800">Price Estimate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Base Price ({currentStairType?.name})</span>
                  <span className="text-stone-800">${currentStairType?.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Material ({currentMaterial?.name})</span>
                  <span className="text-stone-800">
                    {currentMaterial?.price ? `+$${currentMaterial.price}` : "Included"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Custom Sizing</span>
                  <span className="text-stone-800">
                    +${((steps[0] - 12) * 150 + (width[0] - 1) * 200).toLocaleString()}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-stone-800">Total</span>
                  <span className="text-stone-800">${totalPrice.toLocaleString()}</span>
                </div>
                <p className="text-xs text-stone-500 mt-2">
                  *Price includes materials and basic installation. Final quote may vary based on site conditions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
