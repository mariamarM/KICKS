import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { ToastService } from '../../services/toast.service';

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

  @ViewChild('canvasContainer', { static: true }) container!: ElementRef;

  constructor(private router: Router, private toastService: ToastService) { }

  ngAfterViewInit(): void {
    this.initThree();
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  onLogin(): void {
    // Credenciales hardcodeadas para testing
    if (this.email === 'user@test.com' && this.password === '123456') {
      const user = {
        id: 1,
        name: 'Usuario Normal',
        email: this.email,
        role: 'user'
      };
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('access_token', 'dummy-token-' + Date.now());
      this.toastService.show('Inicio de sesión exitoso');
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
      localStorage.setItem('access_token', 'dummy-admin-token-' + Date.now());
      this.toastService.show('Inicio de sesión exitoso');
      this.router.navigate(['/']);
    }
    else {
      this.errorMessage = 'Email o contraseña incorrectos';
    }
  }

  initThree(): void {
    const container = this.container.nativeElement;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      20,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = false;

    scene.add(new THREE.AmbientLight(0x00ff88, 0.9));

    const dirLight = new THREE.DirectionalLight(0x00ff88, 2.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x00ff88, 1.5);
    backLight.position.set(-5, 3, -5);
    scene.add(backLight);

    const pointLight = new THREE.PointLight(0x00ff88, 3);
    pointLight.position.set(0, 2, 2);
    scene.add(pointLight);

    const loader = new GLTFLoader();

    loader.load(
      'assets/shoe.glb',
      (gltf: any) => {
        const model = gltf.scene;

        // 📦 centrar modelo
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();

        box.getSize(size);
        box.getCenter(center);

        model.position.sub(center);

        model.scale.set(1.5, 1.5, 1.5);

        // ✨ material verde metálico
        model.traverse((child: any) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0x00ff88,
              metalness: 0.85,
              roughness: 0.2
            });
          }
        });

        scene.add(model);

        const maxDim = Math.max(size.x, size.y, size.z);

        const fitCamera = () => {
          const width = container.clientWidth;
          const height = container.clientHeight;

          const aspect = width / height;

          const fov = camera.fov * (Math.PI / 180);

          const distanceV = maxDim / (2 * Math.tan(fov / 2));
          const distanceH = (maxDim / aspect) / (2 * Math.tan(fov / 2));

          const distance = Math.max(distanceV, distanceH);

          // 🔥 margen visual (evita cortes)
          const padding = 1.7;

          camera.position.set(0, 0, distance * padding);

          camera.aspect = aspect;
          camera.updateProjectionMatrix();

          controls.target.set(0, 0, 0);
          controls.update();
        };

        fitCamera();

        // animación
        const animate = () => {
          requestAnimationFrame(animate);

          model.rotation.y += 0.005;

          renderer.render(scene, camera);
        };

        animate();

        const resizeObserver = new ResizeObserver(() => {
          renderer.setSize(container.clientWidth, container.clientHeight);
          fitCamera();
        });

        resizeObserver.observe(container);
      },
      undefined,
      (error: any) => {
        console.error('Error cargando modelo:', error);
      }
    );
  }
}
