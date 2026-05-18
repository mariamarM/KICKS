import { Component, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast.service';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register implements AfterViewInit {

  registerForm: FormGroup;
  errorMessage: string = '';

  @ViewChild('canvasContainer', { static: true }) container!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  ngAfterViewInit(): void {
    this.initThree();
  }

  initThree(): void {
    const container = this.container.nativeElement;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
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
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      if (this.registerForm.errors?.['mismatch']) {
        this.errorMessage = 'Las contraseñas no coinciden';
      } else {
        this.errorMessage = 'Por favor, completa todos los campos correctamente';
      }
      return;
    }

    const { name, email, password } = this.registerForm.value;
    const userData = { full_name: name, email, password };

    this.authService.register(userData).subscribe({
      next: () => {
        this.toastService.show('Registro completado con éxito. ¡Bienvenido!');
        this.router.navigate(['/login']);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.error || 'Error en el registro';
        this.cdr.detectChanges();
      }
    });
  }
}

