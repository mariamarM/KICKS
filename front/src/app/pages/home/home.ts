import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements AfterViewInit {

  @ViewChild('canvas', { static: true }) canvas!: ElementRef;

  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  shoe!: THREE.Object3D;
  cameraRadius: number = 6;
  cameraAngle: number = 0;
  cameraHeight: number = 8;

  ngAfterViewInit() {
    this.initScene();
    this.loadModel();
    this.animate();
    this.scrollControl();
  }

initScene() {
  this.scene = new THREE.Scene();

  this.camera = new THREE.PerspectiveCamera(
    45,
    (window.innerWidth * 0.5) / (window.innerHeight * 0.33),
    0.1,
    1000
  );

  // 🎥 cámara bien posicionada
  this.camera.position.set(0, 0, 10);
  this.camera.lookAt(0, 0, 0);

  // 🖥️ renderer (más pequeño)
  this.renderer = new THREE.WebGLRenderer({
    canvas: this.canvas.nativeElement,
    antialias: true
  });

  this.renderer.setSize(window.innerWidth * 0.5, window.innerHeight * 0.33);
  this.renderer.setClearColor(0x000000, 1);
  this.renderer.setPixelRatio(window.devicePixelRatio);

  // 🔥 LUZ PRINCIPAL (muy fuerte)
  const keyLight = new THREE.DirectionalLight(0xffffff, 4);
  keyLight.position.set(5, 5, 5);
  this.scene.add(keyLight);

  // 🔥 LUZ CÁLIDA (izquierda)
  const warmLight = new THREE.DirectionalLight(0xffaa88, 3);
  warmLight.position.set(-5, 3, 5);
  this.scene.add(warmLight);

  // ❄️ LUZ FRÍA (derecha)
  const coolLight = new THREE.DirectionalLight(0x88ccff, 3);
  coolLight.position.set(5, -3, 5);
  this.scene.add(coolLight);

  // 💥 LUZ EXTRA (relleno frontal)
  const frontLight = new THREE.PointLight(0xffffff, 5);
  frontLight.position.set(0, 0, 5);
  this.scene.add(frontLight);

  // 🌫️ ambiente
  const ambient = new THREE.AmbientLight(0xffffff, 1);
  this.scene.add(ambient);
}

loadModel() {
  const loader = new GLTFLoader();

  loader.load(
    '/assets/shoe.glb',
    (gltf) => {
      this.shoe = gltf.scene;

      const box = new THREE.Box3().setFromObject(this.shoe);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      this.shoe.position.sub(center);

      const maxDim = Math.max(size.x, size.y, size.z);
const scale = 2 / maxDim;
this.shoe.scale.setScalar(scale);

      this.shoe.traverse((child: any) => {
        if (child.isMesh) {
          child.material.metalness = 0.6;
          child.material.roughness = 0.4;
          child.material.needsUpdate = true;
        }
      });

      this.scene.add(this.shoe);
    },
    undefined,
    (error) => {
      console.error('Error cargando modelo:', error);
    }
  );
}

  animate = () => {
    requestAnimationFrame(this.animate);

    this.updateCameraPosition();

    this.renderer.render(this.scene, this.camera);
  }

  scrollControl() {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      this.cameraAngle = scrollY * 0.005;
    });
  }

  updateCameraPosition() {
    const x = this.cameraRadius * Math.sin(this.cameraAngle);
    const z = this.cameraRadius * Math.cos(this.cameraAngle);
    this.camera.position.set(x, this.cameraHeight, z);
    this.camera.lookAt(0, 0, 0);
  }
}
