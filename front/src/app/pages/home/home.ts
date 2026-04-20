import { Component, ElementRef, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements AfterViewInit, OnDestroy {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private model: THREE.Group | THREE.Mesh | null = null;
  private animationId: number | null = null;
  private targetRotation: number = 0;
  private currentRotation: number = 0;
  private lights: THREE.Light[] = [];

  // Valores para efectos parallax
  titleOffset: number = 0;
  subtitleOpacity: number = 1;
  infoOffset: number = 0;
  footerOpacity: number = 1;
  scrollProgress: number = 0;

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

    // Solo el modelo rota (efecto parallax)
    this.targetRotation = scrollPercent * Math.PI * 2;

    // Efectos parallax para el texto
    this.titleOffset = window.scrollY * 0.3;
    this.subtitleOpacity = Math.max(0, 1 - scrollPercent * 0.8);
    this.infoOffset = -window.scrollY * 0.2;
    this.footerOpacity = Math.max(0, 1 - scrollPercent);
    this.scrollProgress = scrollPercent * 100;
  }

  private initThreeJS(): void {
    const canvas = this.elementRef.nativeElement.querySelector('canvas');

    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparente para ver fondo negro

    this.camera = new THREE.PerspectiveCamera(
      45,
      (window.innerWidth * 0.5) / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(3, 1.8, 3.5);
    this.camera.lookAt(1.5, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true, // Transparente
      antialias: true
    });
    this.renderer.setSize(window.innerWidth * 0.5, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 2.0;
  }

  private setupLights(): void {
    // Luces blancas izquierda
    const whiteLightPositions = [
      { intensity: 1.2, pos: [0, 2, 1] },
      { intensity: 0.8, pos: [0.5, 1.5, 1.5] },
      { intensity: 1.0, pos: [0.3, 2.5, 0.5] }
    ];

    whiteLightPositions.forEach(config => {
      const light = new THREE.PointLight(0xffffff, config.intensity);
      light.position.set(config.pos[0] + 1.5, config.pos[1], config.pos[2]);
      light.distance = 8;
      this.scene.add(light);
      this.lights.push(light);
    });

    // Luces rojas derecha
    const redLightPositions = [
      { intensity: 1.2, pos: [3, 2, 1], color: 0xff0000 },
      { intensity: 0.8, pos: [2.5, 1.5, 1.5], color: 0xff2200 },
      { intensity: 1.0, pos: [2.7, 2.5, 0.5], color: 0xff1100 }
    ];

    redLightPositions.forEach(config => {
      const light = new THREE.PointLight(config.color, config.intensity);
      light.position.set(config.pos[0] + 1.5, config.pos[1], config.pos[2]);
      light.distance = 8;
      this.scene.add(light);
      this.lights.push(light);
    });

    // Luz direccional principal
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(2, 3, 2);
    mainLight.castShadow = true;
    this.scene.add(mainLight);
    this.lights.push(mainLight);

    // Luz ambiental baja
    const ambientLight = new THREE.AmbientLight(0x111111, 0.2);
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
          -center.x * scale + 1.5,
          -center.y * scale,
          -center.z * scale
        );

        this.scene.add(this.model);
      },
      (progress) => {
        console.log('Loading:', Math.round(progress.loaded / progress.total * 100) + '%');
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
      material.envMapIntensity = 2.0;
      material.emissiveIntensity = 0.1;
    } else if (material instanceof THREE.MeshPhysicalMaterial) {
      material.metalness = 1.0;
      material.roughness = 0.03;
      material.clearcoat = 1.0;
      material.clearcoatRoughness = 0.05;
      material.envMapIntensity = 2.5;
    }
  }

  private createBackupModel(): void {
    const geometry = new THREE.SphereGeometry(0.8, 64, 64);
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

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    if (this.model) {
      // Solo rotación suave con scroll
      this.currentRotation += (this.targetRotation - this.currentRotation) * 0.1;
      this.model.rotation.y = this.currentRotation;
    }

    this.renderer.render(this.scene, this.camera);
  }

  private disposeResources(): void {
    this.lights.forEach(light => {
      if (light.parent) {
        light.parent.remove(light);
      }
      if (light instanceof THREE.PointLight || light instanceof THREE.DirectionalLight) {
        // Limpieza adicional si es necesario
      }
    });

    if (this.model) {
      if ('traverse' in this.model) {
        (this.model as THREE.Group).traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach(m => m.dispose());
              } else {
                object.material.dispose();
              }
            }
          }
        });
      }
      this.scene.remove(this.model);
    }

    this.renderer.dispose();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.camera && this.renderer) {
      const width = window.innerWidth * 0.5;
      const height = window.innerHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }
}
