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

    // Cámara
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    // Render
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Luz (MUY importante para modelos GLB)
    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    scene.add(light);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Cargar modelo
    const loader = new GLTFLoader();

    loader.load('../../assets/shoe.glb', (gltf: any) => {
      const model = gltf.scene;
      model.traverse((child: any) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,      // base gris (metal)
            metalness: 0.9,       // muy metálico
            roughness: 0.3        // algo de brillo (no espejo total)
          });
        }
      });


      model.scale.set(1.5, 1.5, 1.5); // ajusta si hace falta
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