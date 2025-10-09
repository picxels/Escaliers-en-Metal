"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, PerspectiveCamera, Grid } from "@react-three/drei"
import { StairModule } from "@/components/StairModule"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Settings, Ruler, Palette, ShoppingCart, Download, Share2, Info, Wrench, Upload } from "lucide-react"
import { useEffect, useState, Suspense } from "react"
import Link from "next/link"
import { getTextures } from "@/lib/textures"
import { getAllCategories } from "@/lib/categories"
import {
  getAllModels,
  loadModelConfiguration,
  type ModelConfiguration,
  type ComponentArraySettings,
  type StairConfiguration,
  calculatePosition,
  getEffectiveCount,
  createDefaultComponentSettings,
  loadStairConfiguration,
  saveStairConfiguration,
} from "@/lib/models"

export default function Home() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
  const [modelConfig, setModelConfig] = useState<ModelConfiguration | null>(null)

  const [globalScale, setGlobalScale] = useState(0.01)
  const [globalArrayMultiplier, setGlobalArrayMultiplier] = useState(1.0)
  const [componentSettings, setComponentSettings] = useState<Record<string, ComponentArraySettings>>({})
  const [componentTextures, setComponentTextures] = useState<Record<string, string>>({})

  const availableTextures = getTextures()
  const categories = getAllCategories()
  const allModels = getAllModels()

  useEffect(() => {
    console.log("🚀 Initializing main page with unified configuration...")

    // Try to load unified configuration
    const savedConfig = loadStairConfiguration()
    if (savedConfig) {
      console.log("📂 Found unified configuration:", savedConfig)

      // Validate that the model exists
      const modelExists = allModels.some((m) => m.id === savedConfig.modelId)
      if (modelExists) {
        setSelectedModelId(savedConfig.modelId)
        setGlobalScale(savedConfig.globalScale)
        setGlobalArrayMultiplier(savedConfig.globalArrayMultiplier)
        setComponentSettings(savedConfig.componentSettings)
        setComponentTextures(savedConfig.componentTextures)
        console.log("✅ Restored unified configuration")
      } else {
        console.warn(`⚠️ Saved model "${savedConfig.modelId}" not found, using default`)
        setSelectedModelId("limon-central-droit-droit")
      }
    } else {
      // No saved config, use default
      setSelectedModelId("limon-central-droit-droit")
    }

    console.log("✅ Main page ready")
    setIsInitialized(true)
  }, [])

  // Load model configuration when model changes
  useEffect(() => {
    if (!selectedModelId || !isInitialized) return

    console.log(`🔍 Loading model: ${selectedModelId}`)
    const config = loadModelConfiguration(selectedModelId)

    if (config) {
      setModelConfig(config)

      // Only set defaults if we don't have saved values
      if (Object.keys(componentSettings).length === 0) {
        setComponentSettings(createDefaultComponentSettings(config))
        setComponentTextures(config.componentTextures || {})
        setGlobalScale(config.defaultSettings?.globalScale || 0.01)
      }

      console.log(`✅ Loaded model: ${config.name}`)
    } else {
      console.error(`❌ Failed to load model: ${selectedModelId}`)
    }
  }, [selectedModelId, isInitialized])

  useEffect(() => {
    if (!selectedModelId || !isInitialized || Object.keys(componentSettings).length === 0) return

    const configToSave: StairConfiguration = {
      modelId: selectedModelId,
      globalScale,
      globalArrayMultiplier,
      componentSettings,
      componentTextures,
    }

    saveStairConfiguration(configToSave)
  }, [selectedModelId, globalScale, globalArrayMultiplier, componentSettings, componentTextures, isInitialized])

  const calculatePrice = () => {
    if (!modelConfig) return 0
    const effectiveStepCount = getEffectiveCount("step", componentSettings, globalArrayMultiplier)
    return modelConfig.pricing.basePrice + modelConfig.pricing.pricePerStep * effectiveStepCount
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Initializing...</p>
      </div>
    )
  }

  if (!modelConfig || Object.keys(componentSettings).length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-500 mb-2">Loading model configuration...</p>
          <p className="text-sm text-gray-400">Model ID: {selectedModelId || "none"}</p>
        </div>
      </div>
    )
  }

  const effectiveStepCount = getEffectiveCount("step", componentSettings, globalArrayMultiplier)

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Ruler className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Scandinavian Stair Builder</h1>
              <p className="text-sm text-slate-600">Professional staircase configurator</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/model-manager">
                <Upload className="w-4 h-4 mr-2" />
                Model Manager
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/texture-manager">
                <Palette className="w-4 h-4 mr-2" />
                Texture Manager
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/gltf-test">
                <Wrench className="w-4 h-4 mr-2" />
                GLTF Test
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* 3D Viewer */}
        <div className="flex-1 p-6">
          <div className="h-full bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl shadow-xl overflow-hidden border border-slate-300">
            <Canvas shadows dpr={[1, 2]}>
              <Suspense fallback={null}>
                <PerspectiveCamera makeDefault position={[50, 30, 50]} fov={50} />
                <OrbitControls enableDamping dampingFactor={0.05} minDistance={20} maxDistance={200} />

                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
                <hemisphereLight intensity={0.4} groundColor="#b1b1b1" />

                <group scale={globalScale}>
                  {modelConfig.components.base && componentSettings.base.enabled && (
                    <>
                      {Array.from(
                        { length: getEffectiveCount("base", componentSettings, globalArrayMultiplier) },
                        (_, i) => (
                          <StairModule
                            key={`base-${i}`}
                            url={modelConfig.components.base.url}
                            textureId={
                              componentTextures.base || modelConfig.components.base.defaultTexture || "painted-metal"
                            }
                            position={calculatePosition("base", i, componentSettings, globalArrayMultiplier)}
                          />
                        ),
                      )}
                    </>
                  )}
                  {modelConfig.components.base && !componentSettings.base.enabled && (
                    <StairModule
                      url={modelConfig.components.base.url}
                      textureId={
                        componentTextures.base || modelConfig.components.base.defaultTexture || "painted-metal"
                      }
                      position={calculatePosition("base", 0, componentSettings, globalArrayMultiplier)}
                    />
                  )}

                  {modelConfig.components.step && (
                    <>
                      {Array.from({ length: effectiveStepCount }, (_, i) => (
                        <StairModule
                          key={`step-${i}`}
                          url={modelConfig.components.step.url}
                          textureId={
                            componentTextures.step || modelConfig.components.step.defaultTexture || "painted-metal"
                          }
                          position={calculatePosition("step", i, componentSettings, globalArrayMultiplier)}
                        />
                      ))}
                    </>
                  )}

                  {modelConfig.components.step1 && (
                    <>
                      {Array.from(
                        { length: getEffectiveCount("step1", componentSettings, globalArrayMultiplier) },
                        (_, i) => (
                          <StairModule
                            key={`step1-${i}`}
                            url={modelConfig.components.step1.url}
                            textureId={
                              componentTextures.step1 ||
                              modelConfig.components.step1.defaultTexture ||
                              "dark-cherry-wood"
                            }
                            position={calculatePosition("step1", i, componentSettings, globalArrayMultiplier)}
                          />
                        ),
                      )}
                    </>
                  )}

                  {modelConfig.components.top && componentSettings.top.enabled && (
                    <>
                      {Array.from(
                        { length: getEffectiveCount("top", componentSettings, globalArrayMultiplier) },
                        (_, i) => (
                          <StairModule
                            key={`top-${i}`}
                            url={modelConfig.components.top.url}
                            textureId={
                              componentTextures.top || modelConfig.components.top.defaultTexture || "painted-metal"
                            }
                            position={calculatePosition("top", i, componentSettings, globalArrayMultiplier)}
                          />
                        ),
                      )}
                    </>
                  )}
                  {modelConfig.components.top && !componentSettings.top.enabled && (
                    <StairModule
                      url={modelConfig.components.top.url}
                      textureId={componentTextures.top || modelConfig.components.top.defaultTexture || "painted-metal"}
                      position={calculatePosition("top", 0, componentSettings, globalArrayMultiplier)}
                    />
                  )}
                </group>

                <Grid args={[100, 100]} cellSize={1} cellThickness={0.5} fadeDistance={100} />
                <Environment preset="apartment" />
              </Suspense>
            </Canvas>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="w-96 bg-white border-l border-slate-200 overflow-y-auto">
          <Tabs defaultValue="model" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 sticky top-0 bg-white z-10 border-b">
              <TabsTrigger value="model">
                <Settings className="w-4 h-4 mr-2" />
                Model
              </TabsTrigger>
              <TabsTrigger value="dimensions">
                <Ruler className="w-4 h-4 mr-2" />
                Size
              </TabsTrigger>
              <TabsTrigger value="materials">
                <Palette className="w-4 h-4 mr-2" />
                Materials
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="model" className="space-y-4 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Stair Model</CardTitle>
                    <CardDescription>Choose your staircase configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={modelConfig.category}
                        onValueChange={(categoryId) => {
                          const modelsInCategory = allModels.filter((m) => m.category === categoryId)
                          if (modelsInCategory.length > 0) {
                            setSelectedModelId(modelsInCategory[0].id)
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Select value={selectedModelId || ""} onValueChange={setSelectedModelId}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allModels
                            .filter((m) => m.category === modelConfig.category)
                            .map((model) => (
                              <SelectItem key={model.id} value={model.id}>
                                <div className="flex items-center gap-2">
                                  <span>{model.name}</span>
                                  {model.metadata.isCustom && (
                                    <Badge variant="secondary" className="text-xs">
                                      Custom
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-slate-600 mt-0.5" />
                        <p className="text-sm text-slate-600">{modelConfig.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Model Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Components:</span>
                      <span className="font-medium">{Object.keys(modelConfig.components).length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Version:</span>
                      <span className="font-medium">{modelConfig.metadata.version}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Type:</span>
                      <Badge variant={modelConfig.metadata.isCustom ? "secondary" : "default"}>
                        {modelConfig.metadata.isCustom ? "Custom" : "Built-in"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="dimensions" className="space-y-4 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Dimensions</CardTitle>
                    <CardDescription>Adjust staircase size and scale</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Number of Steps</Label>
                        <span className="text-sm font-medium text-slate-700">{effectiveStepCount}</span>
                      </div>
                      <Slider
                        value={[globalArrayMultiplier * 100]}
                        onValueChange={(v) => setGlobalArrayMultiplier(v[0] / 100)}
                        min={10}
                        max={300}
                        step={5}
                      />
                      <p className="text-xs text-slate-500">
                        Base count: {componentSettings.step?.count || 8} × {globalArrayMultiplier.toFixed(2)} ={" "}
                        {effectiveStepCount} steps
                      </p>
                      <p className="text-xs text-slate-500">
                        Total height: {(effectiveStepCount * 6.941 * globalScale * 100).toFixed(1)} cm
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Scale</Label>
                        <span className="text-sm font-medium text-slate-700">{(globalScale * 100).toFixed(1)}%</span>
                      </div>
                      <Slider
                        value={[globalScale * 1000]}
                        onValueChange={(v) => setGlobalScale(v[0] / 1000)}
                        min={5}
                        max={20}
                        step={0.5}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Measurements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Step width:</span>
                      <span className="font-medium">{(10.133 * globalScale * 100).toFixed(1)} cm</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Step height:</span>
                      <span className="font-medium">{(6.941 * globalScale * 100).toFixed(1)} cm</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total length:</span>
                      <span className="font-medium">
                        {(effectiveStepCount * 10.133 * globalScale * 100).toFixed(1)} cm
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="materials" className="space-y-4 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Materials & Finishes</CardTitle>
                    <CardDescription>Customize component textures</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(modelConfig.components).map(([componentId, component]) => {
                      if (!component) return null
                      return (
                        <div key={componentId} className="space-y-2">
                          <Label className="capitalize">{component.name}</Label>
                          <Select
                            value={componentTextures[componentId] || component.defaultTexture}
                            onValueChange={(value) =>
                              setComponentTextures((prev) => ({
                                ...prev,
                                [componentId]: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableTextures.map((texture) => (
                                <SelectItem key={texture.id} value={texture.id}>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-4 h-4 rounded border"
                                      style={{
                                        background: texture.category === "wood" ? "#8B4513" : "#708090",
                                      }}
                                    />
                                    <span>{texture.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>

            {/* Price Summary */}
            <div className="border-t bg-slate-50 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Base price:</span>
                  <span className="text-sm">
                    {modelConfig.pricing.basePrice} {modelConfig.pricing.currency}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Steps ({effectiveStepCount}):</span>
                  <span className="text-sm">
                    {modelConfig.pricing.pricePerStep * effectiveStepCount} {modelConfig.pricing.currency}
                  </span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {calculatePrice()} {modelConfig.pricing.currency}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                  <Button className="w-full mt-2" size="lg">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Request Quote
                  </Button>
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
