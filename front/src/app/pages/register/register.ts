import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register implements AfterViewInit {

  name: string = '';
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  @ViewChild('canvasContainer', { static: true }) container!: ElementRef;

  constructor(private router: Router, private authService: AuthService) { }

  ngAfterViewInit(): void {
    this.initThree();
  }

  initThree(): void {
    const container = this.container.nativeElement;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    scene.add(light);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const loader = new GLTFLoader();

    loader.load('assets/shoe.glb', (gltf: any) => {
      const model = gltf.scene;
      model.position.y = -0.5;
      model.scale.set(1.8, 1.8, 1.8);
      scene.add(model);

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

  onRegister(): void {
    const userData = {
      full_name: this.name,
      email: this.email,
      password: this.password
    };

    this.authService.register(userData).subscribe({
      next: () => {
        // Redirigir a login después de registro exitoso o loguear directamente
        // En este caso redirigimos a login
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = 'Error al registrar el usuario. Inténtalo de nuevo.';
        console.error(err);
      }
    });
  }
}
