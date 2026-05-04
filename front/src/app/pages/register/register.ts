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

    const camera = new THREE.PerspectiveCamera(
      20, // FOV similar al del login para evitar distorsión
      container.clientWidth / container.clientHeight || 1,
      0.1,
      1000
    );
    // Se colocará dinámicamente con fitCamera()

    // Luces similares al login para que se vea bien
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

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const loader = new GLTFLoader();
    loader.load('assets/shoe.glb', (gltf: any) => {
      const model = gltf.scene;

      // Centrar el modelo para que la cámara en (0,0,0) esté justo en el centro del volumen
      const box = new THREE.Box3().setFromObject(model);
      const center = new THREE.Vector3();
      box.getCenter(center);
      model.position.sub(center);

      // Escala como en login (ya no necesitamos zoom enorme manual)
      model.scale.set(1.5, 1.5, 1.5);

      // Aplicar el mismo material de Login pero por ambas caras (DoubleSide)
      model.traverse((child: any) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            metalness: 0.85,
            roughness: 0.2,
            side: THREE.DoubleSide
          });
        }
      });

      scene.add(model);

      const size = new THREE.Vector3();
      box.getSize(size);
      // Aplicar la escala manual al tamaño calculado para la cámara
      const maxDim = Math.max(size.x, size.y, size.z) * 1.5; 

      const fitCamera = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;

        if (width === 0 || height === 0) return;

        const aspect = width / height;
        const fov = camera.fov * (Math.PI / 180);

        const distanceV = maxDim / (2 * Math.tan(fov / 2));
        const distanceH = (maxDim / aspect) / (2 * Math.tan(fov / 2));

        const distance = Math.max(distanceV, distanceH);

        // Padding para que no choque con los bordes
        const padding = 1.7;

        camera.position.set(0, 0, distance * padding);
        camera.lookAt(0, 0, 0);

        camera.aspect = aspect;
        camera.updateProjectionMatrix();
      };

      fitCamera();

      const animate = () => {
        requestAnimationFrame(animate);
        model.rotation.y += 0.005; // Rotación más suave
        renderer.render(scene, camera);
      };

      animate();

      const resizeObserver = new ResizeObserver(() => {
        if (container.clientWidth > 0 && container.clientHeight > 0) {
          renderer.setSize(container.clientWidth, container.clientHeight);
          fitCamera();
        }
      });
      resizeObserver.observe(container);
    },
      undefined,
      (error: any) => {
        console.error('Error cargando modelo:', error);
      });
  }

  onRegister(): void {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    const userData = {
      full_name: this.name,
      email: this.email,
      password: this.password
    };

    this.authService.register(userData).subscribe({
      next: () => {
        this.toastService.show('Registro completado con éxito. ¡Bienvenido!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Error al registrar el usuario. Inténtalo de nuevo.';
        console.error(err);
      }
    });

  }
}
