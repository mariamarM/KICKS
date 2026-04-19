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

  ngAfterViewInit() {
    this.initScene();
    this.loadModel();
    this.animate();
    this.scrollControl();
  }

initScene() {
  this.scene = new THREE.Scene();

  // 🎥 Cámara (lejos y de frente)
  this.camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  this.camera.position.set(0, 0, 10);
  this.camera.lookAt(0, 0, 0);

  // 🖥️ Renderer
  this.renderer = new THREE.WebGLRenderer({
    canvas: this.canvas.nativeElement,
    antialias: true
  });

  this.renderer.setSize(window.innerWidth, window.innerHeight);
  this.renderer.setClearColor(0x000000, 1);
  this.renderer.setPixelRatio(window.devicePixelRatio);

  // 💡 LUZ PRINCIPAL (blanca)
  const keyLight = new THREE.DirectionalLight(0xffffff, 2);
  keyLight.position.set(5, 5, 5);
  this.scene.add(keyLight);

  // 🔥 LUZ CÁLIDA (izquierda)
  const warmLight = new THREE.DirectionalLight(0xffaa88, 2);
  warmLight.position.set(-5, 3, 5);
  this.scene.add(warmLight);

  // ❄️ LUZ FRÍA (derecha)
  const coolLight = new THREE.DirectionalLight(0x88ccff, 2);
  coolLight.position.set(5, -3, 5);
  this.scene.add(coolLight);

  // 🌫️ AMBIENTE (suave)
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  this.scene.add(ambient);
}
loadModel() {
  const loader = new GLTFLoader();

  loader.load(
    '/assets/shoe.glb', // 👈 IMPORTANTE (según tu config)
    (gltf) => {
      this.shoe = gltf.scene;

      // 🔥 CENTRAR MODELO
      const box = new THREE.Box3().setFromObject(this.shoe);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      this.shoe.position.sub(center);

      // 🔥 ESCALA CORRECTA (NO gigante)
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 4 / maxDim;
      this.shoe.scale.setScalar(scale);

      // 🔥 ARREGLAR MATERIALES (MUY IMPORTANTE)
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

    if (this.shoe) {
      this.shoe.rotation.y += 0.005; // giro suave
    }

    this.renderer.render(this.scene, this.camera);
  }

  scrollControl() {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;

      if (this.shoe) {
        this.shoe.rotation.y = scrollY * 0.003;
      }
    });
  }
}
