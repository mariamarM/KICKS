import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast.service';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

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
  confirmPassword: string = '';
  errorMessage: string = '';

  @ViewChild('canvasContainer', { static: true }) container!: ElementRef;

  constructor(private router: Router, private authService: AuthService, private toastService: ToastService) { }

  ngAfterViewInit(): void {
    this.initThree();
  }

  initThree(): void {
    const container = this.container.nativeElement;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 100, 1000);
    camera.position.z = 212;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    scene.add(light);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const loader = new GLTFLoader();
    loader.load('../../assets/shoe.glb', (gltf: any) => {
      const model = gltf.scene;
      model.traverse((child: any) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x1be02b, // Color neón para variar un poco
            metalness: 0.9,
            roughness: 0.3
          });
        }
      });
      model.scale.set(1.5, 1.5, 1.5);
      scene.add(model);

      const animate = () => {
        requestAnimationFrame(animate);
        model.rotation.y += 0.01;
        renderer.render(scene, camera);
      };
      animate();
    });
  }

  onRegister(): void {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    const userData = {
      email: this.email,
      password: this.password,
      full_name: this.name
    };

    this.authService.register(userData).subscribe({
      next: (res) => {
        this.toastService.show('Registro completado con éxito. ¡Bienvenido!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Error en el registro';
      }
    });
  }
}
