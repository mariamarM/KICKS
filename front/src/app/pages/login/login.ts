import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements AfterViewInit {

  email: string = '';
  password: string = '';
  errorMessage: string = '';

  // 👇 referencia al contenedor del HTML
  @ViewChild('canvasContainer', { static: true }) container!: ElementRef;

  constructor(private router: Router) { }

  ngAfterViewInit(): void {
    this.initThree();
  }


  initThree(): void {
    const container = this.container.nativeElement;

    // Escena
    const scene = new THREE.Scene();

    // 👇 Evita 0x0 si el contenedor aún no ha calculado tamaño
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // ✅ Cámara corregida (near MUY importante)
    const camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,   // 👈 antes 100 (esto rompía todo)
      1000
    );
    camera.position.z = 5;

    // Render
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Luces
    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    scene.add(light);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Loader
    const loader = new GLTFLoader();
    loader.load('assets/shoe.glb', (gltf: any) => {

      const model = gltf.scene;

      // Material
      model.traverse((child: any) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x1be02b,
            metalness: 0.9,
            roughness: 0.3
          });
        }
      });

      // ✅ Escala más segura
      model.scale.set(1, 1, 1);

      // ✅ Centrar modelo automáticamente
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      scene.add(model);

      // Animación
      const animate = () => {
        requestAnimationFrame(animate);

        model.rotation.y += 0.01;

        renderer.render(scene, camera);
      };

      animate();
    },
      undefined,
      (error: any) => {
        console.error('Error cargando modelo:', error);
      });
  }

  onLogin(): void {
    if (this.email === 'user@test.com' && this.password === '123456') {
      const user = {
        id: 1,
        name: 'Usuario Normal',
        email: this.email,
        role: 'user'
      };
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('access_token', 'dummy-token-' + Math.random()); // 👈 FIX: Added token
      this.router.navigate(['/']);
    }
    else if (this.email === 'admin@test.com' && this.password === 'admin123') {
      const user = {
        id: 2,
        name: 'Administrador',
        email: this.email,
        role: 'admin'
      };
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('access_token', 'dummy-admin-token-' + Math.random()); // 👈 FIX: Added token
      this.router.navigate(['/']);
    }
    else {
      this.errorMessage = 'Email o contraseña incorrectos';
    }
  }
}