// Texture configuration system
export interface TextureSet {
  id: string
  name: string
  category: "wood" | "metal"
  maps: {
    diffuse?: string
    normal?: string
    roughness?: string
    metalness?: string
    ao?: string
    specular?: string
    glossiness?: string
  }
  materialProps: {
    metalness: number
    roughness: number
    [key: string]: any
  }
}

export const TEXTURE_LIBRARY: TextureSet[] = [
  // Wood Textures
  {
    id: "dark-cherry-wood",
    name: "Dark Cherry Wood",
    category: "wood",
    maps: {
      diffuse: "/textures/wood/dark-cherrywood-diffuse.jpg",
      normal: "/textures/wood/dark-cherrywood-normal.jpg",
      ao: "/textures/wood/dark-cherrywood-ao.jpg",
    },
    materialProps: {
      metalness: 0.1,
      roughness: 0.8,
    },
  },

  // Metal Textures
  {
    id: "painted-metal",
    name: "Painted Metal",
    category: "metal",
    maps: {
      diffuse: "/textures/metal/painted_metal_diffuse.jpg",
      normal: "/textures/metal/painted_metal_normal_opengl.jpg",
      specular: "/textures/metal/painted_metal_specular.jpg",
      glossiness: "/textures/metal/painted_metal_glossiness.png",
    },
    materialProps: {
      metalness: 0.8,
      roughness: 0.2,
    },
  },
]

// Helper functions
export function getTexturesByCategory(category: "wood" | "metal"): TextureSet[] {
  return TEXTURE_LIBRARY.filter((texture) => texture.category === category)
}

export function getTextureById(id: string): TextureSet | undefined {
  return TEXTURE_LIBRARY.find((texture) => texture.id === id)
}

export function getWoodTextures(): TextureSet[] {
  return getTexturesByCategory("wood")
}

export function getMetalTextures(): TextureSet[] {
  return getTexturesByCategory("metal")
}

// Get texture maps for useTexture hook - with better error handling
export function getTextureMaps(textureSet: TextureSet): { [key: string]: string } {
  const maps: { [key: string]: string } = {}

  if (textureSet.maps.diffuse) maps.map = textureSet.maps.diffuse
  if (textureSet.maps.normal) maps.normalMap = textureSet.maps.normal
  if (textureSet.maps.roughness) maps.roughnessMap = textureSet.maps.roughness
  if (textureSet.maps.metalness) maps.metalnessMap = textureSet.maps.metalness
  if (textureSet.maps.ao) maps.aoMap = textureSet.maps.ao
  if (textureSet.maps.specular) maps.metalnessMap = textureSet.maps.specular

  // Filter out any undefined values
  return Object.fromEntries(Object.entries(maps).filter(([_, value]) => value !== undefined))
}
