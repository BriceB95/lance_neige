import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { playSnowScoop, playSnowballShoot, playSplat, playRobotBoop } from '../audio/soundEffects';
import { TerrainTheme } from '../types';

export interface SceneCallbacks {
  onCollectSnow: (amount: number) => void;
  onHitEnemy: (scoreGain: number, isDouble?: boolean) => void;
  onRobotDamaged?: (amount: number) => void;
}

// Math helpers pre-allocated at module scope to avoid GC in animation loop
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _vec3C = new THREE.Vector3();

export interface SnowPile {
  group: THREE.Group;
  x: number;
  z: number;
  active: boolean;
  respawnTimer: number;
  scale: number;
}

export interface SnowmanEnemy {
  group: THREE.Group;
  head: THREE.Mesh;
  carrot: THREE.Mesh;
  hat: THREE.Group;
  arms: THREE.Group;
  hpPips: THREE.Mesh[];
  x: number;
  z: number;
  vx: number;
  vz: number;
  wobblePhase: number;
  health: number;
  maxHealth: number;
  state: 'idle' | 'hit' | 'throw' | 'burst';
  stateTimer: number;
  respawnTimer: number;
  throwCooldown: number;
}

export interface Projectile {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  isPlayer: boolean;
  radius: number;
}

export interface SplatParticle {
  mesh: THREE.Mesh;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
}

export class RoboNeigeScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean;
  private frameId: number = 0;
  private clock: THREE.Clock;

  // Scene elements
  private robotGroup!: THREE.Group;
  private robotTorso!: THREE.Mesh;
  private robotHead!: THREE.Mesh;
  private robotVisor!: THREE.Mesh;
  private robotAntennaLight!: THREE.Mesh;
  private robotTankSnow!: THREE.Mesh;
  private robotCannonBarrel!: THREE.Mesh;
  private robotSecondBarrel!: THREE.Mesh;
  private robotScarf!: THREE.Mesh;
  private robotCrown!: THREE.Group;
  private robotTreads!: THREE.Group;

  // World elements & Terrain
  public currentTerrainTheme: TerrainTheme = 'snow-forest';
  private groundMesh!: THREE.Mesh;
  private groundMat!: THREE.MeshStandardMaterial;
  private terrainPropsGroup!: THREE.Group;
  private snowPiles: SnowPile[] = [];
  private enemies: SnowmanEnemy[] = [];
  private projectiles: Projectile[] = [];
  private particles: SplatParticle[] = [];
  private snowParticlesInstanced: THREE.InstancedMesh | null = null;
  private snowParticleMatrices: THREE.Matrix4[] = [];

  // Robot State
  public robotX = 0;
  public robotZ = 0;
  public robotRotation = 0;
  public targetRotation = 0;
  public moveSpeed = 9.0;
  public cannonTier = 1;
  public hasShield = false;
  public isGolden = false;

  private callbacks: SceneCallbacks;
  private isDisposed = false;

  constructor(container: HTMLElement, callbacks: SceneCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // Software WebGL detection per Three.js directives
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // Scene & Fog
    this.scene = new THREE.Scene();
    const fogColor = new THREE.Color(0xd7ebfb);
    this.scene.background = fogColor;
    this.scene.fog = new THREE.Fog(fogColor, 25, 75);

    // Camera setup (Isometric third-person view over robot)
    this.camera = new THREE.PerspectiveCamera(
      48,
      container.clientWidth / container.clientHeight,
      0.1,
      120
    );
    this.camera.position.set(0, 14, 18);
    this.camera.lookAt(0, 1.5, 0);

    // Environment map with RoomEnvironment for PBR metallic reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting rig
    this.setupLighting();

    // Build World (Ground, mountains, trees)
    this.createWorldTerrain();

    // Build Hero Robot
    this.robotGroup = this.createRobotModel();
    this.scene.add(this.robotGroup);

    // Populate Snow Piles
    this.createSnowPiles(14);

    // Populate Snowmen Enemies
    this.createSnowmen(5);

    // Create Ambient Falling Snowflakes
    this.createAmbientSnowfall();

    // Precompile shaders
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    // Start loop
    this.startLoop();
  }

  private setupLighting() {
    // Warm sun key light with shadows
    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    sunLight.position.set(16, 28, 12);
    sunLight.castShadow = !this.isSoftwareGl;
    if (!this.isSoftwareGl) {
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 60;
      const d = 22;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.bias = -0.0005;
      sunLight.shadow.normalBias = 0.02;
    }
    this.scene.add(sunLight);

    // Cool blue sky & ground hemisphere bounce
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x93c5fd, 1.2);
    this.scene.add(hemiLight);

    // Soft rim backlight
    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.8);
    rimLight.position.set(-16, 12, -18);
    this.scene.add(rimLight);
  }

  private createWorldTerrain() {
    // Main snow ground geometry
    const groundGeo = new THREE.PlaneGeometry(120, 120, 32, 32);
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const distFromCenter = Math.sqrt(x * x + y * y);
      if (distFromCenter > 20) {
        const edge = (distFromCenter - 20) * 0.15;
        pos.setZ(i, Math.sin(x * 0.2) * Math.cos(y * 0.2) * 0.4 + edge);
      } else {
        pos.setZ(i, Math.sin(x * 0.3) * Math.cos(y * 0.3) * 0.15);
      }
    }
    groundGeo.computeVertexNormals();

    this.groundMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.88,
      metalness: 0.05,
    });
    this.groundMesh = new THREE.Mesh(groundGeo, this.groundMat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.receiveShadow = !this.isSoftwareGl;
    this.scene.add(this.groundMesh);

    // Group holding themed terrain props (trees, crystals, icebergs, logs)
    this.terrainPropsGroup = new THREE.Group();
    this.scene.add(this.terrainPropsGroup);

    // Initialize with default theme
    this.applyTerrainTheme(this.currentTerrainTheme);
  }

  public setTerrainTheme(theme: TerrainTheme) {
    if (this.currentTerrainTheme === theme) return;
    this.currentTerrainTheme = theme;
    this.applyTerrainTheme(theme);
  }

  private applyTerrainTheme(theme: TerrainTheme) {
    // 1. Clear existing terrain props
    while (this.terrainPropsGroup.children.length > 0) {
      const child = this.terrainPropsGroup.children[0];
      this.terrainPropsGroup.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material?.dispose();
        }
      } else if (child instanceof THREE.Group) {
        child.traverse((c) => {
          if (c instanceof THREE.Mesh) {
            c.geometry?.dispose();
            if (Array.isArray(c.material)) {
              c.material.forEach((m) => m.dispose());
            } else {
              c.material?.dispose();
            }
          }
        });
      }
    }

    if (theme === 'snow-forest') {
      // 1. Forêt Enneigée : sapins denses, neige douce et troncs enneigés
      const fogColor = new THREE.Color(0xd7ebfb);
      this.scene.background = fogColor;
      if (this.scene.fog instanceof THREE.Fog) {
        this.scene.fog.color = fogColor;
        this.scene.fog.near = 25;
        this.scene.fog.far = 75;
      }
      this.groundMat.color.setHex(0xf8fafc);
      this.groundMat.roughness = 0.88;
      this.groundMat.metalness = 0.05;

      const treeCount = 42;
      for (let i = 0; i < treeCount; i++) {
        const angle = (i / treeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
        const radius = 23 + Math.random() * 12;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const tree = this.createPineTree(0.85 + Math.random() * 0.55);
        tree.position.set(x, 0, z);
        this.terrainPropsGroup.add(tree);
      }

      // Troncs en bois sous la neige
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + 0.5;
        const dist = 18 + Math.random() * 6;
        const log = this.createSnowLog(Math.cos(angle) * dist, Math.sin(angle) * dist);
        this.terrainPropsGroup.add(log);
      }
    } else if (theme === 'ice-plain') {
      // 2. Plaine Glacée : sol miroir bleu glacier, icebergs sculptés et cristaux
      const fogColor = new THREE.Color(0xa5f3fc);
      this.scene.background = fogColor;
      if (this.scene.fog instanceof THREE.Fog) {
        this.scene.fog.color = fogColor;
        this.scene.fog.near = 22;
        this.scene.fog.far = 80;
      }
      this.groundMat.color.setHex(0x67e8f9);
      this.groundMat.roughness = 0.12;
      this.groundMat.metalness = 0.55;

      // Icebergs polygonaux
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + 0.2;
        const radius = 25 + Math.random() * 8;
        const iceberg = this.createIceberg(1.2 + Math.random() * 0.8);
        iceberg.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        this.terrainPropsGroup.add(iceberg);
      }

      // Cristaux polaires bleus
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + 0.4;
        const radius = 24 + Math.random() * 10;
        const crystal = this.createGlowingCrystal(1.0 + Math.random() * 0.7, 0x06b6d4, 0x22d3ee);
        crystal.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        this.terrainPropsGroup.add(crystal);
      }

      // Sapins givrés clairsemés
      for (let i = 0; i < 14; i++) {
        const angle = (i / 14) * Math.PI * 2 + 0.1;
        const radius = 30 + Math.random() * 8;
        const tree = this.createPineTree(0.7 + Math.random() * 0.4);
        tree.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        this.terrainPropsGroup.add(tree);
      }
    } else if (theme === 'crystal-valley') {
      // 3. Vallée des Cristaux : crépuscule féerique, aurore boréale et cristaux luminescents
      const fogColor = new THREE.Color(0x1e1b4b);
      this.scene.background = fogColor;
      if (this.scene.fog instanceof THREE.Fog) {
        this.scene.fog.color = fogColor;
        this.scene.fog.near = 20;
        this.scene.fog.far = 70;
      }
      this.groundMat.color.setHex(0x312e81);
      this.groundMat.roughness = 0.4;
      this.groundMat.metalness = 0.25;

      const crystalColors = [
        { c: 0x38bdf8, em: 0x0284c7 },
        { c: 0xf472b6, em: 0xdb2777 },
        { c: 0xfbbf24, em: 0xd97706 },
        { c: 0xa855f7, em: 0x7c3aed },
      ];

      for (let i = 0; i < 22; i++) {
        const angle = (i / 22) * Math.PI * 2 + 0.25;
        const radius = 22 + Math.random() * 11;
        const palette = crystalColors[i % crystalColors.length];
        const crystal = this.createGlowingCrystal(0.9 + Math.random() * 0.9, palette.c, palette.em);
        crystal.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        this.terrainPropsGroup.add(crystal);
      }

      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2 + 0.3;
        const radius = 28 + Math.random() * 8;
        const tree = this.createPineTree(0.8 + Math.random() * 0.5);
        tree.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        this.terrainPropsGroup.add(tree);
      }
    }
  }

  private createSnowLog(x: number, z: number): THREE.Group {
    const group = new THREE.Group();
    const logGeo = new THREE.CylinderGeometry(0.3, 0.35, 2.2, 8);
    const logMat = new THREE.MeshStandardMaterial({ color: 0x5c3d2e, roughness: 0.9 });
    const log = new THREE.Mesh(logGeo, logMat);
    log.rotation.z = Math.PI / 2;
    log.position.y = 0.3;
    log.castShadow = !this.isSoftwareGl;
    group.add(log);

    const snowGeo = new THREE.BoxGeometry(2.0, 0.12, 0.5);
    const snowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
    const snow = new THREE.Mesh(snowGeo, snowMat);
    snow.position.set(0, 0.42, 0);
    group.add(snow);

    group.position.set(x, 0, z);
    group.rotation.y = Math.random() * Math.PI;
    return group;
  }

  private createIceberg(scale: number): THREE.Group {
    const group = new THREE.Group();
    const geo = new THREE.DodecahedronGeometry(2.2 * scale, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      roughness: 0.15,
      metalness: 0.4,
      transparent: true,
      opacity: 0.9,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 1.2 * scale;
    mesh.scale.set(1.4, 1.8, 1.2);
    mesh.castShadow = !this.isSoftwareGl;
    group.add(mesh);

    const snowCapGeo = new THREE.ConeGeometry(1.8 * scale, 0.9 * scale, 6);
    const snowCapMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
    const snowCap = new THREE.Mesh(snowCapGeo, snowCapMat);
    snowCap.position.y = 2.6 * scale;
    group.add(snowCap);

    return group;
  }

  private createGlowingCrystal(scale: number, color: number, emissive: number): THREE.Group {
    const group = new THREE.Group();
    const crystalGeo = new THREE.ConeGeometry(0.8 * scale, 3.8 * scale, 6);
    const crystalMat = new THREE.MeshStandardMaterial({
      color,
      emissive,
      emissiveIntensity: 0.7,
      roughness: 0.15,
      metalness: 0.5,
      transparent: true,
      opacity: 0.88,
    });
    const main = new THREE.Mesh(crystalGeo, crystalMat);
    main.position.y = 1.9 * scale;
    main.castShadow = !this.isSoftwareGl;
    group.add(main);

    const mini = new THREE.Mesh(crystalGeo, crystalMat);
    mini.scale.set(0.5, 0.5, 0.5);
    mini.position.set(0.6 * scale, 0.9 * scale, 0.3 * scale);
    mini.rotation.z = 0.25;
    group.add(mini);

    return group;
  }

  private createPineTree(scale: number): THREE.Group {
    const group = new THREE.Group();

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.25 * scale, 0.35 * scale, 1.2 * scale, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3d2e, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.6 * scale;
    group.add(trunk);

    // 3 Foliage cones with snow caps
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x1e3a29, roughness: 0.8 });
    const snowCapMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });

    for (let j = 0; j < 3; j++) {
      const coneR = (1.6 - j * 0.35) * scale;
      const coneH = (1.8 - j * 0.25) * scale;
      const coneGeo = new THREE.ConeGeometry(coneR, coneH, 7);
      const coneMesh = new THREE.Mesh(coneGeo, foliageMat);
      coneMesh.position.y = (1.4 + j * 1.1) * scale;
      coneMesh.castShadow = !this.isSoftwareGl;
      group.add(coneMesh);

      // Cute little snow cap
      const capGeo = new THREE.ConeGeometry(coneR * 0.5, coneH * 0.45, 7);
      const capMesh = new THREE.Mesh(capGeo, snowCapMat);
      capMesh.position.y = (1.8 + j * 1.1) * scale;
      group.add(capMesh);
    }

    return group;
  }

  /**
   * Procedural Robot Model "Bip-Boop"
   * Follows the 3-12 part composite rule:
   * 1. Chassis/Torso
   * 2. Glass Snow Reservoir
   * 3. Head with visor & cheeks
   * 4. Antenna with blinking orb
   * 5. Right Cannon arm
   * 6. Left Snow scoop shovel
   * 7. Dual caterpillar treads / wheels
   * 8. Scarf / Shield
   * 9. Royal Crown / Spoilers
   */
  private createRobotModel(): THREE.Group {
    const root = new THREE.Group();

    // Robot Materials
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Friendly cyan
      metalness: 0.7,
      roughness: 0.25,
    });

    const trimMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Golden yellow
      metalness: 0.5,
      roughness: 0.3,
    });

    const metalDarkMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.4,
    });

    // 1. Torso
    const torsoGeo = new THREE.CylinderGeometry(0.85, 0.95, 1.4, 16);
    this.robotTorso = new THREE.Mesh(torsoGeo, bodyMat);
    this.robotTorso.position.y = 1.3;
    this.robotTorso.castShadow = !this.isSoftwareGl;
    root.add(this.robotTorso);

    // 2. Transparent Snow Tank in torso front
    const tankGlassGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.8, 12, 1, false, -Math.PI / 2, Math.PI);
    const tankGlassMat = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.7,
    });
    const tankGlass = new THREE.Mesh(tankGlassGeo, tankGlassMat);
    tankGlass.position.set(0, 1.3, 0.42);
    tankGlass.rotation.y = Math.PI;
    root.add(tankGlass);

    // Snow content inside tank (scale changes with ammo)
    const tankSnowGeo = new THREE.SphereGeometry(0.4, 12, 12);
    const tankSnowMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      emissive: 0x93c5fd,
      emissiveIntensity: 0.4,
    });
    this.robotTankSnow = new THREE.Mesh(tankSnowGeo, tankSnowMat);
    this.robotTankSnow.position.set(0, 1.25, 0.4);
    this.robotTankSnow.scale.set(0.8, 0.8, 0.8);
    root.add(this.robotTankSnow);

    // 3. Head
    const headGeo = new THREE.BoxGeometry(1.1, 0.85, 0.95);
    this.robotHead = new THREE.Mesh(headGeo, bodyMat);
    this.robotHead.position.set(0, 2.3, 0);
    this.robotHead.castShadow = !this.isSoftwareGl;
    root.add(this.robotHead);

    // Visor Eyes (Cyan luminous panel)
    const visorGeo = new THREE.BoxGeometry(0.85, 0.35, 0.1);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.0,
      roughness: 0.1,
    });
    this.robotVisor = new THREE.Mesh(visorGeo, visorMat);
    this.robotVisor.position.set(0, 2.3, 0.48);
    root.add(this.robotVisor);

    // Cute ear bolts
    const earGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.3, 10);
    const earMesh = new THREE.Mesh(earGeo, trimMat);
    earMesh.rotation.z = Math.PI / 2;
    earMesh.position.set(0, 2.3, 0);
    root.add(earMesh);

    // 4. Antenna
    const antPoleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8);
    const antPole = new THREE.Mesh(antPoleGeo, metalDarkMat);
    antPole.position.set(0, 2.95, 0);
    root.add(antPole);

    const antLightGeo = new THREE.SphereGeometry(0.14, 10, 10);
    const antLightMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xf97316,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    });
    this.robotAntennaLight = new THREE.Mesh(antLightGeo, antLightMat);
    this.robotAntennaLight.position.set(0, 3.3, 0);
    root.add(this.robotAntennaLight);

    // 5. Right Snowball Cannon Arm
    const cannonShoulderGeo = new THREE.SphereGeometry(0.24, 10, 10);
    const cannonShoulder = new THREE.Mesh(cannonShoulderGeo, trimMat);
    cannonShoulder.position.set(1.05, 1.5, 0);
    root.add(cannonShoulder);

    const barrelGeo = new THREE.CylinderGeometry(0.22, 0.25, 1.1, 12);
    this.robotCannonBarrel = new THREE.Mesh(barrelGeo, metalDarkMat);
    this.robotCannonBarrel.rotation.x = Math.PI / 2;
    this.robotCannonBarrel.position.set(1.05, 1.45, 0.55);
    this.robotCannonBarrel.castShadow = !this.isSoftwareGl;
    root.add(this.robotCannonBarrel);

    // Secondary barrel (for upgraded double shot, hidden initially)
    this.robotSecondBarrel = new THREE.Mesh(barrelGeo.clone(), metalDarkMat);
    this.robotSecondBarrel.rotation.x = Math.PI / 2;
    this.robotSecondBarrel.position.set(1.05, 1.85, 0.55);
    this.robotSecondBarrel.visible = false;
    root.add(this.robotSecondBarrel);

    // 6. Left Snow Scoop Shovel Arm
    const scoopArmGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.9, 8);
    const scoopArm = new THREE.Mesh(scoopArmGeo, metalDarkMat);
    scoopArm.position.set(-1.05, 1.3, 0.3);
    scoopArm.rotation.x = Math.PI / 4;
    root.add(scoopArm);

    const shovelGeo = new THREE.BoxGeometry(0.65, 0.1, 0.45);
    const shovelMesh = new THREE.Mesh(shovelGeo, trimMat);
    shovelMesh.position.set(-1.05, 0.8, 0.65);
    shovelMesh.rotation.x = Math.PI / 6;
    root.add(shovelMesh);

    // 7. Caterpillar Treads / Feet
    this.robotTreads = new THREE.Group();
    const treadGeo = new THREE.BoxGeometry(0.45, 0.45, 1.6);
    const treadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });

    const leftTread = new THREE.Mesh(treadGeo, treadMat);
    leftTread.position.set(-0.7, 0.23, 0);
    this.robotTreads.add(leftTread);

    const rightTread = new THREE.Mesh(treadGeo, treadMat);
    rightTread.position.set(0.7, 0.23, 0);
    this.robotTreads.add(rightTread);

    // Wheels inside treads
    for (let w = -0.5; w <= 0.5; w += 0.5) {
      const wheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 10);
      const wL = new THREE.Mesh(wheelGeo, trimMat);
      wL.rotation.z = Math.PI / 2;
      wL.position.set(-0.9, 0.23, w);
      this.robotTreads.add(wL);

      const wR = new THREE.Mesh(wheelGeo, trimMat);
      wR.rotation.z = Math.PI / 2;
      wR.position.set(0.9, 0.23, w);
      this.robotTreads.add(wR);
    }
    root.add(this.robotTreads);

    // 8. Warm Scarf / Shield (Toggleable upgrade)
    const scarfGeo = new THREE.TorusGeometry(0.75, 0.22, 10, 20);
    const scarfMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Bright warm red
      roughness: 0.95,
      metalness: 0.0,
    });
    this.robotScarf = new THREE.Mesh(scarfGeo, scarfMat);
    this.robotScarf.rotation.x = Math.PI / 2;
    this.robotScarf.position.set(0, 1.9, 0);
    this.robotScarf.visible = false;
    root.add(this.robotScarf);

    // 9. Royal Crown / Golden Hat (Toggleable upgrade)
    this.robotCrown = new THREE.Group();
    const crownBaseGeo = new THREE.CylinderGeometry(0.4, 0.35, 0.25, 8);
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.15,
    });
    const crownBase = new THREE.Mesh(crownBaseGeo, crownMat);
    this.robotCrown.add(crownBase);

    // Jewels on crown
    for (let c = 0; c < 5; c++) {
      const spikeGeo = new THREE.ConeGeometry(0.08, 0.2, 5);
      const spike = new THREE.Mesh(spikeGeo, crownMat);
      const ang = (c / 5) * Math.PI * 2;
      spike.position.set(Math.cos(ang) * 0.35, 0.2, Math.sin(ang) * 0.35);
      this.robotCrown.add(spike);
    }
    this.robotCrown.position.set(0, 2.8, 0);
    this.robotCrown.visible = false;
    root.add(this.robotCrown);

    // Contact shadow beneath robot
    const shadowGeo = new THREE.CircleGeometry(1.2, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x64748b,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.02;
    root.add(contactShadow);

    return root;
  }

  private createSnowPiles(count: number) {
    const pileGeo = new THREE.SphereGeometry(0.9, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const pileMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.1,
    });

    const sparkleGeo = new THREE.OctahedronGeometry(0.18);
    const sparkleMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x7dd3fc,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });

    for (let i = 0; i < count; i++) {
      const group = new THREE.Group();
      const mesh = new THREE.Mesh(pileGeo, pileMat);
      mesh.scale.set(1.2, 0.55, 1.2);
      mesh.castShadow = !this.isSoftwareGl;
      group.add(mesh);

      // Cute spinning crystal on top to attract child's attention
      const sparkle = new THREE.Mesh(sparkleGeo, sparkleMat);
      sparkle.position.y = 0.75;
      group.add(sparkle);

      // Random position avoiding initial center
      const angle = Math.random() * Math.PI * 2;
      const dist = 4.5 + Math.random() * 15;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      group.position.set(x, 0, z);

      this.scene.add(group);
      this.snowPiles.push({
        group,
        x,
        z,
        active: true,
        respawnTimer: 0,
        scale: 1.0,
      });
    }
  }

  private createSnowmen(count: number) {
    const snowMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
    const coalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const carrotMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 });
    const hatMat = new THREE.MeshStandardMaterial({ color: 0xd946ef, roughness: 0.4 }); // colorful pink/purple

    for (let i = 0; i < count; i++) {
      const group = new THREE.Group();

      // Bottom sphere
      const baseGeo = new THREE.SphereGeometry(1.0, 14, 12);
      const base = new THREE.Mesh(baseGeo, snowMat);
      base.position.y = 0.9;
      base.castShadow = !this.isSoftwareGl;
      group.add(base);

      // Middle sphere
      const midGeo = new THREE.SphereGeometry(0.75, 12, 10);
      const mid = new THREE.Mesh(midGeo, snowMat);
      mid.position.y = 2.1;
      mid.castShadow = !this.isSoftwareGl;
      group.add(mid);

      // Head sphere
      const headGeo = new THREE.SphereGeometry(0.55, 12, 10);
      const head = new THREE.Mesh(headGeo, snowMat);
      head.position.y = 3.0;
      head.castShadow = !this.isSoftwareGl;
      group.add(head);

      // Carrot nose
      const carrotGeo = new THREE.ConeGeometry(0.12, 0.6, 8);
      const carrot = new THREE.Mesh(carrotGeo, carrotMat);
      carrot.rotation.x = Math.PI / 2;
      carrot.position.set(0, 3.0, 0.65);
      group.add(carrot);

      // Coal Eyes
      const eyeGeo = new THREE.SphereGeometry(0.08, 6, 6);
      const eyeL = new THREE.Mesh(eyeGeo, coalMat);
      eyeL.position.set(-0.2, 3.15, 0.46);
      group.add(eyeL);
      const eyeR = new THREE.Mesh(eyeGeo, coalMat);
      eyeR.position.set(0.2, 3.15, 0.46);
      group.add(eyeR);

      // Cute Beanie Hat
      const hatGroup = new THREE.Group();
      const hatBaseGeo = new THREE.CylinderGeometry(0.48, 0.52, 0.45, 10);
      const hatBase = new THREE.Mesh(hatBaseGeo, hatMat);
      hatBase.position.y = 3.5;
      hatGroup.add(hatBase);

      const pompomGeo = new THREE.SphereGeometry(0.2, 8, 8);
      const pompom = new THREE.Mesh(pompomGeo, snowMat);
      pompom.position.y = 3.8;
      hatGroup.add(pompom);
      group.add(hatGroup);

      // Twig arms
      const armsGroup = new THREE.Group();
      const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.1, 6);
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });

      const armL = new THREE.Mesh(armGeo, woodMat);
      armL.rotation.z = Math.PI / 3;
      armL.position.set(-1.0, 2.2, 0);
      armsGroup.add(armL);

      const armR = new THREE.Mesh(armGeo, woodMat);
      armR.rotation.z = -Math.PI / 3;
      armR.position.set(1.0, 2.2, 0);
      armsGroup.add(armR);
      group.add(armsGroup);

      // Contact shadow
      const shadowGeo = new THREE.CircleGeometry(1.1, 12);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x64748b,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      });
      const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
      contactShadow.rotation.x = -Math.PI / 2;
      contactShadow.position.y = 0.02;
      group.add(contactShadow);

      // 3 HP visual pips above snowman hat
      const hpGroup = new THREE.Group();
      hpGroup.position.set(0, 4.25, 0);
      const pipGeo = new THREE.SphereGeometry(0.18, 8, 8);
      const hpPips: THREE.Mesh[] = [];
      for (let pIdx = 0; pIdx < 3; pIdx++) {
        const pipMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.9,
          roughness: 0.2,
        });
        const pip = new THREE.Mesh(pipGeo, pipMat);
        pip.position.set((pIdx - 1) * 0.45, 0, 0);
        hpGroup.add(pip);
        hpPips.push(pip);
      }
      group.add(hpGroup);

      // Position in outer arena
      const angle = (i / count) * Math.PI * 2 + 0.4;
      const dist = 9 + Math.random() * 8;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      group.position.set(x, 0, z);

      this.scene.add(group);
      this.enemies.push({
        group,
        head,
        carrot,
        hat: hatGroup,
        arms: armsGroup,
        hpPips,
        x,
        z,
        vx: (Math.random() - 0.5) * 1.5,
        vz: (Math.random() - 0.5) * 1.5,
        wobblePhase: Math.random() * Math.PI * 2,
        health: 3,
        maxHealth: 3,
        state: 'idle',
        stateTimer: 0,
        respawnTimer: 0,
        throwCooldown: 3 + Math.random() * 4,
      });
    }
  }

  private createAmbientSnowfall() {
    // 250 gentle snow flakes in instanced mesh
    const flakeCount = 200;
    const flakeGeo = new THREE.DodecahedronGeometry(0.08);
    const flakeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
    this.snowParticlesInstanced = new THREE.InstancedMesh(flakeGeo, flakeMat, flakeCount);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < flakeCount; i++) {
      dummy.position.set(
        (Math.random() - 0.5) * 50,
        Math.random() * 20,
        (Math.random() - 0.5) * 50
      );
      dummy.updateMatrix();
      this.snowParticlesInstanced.setMatrixAt(i, dummy.matrix);
      this.snowParticleMatrices.push(dummy.matrix.clone());
    }
    this.snowParticlesInstanced.instanceMatrix.needsUpdate = true;
    this.scene.add(this.snowParticlesInstanced);
  }

  /**
   * Move robot with joystick / arrow inputs
   */
  public moveRobot(dx: number, dz: number, dt: number) {
    if (dx === 0 && dz === 0) return;

    const length = Math.sqrt(dx * dx + dz * dz);
    const nx = dx / length;
    const nz = dz / length;

    const speed = this.moveSpeed * dt;
    this.robotX += nx * speed;
    this.robotZ += nz * speed;

    // Arena boundary clamp
    const maxRadius = 22;
    const curDist = Math.sqrt(this.robotX * this.robotX + this.robotZ * this.robotZ);
    if (curDist > maxRadius) {
      this.robotX = (this.robotX / curDist) * maxRadius;
      this.robotZ = (this.robotZ / curDist) * maxRadius;
    }

    // Target rotation based on movement direction
    this.targetRotation = Math.atan2(nx, nz);

    // Tread bounce / vibration
    this.robotTreads.position.y = Math.sin(this.clock.getElapsedTime() * 16) * 0.05;

    // Check automatic snow pickup when driving over snow piles
    this.checkSnowPickup();
  }

  /**
   * Check snow pickup when close
   */
  public checkSnowPickup(): boolean {
    let collectedAny = false;
    for (const pile of this.snowPiles) {
      if (!pile.active) continue;
      const dx = pile.x - this.robotX;
      const dz = pile.z - this.robotZ;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 2.0) {
        pile.active = false;
        pile.respawnTimer = 8; // respawn after 8 seconds
        pile.group.visible = false;
        this.spawnSnowSplats(pile.x, 0.4, pile.z, 14, 0xffffff);
        playSnowScoop();
        this.callbacks.onCollectSnow(3);
        collectedAny = true;
      }
    }
    return collectedAny;
  }

  /**
   * Manual scoop button
   */
  public scoopSnowManually(): boolean {
    playRobotBoop();
    return this.checkSnowPickup();
  }

  /**
   * Launch snowball from robot cannon
   */
  public fireSnowball(): boolean {
    playSnowballShoot();

    // Recoil animation on cannon
    this.robotCannonBarrel.position.z = 0.35;

    const spawnOffset = 1.2;
    const sinR = Math.sin(this.robotRotation);
    const cosR = Math.cos(this.robotRotation);

    const startX = this.robotX + sinR * spawnOffset + cosR * 0.9;
    const startY = 1.45;
    const startZ = this.robotZ + cosR * spawnOffset - sinR * 0.9;

    const shootSpeed = 24;

    const createSingleBall = (offX: number, offY: number, offZ: number, spreadAngle: number) => {
      const ballGeo = new THREE.SphereGeometry(0.3, 10, 10);
      const ballMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.2,
        emissive: 0x93c5fd,
        emissiveIntensity: 0.5,
      });
      const mesh = new THREE.Mesh(ballGeo, ballMat);
      mesh.position.set(startX + offX, startY + offY, startZ + offZ);
      this.scene.add(mesh);

      const rot = this.robotRotation + spreadAngle;
      this.projectiles.push({
        mesh,
        vx: Math.sin(rot) * shootSpeed,
        vy: 3.5, // gentle arc
        vz: Math.cos(rot) * shootSpeed,
        life: 2.2,
        isPlayer: true,
        radius: 0.3,
      });
    };

    // Single or Double shot depending on upgrade tier
    createSingleBall(0, 0, 0, 0);
    if (this.cannonTier >= 2) {
      createSingleBall(0, 0.3, 0, 0.12);
      createSingleBall(0, 0.3, 0, -0.12);
    }

    return true;
  }

  /**
   * Spawn particle burst on impact
   */
  private spawnSnowSplats(x: number, y: number, z: number, count = 12, color = 0xffffff) {
    const geo = new THREE.DodecahedronGeometry(0.12);
    const mat = new THREE.MeshBasicMaterial({ color });

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      this.scene.add(mesh);

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 4.0;
      this.particles.push({
        mesh,
        vx: Math.cos(angle) * speed,
        vy: 2.0 + Math.random() * 4.0,
        vz: Math.sin(angle) * speed,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1.0,
      });
    }
  }

  /**
   * Update visual upgrades on robot
   */
  public updateUpgrades(upgrades: {
    maxSnow: number;
    currentSnow: number;
    speedMultiplier: number;
    cannonTier: number;
    hasShield: boolean;
    isGolden: boolean;
  }) {
    this.moveSpeed = 9.0 * upgrades.speedMultiplier;
    this.cannonTier = upgrades.cannonTier;
    this.hasShield = upgrades.hasShield;
    this.isGolden = upgrades.isGolden;

    // Tank snow fullness
    const fillRatio = Math.min(1.0, Math.max(0.2, upgrades.currentSnow / upgrades.maxSnow));
    this.robotTankSnow.scale.set(fillRatio, fillRatio, fillRatio);

    // Visible upgrades
    this.robotScarf.visible = upgrades.hasShield;
    this.robotCrown.visible = upgrades.isGolden;
    this.robotSecondBarrel.visible = upgrades.cannonTier >= 2;

    // Change armor color if golden
    const torsoMat = this.robotTorso.material as THREE.MeshStandardMaterial;
    if (upgrades.isGolden) {
      torsoMat.color.setHex(0xf59e0b);
      torsoMat.metalness = 0.9;
      torsoMat.roughness = 0.2;
    } else {
      torsoMat.color.setHex(0x0284c7);
      torsoMat.metalness = 0.7;
      torsoMat.roughness = 0.25;
    }
  }

  /**
   * Main game loop with software WebGL guard & exponential damping
   */
  private startLoop() {
    const afterDraw = (cb: () => void) => {
      const gl = this.renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (this.isDisposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          this.frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          this.frameId = window.setTimeout(cb, 80);
        }
      };
      this.frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (this.isDisposed) return;
      const delta = Math.min(this.clock.getDelta(), 0.1);
      const time = this.clock.getElapsedTime();

      this.updatePhysics(delta, time);
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      afterDraw(tick);
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  }

  private updatePhysics(delta: number, time: number) {
    // 1. Robot smooth rotation and position update
    this.robotRotation = THREE.MathUtils.damp(
      this.robotRotation,
      this.targetRotation,
      14,
      delta
    );
    this.robotGroup.position.set(this.robotX, 0, this.robotZ);
    this.robotGroup.rotation.y = this.robotRotation;

    // Cannon barrel recoil recovery
    if (this.robotCannonBarrel.position.z < 0.55) {
      this.robotCannonBarrel.position.z = THREE.MathUtils.damp(
        this.robotCannonBarrel.position.z,
        0.55,
        12,
        delta
      );
    }

    // Antenna blinking
    const antMat = this.robotAntennaLight.material as THREE.MeshStandardMaterial;
    antMat.emissiveIntensity = 0.8 + Math.sin(time * 8) * 0.7;

    // Smooth Third-Person Camera follow
    const targetCamX = this.robotX;
    const targetCamY = 13;
    const targetCamZ = this.robotZ + 15;
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamX, 6, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamY, 6, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamZ, 6, delta);
    _vec3A.set(this.robotX, 1.6, this.robotZ);
    this.camera.lookAt(_vec3A);

    // 2. Snow piles animation and respawn timers
    for (const pile of this.snowPiles) {
      if (!pile.active) {
        pile.respawnTimer -= delta;
        if (pile.respawnTimer <= 0) {
          pile.active = true;
          pile.group.visible = true;
          pile.scale = 0.1;
        }
      } else {
        // Growth pop-in
        if (pile.scale < 1.0) {
          pile.scale = Math.min(1.0, pile.scale + delta * 2);
          pile.group.scale.set(pile.scale, pile.scale, pile.scale);
        }
        // Rotate sparkle
        const sparkle = pile.group.children[1];
        if (sparkle) {
          sparkle.rotation.y = time * 2;
          sparkle.position.y = 0.75 + Math.sin(time * 3 + pile.x) * 0.12;
        }
      }
    }

    // 3. Snowmen Enemies AI & silly animations
    for (const enemy of this.enemies) {
      enemy.wobblePhase += delta * 3;

      if (enemy.state === 'idle') {
        // Silly idle wobble
        enemy.group.rotation.z = Math.sin(enemy.wobblePhase) * 0.12;
        enemy.group.rotation.x = Math.cos(enemy.wobblePhase * 0.8) * 0.08;
        enemy.head.rotation.y = Math.sin(enemy.wobblePhase * 1.5) * 0.25;

        // Roam slowly
        enemy.x += enemy.vx * delta;
        enemy.z += enemy.vz * delta;

        // Bounce back if too far
        const dist = Math.sqrt(enemy.x * enemy.x + enemy.z * enemy.z);
        if (dist > 21) {
          enemy.vx = -enemy.vx;
          enemy.vz = -enemy.vz;
        }

        enemy.group.position.set(enemy.x, 0, enemy.z);

        // Friendly snowball toss at player if close
        enemy.throwCooldown -= delta;
        const dxToPlayer = this.robotX - enemy.x;
        const dzToPlayer = this.robotZ - enemy.z;
        const distToPlayer = Math.sqrt(dxToPlayer * dxToPlayer + dzToPlayer * dzToPlayer);

        if (distToPlayer < 14 && enemy.throwCooldown <= 0) {
          enemy.throwCooldown = 5.0 + Math.random() * 3;
          this.enemyThrowSnowball(enemy);
        }
      } else if (enemy.state === 'hit') {
        enemy.stateTimer -= delta;
        // Spin around comically
        enemy.group.rotation.y += delta * 15;
        enemy.group.position.y = Math.sin(enemy.stateTimer * 8) * 0.4;

        if (enemy.stateTimer <= 0) {
          enemy.state = 'idle';
          enemy.group.rotation.y = 0;
          enemy.group.position.y = 0;
        }
      } else if (enemy.state === 'burst') {
        enemy.respawnTimer -= delta;
        if (enemy.respawnTimer <= 0) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 10 + Math.random() * 8;
          enemy.x = Math.cos(angle) * dist;
          enemy.z = Math.sin(angle) * dist;
          enemy.group.position.set(enemy.x, 0, enemy.z);
          enemy.group.rotation.set(0, 0, 0);
          enemy.group.scale.set(1, 1, 1);
          enemy.health = 3;
          enemy.state = 'idle';
          enemy.group.visible = true;
          enemy.hpPips.forEach((pip) => (pip.visible = true));
          this.spawnSnowSplats(enemy.x, 1.0, enemy.z, 12, 0xffffff);
        }
      }
    }

    // 4. Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= delta;

      p.mesh.position.x += p.vx * delta;
      p.mesh.position.y += p.vy * delta;
      p.mesh.position.z += p.vz * delta;
      p.vy -= 9.8 * delta * 0.6; // gravity

      let remove = p.life <= 0 || p.mesh.position.y <= 0.2;

      if (!remove && p.isPlayer) {
        // Check collision against snowmen
        for (const enemy of this.enemies) {
          const dx = enemy.x - p.mesh.position.x;
          const dz = enemy.z - p.mesh.position.z;
          const horizontalDist = Math.sqrt(dx * dx + dz * dz);
          const pY = p.mesh.position.y;
          const baseY = enemy.group.position.y;

          // Détection cylindrique précise couvrant le socle, le ventre et la tête (jusqu'à 4.1m)
          const isHit =
            enemy.state !== 'burst' &&
            horizontalDist <= 1.55 &&
            pY >= baseY - 0.2 &&
            pY <= baseY + 4.1;

          if (isHit) {
            remove = true;
            enemy.health -= 1;

            // Actualisation visuelle instantanée des pépites de vie
            enemy.hpPips.forEach((pip, idx) => {
              pip.visible = idx < enemy.health;
            });

            if (enemy.health <= 0) {
              // 3ème impact garanti : éclatement complet et spectaculaire !
              enemy.state = 'burst';
              enemy.respawnTimer = 6.0;
              enemy.group.visible = false;
              playSplat();
              // Explosion massive : neige blanche + éclats de carotte orange et chapeau violet
              this.spawnSnowSplats(enemy.x, 1.6, enemy.z, 45, 0xffffff);
              this.spawnSnowSplats(enemy.x, 2.6, enemy.z, 18, 0xf97316);
              this.spawnSnowSplats(enemy.x, 3.2, enemy.z, 16, 0xd946ef);
              this.callbacks.onHitEnemy(150, true);
            } else {
              // Impacts 1 et 2 : réaction de vacillement comique (hitbox 100% préservée)
              enemy.state = 'hit';
              enemy.stateTimer = 0.8;
              playSplat();
              this.spawnSnowSplats(p.mesh.position.x, pY, p.mesh.position.z, 18, 0x38bdf8);
              this.callbacks.onHitEnemy(50, this.cannonTier >= 2);
            }
            break;
          }
        }
      } else if (!remove && !p.isPlayer) {
        // Enemy snowball check against player
        const dx = this.robotX - p.mesh.position.x;
        const dz = this.robotZ - p.mesh.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < 1.3) {
          remove = true;
          playSplat();
          this.spawnSnowSplats(this.robotX, 1.5, this.robotZ, 14, 0xffffff);
          if (this.callbacks.onRobotDamaged) {
            this.callbacks.onRobotDamaged(this.hasShield ? 5 : 15);
          }
        }
      }

      if (remove) {
        if (p.mesh.position.y <= 0.3) {
          this.spawnSnowSplats(p.mesh.position.x, 0.2, p.mesh.position.z, 8, 0xffffff);
        }
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.Material).dispose();
        this.projectiles.splice(i, 1);
      }
    }

    // 5. Update Splat Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const part = this.particles[i];
      part.life -= delta;

      part.mesh.position.x += part.vx * delta;
      part.mesh.position.y += part.vy * delta;
      part.mesh.position.z += part.vz * delta;
      part.vy -= 9.8 * delta;

      const progress = part.life / part.maxLife;
      part.mesh.scale.set(progress, progress, progress);

      if (part.life <= 0 || part.mesh.position.y <= 0.05) {
        this.scene.remove(part.mesh);
        part.mesh.geometry.dispose();
        (part.mesh.material as THREE.Material).dispose();
        this.particles.splice(i, 1);
      }
    }

    // 6. Ambient Falling Snowflakes
    if (this.snowParticlesInstanced) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < this.snowParticleMatrices.length; i++) {
        dummy.matrix.copy(this.snowParticleMatrices[i]);
        dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

        dummy.position.y -= delta * 2.2;
        dummy.position.x += Math.sin(time + i) * delta * 0.8;
        if (dummy.position.y < 0) {
          dummy.position.y = 18;
          dummy.position.x = this.robotX + (Math.random() - 0.5) * 40;
          dummy.position.z = this.robotZ + (Math.random() - 0.5) * 40;
        }

        dummy.updateMatrix();
        this.snowParticlesInstanced.setMatrixAt(i, dummy.matrix);
        this.snowParticleMatrices[i].copy(dummy.matrix);
      }
      this.snowParticlesInstanced.instanceMatrix.needsUpdate = true;
    }
  }

  private enemyThrowSnowball(enemy: SnowmanEnemy) {
    const ballGeo = new THREE.SphereGeometry(0.24, 8, 8);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
    const mesh = new THREE.Mesh(ballGeo, ballMat);
    mesh.position.set(enemy.x, 2.4, enemy.z);
    this.scene.add(mesh);

    const dx = this.robotX - enemy.x;
    const dz = this.robotZ - enemy.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const speed = 12;

    this.projectiles.push({
      mesh,
      vx: (dx / dist) * speed,
      vy: 4.2,
      vz: (dz / dist) * speed,
      life: 2.5,
      isPlayer: false,
      radius: 0.24,
    });
  }

  public handleResize() {
    if (!this.container || this.isDisposed) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  public dispose() {
    this.isDisposed = true;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      clearTimeout(this.frameId);
    }
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
