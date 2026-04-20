import { Component, ElementRef, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-home',
  template: `
    <div class="canvas-wrapper">
      <canvas #canvas></canvas>
    </div>
  `,
  styles: [`
    .canvas-wrapper {
      position: fixed;
      top: 0;
      right: 0; /* Cambiado de left a right para que el canvas esté a la derecha */
      width: 33.333%;
      height: 100vh;
      overflow: hidden;
      z-index: 10;
      pointer-events: none;
    }

    canvas {
      width: 100%;
      height: 100%;
      display: block;
      outline: none;
    }

    /* Borde sutil en el lado izquierdo ahora */
    .canvas-wrapper::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0; /* Cambiado de right a left */
      width: 2px;
      height: 100%;
      background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.3), transparent);
      pointer-events: none;
    }

    @media (max-width: 768px) {
      .canvas-wrapper {
        width: 100%;
        height: 50vh;
        right: 0;
        top: auto;
        bottom: 0;
      }
    }
  `]
})
export class Home implements AfterViewInit, OnDestroy {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private model: THREE.Group | THREE.Mesh | null = null;
  private animationId: number | null = null;
  private targetRotation: number = 0;
  private currentRotation: number = 0;
  private leftLights: THREE.Light[] = [];
  private rightLights: THREE.Light[] = [];
  private lights: THREE.Light[] = [];

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.loadModel();
    this.setupLights();
    this.animate();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.disposeResources();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    this.targetRotation = scrollPercent * Math.PI * 2;
  }

  private initThreeJS(): void {
    const canvas = this.elementRef.nativeElement.querySelector('canvas');

    this.scene = new THREE.Scene();
    this.scene.background = null;

    this.camera = new THREE.PerspectiveCamera(
      45,
      (window.innerWidth * 0.3333) / window.innerHeight,
      0.1,
      1000
    );
    // Cámara posicionada para ver el modelo a la derecha
    this.camera.position.set(3, 1.8, 3);
    this.camera.lookAt(1.5, 0, 0); // Mirar hacia la derecha

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth * 0.3333, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 2.0;
  }

  private setupLights(): void {
    // === LUCES BLANCAS A LA IZQUIERDA (ahora relativas al modelo) ===
    const whiteLightConfigs = [
      { intensity: 1.2, position: [0, 2, 1], distance: 8 },
      { intensity: 0.8, position: [0.5, 1.5, 1.5], distance: 8 },
      { intensity: 1.0, position: [0.3, 2.5, 0.5], distance: 8 },
      { intensity: 0.6, position: [-0.2, 1, -0.5], distance: 8 },
      { intensity: 0.9, position: [0.7, 3, 1], distance: 8 }
    ];

    whiteLightConfigs.forEach(config => {
      const light = new THREE.PointLight(0xffffff, config.intensity);
      light.position.set(config.position[0] + 1.5, config.position[1], config.position[2]);
      light.distance = config.distance;
      light.decay = 1.5;
      this.scene.add(light);
      this.lights.push(light);
      this.leftLights.push(light);
    });

    const whiteDirectional = new THREE.DirectionalLight(0xffffff, 1.0);
    whiteDirectional.position.set(0, 2.5, 1);
    whiteDirectional.castShadow = true;
    this.scene.add(whiteDirectional);
    this.lights.push(whiteDirectional);
    this.leftLights.push(whiteDirectional);

    // === LUCES ROJAS A LA DERECHA ===
    const redLightConfigs = [
      { intensity: 1.2, position: [3, 2, 1], distance: 8, color: 0xff0000 },
      { intensity: 0.8, position: [2.5, 1.5, 1.5], distance: 8, color: 0xff2200 },
      { intensity: 1.0, position: [2.7, 2.5, 0.5], distance: 8, color: 0xff1100 },
      { intensity: 0.6, position: [3.2, 1, -0.5], distance: 8, color: 0xcc0000 },
      { intensity: 0.9, position: [2.3, 3, 1], distance: 8, color: 0xff3300 }
    ];

    redLightConfigs.forEach(config => {
      const light = new THREE.PointLight(config.color, config.intensity);
      light.position.set(config.position[0] + 1.5, config.position[1], config.position[2]);
      light.distance = config.distance;
      light.decay = 1.5;
      this.scene.add(light);
      this.lights.push(light);
      this.rightLights.push(light);
    });

    const redDirectional = new THREE.DirectionalLight(0xff0000, 0.9);
    redDirectional.position.set(4, 2.5, 1);
    redDirectional.castShadow = true;
    this.scene.add(redDirectional);
    this.lights.push(redDirectional);
    this.rightLights.push(redDirectional);

    const topFill = new THREE.PointLight(0xffffff, 0.4);
    topFill.position.set(1.5, 3.5, 0);
    this.scene.add(topFill);
    this.lights.push(topFill);

    const bottomFill = new THREE.PointLight(0xff0000, 0.2);
    bottomFill.position.set(1.5, -2, 0);
    this.scene.add(bottomFill);
    this.lights.push(bottomFill);

    const ambientLight = new THREE.AmbientLight(0x111111, 0.15);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);
  }

  private loadModel(): void {
    const loader = new GLTFLoader();
    const modelPath = 'assets/shoe.glb';

    loader.load(
      modelPath,
      (gltf) => {
        this.model = gltf.scene;

        this.model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => this.enhanceMetalMaterial(mat));
              } else {
                this.enhanceMetalMaterial(child.material);
              }
            }
          }
        });

        const box = new THREE.Box3().setFromObject(this.model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.2 / maxDim;
        this.model.scale.set(scale, scale, scale);
        this.model.position.set(
          -center.x * scale + 1.5, // +1.5 para mover a la derecha
          -center.y * scale,
          -center.z * scale
        );

        this.scene.add(this.model);
      },
      (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
      },
      (error) => {
        console.error('Error loading model:', error);
        this.createBackupModel();
      }
    );
  }

  private enhanceMetalMaterial(material: THREE.Material): void {
    if (material instanceof THREE.MeshStandardMaterial) {
      material.metalness = 1.0;
      material.roughness = 0.05;
      material.envMapIntensity = 2.8;
      material.emissiveIntensity = 0.05;
      material.emissive = new THREE.Color(0x442200);
    } else if (material instanceof THREE.MeshPhysicalMaterial) {
      material.metalness = 1.0;
      material.roughness = 0.53;
      material.clearcoat = 2.5;
      material.clearcoatRoughness = 1.05;
      material.envMapIntensity = 2.5;
      material.reflectivity = 1.8;
    }
  }

  private createBackupModel(): void {
    const geometry = new THREE.SphereGeometry(0.8, 256, 256);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      metalness: 1.0,
      roughness: 0.05
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.x = 1.5;
    sphere.castShadow = true;
    this.model = sphere;
    this.scene.add(sphere);
  }

  private animateLights(): void {
    const time = Date.now() * 0.002;

    this.leftLights.forEach((light, index) => {
      if (light instanceof THREE.PointLight) {
        const pulse = 0.6 + Math.sin(time * 1.5 + index) * 0.2;
        light.intensity = (0.8 + pulse) * 0.8;
      } else if (light instanceof THREE.DirectionalLight) {
        light.intensity = 0.8 + Math.sin(time) * 0.2;
      }
    });

    this.rightLights.forEach((light, index) => {
      if (light instanceof THREE.PointLight) {
        const pulse = 0.7 + Math.sin(time * 2 + index) * 0.3;
        light.intensity = (0.9 + pulse) * 0.9;
      } else if (light instanceof THREE.DirectionalLight) {
        light.intensity = 0.7 + Math.sin(time * 1.2) * 0.3;
      }
    });
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    if (this.model) {
      this.currentRotation += (this.targetRotation - this.currentRotation) * 0.1;
      this.model.rotation.y = this.currentRotation;

      const time = Date.now() * 0.002;
      this.model.position.y = Math.sin(time) * 0.05;
    }

    this.animateLights();
    this.renderer.render(this.scene, this.camera);
  }

  private disposeResources(): void {
    this.lights.forEach(light => {
      if (light.parent) light.parent.remove(light);
    });

    if (this.model) {
      this.scene.remove(this.model);
    }

    this.renderer.dispose();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.camera && this.renderer) {
      const width = window.innerWidth * 0.3333;
      const height = window.innerHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }
}
