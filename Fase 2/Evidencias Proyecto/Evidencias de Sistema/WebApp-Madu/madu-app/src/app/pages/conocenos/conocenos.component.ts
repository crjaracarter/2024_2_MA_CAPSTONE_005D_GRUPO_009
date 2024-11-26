import { Component, OnInit, AfterViewInit, HostListener  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AOS from 'aos';

@Component({
  selector: 'app-conocenos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './conocenos.component.html',
  styleUrl: './conocenos.component.scss'
})

export class ConocenosComponent implements OnInit, AfterViewInit {
  
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private sphere!: THREE.Mesh;
  private particles!: THREE.Points;
  private clock = new THREE.Clock();
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  ngOnInit() {
    AOS.init({
      duration: 1000,
      once: true,
      mirror: false
    });
  }

  public isLoaded = false;

  ngAfterViewInit() {
    this.initThreeJS();
    this.animate();

    // Mostrar la escena Three.js suavemente después de que se inicialice
    setTimeout(() => {
      this.isLoaded = true;
    }, 100);
  }
  
  

  @HostListener('window:resize')
  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  private initThreeJS() {
    // Configuración básica
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    
    const container = document.getElementById('hero-3d');
    if (container) {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(this.renderer.domElement);

      // Crear esfera principal
      const geometry = new THREE.IcosahedronGeometry(50, 2);
      const material = new THREE.MeshPhongMaterial({
        color: '#FFC107',
        wireframe: true,
        wireframeLinewidth: 2,
        emissive: '#f2f08a',
        emissiveIntensity: 0.3,
        transparent: false,
        opacity: 1
      });

      this.sphere = new THREE.Mesh(geometry, material);
      this.scene.add(this.sphere);

      // Crear partículas de fondo
      this.createParticles();

      // Añadir luces
      this.addLights();

      // Posicionar cámara
      this.camera.position.z = 30;

      // Animación inicial
      this.initializeAnimations();
    }
  }

  private createParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 9500;
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.1,
      color: '#FDFDFD',
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    
    this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
    this.scene.add(this.particles);
  }

  private addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight('#5A4FCF', 2);
    pointLight1.position.set(25, 25, 25);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight('#C2AFFF', 2);
    pointLight2.position.set(-25, -25, 25);
    this.scene.add(pointLight2);
  }

  private initializeAnimations() {
    gsap.to(this.sphere.rotation, {
      duration: 20,
      y: Math.PI * 2,
      repeat: -1,
      ease: "none"
    });

    gsap.to(this.sphere.rotation, {
      duration: 25,
      x: Math.PI * 2,
      repeat: -1,
      ease: "none"
    });

    gsap.to(this.sphere.position, {
      duration: 2,
      y: 0.5,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut"
    });
  }

  private animate() {
    requestAnimationFrame(() => this.animate());

    const elapsedTime = this.clock.getElapsedTime();

    // Rotación suave continua de partículas
    if (this.particles) {
      this.particles.rotation.y = elapsedTime * 0.05;
      this.particles.rotation.x = elapsedTime * 0.03;

      // Movimiento ondulatorio de partículas
      const positions = this.particles.geometry.attributes["position"].array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];

        // Crear efecto ondulatorio
        positions[i + 1] = y + Math.sin(elapsedTime + x) * 0.1;
      }
      this.particles.geometry.attributes["position"].needsUpdate = true;
    }

    // Efecto de seguimiento suave del mouse
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.sphere);

    if (intersects.length > 0) {
      gsap.to(this.sphere.rotation, {
        duration: 1,
        x: this.mouse.y * 0.5,
        y: this.mouse.x * 0.5,
        ease: "power2.out"
      });
    }

    this.renderer.render(this.scene, this.camera);
  }

  ngOnDestroy() {
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
